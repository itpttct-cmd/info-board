// app/tv/page.tsx
import { TvBoardDisplay } from '@/components/display/tv-board-display';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function TvPage({
  searchParams,
}: {
  searchParams: Promise<{ slide?: string }>;
}) {
  // 💡 Ambil dari env, jika undefined/kosong gunakan hardcode fallback Supabase kamu
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://pexwvczfjxuvtofqlpcr.supabase.co';

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_48ZTp-nQwyNJiUGyp3qtLw_fonj7wBX';

  // Inisialisasi tidak akan error lagi karena URL dijamin terisi
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 🚀 Query data LANGSUNG ke Supabase
  const [boardRes, sidebarRes, textsRes] = await Promise.all([
    supabase.from('board_content').select('*').order('created_at', { ascending: false }),
    supabase.from('sidebar_content').select('*').order('created_at', { ascending: false }),
    supabase.from('running_text').select('*').order('created_at', { ascending: false }),
  ]);

  const boardContent = boardRes.data || [];
  const sidebarContent = sidebarRes.data || [];
  const runningTexts = textsRes.data || [];

  const resolvedParams = await searchParams;
  const currentIndex = Number(resolvedParams?.slide) || 0;
  const totalSlides = boardContent.length || 1;
  const nextIndex = (currentIndex + 1) % totalSlides;
  const intervalSeconds = 15;

  return (
    <html lang="en" className="dark">
      <head>
        <meta
          httpEquiv="refresh"
          content={`${intervalSeconds};url=/tv?slide=${nextIndex}`}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <TvBoardDisplay
          boardContent={boardContent}
          sidebarContent={sidebarContent}
          runningTexts={runningTexts}
          currentIndex={currentIndex}
        />
      </body>
    </html>
  );
}