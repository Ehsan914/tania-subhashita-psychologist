// Adds the drafted content in content.ts to an existing database without touching anything
// already there: journal drafts are created (unpublished) only if their slug is new, and a
// service's treatment points or clinic note are filled only where the field is still empty,
// and the welcome paragraph loses the inaccurate "licensed" claim if it still has it.
// Run with: npm run db:content
import { prisma } from '../lib/prisma.js';
import { JOURNAL_DRAFTS, SERVICE_DETAILS } from './content.js';

async function addJournalDrafts() {
  const existing = new Set((await prisma.blogPost.findMany({ select: { slug: true } })).map((p) => p.slug));
  const last = await prisma.blogPost.aggregate({ _max: { order: true } });
  let order = (last._max.order ?? -1) + 1;
  for (const draft of JOURNAL_DRAFTS) {
    if (existing.has(draft.slug)) {
      console.log(`·  Journal: "${draft.slug}" already exists, left as it is`);
      continue;
    }
    await prisma.blogPost.create({ data: { ...draft, published: false, order: order++ } });
    console.log(`✅ Journal: "${draft.slug}" added as an unpublished draft`);
  }
}

async function fillServiceDetails() {
  for (const [slug, details] of Object.entries(SERVICE_DETAILS)) {
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service) {
      console.log(`·  Service: "${slug}" not found, skipped`);
      continue;
    }
    const data = {
      ...(!service.treatmentPoints.trim() && { treatmentPoints: details.treatmentPoints }),
      ...(!service.clinicNote.trim() && details.clinicNote && { clinicNote: details.clinicNote }),
    };
    if (Object.keys(data).length === 0) {
      console.log(`·  Service: "${slug}" already has its details, left as it is`);
      continue;
    }
    await prisma.service.update({ where: { slug }, data });
    console.log(`✅ Service: "${slug}" filled (${Object.keys(data).join(', ')})`);
  }
}

// Bangladesh has no licence for psychologists, so the site must not claim one. Corrects the
// welcome paragraph seeded before this was fixed; any other admin edit to it is left alone.
const LICENSED = 'a licensed mental health professional based in Dhaka';
const ACCURATE = 'a psychologist based in Dhaka';

async function removeLicensedClaim() {
  const welcome = await prisma.welcomeSection.findFirst();
  if (!welcome?.paragraph2.includes(LICENSED)) {
    console.log('·  Welcome: no "licensed" claim found, left as it is');
    return;
  }
  await prisma.welcomeSection.update({
    where: { id: welcome.id },
    data: { paragraph2: welcome.paragraph2.replace(LICENSED, ACCURATE) },
  });
  console.log('✅ Welcome: "licensed mental health professional" replaced with "psychologist"');
}

addJournalDrafts()
  .then(fillServiceDetails)
  .then(removeLicensedClaim)
  .catch((e) => {
    console.error('❌ Content error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
