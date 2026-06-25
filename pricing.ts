// Atlas AI Studio — pricing config (multi-currency)
// Owner: Ng'ang'a Makumi

export type CountryCode = 'KE' | 'NG' | 'US' | 'TZ' | 'UG' | 'RW' | 'GH' | 'GB' | 'CA' | 'AU' | 'OTHER';
export type CurrencyCode = 'KES' | 'NGN' | 'USD' | 'TZS' | 'UGX' | 'RWF' | 'GHS' | 'GBP' | 'CAD' | 'AUD';

export const COUNTRY_CURRENCY: Record<CountryCode, CurrencyCode> = {
  KE: 'KES',
  NG: 'NGN',
  US: 'USD',
  TZ: 'TZS',
  UG: 'UGX',
  RW: 'RWF',
  GH: 'GHS',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  OTHER: 'USD',
};

export const COUNTRY_NAME: Record<CountryCode, string> = {
  KE: 'Kenya',
  NG: 'Nigeria',
  US: 'United States',
  TZ: 'Tanzania',
  UG: 'Uganda',
  RW: 'Rwanda',
  GH: 'Ghana',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  OTHER: 'Global',
};

export interface Tier {
  id: 'free' | 'payg' | 'daily' | 'weekly' | 'monthly';
  label: string;
  description: string;
  imagesIncluded: number; // -1 = unlimited (fair use)
  durationHours?: number; // how long the tier lasts
  prices: Partial<Record<CurrencyCode, number>>;
  popular?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: 'free',
    label: 'Free Trial',
    description: '3 free watermarked images to try the magic',
    imagesIncluded: 3,
    prices: { KES: 0, NGN: 0, USD: 0, TZS: 0, UGX: 0, RWF: 0, GHS: 0, GBP: 0, CAD: 0, AUD: 0 },
  },
  {
    id: 'payg',
    label: 'Pay per image',
    description: 'One image at a time, no commitment',
    imagesIncluded: 1,
    prices: { KES: 10, NGN: 200, USD: 0.1, TZS: 50, UGX: 100, RWF: 100, GHS: 1, GBP: 0.08, CAD: 0.13, AUD: 0.15 },
  },
  {
    id: 'daily',
    label: 'Daily Pass',
    description: '30 images in 24 hours — perfect for active creators',
    imagesIncluded: 30,
    durationHours: 24,
    prices: { KES: 50, NGN: 500, USD: 1.99, TZS: 250, UGX: 500, RWF: 500, GHS: 10, GBP: 1.5, CAD: 2.5, AUD: 2.8 },
    popular: true,
  },
  {
    id: 'weekly',
    label: 'Weekly Pass',
    description: '150 images in 7 days — for small businesses & churches',
    imagesIncluded: 150,
    durationHours: 24 * 7,
    prices: { KES: 200, NGN: 2000, USD: 4.99, TZS: 1000, UGX: 2000, RWF: 2000, GHS: 40, GBP: 4, CAD: 6.5, AUD: 7 },
  },
  {
    id: 'monthly',
    label: 'Monthly Pro',
    description: 'Unlimited images (fair use: 500/mo) — best for power users',
    imagesIncluded: -1,
    durationHours: 24 * 30,
    prices: { KES: 500, NGN: 5000, USD: 9.99, TZS: 2500, UGX: 5000, RWF: 5000, GHS: 80, GBP: 8, CAD: 13, AUD: 14 },
  },
];

export const AVAILABLE_PAYMENTS: Record<CountryCode, { provider: string; label: string; icon: string }[]> = {
  KE: [
    { provider: 'mpesa', label: 'M-Pesa', icon: '📱' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
    { provider: 'card', label: 'Card', icon: '💳' },
  ],
  NG: [
    { provider: 'paystack', label: 'Paystack', icon: '💳' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
  US: [
    { provider: 'stripe', label: 'Card / Apple Pay', icon: '💳' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
  TZ: [
    { provider: 'mpesa', label: 'M-Pesa Tanzania', icon: '📱' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
  UG: [
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
    { provider: 'card', label: 'Card', icon: '💳' },
  ],
  RW: [
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
    { provider: 'card', label: 'Card', icon: '💳' },
  ],
  GH: [
    { provider: 'paystack', label: 'Paystack', icon: '💳' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
  GB: [
    { provider: 'stripe', label: 'Card', icon: '💳' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
  CA: [
    { provider: 'stripe', label: 'Card', icon: '💳' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
  AU: [
    { provider: 'stripe', label: 'Card', icon: '💳' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
  OTHER: [
    { provider: 'stripe', label: 'Card', icon: '💳' },
    { provider: 'paypal', label: 'PayPal', icon: '💳' },
  ],
};

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const symbols: Partial<Record<CurrencyCode, string>> = {
    KES: 'KES',
    NGN: '₦',
    USD: '$',
    TZS: 'TSh',
    UGX: 'USh',
    RWF: 'RWF',
    GHS: '₵',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
  };
  const symbol = symbols[currency] || currency;
  if (amount === 0) return 'FREE';
  if (currency === 'USD' || currency === 'GBP' || currency === 'CAD' || currency === 'AUD') {
    return `${symbol}${amount.toFixed(2)}`;
  }
  return `${symbol} ${amount.toLocaleString()}`;
}
