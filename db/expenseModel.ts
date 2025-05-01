// database/expenseModel.ts

import { db } from './SqLiteDb';

export interface ExpenseRecord {
  id: string;             // UUID
  title: string;          // Text
  amount: number;         // Integer
  created_at: string;     // Timestamp with time zone
  is_synced: boolean;     // Boolean
  is_deleted: boolean;
  type: string;    // Boolean (0 = income, 1 = expense)
  date: string;         // Date of the expense (text)
}

// ✅ CREATE
export async function insertExpense({
  id,
  title,
  amount,
  is_synced = false,
  date,
  type,
}: Omit<ExpenseRecord, 'created_at'>) {
  await db.runAsync(
    `INSERT INTO expenses (id, title, amount, is_synced, date, type) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, amount, is_synced ? 1 : 0, date, type ]
  );
}



// ✅ READ ALL
// export async function getAllExpenses(): Promise<ExpenseRecord[]> {
//     const allRows = await db.getAllAsync('SELECT * FROM expenses');
  
//     // Optional: Log rows properly
//     for (const row of allRows) {
//       console.log(row.id, row.title, row.amount);
//     }
  
//     // Proper transformation & type enforcement
//     return allRows.map((row:any) => ({
//       id: row.id,
//       title: row.title,
//       amount: row.amount,
//       created_at: row.created_at,
//       is_synced: Boolean(row.is_synced),
//     }));
//   }
  
// ✅ READ ALL (SOFT DELETE)
// This function retrieves all expenses that are not marked as deleted and orders them by creation date in descending order.
  export async function getAllExpenses(): Promise<ExpenseRecord[]> {
    const rows = await db.getAllAsync(
      'SELECT * FROM expenses WHERE is_deleted = 0 ORDER BY created_at DESC'
    );
  
    return rows.map(row => ({
      ...row,
      is_synced: Boolean(row.is_synced),
      is_deleted: Boolean(row.is_deleted),
    }));
  }
  


// ✅ READ ONE
export async function getExpenseById(id: string): Promise<ExpenseRecord | undefined> {
  const row = await db.getFirstAsync(`SELECT * FROM expenses WHERE id = ?`, [id]) as Partial<ExpenseRecord>;
  return row && row.id && row.title && row.amount && row.created_at
    ? { ...row, is_synced: Boolean(row.is_synced) } as ExpenseRecord
    : undefined;
}

export async function updateExpense({
  id,
  title,
  amount,
  is_synced,
  date,
  type,
}: Omit<ExpenseRecord, 'created_at'>) {
  await db.runAsync(
    `UPDATE expenses SET title = ?, amount = ?, is_synced = ?, date = ?, type = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [title, amount, is_synced ? 1 : 0, date, type, id]
  );
}

// ✅ DELETE
// export async function deleteExpense(id: string) {
//   await db.runAsync(`DELETE FROM expenses WHERE id = ?`, [id]);
// }

// ✅ DELETE (SOFT DELETE)
export async function deleteExpense(id: string) {
  await db.runAsync(
    'UPDATE expenses SET is_deleted = 1, is_synced = 0 WHERE id = ?',
    [id]
  );
}


// ✅ get All UNSYNCED
export async function getUnsyncedExpenses() {
  return await db.getAllAsync('SELECT * FROM expenses WHERE is_synced = 0');
}

// ✅ MARK AS SYNCED
export async function markAsSynced(id: string) {
  await db.runAsync('UPDATE expenses SET is_synced = 1 WHERE id = ?', [id]);
}
