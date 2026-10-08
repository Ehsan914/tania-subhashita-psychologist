import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';

export interface AuthenticatedRequest extends Request<Record<string, string>> {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

  if (!session) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const { id, email, name } = session.user;
  req.user = { id, email, name };
  next();
}
