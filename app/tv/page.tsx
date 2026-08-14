// app/tv/page.tsx
import { TvBoardDisplay } from '@/components/display/tv-board-display';

export const dynamic = 'force-dynamic';

async function getDisplayData() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'https://infoboard-tct.vercel.app';

  try {
    const [boardRes, sidebarRes, textsRes] = await Promise.all([
      fetch(`${baseUrl}/api/board-content`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/sidebar-content`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/running-text`, { cache: 'no-store' }),
    ]);

    return {
      boardContent: boardRes.ok ? await boardRes.json() : [],
      sidebarContent: sidebarRes.ok ? await sidebarRes.json() : [],
      runningTexts: textsRes.ok ? await textsRes.json() : [],
    };
  } catch (error) {
    return { boardContent: [], sidebarContent: [], runningTexts: [] };
  }
}

export default async function TvPage() {
  const { boardContent, sidebarContent, runningTexts } = await getDisplayData();

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased overflow-hidden">
        <TvBoardDisplay
          boardContent={boardContent}
          sidebarContent={sidebarContent}
          runningTexts={runningTexts}
        />
      </body>
    </html>
  );
}