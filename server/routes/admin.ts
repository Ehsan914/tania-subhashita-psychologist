import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireSuperAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

// All admin routes require authentication
router.use(requireAuth);

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
router.get('/dashboard', async (_req: AuthenticatedRequest, res: Response) => {
  const [servicesCount, programsCount, blogPostsCount, testimonialsCount, faqsCount, galleryCount] = await Promise.all([
    prisma.service.count(),
    prisma.program.count(),
    prisma.blogPost.count(),
    prisma.testimonial.count(),
    prisma.fAQ.count(),
    prisma.galleryImage.count(),
  ]);
  res.json({ servicesCount, programsCount, blogPostsCount, testimonialsCount, faqsCount, galleryCount });
});

// ─── Site Settings ─────────────────────────────────────────────────────────────
router.get('/site-settings', async (_req: AuthenticatedRequest, res: Response) => {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: 'default' } });
  }
  res.json(settings);
});

router.put('/site-settings', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(settings);
});

// ─── Hero Section ──────────────────────────────────────────────────────────────
router.get('/hero', async (_req: AuthenticatedRequest, res: Response) => {
  let hero = await prisma.heroSection.findFirst();
  if (!hero) {
    hero = await prisma.heroSection.create({ data: { id: 'default' } });
  }
  res.json(hero);
});

router.put('/hero', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const hero = await prisma.heroSection.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(hero);
});

// ─── Welcome Section ───────────────────────────────────────────────────────────
router.get('/welcome', async (_req: AuthenticatedRequest, res: Response) => {
  let welcome = await prisma.welcomeSection.findFirst();
  if (!welcome) {
    welcome = await prisma.welcomeSection.create({ data: { id: 'default' } });
  }
  res.json(welcome);
});

router.put('/welcome', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const welcome = await prisma.welcomeSection.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(welcome);
});

// ─── Methodology Quote ─────────────────────────────────────────────────────────
router.get('/methodology-quote', async (_req: AuthenticatedRequest, res: Response) => {
  let quote = await prisma.methodologyQuote.findFirst();
  if (!quote) {
    quote = await prisma.methodologyQuote.create({ data: { id: 'default' } });
  }
  res.json(quote);
});

router.put('/methodology-quote', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const quote = await prisma.methodologyQuote.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(quote);
});

// ─── CTA Section ───────────────────────────────────────────────────────────────
router.get('/cta', async (_req: AuthenticatedRequest, res: Response) => {
  let cta = await prisma.cTASection.findFirst();
  if (!cta) {
    cta = await prisma.cTASection.create({ data: { id: 'default' } });
  }
  res.json(cta);
});

router.put('/cta', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const cta = await prisma.cTASection.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(cta);
});

// ─── Statistics (CRUD) ─────────────────────────────────────────────────────────
router.get('/statistics', async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await prisma.statistic.findMany({ orderBy: { order: 'asc' } });
  res.json(stats);
});

router.post('/statistics', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const stat = await prisma.statistic.create({ data });
  res.status(201).json(stat);
});

router.put('/statistics/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const stat = await prisma.statistic.update({ where: { id }, data });
  res.json(stat);
});

router.delete('/statistics/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.statistic.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Services (CRUD) ───────────────────────────────────────────────────────────
router.get('/services', async (_req: AuthenticatedRequest, res: Response) => {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  res.json(services);
});

router.post('/services', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const service = await prisma.service.create({ data });
  res.status(201).json(service);
});

router.put('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const service = await prisma.service.update({ where: { id }, data });
  res.json(service);
});

router.delete('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.service.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Programs (CRUD) ──────────────────────────────────────────────────────────
router.get('/programs', async (_req: AuthenticatedRequest, res: Response) => {
  const programs = await prisma.program.findMany({ orderBy: { order: 'asc' } });
  res.json(programs);
});

router.post('/programs', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const program = await prisma.program.create({ data });
  res.status(201).json(program);
});

router.put('/programs/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const program = await prisma.program.update({ where: { id }, data });
  res.json(program);
});

router.delete('/programs/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.program.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Blog Posts (CRUD) ─────────────────────────────────────────────────────────
router.get('/blog-posts', async (_req: AuthenticatedRequest, res: Response) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { order: 'asc' } });
  res.json(posts);
});

