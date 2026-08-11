'use client';

import * as XLSX from 'xlsx';

export interface ExcelSheet {
  name: string;
  rows: (string | number | boolean | null)[][];
}

export async function parseExcelFromUrl(url: string): Promise<ExcelSheet[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Excel file');
  const buffer = await res.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
      sheet,
      { header: 1, defval: null, blankrows: false }
    );
    return { name, rows };
  });
}
