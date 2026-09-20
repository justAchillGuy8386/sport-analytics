'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COMPETITIONS } from '@/constants/competitions';
import { LEAGUE_RULES, getRankZone } from '@/constants/leagueRules';
import { LeagueCode, StandingItem } from '@/types/football';
import { TeamLogo } from '@/components/TeamLogo';
import { useFootball } from '@/context/FootballContext';
import { calculateStandingsFromMatches } from '@/utils/standingsCalculations';
import { slugifyTeam } from '@/utils/teamSlug';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Trophy, Calendar, Sparkles, AlertCircle, Info, ShieldAlert, Award } from 'lucide-react';

interface CompetitionTabProps {
  initialLeague?: LeagueCode;
  selectedLeague?: LeagueCode | 'ALL';
  onSelectMatch: (matchId: string) => void;
}

const STANDINGS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes persistent cache

export const CompetitionTab: React.FC<CompetitionTabProps> = ({
  initialLeague,
  selectedLeague,
  onSelectMatch
}) => {
  const router = useRouter();
  const { matches, apiKey, isRealDataMode, setSelectedLeague } = useFootball();

  const [activeLeague, setActiveLeague] = useState<LeagueCode>(
    initialLeague || (selectedLeague && selectedLeague !== 'ALL' ? selectedLeague : 'PL')
  );

  // Synchronize activeLeague when initialLeague prop changes from URL
  useEffect(() => {
    if (initialLeague && initialLeague !== activeLeague) {
      setActiveLeague(initialLeague);
    }
  }, [initialLeague]);

  // Synchronize activeLeague when user changes selectedLeague from Sidebar
  useEffect(() => {
    if (selectedLeague && selectedLeague !== 'ALL' && selectedLeague !== activeLeague) {
      setActiveLeague(selectedLeague);
    }
  }, [selectedLeague]);

  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [isLoadingStandings, setIsLoadingStandings] = useState<boolean>(false);
  const [isRealStandings, setIsRealStandings] = useState<boolean>(false);

  const competition = COMPETITIONS.find(c => c.id === activeLeague) || COMPETITIONS[0];
  const currentRules = LEAGUE_RULES[activeLeague] || LEAGUE_RULES.PL;
  const leagueMatches = matches.filter(m => m.leagueId === activeLeague);

  // Fetch real standings whenever activeLeague or API key changes (With localStorage persistence & fallback)
  useEffect(() => {
    async function loadStandings() {
      // Check localStorage persistent cache first
      const cacheKey = `fb_standings_v5_${activeLeague}`;
      const cacheTimeKey = `fb_standings_time_v5_${activeLeague}`;

      try {
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        const now = Date.now();

        if (cachedData && cachedTime && (now - parseInt(cachedTime) < STANDINGS_CACHE_TTL)) {
          const parsed: StandingItem[] = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStandings(parsed);
            setIsRealStandings(true);
            setIsLoadingStandings(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error reading standings localStorage:', e);
      }

      setIsLoadingStandings(true);
      try {
        const res = await fetch(`/api/football/standings?league=${activeLeague}&apiKey=${encodeURIComponent(apiKey || '')}`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setStandings(result.data);
          setIsRealStandings(true);

          // Save to localStorage
          try {
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
          } catch (e) {
            console.error('Error saving standings to localStorage:', e);
          }
        } else {
          // Fallback to dynamic calculation from Database matches
          const fallback = calculateStandingsFromMatches(leagueMatches);
          setStandings(fallback);
          setIsRealStandings(fallback.length > 0);
        }
      } catch (err) {
        console.error('Error loading standings API:', err);
        const fallback = calculateStandingsFromMatches(leagueMatches);
        setStandings(fallback);
        setIsRealStandings(fallback.length > 0);
      } finally {
        setIsLoadingStandings(false);
      }
    }

    loadStandings();
  }, [activeLeague, apiKey, isRealDataMode, matches.length]);

  // Compute effective standings list
  const effectiveStandings = standings.length > 0 
    ? standings 
    : calculateStandingsFromMatches(leagueMatches);

  const [fixtureFilter, setFixtureFilter] = useState<'ALL' | 'FINISHED' | 'UPCOMING'>('ALL');

  const filteredLeagueMatches = useMemo(() => {
    if (fixtureFilter === 'FINISHED') {
      return leagueMatches.filter(m => m.status === 'FINISHED');
    }
    if (fixtureFilter === 'UPCOMING') {
      return leagueMatches.filter(m => m.status === 'UPCOMING' || m.status === 'LIVE');
    }
    return leagueMatches;
  }, [leagueMatches, fixtureFilter]);

  const finishedCount = useMemo(() => leagueMatches.filter(m => m.status === 'FINISHED').length, [leagueMatches]);
  const upcomingCount = useMemo(() => leagueMatches.filter(m => m.status === 'UPCOMING' || m.status === 'LIVE').length, [leagueMatches]);

  return (
    <div className="space-y-6">
      {/* League Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-800">
        {COMPETITIONS.map(comp => (
          <Link
            key={comp.id}
            href={`/competition/${comp.slug}`}
            onClick={() => {
              setActiveLeague(comp.id);
              setSelectedLeague(comp.id);
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeLeague === comp.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span className="text-base">{comp.flag}</span>
            <span>{comp.name}</span>
          </Link>
        ))}
      </div>

      {/* Header Info */}
      <ScrollReveal direction="up" delay={0}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl p-2.5 sm:p-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
              {competition.flag}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{competition.name}</span>
                <span className="text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-400 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Mùa {competition.season}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Quốc gia: <strong>{competition.country}</strong> • Quy mô: <strong>{effectiveStandings.length || competition.totalTeams} Đội bóng</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial bg-slate-950 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px] sm:text-xs">Đã Đấu</span>
              <strong className="text-white font-mono text-xs sm:text-sm">
                {leagueMatches.filter(m => m.status === 'FINISHED').length} Trận
              </strong>
            </div>

            <div className="flex-1 sm:flex-initial bg-slate-950 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px] sm:text-xs">Nguồn</span>
              <strong className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400">
                🟢 Live Standings
              </strong>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={50}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Standings Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Standings Table Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
            <div>
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>BXH Chi Tiết ({competition.name} Mùa 2026/27)</span>
                </h3>
                {isLoadingStandings ? (
                  <span className="text-xs text-emerald-400 font-mono animate-pulse">⚡ Tải BXH...</span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Season 2026/27
                  </span>
                )}
              </div>

              {effectiveStandings.length === 0 ? (
                <div className="p-8 sm:p-12 text-center text-slate-400 space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
                  <p className="text-sm font-medium">Đang cập nhật bảng xếp hạng cho mùa 2026/27...</p>
                  <p className="text-xs text-slate-500">Dữ liệu thi đấu đang được tự động tổng hợp từ Supabase DB.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 text-center">Hạng</th>
                        <th className="py-2.5 px-3">Đội bóng</th>
                        <th className="py-2.5 px-2 text-center">ST</th>
                        <th className="py-2.5 px-2 text-center">T</th>
                        <th className="py-2.5 px-2 text-center">H</th>
                        <th className="py-2.5 px-2 text-center">B</th>
                        <th className="py-2.5 px-2 text-center">BT</th>
                        <th className="py-2.5 px-2 text-center">BB</th>
                        <th className="py-2.5 px-2 text-center">HS</th>
                        <th className="py-2.5 px-3 text-center text-emerald-400 font-bold">Điểm</th>
                        <th className="py-2.5 px-3 text-center">Phong độ (5 trận)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {effectiveStandings.map((item) => {
                        const zone = getRankZone(activeLeague, item.rank, effectiveStandings.length);
                        const isLeader = item.rank === 1;

                        return (
                          <tr 
                            key={item.team.id || item.rank} 
                            className={`hover:bg-slate-800/40 transition-colors border-l-2 ${zone?.borderLeftColor || 'border-l-transparent'}`}
                          >
                            <td className="py-2 px-3 text-center font-bold">
                              <span 
                                title={zone?.description || (isLeader ? 'Đang dẫn đầu bảng xếp hạng' : undefined)}
                                className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded-full text-[11px] cursor-help ${
                                  isLeader
                                    ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/50 shadow-xs shadow-amber-400/20'
                                    : zone
                                    ? `${zone.badgeBg} ${zone.badgeText} ${zone.badgeBorder} border font-semibold`
                                    : 'text-slate-400'
                                }`}
                              >
                                {item.rank}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-semibold text-white">
                              <Link
                                href={`/team/${slugifyTeam(item.team.name)}`}
                                className="flex items-center gap-2 group hover:text-emerald-400 transition-colors w-fit"
                                title={`Xem phân tích chi tiết CLB ${item.team.name}`}
                              >
                                <TeamLogo logo={item.team.logo} name={item.team.name} className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                                <span className="truncate max-w-[120px] sm:max-w-none group-hover:underline underline-offset-2">{item.team.name}</span>
                                {isLeader && (
                                  <span className="text-[11px] text-amber-400 select-none hidden sm:inline" title="Đội đầu bảng">👑</span>
                                )}
                              </Link>
                            </td>
                            <td className="py-2 px-2 text-center text-slate-300 font-mono">{item.played}</td>
                            <td className="py-2 px-2 text-center text-emerald-400 font-mono font-semibold">{item.won}</td>
                            <td className="py-2 px-2 text-center text-slate-400 font-mono">{item.drawn}</td>
                            <td className="py-2 px-2 text-center text-red-400 font-mono">{item.lost}</td>
                            <td className="py-2 px-2 text-center text-slate-300 font-mono">{item.goalsFor}</td>
                            <td className="py-2 px-2 text-center text-slate-400 font-mono">{item.goalsAgainst}</td>
                            <td className="py-2 px-2 text-center font-mono font-semibold text-slate-200">
                              {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                            </td>
                            <td className="py-2 px-3 text-center text-emerald-400 font-black text-sm font-mono">
                              {item.points}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center justify-center gap-1">
                                {(() => {
                                  const validForm = (item.form || []).slice(-Math.min(item.played, 5));
                                  if (validForm.length === 0) {
                                    return <span className="text-slate-600 font-mono text-xs">-</span>;
                                  }
                                  return validForm.map((res, i) => (
                                    <span
                                      key={i}
                                      className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                                        res === 'W'
                                          ? 'bg-emerald-500 text-slate-950'
                                          : res === 'D'
                                          ? 'bg-slate-600 text-white'
                                          : 'bg-red-500 text-white'
                                      }`}
                                    >
                                      {res}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Standings Legend Footer - Tailored to active league */}
            <div className="p-3.5 bg-slate-950/70 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-x-3.5 gap-y-1.5 flex-wrap">
                {currentRules.zones.map((z, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 cursor-help" title={z.description}>
                    <span className={`w-2.5 h-2.5 rounded-full ${z.dotColor} shrink-0 shadow-xs`}></span>
                    <span className="text-slate-300 font-medium text-[11px]">{z.label}</span>
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">Dữ liệu thời gian thực</span>
            </div>
          </div>

          {/* Detailed Tournament Format & Conditions Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Quy Chế Tham Dự Cúp Châu Âu & Xuống Hạng ({currentRules.leagueName})</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                {currentRules.totalTeams} Đội • Quy định mùa 2026/27
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Champions League / Cúp Châu Âu */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-blue-400">
                  <Award className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Suất Dự UEFA Champions League & Cúp Châu Âu</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentRules.uclSummary}
                </p>
              </div>

              {/* Xuống Hạng & Play-off */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Cơ Chế Trụ Hạng & Xuống Hạng</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentRules.relegationSummary}
                </p>
              </div>
            </div>

            {currentRules.additionalNotes && (
              <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 sm:p-3 rounded-xl border border-slate-800/80 flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 font-bold shrink-0">💡 Lưu ý:</span>
                <span>{currentRules.additionalNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fixtures & Results List (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between self-start h-full max-h-[860px]">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Lịch Thi Đấu & Kết Quả</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {filteredLeagueMatches.length} trận
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] mb-3 shrink-0 text-center">
              <button
                onClick={() => setFixtureFilter('ALL')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  fixtureFilter === 'ALL'
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả ({leagueMatches.length})
              </button>
              <button
                onClick={() => setFixtureFilter('FINISHED')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  fixtureFilter === 'FINISHED'
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kết thúc ({finishedCount})
              </button>
              <button
                onClick={() => setFixtureFilter('UPCOMING')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  fixtureFilter === 'UPCOMING'
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sắp đấu ({upcomingCount})
              </button>
            </div>

            {/* Scrollable match list */}
            <div className="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[700px]">
              {filteredLeagueMatches.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-12 text-center">
                  Không có trận đấu nào phù hợp với bộ lọc...
                </p>
              ) : (
                filteredLeagueMatches.map(m => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m.id)}
                    className="p-2.5 sm:p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-950/90 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-semibold text-slate-300">{m.round}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        m.status === 'LIVE'
                          ? 'bg-red-500/20 text-red-400 animate-pulse'
                          : m.status === 'FINISHED'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 items-center text-center">
                      <div className="flex items-center gap-1.5 justify-end overflow-hidden">
                        <span className="text-xs font-bold text-white truncate">{m.homeTeam.shortName || m.homeTeam.name}</span>
                        <TeamLogo logo={m.homeTeam.logo} name={m.homeTeam.name} className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        {m.status === 'FINISHED' || m.status === 'LIVE'
                          ? `${m.homeScore} - ${m.awayScore}`
                          : 'VS'}
                      </div>
                      <div className="flex items-center gap-1.5 justify-start overflow-hidden">
                        <TeamLogo logo={m.awayTeam.logo} name={m.awayTeam.name} className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold text-white truncate">{m.awayTeam.shortName || m.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Mùa giải: <code>2026/27</code></span>
            <span className="text-emerald-400 font-medium">Real-time Data</span>
          </div>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
};