router.post('/blog-posts', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const post = await prisma.blogPost.create({ data });
  res.status(201).json(post);
});

router.put('/blog-posts/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const post = await prisma.blogPost.update({ where: { id }, data });
  res.json(post);
});

router.delete('/blog-posts/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.blogPost.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Testimonials (CRUD) ──────────────────────────────────────────────────────
router.get('/testimonials', async (_req: AuthenticatedRequest, res: Response) => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  res.json(testimonials);
});

router.post('/testimonials', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const testimonial = await prisma.testimonial.create({ data });
  res.status(201).json(testimonial);
});

router.put('/testimonials/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const testimonial = await prisma.testimonial.update({ where: { id }, data });
  res.json(testimonial);
});

router.delete('/testimonials/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.testimonial.delete({ where: { id } });
  res.json({ success: true });
});

// ─── FAQs (CRUD) ──────────────────────────────────────────────────────────────
router.get('/faqs', async (_req: AuthenticatedRequest, res: Response) => {
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
  res.json(faqs);
});

router.post('/faqs', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const faq = await prisma.fAQ.create({ data });
  res.status(201).json(faq);
});

router.put('/faqs/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const faq = await prisma.fAQ.update({ where: { id }, data });
  res.json(faq);
});

router.delete('/faqs/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.fAQ.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Gallery Images (CRUD) ────────────────────────────────────────────────────
router.get('/gallery', async (_req: AuthenticatedRequest, res: Response) => {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: 'asc' } });
  res.json(images);
});

router.post('/gallery', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const image = await prisma.galleryImage.create({ data });
  res.status(201).json(image);
});

router.put('/gallery/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const image = await prisma.galleryImage.update({ where: { id }, data });
  res.json(image);
});

router.delete('/gallery/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.galleryImage.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Contact Info ──────────────────────────────────────────────────────────────
router.get('/contact', async (_req: AuthenticatedRequest, res: Response) => {
  let contact = await prisma.contactInfo.findFirst();
  if (!contact) {
    contact = await prisma.contactInfo.create({ data: { id: 'default' } });
  }
  res.json(contact);
});

router.put('/contact', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const contact = await prisma.contactInfo.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(contact);
});

// ─── About Section ─────────────────────────────────────────────────────────────
router.get('/about', async (_req: AuthenticatedRequest, res: Response) => {
  let about = await prisma.aboutSection.findFirst();
  if (!about) {
    about = await prisma.aboutSection.create({ data: { id: 'default' } });
  }
  res.json(about);
});

router.put('/about', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const about = await prisma.aboutSection.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(about);
});

// ─── Credentials (CRUD) ───────────────────────────────────────────────────────
router.get('/credentials', async (_req: AuthenticatedRequest, res: Response) => {
  const credentials = await prisma.credential.findMany({ orderBy: { order: 'asc' } });
  res.json(credentials);
});

router.post('/credentials', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const credential = await prisma.credential.create({ data });
  res.status(201).json(credential);
});

router.put('/credentials/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const credential = await prisma.credential.update({ where: { id }, data });
  res.json(credential);
});

router.delete('/credentials/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.credential.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Methodology Steps (CRUD) ─────────────────────────────────────────────────
router.get('/methodology-steps', async (_req: AuthenticatedRequest, res: Response) => {
  const steps = await prisma.methodologyStep.findMany({ orderBy: { order: 'asc' } });
  res.json(steps);
});

router.post('/methodology-steps', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const step = await prisma.methodologyStep.create({ data });
  res.status(201).json(step);
});

router.put('/methodology-steps/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const step = await prisma.methodologyStep.update({ where: { id }, data });
  res.json(step);
});

router.delete('/methodology-steps/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.methodologyStep.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Assessment Questions (CRUD) ──────────────────────────────────────────────
router.get('/assessment-questions', async (_req: AuthenticatedRequest, res: Response) => {
  const questions = await prisma.assessmentQuestion.findMany({ orderBy: { order: 'asc' } });
  res.json(questions);
});

router.post('/assessment-questions', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const question = await prisma.assessmentQuestion.create({ data });
  res.status(201).json(question);
});

router.put('/assessment-questions/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const question = await prisma.assessmentQuestion.update({ where: { id }, data });
  res.json(question);
});

