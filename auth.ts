// Atlas AI Studio — server-side helpers
// Country detection, auth, rate limiting

import { NextRequest } from 'next/server';
import { db } from './db';
import crypto from 'crypto';

export type CountryCode = 'KE' | 'NG' | 'US' | 'TZ' | 'UG' | 'RW' | 'GH' | 'GB' | 'CA' | 'AU' | 'OTHER';

const COUNTRY_MAP: Record<string, CountryCode> = {
  KE: 'KE', NG: 'NG', US: 'US', TZ: 'TZ', UG: 'UG', RW: 'RW', GH: 'GH', GB: 'GB', CA: 'CA', AU: 'AU',
};

export function detectCountry(req: NextRequest): CountryCode {
  // Check CF-IPCountry (Cloudflare) or custom header
  const cf = req.headers.get('cf-ipcountry');
  if (cf && COUNTRY_MAP[cf.toUpperCase()]) return COUNTRY_MAP[cf.toUpperCase()];
  // Fallback: query param ?country=KE
  const url = new URL(req.url);
  const q = url.searchParams.get('country');
  if (q && COUNTRY_MAP[q.toUpperCase()]) return COUNTRY_MAP[q.toUpperCase()];
  return 'KE'; // default to Kenya for the launch market
}

// --- OTP ---
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Sessions (cookie-based, simple HMAC token) ---
const SESSION_SECRET = process.env.SESSION_SECRET || 'atlas-ai-dev-secret-change-in-production';

export interface SessionPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
  exp: number;
}

export function signSession(payload: Omit<SessionPayload, 'exp'>, days = 30): string {
  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const full: SessionPayload = { ...payload, exp };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = 'atlas_session';

export function getSessionFromReq(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

// --- Referral code generation ---
export function generateReferralCode(name?: string): string {
  const base = (name || 'ATLAS').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4) || 'ATLAS';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

// --- Rate limiting (in-memory per process) ---
const rateBucket = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number, windowMs: number): { ok: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const existing = rateBucket.get(key);
  if (!existing || existing.resetAt < now) {
    rateBucket.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetIn: windowMs };
  }
  if (existing.count >= max) {
    return { ok: false, remaining: 0, resetIn: existing.resetAt - now };
  }
  existing.count++;
  return { ok: true, remaining: max - existing.count, resetIn: existing.resetAt - now };
}

// --- Device fingerprint ---
export function deviceFingerprint(req: NextRequest): string {
  const ua = req.headers.get('user-agent') || '';
  const accept = req.headers.get('accept') || '';
  const lang = req.headers.get('accept-language') || '';
  return crypto.createHash('sha256').update(`${ua}|${accept}|${lang}`).digest('hex').slice(0, 32);
}
