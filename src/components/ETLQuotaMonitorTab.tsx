'use client';

import React, { useState } from 'react';
import { ETLRunLog } from '@/types/football';
import { useFootball } from '@/context/FootballContext';
import { Database, Activity, Play, RefreshCw, Cpu, Server, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

interface ETLQuotaMonitorTabProps {
  quotaUsed: number;
  setQuotaUsed?: (quota: any) => void;
}

export const ETLQuotaMonitorTab: React.FC<ETLQuotaMonitorTabProps> = ({
  quotaUsed,
  setQuotaUsed
}) => {
  const { refreshQuota, apiKey } = useFootball();
  const [logs, setLogs] = useState<ETLRunLog[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  const remainingQuota = 100 - quotaUsed;

  const handleTriggerETL = async () => {
    if (quotaUsed >= 100) return;
    setIsExecuting(true);
    setSyncStatusMsg('');

    try {
      // Call admin sync endpoint to fetch fresh matches from API-Football & save straight to Supabase DB
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await res.json();

      if (data.success) {
        setSyncStatusMsg(data.message || 'Đã nạp sạch dữ liệu mới vào Supabase DB!');
        const newLog: ETLRunLog = {
          id: `sync-${101 + logs.length}`,
          timestamp: new Date().toISOString(),
          trigger: 'Manual',
          requestsUsed: quotaUsed,
          requestsRemaining: Math.max(0, 100 - quotaUsed),
          activeLiveMatches: 0,
          status: 'Success',
          details: data.message || 'Đã nạp dữ liệu từ API-Football trực tiếp vào Supabase Database.'
        };
        setLogs([newLog, ...logs]);
      } else {
        setSyncStatusMsg(`❌ Lỗi: ${data.message || data.error}`);
      }
      await refreshQuota();
    } catch (e: any) {
      console.error(e);
      setSyncStatusMsg(`❌ Lỗi đồng bộ: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const SQL_VIEWS = [
    { name: 'vw_competition_summary', desc: 'Tổng hợp chỉ số bàn thắng, góc, thẻ theo từng giải đấu.' },
    { name: 'vw_team_season_stats', desc: 'Thống kê tổng hợp mùa giải của từng đội bóng.' },
    { name: 'vw_team_home_away_stats', desc: 'So sánh chỉ số Sân nhà (Home) vs Sân khách (Away).' },
    { name: 'vw_match_summary', desc: 'Tỷ số, thời gian, sự kiện và thống kê trận đấu.' },
    { name: 'vw_betting_settlement', desc: 'Kết quả settlement Kèo Châu Á, Tài/Xỉu và tỷ lệ ăn.' },
    { name: 'vw_odds_movement', desc: 'Theo dõi chuỗi biến động kèo trước và trong trận.' },
    { name: 'vw_live_matches', desc: 'Truy vấn các trận đang LIVE để Smart Polling cập nhật.' }
  ];

  return (
    <div className="space-y-6">
      {/* Quota Header & Smart Polling State Machine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>API Quota Guard (100 Requests/Ngày)</span>
              </h3>
              <button 
                onClick={() => refreshQuota()} 
                title="Làm mới Quota thực tế từ database"
                className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 animate-spin-slow" /> Đồng bộ API
              </button>
            </div>

            <div className="my-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-3xl font-black text-white font-mono">{quotaUsed} <span className="text-sm text-slate-400 font-normal">/ 100 req</span></span>
                <span className={`text-xs font-mono font-bold ${remainingQuota < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  Còn lại: {remainingQuota} req
                </span>
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quotaUsed >= 90 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${quotaUsed}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Dữ liệu Quota được đọc trực tiếp từ HTTP Response Headers &amp; endpoint <code>/status</code> thực tế của API-Football.
            </p>
          </div>

          {syncStatusMsg && (
            <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          <button
            onClick={handleTriggerETL}
            disabled={isExecuting || quotaUsed >= 100}
            className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isExecuting
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                <span>Đang nạp dữ liệu từ API-Football vào Supabase DB...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>⚡ Nạp Trận Đấu Mới Vào Supabase DB</span>
              </>
            )}
          </button>
        </div>

        {/* Smart Polling Strategy Machine */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Mô Hình Smart Polling &amp; Data Lifecycle (Section 5)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-cyan-400 font-bold block mb-1">UPCOMING</span>
              <p className="text-slate-400 text-[11px]">Lấy lịch theo batch 1 lần/ngày. Không poll liên tục.</p>
              <span className="text-[10px] text-slate-500 mt-2 block font-mono">Quota cost: Low</span>
            </div>

            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl">
              <span className="text-red-400 font-bold block mb-1 animate-pulse">LIVE (Ưu tiên)</span>
              <p className="text-slate-300 text-[11px]">Poll 10-15 phút/lần cho các trận đang đá.</p>
              <span className="text-[10px] text-red-300 mt-2 block font-mono">Quota cost: Priority</span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-emerald-400 font-bold block mb-1">FINISHED</span>
              <p className="text-slate-400 text-[11px]">Chạy 1 lần Reconciliation lấy final data, sau đó ngắt poll.</p>
              <span className="text-[10px] text-slate-500 mt-2 block font-mono">Quota cost: 1 final req</span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-purple-400 font-bold block mb-1">CANCELLED</span>
              <p className="text-slate-400 text-[11px]">Cập nhật trạng thái hoãn/hủy trận và dừng poll.</p>
              <span className="text-[10px] text-slate-500 mt-2 block font-mono">Quota cost: 0</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Scheduled Cron: <code>cron: "*/10 11-23 * * *"</code> via GitHub Actions scheduled workflow.</span>
          </div>
        </div>
      </div>

      {/* SQL Analytics Views Catalog */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          <span>Danh Sách SQL Analytics Views Trong Hệ Thống (Section 17)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {SQL_VIEWS.map((view, idx) => (
            <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <span className="text-emerald-400 font-mono font-bold block mb-1">{view.name}</span>
              <p className="text-slate-400 text-[11px]">{view.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ETL Run Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Nhật Ký ETL Pipeline &amp; Smart Polling (etl_runs)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Total Runs: {logs.length}</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs italic">
            Chưa có nhật ký Manual ETL Run nào. Bấm nút "⚡ Nạp Trận Đấu Mới Vào Supabase DB" ở trên để nạp trận mới nhất.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Run ID</th>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-3">Trigger</th>
                  <th className="py-3 px-3 text-center">Request Đã Dùng</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                  <th className="py-3 px-4">Chi Tiết Exec Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-emerald-400 font-bold">{log.id}</td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-3 text-slate-300">{log.trigger}</td>
                    <td className="py-3 px-3 text-center text-amber-400 font-bold">{quotaUsed}/100</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'Success'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
