'use client';

import { useEffect, useState } from 'react';
import ComingSoonPage from './coming-soon/page';
import AdminPage from './admin/page';

export default function Home() {
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Si el hostname es admin.migaliabakery.com o tiene parametro ?admin=true
      const isAdmin = hostname.startsWith('admin.') || window.location.search.includes('admin');
      setIsAdminSubdomain(isAdmin);
    }
  }, []);

  if (!mounted) {
    return <ComingSoonPage />;
  }

  // Si entra desde admin.migaliabakery.com carga el portal de admin
  if (isAdminSubdomain) {
    return <AdminPage />;
  }

  // Si entra desde migaliabakery.com o www carga la landing de Próximamente
  return <ComingSoonPage />;
}
