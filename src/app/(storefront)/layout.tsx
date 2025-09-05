
import type { ReactNode } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { AuthProvider } from '@/hooks/use-auth';

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
        <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </div>
    </AuthProvider>
  );
}
