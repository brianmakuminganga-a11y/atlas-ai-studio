// Real PayPal API integration
// Docs: https://developer.paypal.com/api/rest/
// Owner: Ng'ang'a Makumi

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_ENV = (process.env.PAYPAL_ENV || 'sandbox') as 'sandbox' | 'live';
const PAYPAL_BASE = PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get PayPal OAuth access token.
 * Cached until 1 min before expiry.
 */
async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error('PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_SECRET env vars.');
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
  return cachedToken.token;
}

export interface PaypalOrderItem {
  name: string;
  description: string;
  amount: number;
  currency: string; // USD, etc.
  imagesIncluded: number;
  tier: string;
  paymentId: string; // Atlas internal payment ID for tracking
}

export interface PaypalOrderResponse {
  orderId: string;
  status: string;
  approveUrl: string; // user goes here to pay
}

/**
 * Create a PayPal order (type: CAPTURE).
 * Returns the approval URL where the user pays.
 */
export async function createPaypalOrder(item: PaypalOrderItem, returnUrl: string, cancelUrl: string): Promise<PaypalOrderResponse> {
  const token = await getAccessToken();

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: item.paymentId,
        description: item.description,
        amount: {
          currency_code: item.currency,
          value: item.amount.toFixed(2),
        },
        custom_id: `ATLAS-${item.paymentId}`,
      },
    ],
    application_context: {
      brand_name: 'Atlas AI Studio',
      landing_page: 'LOGIN',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal order failed: ${data.message || JSON.stringify(data)}`);
  }

  const approveLink = data.links?.find((l: any) => l.rel === 'approve')?.href;
  if (!approveLink) throw new Error('PayPal: no approve URL returned');

  return {
    orderId: data.id,
    status: data.status,
    approveUrl: approveLink,
  };
}

/**
 * Capture payment for an approved PayPal order.
 * Called after user returns from PayPal approval URL.
 */
export async function capturePaypalOrder(orderId: string): Promise<any> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${data.message || JSON.stringify(data)}`);
  }

  return data;
}

export function isPaypalConfigured(): boolean {
  return !!PAYPAL_CLIENT_ID && !!PAYPAL_SECRET;
}
