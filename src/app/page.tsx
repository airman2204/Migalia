'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import ComingSoonPage from './coming-soon/page';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MigaliaLoader } from '../components/MigaliaLoader';

// Cargar AdminPage solo en el navegador (Client-side) sin prerenderizado en el servidor
const AdminPage = dynamic(() => import('./admin/page'), {
  ssr: false,
  loading: () => <MigaliaLoader label="Iniciando portal de administración..." fullscreen={true} />,
});

export default function Home() {
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isAdmin =
        hostname.startsWith('admin.') ||
        window.location.search.includes('admin');
      setIsAdminSubdomain(isAdmin);
    }
  }, []);

  if (!mounted) {
    return <ComingSoonPage />;
  }

  if (isAdminSubdomain) {
    return (
      <ErrorBoundary>
        <AdminPage />
      </ErrorBoundary>
    );
  }

  return <ComingSoonPage />;
}
