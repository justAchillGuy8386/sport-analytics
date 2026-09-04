'use client';

import React from 'react';
import { Match, LeagueCode } from '@/types/football';
import { calculateKPIMetrics } from '@/utils/analyticsCalculations';
import { COMPETITIONS } from '@/constants/competitions';
import { TeamLogo } from '@/components/TeamLogo';
import { 
  Trophy, Target, Flame, Shield, Flag, 
  Percent, TrendingUp, Home, Scale, PlaneLanding, Radio, Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface OverviewTabProps {
  matches: Match[];
  selectedLeague: LeagueCode | 'ALL';
  onSelectMatch: (matchId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  matches,
  selectedLeague,
  onSelectMatch
}) => {
  const filteredMatches = selectedLeague === 'ALL'
    ? matches
    : matches.filter(m => m.leagueId === selectedLeague);

  const kpi = calculateKPIMetrics(filteredMatches);

  // Filter ALL live matches from real match data
  const liveMatches = filteredMatches.filter(m => m.status === 'LIVE');

  // Prepare chart data comparing leagues
  const leagueComparisonData = COMPETITIONS.map(comp => {
    const compMatches = matches.filter(m => m.leagueId === comp.id);
    const compKpi = calculateKPIMetrics(compMatches);
    return {
      name: comp.id,
      fullName: comp.name,
      avgGoals: compKpi.avgGoalsPerMatch,
      bttsRate: compKpi.bttsRate,
      over25Rate: compKpi.over25Rate,
      avgCorners: compKpi.avgCorners,
      avgYellowCards: compKpi.avgYellowCards
    };
  });

  return (
    <div className="space-y-6">
      {/* Live Matches Ticker Banner */}
      {liveMatches.length > 0 ? (
        <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  {liveMatches.length} Trận Đấu Trực Tiếp (LIVE)
                </span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">API-Football Real-time Sync</span>
          </div>

          {/* Grid of multiple LIVE matches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((liveMatch) => (
              <div 
                key={liveMatch.id} 
                onClick={() => onSelectMatch(liveMatch.id)}
                className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 hover:border-red-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-slate-800">
                    {liveMatch.leagueId} • {liveMatch.round}
                  </span>
                  <span className="text-red-400 font-semibold text-[11px] animate-pulse">
                    Phút {liveMatch.elapsedTime}'
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center text-center my-2 gap-1">
                  <div className="flex items-center gap-1.5 justify-end overflow-hidden">
                    <span className="font-bold text-white text-xs sm:text-sm truncate">{liveMatch.homeTeam.shortName || liveMatch.homeTeam.name}</span>
                    <TeamLogo logo={liveMatch.homeTeam.logo} name={liveMatch.homeTeam.name} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  </div>

                  <div className="text-lg sm:text-xl font-black text-white font-mono">
                    {liveMatch.homeScore} - {liveMatch.awayScore}
                  </div>

                  <div className="flex items-center gap-1.5 justify-start overflow-hidden">
                    <TeamLogo logo={liveMatch.awayTeam.logo} name={liveMatch.awayTeam.name} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                    <span className="font-bold text-white text-xs sm:text-sm truncate">{liveMatch.awayTeam.shortName || liveMatch.awayTeam.name}</span>
                  </div>
                </div>

                <div className="text-right mt-2">
                  <span className="text-[11px] text-red-400 group-hover:underline font-medium">
                    Xem Match Center →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>LIVE API Connected:</strong> Hiện không có trận đấu nào đang diễn ra trực tiếp. Đang hiển thị dữ liệu thực tế mới nhất.
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-mono shrink-0">
            Real API Active
          </span>
        </div>
      )}

      {/* 12 KPI Grid Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Chỉ Số KPI Tổng Quan {selectedLeague !== 'ALL' ? `(${selectedLeague})` : 'Các Giải Đấu'}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Dữ liệu thực tế: {kpi.finishedMatches}/{kpi.totalMatches} trận</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Matches */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Tổng Trận Đấu</span>
              <Trophy className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{kpi.totalMatches}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Dữ liệu từ Database</span>
          </div>

          {/* 2. Total Goals */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Tổng Bàn Thắng</span>
              <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{kpi.totalGoals}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Bàn thắng hợp lệ</span>
          </div>

          {/* 3. Avg Goals/Match */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Trung Bình Bàn/Trận</span>
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{kpi.avgGoalsPerMatch}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Goals per game</span>
          </div>

          {/* 4. Avg Corners */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Trung Bình Phạt Góc</span>
              <Flag className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">{kpi.avgCorners}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Corners per game</span>
          </div>

          {/* 5. Avg Yellow Cards */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">TB Thẻ Vàng/Trận</span>
              <div className="w-3 h-4 bg-amber-400 rounded-sm shrink-0"></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{kpi.avgYellowCards}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Yellow cards / game</span>
          </div>

          {/* 6. Avg Red Cards */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">TB Thẻ Đỏ/Trận</span>
              <div className="w-3 h-4 bg-red-500 rounded-sm shrink-0"></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-400 font-mono">{kpi.avgRedCards}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Red cards / game</span>
          </div>

          {/* 7. BTTS Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Tỷ Lệ BTTS %</span>
              <Percent className="w-4 h-4 text-purple-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">{kpi.bttsRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Both Teams To Score</span>
          </div>

          {/* 8. Clean Sheet Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Giữ Sạch Lưới %</span>
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">{kpi.cleanSheetRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Clean Sheet Rate</span>
          </div>

          {/* 9. Over 2.5 Goals Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Nổ Tài &gt; 2.5 %</span>
              <TrendingUp className="w-4 h-4 text-teal-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono">{kpi.over25Rate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Over 2.5 Goals %</span>
          </div>

          {/* 10. Home Win Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Chủ Nhà Thắng %</span>
              <Home className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{kpi.homeWinRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Home Win Rate</span>
          </div>

          {/* 11. Draw Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Tỷ Lệ Hòa %</span>
              <Scale className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-300 font-mono">{kpi.drawRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Draw Rate</span>
          </div>

          {/* 12. Away Win Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Khách Thắng %</span>
              <PlaneLanding className="w-4 h-4 text-orange-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono">{kpi.awayWinRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Away Win Rate</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Avg Goals & Over 2.5 per League */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>So Sánh Bàn Thắng &amp; Tỷ Lệ Tài 2.5 Giữa Các Giải</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leagueComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="avgGoals" name="Trung bình bàn/trận" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: BTTS % & Corners per League */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-purple-400 shrink-0" />
            <span>So Sánh Tỷ Lệ BTTS (%) &amp; Số Góc Trung Bình</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leagueComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avgCorners" name="Phạt góc trung bình" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bttsRate" name="Tỷ lệ BTTS (%)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
