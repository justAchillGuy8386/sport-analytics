'use client';

import React, { useState, useEffect } from 'react';
import { MATCHES as MOCK_MATCHES } from '@/data/mockData';
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
  const matchDataList = matches && matches.length > 0 ? matches : MOCK_MATCHES;

  const [activeMatchId, setActiveMatchId] = useState<string>(
    selectedMatchId || matchDataList[0].id
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

  const activeMatch = matchDataList.find(m => m.id === activeMatchId) || matchDataList[0];
  const { homeTeam, awayTeam, homeScore, awayScore, stats, events, lineups } = activeMatch;

  return (
    <div className="space-y-6">
      {/* Match Selector Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
        {matchDataList.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMatchId(m.id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${
              activeMatchId === m.id
                ? 'bg-slate-800 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              m.status === 'LIVE' ? 'bg-red-500 animate-ping' : m.status === 'FINISHED' ? 'bg-slate-500' : 'bg-emerald-400'
            }`}></span>
            <div className="flex items-center gap-1.5 font-bold">
              <span>{m.homeTeam.shortName || m.homeTeam.name.substring(0, 3)}</span>
              <span className="text-emerald-400 font-mono">
                {m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : 'VS'}
              </span>
              <span>{m.awayTeam.shortName || m.awayTeam.name.substring(0, 3)}</span>
            </div>
            <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">{m.leagueId}</span>
          </button>
        ))}
      </div>

      {/* Main Scoreboard Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-0.5 rounded border border-emerald-500/30">
              {activeMatch.leagueId} • {activeMatch.season}
            </span>
            <span>{activeMatch.round}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {activeMatch.venue || 'Stadium'}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Trọng tài: {activeMatch.referee || 'Official'}
            </span>
          </div>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 items-center text-center my-4">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 mb-2 shadow-inner flex items-center justify-center">
              <TeamLogo logo={homeTeam.logo} name={homeTeam.name} className="w-12 h-12" />
            </div>
            <h3 className="font-extrabold text-white text-base sm:text-xl">{homeTeam.name}</h3>
            <span className="text-xs text-slate-500 font-semibold">{homeTeam.stadium || 'Chủ Nhà'}</span>
          </div>

          {/* Score & Status */}
          <div className="flex flex-col items-center">
            <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${
              activeMatch.status === 'LIVE'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                : activeMatch.status === 'FINISHED'
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              {activeMatch.status === 'LIVE' ? `Đang diễn ra (${activeMatch.elapsedTime}')` : activeMatch.status}
            </div>

            <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
              {homeScore !== null ? `${homeScore} - ${awayScore}` : 'VS'}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 mb-2 shadow-inner flex items-center justify-center">
              <TeamLogo logo={awayTeam.logo} name={awayTeam.name} className="w-12 h-12" />
            </div>
            <h3 className="font-extrabold text-white text-base sm:text-xl">{awayTeam.name}</h3>
            <span className="text-xs text-slate-500 font-semibold">Khách (Away)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Events */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Timeline Diễn Biến Trận Đấu (Events)</span>
          </h3>

          {!events || events.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center">Chưa có sự kiện diễn ra.</p>
          ) : (
            <div className="space-y-3 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {events.map((e) => {
                const isHome = e.teamId === homeTeam.id;
                return (
                  <div key={e.id} className={`flex items-center gap-3 text-xs ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                    <span className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 font-mono font-bold text-emerald-400 flex items-center justify-center text-[11px] z-10">
                      {e.time}'
                    </span>

                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 max-w-xs ${
                      e.type === 'goal'
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        : e.type === 'yellow_card'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      {e.type === 'goal' && <span>⚽</span>}
                      {e.type === 'yellow_card' && <span className="w-2.5 h-3.5 bg-amber-400 rounded-sm"></span>}
                      {e.type === 'red_card' && <span className="w-2.5 h-3.5 bg-red-500 rounded-sm"></span>}
                      <div>
                        <strong className="block font-semibold">{e.player}</strong>
                        {e.assistPlayer && <span className="text-[10px] text-slate-400">Kiến tạo: {e.assistPlayer}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Statistics Comparison */}
        {stats && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>So Sánh Thống Kê Chi Tiết (Team Statistics)</span>
            </h3>

            <div className="space-y-4 text-xs">
              {[
                { label: 'Kiểm soát bóng (%)', homeVal: stats.home.possession, awayVal: stats.away.possession, unit: '%' },
                { label: 'Tổng số cú sút', homeVal: stats.home.shots, awayVal: stats.away.shots },
                { label: 'Cú sút trúng đích', homeVal: stats.home.shotsOnTarget, awayVal: stats.away.shotsOnTarget },
                { label: 'Số quả phạt góc', homeVal: stats.home.corners, awayVal: stats.away.corners },
                { label: 'Phạm lỗi (Fouls)', homeVal: stats.home.fouls, awayVal: stats.away.fouls },
                { label: 'Thẻ vàng', homeVal: stats.home.yellowCards, awayVal: stats.away.yellowCards }
              ].map((item, idx) => {
                const total = (item.homeVal + item.awayVal) || 1;
                const homePct = Math.round((item.homeVal / total) * 100);
                return (
                  <div key={idx}>
                    <div className="flex justify-between font-semibold mb-1 text-slate-300">
                      <span className="text-emerald-400 font-mono">{item.homeVal}{item.unit || ''}</span>
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-cyan-400 font-mono">{item.awayVal}{item.unit || ''}</span>
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full flex overflow-hidden border border-slate-800">
                      <div className="bg-emerald-500 h-full" style={{ width: `${homePct}%` }}></div>
                      <div className="bg-cyan-500 h-full" style={{ width: `${100 - homePct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pitch Lineups Grid if available */}
      {lineups && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Đội Hình Ra Sân (Lineups & Formations)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Lineup */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <TeamLogo logo={homeTeam.logo} name={homeTeam.name} className="w-5 h-5" /> {homeTeam.name}
                </span>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  {lineups.home.formation}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {lineups.home.starters.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50">
                    <span className="font-mono text-slate-400 w-6">#{p.number}</span>
                    <span className="text-white font-medium flex-1">{p.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded">{p.position}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Lineup */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <TeamLogo logo={awayTeam.logo} name={awayTeam.name} className="w-5 h-5" /> {awayTeam.name}
                </span>
                <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                  {lineups.away.formation}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {lineups.away.starters.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50">
                    <span className="font-mono text-slate-400 w-6">#{p.number}</span>
                    <span className="text-white font-medium flex-1">{p.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded">{p.position}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
