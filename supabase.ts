// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPA_BASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPA_BASE_PUBLIC_ANNON_KEY;

export const supabase = createClient(SUPABASE_URL as any, SUPABASE_ANON_KEY as any);
