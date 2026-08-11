'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { DisplayHeader } from '@/components/display/display-header';
import { ContentCard } from '@/components/display/content-card';
import { SidebarPanel } from '@/components/display/sidebar-panel';
import { RunningTextFooter } from '@/components/display/running-text-footer';
import type { BoardContent, RunningText, SidebarContent, PanelSetting } from '@/lib/types';
import type { SidebarPosition } from '@/lib/types';

export default function DisplayPage() {
  const [boardContent, setBoardContent] = useState<BoardContent[]>([]);
  const [sidebarContent, setSidebarContent] = useState<SidebarContent[]>([]);
  const [panelSettings, setPanelSettings] = useState<PanelSetting[]>([]);
  const [runningTexts, setRunningTexts] = useState<RunningText[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [boardRes, sidebarRes, panelsRes, textsRes] = await Promise.all([
      fetch('/api/board-content', { cache: 'no-store' }),
      fetch('/api/sidebar-content', { cache: 'no-store' }),
      fetch('/api/panel-settings', { cache: 'no-store' }),
      fetch('/api/running-text', { cache: 'no-store' }),
    ]);

    const board = await boardRes.json();
    const sidebar = await sidebarRes.json();
    const panels = await panelsRes.json();
    const texts = await textsRes.json();

    if (board) setBoardContent(board);
    if (sidebar) setSidebarContent(sidebar);
    if (panels) setPanelSettings(panels);
    if (texts) setRunningTexts(texts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="grid-bg flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading Information Board...</p>
        </div>
      </div>
    );
  }

  const panelTitle = (pos: SidebarPosition, fallback: string) =>
    panelSettings.find((p) => p.position === pos)?.title ?? fallback;

  const getItems = (pos: SidebarPosition) =>
    sidebarContent.filter((c) => c.position === pos);

  return (
    <div className="grid-bg flex min-h-screen w-full flex-col overflow-hidden bg-background">
      <DisplayHeader />

      {/* Main content area */}
      <main className="flex flex-1 flex-col gap-3 p-3 lg:flex-row lg:overflow-hidden">
        {/* Left sidebar */}
        {/* <aside className="order-2 flex w-full flex-col gap-3 lg:order-1 lg:w-[240px] lg:shrink-0">
          <SidebarPanel
            title={panelTitle('left_top', 'Sidebar Kiri Atas')}
            position="left_top"
            items={getItems('left_top')}
          />
          <SidebarPanel
            title={panelTitle('left_bottom', 'Sidebar Kiri Bawah')}
            position="left_bottom"
            items={getItems('left_bottom')}
          />
        </aside> */}

        {/* Left sidebar */}
        <aside className="order-2 flex w-full flex-col gap-3 lg:order-1 lg:w-[240px] lg:shrink-0">
          <SidebarPanel items={getItems('left_top')} />
          <SidebarPanel items={getItems('left_bottom')} />
        </aside>

        {/* Center: single board content slider */}
        {/* FIX 1: Menghapus syntax CSS invalid "object-fit: contain" di atribut className */}
        <div className="flex flex-1 flex-col lg:order-2 lg:overflow-hidden">
          <BoardSlider content={boardContent} intervalMs={15000} />
        </div>

        {/* Right sidebar */}
        {/* <aside className="order-3 flex w-full flex-col gap-3 lg:w-[240px] lg:shrink-0">
          <SidebarPanel
            title={panelTitle('right_top', 'Sidebar Kanan Atas')}
            position="right_top"
            items={getItems('right_top')}
          />
          <SidebarPanel
            title={panelTitle('right_bottom', 'Sidebar Kanan Bawah')}
            position="right_bottom"
            items={getItems('right_bottom')}
          />
        </aside> */}

        {/* Right sidebar */}
        <aside className="order-3 flex w-full flex-col gap-3 lg:w-[240px] lg:shrink-0">
          <SidebarPanel items={getItems('right_top')} />
          <SidebarPanel items={getItems('right_bottom')} />
        </aside>
      </main>

      <RunningTextFooter items={runningTexts} />
    </div>
  );
}

// function BoardSlider({
//   content,
//   intervalMs,
// }: {
//   content: BoardContent[];
//   intervalMs: number;
// }) {
//   const [index, setIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // Navigasi Manual
//   const handlePrev = () => {
//     setIndex((prev) => (prev === 0 ? content.length - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setIndex((prev) => (prev + 1) % content.length);
//   };

