import { supabase } from '../supabase';

export async function uploadToSupabase(expense : any) {
  const { error } = await supabase.from('expenses').upsert([expense]);
  if (error) throw error;
}
