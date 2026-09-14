import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Si acceden a admin.migaliabakery.com o localhost con subdominio admin
  const isAdminSubdomain = hostname.startsWith('admin.') || url.searchParams.get('subdomain') === 'admin';

  // Reescribir ruta según el subdominio
  if (isAdminSubdomain) {
    if (url.pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
  } else {
    // Si entran al dominio principal (migaliabakery.com o www.migaliabakery.com)
    // la raíz muestra la página de "Próximamente"
    if (url.pathname === '/') {
      url.pathname = '/coming-soon';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto archivos estáticos, api y _next
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
