import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jpdquyxisqdikatpatxm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZHF1eXhpc3FkaWthdHBhdHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDY0MzMsImV4cCI6MjEwNDk4MjQzM30.DCcv8MaD3Tzvd-l2-qAzZWm4UvSccqNlyoxQa4Bu3YQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
