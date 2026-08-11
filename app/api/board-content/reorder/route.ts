import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, direction } = body;
    const dir = direction as 'up' | 'down';

    const rows = await query<{ id: string; sort_order: number }>(
      'SELECT id, sort_order FROM board_content ORDER BY sort_order'
    );

    const currentIndex = rows.findIndex((r) => r.id === id);
    if (currentIndex < 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const swapIndex = dir === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= rows.length) {
      return NextResponse.json({ error: 'Cannot move' }, { status: 400 });
    }

    const current = rows[currentIndex];
    const swap = rows[swapIndex];

    await query('UPDATE board_content SET sort_order = $1 WHERE id = $2', [
      swap.sort_order,
      current.id,
    ]);
    await query('UPDATE board_content SET sort_order = $1 WHERE id = $2', [
      current.sort_order,
      swap.id,
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
