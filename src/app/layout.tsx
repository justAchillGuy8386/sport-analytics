import type { Metadata } from 'next';
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
  keywords: ['Football Analytics', 'Premier League 2026/27', 'La Liga', 'UEFA Champions League', 'Asian Handicap Settlement', 'API-Football'],
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
          <div className="flex min-h-screen">
            {/* Left Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-400 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      FA
                    </div>
                    <span className="font-bold text-white">Football Analytics Platform</span>
                    <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
                    <span>Next.js 15 App Router</span>
                    <span>•</span>
                    <span>Tailwind CSS</span>
                    <span>•</span>
                    <span>API-Football Integration</span>
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
