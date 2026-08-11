import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await query('SELECT * FROM running_text ORDER BY sort_order');
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { text } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const row = await query(
      `INSERT INTO running_text (text, is_active, sort_order)
       VALUES ($1, true, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM running_text))
       RETURNING *`,
      [text.trim()]
    );

    return NextResponse.json(row[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to add' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (typeof is_active === 'boolean') {
      const row = await query(
        'UPDATE running_text SET is_active = $1 WHERE id = $2 RETURNING *',
        [is_active, id]
      );
      return NextResponse.json(row[0]);
    }

    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await query('DELETE FROM running_text WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
