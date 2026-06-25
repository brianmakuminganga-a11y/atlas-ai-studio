// Client-side pricing constants — mirrors src/lib/pricing.ts
// Owner: Ng'ang'a Makumi

export type CountryCode = 'KE' | 'NG' | 'US' | 'TZ' | 'UG' | 'RW' | 'GH' | 'GB' | 'CA' | 'AU' | 'OTHER';
export type CurrencyCode = 'KES' | 'NGN' | 'USD' | 'TZS' | 'UGX' | 'RWF' | 'GHS' | 'GBP' | 'CAD' | 'AUD';

export const COUNTRY_CURRENCY: Record<CountryCode, CurrencyCode> = {
  KE: 'KES', NG: 'NGN', US: 'USD', TZ: 'TZS', UG: 'UGX', RW: 'RWF', GH: 'GHS', GB: 'GBP', CA: 'CAD', AU: 'AUD', OTHER: 'USD',
};

export const COUNTRY_NAME: Record<CountryCode, string> = {
  KE: 'Kenya', NG: 'Nigeria', US: 'USA', TZ: 'Tanzania', UG: 'Uganda', RW: 'Rwanda', GH: 'Ghana', GB: 'UK', CA: 'Canada', AU: 'Australia', OTHER: 'Global',
};

export interface Tier {
  id: 'free' | 'payg' | 'daily' | 'weekly' | 'monthly';
  label: string;
  description: string;
  imagesIncluded: number;
  durationHours?: number;
  prices: Partial<Record<CurrencyCode, number>>;
  popular?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: 'free', label: 'Free Trial', description: '3 free watermarked images to try the magic',
    imagesIncluded: 3,
    prices: { KES: 0, NGN: 0, USD: 0, TZS: 0, UGX: 0, RWF: 0, GHS: 0, GBP: 0, CAD: 0, AUD: 0 },
  },
  {
    id: 'payg', label: 'Pay per image', description: 'One image at a time, no commitment',
    imagesIncluded: 1,
    prices: { KES: 10, NGN: 200, USD: 0.1, TZS: 50, UGX: 100, RWF: 100, GHS: 1, GBP: 0.08, CAD: 0.13, AUD: 0.15 },
  },
  {
    id: 'daily', label: 'Daily Pass', description: '30 images in 24 hours — for active creators',
    imagesIncluded: 30, durationHours: 24,
    prices: { KES: 50, NGN: 500, USD: 1.99, TZS: 250, UGX: 500, RWF: 500, GHS: 10, GBP: 1.5, CAD: 2.5, AUD: 2.8 },
    popular: true,
  },
  {
    id: 'weekly', label: 'Weekly Pass', description: '150 images in 7 days — for small businesses & churches',
    imagesIncluded: 150, durationHours: 168,
    prices: { KES: 200, NGN: 2000, USD: 4.99, TZS: 1000, UGX: 2000, RWF: 2000, GHS: 40, GBP: 4, CAD: 6.5, AUD: 7 },
  },
  {
    id: 'monthly', label: 'Monthly Pro', description: 'Unlimited (fair use: 500/mo) — for power users',
    imagesIncluded: -1, durationHours: 720,
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
    { provider: 'mpesa', label: 'M-Pesa TZ', icon: '📱' },
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
    KES: 'KES', NGN: '₦', USD: '$', TZS: 'TSh', UGX: 'USh', RWF: 'RWF', GHS: '₵', GBP: '£', CAD: 'C$', AUD: 'A$',
  };
  const symbol = symbols[currency] || currency;
  if (amount === 0) return 'FREE';
  if (currency === 'USD' || currency === 'GBP' || currency === 'CAD' || currency === 'AUD') {
    return `${symbol}${amount.toFixed(2)}`;
  }
  return `${symbol} ${amount.toLocaleString()}`;
}

// === Generation options (client-side constants) ===

export const STYLES = [
  { value: 'realistic', label: 'Realistic', desc: 'Photoreal, real-world physics' },
  { value: 'anime', label: 'Anime', desc: 'Studio Ghibli style' },
  { value: 'cartoon', label: 'Cartoon', desc: 'Pixar 3D animation' },
  { value: 'cinematic', label: 'Cinematic', desc: 'Blockbuster film still' },
  { value: '3d', label: '3D Render', desc: 'Octane, ray-traced' },
  { value: 'watercolor', label: 'Watercolor', desc: 'Hand-painted art' },
  { value: 'pixel', label: 'Pixel Art', desc: '16-bit retro game' },
  { value: 'comic', label: 'Comic', desc: 'Marvel/DC ink style' },
  { value: 'fantasy', label: 'Fantasy', desc: 'Epic concept art' },
  { value: 'scifi', label: 'Sci-Fi', desc: 'Cyberpunk future' },
];

export const SIZES = [
  { value: '1024x1024', label: 'Square', icon: '⬜' },
  { value: '1344x768', label: 'Landscape', icon: '🖥️' },
  { value: '768x1344', label: 'Portrait', icon: '📱' },
  { value: '1440x720', label: 'Wide', icon: '🎬' },
  { value: '720x1440', label: 'Tall', icon: '📲' },
];

export const FRAME_OPTIONS = [
  { value: 1, label: 'Single frame' },
  { value: 4, label: '4 frames' },
  { value: 8, label: '8 frames' },
];

export const SAMPLE_PROMPTS = [
  'A lone samurai standing in cherry blossom rain at dusk',
  'A cyberpunk street market in neon-lit Tokyo 2099',
  'An astronaut discovering an alien garden on Mars',
  'A magical library with floating books and golden light',
  'A Maasai warrior watching a satellite pass over the savanna',
  'A futuristic Nairobi skyline at sunset, flying cars',
];
