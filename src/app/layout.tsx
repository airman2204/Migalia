import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.migaliabakery.com'
  ),
  title: {
    default: 'MÍGALIA • Boutique Bakery',
    template: '%s | MÍGALIA',
  },
  description: 'MÍGALIA — Boutique Bakery. El arte de lo sutil. Alta repostería y panadería artesanal.',
  applicationName: 'MÍGALIA',
  keywords: ['Migalia', 'Boutique Bakery', 'Repostería', 'Panadería Artesanal', 'Cookie Fries', 'Puebla', 'Alta Repostería'],
  authors: [{ name: 'MÍGALIA Team' }],
  creator: 'MÍGALIA',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'MÍGALIA • Boutique Bakery',
    description: 'El arte de lo sutil. Alta repostería y panadería artesanal.',
    url: 'https://migalia.vercel.app',
    siteName: 'MÍGALIA',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MÍGALIA • Boutique Bakery',
    description: 'El arte de lo sutil. Alta repostería y panadería artesanal.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F6F0] text-[#221F1D]">
        {children}
      </body>
    </html>
  );
}
