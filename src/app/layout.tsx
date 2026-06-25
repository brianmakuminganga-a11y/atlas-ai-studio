export const metadata = {
  title: 'Atlas AI Studio — by Ng\'ang\'a Makumi',
  description: 'Africa\'s Most Majestic AI Generation Studio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0B0B0F', color: '#F5F2E8', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
