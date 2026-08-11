import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/infoboard';

const isProduction = process.env.NODE_ENV === 'production';

const globalForPg = globalThis as unknown as { __pgPool?: Pool };

if (!globalForPg.__pgPool) {
  globalForPg.__pgPool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: isProduction && process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
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
