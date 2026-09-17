import { NextResponse, type NextRequest } from 'next/server'

// La autenticación se maneja en el cliente (componente LoginScreen).
// No se necesita redirección server-side porque no usamos Supabase Auth,
// sino autenticación personalizada con Zoho SMTP.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

