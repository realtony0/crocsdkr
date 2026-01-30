import AdminPageClient from '@/components/admin/AdminPageClient';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPageClient urlCode="admin" />;
}