//   useEffect(() => {
//     if (index >= content.length && content.length > 0) setIndex(0);
//   }, [content.length, index]);

//   useEffect(() => {
//     if (isPaused || content.length <= 1) return;
//     timerRef.current = setInterval(() => {
//       setIndex((prev) => (prev + 1) % content.length);
//     }, intervalMs);
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [isPaused, content.length, intervalMs, index]);

//   if (content.length === 0) {
//     return (
//       <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur text-muted-foreground/60">
//         <p className="text-sm">No content available</p>
//         <p className="text-xs">Upload files via admin dashboard</p>
//       </div>
//     );
//   }

//   const current = content[index];

//   return (
//     <div
//       className="group relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur lg:min-h-0"
//       onMouseEnter={() => setIsPaused(true)}
//       onMouseLeave={() => setIsPaused(false)}
//     >
//       {/* Title bar dengan Tombol Navigasi Panah (< >) */}
//       <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-4 py-2 backdrop-blur">
//         <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
//           {current.title}
//         </h3>
        
//         {/* FIX 2: Menambahkan Tombol Panah Navigasi Kiri & Kanan */}
//         <div className="flex items-center gap-2">
//           {content.length > 1 && (
//             <div className="flex items-center gap-1.5">
//               <button
//                 onClick={handlePrev}
//                 className="rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
//                 title="Previous"
//               >
//                 &lt;
//               </button>
              
//               <span className="text-[10px] font-medium text-muted-foreground">
//                 {index + 1}/{content.length}
//               </span>

//               <button
//                 onClick={handleNext}
//                 className="rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
//                 title="Next"
//               >
//                 &gt;
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Content Area */}
//       <div className="flex-1 pt-10 pb-2 px-2 h-full flex items-center justify-center">
//         <div key={index} className="h-full w-full animate-slide-fade flex items-center justify-center">
//           <ContentCard content={current} />
//         </div>
//       </div>

//       {isPaused && (
//         <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur">
//           Paused
//         </div>
//       )}
//     </div>
//   );
// }





// ----- kode gemini dong ------
function BoardSlider({
  content,
  intervalMs,
}: {
  content: BoardContent[];
  intervalMs: number;
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- STATE UNTUK SLIPE / DRAG KURSOR ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Jarak minimal geser (pixel) untuk memicu perpindahan slide
  const minSwipeDistance = 50;

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? content.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % content.length);
  };

  // Autoplay Effect
  useEffect(() => {
    if (index >= content.length && content.length > 0) setIndex(0);
  }, [content.length, index]);

  useEffect(() => {
    if (isPaused || content.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % content.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, content.length, intervalMs, index]);

  // --- HANDLER SWIPE & DRAG MOUSE / TOUCH ---
  const handleStart = (clientX: number) => {
    setIsPaused(true);
    setIsDragging(true);
    setTouchStart(clientX);
    setTouchEnd(null);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    setTouchEnd(clientX);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setIsPaused(false);

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext(); // Geser ke kiri -> Slide selanjutnya
    } else if (isRightSwipe) {
      handlePrev(); // Geser ke kanan -> Slide sebelumnya
    }
  };

  if (content.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur text-muted-foreground/60">
        <p className="text-sm">No content available</p>
        <p className="text-xs">Upload files via admin dashboard</p>
      </div>
    );
  }

  const current = content[index];

  return (
    <div
      className="group relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur lg:min-h-0 select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsDragging(false);
      }}
      // Event Listener Mouse Drag (Untuk Kursor PC/Laptop)
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      // Event Listener Touch (Untuk Layar HP/Tablet)
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Title bar & Button Prev/Next */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-4 py-2 backdrop-blur">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          {current.title}
        </h3>

        <div className="flex items-center gap-2">
          {content.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah bentrok dengan drag
                  handlePrev();
                }}
                className="rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Previous"
              >
                &lt;
              </button>

              <span className="text-[10px] font-medium text-muted-foreground">
                {index + 1}/{content.length}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah bentrok dengan drag
                  handleNext();
                }}
                className="rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Next"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Area Gambar Tengah */}
      <div className="flex-1 pt-10 pb-2 px-2 w-full min-h-[350px] lg:min-h-0 flex items-center justify-center">
        <div key={index} className="h-full w-full animate-slide-fade flex items-center justify-center pointer-events-none">
          <ContentCard content={current} />
        </div>
      </div>

      {isPaused && (
        <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur pointer-events-none">
          Paused
        </div>
      )}
    </div>
  );
}