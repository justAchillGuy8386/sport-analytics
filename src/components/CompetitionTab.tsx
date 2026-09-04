'use client';

import React, { useState, useEffect } from 'react';
import { COMPETITIONS } from '@/constants/competitions';
import { LeagueCode, StandingItem } from '@/types/football';
import { TeamLogo } from '@/components/TeamLogo';
import { useFootball } from '@/context/FootballContext';
import { Trophy, Calendar, Sparkles, AlertCircle } from 'lucide-react';

interface CompetitionTabProps {
  selectedLeague: LeagueCode | 'ALL';
  onSelectMatch: (matchId: string) => void;
}

const STANDINGS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes persistent cache

export const CompetitionTab: React.FC<CompetitionTabProps> = ({
  selectedLeague,
  onSelectMatch
}) => {
  const { matches, apiKey, isRealDataMode } = useFootball();

  const [activeLeague, setActiveLeague] = useState<LeagueCode>(
    selectedLeague === 'ALL' ? 'PL' : selectedLeague
  );

  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [isLoadingStandings, setIsLoadingStandings] = useState<boolean>(false);
  const [isRealStandings, setIsRealStandings] = useState<boolean>(false);

  // Fetch real standings whenever activeLeague or API key changes (With localStorage persistence)
  useEffect(() => {
    async function loadStandings() {
      if (!isRealDataMode || !apiKey) {
        setStandings([]);
        setIsRealStandings(false);
        return;
      }

      // Check localStorage persistent cache first
      const cacheKey = `fb_standings_v2_${activeLeague}`;
      const cacheTimeKey = `fb_standings_time_v2_${activeLeague}`;

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
        const res = await fetch(`/api/football/standings?league=${activeLeague}&apiKey=${encodeURIComponent(apiKey)}`);
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
          setStandings([]);
          setIsRealStandings(false);
        }
      } catch (err) {
        console.error('Error loading standings API:', err);
        setStandings([]);
        setIsRealStandings(false);
      } finally {
        setIsLoadingStandings(false);
      }
    }

    loadStandings();
  }, [activeLeague, apiKey, isRealDataMode]);

  const competition = COMPETITIONS.find(c => c.id === activeLeague) || COMPETITIONS[0];
  const leagueMatches = matches.filter(m => m.leagueId === activeLeague);

  return (
    <div className="space-y-6">
      {/* League Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-800">
        {COMPETITIONS.map(comp => (
          <button
            key={comp.id}
            onClick={() => setActiveLeague(comp.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeLeague === comp.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span className="text-base">{comp.flag}</span>
            <span>{comp.name}</span>
          </button>
        ))}
      </div>

      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-3xl sm:text-4xl p-2.5 sm:p-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
            {competition.flag}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>{competition.name}</span>
              <span className="text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-400 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {competition.season}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Quốc gia: <strong>{competition.country}</strong> • Quy mô: <strong>{standings.length || competition.totalTeams} Đội bóng</strong>
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
            <strong className={`text-[11px] sm:text-xs font-mono font-bold ${isRealStandings ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isRealStandings ? '🟢 Real API' : '⚪ Pending'}
            </strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Standings Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>BXH Chi Tiết ({competition.name})</span>
            </h3>
            {isLoadingStandings ? (
              <span className="text-xs text-emerald-400 font-mono animate-pulse">⚡ Tải BXH...</span>
            ) : isRealStandings ? (
              <span className="text-[10px] sm:text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Standings
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">No Data</span>
            )}
          </div>

          {standings.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
              <p className="text-sm font-medium">Chưa có dữ liệu bảng xếp hạng cho giải đấu này.</p>
              <p className="text-xs text-slate-500">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau ít phút.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center">Hạng</th>
                    <th className="py-3 px-4">Đội bóng</th>
                    <th className="py-3 px-2 text-center">ST</th>
                    <th className="py-3 px-2 text-center">T</th>
                    <th className="py-3 px-2 text-center">H</th>
                    <th className="py-3 px-2 text-center">B</th>
                    <th className="py-3 px-2 text-center">BT</th>
                    <th className="py-3 px-2 text-center">BB</th>
                    <th className="py-3 px-2 text-center">HS</th>
                    <th className="py-3 px-3 text-center text-emerald-400 font-bold">Điểm</th>
                    <th className="py-3 px-4 text-center">Phong độ (5 trận)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {standings.map((item) => (
                    <tr key={item.team.id || item.rank} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          item.rank === 1
                            ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40'
                            : item.rank <= 4
                            ? 'bg-blue-500/20 text-blue-300 font-semibold'
                            : item.rank >= (standings.length - 3)
                            ? 'bg-red-500/20 text-red-300 font-semibold'
                            : 'text-slate-400'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <TeamLogo logo={item.team.logo} name={item.team.name} className="w-5 h-5 shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{item.team.name}</span>
                      </td>
                      <td className="py-3 px-2 text-center text-slate-300 font-mono">{item.played}</td>
                      <td className="py-3 px-2 text-center text-emerald-400 font-mono font-semibold">{item.won}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{item.drawn}</td>
                      <td className="py-3 px-2 text-center text-red-400 font-mono">{item.lost}</td>
                      <td className="py-3 px-2 text-center text-slate-300 font-mono">{item.goalsFor}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{item.goalsAgainst}</td>
                      <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                        {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-400 font-black text-sm font-mono">
                        {item.points}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {item.form.map((res, i) => (
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
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fixtures & Results List (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Kết Quả & Lịch Thi Đấu ({activeLeague})</span>
            </h3>

            <div className="space-y-3">
              {leagueMatches.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">
                  Hiện chưa có danh sách trận đấu thực tế cho giải này...
                </p>
              ) : (
                leagueMatches.map(m => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m.id)}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="font-semibold">{m.round}</span>
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

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Standings views: <code>API-Football /standings</code></span>
            <span className="text-emerald-400 font-medium">Real-time Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
