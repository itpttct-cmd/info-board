'use client';

import { useEffect, useState, useRef } from 'react';
import { ContentCard } from '@/components/display/content-card';
import type { SidebarContent } from '@/lib/types';

interface SidebarPanelProps {
  items: SidebarContent[];
  // `title` dan `position` dibuat opsional karena judul sekarang diambil dari item
  title?: string;
  position?: string;
  intervalMs?: number;
}

export function SidebarPanel({ items, intervalMs = 25000 }: SidebarPanelProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- SWIPE / DRAG STATE ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const minSwipeDistance = 40;

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  // Auto Slider Effect
  useEffect(() => {
    if (index >= items.length && items.length > 0) setIndex(0);
  }, [items.length, index]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, items.length, intervalMs, index]);

  // Handlers Swipe/Drag
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
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
  };

  // Jika tidak ada konten
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-1 min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card/50 p-4 text-center backdrop-blur">
        <p className="text-xs font-medium text-muted-foreground/60">No content</p>
      </div>
    );
  }

  const current = items[index];

  return (
    <div
      className="group relative flex flex-1 min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsDragging(false);
      }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* 
        TITLE BAR DINAMIS:
        Judul sekarang mengambil dari `current.title` (Judul item yang diinput)
      */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-3 py-1.5 backdrop-blur">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate pr-2">
          {current.title || 'Untitled'}
        </h3>

        {/* Indikator & Navigasi Panah < 1/2 > */}
        {items.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Previous"
            >
              &lt;
            </button>

            <span className="text-[10px] font-medium text-muted-foreground">
              {index + 1}/{items.length}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Next"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* AREA KONTEN / GAMBAR */}
      <div className="flex-1 pt-8 pb-2 px-2 w-full h-full flex items-center justify-center">
        <div key={index} className="h-full w-full animate-slide-fade flex items-center justify-center pointer-events-none">
          {/* Menggunakan ContentCard sejenis agar penampil gambar/excel sama persis dengan layout utama */}
          <ContentCard content={current as any} />
        </div>
      </div>
    </div>
  );
}