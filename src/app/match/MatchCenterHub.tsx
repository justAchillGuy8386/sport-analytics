'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { Match, LeagueCode } from '@/types/football';
import { COMPETITIONS } from '@/constants/competitions';
import { TeamLogo } from '@/components/TeamLogo';
import { ScrollReveal } from '@/components/ScrollReveal';
import { getLiveMinute } from '@/utils/matchTime';
import { 
  Swords, Calendar, Clock, Trophy, Search, CheckCircle2, 
  Radio, MapPin, ArrowRight, X, Layers, RefreshCw
} from 'lucide-react';

const formatDateGroup = (dateStr?: string) => {
  if (!dateStr) return 'Khác';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Khác';
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekday = days[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${weekday}, Ngày ${day}/${month}/${year}`;
  } catch {
    return dateStr || 'Khác';
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

type StatusFilter = 'ALL' | 'FINISHED' | 'UPCOMING' | 'LIVE';
type GroupMode = 'DATE' | 'LEAGUE';

export const MatchCenterHub: React.FC = () => {
  const router = useRouter();
  const { allMatches = [], matches = [], selectedLeague, setSelectedLeague, isLoadingApi } = useFootball();

  const dataset = allMatches.length > 0 ? allMatches : matches;

  // Local filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [leagueFilter, setLeagueFilter] = useState<LeagueCode | 'ALL'>(selectedLeague);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupMode, setGroupMode] = useState<GroupMode>('DATE');

  // Sync with global league filter when it changes
  React.useEffect(() => {
    setLeagueFilter(selectedLeague);
  }, [selectedLeague]);

  // Overall counts for stats badges
  const totalMatchesCount = dataset.length;
  const finishedTotal = useMemo(() => dataset.filter(m => m.status === 'FINISHED').length, [dataset]);
  const upcomingTotal = useMemo(() => dataset.filter(m => m.status === 'UPCOMING').length, [dataset]);
  const liveTotal = useMemo(() => dataset.filter(m => m.status === 'LIVE').length, [dataset]);

  // Filtered dataset based on status, league, and search query
  const filteredMatches = useMemo(() => {
    return dataset.filter(m => {
      // 1. League Filter
      if (leagueFilter !== 'ALL' && m.leagueId !== leagueFilter) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        if (m.status !== statusFilter) return false;
      }

      // 3. Search query (matches home team, away team, round, venue)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const homeName = (m.homeTeam?.name || '').toLowerCase();
        const homeShort = (m.homeTeam?.shortName || '').toLowerCase();
        const awayName = (m.awayTeam?.name || '').toLowerCase();
        const awayShort = (m.awayTeam?.shortName || '').toLowerCase();
        const round = (m.round || '').toLowerCase();
        const venue = (m.venue || '').toLowerCase();

        const isMatch = homeName.includes(q) || homeShort.includes(q) ||
                        awayName.includes(q) || awayShort.includes(q) ||
                        round.includes(q) || venue.includes(q);
        if (!isMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // Primary sort: LIVE first
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;

      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;

      // If status filter is FINISHED, show newest completed matches first
      if (statusFilter === 'FINISHED') {
        return timeB - timeA;
      }

      // If status filter is UPCOMING, show nearest fixtures first
      if (statusFilter === 'UPCOMING') {
        return timeA - timeB;
      }

      // Default mixed sort: newest finished first, nearest upcoming first
      const now = Date.now();
      const diffA = Math.abs(timeA - now);
      const diffB = Math.abs(timeB - now);
      return diffA - diffB;
    });
  }, [dataset, leagueFilter, statusFilter, searchQuery]);

  // Grouped matches according to selected GroupMode
  const groupedData = useMemo(() => {
interface MatchGroup {
  key: string;
  title: string;
  subtitle?: string;
  flag?: string;
  matches: Match[];
}

    if (groupMode === 'LEAGUE') {
      const groups: MatchGroup[] = [];
      const leaguesToGroup = leagueFilter === 'ALL'
        ? COMPETITIONS
        : COMPETITIONS.filter(c => c.id === leagueFilter);

      for (const comp of leaguesToGroup) {
        const compMatches = filteredMatches.filter(m => m.leagueId === comp.id);
        if (compMatches.length > 0) {
          groups.push({
            key: comp.id,
            title: comp.name,
            subtitle: `${comp.country} • Mùa 2026/27`,
            flag: comp.flag,
            matches: compMatches
          });
        }
      }
      return groups;
    }

    // Default: Group by DATE
    const dateMap = new Map<string, Match[]>();
    for (const m of filteredMatches) {
      const dateKey = m.date ? m.date.split('T')[0] : 'undated';
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(m);
    }

    // Sort date keys according to active status filter:
    const now = Date.now();
    const sortedKeys = Array.from(dateMap.keys()).sort((a, b) => {
      // 1. Prioritize any date that contains a LIVE match
      const matchesA = dateMap.get(a) || [];
      const matchesB = dateMap.get(b) || [];
      const hasLiveA = matchesA.some(m => m.status === 'LIVE');
      const hasLiveB = matchesB.some(m => m.status === 'LIVE');
      if (hasLiveA && !hasLiveB) return -1;
      if (!hasLiveA && hasLiveB) return 1;

      const timeA = new Date(a).getTime() || 0;
      const timeB = new Date(b).getTime() || 0;

      // 2. If viewing FINISHED: newest completed matches first (e.g. Sep 2026 -> Aug 2026)
      if (statusFilter === 'FINISHED') {
        return timeB - timeA;
      }

      // 3. If viewing UPCOMING: nearest upcoming matches first (e.g. Oct 2026 -> May 2027)
      if (statusFilter === 'UPCOMING') {
        return timeA - timeB;
      }

      // 4. Default 'ALL': Sort by proximity to current time (closest round/matchday first)
      const diffA = Math.abs(timeA - now);
      const diffB = Math.abs(timeB - now);
      if (diffA !== diffB) return diffA - diffB;
      return timeB - timeA;
    });

    const dateGroups: MatchGroup[] = sortedKeys.map(k => {
      const matchesOnDate = (dateMap.get(k) || []).slice().sort((a, b) => {
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeA - timeB;
      });

      return {
        key: k,
        title: formatDateGroup(k !== 'undated' ? k : undefined),
        subtitle: `${matchesOnDate.length} trận đấu`,
        matches: matchesOnDate
      };
    });

    return dateGroups;
  }, [filteredMatches, groupMode, leagueFilter]);

  const handleCardClick = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ======================================================== */}
      {/* 1. HERO BANNER & STATS SUMMARY                           */}
      {/* ======================================================== */}
      <ScrollReveal direction="down" delay={20}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 p-5 sm:p-6 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Trung Tâm Dữ Liệu
                </span>
                <span className="text-slate-500 text-xs font-mono">• 6 Giải Đấu Hàng Đầu Châu Âu</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Swords className="w-6 h-6 text-emerald-400" />
                Match Center • Tổng Hợp Lịch Đấu & Kết Quả
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Theo dõi kết quả các trận đã kết thúc, kiểm tra tỉ số chi tiết và đón xem lịch thi đấu sắp tới của tất cả các giải đấu hàng đầu châu Âu mùa giải 2026/27.
              </p>
            </div>

            {/* Quick KPI stats counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Tổng Số Trận</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">{totalMatchesCount}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[10px] text-emerald-400 font-semibold uppercase">Đã Kết Thúc</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{finishedTotal}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[10px] text-cyan-400 font-semibold uppercase">Sắp Diễn Ra</div>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{upcomingTotal}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[10px] text-red-400 font-semibold uppercase flex items-center justify-center gap-1">
                  {liveTotal > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />}
                  Trực Tiếp
                </div>
                <div className="text-lg font-bold font-mono text-red-400 mt-0.5">{liveTotal}</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 2. FILTER TOOLBAR: STATUS, LEAGUES, SEARCH & GROUP MODE  */}
      {/* ======================================================== */}
      <ScrollReveal direction="up" delay={50} className="space-y-4">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
          {/* Top Row: Status Tabs & Group Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/90 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Tất Cả ({totalMatchesCount})
              </button>

              <button
                onClick={() => setStatusFilter('FINISHED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === 'FINISHED'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã Kết Thúc ({finishedTotal})
              </button>

              <button
                onClick={() => setStatusFilter('UPCOMING')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === 'UPCOMING'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Sắp Diễn Ra ({upcomingTotal})
              </button>

              <button
                onClick={() => setStatusFilter('LIVE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === 'LIVE'
                    ? 'bg-red-500 text-white shadow-md font-bold animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-red-400" />
                Trực Tiếp ({liveTotal})
              </button>
            </div>

            {/* View Mode Toggle: Theo Ngày vs Theo Giải Đấu */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-slate-400 text-xs font-medium hidden md:inline">Gom nhóm:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setGroupMode('DATE')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    groupMode === 'DATE'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Gom nhóm theo ngày thi đấu"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Theo Ngày</span>
                </button>
                <button
                  onClick={() => setGroupMode('LEAGUE')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    groupMode === 'LEAGUE'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Gom nhóm theo giải đấu"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Theo Giải</span>
                </button>
              </div>
            </div>
          </div>

          {/* Middle Row: League Chips Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => {
                setLeagueFilter('ALL');
                setSelectedLeague('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                leagueFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🌍 Tất Cả 6 Giải</span>
            </button>

            {COMPETITIONS.map(comp => {
              const compCount = dataset.filter(m => m.leagueId === comp.id).length;
              const isSelected = leagueFilter === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    setLeagueFilter(comp.id);
                    setSelectedLeague(comp.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{comp.flag}</span>
                  <span>{comp.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {compCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Search Box & Filter summary */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm đội bóng (vd: Arsenal, Real Madrid, Bayern, PSG...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between sm:justify-end gap-2 font-mono">
              <span>Đang hiển thị: <strong className="text-emerald-400 font-bold">{filteredMatches.length}</strong> trận đấu</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-sans"
                >
                  <X className="w-3 h-3" /> Xóa tìm kiếm
                </button>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* 3. MATCH CARDS ACCORDION / GROUPED DISPLAY               */}
      {/* ======================================================== */}
      {isLoadingApi && filteredMatches.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3 animate-pulse">
          <RefreshCw className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
          <p className="text-sm font-medium text-slate-300">Đang tải toàn bộ dữ liệu trận đấu...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Không tìm thấy trận đấu nào phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Vui lòng thử đổi bộ lọc giải đấu, trạng thái hoặc xóa từ khóa tìm kiếm.
          </p>
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setLeagueFilter('ALL');
              setSelectedLeague('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all mt-2"
          >
            Đặt Lại Bộ Lọc
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedData.map(group => (
            <ScrollReveal key={group.key} direction="up" delay={30} className="space-y-3.5">
              {/* Group Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  {group.flag ? (
                    <span className="text-lg">{group.flag}</span>
                  ) : (
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  )}
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {group.title}
                  </h2>
                  {group.subtitle && (
                    <span className="text-xs text-slate-400 hidden sm:inline">• {group.subtitle}</span>
                  )}
                </div>

                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                  {group.matches.length} trận
                </span>
              </div>

              {/* Matches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {group.matches.map(m => {
                  const isLive = m.status === 'LIVE';
                  const isFinished = m.status === 'FINISHED';
                  const isUpcoming = m.status === 'UPCOMING';
                  const comp = COMPETITIONS.find(c => c.id === m.leagueId);

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleCardClick(m.id)}
                      className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-200 cursor-pointer group hover:scale-[1.01] ${
                        isLive
                          ? 'bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-950 border-red-500/40 hover:border-red-500 shadow-lg shadow-red-500/10'
                          : 'bg-slate-900/70 border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-900/95 shadow-md'
                      }`}
                    >
                      {/* Top Bar of Card: League, Round, Status */}
                      <div className="flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs">{comp?.flag || '⚽'}</span>
                          <span className="font-bold text-slate-300 font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {m.leagueId}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {m.round}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold font-mono animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                            LIVE • {getLiveMinute(m)}
                          </span>
                        ) : isFinished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold font-mono">
                            FT • {formatTimeOnly(m.date)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono">
                            <Clock className="w-3 h-3" />
                            {formatTimeOnly(m.date)}
                          </span>
                        )}
                      </div>

                      {/* Main Matchup: Home Team vs Away Team */}
                      <div className="grid grid-cols-12 items-center py-2 gap-2">
                        {/* Home Team */}
                        <div className="col-span-5 flex items-center justify-end gap-2 text-right">
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                            {m.homeTeam.shortName || m.homeTeam.name}
                          </span>
                          <TeamLogo
                            logo={m.homeTeam.logo}
                            name={m.homeTeam.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
                          />
                        </div>

                        {/* Center Score / VS */}
                        <div className="col-span-2 flex flex-col items-center justify-center">
                          {isFinished || isLive ? (
                            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                              <span className={`text-base font-black font-mono ${
                                (m.homeScore ?? 0) > (m.awayScore ?? 0) ? 'text-emerald-400' : 'text-white'
                              }`}>
                                {m.homeScore ?? 0}
                              </span>
                              <span className="text-xs text-slate-600 font-mono">-</span>
                              <span className={`text-base font-black font-mono ${
                                (m.awayScore ?? 0) > (m.homeScore ?? 0) ? 'text-emerald-400' : 'text-white'
                              }`}>
                                {m.awayScore ?? 0}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                              VS
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="col-span-5 flex items-center justify-start gap-2 text-left">
                          <TeamLogo
                            logo={m.awayTeam.logo}
                            name={m.awayTeam.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                            {m.awayTeam.shortName || m.awayTeam.name}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Venue & Action Cue */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                          {m.venue ? (
                            <>
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{m.venue}</span>
                            </>
                          ) : (
                            <span className="text-slate-500">{comp?.name}</span>
                          )}
                        </div>

                        <span className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 font-medium transition-colors shrink-0">
                          <span>Chi tiết</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
