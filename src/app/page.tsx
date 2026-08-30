'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from '@/components/Navbar';
import { OverviewTab } from '@/components/OverviewTab';
import { CompetitionTab } from '@/components/CompetitionTab';
import { TeamAnalyticsTab } from '@/components/TeamAnalyticsTab';
import { MatchCenterTab } from '@/components/MatchCenterTab';
import { BettingAnalyticsTab } from '@/components/BettingAnalyticsTab';
import { ETLQuotaMonitorTab } from '@/components/ETLQuotaMonitorTab';
import { MATCHES as MOCK_MATCHES } from '@/data/mockData';
import { Match, LeagueCode } from '@/types/football';
import { Server } from 'lucide-react';

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '3f779659d2f2fdc3ecf432a3c49b2aae';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedLeague, setSelectedLeague] = useState<LeagueCode | 'ALL'>('ALL');
  const [quotaUsed, setQuotaUsed] = useState<number>(94);
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [isRealDataMode, setIsRealDataMode] = useState<boolean>(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Fetch real fixtures if real mode is enabled and API key is set
  useEffect(() => {
    async function loadData() {
      if (!isRealDataMode || !apiKey) {
        setMatches(MOCK_MATCHES);
        setSelectedMatchId(MOCK_MATCHES[0]?.id || '');
        setIsLoadingApi(false);
        return;
      }

      setIsLoadingApi(true);
      try {
        const res = await fetch(`/api/football?apiKey=${encodeURIComponent(apiKey)}&league=${selectedLeague}`);
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          setMatches(result.data);
          setSelectedMatchId(result.data[0].id);
        } else {
          setMatches(MOCK_MATCHES);
          setSelectedMatchId(MOCK_MATCHES[0]?.id || '');
        }
      } catch (err) {
        console.error('API Football fetch error:', err);
        setMatches(MOCK_MATCHES);
        setSelectedMatchId(MOCK_MATCHES[0]?.id || '');
      } finally {
        setIsLoadingApi(false);
      }
    }

    loadData();
  }, [isRealDataMode, apiKey, selectedLeague]);

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveTab('match');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLeague={selectedLeague}
        setSelectedLeague={setSelectedLeague}
        quotaUsed={quotaUsed}
        apiKey={apiKey}
        setApiKey={setApiKey}
        isRealDataMode={isRealDataMode}
        setIsRealDataMode={setIsRealDataMode}
      />

      {/* Loading Bar if fetching API */}
      {isLoadingApi && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 py-1.5 px-4 text-center text-xs font-semibold text-emerald-300 animate-pulse">
          ⚡ Đang tải dữ liệu thời gian thực từ API-Football...
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            matches={matches}
            selectedLeague={selectedLeague}
            onSelectMatch={handleSelectMatch}
          />
        )}

        {activeTab === 'competition' && (
          <CompetitionTab
            selectedLeague={selectedLeague}
            onSelectMatch={handleSelectMatch}
          />
        )}

        {activeTab === 'team' && (
          <TeamAnalyticsTab />
        )}

        {activeTab === 'match' && (
          <MatchCenterTab
            matches={matches}
            selectedMatchId={selectedMatchId}
          />
        )}

        {activeTab === 'betting' && (
          <BettingAnalyticsTab />
        )}

        {activeTab === 'etl' && (
          <ETLQuotaMonitorTab
            quotaUsed={quotaUsed}
            setQuotaUsed={setQuotaUsed}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              FA
            </div>
            <span className="font-bold text-white">World Football Analytics Platform</span>
            <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Next.js 15 App Router</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>API-Football Live Integration</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('etl')}
              className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Pipeline Logs</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