router.delete('/assessment-questions/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.assessmentQuestion.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Assessment Score Bands (CRUD) ────────────────────────────────────────────
router.get('/assessment-score-bands', async (_req: AuthenticatedRequest, res: Response) => {
  const bands = await prisma.assessmentScoreBand.findMany({ orderBy: { minScore: 'asc' } });
  res.json(bands);
});

router.post('/assessment-score-bands', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const band = await prisma.assessmentScoreBand.create({ data });
  res.status(201).json(band);
});

router.put('/assessment-score-bands/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const band = await prisma.assessmentScoreBand.update({ where: { id }, data });
  res.json(band);
});

router.delete('/assessment-score-bands/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.assessmentScoreBand.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Booking Settings ─────────────────────────────────────────────────────────
router.get('/booking-settings', async (_req: AuthenticatedRequest, res: Response) => {
  let settings = await prisma.bookingSettings.findFirst();
  if (!settings) {
    settings = await prisma.bookingSettings.create({ data: { id: 'default' } });
  }
  res.json(settings);
});

router.put('/booking-settings', async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const settings = await prisma.bookingSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  res.json(settings);
});

// ─── Appointments ─────────────────────────────────────────────────────────────
router.get('/appointments', async (req: AuthenticatedRequest, res: Response) => {
  const { search, date, sortBy, sortDir } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: 'insensitive' } },
      { clientPhone: { contains: search, mode: 'insensitive' } },
      { clientEmail: { contains: search, mode: 'insensitive' } },
      { service: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (date) where.preferredDate = date;

  const SORTABLE = ['clientName', 'clientPhone', 'service', 'preferredDate', 'preferredTime', 'format', 'sessionType', 'status', 'createdAt'] as const;
  const col = SORTABLE.includes(sortBy as typeof SORTABLE[number]) ? sortBy : 'createdAt';
  const orderBy: Record<string, string> = { [col]: sortDir === 'asc' ? 'asc' : 'desc' };

  const appointments = await prisma.appointment.findMany({ where, orderBy });
  res.json(appointments);
});

router.put('/appointments/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const appointment = await prisma.appointment.update({ where: { id }, data: { status } });
  res.json(appointment);
});

router.delete('/appointments/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await prisma.appointment.delete({ where: { id } });
  res.json({ success: true });
});

// ─── Admin Users ──────────────────────────────────────────────────────────────

router.get('/users', async (_req: AuthenticatedRequest, res: Response) => {
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, isSuperAdmin: true, createdAt: true },
  });
  res.json(users);
});

router.post('/users', requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { email, name, role, isSuperAdmin } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'A user with that email already exists' });

  const generatedPassword = generatePassword();
  const passwordHash = await bcrypt.hash(generatedPassword, 12);
  const defaultName = name?.trim() || email.split('@')[0];

  const user = await prisma.adminUser.create({
    data: { email, name: defaultName, passwordHash, role: role?.trim() || 'User', isSuperAdmin: !!isSuperAdmin },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, isSuperAdmin: true, createdAt: true },
  });
  res.status(201).json({ ...user, generatedPassword });
});

router.put('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user!.userId;
  const isSuperAdmin = req.user!.isSuperAdmin;

  // Any admin can edit their own profile; only super admin can edit others
  if (id !== currentUserId && !isSuperAdmin) {
    return res.status(403).json({ error: 'You can only edit your own profile.' });
  }

  const { name, avatarUrl, role, email } = req.body;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
  if (role !== undefined) data.role = role;

  if (email !== undefined && isSuperAdmin) {
    const duplicate = await prisma.adminUser.findFirst({ where: { email, NOT: { id } } });
    if (duplicate) return res.status(409).json({ error: 'That email is already in use.' });
    data.email = email;
  }

  const user = await prisma.adminUser.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, isSuperAdmin: true, createdAt: true },
  });
  res.json(user);
});

router.post('/users/:id/change-password', requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user!.userId;

  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: 'User not found' });

  // Super admin changing their own password must verify current password
  if (id === currentUserId) {
    if (!currentPassword) return res.status(400).json({ error: 'Current password is required.' });
    const valid = await bcrypt.compare(currentPassword, target.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({ where: { id }, data: { passwordHash } });
  await prisma.adminSession.deleteMany({ where: { adminUserId: id } });

  res.json({ success: true });
});

router.delete('/users/:id', requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.userId) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }
  await prisma.adminUser.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
