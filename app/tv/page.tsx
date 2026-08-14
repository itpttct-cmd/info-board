// app/tv/page.tsx
import { TvBoardDisplay } from '@/components/display/tv-board-display';

export const dynamic = 'force-dynamic';

export default function TvPage() {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased overflow-hidden">
        <TvBoardDisplay />
      </body>
    </html>
  );
}