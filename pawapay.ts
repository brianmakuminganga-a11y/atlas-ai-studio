// Real Pawapay API integration
// Docs: https://docs.pawapay.io/
// Owner: Ng'ang'a Makumi

import { NextRequest } from 'next/server';

const PAWAPAY_API_TOKEN = process.env.PAWAPAY_API_TOKEN;
const PAWAPAY_ENV = (process.env.PAWAPAY_ENV || 'sandbox') as 'sandbox' | 'live';
const PAWAPAY_BASE = PAWAPAY_ENV === 'live'
  ? 'https://api.pawapay.io'
  : 'https://api.sandbox.pawapay.io';

export interface PawapayDepositRequest {
  amount: number;
  currency: string; // KES, TZS, UGX, RWF, etc.
  msisdn: string; // user's phone in international format e.g. 254712345678
  country: string; // KE, TZ, UG, RW
  paymentMethod: string; // 'MOBILE_MONEY' or 'CARD'
  statementDescription: string;
  metadata?: Record<string, any>;
  correspondent?: string; // e.g. 'MPESA_KENYA', 'AIRTEL_KENYA', 'MTN_TANZANIA'
}

export interface PawapayDepositResponse {
  depositId: string;
  status: string; // 'PENDING' | 'SUCCESS' | 'FAILED'
  amount: number;
  currency: string;
  customerTimestamp?: string;
}

const COUNTRY_CORRESPONDENT: Record<string, string> = {
  KE: 'MPESA_KENYA',
  TZ: 'MPESA_TANZANIA',
  UG: 'MTN_UGANDA',
  RW: 'MTN_RWANDA',
};

/**
 * Initiate a real Pawapay mobile money deposit (STK push).
 * Returns depositId on success, throws on error.
 */
export async function createPawapayDeposit(req: PawapayDepositRequest): Promise<PawapayDepositResponse> {
  if (!PAWAPAY_API_TOKEN) {
    throw new Error('Pawapay API token not configured. Set PAWAPAY_API_TOKEN env var.');
  }

  const correspondent = req.correspondent || COUNTRY_CORRESPONDENT[req.country] || 'MPESA_KENYA';

  const body = {
    depositAmount: req.amount.toFixed(2),
    currency: req.currency,
    msisdn: req.msisdn,
    correspondent,
    country: req.country,
    statementDescription: req.statementDescription,
    metadata: req.metadata || {},
    customerTimestamp: new Date().toISOString(),
  };

  const res = await fetch(`${PAWAPAY_BASE}/deposits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAWAPAY_API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.errors) {
    const errMsg = data.errors?.[0]?.message || data.message || `HTTP ${res.status}`;
    throw new Error(`Pawapay error: ${errMsg}`);
  }

  return {
    depositId: data.depositId,
    status: data.status || 'PENDING',
    amount: parseFloat(data.depositAmount),
    currency: data.currency,
    customerTimestamp: data.customerTimestamp,
  };
}

/**
 * Check the status of a Pawapay deposit.
 */
export async function getPawapayDepositStatus(depositId: string): Promise<any> {
  if (!PAWAPAY_API_TOKEN) throw new Error('Pawapay not configured');

  const res = await fetch(`${PAWAPAY_BASE}/deposits/${depositId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${PAWAPAY_API_TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`Pawapay status check failed: HTTP ${res.status}`);
  }

  return res.json();
}

export function isPawapayConfigured(): boolean {
  return !!PAWAPAY_API_TOKEN;
}
