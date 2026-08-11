'use client';

import { supabase } from '@/lib/supabase/client';

const BUCKET = 'board-media';
const ALLOWED_IMAGE = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_EXCEL = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];

export type UploadType = 'image' | 'excel';

export interface UploadResult {
  url: string;
  fileName: string;
  contentType: UploadType;
}

function detectType(file: File): UploadType | null {
  if (ALLOWED_IMAGE.includes(file.type)) return 'image';
  if (ALLOWED_EXCEL.includes(file.type)) return 'excel';
  if (file.name.match(/\.(png|jpe?g|webp)$/i)) return 'image';
  if (file.name.match(/\.(xlsx|xls|csv)$/i)) return 'excel';
  return null;
}

export async function uploadMedia(
  file: File,
  folder: string
): Promise<UploadResult> {
  const type = detectType(file);
  if (!type) {
    throw new Error(
      'Unsupported file type. Please upload PNG, JPG, JPEG, or Excel files.'
    );
  }

  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    fileName: file.name,
    contentType: type,
  };
}

export async function deleteMedia(fileUrl: string): Promise<void> {
  try {
    const url = new URL(fileUrl);
    const parts = url.pathname.split('/board-media/');
    if (parts.length < 2) return;
    const filePath = parts[1];
    await supabase.storage.from(BUCKET).remove([filePath]);
  } catch {
    // best-effort delete, don't throw on cleanup
  }
}
