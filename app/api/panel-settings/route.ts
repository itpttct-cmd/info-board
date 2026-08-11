import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await query('SELECT * FROM panel_settings ORDER BY position');
  return NextResponse.json(rows);
}

export async function PUT(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { position, title } = body;

    if (!position || !title?.trim()) {
      return NextResponse.json({ error: 'Position and title required' }, { status: 400 });
    }

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM panel_settings WHERE position = $1',
      [position]
    );

    let row;
    if (existing) {
      row = await queryOne(
        'UPDATE panel_settings SET title = $1, updated_at = now() WHERE position = $2 RETURNING *',
        [title.trim(), position]
      );
    } else {
      row = await queryOne(
        'INSERT INTO panel_settings (position, title) VALUES ($1, $2) RETURNING *',
        [position, title.trim()]
      );
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
