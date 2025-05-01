import { supabase } from '../supabase';
import { db } from '../db/SqLiteDb';
import { uploadToSupabase } from '../api/supabaseService';

export async function syncExpensesWithBackend() {
  try {
    const unsyncedRows = await db.getAllAsync('SELECT * FROM expenses WHERE is_synced = 0');

    for (const row of unsyncedRows) {
      if (row.is_deleted) {
        const { error } = await supabase.from('expenses').delete().eq('id', row.id);
        if (!error) {
          await db.runAsync('DELETE FROM expenses WHERE id = ?', [row.id]);
        } else {
          console.error('Supabase delete error:', error.message);
        }
      } else {
        const expense = {
          id: row.id,
          title: row.title,
          amount: row.amount,
          is_synced: true,
          created_at: row.created_at,
          date: row.date, 
          type: row.type,
        };
        console.log('Uploading expense:', expense);
        await uploadToSupabase(expense);
        await db.runAsync('UPDATE expenses SET is_synced = 1 WHERE id = ?', [row.id]);
      }
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}
