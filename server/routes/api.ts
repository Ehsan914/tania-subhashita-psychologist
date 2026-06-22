import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Async wrapper to catch errors and forward them to Express error handler
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// ─── Site Settings ─────────────────────────────────────────────────────────────
router.get('/site-settings', asyncHandler(async (_req, res) => {
  const settings = await prisma.siteSettings.findFirst();
  res.json(settings);
}));

// ─── Hero Section ──────────────────────────────────────────────────────────────
router.get('/hero', asyncHandler(async (_req, res) => {
  const hero = await prisma.heroSection.findFirst();
  res.json(hero);
}));

// ─── Statistics ────────────────────────────────────────────────────────────────
router.get('/statistics', asyncHandler(async (_req, res) => {
  const stats = await prisma.statistic.findMany({ orderBy: { order: 'asc' } });
  res.json(stats);
}));

// ─── Welcome Section ───────────────────────────────────────────────────────────
router.get('/welcome', asyncHandler(async (_req, res) => {
  const welcome = await prisma.welcomeSection.findFirst();
  res.json(welcome);
}));

// ─── Methodology Quote ─────────────────────────────────────────────────────────
router.get('/methodology-quote', asyncHandler(async (_req, res) => {
  const quote = await prisma.methodologyQuote.findFirst();
  res.json(quote);
}));

// ─── CTA Section ───────────────────────────────────────────────────────────────
router.get('/cta', asyncHandler(async (_req, res) => {
  const cta = await prisma.cTASection.findFirst();
  res.json(cta);
}));

// ─── Services ──────────────────────────────────────────────────────────────────
router.get('/services', asyncHandler(async (_req, res) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(services);
}));

router.get('/services/:slug', asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { slug: req.params.slug },
  });
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(service);
}));

// ─── Programs ──────────────────────────────────────────────────────────────────
router.get('/programs', asyncHandler(async (_req, res) => {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(programs);
}));

// ─── Blog Posts ────────────────────────────────────────────────────────────────
router.get('/blog-posts', asyncHandler(async (_req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });
  res.json(posts);
}));

router.get('/blog-posts/:slug', asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
  });
  if (!post) {
    res.status(404).json({ error: 'Blog post not found' });
    return;
  }
  res.json(post);
}));

// ─── Testimonials ──────────────────────────────────────────────────────────────
router.get('/testimonials', asyncHandler(async (_req, res) => {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(testimonials);
}));

// ─── FAQs ──────────────────────────────────────────────────────────────────────
router.get('/faqs', asyncHandler(async (_req, res) => {
  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(faqs);
}));

// ─── Gallery ───────────────────────────────────────────────────────────────────
router.get('/gallery', asyncHandler(async (_req, res) => {
  const images = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(images);
}));

// ─── Contact Info ──────────────────────────────────────────────────────────────
router.get('/contact', asyncHandler(async (_req, res) => {
  const contact = await prisma.contactInfo.findFirst();
  res.json(contact);
}));

// ─── About Section ─────────────────────────────────────────────────────────────
router.get('/about', asyncHandler(async (_req, res) => {
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
}));

// ─── Credentials ───────────────────────────────────────────────────────────────
router.get('/credentials', asyncHandler(async (_req, res) => {
  const credentials = await prisma.credential.findMany({ orderBy: { order: 'asc' } });
  res.json(credentials);
}));

// ─── Methodology Steps ─────────────────────────────────────────────────────────
router.get('/methodology-steps', asyncHandler(async (_req, res) => {
  const steps = await prisma.methodologyStep.findMany({ orderBy: { order: 'asc' } });
  res.json(steps);
}));

// ─── Assessment Questions ──────────────────────────────────────────────────────
router.get('/assessment-questions', asyncHandler(async (_req, res) => {
  const questions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(questions);
}));

// ─── Assessment Score Bands ────────────────────────────────────────────────────
router.get('/assessment-score-bands', asyncHandler(async (_req, res) => {
  const bands = await prisma.assessmentScoreBand.findMany({ orderBy: { minScore: 'asc' } });
  res.json(bands);
}));

// ─── Booking Settings (public read) ───────────────────────────────────────────
router.get('/booking-settings', asyncHandler(async (_req, res) => {
  const settings = await prisma.bookingSettings.findFirst();
  res.json(settings);
}));

// ─── Appointments (public submit) ─────────────────────────────────────────────
router.post('/book', asyncHandler(async (req, res) => {
  const { clientName, clientPhone, clientEmail, service, sessionType, format, preferredDate, preferredTime, message } = req.body;
  if (!clientName || !clientPhone || !preferredDate || !preferredTime) {
    res.status(400).json({ error: 'Name, phone, date, and time are required.' });
    return;
  }
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
}));

export default router;
