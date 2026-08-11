import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hash = await hashPassword(password);
    const user = await queryOne<{ id: string; email: string; display_name: string }>(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name`,
      [email, hash, displayName || 'Administrator']
    );

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      display_name: user.display_name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, display_name: user.display_name },
    });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
