'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFootball } from '@/context/FootballContext';
import { TeamLogo } from '@/components/TeamLogo';
import { Team, LeagueCode } from '@/types/football';
import { COMPETITIONS } from '@/constants/competitions';
import { slugifyTeam, findTeamBySlugOrId } from '@/utils/teamSlug';
import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  Home, Target, AlertCircle, Shield, Trophy, 
  TrendingUp, Activity, Flame, MapPin,
  Calendar, Clock, ArrowRight, Swords
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

interface TeamAnalyticsTabProps {
  initialTeamSlugOrId?: string;
}

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr || '';
  }
};

const formatTimeOnly = (dateStr?: string) => {
  if (!dateStr) return '--:--';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '--:--';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '--:--';
  }
};

export const TeamAnalyticsTab: React.FC<TeamAnalyticsTabProps> = ({ initialTeamSlugOrId }) => {
  const router = useRouter();
  const { matches, allMatches = [], isLoadingApi } = useFootball();

  // Combine all matches available in context to discover all teams across all leagues
  const dataset = useMemo(() => {
    return allMatches.length > 0 ? allMatches : matches;
  }, [allMatches, matches]);

  // Extract unique teams
  const { teamList, teamsMap } = useMemo(() => {
    const map = new Map<string, Team>();
    dataset.forEach(m => {
      if (m.homeTeam?.id && !map.has(m.homeTeam.id)) {
        map.set(m.homeTeam.id, m.homeTeam);
      }
      if (m.awayTeam?.id && !map.has(m.awayTeam.id)) {
        map.set(m.awayTeam.id, m.awayTeam);
      }
    });

    const list = Array.from(map.values()).sort((a, b) => {
      if (a.leagueId !== b.leagueId) {
        return (a.leagueId || '').localeCompare(b.leagueId || '');
      }
      return a.name.localeCompare(b.name);
    });

    return { teamList: list, teamsMap: map };
  }, [dataset]);

  // Resolve team from initialTeamSlugOrId, or fallback to first team
  const resolvedTeam = useMemo(() => {
    if (initialTeamSlugOrId && teamList.length > 0) {
      return findTeamBySlugOrId(teamList, initialTeamSlugOrId);
    }
    return undefined;
  }, [initialTeamSlugOrId, teamList]);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  // Sync selectedTeamId when resolvedTeam or teamList changes
  useEffect(() => {
    if (resolvedTeam) {
      setSelectedTeamId(resolvedTeam.id);
    } else if (!selectedTeamId && teamList.length > 0) {
      setSelectedTeamId(teamList[0].id);
    }
  }, [resolvedTeam, teamList, selectedTeamId]);

  const activeTeam = teamsMap.get(selectedTeamId) || resolvedTeam || teamList[0];

  const handleSelectTeam = (targetId: string) => {
    setSelectedTeamId(targetId);
    const target = teamsMap.get(targetId);
    if (target) {
      router.push(`/team/${slugifyTeam(target.name)}`);
    }
  };

  // If loading and no teams yet
  if (teamList.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
        {isLoadingApi ? (
          <>
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Đang nạp dữ liệu phân tích các câu lạc bộ...</p>
            <p className="text-xs text-slate-500">Đồng bộ dữ liệu trận đấu và các giải đấu thực tế.</p>
          </>
        ) : (
          <>
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
            <p className="text-sm font-medium">Hiện chưa có dữ liệu đội bóng từ Goal API.</p>
            <p className="text-xs text-slate-500">Vui lòng chờ API tải danh sách trận đấu thực tế hoặc chọn giải đấu khác.</p>
          </>
        )}
      </div>
    );
  }

  // If user searched an unknown slug that doesn't exist
  if (initialTeamSlugOrId && !resolvedTeam && teamList.length > 0) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-300 space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">Không tìm thấy đội bóng &quot;{initialTeamSlugOrId}&quot;</h3>
            <p className="text-xs text-slate-400 mt-1">
              Đội bóng có thể không nằm trong các giải đấu hiện tại (PL, La Liga, Serie A, Bundesliga, Ligue 1).
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-3 font-semibold">Gợi ý một số đội bóng tiêu biểu:</p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              {teamList.slice(0, 12).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTeam(t.id)}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 hover:text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <TeamLogo logo={t.logo} name={t.name} className="w-4 h-4 shrink-0" />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeTeam) return null;

  // Find all matches involving this team
  const teamMatches = dataset.filter(
    m => m.homeTeam?.id === activeTeam.id || m.awayTeam?.id === activeTeam.id
  );

  const finishedMatches = teamMatches.filter(m => m.status === 'FINISHED');
  const homeMatches = teamMatches.filter(m => m.homeTeam?.id === activeTeam.id);
  const awayMatches = teamMatches.filter(m => m.awayTeam?.id === activeTeam.id);

  const homeFinished = homeMatches.filter(m => m.status === 'FINISHED');
  const awayFinished = awayMatches.filter(m => m.status === 'FINISHED');

  // Wins, Draws, Losses
  const homeWins = homeFinished.filter(m => (m.homeScore ?? 0) > (m.awayScore ?? 0)).length;
  const homeDraws = homeFinished.filter(m => (m.homeScore ?? 0) === (m.awayScore ?? 0)).length;
  const homeLosses = homeFinished.filter(m => (m.homeScore ?? 0) < (m.awayScore ?? 0)).length;

  const awayWins = awayFinished.filter(m => (m.awayScore ?? 0) > (m.homeScore ?? 0)).length;
  const awayDraws = awayFinished.filter(m => (m.awayScore ?? 0) === (m.homeScore ?? 0)).length;
  const awayLosses = awayFinished.filter(m => (m.awayScore ?? 0) < (m.homeScore ?? 0)).length;

  const totalWins = homeWins + awayWins;
  const totalDraws = homeDraws + awayDraws;
  const totalLosses = homeLosses + awayLosses;

  // Win rates
  const winRate = finishedMatches.length > 0
    ? Math.round((totalWins / finishedMatches.length) * 100)
    : 0;
  const homeWinRate = homeFinished.length > 0
    ? Math.round((homeWins / homeFinished.length) * 100)
    : 0;
  const awayWinRate = awayFinished.length > 0
    ? Math.round((awayWins / awayFinished.length) * 100)
    : 0;

  // Goals
  const homeGoalsScored = homeFinished.reduce((acc, m) => acc + (m.homeScore || 0), 0);
  const homeGoalsConceded = homeFinished.reduce((acc, m) => acc + (m.awayScore || 0), 0);

  const awayGoalsScored = awayFinished.reduce((acc, m) => acc + (m.awayScore || 0), 0);
  const awayGoalsConceded = awayFinished.reduce((acc, m) => acc + (m.homeScore || 0), 0);

  const totalGoalsScored = homeGoalsScored + awayGoalsScored;
  const totalGoalsConceded = homeGoalsConceded + awayGoalsConceded;
  const goalDiff = totalGoalsScored - totalGoalsConceded;

  const avgGoalsScored = finishedMatches.length > 0
    ? (totalGoalsScored / finishedMatches.length).toFixed(2)
    : '0';
  const avgGoalsConceded = finishedMatches.length > 0
    ? (totalGoalsConceded / finishedMatches.length).toFixed(2)
    : '0';

  // Clean sheets
  const homeCleanSheets = homeFinished.filter(m => (m.awayScore ?? 0) === 0).length;
  const awayCleanSheets = awayFinished.filter(m => (m.homeScore ?? 0) === 0).length;
  const totalCleanSheets = homeCleanSheets + awayCleanSheets;
  const cleanSheetRate = finishedMatches.length > 0 
    ? Math.round((totalCleanSheets / finishedMatches.length) * 100) 
    : 0;

  // Possession calculation if stats available in match data
  const matchesWithPossession = finishedMatches.filter(m => {
    const isHome = m.homeTeam?.id === activeTeam.id;
    return isHome ? m.stats?.home?.possession : m.stats?.away?.possession;
  });

  const avgPossession = matchesWithPossession.length > 0
    ? Math.round(
        matchesWithPossession.reduce((acc, m) => {
          const isHome = m.homeTeam?.id === activeTeam.id;
          const pos = isHome ? (m.stats?.home?.possession || 0) : (m.stats?.away?.possession || 0);
          return acc + pos;
        }, 0) / matchesWithPossession.length
      )
    : 52; // baseline reasonable fallback

  // Last 5 matches for this team
  const recentMatches = [...finishedMatches]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 5);

  // Next 3 upcoming fixtures
  const upcomingMatches = [...teamMatches]
    .filter(m => m.status === 'UPCOMING')
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
    .slice(0, 3);

  const splitData = [
    { 
      category: 'Sân Nhà (Home)', 
      wins: homeWins, 
      draws: homeDraws,
      losses: homeLosses,
      goals: homeGoalsScored, 
      conceded: homeGoalsConceded,
      matches: homeFinished.length 
    },
    { 
      category: 'Sân Khách (Away)', 
      wins: awayWins, 
      draws: awayDraws,
      losses: awayLosses,
      goals: awayGoalsScored, 
      conceded: awayGoalsConceded,
      matches: awayFinished.length 
    }
  ];

  // Group teams by league for clean dropdown
  const leaguesOrder: LeagueCode[] = ['PL', 'LL', 'BL', 'SA', 'L1', 'UCL'];
  const groupedTeams = leaguesOrder.map(code => ({
    code,
    info: COMPETITIONS.find(c => c.id === code),
    teams: teamList.filter(t => t.leagueId === code)
  })).filter(g => g.teams.length > 0);

  const competitionInfo = activeTeam.leagueId ? COMPETITIONS.find(c => c.id === activeTeam.leagueId) : undefined;

  return (
    <div className="space-y-10 sm:space-y-12 pb-12">
      {/* ======================================================== */}
      {/* 0. TEAM PROFILE HERO BANNER                              */}
      {/* ======================================================== */}
      <ScrollReveal direction="down" delay={20}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 p-5 sm:p-7 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Team Identity */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="p-3 sm:p-4 bg-slate-950 rounded-2xl border border-slate-800/90 shadow-2xl flex items-center justify-center shrink-0">
                <TeamLogo logo={activeTeam.logo} name={activeTeam.name} className="w-14 h-14 sm:w-16 sm:h-16" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{activeTeam.name}</h1>
                  {activeTeam.shortName && (
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono font-bold">
                      {activeTeam.shortName}
                    </span>
                  )}
                  {competitionInfo && (
                    <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
                      <span>{competitionInfo.flag}</span>
                      <span>{competitionInfo.name}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sân vận động: <strong className="text-slate-200">{activeTeam.stadium || 'Chưa cập nhật'}</strong></span>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span>Mùa Giải: <strong className="text-slate-200">2026/27</strong></span>
                </div>

                {/* Form Dots */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium">Phong độ 5 trận gần nhất:</span>
                  <div className="flex items-center gap-1">
                    {recentMatches.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">Chưa có dữ liệu</span>
                    ) : (
                      recentMatches.map(m => {
                        const isHome = m.homeTeam?.id === activeTeam.id;
                        const teamScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
                        const oppScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
                        const isWin = teamScore > oppScore;
                        const isDraw = teamScore === oppScore;

                        return (
                          <span
                            key={m.id}
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] font-mono shadow-sm ${
                              isWin
                                ? 'bg-emerald-500 text-slate-950'
                                : isDraw
                                ? 'bg-slate-700 text-slate-200'
                                : 'bg-red-500 text-white'
                            }`}
                            title={isWin ? 'Thắng' : isDraw ? 'Hòa' : 'Thua'}
                          >
                            {isWin ? 'W' : isDraw ? 'D' : 'L'}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Selector Dropdown Box */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-4.5 shrink-0 sm:min-w-[280px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Đổi Câu Lạc Bộ Phân Tích:
              </label>
              <select
                value={activeTeam.id}
                onChange={(e) => handleSelectTeam(e.target.value)}
                className="w-full bg-slate-900 text-white font-semibold text-xs border border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-inner"
              >
                {groupedTeams.map(group => (
                  <optgroup key={group.code} label={`${group.info?.flag || ''} ${group.info?.name || group.code}`}>
                    {group.teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1.5 block">
                Tổng cộng {teamList.length} câu lạc bộ thuộc 6 giải đấu.
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 1. PHẦN 1: THÀNH TÍCH TỔNG QUAN & PHONG ĐỘ MÙA GIẢI      */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-400 font-mono">
            01
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              THÀNH TÍCH TỔNG QUAN & PHONG ĐỘ MÙA GIẢI
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Thống kê tổng số trận, tỷ lệ thắng trận, hiệu số bàn thắng và số trận bảo toàn mành lưới.
            </p>
          </div>
        </div>

        {/* 4 Spacious Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Matches Overview */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng Trận Thống Kê</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {teamMatches.length} <span className="text-sm font-normal text-slate-400 font-sans">trận</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{finishedMatches.length} đã đá</span>
              <span>{teamMatches.length - finishedMatches.length} sắp diễn ra</span>
            </div>
          </div>

          {/* Card 2: Win Record (W-D-L) */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thành Tích (T - H - B)</span>
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {totalWins}W - {totalDraws}D - {totalLosses}L
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tỷ lệ thắng trận:</span>
              <span className="font-mono text-emerald-400 font-bold">{winRate}%</span>
            </div>
          </div>

          {/* Card 3: Goals Scored / Conceded */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bàn Thắng / Bàn Thua</span>
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">
              {totalGoalsScored} / {totalGoalsConceded}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Hiệu số bàn thắng:</span>
              <span className={`font-mono font-bold ${
                goalDiff > 0 ? 'text-emerald-400' : goalDiff < 0 ? 'text-red-400' : 'text-slate-300'
              }`}>
                {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
              </span>
            </div>
          </div>

          {/* Card 4: Clean Sheets */}
          <div className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 p-4 sm:p-5 rounded-2xl transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giữ Sạch Lưới</span>
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono tracking-tight">
              {totalCleanSheets} <span className="text-sm font-normal text-slate-400 font-sans">trận</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tỷ lệ sạch mành lưới:</span>
              <span className="font-mono text-teal-400 font-bold">{cleanSheetRate}%</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 2. PHẦN 2: PHÂN TÍCH HIỆU SUẤT SÂN NHÀ VS SÂN KHÁCH      */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-black text-blue-400 font-mono">
            02
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-400" />
              HIỆU SUẤT ĐỊA LỢI: SÂN NHÀ VS SÂN KHÁCH
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              So sánh mức độ vượt trội khi thi đấu tại thánh địa nhà so với những chuyến làm khách xa nhà.
            </p>
          </div>
        </div>

        {/* 2 Balanced Cards for Home vs Away Record */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Record Card */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <Home className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Thành Tích Sân Nhà (Home)</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {homeFinished.length} trận đã đấu
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {homeWins}T - {homeDraws}H - {homeLosses}B
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Tỷ lệ thắng sân nhà</div>
                <div className="text-lg font-bold font-mono text-emerald-400">{homeWinRate}%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Bàn thắng / Thua: <strong className="text-slate-200 font-mono">{homeGoalsScored} / {homeGoalsConceded}</strong></span>
              <span>Sạch lưới: <strong className="text-teal-400 font-mono">{homeCleanSheets} trận</strong></span>
            </div>
          </div>

          {/* Away Record Card */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400">
                <Shield className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Thành Tích Sân Khách (Away)</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {awayFinished.length} trận đã đấu
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {awayWins}T - {awayDraws}H - {awayLosses}B
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Tỷ lệ thắng sân khách</div>
                <div className="text-lg font-bold font-mono text-orange-400">{awayWinRate}%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Bàn thắng / Thua: <strong className="text-slate-200 font-mono">{awayGoalsScored} / {awayGoalsConceded}</strong></span>
              <span>Sạch lưới: <strong className="text-teal-400 font-mono">{awayCleanSheets} trận</strong></span>
            </div>
          </div>
        </div>

        {/* Spacious Home vs Away Comparison Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Biểu Đồ Tương Quan: Thắng, Bàn Thắng & Bàn Thua (Home vs Away)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Đối chiếu số trận thắng, số lần xé lưới đối phương và số bàn thủng lưới giữa 2 môi trường thi đấu.
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={splitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px', 
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="wins" name="Số trận thắng" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="goals" name="Bàn thắng ghi được" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conceded" name="Bàn thua" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 3. PHẦN 3: CHỈ SỐ TẤN CÔNG & KIỂM SOÁT CHI TIẾT          */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xs font-black text-cyan-400 font-mono">
            03
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              CHỈ SỐ TẤN CÔNG & KIỂM SOÁT THẾ TRẬN
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân tích tỷ lệ kiểm soát bóng bình quân, hiệu suất nhả đạn và độ vững chắc của hàng phòng ngự.
            </p>
          </div>
        </div>

        {/* 4 Detailed Tactical Progress Bars */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-5 sm:p-6 rounded-2xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Possession */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Kiểm Soát Bóng Trung Bình (Possession)
                </span>
                <span className="text-emerald-400 font-black font-mono text-sm">{avgPossession}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(10, avgPossession))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {avgPossession >= 55 
                  ? 'Lối đá áp đặt chủ động, thường xuyên làm chủ khu trung tuyến và kiểm soát nhịp độ.'
                  : 'Lối đá thực dụng, chú trọng tính kỷ luật chiến thuật và chuyển trạng thái nhanh.'}
              </p>
            </div>

            {/* Clean Sheet Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  Tỷ Lệ Giữ Sạch Lưới (Clean Sheet Rate)
                </span>
                <span className="text-teal-400 font-black font-mono text-sm">{cleanSheetRate}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(5, cleanSheetRate))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {cleanSheetRate >= 40 
                  ? 'Hệ thống phòng ngự kín kẽ, thủ môn và hàng hậu vệ đạt độ ăn ý và tập trung cao.'
                  : 'Hàng thủ còn nhiều sơ hở, dễ bị đối phương khai thác các tình huống cố định.'}
              </p>
            </div>

            {/* Avg Goals Scored */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Hiệu Suất Ghi Bàn Trung Bình
                </span>
                <span className="text-amber-400 font-black font-mono text-sm">{avgGoalsScored} bàn/trận</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(10, parseFloat(avgGoalsScored) * 30))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Bình quân số bàn thắng xé lưới đối thủ trong mỗi 90 phút thi đấu chính thức.
              </p>
            </div>

            {/* Avg Goals Conceded */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Tần Suất Thủng Lưới Trung Bình
                </span>
                <span className="text-rose-400 font-black font-mono text-sm">{avgGoalsConceded} bàn/trận</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-red-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(10, parseFloat(avgGoalsConceded) * 30))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Số bàn thua trung bình phải nhận mỗi trận. Càng thấp phản ánh hàng phòng ngự càng chắc chắn.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 4. PHẦN 4: DIỄN BIẾN PHONG ĐỘ & LỊCH THI ĐẤU             */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xs font-black text-purple-400 font-mono">
            04
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              LỊCH SỬ KẾT QUẢ GẦN NHẤT & LỊCH ĐẤU TIẾP THEO
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chi tiết tỉ số 5 trận đã đấu gần đây và các đối thủ trong những vòng đấu sắp tới.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column A: Recent 5 Completed Matches */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl space-y-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                5 Trận Đã Đấu Gần Nhất
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Kết quả FT</span>
            </div>

            {recentMatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">Chưa có trận đấu đã kết thúc cho câu lạc bộ này.</p>
            ) : (
              <div className="space-y-2">
                {recentMatches.map(m => {
                  const isHome = m.homeTeam?.id === activeTeam.id;
                  const opponent = isHome ? m.awayTeam : m.homeTeam;
                  const teamScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
                  const oppScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
                  const isWin = teamScore > oppScore;
                  const isDraw = teamScore === oppScore;

                  return (
                    <Link
                      key={m.id}
                      href={`/match/${m.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-950 transition-all text-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] font-mono shrink-0 ${
                          isWin 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                            : isDraw 
                            ? 'bg-slate-700/40 text-slate-300 border border-slate-600/40' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}>
                          {isWin ? 'W' : isDraw ? 'D' : 'L'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {isHome ? 'Sân nhà' : 'Sân khách'}
                        </span>
                        <TeamLogo logo={opponent?.logo} name={opponent?.name} className="w-5 h-5 shrink-0" />
                        <span className="font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors truncate max-w-[130px] sm:max-w-[170px]">
                          {opponent?.shortName || opponent?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={`font-mono font-bold text-sm ${
                            isWin ? 'text-emerald-400' : isDraw ? 'text-slate-300' : 'text-red-400'
                          }`}>
                            {teamScore} - {oppScore}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {formatDateOnly(m.date)}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column B: Next Upcoming Fixtures */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl space-y-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Lịch Thi Đấu Sắp Diễn Ra
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">{upcomingMatches.length} trận tiếp theo</span>
            </div>

            {upcomingMatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">Chưa có lịch thi đấu tiếp theo cho câu lạc bộ này.</p>
            ) : (
              <div className="space-y-2">
                {upcomingMatches.map(m => {
                  const isHome = m.homeTeam?.id === activeTeam.id;
                  const opponent = isHome ? m.awayTeam : m.homeTeam;

                  return (
                    <Link
                      key={m.id}
                      href={`/match/${m.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-950 transition-all text-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                          {isHome ? 'H' : 'A'}
                        </span>
                        <TeamLogo logo={opponent?.logo} name={opponent?.name} className="w-5 h-5 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate block max-w-[130px] sm:max-w-[180px]">
                            {opponent?.shortName || opponent?.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {m.round} • {isHome ? 'Sân nhà' : 'Làm khách'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <span className="font-mono font-bold text-xs text-cyan-400 block">
                            {formatTimeOnly(m.date)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {formatDateOnly(m.date)}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="pt-2 text-right">
              <Link
                href="/match"
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium inline-flex items-center gap-1"
              >
                <span>Xem toàn bộ lịch thi đấu Match Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
