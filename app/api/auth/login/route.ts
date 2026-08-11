import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await queryOne<{ id: string; email: string; display_name: string; password_hash: string }>(
      'SELECT id, email, display_name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
