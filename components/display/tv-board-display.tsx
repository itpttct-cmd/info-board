// components/display/tv-board-display.tsx
'use client';

import { useState, useEffect } from 'react';
import { DisplayHeader } from '@/components/display/display-header';
import { ContentCard } from '@/components/display/content-card';
import { SidebarPanel } from '@/components/display/sidebar-panel';
import type { BoardContent, RunningText, SidebarContent, SidebarPosition } from '@/lib/types';

interface TvBoardDisplayProps {
  initialBoard?: BoardContent[];
  initialSidebar?: SidebarContent[];
  initialTexts?: RunningText[];
}

export function TvBoardDisplay({
  initialBoard = [],
  initialSidebar = [],
  initialTexts = [],
}: TvBoardDisplayProps) {
  const [boardContent, setBoardContent] = useState<BoardContent[]>(initialBoard);
  const [sidebarContent, setSidebarContent] = useState<SidebarContent[]>(initialSidebar);
  const [runningTexts, setRunningTexts] = useState<RunningText[]>(initialTexts);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(initialBoard.length === 0);

  // 1. Fetch data langsung di Client Browser TV
  useEffect(() => {
    async function fetchData() {
      try {
        // Panggil relative URL agar aman dari masalah domain / SSL CORS di Tizen
        const [boardRes, sidebarRes, textsRes] = await Promise.all([
          fetch('/api/board-content', { cache: 'no-store' }),
          fetch('/api/sidebar-content', { cache: 'no-store' }),
          fetch('/api/running-text', { cache: 'no-store' }),
        ]);

        if (boardRes.ok) {
          const boardData = await boardRes.json();
          if (Array.isArray(boardData) && boardData.length > 0) {
            setBoardContent(boardData);
          }
        }

        if (sidebarRes.ok) {
          const sidebarData = await sidebarRes.json();
          if (Array.isArray(sidebarData) && sidebarData.length > 0) {
            setSidebarContent(sidebarData);
          }
        }

        if (textsRes.ok) {
          const textsData = await textsRes.json();
          if (Array.isArray(textsData) && textsData.length > 0) {
            setRunningTexts(textsData);
          }
        }
      } catch (error) {
        console.error('Client fetch error on TV:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Auto-refresh data dari server setiap 5 menit agar TV selalu dapat update terbaru tanpa reload
    const dataInterval = setInterval(fetchData, 300000);
    return () => clearInterval(dataInterval);
  }, []);

  // 2. Timer Auto-Slide khusus Board Content (setiap 15 detik)
  useEffect(() => {
    if (!boardContent || boardContent.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % boardContent.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [boardContent.length]);

  const getItems = (pos: SidebarPosition) =>
    sidebarContent.filter((c) => c.position === pos);

  const current = boardContent[activeSlideIndex] || boardContent[0];

  const runningTextString =
    runningTexts.map((t) => t.text).join('   —   ') ||
    'WELCOME TO PT TRI CIPTA TEKNINDO';

  return (
    <div className="dark grid-bg flex min-h-screen w-full flex-col overflow-hidden bg-[#020817]">
      <DisplayHeader />

      {/* Main content area */}
      <main className="flex flex-1 flex-col gap-3 p-3 lg:flex-row lg:overflow-hidden">
        {/* Left sidebar */}
        <aside className="order-2 flex w-full flex-col gap-3 lg:order-1 lg:w-[240px] lg:shrink-0">
          <SidebarPanel items={getItems('left_top')} />
          <SidebarPanel items={getItems('left_bottom')} />
        </aside>

        {/* Center: Board Display */}
        <div className="flex flex-1 flex-col lg:order-2 lg:overflow-hidden">
          {loading && boardContent.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur text-muted-foreground">
              <p className="text-sm font-bold animate-pulse">Memuat Data Infoboard...</p>
            </div>
          ) : boardContent.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur text-muted-foreground/60">
              <p className="text-sm">No content available</p>
              <p className="text-xs">Upload files via admin dashboard</p>
            </div>
          ) : (
            <div className="group relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur lg:min-h-0 select-none">
              {/* Title bar */}
              <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-4 py-2 backdrop-blur">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  {current?.title}
                </h3>

                {boardContent.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlideIndex((prev) =>
                          prev === 0 ? boardContent.length - 1 : prev - 1
                        )
                      }
                      className="text-xs text-muted-foreground hover:text-foreground px-1"
                    >
                      &lt;
                    </button>

                    <span className="text-[10px] font-medium text-muted-foreground">
                      {activeSlideIndex + 1}/{boardContent.length}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlideIndex((prev) => (prev + 1) % boardContent.length)
                      }
                      className="text-xs text-muted-foreground hover:text-foreground px-1"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>

              {/* Area Gambar Tengah */}
              <div className="flex-1 pt-10 pb-2 px-2 w-full min-h-[350px] lg:min-h-0 flex items-center justify-center">
                <div className="h-full w-full flex items-center justify-center pointer-events-none">
                  {current && <ContentCard content={current} />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="order-3 flex w-full flex-col gap-3 lg:w-[240px] lg:shrink-0">
          <SidebarPanel items={getItems('right_top')} />
          <SidebarPanel items={getItems('right_bottom')} />
        </aside>
      </main>

      {/* Footer Running Text Native Marquee */}
      <div className="w-full bg-card border-t border-border p-2">
        {/* @ts-ignore */}
        <marquee
          behavior="scroll"
          direction="left"
          scrollamount="4"
          className="text-sm font-bold text-primary"
        >
          📢 {runningTextString}
        </marquee>
      </div>
    </div>
  );
}