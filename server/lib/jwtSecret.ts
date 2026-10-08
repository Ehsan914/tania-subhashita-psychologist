import 'dotenv/config';

const secret = process.env.JWT_SECRET;

const MIN_SECRET_LENGTH = 32;

if (!secret || secret.length < MIN_SECRET_LENGTH) {
  throw new Error(`JWT_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters`);
}

export const JWT_SECRET = secret;
