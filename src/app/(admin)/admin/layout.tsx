
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminLayoutClient } from './admin-layout-client';

export default function AdminDashboardLayout({
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
