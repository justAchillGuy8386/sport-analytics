'use client';

import React, { useState } from 'react';
import { COMPETITIONS } from '@/data/mockData';
import { LeagueCode } from '@/types/football';
import { Activity, BarChart3, Trophy, Users, Swords, Calculator, Database, Key, CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ActiveTab = 'overview' | 'competition' | 'team' | 'match' | 'betting' | 'etl';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedLeague: LeagueCode | 'ALL';
  setSelectedLeague: (league: LeagueCode | 'ALL') => void;
  quotaUsed: number;
  apiKey: string;
  setApiKey: (key: string) => void;
  isRealDataMode: boolean;
  setIsRealDataMode: (real: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedLeague,
  setSelectedLeague,
  quotaUsed,
  apiKey,
  setApiKey,
  isRealDataMode,
  setIsRealDataMode
}) => {
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const isQuotaWarning = quotaUsed >= 90;

  const handleSaveKey = () => {
    setApiKey(inputKey);
    if (inputKey.trim()) {
      setIsRealDataMode(true);
    }
    setShowKeyModal(false);
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 transition-all">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-white tracking-wide">
                  FOOTBALL<span className="text-emerald-400">ANALYTICS</span>
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Mùa 2026/27
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                European Top 5 Leagues & UEFA Champions League Data Platform
              </p>
            </div>
          </div>

          {/* API Mode & Quota Guard Badge */}
          <div className="flex items-center gap-3">
            {/* Live Real Data vs Mock Badge */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                isRealDataMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRealDataMode ? '🟢 LIVE API-Football' : '🟡 Demo Mock Data'}</span>
            </button>

            <div className={`hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
              isQuotaWarning
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}>
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Quota: <strong className={isQuotaWarning ? 'text-amber-400' : 'text-emerald-400'}>{quotaUsed}/100</strong></span>
            </div>
          </div>
        </div>

        {/* Competition Quick Selector Filter */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-slate-900 text-xs">
          <button
            onClick={() => setSelectedLeague('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedLeague === 'ALL'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            🌍 Tất cả (6 Giải)
          </button>
          {COMPETITIONS.map(comp => (
            <button
              key={comp.id}
              onClick={() => setSelectedLeague(comp.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedLeague === comp.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{comp.flag}</span>
              <span>{comp.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-900 pt-1 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng quan (Overview)', icon: BarChart3 },
            { id: 'competition', label: 'BXH & Giải đấu', icon: Trophy },
            { id: 'team', label: 'Phân tích Đội bóng', icon: Users },
            { id: 'match', label: 'Match Center & Live', icon: Swords },
            { id: 'betting', label: 'Odds & Kèo Châu Á', icon: Calculator },
            { id: 'etl', label: 'ETL & Quota Monitor', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

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
              Nhập **API Key** của bạn từ API-Football (hoặc RapidAPI) để lấy dữ liệu tỷ số, trận đấu đang đá ngoài đời thực.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">API Key (API-Sports / RapidAPI):</label>
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
    </header>
  );
};
