import type { NextFunction, Request, Response } from 'express';
import { createSupabaseAuthClient } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/env.js';
import { DEMO_USER_ID } from '../repositories/analysisRepository.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }
  const token = header.slice(7);
  try {
    if (isSupabaseConfigured) {
      const client = createSupabaseAuthClient(token);
      const { data, error } = await client.auth.getUser();
      if (!error && data.user) {
        req.userId = data.user.id;
        req.userEmail = data.user.email ?? undefined;
      }
    }
  } catch {
    // ignore
  }
  next();
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  await optionalAuth(req, res, () => {
    if (!req.userId) {
      if (!isSupabaseConfigured && req.headers['x-demo-user'] === '1') {
        req.userId = DEMO_USER_ID;
        return next();
      }
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  });
}

export function allowDemoUser(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId && !isSupabaseConfigured) {
    req.userId = DEMO_USER_ID;
  }
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
