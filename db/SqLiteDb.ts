import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('expenses.db'); // Open or create the SQLite database

export async function createTable() {
  await db.execAsync(`
    PRAGMA journal_mode=WAL;  -- Set the journal mode for better performance and reliability
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,        -- Unique ID (UUID)
      title TEXT NOT NULL,                 -- Expense title (text)
      amount INTEGER NOT NULL,             -- Expense amount (integer)
      is_synced INTEGER NOT NULL DEFAULT 0,  -- Sync status (0 = unsynced, 1 = synced)
      is_deleted INTEGER NOT NULL DEFAULT 0, -- Soft delete status (0 = not deleted, 1 = deleted)
      date TEXT NOT NULL,                -- Date of the expense (text)
      type TEXT NOT NULL,  -- Type of the transaction 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of creation
    );
  `);
}
