// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ikfbiqfjtmwhxacydeuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZmJpcWZqdG13aHhhY3lkZXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4Njc1MzgsImV4cCI6MjA2MDQ0MzUzOH0.fCJdEgJR9n9RYtDkW0wLYwFTtave93ZqkdtG5xOLVx8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
