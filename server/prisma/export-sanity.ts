import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { prisma } from '../lib/prisma.js';
import { headlineToBlocks, inlineHtmlToBlocks, markdownToBlocks, toIsoDate } from './sanity/portableText.js';

// One-off: writes the database's content as an NDJSON file for `sanity datasets import`
// (docs/sanity-migration-plan.md, step 3), in the shape docs/sanity-schema-map.md describes:
// one document per page and per setting, short lists as arrays inside their page. Photos under
// client/public are uploaded by the import itself. Unpublished posts become drafts. Appointments
// and the admin account are not content and stay out. Document ids and array keys are fixed,
// so importing again with --replace overwrites rather than duplicates.

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(here, '../../client/public');
const OUT_FILE = path.resolve(here, '../../studio/migration/content.ndjson');

// The alt text the site shows today for the page photos, which the database never stored.
const HERO_ALT = 'A quiet consulting room with linen curtains, a small wooden table, a chair and plants';
const PORTRAIT_ALT = 'Tania Subhashita, psychologist';

// What the Book page shows while booking settings were never saved: the fallbacks in
// client/site/book/booking.ts (not imported: it pulls in client .tsx types the server can't check).
const BOOKING_FALLBACK = {
  whatsappNumber: '8801580700700',
  timeSlots: '10:00 am\n11:00 am\n2:00 pm\n4:00 pm\n6:00 pm\n7:00 pm',
  sessionDurations: '20-min intro (Free)\n60-min session (Standard)',
  introText: '',
};

// Must match studio/schemaTypes/services.ts.
const CATEGORIES = new Set(['Mood & Emotion', 'Self & Relationships', 'Addiction & Behavior', 'Specialized Care']);

type Doc = { _id: string; _type: string; [field: string]: unknown };

const warnings: string[] = [];
const warnFor = (where: string) => (message: string) => warnings.push(`${where}: ${message}`);

// Empty strings are the database's "not set"; in Sanity a field is simply absent.
const opt = (value: string | null | undefined) => (value && value.trim() ? value : undefined);
const lines = (value: string) => value.split('\n').map((l) => l.trim()).filter(Boolean);

// The rank @sanity/orderable-document-list sorts by (a LexoRank string), spaced so items can be
// dragged between neighbours without re-ranking the list.
const RANK_BASE = parseInt('100000', 36);
const RANK_STEP = 36 ** 3;
const orderRank = (index: number) => `0|${(RANK_BASE + (index + 1) * RANK_STEP).toString(36)}:`;

