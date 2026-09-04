'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { COMPETITIONS } from '@/constants/competitions';
import { 
  BarChart3, Trophy, Users, Swords, Calculator, Database, 
  Key, Activity, X, Menu, Radio, Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { 
    selectedLeague, setSelectedLeague, 
    apiKey, setApiKey, 
    isRealDataMode, setIsRealDataMode, 
    quotaUsed 
  } = useFootball();

  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const isQuotaWarning = quotaUsed >= 90;

  const handleSaveKey = () => {
    setApiKey(inputKey);
    if (inputKey.trim()) {
      setIsRealDataMode(true);
    }
    setShowKeyModal(false);
  };

  const navItems = [
    { href: '/', label: 'Tổng quan (Overview)', icon: BarChart3 },
    { href: '/competition', label: 'BXH & Giải đấu', icon: Trophy },
    { href: '/team', label: 'Phân tích Đội bóng', icon: Users },
    { href: '/match', label: 'Match Center & Live', icon: Swords },
    { href: '/betting', label: 'Odds & Kèo Châu Á', icon: Calculator },
    { href: '/etl', label: 'ETL & Quota Monitor', icon: Database },
  ];

  // Get current active tab label for header
  const activeNavItem = navItems.find(item => item.href === pathname) || navItems[0];

  return (
    <>
      {/* Mobile Top Header (Clean, Floating Top-Left Menu Trigger) */}
      <div className="lg:hidden bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
            className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="text-xs font-bold font-mono">MENU</span>
          </button>

          <span className="font-bold text-white text-xs sm:text-sm truncate">
            {activeNavItem.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 font-mono">LIVE API</span>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Left Sidebar Main Body */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-950/95 border-r border-slate-800/90 backdrop-blur-md flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base text-white tracking-wide">
                    FOOTBALL<span className="text-emerald-400">ANALYTICS</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400">
                  Data Platform • Mùa 2026/27
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* League Filter Component in Sidebar */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Bộ Lọc Giải Đấu
            </span>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => {
                  setSelectedLeague('ALL');
                  setIsMobileOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedLeague === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <span>🌍 Tất cả (6 Giải)</span>
                {selectedLeague === 'ALL' && <Sparkles className="w-3.5 h-3.5 text-slate-950" />}
              </button>

              {COMPETITIONS.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => {
                    setSelectedLeague(comp.id);
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedLeague === comp.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{comp.flag}</span>
                    <span>{comp.name}</span>
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">{comp.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 pt-2 border-t border-slate-900">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-2">
              Menu Điều Hướng
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-slate-900 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full"></span>
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar Badges & API Key Modal Switcher */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-3">
          {/* API Status Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`w-full flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
              isRealDataMode
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRealDataMode ? '🟢 LIVE API-Football' : '⚪ Real Data Mode'}</span>
            </div>
            <span className="text-[10px] text-slate-500 underline">Cấu hình</span>
          </button>

          {/* Quota Indicator */}
          <div className={`flex items-center justify-between text-xs font-mono px-3 py-2 rounded-xl border ${
            isQuotaWarning
              ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
              : 'bg-slate-900 text-slate-300 border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quota API</span>
            </div>
            <span className={`font-bold ${isQuotaWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
              {quotaUsed}/100
            </span>
          </div>
        </div>
      </aside>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Cấu Hình Kết Nối API-Football</span>
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              API Key từ API-Football (hoặc RapidAPI) để đồng bộ tỷ số thời gian thực.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">API Key:</label>
              <input
                type="password"
                placeholder="Dán API Key tại đây..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRealDataMode}
                  onChange={(e) => setIsRealDataMode(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Kích hoạt Dữ Liệu Real API</span>
              </label>

              <button
                onClick={handleSaveKey}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all"
              >
                Lưu & Kết Nối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
