// app/tv/page.tsx
import { TvBoardDisplay } from '@/components/display/tv-board-display';
// Contoh jika kamu pakai Prisma atau Supabase Client langsung:
// import { prisma } from '@/lib/prisma'; 
// atau import { supabase } from '@/lib/supabase';

// 🛑 Mencegah Vercel melakukan build-time prerender
export const dynamic = 'force-dynamic';

// Fungsi panggil data langsung dari Database (Bukan via HTTP fetch)
async function getData() {
  try {
    /* 
      JIKA MENGGUNAKAN PRISMA:
      const [boardContent, sidebarContent, runningTexts] = await Promise.all([
        prisma.boardContent.findMany(),
        prisma.sidebarContent.findMany(),
        prisma.runningText.findMany(),
      ]);
      return { boardContent, sidebarContent, runningTexts };
    */

    /* 
      JIKA MENGGUNAKAN SUPABASE CLIENT:
      const [boardRes, sidebarRes, textsRes] = await Promise.all([
        supabase.from('board_content').select('*'),
        supabase.from('sidebar_content').select('*'),
        supabase.from('running_text').select('*'),
      ]);
      return {
        boardContent: boardRes.data || [],
        sidebarContent: sidebarRes.data || [],
        runningTexts: textsRes.data || [],
      };
    */

    // FALLBACK JIKA MASIH MAU PAKAI FETCH (Gunakan absolute URL aman untuk Vercel):
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    const [boardRes, sidebarRes, textsRes] = await Promise.all([
      fetch(`${baseUrl}/api/board-content`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/sidebar-content`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/running-text`, { cache: 'no-store' }),
    ]);

    return {
      boardContent: await boardRes.json(),
      sidebarContent: await sidebarRes.json(),
      runningTexts: await textsRes.json(),
    };
  } catch (e) {
    console.error('Error fetching TV data:', e);
    return { boardContent: [], sidebarContent: [], runningTexts: [] };
  }
}

export default async function TvPage({
  searchParams,
}: {
  searchParams: Promise<{ slide?: string }>;
}) {
  const { boardContent, sidebarContent, runningTexts } = await getData();

  const resolvedParams = await searchParams;
  const currentIndex = Number(resolvedParams?.slide) || 0;
  const totalSlides = boardContent.length || 1;
  const nextIndex = (currentIndex + 1) % totalSlides;
  const intervalSeconds = 15;

  return (
    <>
      <head>
        <meta
          httpEquiv="refresh"
          content={`${intervalSeconds};url=/tv?slide=${nextIndex}`}
        />
      </head>

      <TvBoardDisplay
        boardContent={boardContent}
        sidebarContent={sidebarContent}
        runningTexts={runningTexts}
        currentIndex={currentIndex}
      />
    </>
  );
}