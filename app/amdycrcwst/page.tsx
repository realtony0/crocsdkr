import { notFound } from 'next/navigation';
import { getSettings } from '@/lib/settings';
import AdminPageClient from '@/components/admin/AdminPageClient';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ k?: string }>;
}

export default async function AdminSecretPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const settings = getSettings();
  const urlCode = settings.admin?.urlCode || '';

  if (!params.k || params.k !== urlCode) {
    notFound();
  }

  return <AdminPageClient urlCode={params.k} />;
}
