import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';

const MIN_SECRET_LENGTH = 32;
const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < MIN_SECRET_LENGTH) {
  throw new Error(`BETTER_AUTH_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters`);
}

// Header that index.ts fills with the client IP Express resolved (trust proxy),
// so Better Auth's rate limiter and express-rate-limit key on the same address.
export const CLIENT_IP_HEADER = 'x-mindcare-client-ip';

// The site has exactly one admin, created by the seed. There is no sign-up.
export const auth = betterAuth({
  secret,
  // The public origin of the site; in production /api is proxied through it.
  baseURL: process.env.APP_URL,
  basePath: '/api/auth',
  trustedOrigins: ['http://localhost:3000', 'http://localhost:5173', process.env.APP_URL ?? ''].filter(Boolean),
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
  },
  user: {
    // The site sends no email; the address is only the admin's sign-in name.
    changeEmail: { enabled: true, updateEmailWithoutVerification: true },
  },
  rateLimit: {
    customRules: {
      '/sign-in/email': { window: 15 * 60, max: 10 },
      '/change-password': { window: 15 * 60, max: 10 },
    },
  },
  advanced: {
    ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
  },
});
