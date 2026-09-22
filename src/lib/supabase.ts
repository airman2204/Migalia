import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://jpdquyxisqdikatpatxm.supabase.co';
const defaultKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZHF1eXhpc3FkaWthdHBhdHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDY0MzMsImV4cCI6MjEwNDk4MjQzM30.DCcv8MaD3Tzvd-l2-qAzZWm4UvSccqNlyoxQa4Bu3YQ';

// Inicializador seguro: garantiza que createClient solo se ejecute con una URL válida
function getSupabaseClient(): SupabaseClient {
  let rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    defaultUrl;
  let rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    defaultKey;

  // Si en el panel de Vercel se invirtieron URL y KEY por error humano:
  if (rawUrl.startsWith('eyJ') && rawKey.startsWith('http')) {
    const temp = rawUrl;
    rawUrl = rawKey;
    rawKey = temp;
  }

  // Si rawKey quedó con una URL o rawUrl no es URL válida, usar fallback seguro
  const validUrl = typeof rawUrl === 'string' && rawUrl.startsWith('http') ? rawUrl : defaultUrl;
  const validKey = typeof rawKey === 'string' && rawKey.startsWith('eyJ') ? rawKey : defaultKey;

  return createClient(validUrl, validKey, {
    global: {
      fetch: (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        return fetch(url, {
          ...options,
          cache: 'no-store',
          headers,
        });
      },
    },
  });
}

export const supabase = getSupabaseClient();
