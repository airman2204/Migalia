import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://jpdquyxisqdikatpatxm.supabase.co';
const defaultKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZHF1eXhpc3FkaWthdHBhdHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDY0MzMsImV4cCI6MjEwNDk4MjQzM30.DCcv8MaD3Tzvd-l2-qAzZWm4UvSccqNlyoxQa4Bu3YQ';

// Inicializador seguro: garantiza que createClient solo se ejecute con una URL válida
function getSupabaseClient(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    defaultUrl;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    defaultKey;

  // Si por alguna razon Vercel inyecta una variable vacía, forzar fallback
  const validUrl = typeof url === 'string' && url.startsWith('http') ? url : defaultUrl;
  const validKey = typeof key === 'string' && key.length > 10 ? key : defaultKey;

  return createClient(validUrl, validKey, {
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          cache: 'no-store',
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });
      },
    },
  });
}

export const supabase = getSupabaseClient();
