import { Pool } from 'pg';

const rawConnectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/infoboard';

// Cek apakah koneksi diarahkan ke database lokal (pgAdmin) atau Supabase/Cloud
const isLocalhost =
  rawConnectionString.includes('localhost') ||
  rawConnectionString.includes('127.0.0.1');

const globalForPg = globalThis as unknown as { __pgPool?: Pool };

if (!globalForPg.__pgPool) {
  globalForPg.__pgPool = new Pool({
    connectionString: rawConnectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    // Jika BUKAN localhost (yaitu Supabase), aktifkan SSL. 
    // Jika localhost (pgAdmin lokal), matikan SSL.
    ssl: !isLocalhost ? { rejectUnauthorized: false } : false,
  });
}

export const pool = globalForPg.__pgPool;

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}