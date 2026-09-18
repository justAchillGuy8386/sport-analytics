'use client';

import React, { useMemo, useState } from 'react';
import { Match, LeagueCode } from '@/types/football';
import { getLiveMinute } from '@/utils/matchTime';
import { COMPETITIONS } from '@/constants/competitions';
import { TeamLogo } from '@/components/TeamLogo';
import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  Radio, Calendar, Swords, Shield, Activity, 
  Sparkles, Clock, ArrowRight, Trophy, ChevronRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekday = days[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${weekday}, ${day}/${month}/${year}`;
  } catch {
    return dateStr || '';
  }
};

const formatTimeOnly = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '';
  }
};

const LEAGUE_DISPLAY_ORDER: Record<string, number> = {
  PL: 1,
  LL: 2,
  SA: 3,
  BL: 4,
  L1: 5,
  UCL: 6
};

interface LiveMatchesTabProps {
  matches: Match[];
  allMatches?: Match[];
  selectedLeague: LeagueCode | 'ALL';
  setSelectedLeague?: (league: LeagueCode | 'ALL') => void;
  onSelectMatch: (matchId: string) => void;
}

export const LiveMatchesTab: React.FC<LiveMatchesTabProps> = ({
  matches,
  allMatches = [],
  selectedLeague,
  setSelectedLeague,
  onSelectMatch
}) => {
  const dataset = allMatches.length > 0 ? allMatches : matches;
  const [filterLeague, setFilterLeague] = useState<LeagueCode | 'ALL'>(selectedLeague);

  // Filter and stably sort LIVE matches: PL -> LL -> SA -> BL -> L1 -> UCL, then by date and id
  const liveMatches = useMemo(() => {
    return [...dataset]
      .filter(m => m.status === 'LIVE')
      .sort((a, b) => {
        const orderA = LEAGUE_DISPLAY_ORDER[a.leagueId] ?? 99;
        const orderB = LEAGUE_DISPLAY_ORDER[b.leagueId] ?? 99;
        if (orderA !== orderB) return orderA - orderB;

        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        if (timeA !== timeB) return timeA - timeB;

        return String(a.id).localeCompare(String(b.id));
      });
  }, [dataset]);

  // Filter by user selection if not ALL
  const displayedLiveMatches = useMemo(() => {
    if (filterLeague === 'ALL') return liveMatches;
    return liveMatches.filter(m => m.leagueId === filterLeague);
  }, [liveMatches, filterLeague]);

  // Group live matches by league according to official order (PL, LL, SA, BL, L1, UCL)
  const liveMatchesByLeague = useMemo(() => {
    const groups: { comp: { id: string; name: string; flag: string }; matches: Match[] }[] = [];
    
    for (const comp of COMPETITIONS) {
      const compMatches = displayedLiveMatches.filter(m => m.leagueId === comp.id);
      if (compMatches.length > 0) {
        groups.push({
          comp: { id: comp.id, name: comp.name, flag: comp.flag },
          matches: compMatches
        });
      }
    }

    const knownIds = new Set(COMPETITIONS.map(c => c.id));
    const otherMatches = displayedLiveMatches.filter(m => !knownIds.has(m.leagueId as any));
    if (otherMatches.length > 0) {
      groups.push({
        comp: { id: 'OTHER', name: 'Giải Đấu Khác', flag: '⚽' },
        matches: otherMatches
      });
    }

    return groups;
  }, [displayedLiveMatches]);

  // Upcoming matches for fallback when no live matches are active
  const upcomingMatches = useMemo(() => {
    return [...dataset]
      .filter(m => m.status === 'UPCOMING')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, [dataset]);

  // Recently finished matches for fallback
  const recentFinishedMatches = useMemo(() => {
    return [...dataset]
      .filter(m => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [dataset]);

  return (
    <div className="space-y-6">
      {/* Top Banner: LIVE MATCHES HEADER */}
      <ScrollReveal direction="up" delay={0}>
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                  TRỰC TIẾP <span className="text-red-400 font-mono">LIVE</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <div className="px-3 py-1.5 bg-slate-950/80 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-mono font-bold">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span>{liveMatches.length} TRẬN LIVE</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono hidden sm:flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Goal API Live Sync</span>
              </div>
            </div>
          </div>

          {/* League Quick Filter Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <button
              onClick={() => {
                setFilterLeague('ALL');
                setSelectedLeague?.('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterLeague === 'ALL'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>🌍 Tất cả giải ({liveMatches.length})</span>
            </button>
            {COMPETITIONS.map(comp => {
              const count = liveMatches.filter(m => m.leagueId === comp.id).length;
              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    setFilterLeague(comp.id);
                    setSelectedLeague?.(comp.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    filterLeague === comp.id
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{comp.flag}</span>
                  <span>{comp.id}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      filterLeague === comp.id ? 'bg-white text-red-600' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content: Live Match Cards grouped by Competition */}
      {displayedLiveMatches.length > 0 ? (
        <div className="space-y-6">
          {liveMatchesByLeague.map(({ comp, matches: groupMatches }) => (
            <ScrollReveal key={comp.id} direction="up" delay={50}>
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                {/* League sub-header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none">{comp.flag}</span>
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                        {comp.name}
                      </h2>
                      <span className="text-[11px] text-slate-400">
                        {groupMatches.length} trận đấu trực tiếp
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    LIVE
                  </span>
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {groupMatches.map((liveMatch) => (
                    <div 
                      key={liveMatch.id} 
                      onClick={() => onSelectMatch(liveMatch.id)}
                      className="bg-slate-950/90 p-4 sm:p-5 rounded-xl border border-slate-800/80 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/5 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                    >
                      {/* Card Top: Round + Date (Weekday, day/month/year only) + Live Minute */}
                      <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-slate-800">
                            {liveMatch.round}
                          </span>
                          {liveMatch.date && (
                            <span 
                              suppressHydrationWarning
                              className="text-[11px] text-slate-400 flex items-center gap-1 font-medium font-mono"
                            >
                              <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{formatDateOnly(liveMatch.date)}</span>
                            </span>
                          )}
                        </div>

                        <span className="text-red-400 font-bold text-xs animate-pulse font-mono shrink-0 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded">
                          {getLiveMinute(liveMatch)}
                        </span>
                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2.5 gap-2 sm:gap-4 max-w-full">
                        {/* Home Team */}
                        <div className="flex items-center justify-end gap-2 sm:gap-2.5 min-w-0">
                          <span className="font-bold text-white text-xs sm:text-sm text-right truncate group-hover:text-red-300 transition-colors">
                            {liveMatch.homeTeam.shortName || liveMatch.homeTeam.name}
                          </span>
                          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                            <TeamLogo logo={liveMatch.homeTeam.logo} name={liveMatch.homeTeam.name} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-3">
                          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight group-hover:scale-105 transition-transform whitespace-nowrap">
                            {liveMatch.homeScore} - {liveMatch.awayScore}
                          </div>
                          {liveMatch.elapsedTime && (
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 whitespace-nowrap">
                              Hiệp {liveMatch.elapsedTime > 45 ? '2' : '1'}
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-start gap-2 sm:gap-2.5 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                            <TeamLogo logo={liveMatch.awayTeam.logo} name={liveMatch.awayTeam.name} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                          </div>
                          <span className="font-bold text-white text-xs sm:text-sm text-left truncate group-hover:text-red-300 transition-colors">
                            {liveMatch.awayTeam.shortName || liveMatch.awayTeam.name}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Goal events preview or link to Match Center */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate">
                          {liveMatch.venue && (
                            <span className="truncate">🏟️ {liveMatch.venue}</span>
                          )}
                        </div>

                        <span className="text-[11px] text-red-400 group-hover:underline font-semibold flex items-center gap-1 shrink-0">
                          <span>Chi tiết trận đấu</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        /* Empty State: No live matches active right now */
        <div className="space-y-6">
          <ScrollReveal direction="up" delay={50}>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-inner">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">
                  Hiện Không Có Trận Đấu Nào Đang Diễn Ra Trực Tiếp
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Hệ thống tự động theo dõi và cập nhật ngay khi các trận đấu tiếp theo bắt đầu lăn bóng.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/match"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Khám Phá Match Center</span>
                </Link>
                <Link
                  href="/competition"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Xem BXH & Lịch Đấu</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Next Upcoming Matches Carousel / List */}
          {upcomingMatches.length > 0 && (
            <ScrollReveal direction="up" delay={100} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Sắp Diễn Ra
                </h3>
                <Link href="/match" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium">
                  <span>Xem thêm</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m.id)}
                    className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="font-semibold text-slate-300 font-mono">{m.leagueId} • {m.round}</span>
                      <span 
                        suppressHydrationWarning
                        className="text-cyan-400 font-mono font-medium flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDateOnly(m.date)}
                        {m.date && <span className="text-slate-500">• {formatTimeOnly(m.date)}</span>}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 items-center text-center py-1">
                      <div className="flex items-center gap-1.5 justify-end overflow-hidden">
                        <span className="text-xs font-bold text-white truncate">{m.homeTeam.shortName || m.homeTeam.name}</span>
                        <TeamLogo logo={m.homeTeam.logo} name={m.homeTeam.name} className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-400 px-2 py-0.5 bg-slate-950 rounded border border-slate-800/80 mx-auto">
                        VS
                      </div>
                      <div className="flex items-center gap-1.5 justify-start overflow-hidden">
                        <TeamLogo logo={m.awayTeam.logo} name={m.awayTeam.name} className="w-5 h-5 shrink-0" />
                        <span className="text-xs font-bold text-white truncate">{m.awayTeam.shortName || m.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          )}

          {/* Recently Finished Highlights */}
          {recentFinishedMatches.length > 0 && (
            <ScrollReveal direction="up" delay={150} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Kết Quả Vừa Kết Thúc Gần Nhất
                </h3>
                <Link href="/competition" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                  <span>Bảng xếp hạng</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentFinishedMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m.id)}
                    className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                      <span className="font-semibold text-slate-300 font-mono">{m.leagueId} • {m.round}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">FT</span>
                    </div>

                    <div className="grid grid-cols-3 items-center text-center py-1">
                      <div className="flex items-center gap-1 justify-end overflow-hidden">
                        <span className="text-[11px] font-bold text-white truncate">{m.homeTeam.shortName || m.homeTeam.name}</span>
                        <TeamLogo logo={m.homeTeam.logo} name={m.homeTeam.name} className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        {m.homeScore} - {m.awayScore}
                      </div>
                      <div className="flex items-center gap-1 justify-start overflow-hidden">
                        <TeamLogo logo={m.awayTeam.logo} name={m.awayTeam.name} className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] font-bold text-white truncate">{m.awayTeam.shortName || m.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      )}
    </div>
  );
};
