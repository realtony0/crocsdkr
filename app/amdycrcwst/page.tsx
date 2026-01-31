import { notFound } from 'next/navigation';
import { getSettingsAsync } from '@/lib/settings-db';
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
  const settings = await getSettingsAsync();
  const urlCode = settings?.admin?.urlCode || '';

  if (!params.k || params.k !== urlCode) {
    notFound();
  }

  return <AdminPageClient urlCode={params.k} />;
}
