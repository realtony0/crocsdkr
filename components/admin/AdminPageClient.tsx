'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

const SECRET_PATH = '/amdycrcwst';

interface AdminPageClientProps {
  urlCode: string;
}

export default function AdminPageClient({ urlCode }: AdminPageClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    if (urlCode) {
      sessionStorage.setItem('admin_url_code', urlCode);
    }
    setIsLoading(false);
  }, [urlCode]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    const code = sessionStorage.getItem('admin_url_code') || urlCode;
    router.push(`${SECRET_PATH}?k=${encodeURIComponent(code)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
