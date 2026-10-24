import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Proves the schema redesign lost no words or photos (docs/sanity-schema-map.md):
//   npx tsx prisma/sanity/check-equivalence.ts <old.ndjson> <new.ndjson | dataset query .json>
// Every text in the old export must appear somewhere in the new content, except the fields the
// map drops on purpose; every old photo must be in the new content, compared by file hash, which
// is also the id Sanity gives an uploaded image (image-<sha1>-WxH-ext).

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

// Old type.field paths the site doesn't render; their texts may be missing.
const DROPPED = new Set([
  'siteSettings.siteTagline', 'hero.tagline', 'hero.portraitQuote', 'hero.portraitAttribution', 'cta.scriptTitle',
  'scoreBand.emoji', 'statistic.detail', 'contact.mapEmbedUrl', 'testimonial.gender', 'methodologyStep.stepNumber',
]);
// Portable Text structure, not content.
const STRUCTURAL = new Set(['style', 'listItem', 'marks']);

const read = (file: string): Json[] => {
  const text = fs.readFileSync(file, 'utf8').trim();
  return text.startsWith('[') ? (JSON.parse(text) as Json[]) : text.split('\n').map((line) => JSON.parse(line) as Json);
};

const sha1OfAsset = (value: string) => {
  const file = fileURLToPath(value.replace(/^image@/, ''));
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
};

// Every string with the path of the field that holds it (type.field.subfield, no array indices).
function walk(node: Json, path: string, texts: { path: string; text: string }[], photos: Set<string>) {
  if (Array.isArray(node)) return node.forEach((item) => walk(item, path, texts, photos));
  if (node === null || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === '_sanityAsset' && typeof value === 'string') photos.add(sha1OfAsset(value));
    else if (key === '_ref' && typeof value === 'string' && value.startsWith('image-')) photos.add(value.split('-')[1]);
    else if (key.startsWith('_') || STRUCTURAL.has(key)) continue;
    else if (typeof value === 'string' && value.trim()) texts.push({ path: `${path}.${key}`, text: value.trim() });
    else walk(value, `${path}.${key}`, texts, photos);
  }
}

function collect(docs: Json[]) {
  const texts: { path: string; text: string }[] = [];
  const photos = new Set<string>();
  for (const doc of docs) {
    if (doc && typeof doc === 'object' && !Array.isArray(doc)) walk(doc, String(doc._type), texts, photos);
  }
  return { texts, photos };
}

const [oldFile, newFile] = process.argv.slice(2);
if (!oldFile || !newFile) throw new Error('Usage: check-equivalence.ts <old.ndjson> <new.ndjson|.json>');

const before = collect(read(oldFile));
const after = collect(read(newFile));
// Exact matches only: Portable Text spans are carried over whole, so a substring match would
// only hide losses (a step's "01" would "match" inside the phone number).
const corpus = new Set(after.texts.map((t) => t.text));

const missing = before.texts.filter((t) => !corpus.has(t.text));
const dropped = missing.filter((t) => DROPPED.has(t.path));
const lost = missing.filter((t) => !DROPPED.has(t.path));
const lostPhotos = [...before.photos].filter((p) => !after.photos.has(p));

console.log(`Texts:  ${before.texts.length} in the old content, ${before.texts.length - missing.length} found in the new`);
console.log(`Photos: ${before.photos.size} distinct in the old content, ${before.photos.size - lostPhotos.length} found in the new`);
console.log(`\nDropped by design (${dropped.length}):`);
for (const t of dropped) console.log(`  ${t.path}: ${JSON.stringify(t.text)}`);
console.log(`\nMissing (${lost.length}):`);
for (const t of lost) console.log(`  ${t.path}: ${JSON.stringify(t.text)}`);
for (const p of lostPhotos) console.log(`  photo sha1 ${p}`);
if (lost.length || lostPhotos.length) process.exitCode = 1;
