'use client';

import { useEffect, useState } from 'react';

const CITIES = [
  { label: 'JKT', fullLabel: 'Jakarta', tz: 'Asia/Jakarta' },
  { label: 'TYO', fullLabel: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'LON', fullLabel: 'London', tz: 'Europe/London' },
  { label: 'NYC', fullLabel: 'New York City', tz: 'America/New_York' },
];

function formatTime(tz: string) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(new Date());
}

function formatDate(tz: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: tz,
  }).format(new Date());
}

export function DisplayHeader() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-border bg-card/80 px-3 py-2 backdrop-blur-xl sm:px-4 md:px-6 md:py-3">
      {/* Container Utama:
          - HP (< sm): Stack vertikal (flex-col) berurutan rapi
          - Tablet & Desktop (>= sm): Grid / Flex horizontal 
      */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        
        {/* --- KIRI: Logo & Nama Perusahaan --- */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted md:h-10 md:w-10">
              <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="h-full w-full object-contain p-0.5" 
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs font-bold tracking-tight text-foreground sm:text-sm md:text-base">
                PT Tri Cipta Teknindo
              </h1>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground sm:text-[10px]">
                Real-time Display
              </span>
            </div>
          </div>

          {/* Di HP: Tampilkan Judul "INFORMATION BOARD" Kecil di Kanan Logo */}
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-primary sm:hidden">
            INFO BOARD
          </span>
        </div>

        {/* --- TENGAH: Judul Utama (Khusus Layar Sedang & Besar / Tablet & Desktop) --- */}
        <div className="hidden text-center sm:block lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <h2 className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-sm font-bold tracking-wider text-transparent md:text-lg lg:text-xl">
            INFORMATION BOARD
          </h2>
        </div>

        {/* --- KANAN: Tanggal & Jam Dunia (World Clock) --- */}
        <div className="flex flex-col items-start border-t border-border/50 pt-1.5 sm:items-end sm:border-t-0 sm:pt-0">
          {/* Tanggal Realtime */}
          <div className="text-[10px] font-semibold text-foreground sm:text-xs md:text-sm">
            {formatDate('Asia/Jakarta')}
          </div>

          {/* World Clock Grid:
              - Di HP (< sm): Tampilkan singkat dengan singkatan (JKT, TYO, LON, NYC)
              - Di Desktop (>= md): Tampilkan nama kota lengkap
          */}
          <div className="mt-0.5 flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-0.5 font-mono text-[9px] sm:w-auto sm:justify-end sm:text-[10px] md:gap-3 md:text-xs">
            {CITIES.map((city) => (
              <div key={city.tz} className="flex items-center gap-1">
                {/* Singkatan di HP, Nama Lengkap di Layar Lebih Besar */}
                <span className="text-muted-foreground md:hidden">{city.label}</span>
                <span className="hidden text-muted-foreground md:inline">{city.fullLabel}</span>
                <span className="font-semibold text-primary">{formatTime(city.tz)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </header>
  );
}