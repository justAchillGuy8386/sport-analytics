'use client';

import React from 'react';
import { Match, LeagueCode } from '@/types/football';
import { calculateKPIMetrics } from '@/utils/analyticsCalculations';
import { COMPETITIONS } from '@/constants/competitions';
import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  Trophy, Target, Flame, Shield, Flag, 
  Percent, TrendingUp, Home, Scale, PlaneLanding
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface OverviewTabProps {
  matches: Match[];
  allMatches?: Match[];
  selectedLeague: LeagueCode | 'ALL';
  onSelectMatch?: (matchId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  matches,
  allMatches = [],
  selectedLeague,
}) => {
  const datasetForComparison = allMatches.length > 0 ? allMatches : matches;
  const filteredMatches = selectedLeague === 'ALL'
    ? (datasetForComparison.length > 0 ? datasetForComparison : matches)
    : datasetForComparison.filter(m => m.leagueId === selectedLeague);

  const selectedComp = COMPETITIONS.find(c => c.id === selectedLeague);
  const kpi = calculateKPIMetrics(filteredMatches);

  // Prepare chart data comparing leagues using full dataset across all leagues
  const leagueComparisonData = COMPETITIONS.map(comp => {
    const compMatches = datasetForComparison.filter(m => m.leagueId === comp.id);
    const compKpi = calculateKPIMetrics(compMatches);
    return {
      name: comp.id,
      fullName: comp.name,
      avgGoals: compKpi.avgGoalsPerMatch,
      bttsRate: compKpi.bttsRate,
      over25Rate: compKpi.over25Rate,
      avgCorners: isNaN(compKpi.avgCorners) ? 0 : compKpi.avgCorners,
      avgYellowCards: isNaN(compKpi.avgYellowCards) ? 0 : compKpi.avgYellowCards,
      isSelected: comp.id === selectedLeague
    };
  });

  return (
    <div className="space-y-6">

      {/* KPI Cards Grid */}
      <ScrollReveal direction="up" delay={50} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            {selectedLeague === 'ALL'
              ? 'Chỉ Số KPI Tổng Quan - Tất Cả 6 Giải Đấu'
              : `Chỉ Số KPI - ${selectedComp?.name || selectedLeague} (${selectedLeague})`}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {selectedLeague === 'ALL'
              ? `Dữ liệu thực tế: ${kpi.finishedMatches}/${kpi.totalMatches} trận đã đấu (6 giải)`
              : `${selectedComp?.flag || '⚽'} Dữ liệu thực tế: ${kpi.finishedMatches}/${kpi.totalMatches} trận đã đấu (${selectedLeague})`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {/* 1. Total Matches */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Trận Đã Đấu</span>
              <Trophy className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{kpi.finishedMatches}</div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {selectedLeague === 'ALL' 
                ? `Trên tổng ${kpi.totalMatches} trận (6 giải)` 
                : `Trên tổng ${kpi.totalMatches} trận ${selectedLeague}`}
            </span>
          </div>

          {/* 2. Total Goals */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Tổng Bàn Thắng</span>
              <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{kpi.totalGoals}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Bàn thắng hợp lệ</span>
          </div>

          {/* 3. Avg Goals/Match */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Trung Bình Bàn/Trận</span>
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{isNaN(kpi.avgGoalsPerMatch) ? 0 : kpi.avgGoalsPerMatch}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Goals per game</span>
          </div>

          {/* 4. Avg Corners */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Trung Bình Phạt Góc</span>
              <Flag className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">{isNaN(kpi.avgCorners) ? 0 : kpi.avgCorners}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Corners per game</span>
          </div>

          {/* 5. Avg Yellow Cards */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">TB Thẻ Vàng/Trận</span>
              <div className="w-3 h-4 bg-amber-400 rounded-sm shrink-0"></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{isNaN(kpi.avgYellowCards) ? 0 : kpi.avgYellowCards}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Yellow cards / game</span>
          </div>

          {/* 6. Avg Red Cards */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">TB Thẻ Đỏ/Trận</span>
              <div className="w-3 h-4 bg-red-500 rounded-sm shrink-0"></div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-400 font-mono">{isNaN(kpi.avgRedCards) ? 0 : kpi.avgRedCards}</div>
            <span className="text-[10px] text-slate-500 block mt-1">Red cards / game</span>
          </div>

          {/* 7. BTTS Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Tỷ Lệ BTTS %</span>
              <Percent className="w-4 h-4 text-purple-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">{kpi.bttsRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Both Teams To Score</span>
          </div>

          {/* 8. Clean Sheet Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Giữ Sạch Lưới %</span>
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{kpi.cleanSheetRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Clean Sheet Rate</span>
          </div>

          {/* 9. Over 2.5 Goals */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Nổ Tài 2.5 %</span>
              <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">{kpi.over25Rate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Over 2.5 Goals %</span>
          </div>

          {/* 10. Home Win Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Chủ Nhà Thắng %</span>
              <Home className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{kpi.homeWinRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Home Win Rate</span>
          </div>

          {/* 11. Draw Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Tỷ Lệ Hòa %</span>
              <Scale className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-300 font-mono">{kpi.drawRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Draw Rate</span>
          </div>

          {/* 12. Away Win Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 gap-1">
              <span className="text-[11px] sm:text-xs font-medium truncate">Khách Thắng %</span>
              <PlaneLanding className="w-4 h-4 text-orange-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono">{kpi.awayWinRate}%</div>
            <span className="text-[10px] text-slate-500 block mt-1">Away Win Rate</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart 1: Avg Goals & Over 2.5 Comparison */}
        <ScrollReveal direction="up" delay={50}>
          <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                So Sánh Bàn Thắng Giữa Các Giải
                {selectedLeague !== 'ALL' && (
                  <span className="text-[11px] text-emerald-400 font-normal">
                    (Đang chọn: {selectedComp?.name})
                  </span>
                )}
              </h3>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leagueComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    labelFormatter={(label) => COMPETITIONS.find(c => c.id === label)?.name || label}
                  />
                  <Bar dataKey="avgGoals" name="Trung bình bàn thắng" radius={[4, 4, 0, 0]}>
                    {leagueComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === selectedLeague ? '#10b981' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>

        {/* Chart 2: Corners & BTTS Comparison */}
        <ScrollReveal direction="up" delay={100}>
          <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Flag className="w-4 h-4 text-cyan-400" />
                So Sánh Tỷ Lệ BTTS (%) &amp; Số Góc Trung Bình
                {selectedLeague !== 'ALL' && (
                  <span className="text-[11px] text-emerald-400 font-normal">
                    (Đang chọn: {selectedComp?.name})
                  </span>
                )}
              </h3>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leagueComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    labelFormatter={(label) => COMPETITIONS.find(c => c.id === label)?.name || label}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="avgCorners" name="Phạt góc trung bình" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bttsRate" name="Tỷ lệ BTTS (%)" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
