import "./globals.css";

export const metadata = {
  title: "Atlas AI Studio",
  description: "AI generation studio by Nganga Makumi",
};

export const viewport = {
  themeColor: "#0B0B0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
