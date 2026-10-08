import { createAuthClient } from 'better-auth/react';

// Same-origin: /api is proxied to the server (Vite in development, Vercel in
// production), so the session cookie is first-party.
export const authClient = createAuthClient({ basePath: '/api/auth' });
