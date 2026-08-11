'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { BoardContent, SidebarContent } from '@/lib/types';

interface ContentCardProps {
  // Mendukung tipe BoardContent maupun SidebarContent
  content: BoardContent | SidebarContent | any;
}

export function ContentCard({ content }: ContentCardProps) {
  if (!content) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground p-4">
        <FileText className="h-10 w-10 opacity-30" />
        <p className="text-xs">No content available</p>
      </div>
    );
  }

  // URL gambar/file (Mendukung file_url atau url)
  const fileUrl = content.file_url || content.url;

  // 1. TIPE KONTEN: GAMBAR
  if (content.content_type === 'image' && fileUrl) {
    return (
      <div className="relative flex min-h-[200px] h-full w-full items-center justify-center p-2">
        <Image
          src={fileUrl}
          alt={content.title || 'Board Image'}
          fill
          className="object-contain"
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
        />
      </div>
    );
  }

  // 2. TIPE KONTEN: EXCEL
  if (content.content_type === 'excel' && fileUrl) {
    return <ExcelViewer url={fileUrl} title={content.title} />;
  }

  // 3. TIPE KONTEN: PDF
  if (content.content_type === 'pdf' && fileUrl) {
    return (
      <div className="flex h-full w-full flex-col p-2">
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0`}
          title={content.title || 'PDF Document'}
          className="h-full w-full rounded-lg border border-border"
        />
      </div>
    );
  }

  // 4. TIPE KONTEN: TEKS
  const textBody =
    content.text_content ||
    content.textContent ||
    content.text ||
    content.description ||
    content.content ||
    content.body;

  if (content.content_type === 'text' || textBody) {
    // --- EVALUASI ATAU CEK STATUS IS_SCROLL ---
    // Pengecekan ketat: Hanya aktif jika eksplisit bernilai boolean true atau string 'true'
    const shouldScroll =
      content.is_scroll === true ||
      content.isScroll === true ||
      content.is_scroll === 'true';

    return (
      <div className="flex h-full w-full flex-col p-4 overflow-hidden">
        {content.title && (
          <h4 className="mb-2 shrink-0 text-xs font-bold text-primary sm:text-sm">
            {/* {content.title} */}
          </h4>
        )}

        <div className="relative flex-1 w-full overflow-hidden">
          {shouldScroll ? (
            /* ===== MODE 1: AUTO SCROLL AKTIF (TOGGLE ON) ===== */
            <div className="absolute inset-x-0 top-0 animate-vertical-scroll flex flex-col gap-6">
              <div className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed">
                {textBody || 'Tidak ada isi teks'}
              </div>
              <div
                className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed"
                aria-hidden="true"
              >
                {textBody || 'Tidak ada isi teks'}
              </div>
            </div>
          ) : (
            /* ===== MODE 2: TEKS STATIS MURNI (TOGGLE OFF) ===== */
            <div className="h-full w-full overflow-y-auto whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed no-scrollbar">
              {textBody || 'Tidak ada isi teks'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // FALLBACK JIKA KONTEN TIDAK DIKENALI
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground p-4">
      <FileSpreadsheet className="h-10 w-10 opacity-40" />
      <p className="text-xs">No content uploaded</p>
    </div>
  );
}

function ExcelViewer({ url, title }: { url: string; title: string }) {
  const [sheets, setSheets] = useState<XLSXWorkSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (cancelled) return;
        const wb = XLSX.read(buf, { type: 'array' });
        const parsed = wb.SheetNames.map((name) => {
          const sheet = wb.Sheets[name];
          const rows = XLSX.utils.sheet_to_json<
            (string | number | boolean | null)[]
          >(sheet, { header: 1, defval: null, blankrows: false });
          return { name, rows };
        });
        setSheets(parsed);
        setActiveSheet(0);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load spreadsheet');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || sheets.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <FileSpreadsheet className="h-10 w-10 opacity-40" />
        <p className="text-sm">{error ?? 'Empty spreadsheet'}</p>
      </div>
    );
  }

  const sheet = sheets[activeSheet];
  const maxCols = Math.max(...sheet.rows.map((r) => r.length), 0);

  return (
    <div className="flex h-full w-full flex-col p-3">
      {sheets.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveSheet(i)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                i === activeSheet
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {sheet.rows.map((row, ri) => (
              <tr
                key={ri}
                className={ri === 0 ? 'bg-primary/10 font-semibold' : 'hover:bg-muted/30'}
              >
                {Array.from({ length: maxCols }).map((_, ci) => {
                  const cell = row[ci];
                  return (
                    <td
                      key={ci}
                      className={`border-r border-border/50 px-2.5 py-1.5 ${
                        ri === 0 ? 'text-primary' : 'text-foreground'
                      } ${ci === 0 ? 'border-l-0' : ''} ${
                        cell === null || cell === '' ? 'text-muted-foreground/40' : ''
                      }`}
                    >
                      {cell === null || cell === '' ? '-' : String(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 text-right text-[10px] text-muted-foreground">
        {sheet.rows.length} rows · {title}
      </div>
    </div>
  );
}

interface XLSXWorkSheet {
  name: string;
  rows: (string | number | boolean | null)[][];
}