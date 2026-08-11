'use client';

import { useEffect, useState, useRef } from 'react';
import { Megaphone } from 'lucide-react';
import type { RunningText } from '@/lib/types';

export function RunningTextFooter({ items }: { items: RunningText[] }) {
  const activeTexts = items.filter((i) => i.is_active);
  const text =
    activeTexts.length > 0
      ? activeTexts
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((t) => t.text)
          .join('   •   ')
      : 'Welcome to Information Board — No announcements at this time';

  return (
    <footer className="flex items-center gap-3 border-t border-border bg-gradient-to-r from-card via-card/90 to-card px-4 py-2">
      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-primary/15 px-3 py-1">
        <Megaphone className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Info
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-sm font-medium text-foreground/90">
          {text}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="h-2 w-2 animate-live-pulse rounded-full bg-chart-2" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Live
        </span>
      </div>
    </footer>
  );
}
