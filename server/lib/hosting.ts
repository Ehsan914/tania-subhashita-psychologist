import 'dotenv/config';

// `npm run host` starts this server with --host-site: it then serves the built site
// (client/dist) next to the API and rebuilds it after admin edits, so the whole site runs
// locally from one origin. Without the flag it is the API alone.
export const HOST_SITE = process.argv.includes('--host-site');

export const PORT = Number(process.env.PORT || process.env.SERVER_PORT || (HOST_SITE ? 8080 : 3001));

// Origins whose browser requests the API and sign-in accept.
export const SITE_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  HOST_SITE ? `http://localhost:${PORT}` : '',
  process.env.APP_URL?.replace(/\/+$/, '') ?? '',
].filter(Boolean);
