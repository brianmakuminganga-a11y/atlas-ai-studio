import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Atlas AI Studio — Generate Anything',
  description: 'Atlas AI Studio — photorealistic, anime, cartoon & cinematic AI image generation with physics-aware realism. Pay with M-Pesa, Paystack, Stripe. Kenya · Nigeria · USA.',
  keywords: ['AI generation', 'Atlas AI', 'Atlas Studio', 'AI image Kenya', 'AI image Nigeria', 'anime AI', 'realistic AI'],
  authors: [{ name: "Ng'ang'a Makumi" }],
  creator: "Ng'ang'a Makumi",
  publisher: "Ng'ang'a Makumi",
  applicationName: 'Atlas AI Studio',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Atlas AI',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Atlas AI Studio',
    description: 'Generate photorealistic, anime, cartoon & cinematic AI images. Physics-aware realism.',
    siteName: 'Atlas AI Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas AI Studio',
    description: 'AI generation studio — Kenya · Nigeria · USA',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
