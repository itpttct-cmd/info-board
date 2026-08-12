import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { put, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';
// Memperpanjang batas waktu eksekusi request upload file
export const maxDuration = 60; 

function detectType(file: File): 'image' | 'excel' | 'pdf' | null {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    return 'pdf';
  }
  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name)) {
    return 'image';
  }
  if (
    file.type.includes('spreadsheet') ||
    file.type.includes('excel') ||
    file.type === 'text/csv' ||
    /\.(xlsx|xls|csv)$/i.test(file.name)
  ) {
    return 'excel';
  }
  return null;
}

export async function GET() {
  const rows = await query(
    `SELECT * FROM board_content ORDER BY sort_order, created_at`
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
    const title = formData.get('title') as string;
    const file = formData.get('file') as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const type = detectType(file);
    if (!type) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use PNG, JPG, JPEG, PDF, or Excel.' },
        { status: 400 }
      );
    }

    // 1. Upload file ke Vercel Blob menggantikan fs.writeFile
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: 'private',
    });

    // URL HTTPS publik langsung dari Vercel Blob Storage
    const fileUrl = blob.url;

    // 2. Simpan URL ke Database Postgres (Lokal maupun Supabase)
    const row = await queryOne(
      `INSERT INTO board_content (section, slot_key, title, content_type, file_url, file_name, is_active, sort_order)
       VALUES (null, null, $1, $2, $3, $4, true, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM board_content))
       RETURNING *`,
      [title.trim(), type, fileUrl, file.name]
    );

    return NextResponse.json(row);
  } catch (err: any) {
    console.error('CRITICAL UPLOAD ERROR:', err);

    return NextResponse.json(
      { error: err?.message || 'Upload failed' },
      { status: 500 }
    );
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
      const row = await queryOne(
        'UPDATE board_content SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING *',
        [is_active, id]
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
      'SELECT file_url FROM board_content WHERE id = $1',
      [id]
    );

    await query('DELETE FROM board_content WHERE id = $1', [id]);

    // Hapus file dari Vercel Blob jika merupakan URL Blob
    if (row?.file_url?.includes('vercel-storage.com')) {
      try {
        await del(row.file_url);
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}