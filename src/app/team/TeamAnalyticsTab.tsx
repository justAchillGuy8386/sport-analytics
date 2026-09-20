'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { TeamLogo } from '@/components/TeamLogo';
import { Team, LeagueCode } from '@/types/football';
import { COMPETITIONS } from '@/constants/competitions';
import { slugifyTeam, findTeamBySlugOrId } from '@/utils/teamSlug';
import { 
  Home, Target, AlertCircle, Shield, Trophy, 
  TrendingUp, Activity, ExternalLink, Flame
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

interface TeamAnalyticsTabProps {
  initialTeamSlugOrId?: string;
}

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

  // Goals
  const homeGoalsScored = homeFinished.reduce((acc, m) => acc + (m.homeScore || 0), 0);
  const homeGoalsConceded = homeFinished.reduce((acc, m) => acc + (m.awayScore || 0), 0);

  const awayGoalsScored = awayFinished.reduce((acc, m) => acc + (m.awayScore || 0), 0);
  const awayGoalsConceded = awayFinished.reduce((acc, m) => acc + (m.homeScore || 0), 0);

  const totalGoalsScored = homeGoalsScored + awayGoalsScored;
  const totalGoalsConceded = homeGoalsConceded + awayGoalsConceded;
  const goalDiff = totalGoalsScored - totalGoalsConceded;

  // Clean sheets
  const homeCleanSheets = homeFinished.filter(m => (m.awayScore ?? 0) === 0).length;
  const awayCleanSheets = awayFinished.filter(m => (m.homeScore ?? 0) === 0).length;
  const totalCleanSheets = homeCleanSheets + awayCleanSheets;
  const cleanSheetRate = finishedMatches.length > 0 
    ? Math.round((totalCleanSheets / finishedMatches.length) * 100) 
    : 0;

  const winRate = finishedMatches.length > 0
    ? Math.round((totalWins / finishedMatches.length) * 100)
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
    <div className="space-y-6">
      {/* Team Selection Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex items-center justify-center shrink-0">
            <TeamLogo logo={activeTeam.logo} name={activeTeam.name} className="w-12 h-12" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-white">{activeTeam.name}</h2>
              {activeTeam.shortName && (
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono font-bold">
                  {activeTeam.shortName}
                </span>
              )}
              {competitionInfo && (
                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span>{competitionInfo.flag}</span>
                  <span>{competitionInfo.name}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sân vận động: <strong className="text-slate-200">{activeTeam.stadium || 'Chưa cập nhật'}</strong> • 
              URL: <code className="text-emerald-400 font-mono text-[11px] ml-1">/team/{slugifyTeam(activeTeam.name)}</code>
            </p>
          </div>
        </div>

        {/* Team Selector Dropdown */}
        <div className="w-full sm:w-auto">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            Chọn Câu Lạc Bộ Phân Tích:
          </label>
          <select
            value={activeTeam.id}
            onChange={(e) => handleSelectTeam(e.target.value)}
            className="w-full sm:w-72 bg-slate-950 text-white font-semibold text-xs border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-inner"
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
            {/* Any teams with non-standard leagueId */}
            {teamList.some(t => !leaguesOrder.includes(t.leagueId)) && (
              <optgroup label="Khác">
                {teamList.filter(t => !leaguesOrder.includes(t.leagueId)).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up animation-delay-100">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Tổng Trận Thống Kê</span>
            <Activity className="w-4 h-4 text-amber-400 opacity-60" />
          </div>
          <div className="text-2xl font-black text-amber-400">{teamMatches.length} trận</div>
          <span className="text-[11px] text-slate-500">
            {finishedMatches.length} đã đá • {teamMatches.length - finishedMatches.length} sắp diễn ra
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Thành Tích (T-H-B)</span>
            <Trophy className="w-4 h-4 text-emerald-400 opacity-60" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {totalWins}W - {totalDraws}D - {totalLosses}L
          </div>
          <span className="text-[11px] text-slate-500">
            Tỷ lệ thắng: <strong className="text-emerald-400">{winRate}%</strong>
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Bàn Thắng / Thủng Lưới</span>
            <Target className="w-4 h-4 text-cyan-400 opacity-60" />
          </div>
          <div className="text-2xl font-black text-cyan-400">
            {totalGoalsScored} / {totalGoalsConceded}
          </div>
          <span className="text-[11px] text-slate-500">
            Hiệu số: <strong className={goalDiff > 0 ? 'text-emerald-400' : goalDiff < 0 ? 'text-red-400' : 'text-slate-300'}>
              {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
            </strong>
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Giữ Sạch Lưới (Clean Sheets)</span>
            <Shield className="w-4 h-4 text-teal-400 opacity-60" />
          </div>
          <div className="text-2xl font-black text-teal-400">{totalCleanSheets} trận</div>
          <span className="text-[11px] text-slate-500">
            Tỷ lệ sạch lưới: <strong className="text-teal-400">{cleanSheetRate}%</strong>
          </span>
        </div>
      </div>

      {/* Home vs Away Analysis Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animation-delay-200">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-400" />
              <span>Phân Tích Hiệu Suất Sân Nhà vs Sân Khách (Home / Away)</span>
            </h3>
          </div>
          <div className="h-64">
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
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Thành tích Sân Nhà</span>
              <span className="font-bold text-slate-200">
                {homeWins} Thắng - {homeDraws} Hoà - {homeLosses} Bại
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Ghi {homeGoalsScored} bàn • Thủng lưới {homeGoalsConceded} bàn
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Thành tích Sân Khách</span>
              <span className="font-bold text-slate-200">
                {awayWins} Thắng - {awayDraws} Hoà - {awayLosses} Bại
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Ghi {awayGoalsScored} bàn • Thủng lưới {awayGoalsConceded} bàn
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Attack & Defense Metrics & Recent Form */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Chỉ Số Tấn Công &amp; Kiểm Soát Chi Tiết</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400">Kiểm Soát Bóng Trung Bình (Possession)</span>
                  <span className="text-emerald-400 font-bold font-mono">{avgPossession}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(10, avgPossession))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400">Tỷ Lệ Giữ Sạch Lưới (Clean Sheet Rate)</span>
                  <span className="text-teal-400 font-bold font-mono">{cleanSheetRate}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(5, cleanSheetRate))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400">Tỷ Lệ Giành Chiến Thắng (Win Rate)</span>
                  <span className="text-amber-400 font-bold font-mono">{winRate}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(5, winRate))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recent 5 Matches Box */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Các Trận Đã Đấu Gần Đây
              </span>
              {recentMatches.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Chưa có trận đấu đã kết thúc cho câu lạc bộ này.</p>
              ) : (
                <div className="space-y-1.5">
                  {recentMatches.map(m => {
                    const isHome = m.homeTeam?.id === activeTeam.id;
                    const opponent = isHome ? m.awayTeam : m.homeTeam;
                    const teamScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
                    const oppScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
                    const isWin = teamScore > oppScore;
                    const isDraw = teamScore === oppScore;

                    return (
                      <div 
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                            isWin 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                              : isDraw 
                              ? 'bg-slate-700/40 text-slate-300 border border-slate-600/40' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/40'
                          }`}>
                            {isWin ? 'W' : isDraw ? 'D' : 'L'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {isHome ? 'vs' : '@'}
                          </span>
                          <TeamLogo logo={opponent?.logo} name={opponent?.name} className="w-4 h-4 shrink-0" />
                          <span className="font-semibold text-slate-200 truncate max-w-[130px] sm:max-w-[180px]">
                            {opponent?.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono font-bold">
                          <span className={isWin ? 'text-emerald-400' : isDraw ? 'text-slate-300' : 'text-red-400'}>
                            {teamScore} - {oppScore}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {isHome ? '(H)' : '(A)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Dữ liệu: Real Goal API Matches</span>
            <span className="text-emerald-400 font-medium">Auto-Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
