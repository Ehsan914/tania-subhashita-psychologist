import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';

const router = Router();

// ─── Site Settings ─────────────────────────────────────────────────────────────
router.get('/site-settings', async (_req, res) => {
  const settings = await prisma.siteSettings.findFirst();
  res.json(settings);
});

// ─── Hero Section ──────────────────────────────────────────────────────────────
router.get('/hero', async (_req, res) => {
  const hero = await prisma.heroSection.findFirst();
  res.json(hero);
});

// ─── Statistics ────────────────────────────────────────────────────────────────
router.get('/statistics', async (_req, res) => {
  const stats = await prisma.statistic.findMany({ orderBy: { order: 'asc' } });
  res.json(stats);
});

// ─── Welcome Section ───────────────────────────────────────────────────────────
router.get('/welcome', async (_req, res) => {
  const welcome = await prisma.welcomeSection.findFirst();
  res.json(welcome);
});

// ─── Methodology Quote ─────────────────────────────────────────────────────────
router.get('/methodology-quote', async (_req, res) => {
  const quote = await prisma.methodologyQuote.findFirst();
  res.json(quote);
});

// ─── CTA Section ───────────────────────────────────────────────────────────────
router.get('/cta', async (_req, res) => {
  const cta = await prisma.cTASection.findFirst();
  res.json(cta);
});

// ─── Services ──────────────────────────────────────────────────────────────────
router.get('/services', async (_req, res) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(services);
});

router.get('/services/:slug', async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { slug: req.params.slug },
  });
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(service);
});

// ─── Programs ──────────────────────────────────────────────────────────────────
router.get('/programs', async (_req, res) => {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(programs);
});

// ─── Blog Posts ────────────────────────────────────────────────────────────────
router.get('/blog-posts', async (_req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });
  res.json(posts);
});

router.get('/blog-posts/:slug', async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
  });
  if (!post) {
    res.status(404).json({ error: 'Blog post not found' });
    return;
  }
  res.json(post);
});

// ─── Testimonials ──────────────────────────────────────────────────────────────
router.get('/testimonials', async (_req, res) => {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(testimonials);
});

// ─── FAQs ──────────────────────────────────────────────────────────────────────
router.get('/faqs', async (_req, res) => {
  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(faqs);
});

// ─── Gallery ───────────────────────────────────────────────────────────────────
router.get('/gallery', async (_req, res) => {
  const images = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(images);
});

// ─── Contact Info ──────────────────────────────────────────────────────────────
router.get('/contact', async (_req, res) => {
  const contact = await prisma.contactInfo.findFirst();
  res.json(contact);
});

// ─── About Section ─────────────────────────────────────────────────────────────
router.get('/about', async (_req, res) => {
  const about = await prisma.aboutSection.findFirst();
  if (!about) {
    res.json(null);
    return;
  }
  res.json({
    tagline: about.tagline,
    heading: about.heading,
    paragraph1: about.bio1,
    paragraph2: about.bio2,
    highlightQuote: about.quote,
    profileLocation: about.location,
    profileExperience: about.experience,
    portraitImageUrl: about.portraitImageUrl,
  });
});

// ─── Credentials ───────────────────────────────────────────────────────────────
router.get('/credentials', async (_req, res) => {
  const credentials = await prisma.credential.findMany({ orderBy: { order: 'asc' } });
  res.json(credentials);
});

// ─── Methodology Steps ─────────────────────────────────────────────────────────
router.get('/methodology-steps', async (_req, res) => {
  const steps = await prisma.methodologyStep.findMany({ orderBy: { order: 'asc' } });
  res.json(steps);
});

// ─── Assessment Questions ──────────────────────────────────────────────────────
router.get('/assessment-questions', async (_req, res) => {
  const questions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(questions);
});

// ─── Assessment Score Bands ────────────────────────────────────────────────────
router.get('/assessment-score-bands', async (_req, res) => {
  const bands = await prisma.assessmentScoreBand.findMany({ orderBy: { minScore: 'asc' } });
  res.json(bands);
});

// ─── Booking Settings (public read) ───────────────────────────────────────────
router.get('/booking-settings', async (_req, res) => {
  const settings = await prisma.bookingSettings.findFirst();
  res.json(settings);
});

// ─── Appointments (public submit) ─────────────────────────────────────────────
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  // Count only bookings that went through, so people sharing one IP (mobile
  // carriers, an office) aren't locked out by each other's typos.
  skipFailedRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many booking requests. Please try again later.' },
});

const BOOKING_FIELD_MAX_LENGTH = {
  clientName: 200,
  clientPhone: 30,
  clientEmail: 254,
  service: 100,
  sessionType: 100,
  format: 30,
  preferredDate: 10,
  preferredTime: 50,
  message: 5000,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function bookingInputError(body: Record<string, unknown>): string | null {
  for (const [field, max] of Object.entries(BOOKING_FIELD_MAX_LENGTH)) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'string') return `${field} must be text.`;
    if (value.length > max) return `${field} is too long.`;
  }
  const { clientName, clientPhone, preferredDate, preferredTime } = body as Record<string, string | undefined>;
  if (!clientName?.trim() || !clientPhone?.trim() || !preferredDate || !preferredTime) {
    return 'Name, phone, date, and time are required.';
  }
  const date = new Date(`${preferredDate}T00:00:00Z`);
  // The round trip rejects calendar-invalid dates such as 2026-02-31.
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== preferredDate) {
    return 'Date must be a real date in YYYY-MM-DD format.';
  }
  // One day of slack so a client in a timezone behind UTC can still book "today".
  const todayUtc = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime();
  if (date.getTime() < todayUtc - DAY_MS) return 'Date cannot be in the past.';
  return null;
}

router.post('/book', bookingLimiter, async (req, res) => {
  const body = req.body;
  const inputError = bookingInputError(body);
  if (inputError) {
    res.status(400).json({ error: inputError });
    return;
  }
  const { clientName, clientPhone, clientEmail, service, sessionType, format, preferredDate, preferredTime, message } = body;
  const appointment = await prisma.appointment.create({
    data: {
      clientName,
      clientPhone,
      clientEmail: clientEmail || '',
      service: service || '',
      sessionType: sessionType || 'free',
      format: format || 'online',
      preferredDate,
      preferredTime,
      message: message || '',
    },
  });
  res.status(201).json(appointment);
});

export default router;