function imageAsset(url: string) {
  if (/^https?:\/\//.test(url)) return `image@${url}`;
  const file = path.join(PUBLIC_DIR, decodeURI(url.replace(/^\//, '')));
  if (!fs.existsSync(file)) throw new Error(`Photo ${url} not found at ${file}`);
  return `image@${pathToFileURL(file).href}`;
}

function image(url: string, alt: string, type = 'image') {
  return url.trim() ? { _type: type, _sanityAsset: imageAsset(url), alt } : undefined;
}

async function settings(): Promise<Doc[]> {
  const [site, contact, booking] = await Promise.all([
    prisma.siteSettings.findUniqueOrThrow({ where: { id: 'default' } }),
    prisma.contactInfo.findUniqueOrThrow({ where: { id: 'default' } }),
    // Never seeded, so it may be missing.
    prisma.bookingSettings.findFirst(),
  ]);
  const options = booking ?? BOOKING_FALLBACK;
  return [
    {
      _id: 'generalSettings', _type: 'generalSettings', siteName: site.siteName,
      announcement: inlineHtmlToBlocks([site.announcementText], warnFor('generalSettings.announcement')),
      isAnnouncementVisible: site.announcementActive,
      facebookUrl: opt(site.facebookUrl), instagramUrl: opt(site.instagramUrl), linkedinUrl: opt(site.linkedinUrl),
    },
    {
      _id: 'contactSettings', _type: 'contactSettings', practiceName: contact.clinicName, city: opt(contact.city),
      address: contact.address, phone: opt(contact.phone), email: opt(contact.email), openingHours: opt(contact.officeHours),
    },
    {
      _id: 'bookingSettings', _type: 'bookingSettings', whatsappNumber: options.whatsappNumber, intro: opt(options.introText),
      times: lines(options.timeSlots), sessionOptions: lines(options.sessionDurations),
    },
  ];
}

async function homePage(): Promise<Doc> {
  const [hero, welcome, quote, cta, steps, stats, gallery, testimonials] = await Promise.all([
    prisma.heroSection.findUniqueOrThrow({ where: { id: 'default' } }),
    prisma.welcomeSection.findUniqueOrThrow({ where: { id: 'default' } }),
    prisma.methodologyQuote.findUniqueOrThrow({ where: { id: 'default' } }),
    prisma.cTASection.findUniqueOrThrow({ where: { id: 'default' } }),
    prisma.methodologyStep.findMany({ orderBy: { order: 'asc' } }),
    prisma.statistic.findMany({ orderBy: { order: 'asc' } }),
    prisma.galleryImage.findMany({ orderBy: { order: 'asc' } }),
    prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
  ]);
  return {
    _id: 'homePage', _type: 'homePage',
    heroHeadline: headlineToBlocks(hero.titleLine1, hero.titleLine2, hero.titleLine3),
    heroIntro: opt(hero.description), heroPrimaryButton: opt(hero.ctaPrimaryText), heroSecondaryLink: opt(hero.ctaSecondaryText),
    heroImage: image(hero.portraitImageUrl, HERO_ALT),
    welcomeEyebrow: opt(welcome.scriptTitle), welcomeHeadline: opt(welcome.heading),
    welcomeBody: inlineHtmlToBlocks([welcome.paragraph1, welcome.paragraph2], warnFor('homePage.welcomeBody')),
    welcomeSignatureName: opt(welcome.credentialName),
    welcomeSignatureDetail: inlineHtmlToBlocks([welcome.credentialTitle], warnFor('homePage.welcomeSignatureDetail')),
    welcomeImage: image(welcome.portraitImageUrl, PORTRAIT_ALT),
    approachHeadline: opt(quote.scriptTitle), approachQuote: quote.quote, approachQuoteAttribution: opt(quote.attribution),
    // The step number ("01") is not kept: the site derives it from the position.
    approachSteps: steps.map((s) => ({ _key: s.id, _type: 'processStep', title: s.title, description: opt(s.description) })),
    stats: stats.map((s) => ({ _key: s.id, _type: 'stat', figure: s.value, label: s.label })),
    galleryPhotos: gallery.map((g) => ({ _key: g.id, ...image(g.url, g.altText, 'galleryPhoto'), isVisible: g.isActive })),
    // The name is dropped on purpose: the site shows client words without names.
    testimonials: testimonials.map((t) => ({ _key: t.id, _type: 'testimonial', quote: t.text, theme: opt(t.role), isVisible: t.isActive })),
    ctaHeadline: opt(cta.heading), ctaText: opt(cta.subtitle), ctaButton: opt(cta.buttonText),
  };
}

async function aboutPage(): Promise<Doc> {
  const [about, credentials] = await Promise.all([
    prisma.aboutSection.findUniqueOrThrow({ where: { id: 'default' } }),
    prisma.credential.findMany({ orderBy: { order: 'asc' } }),
  ]);
  return {
    _id: 'aboutPage', _type: 'aboutPage', eyebrow: opt(about.tagline), headline: opt(about.heading),
    image: image(about.portraitImageUrl, PORTRAIT_ALT), practice: opt(about.location), experience: opt(about.experience),
    body: inlineHtmlToBlocks([about.bio1, about.bio2], warnFor('aboutPage.body')), pullQuote: opt(about.quote),
    credentials: credentials.map((c) => ({ _key: c.id, _type: 'credential', title: c.title, description: opt(c.description) })),
  };
}

async function selfAssessment(): Promise<Doc> {
  const [questions, bands] = await Promise.all([
    prisma.assessmentQuestion.findMany({ orderBy: { order: 'asc' } }),
    prisma.assessmentScoreBand.findMany({ orderBy: { minScore: 'asc' } }),
  ]);
  return {
    _id: 'selfAssessment', _type: 'selfAssessment',
    statements: questions.map((q) => ({ _key: q.id, _type: 'statement', text: q.text, isVisible: q.isActive })),
    results: bands.map((b) => ({ _key: b.id, _type: 'result', fromScore: b.minScore, toScore: b.maxScore, headline: b.label, message: b.message })),
  };
}

async function collections(): Promise<Doc[]> {
  const [services, programs, faqs, posts] = await Promise.all([
    prisma.service.findMany({ orderBy: { order: 'asc' } }),
    prisma.program.findMany({ orderBy: { order: 'asc' } }),
    prisma.fAQ.findMany({ orderBy: { order: 'asc' } }),
    prisma.blogPost.findMany({ orderBy: { order: 'asc' } }),
  ]);
  for (const s of services) if (!CATEGORIES.has(s.category)) warnings.push(`service ${s.slug}: category "${s.category}" is not one of the Studio's options`);
  return [
    ...services.map((s, i) => ({
      _id: `service-${s.slug}`, _type: 'service', name: s.name, slug: { _type: 'slug', current: s.slug }, category: s.category,
      summary: s.description, workPoints: lines(s.treatmentPoints), closingNote: opt(s.clinicNote), isVisible: s.isActive, orderRank: orderRank(i),
    })),
    ...programs.map((p, i) => ({
      _id: `program-${p.slug}`, _type: 'program', title: p.title, slug: { _type: 'slug', current: p.slug }, subtitle: opt(p.subtitle),
      duration: opt(p.duration), summary: opt(p.description), suitedTo: opt(p.suitability), curriculum: p.details,
      isVisible: p.isActive, orderRank: orderRank(i),
    })),
    ...faqs.map((f, i) => ({ _id: `faq-${f.id}`, _type: 'faq', question: f.question, answer: f.answer, isVisible: f.isActive, orderRank: orderRank(i) })),
    ...posts.map((p) => ({
      _id: `${p.published ? '' : 'drafts.'}post-${p.slug}`, _type: 'post',
      title: p.title, slug: { _type: 'slug', current: p.slug }, date: toIsoDate(p.date), category: opt(p.category),
      summary: p.summary, body: markdownToBlocks(p.content, warnFor(`post ${p.slug}`)), readTime: opt(p.readTime),
    })),
  ];
}

async function main() {
  const docs = [...(await settings()), await homePage(), await aboutPage(), await selfAssessment(), ...(await collections())];
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');

  const counts = new Map<string, number>();
  for (const d of docs) {
    const label = d._id.startsWith('drafts.') ? `${d._type} (draft)` : d._type;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  console.log(`Wrote ${docs.length} documents to ${OUT_FILE}`);
  for (const [type, n] of counts) console.log(`  ${type.padEnd(22)} ${n}`);
  if (warnings.length) console.log(`\n${warnings.length} warning(s):\n  ${warnings.join('\n  ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
