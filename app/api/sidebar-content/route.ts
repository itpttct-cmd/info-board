import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function detectType(file: File): 'image' | 'excel' | null {
  if (file.type.startsWith('image/')) return 'image';
  if (
    file.type.includes('spreadsheet') ||
    file.type.includes('excel') ||
    file.type === 'text/csv' ||
    /\.(xlsx|xls|csv)$/i.test(file.name)
  )
    return 'excel';
  if (/\.(png|jpe?g|webp)$/i.test(file.name)) return 'image';
  return null;
}

export async function GET() {
  const rows = await query(
    `SELECT * FROM sidebar_content ORDER BY position, sort_order`
  );
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const position = formData.get('position') as string;
    const title = formData.get('title') as string;
    const contentType = formData.get('contentType') as string; // 'file' | 'text'
    const textContent = (formData.get('textContent') as string) || null;
    
    // --- BACA DATA isScroll (Default true jika tidak disertakan) ---
    const isScrollParam = formData.get('isScroll');
    const isScroll = isScrollParam !== null ? isScrollParam === 'true' : true;

    const file = formData.get('file') as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let dbContentType: 'image' | 'excel' | 'text' = 'text';

    if (contentType === 'text') {
      dbContentType = 'text';
    } else if (file) {
      const type = detectType(file);
      if (!type) {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        );
      }
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
      }
      const ext = file.name.split('.').pop();
      const savedName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, savedName);
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));
      fileUrl = `/uploads/${savedName}`;
      fileName = file.name;
      dbContentType = type;
    } else {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // --- INSERT DENGAN MENGGUNAKAN KOLOM is_scroll ---
    const row = await queryOne(
      `INSERT INTO sidebar_content (position, title, content_type, file_url, file_name, text_content, is_scroll, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM sidebar_content WHERE position = $1))
       RETURNING *`,
      [position, title.trim(), dbContentType, fileUrl, fileName, textContent, isScroll]
    );

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, is_active, is_scroll } = body;

    // Toggle status is_active
    if (typeof is_active === 'boolean') {
      const row = await queryOne(
        'UPDATE sidebar_content SET is_active = $1 WHERE id = $2 RETURNING *',
        [is_active, id]
      );
      return NextResponse.json(row);
    }

    // Toggle status is_scroll (jika ingin diubah terpisah)
    if (typeof is_scroll === 'boolean') {
      const row = await queryOne(
        'UPDATE sidebar_content SET is_scroll = $1 WHERE id = $2 RETURNING *',
        [is_scroll, id]
      );
      return NextResponse.json(row);
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

    const row = await queryOne<{ file_url: string }>(
      'SELECT file_url FROM sidebar_content WHERE id = $1',
      [id]
    );

    await query('DELETE FROM sidebar_content WHERE id = $1', [id]);

    if (row?.file_url?.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', row.file_url);
      try {
        await unlink(filePath);
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}