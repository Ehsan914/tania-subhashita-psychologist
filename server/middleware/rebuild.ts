import type { NextFunction, Request, Response } from 'express';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST_SITE, PORT } from '../lib/hosting.js';

// The public pages are prerendered when the site is built (client/prerender.tsx), so an
// edit in the admin reaches visitors only after a new build. In production a Vercel deploy
// hook starts one; a locally hosted site (npm run host) is rebuilt here. Edits usually come
// in bursts, so the build starts once they have paused.
const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL;
const QUIET_MS = DEPLOY_HOOK ? 60_000 : 5_000;
// …but a long editing session still gets a build at least this often.
const MAX_WAIT_MS = 5 * 60_000;

// Admin areas that never change what the public pages show.
const NOT_CONTENT = /^\/appointments\b/;

const CLIENT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'client');

async function callDeployHook(hook: string) {
  try {
    const res = await fetch(hook, { method: 'POST' });
    if (!res.ok) console.error(`Site rebuild: deploy hook answered HTTP ${res.status}`);
    else console.log('Site rebuild started');
  } catch (err) {
    console.error('Site rebuild: deploy hook failed:', (err as Error).message);
  }
}

let building: Promise<void> | null = null;
let buildAgain = false;

// Builds client/dist against this server. The prerender reads content from API_URL; the
// pages themselves call the API on their own origin, so VITE_API_URL is left empty
// (overriding the production URL in client/.env.production).
export function buildSite(): Promise<void> {
  if (building) {
    buildAgain = true;
    return building;
  }
  console.log('Site build: started');
  building = new Promise<void>((resolve) => {
    const child = spawn('npm', ['run', 'build'], {
      cwd: CLIENT_DIR,
      shell: true,
      stdio: ['ignore', 'ignore', 'inherit'],
      env: { ...process.env, API_URL: `http://localhost:${PORT}`, VITE_API_URL: '' },
    });
    child.on('error', (err) => console.error('Site build: could not start:', err.message));
    child.on('close', (code) => {
      console.log(code === 0 ? 'Site build: done' : `Site build: failed (exit ${code})`);
      resolve();
    });
  }).finally(() => {
    building = null;
    if (buildAgain) {
      buildAgain = false;
      void buildSite();
    }
  });
  return building;
}

const rebuild = DEPLOY_HOOK ? () => callDeployHook(DEPLOY_HOOK) : HOST_SITE ? buildSite : null;

let pending: NodeJS.Timeout | null = null;
let firstEditAt = 0;

function scheduleRebuild(run: () => Promise<void>) {
  if (pending) clearTimeout(pending);
  else firstEditAt = Date.now();
  const delay = Math.max(0, Math.min(QUIET_MS, firstEditAt + MAX_WAIT_MS - Date.now()));
  pending = setTimeout(() => {
    pending = null;
    void run();
  }, delay);
  // a waiting rebuild never holds the server open on shutdown
  pending.unref();
}

export function rebuildOnContentChange(req: Request, res: Response, next: NextFunction) {
  if (rebuild && req.method !== 'GET' && !NOT_CONTENT.test(req.path)) {
    res.on('finish', () => {
      if (res.statusCode < 400) scheduleRebuild(rebuild);
    });
  }
  next();
}
