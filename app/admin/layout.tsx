import type { ReactNode } from 'react';

export const metadata = {
  title: 'Admin Crocsdkr',
  manifest: '/manifest-admin.json',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
