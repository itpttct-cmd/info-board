'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './content-card';
import type { BoardContent } from '@/lib/types';

interface ContentSliderProps {
  title: string;
  items: BoardContent[];
  intervalMs?: number;
}

export function ContentSlider({ title, items, intervalMs = 15000 }: ContentSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeItems = items.filter((i) => i.is_active);

  useEffect(() => {
    if (activeItems.length === 0) return;
    if (currentIndex >= activeItems.length) setCurrentIndex(0);
  }, [activeItems.length, currentIndex]);

  useEffect(() => {
    if (isPaused || activeItems.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeItems.length, intervalMs]);

  const goPrev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? activeItems.length - 1 : prev - 1
    );
  const goNext = () =>
    setCurrentIndex((prev) => (prev + 1) % activeItems.length);

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-4 py-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        {activeItems.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {currentIndex + 1}/{activeItems.length}
            </span>
            <div className="flex gap-0.5">
              {activeItems.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-4 bg-primary'
                      : 'w-1.5 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        {activeItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/60">
            <p className="text-sm">No content available</p>
            <p className="text-xs">Upload files via admin dashboard</p>
          </div>
        ) : (
          <div key={currentIndex} className="h-full w-full animate-slide-fade">
            <ContentCard content={activeItems[currentIndex]} />
          </div>
        )}

        {/* Navigation arrows */}
        {activeItems.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 opacity-0 backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 opacity-0 backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </>
        )}

        {/* Pause indicator */}
        {isPaused && activeItems.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur">
            Paused
          </div>
        )}
      </div>
    </div>
  );
}
