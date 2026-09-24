'use client';

import React from 'react';
import { Match, LeagueCode } from '@/types/football';
import { calculateKPIMetrics } from '@/utils/analyticsCalculations';
import { COMPETITIONS } from '@/constants/competitions';
import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  Trophy, Target, Flame, Shield, Flag, 
  Percent, TrendingUp, Home, Scale, PlaneLanding,
  BarChart3, AlertCircle
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

  const seasonProgress = kpi.totalMatches > 0 
    ? Math.round((kpi.finishedMatches / kpi.totalMatches) * 100) 
    : 0;

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
    <div className="space-y-10 sm:space-y-12 pb-8">
      {/* ======================================================== */}
      {/* 0. HERO HEADER BANNER: TỔNG QUAN GIẢI ĐẤU & TIẾN ĐỘ      */}
      {/* ======================================================== */}
      <ScrollReveal direction="down" delay={30}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800/90 p-5 sm:p-6 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {selectedLeague === 'ALL' ? 'Toàn Cảnh 6 Giải Đấu' : selectedLeague}
                </span>
                <span className="text-slate-500 text-xs font-mono">• Mùa Giải 2026/27</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                {selectedLeague === 'ALL'
                  ? 'Báo Cáo Phân Tích Tổng Quan Bóng Đá Châu Âu'
                  : `Tổng Quan Dữ Liệu & Hiệu Suất - ${selectedComp?.name || selectedLeague}`}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {selectedLeague === 'ALL'
                  ? 'Tổng hợp thống kê chuyên sâu 6 giải vô địch quốc gia & cúp châu Âu: Premier League, La Liga, Serie A, Bundesliga, Ligue 1 và UEFA Champions League.'
                  : `Thống kê chi tiết các thông số bàn thắng, phân bố tỷ lệ 1X2, phạt góc, kèo phụ và thẻ phạt của giải đấu ${selectedComp?.name}.`}
              </p>
            </div>

            {/* Quick Summary Box */}
            <div className="shrink-0 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 sm:p-4 text-right sm:min-w-[210px]">
              <div className="text-[11px] text-slate-400 font-medium">Tiến Độ Mùa Giải</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {kpi.finishedMatches} <span className="text-xs text-slate-400 font-normal">/ {kpi.totalMatches} trận</span>
              </div>
              {/* Mini progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${seasonProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono text-right">
                {seasonProgress}% số trận đã đấu
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 1. PHẦN 1: HIỆU SUẤT BÀN THẮNG & QUY MÔ GIẢI ĐẤU         */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-400 font-mono">
            01
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              HIỆU SUẤT GHI BÀN & QUY MÔ GIẢI ĐẤU
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Số liệu bàn thắng, tần suất trung bình và tỷ lệ các trận đấu nổ tài bàn thắng.
            </p>
          </div>
        </div>

        {/* 4 Spacious Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Matches Played */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trận Đã Đấu</span>
              <Trophy className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {kpi.finishedMatches}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tổng số trận</span>
              <span className="font-mono text-slate-300 font-medium">{kpi.totalMatches} trận</span>
            </div>
          </div>

          {/* Card 2: Total Goals */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng Bàn Thắng</span>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {kpi.totalGoals}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Bàn thắng hợp lệ</span>
              <span className="text-emerald-400/90 font-medium font-mono">Đã công nhận</span>
            </div>
          </div>

          {/* Card 3: Avg Goals/Match */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trung Bình Bàn / Trận</span>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {isNaN(kpi.avgGoalsPerMatch) ? 0 : kpi.avgGoalsPerMatch}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Đánh giá</span>
              <span className="font-medium text-amber-300">
                {kpi.avgGoalsPerMatch >= 2.8 ? 'Cống hiến cao' : kpi.avgGoalsPerMatch >= 2.5 ? 'Ổn định' : 'Chặt chẽ'}
              </span>
            </div>
          </div>

          {/* Card 4: Over 2.5 Goals */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tỷ Lệ Tài 2.5 Bàn</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">
              {kpi.over25Rate}%
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Số trận ≥ 3 bàn</span>
              <span className="font-mono text-cyan-300 font-medium">Over 2.5</span>
            </div>
          </div>
        </div>

        {/* Goals Comparison Chart */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-4 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                So Sánh Bàn Thắng Trung Bình Giữa Các Giải Đấu (2026/27)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Biểu đồ thể hiện mức độ sôi động về số lượng bàn thắng mỗi trận trên toàn bộ 6 giải đấu.
              </p>
            </div>
            {selectedLeague !== 'ALL' && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto font-medium">
                Giải đang lọc: {selectedComp?.name}
              </span>
            )}
          </div>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leagueComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  labelFormatter={(label) => COMPETITIONS.find(c => c.id === label)?.name || label}
                />
                <Bar dataKey="avgGoals" name="Trung bình bàn thắng" radius={[6, 6, 0, 0]}>
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

      {/* ======================================================== */}
      {/* 2. PHẦN 2: PHÂN BỐ KẾT QUẢ 1X2 & LỢI THẾ SÂN NHÀ          */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-black text-blue-400 font-mono">
            02
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-400" />
              PHÂN BỐ KẾT QUẢ 1X2 & LỢI THẾ ĐỊA LỢI
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tỷ lệ Thắng - Hòa - Thua và mức độ ảnh hưởng của yếu tố sân bãi đến cục diện trận đấu.
            </p>
          </div>
        </div>

        {/* Visual 1X2 Segmented Bar & Cards */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-5 sm:p-6 rounded-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-blue-400 font-medium">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block shrink-0" />
              Chủ Nhà Thắng: <strong className="font-mono text-white text-sm">{kpi.homeWinRate}%</strong>
            </span>
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="w-3 h-3 rounded-sm bg-slate-500 inline-block shrink-0" />
              Tỷ Lệ Hòa: <strong className="font-mono text-white text-sm">{kpi.drawRate}%</strong>
            </span>
            <span className="flex items-center gap-2 text-orange-400 font-medium">
              <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block shrink-0" />
              Khách Thắng: <strong className="font-mono text-white text-sm">{kpi.awayWinRate}%</strong>
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex shadow-inner border border-slate-800">
            <div 
              style={{ width: `${kpi.homeWinRate}%` }} 
              className="bg-blue-500 hover:brightness-110 transition-all cursor-help" 
              title={`Chủ nhà thắng: ${kpi.homeWinRate}%`}
            />
            <div 
              style={{ width: `${kpi.drawRate}%` }} 
              className="bg-slate-500 hover:brightness-110 transition-all cursor-help" 
              title={`Hòa: ${kpi.drawRate}%`}
            />
            <div 
              style={{ width: `${kpi.awayWinRate}%` }} 
              className="bg-orange-500 hover:brightness-110 transition-all cursor-help" 
              title={`Khách thắng: ${kpi.awayWinRate}%`}
            />
          </div>

          {/* 3 Outcome Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Home win */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-blue-400">Chủ Nhà (Home Win)</span>
                <Home className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{kpi.homeWinRate}%</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {kpi.homeWinRate >= 45 
                  ? 'Lợi thế sân nhà chiếm ưu thế rõ nét, tỷ lệ giữ trọn 3 điểm tại tổ ấm rất cao.' 
                  : 'Yếu tố sân nhà duy trì ở mức cân bằng so với mặt bằng chung các mùa giải.'}
              </p>
            </div>

            {/* Draw */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-300">Tỷ Lệ Hòa (Draw)</span>
                <Scale className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-200 font-mono">{kpi.drawRate}%</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Xác suất các đội bất phân thắng bại, phản ánh độ giằng co và chênh lệch trình độ giữa các CLB.
              </p>
            </div>

            {/* Away win */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-orange-400">Đội Khách (Away Win)</span>
                <PlaneLanding className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-black text-orange-400 font-mono">{kpi.awayWinRate}%</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Tỷ lệ đội khách vượt qua áp lực sân đối phương để giành chiến thắng chung cuộc.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 3. PHẦN 3: CHIẾN THUẬT & KÈO PHỤ (BTTS & PHẠT GÓC)        */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xs font-black text-cyan-400 font-mono">
            03
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Flag className="w-4 h-4 text-cyan-400" />
              XU HƯỚNG CHIẾN THUẬT: PHẠT GÓC, BTTS & SẠCH LƯỚI
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tương quan các thông số chuyên sâu: Both Teams To Score (BTTS), giữ sạch mành lưới và phạt góc.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 3 Metric Cards Column */}
          <div className="space-y-3.5 lg:col-span-1 flex flex-col justify-between">
            {/* BTTS */}
            <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl flex-1 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Cả 2 Đội Ghi Bàn (BTTS)</span>
                <Percent className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{kpi.bttsRate}%</div>
              <span className="text-[11px] text-slate-400 mt-1">Both Teams To Score</span>
            </div>

            {/* Clean Sheet */}
            <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl flex-1 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Giữ Sạch Lưới</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{kpi.cleanSheetRate}%</div>
              <span className="text-[11px] text-slate-400 mt-1">Trận có ít nhất 1 đội giữ sạch gôn</span>
            </div>

            {/* Corners */}
            <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl flex-1 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Phạt Góc Trung Bình</span>
                <Flag className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{isNaN(kpi.avgCorners) ? 0 : kpi.avgCorners}</div>
              <span className="text-[11px] text-slate-400 mt-1">Quả phạt góc / trận đấu</span>
            </div>
          </div>

          {/* Tactical Comparison Chart */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-4 sm:p-6 rounded-2xl lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Flag className="w-4 h-4 text-cyan-400" />
                  So Sánh Tỷ Lệ BTTS (%) & Số Góc Trung Bình
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đánh giá xu hướng tấn công biên và độ hiệu quả của hàng công 6 giải đấu.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono shrink-0">6 Giải Đấu</span>
            </div>
            <div className="h-64 sm:h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leagueComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    labelFormatter={(label) => COMPETITIONS.find(c => c.id === label)?.name || label}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="avgCorners" name="Phạt góc trung bình" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bttsRate" name="Tỷ lệ BTTS (%)" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 4. PHẦN 4: KỶ LUẬT & TÍNH CHẤT TRẬN ĐẤU                   */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400 font-mono">
            04
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              CHỈ SỐ KỶ LUẬT & MỨC ĐỘ CĂNG THẲNG
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tần suất rút thẻ vàng và thẻ đỏ của trọng tài qua các vòng đấu.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Yellow Cards Card */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-5 sm:p-6 rounded-2xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Thẻ Vàng Trung Bình / Trận
              </span>
              <div className="w-3.5 h-5 bg-amber-400 rounded-sm shadow-md shadow-amber-400/20" />
            </div>
            <div className="text-3xl font-black text-amber-300 font-mono tracking-tight">
              {isNaN(kpi.avgYellowCards) ? 0 : kpi.avgYellowCards}
            </div>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Số thẻ vàng bình quân mỗi trận. Chỉ số này phản ánh mức độ quyết liệt trong tranh chấp và sự nghiêm khắc của trọng tài qua từng giải đấu.
            </p>
          </div>

          {/* Red Cards Card */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-5 sm:p-6 rounded-2xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Thẻ Đỏ Trung Bình / Trận
              </span>
              <div className="w-3.5 h-5 bg-rose-500 rounded-sm shadow-md shadow-rose-500/20" />
            </div>
            <div className="text-3xl font-black text-rose-400 font-mono tracking-tight">
              {isNaN(kpi.avgRedCards) ? 0 : kpi.avgRedCards}
            </div>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Tần suất truất quyền thi đấu mỗi trận. Chỉ số phản ánh những tình huống phạm lỗi nghiêm trọng hoặc nhận hai thẻ vàng liên tiếp.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
