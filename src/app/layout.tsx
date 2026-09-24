import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { FootballProvider } from '@/context/FootballContext';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Football Analytics Platform | Mùa Giải 2026/27',
  description: 'Nền tảng phân tích dữ liệu bóng đá 6 giải đấu hàng đầu châu Âu mùa 2026/27. Standings, Team Analytics, Match Center, Máy tính Kèo Châu Á & Smart Polling Pipeline.',
  keywords: ['Football Analytics', 'Premier League 2026/27', 'La Liga', 'UEFA Champions League', 'Asian Handicap Settlement', 'Goal API'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <FootballProvider>
          <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Sidebar Navigation & Mobile Top Bar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in-up">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-400 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                    <img src="/icon.svg" alt="Football Analytics Logo" className="w-5 h-5 rounded object-contain shrink-0" />
                    <span className="font-bold text-white">Football Analytics Platform</span>
                    <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
                    <span>2026 Sport Analytics</span>
                    <span>•</span>
                    <span>All rights reserved</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </FootballProvider>
      </body>
    </html>
  );
}
