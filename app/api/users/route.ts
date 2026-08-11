import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUserFromRequest, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await query(
    'SELECT id, email, display_name, created_at FROM users ORDER BY created_at'
  );
  return NextResponse.json({ users: rows });
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const row = await queryOne(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, created_at`,
      [email, hash, displayName]
    );

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
