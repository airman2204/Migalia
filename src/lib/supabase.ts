import { createClient } from '@supabase/supabase-js';

// URL y clave de Supabase leídas de entorno o con fallback a valores válidos para evitar fallo en build
const defaultUrl = 'https://jpdquyxisqdikatpatxm.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZHF1eXhpc3FkaWthdHBhdHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDY0MzMsImV4cCI6MjEwNDk4MjQzM30.DCcv8MaD3Tzvd-l2-qAzZWm4UvSccqNlyoxQa4Bu3YQ';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || defaultUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
