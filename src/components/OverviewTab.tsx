'use client';

import React from 'react';
import { Match, LeagueCode } from '@/types/football';
import { calculateKPIMetrics } from '@/utils/analyticsCalculations';
import { COMPETITIONS } from '@/data/mockData';
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

  // Filter ALL live matches
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
                  Đang Có {liveMatches.length} Trận Đấu Đang Diễn Ra Trực Tiếp (LIVE)
                </span>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono">API-Football Real-time Sync</span>
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

                <div className="grid grid-cols-3 items-center text-center my-2">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-bold text-white text-xs sm:text-sm">{liveMatch.homeTeam.name}</span>
                    <TeamLogo logo={liveMatch.homeTeam.logo} name={liveMatch.homeTeam.name} className="w-6 h-6" />
                  </div>

                  <div className="text-xl font-black text-white font-mono">
                    {liveMatch.homeScore} - {liveMatch.awayScore}
                  </div>

                  <div className="flex items-center gap-2 justify-start">
                    <TeamLogo logo={liveMatch.awayTeam.logo} name={liveMatch.awayTeam.name} className="w-6 h-6" />
                    <span className="font-bold text-white text-xs sm:text-sm">{liveMatch.awayTeam.name}</span>
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>LIVE API Connected:</strong> Hiện không có trận đấu trực tiếp (LIVE) thuộc các giải đang chọn. Đang hiển thị danh sách các trận đấu thực tế mới nhất & sắp tới.
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-mono shrink-0">
            Real Data Active
          </span>
        </div>
      )}

      {/* 12 KPI Grid Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Chỉ Số KPI Tổng Quan {selectedLeague !== 'ALL' ? `(${selectedLeague})` : 'Các Giải Đấu'}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Dữ liệu thực tế: {kpi.finishedMatches}/{kpi.totalMatches} trận</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Matches */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Tổng Trận Đấu</span>
              <Trophy className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{kpi.totalMatches}</div>
            <p className="text-[11px] text-slate-500 mt-1">Dữ liệu từ API-Football</p>
          </div>

          {/* 2. Total Goals */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Tổng Bàn Thắng</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">{kpi.totalGoals}</div>
            <p className="text-[11px] text-slate-500 mt-1">Bàn thắng hợp lệ</p>
          </div>

          {/* 3. Avg Goals/Match */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Trung Bình Bàn/Trận</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">{kpi.avgGoalsPerMatch}</div>
            <p className="text-[11px] text-slate-500 mt-1">Goals per game</p>
          </div>

          {/* 4. Avg Corners */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Trung Bình Phạt Góc</span>
              <Flag className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-cyan-400">{kpi.avgCorners}</div>
            <p className="text-[11px] text-slate-500 mt-1">Corners per game</p>
          </div>

          {/* 5. Avg Yellow Cards */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Trung Bình Thẻ Vàng</span>
              <div className="w-3.5 h-4 bg-amber-400 rounded-sm"></div>
            </div>
            <div className="text-2xl font-extrabold text-amber-300">{kpi.avgYellowCards}</div>
            <p className="text-[11px] text-slate-500 mt-1">Yellow cards / game</p>
          </div>

          {/* 6. Avg Red Cards */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Trung Bình Thẻ Đỏ</span>
              <div className="w-3.5 h-4 bg-red-500 rounded-sm"></div>
            </div>
            <div className="text-2xl font-extrabold text-red-400">{kpi.avgRedCards}</div>
            <p className="text-[11px] text-slate-500 mt-1">Red cards / game</p>
          </div>

          {/* 7. BTTS Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Tỷ Lệ BTTS (Cùng Ghi Bàn)</span>
              <Percent className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-400">{kpi.bttsRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Both Teams To Score</p>
          </div>

          {/* 8. Clean Sheet Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Tỷ Lệ Giữ Sạch Lưới</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">{kpi.cleanSheetRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Clean Sheet Rate</p>
          </div>

          {/* 9. Over 2.5 Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Tỷ Lệ Nổ Tài {'>'} 2.5</span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-teal-400">{kpi.over25Rate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Over 2.5 Goals %</p>
          </div>

          {/* 10. Home Win Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Chủ Nhà Thắng %</span>
              <Home className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-blue-400">{kpi.homeWinRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Home Win Rate</p>
          </div>

          {/* 11. Draw Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Tỷ Lệ Hòa %</span>
              <Scale className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-400">{kpi.drawRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Draw Rate</p>
          </div>

          {/* 12. Away Win Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Khách Thắng %</span>
              <PlaneLanding className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold text-orange-400">{kpi.awayWinRate}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Away Win Rate</p>
          </div>
        </div>
      </div>

      {/* Comparison Charts Across 6 Leagues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals & Over 2.5 Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>So Sánh Bàn Thắng & Tỷ Lệ Tài 2.5 Giữa Các Giải</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leagueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="avgGoals" name="Trung bình bàn/trận" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BTTS & Corners Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-indigo-400" />
            <span>So Sánh Tỷ Lệ BTTS (%) & Số Góc Trung Bình</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leagueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="bttsRate" name="Tỷ lệ BTTS (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgCorners" name="Phạt góc trung bình" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
