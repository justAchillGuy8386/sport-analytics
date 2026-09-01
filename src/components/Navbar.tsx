'use client';

import React, { useState } from 'react';
import { COMPETITIONS } from '@/constants/competitions';
import { LeagueCode } from '@/types/football';
import { useFootball } from '@/context/FootballContext';
import { Activity, BarChart3, Trophy, Users, Swords, Calculator, Database, Key, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';

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
  const { refreshQuota } = useFootball();
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isQuotaWarning = quotaUsed >= 90;

  const handleSaveKey = () => {
    setApiKey(inputKey);
    if (inputKey.trim()) {
      setIsRealDataMode(true);
    }
    setShowKeyModal(false);
  };

  const handleManualQuotaRefresh = async () => {
    setIsRefreshing(true);
    await refreshQuota();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'competition', label: 'BXH & Giải đấu', icon: Trophy },
    { id: 'team', label: 'Phân tích Đội bóng', icon: Users },
    { id: 'match', label: 'Match Center & Live', icon: Swords },
    { id: 'betting', label: 'Odds & Kèo Châu Á', icon: Calculator },
    { id: 'etl', label: 'ETL & Quota Monitor', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-sm sm:text-base tracking-wide">
                  FOOTBALL<span className="text-emerald-400">ANALYTICS</span>
                </h1>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  v2.0.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Data Platform • 6 Giải Đấu Hàng Đầu Châu Âu
              </p>
            </div>
          </div>

          {/* Controls: API Status Badge & Quota Counter */}
          <div className="flex items-center gap-2.5">
            {/* Quota Counter Indicator Button */}
            <button
              onClick={handleManualQuotaRefresh}
              title="Nhấp để làm mới Quota API thực tế"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all hover:scale-105 cursor-pointer ${
                isQuotaWarning 
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/40'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : 'animate-pulse'}`} />
              <span className="text-slate-400 hidden sm:inline">Quota:</span>
              <span className={`font-bold ${isQuotaWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                {quotaUsed}/100
              </span>
            </button>

            {/* API Key Modal Switcher */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isRealDataMode 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">
                {isRealDataMode ? '🟢 Real API-Football' : '⚪ Real Data Mode'}
              </span>
            </button>
          </div>
        </div>

        {/* Competition Filter Bar & Main Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between py-2 border-t border-slate-900 gap-3">
          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* League Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedLeague('ALL')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                selectedLeague === 'ALL'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              🌍 Tất cả
            </button>

            {COMPETITIONS.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedLeague(comp.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  selectedLeague === comp.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{comp.flag}</span>
                <span>{comp.id}</span>
              </button>
            ))}
          </div>
        </div>
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
    </header>
  );
};
