'use client';

import React, { useState } from 'react';
import { TEAMS, MATCHES, STANDINGS_DATA } from '@/data/mockData';
import { TeamLogo } from '@/components/TeamLogo';
import { Users, Shield, Target, Flame, Percent, Home, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const TeamAnalyticsTab: React.FC = () => {
  const teamList = Object.values(TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ARS');

  const team = TEAMS[selectedTeamId] || teamList[0];

  // Find standings item for this team across all leagues
  let standingInfo = null;
  for (const leagueCode in STANDINGS_DATA) {
    const found = STANDINGS_DATA[leagueCode].find(s => s.team.id === team.id);
    if (found) {
      standingInfo = found;
      break;
    }
  }

  // Find matches involving this team
  const teamMatches = MATCHES.filter(
    m => m.homeTeam.id === team.id || m.awayTeam.id === team.id
  );

  const homeMatches = teamMatches.filter(m => m.homeTeam.id === team.id && m.status === 'FINISHED');
  const awayMatches = teamMatches.filter(m => m.awayTeam.id === team.id && m.status === 'FINISHED');

  const homeWins = homeMatches.filter(m => m.homeScore! > m.awayScore!).length;
  const awayWins = awayMatches.filter(m => m.awayScore! > m.homeScore!).length;

  const homeGoalsScored = homeMatches.reduce((acc, m) => acc + (m.homeScore || 0), 0);
  const awayGoalsScored = awayMatches.reduce((acc, m) => acc + (m.awayScore || 0), 0);

  const splitData = [
    { category: 'Sân Nhà (Home)', wins: homeWins, goals: homeGoalsScored, matches: homeMatches.length || 1 },
    { category: 'Sân Khách (Away)', wins: awayWins, goals: awayGoalsScored, matches: awayMatches.length || 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Team Selection Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex items-center justify-center">
            <TeamLogo logo={team.logo} name={team.name} className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{team.name}</h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
                {team.shortName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sân vận động: <strong>{team.stadium}</strong> • Giải đấu: <strong>{team.leagueId}</strong>
            </p>
          </div>
        </div>

        {/* Team Selector Dropdown */}
        <div className="w-full sm:w-auto">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Chọn Đội Bóng Phân Tích:</label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full sm:w-64 bg-slate-950 text-white font-semibold text-xs border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
          >
            {teamList.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.leagueId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Standings Summary Card & Form */}
      {standingInfo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Xếp Hạng Hiện Tại</span>
            <div className="text-2xl font-black text-amber-400">Top #{standingInfo.rank}</div>
            <span className="text-[11px] text-slate-500">{team.leagueId} Season 2026/27</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Điểm Số (Points)</span>
            <div className="text-2xl font-black text-emerald-400">{standingInfo.points} pts</div>
            <span className="text-[11px] text-slate-500">{standingInfo.played} trận đã đấu</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Hiệu Số Bàn Thắng</span>
            <div className="text-2xl font-black text-cyan-400">
              {standingInfo.goalDifference > 0 ? `+${standingInfo.goalDifference}` : standingInfo.goalDifference}
            </div>
            <span className="text-[11px] text-slate-500">{standingInfo.goalsFor} BT / {standingInfo.goalsAgainst} BB</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Phong Độ 5 Trận Gần Nhất</span>
            <div className="flex items-center gap-1.5 mt-2">
              {standingInfo.form.map((res, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-md text-xs font-black flex items-center justify-center ${
                    res === 'W' ? 'bg-emerald-500 text-slate-950' : res === 'D' ? 'bg-slate-700 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Home vs Away Analysis Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-400" />
            <span>Phân Tích Hiệu Suất Sân Nhà vs Sân Khách (Home/Away Split)</span>
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={splitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="wins" name="Số trận thắng" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="goals" name="Số bàn ghi được" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Attack & Defense Metrics */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Chỉ Số Tấn Công & Phòng Ngự Chi Tiết</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Kiểm Soát Bóng Trung Bình (Possession)</span>
                  <span className="text-emerald-400 font-bold font-mono">56.5%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '56.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Tỷ Lệ Giữ Sạch Lưới (Clean Sheet Rate)</span>
                  <span className="text-teal-400 font-bold font-mono">40.0%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Tỷ Lệ Thắng Kèo Châu Á (Handicap Cover Rate)</span>
                  <span className="text-amber-400 font-bold font-mono">75.0%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            View Analytics SQL: <code>vw_team_home_away_stats</code>
          </div>
        </div>
      </div>
    </div>
  );
};
