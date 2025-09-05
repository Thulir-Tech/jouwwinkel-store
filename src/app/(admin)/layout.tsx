

import { AdminLayoutClient } from './admin/admin-layout-client';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </SidebarProvider>
  );
}
