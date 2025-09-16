

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { getUiConfig } from '@/lib/firestore';
import { Providers } from './providers';

const defaultTitle = 'Jouwwinkel – Elevate your style';
const defaultDescription = 'A production-ready e-commerce web app built with Next.js, Firebase, and Tailwind CSS.';

const shoppingBagIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z'/%3E%3Cpath d='M3 6h18'/%3E%3Cpath d='M16 10a4 4 0 0 1-8 0'/%3E%3C/svg%3E`;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getUiConfig();
  return {
    title: config?.browserTitle || defaultTitle,
    description: defaultDescription,
    icons: {
      icon: config?.faviconUrl?.[0] || shoppingBagIcon,
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
