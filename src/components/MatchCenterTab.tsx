'use client';

import React, { useState, useEffect } from 'react';
import { Match } from '@/types/football';
import { TeamLogo } from '@/components/TeamLogo';
import { Swords, Clock, MapPin, User, Activity, AlertCircle } from 'lucide-react';

interface MatchCenterTabProps {
  matches: Match[];
  selectedMatchId?: string;
}

export const MatchCenterTab: React.FC<MatchCenterTabProps> = ({
  matches,
  selectedMatchId
}) => {
  const matchDataList = matches || [];

  const [activeMatchId, setActiveMatchId] = useState<string>(
    selectedMatchId || matchDataList[0]?.id || ''
  );

  // Sync activeMatchId ONLY when parent explicitly changes selectedMatchId prop
  useEffect(() => {
    if (selectedMatchId && matchDataList.some(m => m.id === selectedMatchId)) {
      setActiveMatchId(selectedMatchId);
    }
  }, [selectedMatchId]);

  // Ensure activeMatchId is valid when match list loads/updates
  useEffect(() => {
    if (matchDataList.length > 0 && !matchDataList.some(m => m.id === activeMatchId)) {
      setActiveMatchId(matchDataList[0].id);
    }
  }, [matches]);

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-400 space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
        <p className="text-sm font-medium">Hiện không có trận đấu nào được chọn.</p>
        <p className="text-xs text-slate-500">Vui lòng quay lại Tổng quan hoặc chọn bộ lọc giải đấu ở thanh điều hướng bên trái.</p>
      </div>
    );
  }

  const activeMatch = matchDataList.find(m => m.id === activeMatchId) || matchDataList[0];
  const { homeTeam, awayTeam, homeScore, awayScore, stats, events, lineups } = activeMatch;

  const defaultTeamStats = {
    possession: 50,
    shots: 0,
    shotsOnTarget: 0,
    corners: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    offsides: 0,
    saves: 0
  };

  const safeStats = {
    home: stats?.home || defaultTeamStats,
    away: stats?.away || defaultTeamStats
  };

  return (
    <div className="space-y-6">
      {/* Match Selector Strip */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 border-b border-slate-800">
        {matchDataList.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMatchId(m.id)}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeMatchId === m.id
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5 font-semibold text-white">
              {m.homeTeam.shortName || m.homeTeam.name} vs {m.awayTeam.shortName || m.awayTeam.name}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              m.status === 'LIVE' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-300'
            }`}>
              {m.status === 'LIVE' ? `${m.elapsedTime}'` : m.status}
            </span>
          </button>
        ))}
      </div>

      {/* Match Header Scoreboard */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 mb-4 sm:mb-6 border-b border-slate-800/80 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded font-bold font-mono text-[11px]">
              {activeMatch.leagueId} • {activeMatch.season}
            </span>
            <span className="text-[11px] sm:text-xs font-medium">{activeMatch.round}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            {activeMatch.venue && (
              <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {activeMatch.venue}
              </span>
            )}
            {activeMatch.referee && (
              <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {activeMatch.referee}
              </span>
            )}
          </div>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 items-center text-center my-3 sm:my-4 gap-2">
          {/* Home Team */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 overflow-hidden">
            <span className="text-xs sm:text-xl font-black text-white order-2 sm:order-1 truncate w-full sm:w-auto text-center sm:text-right">
              {homeTeam.name}
            </span>
            <div className="p-2 sm:p-3 bg-slate-950 rounded-2xl border border-slate-800 order-1 sm:order-2 shrink-0">
              <TeamLogo logo={homeTeam.logo} name={homeTeam.name} className="w-8 h-8 sm:w-14 sm:h-14" />
            </div>
          </div>

          {/* Score & Status */}
          <div className="flex flex-col items-center shrink-0">
            {activeMatch.status === 'FINISHED' || activeMatch.status === 'LIVE' ? (
              <div className="text-2xl sm:text-5xl font-black text-white font-mono tracking-wider flex items-center gap-1.5 sm:gap-3">
                <span>{homeScore}</span>
                <span className="text-emerald-500">-</span>
                <span>{awayScore}</span>
              </div>
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-slate-400 font-mono">VS</div>
            )}

            <div className="mt-1.5 sm:mt-2">
              {activeMatch.status === 'LIVE' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-bold animate-pulse">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  LIVE • Phút {activeMatch.elapsedTime}'
                </span>
              ) : activeMatch.status === 'FINISHED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] sm:text-xs font-medium">
                  Kết thúc (FT)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-medium">
                  {new Date(activeMatch.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col sm:flex-row items-center justify-start gap-2 sm:gap-3 overflow-hidden">
            <div className="p-2 sm:p-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
              <TeamLogo logo={awayTeam.logo} name={awayTeam.name} className="w-8 h-8 sm:w-14 sm:h-14" />
            </div>
            <span className="text-xs sm:text-xl font-black text-white truncate w-full sm:w-auto text-center sm:text-left">
              {awayTeam.name}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Statistics Progress Bars */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thống Kê Chi Tiết Trận Đấu (Match Statistics)</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Possession */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400 font-mono">{safeStats.home.possession}%</span>
                <span className="text-slate-400">Kiểm Soát Bóng</span>
                <span className="font-bold text-cyan-400 font-mono">{safeStats.away.possession}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: `${safeStats.home.possession}%` }}></div>
                <div className="bg-cyan-500 h-full" style={{ width: `${safeStats.away.possession}%` }}></div>
              </div>
            </div>

            {/* Total Shots */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400 font-mono">{safeStats.home.shots}</span>
                <span className="text-slate-400">Tổng Số Cú Sút</span>
                <span className="font-bold text-cyan-400 font-mono">{safeStats.away.shots}</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: `${(safeStats.home.shots / (safeStats.home.shots + safeStats.away.shots || 1)) * 100}%` }}></div>
                <div className="bg-cyan-500 h-full" style={{ width: `${(safeStats.away.shots / (safeStats.home.shots + safeStats.away.shots || 1)) * 100}%` }}></div>
              </div>
            </div>

            {/* Shots on Target */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400 font-mono">{safeStats.home.shotsOnTarget}</span>
                <span className="text-slate-400">Cú Sút Trúng Đích</span>
                <span className="font-bold text-cyan-400 font-mono">{safeStats.away.shotsOnTarget}</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: `${(safeStats.home.shotsOnTarget / (safeStats.home.shotsOnTarget + safeStats.away.shotsOnTarget || 1)) * 100}%` }}></div>
                <div className="bg-cyan-500 h-full" style={{ width: `${(safeStats.away.shotsOnTarget / (safeStats.home.shotsOnTarget + safeStats.away.shotsOnTarget || 1)) * 100}%` }}></div>
              </div>
            </div>

            {/* Corners */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400 font-mono">{safeStats.home.corners}</span>
                <span className="text-slate-400">Phạt Góc</span>
                <span className="font-bold text-cyan-400 font-mono">{safeStats.away.corners}</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: `${(safeStats.home.corners / (safeStats.home.corners + safeStats.away.corners || 1)) * 100}%` }}></div>
                <div className="bg-cyan-500 h-full" style={{ width: `${(safeStats.away.corners / (safeStats.home.corners + safeStats.away.corners || 1)) * 100}%` }}></div>
              </div>
            </div>

            {/* Yellow & Red Cards */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Thẻ Vàng (Home / Away)</span>
                <strong className="text-amber-400 font-mono text-sm">{safeStats.home.yellowCards} - {safeStats.away.yellowCards}</strong>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Thẻ Đỏ (Home / Away)</span>
                <strong className="text-red-400 font-mono text-sm">{safeStats.home.redCards} - {safeStats.away.redCards}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Match Timeline & Key Events */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Diễn Biến Chính Trận Đấu (Match Timeline)</span>
            </h3>

            <div className="space-y-3 relative before:absolute before:left-1/2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {events && events.length > 0 ? (
                events.map((ev) => {
                  const isHomeEvent = ev.teamId === homeTeam.id;
                  return (
                    <div
                      key={ev.id}
                      className={`flex items-center text-xs ${
                        isHomeEvent ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div className={`w-1/2 flex items-center gap-2 ${isHomeEvent ? 'pr-3 justify-end text-right' : 'pl-3 justify-start text-left'}`}>
                        {isHomeEvent && (
                          <div className="overflow-hidden">
                            <span className="font-bold text-white block truncate">{ev.player}</span>
                            <span className="text-[10px] text-slate-400">{ev.type}</span>
                          </div>
                        )}
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                          {ev.time}'
                        </span>
                        {!isHomeEvent && (
                          <div className="overflow-hidden">
                            <span className="font-bold text-white block truncate">{ev.player}</span>
                            <span className="text-[10px] text-slate-400">{ev.type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-8">
                  Chưa có sự kiện thẻ/bàn thắng được ghi nhận.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono text-center">
            Events Data Source: API-Football Live Feeds
          </div>
        </div>
      </div>
    </div>
  );
};
