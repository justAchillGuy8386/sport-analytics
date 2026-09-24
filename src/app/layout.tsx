import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { FootballProvider } from '@/context/FootballContext';
import { Sidebar } from '@/components/Sidebar';
import { Mail } from 'lucide-react';

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

              {/* Page Footer */}
              <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-xs text-slate-400 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Copyright Notice (thay cho phần Liên hệ & kết nối) */}
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                    <span>2026 Sport Analytics</span>
                    <span>•</span>
                    <span>All rights reserved</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 font-medium text-xs mr-1">Contact:</span>

                    {/* 1. EMAIL: Thay 'mailto:your-email@example.com' bằng email của bạn */}
                    <a
                      href="mailto:nguyenkien18102004@gmail.com"
                      className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-200 group"
                      title="Email"
                      aria-label="Email"
                    >
                      <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>

                    <a
                      href="https://github.com/justAchillGuy8386"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-purple-400 hover:border-purple-500/40 hover:bg-slate-900 transition-all duration-200 group"
                      title="GitHub"
                      aria-label="GitHub"
                    >
                      <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>

                    <a
                      href="https://facebook.com/nngkiennx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-blue-500 hover:border-blue-500/40 hover:bg-slate-900 transition-all duration-200 group"
                      title="Facebook"
                      aria-label="Facebook"
                    >
                      <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
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
