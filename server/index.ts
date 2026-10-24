import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { toNodeHandler } from 'better-auth/node';
import { auth, CLIENT_IP_HEADER } from './lib/auth.js';
import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';
import { rebuildOnContentChange, buildSite } from './middleware/rebuild.js';
import { HOST_SITE, PORT, SITE_ORIGINS } from './lib/hosting.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Startup Checks ────────────────────────────────────────────────────────────
if (IS_PROD && !process.env.APP_URL) {
  console.warn('⚠️  APP_URL is not set — admin sign-in will reject the site origin!');
}
if (IS_PROD && !process.env.VERCEL_DEPLOY_HOOK_URL) {
  console.warn('⚠️  VERCEL_DEPLOY_HOOK_URL is not set — admin edits will not reach the public pages until the next deploy!');
}

// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return cb(null, true);

    if (SITE_ORIGINS.includes(origin)) {
      cb(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      cb(Object.assign(new Error(`CORS: ${origin} not allowed`), { status: 403 }));
    }
  },
  credentials: true,
}));

// In production requests arrive client → Vercel (rewrite) → Railway edge → app,
// so the client IP is two hops back in X-Forwarded-For.
const TRUST_PROXY_HOPS = Number(process.env.TRUST_PROXY_HOPS ?? 2);
if (IS_PROD) app.set('trust proxy', TRUST_PROXY_HOPS);

// Hand Better Auth the IP Express resolved, overwriting anything the client sent.
app.use((req, _res, next) => {
  req.headers[CLIENT_IP_HEADER] = req.ip;
  next();
});

// Better Auth reads its own request bodies, so it is mounted before the parsers.
app.all('/api/auth/{*splat}', toNodeHandler(auth));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
// Express 5 leaves req.body undefined when a request has no body; handlers
// destructure it, so give them an empty object instead.
app.use((req, _res, next) => {
  req.body ??= {};
  next();
});

// ─── Logging (dev only) ────────────────────────────────────────────────────────
if (!IS_PROD) {
  app.use((req, _res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);
app.use('/api/admin', rebuildOnContentChange, adminRoutes);

// ─── Serve the built site (local hosting and development) ──────────────────────
// In production, Vercel serves the frontend — Railway is API-only. Here client/dist is
// served the way client/vercel.json has Vercel serve it: clean URLs (/about → about.html),
// no trailing slash, /admin on the admin shell, and the prerendered 404 page.
if (HOST_SITE || !IS_PROD) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  const isApi = (p: string) => p === '/api' || p.startsWith('/api/') || p === '/health';

  app.use(express.static(clientDist, { index: false, redirect: false }));
  app.get(['/admin', '/admin/{*splat}'], (_req, res) => {
    res.sendFile('app.html', { root: clientDist });
  });
  app.get('/{*splat}', (req, res, next) => {
    if (isApi(req.path)) return next();
    if (req.path.length > 1 && req.path.endsWith('/')) {
      return res.redirect(308, req.path.replace(/\/+$/, '') || '/');
    }
    const page = req.path === '/' ? 'index' : req.path.slice(1);
    res.sendFile(`${page}.html`, { root: clientDist }, (err) => {
      if (err && !res.headersSent) next();
    });
  });
  app.use((req, res, next) => {
    if (isApi(req.path)) return next();
    res.status(404).sendFile('404.html', { root: clientDist }, (err) => {
      if (err && !res.headersSent) next();
    });
  });
}

// ─── 404 Fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Body-parser and similar middleware tag client errors (400 bad JSON, 413 too large).
  if (err.status && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV ?? 'development'} mode`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   API:     http://localhost:${PORT}/api/*`);
  console.log(`   Auth:    http://localhost:${PORT}/api/auth/*`);
  if (HOST_SITE || !IS_PROD) {
    console.log(`   Site:    http://localhost:${PORT}/`);
  }
  console.log(`   Origins: ${SITE_ORIGINS.join(', ')}\n`);
  // A hosted site is built from the database as it is now; later admin edits rebuild it.
  if (HOST_SITE) void buildSite();
});