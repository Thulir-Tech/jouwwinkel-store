

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { getUiConfig } from '@/lib/firestore';
import { Providers } from './providers';

const defaultTitle = 'Jouwwinkel – Elevate your style';
const defaultDescription = 'A production-ready e-commerce web app built with Next.js, Firebase, and Tailwind CSS.';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getUiConfig();
  return {
    title: config?.browserTitle || defaultTitle,
    description: defaultDescription,
    icons: {
      icon: config?.faviconUrl?.[0] || '/favicon.ico',
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
