import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'World Football Analytics Platform | Mùa Giải 2026/27',
  description: 'Nền tảng phân tích dữ liệu bóng đá 6 giải đấu hàng đầu châu Âu mùa 2026/27. Standings, Team Analytics, Match Center, Máy tính Kèo Châu Á & Smart Polling Pipeline.',
  keywords: ['Football Analytics', 'Premier League 2026/27', 'La Liga', 'UEFA Champions League', 'Asian Handicap Settlement', 'API-Football'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
