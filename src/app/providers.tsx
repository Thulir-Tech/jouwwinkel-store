
'use client';

import { AuthProvider } from '@/hooks/use-auth';
import type { UiConfig } from '@/lib/types';

export function Providers({ children, uiConfig }: { children: React.ReactNode, uiConfig: UiConfig | null }) {
  return (
    <AuthProvider uiConfig={uiConfig}>
      {children}
    </AuthProvider>
  );
}
