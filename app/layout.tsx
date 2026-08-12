import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Information Board PT Tri Cipta Teknindo',
  description: 'Information Board Display System PT. Tri Cipta Teknindo',
  // 🛑 Mencegah Google & mesin pencari lain meng-indeks situs ini (Internal Only)
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}