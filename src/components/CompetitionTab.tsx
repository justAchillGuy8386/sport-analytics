'use client';

import React, { useState } from 'react';
import { COMPETITIONS, STANDINGS_DATA, MATCHES } from '@/data/mockData';
import { LeagueCode } from '@/types/football';
import { TeamLogo } from '@/components/TeamLogo';
import { Trophy, TrendingUp, Calendar, CheckCircle, XCircle, MinusCircle, Award } from 'lucide-react';

interface CompetitionTabProps {
  selectedLeague: LeagueCode | 'ALL';
  onSelectMatch: (matchId: string) => void;
}

export const CompetitionTab: React.FC<CompetitionTabProps> = ({
  selectedLeague,
  onSelectMatch
}) => {
  const [activeLeague, setActiveLeague] = useState<LeagueCode>(
    selectedLeague === 'ALL' ? 'PL' : selectedLeague
  );

  const competition = COMPETITIONS.find(c => c.id === activeLeague) || COMPETITIONS[0];
  const standings = STANDINGS_DATA[activeLeague] || [];
  const leagueMatches = MATCHES.filter(m => m.leagueId === activeLeague);

  return (
    <div className="space-y-6">
      {/* League Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {COMPETITIONS.map(comp => (
          <button
            key={comp.id}
            onClick={() => setActiveLeague(comp.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeLeague === comp.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
          >
            <span className="text-base">{comp.flag}</span>
            <span className="font-bold">{comp.name}</span>
          </button>
        ))}
      </div>

      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-800">
            {competition.flag}
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{competition.name}</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {competition.season}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Quốc gia: <strong>{competition.country}</strong> • Quy mô: <strong>{competition.totalTeams} Đội bóng</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-500 block">Số Trận Đã Đấu</span>
            <strong className="text-white font-mono text-sm">{leagueMatches.filter(m => m.status === 'FINISHED').length} Trận</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Standings Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Bảng Xếp Hạng Chi Tiết (Standings Snapshot)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Snapshot 2026/27</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                  <tr key={item.team.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        item.rank === 1
                          ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40'
                          : item.rank <= 4
                          ? 'bg-blue-500/20 text-blue-300 font-semibold'
                          : 'text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <TeamLogo logo={item.team.logo} name={item.team.name} className="w-5 h-5" />
                      <span>{item.team.name}</span>
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
        </div>

        {/* Fixtures & Results List (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Kết Quả & Lịch Thi Đấu ({activeLeague})</span>
            </h3>

            <div className="space-y-3">
              {leagueMatches.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">
                  Đang cập nhật lịch thi đấu mới cho giải này...
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
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs font-bold text-white">{m.homeTeam.shortName}</span>
                        <TeamLogo logo={m.homeTeam.logo} name={m.homeTeam.name} className="w-4 h-4" />
                      </div>
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        {m.status === 'FINISHED' || m.status === 'LIVE'
                          ? `${m.homeScore} - ${m.awayScore}`
                          : 'VS'}
                      </div>
                      <div className="flex items-center gap-1.5 justify-start">
                        <TeamLogo logo={m.awayTeam.logo} name={m.awayTeam.name} className="w-4 h-4" />
                        <span className="text-xs font-bold text-white">{m.awayTeam.shortName}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Standings views: <code>vw_competition_summary</code></span>
            <span className="text-emerald-400 font-medium">Idempotent Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
