'use client';

import React, { useState, useEffect } from 'react';
import { Match } from '@/types/football';
import { TeamLogo } from '@/components/TeamLogo';
import { getLiveMinute } from '@/utils/matchTime';
import { useFootball } from '@/context/FootballContext';
import { Swords, Clock, MapPin, User, Activity, AlertCircle, Calendar, RefreshCw } from 'lucide-react';

const formatMatchDateTime = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekday = days[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${weekday}, ${day}/${month}/${year} • ${hours}:${minutes}`;
  } catch {
    return dateStr || '';
  }
};

const formatShortDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return '';
  }
};

interface MatchCenterTabProps {
  matches: Match[];
  selectedMatchId?: string;
}

export const MatchCenterTab: React.FC<MatchCenterTabProps> = ({
  matches,
  selectedMatchId
}) => {
  const { updateMatch } = useFootball();
  const [isSyncing, setIsSyncing] = useState(false);

  const matchDataList = matches || [];

  const [activeMatchId, setActiveMatchId] = useState<string>(
    selectedMatchId || matchDataList[0]?.id || ''
  );

  // Sync activeMatchId ONLY when parent explicitly changes selectedMatchId prop
  useEffect(() => {
    if (selectedMatchId && matchDataList.some(m => m.id === selectedMatchId)) {
      setActiveMatchId(selectedMatchId);
    }
  }, [selectedMatchId, matchDataList]);

  // Ensure activeMatchId is valid when match list loads/updates
  useEffect(() => {
    if (matchDataList.length > 0 && !matchDataList.some(m => m.id === activeMatchId)) {
      setActiveMatchId(matchDataList[0].id);
    }
  }, [matches, activeMatchId, matchDataList]);

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-400 space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
        <p className="text-sm font-medium">Hiện không có trận đấu nào được chọn.</p>
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

  const isStatsMissing = activeMatch.status === 'FINISHED' && (
    (safeStats.home.shots === 0 && safeStats.away.shots === 0 && safeStats.home.corners === 0 && safeStats.away.corners === 0) ||
    ((activeMatch.homeScore ?? 0) + (activeMatch.awayScore ?? 0) > 0 && 
     (events || []).filter(e => e.type === 'goal').length < ((activeMatch.homeScore ?? 0) + (activeMatch.awayScore ?? 0)))
  );

  const handleSyncMatchDetails = async () => {
    if (isSyncing || !activeMatch?.id) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/admin/sync?fixtureId=${activeMatch.id}`);
      const data = await res.json();
      if (data.success && data.match) {
        updateMatch(data.match);
      }
    } catch (err) {
      console.error('Failed to sync match details:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Selector Strip */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 border-b border-slate-800 animate-fade-in-up">
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
            {m.date && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline" suppressHydrationWarning>
                {formatShortDate(m.date)}
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              m.status === 'LIVE' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-300'
            }`}>
              {m.status === 'LIVE' ? getLiveMinute(m) : m.status}
            </span>
          </button>
        ))}
      </div>

      {/* Match Header Scoreboard */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden animate-fade-in-up animation-delay-100">
        {/* Match Top Bar: League, Round, Venue locked to left */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 sm:mb-4 border-b border-slate-800/80 pb-2.5 sm:pb-3 gap-2 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 overflow-hidden">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono text-[10px] sm:text-[11px] shrink-0">
              {activeMatch.leagueId} • {activeMatch.season}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-300 shrink-0">{activeMatch.round}</span>
            {activeMatch.venue && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 truncate min-w-0">
                <span className="text-slate-600 shrink-0">•</span>
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{activeMatch.venue}</span>
              </span>
            )}
          </div>

          {activeMatch.referee && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 shrink-0">
              <User className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate max-w-[150px]">{activeMatch.referee}</span>
            </span>
          )}
        </div>

        {/* Status / LIVE Badge - Directly below the divider line on the left */}
        <div className="flex items-center justify-between pt-0.5 pb-1">
          {activeMatch.status === 'LIVE' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-bold animate-pulse font-mono shadow-sm shadow-red-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              <span>LIVE • {getLiveMinute(activeMatch)}</span>
            </span>
          ) : activeMatch.status === 'FINISHED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] sm:text-xs font-semibold font-mono">
              FT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-semibold font-mono">
              SẮP ĐẤU
            </span>
          )}
        </div>

        {/* Score Display - Perfectly Balanced with Team Logos */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center my-1 sm:my-3 gap-2 sm:gap-6 max-w-4xl mx-auto">
          {/* Home Team */}
          <div className="flex items-center justify-end gap-2 sm:gap-3.5 min-w-0">
            <span className="text-xs sm:text-lg md:text-xl font-black text-white text-right truncate">
              {homeTeam.name}
            </span>
            <div className="p-1.5 sm:p-2.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-md shrink-0 flex items-center justify-center">
              <TeamLogo logo={homeTeam.logo} name={homeTeam.name} className="w-8 h-8 sm:w-14 sm:h-14 object-contain" />
            </div>
          </div>

          {/* Center Column: Score + Date & Time */}
          <div className="flex flex-col items-center justify-center shrink-0 gap-1 sm:gap-1.5 px-1 sm:px-3">
            {/* Score Box */}
            {activeMatch.status === 'FINISHED' || activeMatch.status === 'LIVE' ? (
              <div className="bg-slate-950/90 px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-2xl border border-slate-800/80 shadow-inner flex items-center gap-2 sm:gap-3.5 font-mono font-black text-white text-2xl sm:text-4xl md:text-5xl tracking-wider">
                <span>{homeScore}</span>
                <span className="text-emerald-500 font-bold text-lg sm:text-2xl">-</span>
                <span>{awayScore}</span>
              </div>
            ) : (
              <div className="bg-slate-950/90 px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl border border-slate-800/80 font-mono font-bold text-slate-400 text-base sm:text-xl">
                VS
              </div>
            )}

            {/* Thời gian + ngày tháng chính giữa dưới tỉ số */}
            {activeMatch.date && (
              <span 
                suppressHydrationWarning
                className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 font-medium font-mono text-center whitespace-nowrap"
              >
                <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                <span>{formatMatchDateTime(activeMatch.date)}</span>
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-start gap-2 sm:gap-3.5 min-w-0">
            <div className="p-1.5 sm:p-2.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-md shrink-0 flex items-center justify-center">
              <TeamLogo logo={awayTeam.logo} name={awayTeam.name} className="w-8 h-8 sm:w-14 sm:h-14 object-contain" />
            </div>
            <span className="text-xs sm:text-lg md:text-xl font-black text-white text-left truncate">
              {awayTeam.name}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animation-delay-200">
        {/* Match Statistics Progress Bars */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thống Kê Chi Tiết Trận Đấu (Match Statistics)</span>
            </h3>

            {isStatsMissing && (
              <button
                onClick={handleSyncMatchDetails}
                disabled={isSyncing}
                title="Bấm để đồng bộ đầy đủ các chỉ số cú sút, phạt góc và diễn biến từ Goal API"
                className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang cập nhật...' : 'Lấy đủ chỉ số trận này'}</span>
              </button>
            )}
          </div>

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
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Diễn Biến Chính Trận Đấu (Match Timeline)</span>
              </h3>

              {isStatsMissing && (
                <button
                  onClick={handleSyncMatchDetails}
                  disabled={isSyncing}
                  title="Bấm để đồng bộ đầy đủ diễn biến bàn thắng, thẻ phạt từ Goal API"
                  className="text-[11px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang cập nhật...' : 'Cập nhật diễn biến'}</span>
                </button>
              )}
            </div>

            {/* Timeline Team Headers */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 max-w-[42%] overflow-hidden">
                <TeamLogo logo={homeTeam.logo} name={homeTeam.name} className="w-5 h-5 shrink-0" />
                <span className="font-bold text-white truncate">{homeTeam.shortName || homeTeam.name}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-950 rounded-full border border-slate-800">
                Phút
              </span>
              <div className="flex items-center gap-2 justify-end max-w-[42%] overflow-hidden">
                <span className="font-bold text-white truncate">{awayTeam.shortName || awayTeam.name}</span>
                <TeamLogo logo={awayTeam.logo} name={awayTeam.name} className="w-5 h-5 shrink-0" />
              </div>
            </div>

            <div className="space-y-3 relative before:absolute before:left-1/2 before:top-1 before:bottom-1 before:-translate-x-1/2 before:w-0.5 before:bg-slate-800">
              {events && events.length > 0 ? (
                events.map((ev) => {
                  const isHomeEvent = 
                    ev.teamId === 'home' || 
                    ev.teamId === '1' || 
                    String(ev.teamId) === String(homeTeam.id) ||
                    String(ev.teamId).toLowerCase() === 'home' ||
                    (homeTeam.name && String(ev.teamId).toLowerCase() === homeTeam.name.toLowerCase());

                  const eventIcon = (() => {
                    switch (ev.type) {
                      case 'goal':
                        return <span className="text-emerald-400 font-bold text-xs" title="Bàn thắng">⚽</span>;
                      case 'yellow_card':
                        return <span className="inline-block w-2.5 h-3.5 bg-amber-400 rounded-[2px] shadow-xs" title="Thẻ vàng"></span>;
                      case 'red_card':
                        return <span className="inline-block w-2.5 h-3.5 bg-red-500 rounded-[2px] shadow-xs" title="Thẻ đỏ"></span>;
                      case 'substitution':
                        return <span className="text-cyan-400 text-xs font-bold" title="Thay người">🔄</span>;
                      default:
                        return <span className="text-slate-400 text-xs">⚡</span>;
                    }
                  })();

                  const eventLabel = (() => {
                    switch (ev.type) {
                      case 'goal': return 'Bàn thắng';
                      case 'yellow_card': return 'Thẻ vàng';
                      case 'red_card': return 'Thẻ đỏ';
                      case 'substitution': return 'Thay người';
                      default: return ev.type;
                    }
                  })();

                  return (
                    <div key={ev.id} className="flex items-center text-xs py-1">
                      {/* Left Column: Home Team Event */}
                      <div className="flex-1 flex items-center justify-end gap-2 pr-3 text-right overflow-hidden min-w-0">
                        {isHomeEvent && (
                          <div className="overflow-hidden">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="font-bold text-white truncate text-xs">{ev.player}</span>
                              {eventIcon}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {ev.assistPlayer ? `Kiến tạo: ${ev.assistPlayer}` : (ev.detail || eventLabel)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Center Axis: Time Badge */}
                      <div className="w-9 flex justify-center items-center shrink-0 relative z-10">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shadow-md border ${
                          ev.type === 'goal'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : ev.type === 'red_card'
                            ? 'bg-red-500/20 text-red-300 border-red-500/50'
                            : ev.type === 'yellow_card'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {ev.time}'
                        </span>
                      </div>

                      {/* Right Column: Away Team Event */}
                      <div className="flex-1 flex items-center justify-start gap-2 pl-3 text-left overflow-hidden min-w-0">
                        {!isHomeEvent && (
                          <div className="overflow-hidden">
                            <div className="flex items-center justify-start gap-1.5">
                              {eventIcon}
                              <span className="font-bold text-white truncate text-xs">{ev.player}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {ev.assistPlayer ? `Kiến tạo: ${ev.assistPlayer}` : (ev.detail || eventLabel)}
                            </span>
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
            Events Data Source: Goal API Live Feeds
          </div>
        </div>
      </div>
    </div>
  );
};
