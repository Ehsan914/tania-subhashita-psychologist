import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: REFRESH_TOKEN_EXPIRES_MS,
  path: '/',
};

function signAccessToken(user: { id: string; email: string; name: string | null; isSuperAdmin: boolean }) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name ?? user.email, isSuperAdmin: user.isSuperAdmin },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
}

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({ where: { email } });

    if (!adminUser || !(await bcrypt.compare(password, adminUser.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(adminUser);

    const rawRefresh = crypto.randomBytes(48).toString('hex');
    await prisma.adminSession.create({
      data: {
        adminUserId: adminUser.id,
        refreshToken: rawRefresh,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
      },
    });

    res.cookie('mindcare_refresh', rawRefresh, COOKIE_OPTS);

    res.json({
      token: accessToken,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name ?? adminUser.email,
        avatarUrl: adminUser.avatarUrl ?? '',
        role: adminUser.role ?? '',
        isSuperAdmin: adminUser.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/refresh — issue a new access token using the httpOnly refresh cookie
router.post('/refresh', async (req: Request, res: Response) => {
  const raw = req.cookies?.mindcare_refresh;
  if (!raw) return res.status(401).json({ error: 'No refresh token' });

  try {
    const session = await prisma.adminSession.findUnique({
      where: { refreshToken: raw },
      include: { adminUser: true },
    });

    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('mindcare_refresh', { path: '/' });
      return res.status(401).json({ error: 'Refresh token expired or invalid' });
    }

    const accessToken = signAccessToken(session.adminUser);

    res.json({
      token: accessToken,
      user: {
        id: session.adminUser.id,
        email: session.adminUser.email,
        name: session.adminUser.name ?? session.adminUser.email,
        avatarUrl: session.adminUser.avatarUrl ?? '',
        role: session.adminUser.role ?? '',
        isSuperAdmin: session.adminUser.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me — validate access token and return current user
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.json({ authenticated: false, user: null });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const adminUser = await prisma.adminUser.findUnique({ where: { id: decoded.userId } });

    if (!adminUser) return res.json({ authenticated: false, user: null });

    res.json({
      authenticated: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name ?? adminUser.email,
        avatarUrl: adminUser.avatarUrl ?? '',
        role: adminUser.role ?? '',
        isSuperAdmin: adminUser.isSuperAdmin,
      },
    });
  } catch {
    return res.json({ authenticated: false, user: null });
  }
});

// POST /auth/logout — delete the session and clear the cookie
router.post('/logout', async (req: Request, res: Response) => {
  const raw = req.cookies?.mindcare_refresh;
  if (raw) {
    await prisma.adminSession.deleteMany({ where: { refreshToken: raw } }).catch(() => {});
  }
  res.clearCookie('mindcare_refresh', { path: '/' });
  res.json({ success: true });
});

export default router;
