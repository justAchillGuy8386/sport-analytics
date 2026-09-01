'use client';

import React, { useState } from 'react';
import { calculateAsianHandicap, calculateOverUnder } from '@/utils/handicapSettlement';
import { HandicapResult } from '@/types/football';
import { useFootball } from '@/context/FootballContext';
import { Calculator, Percent, TrendingUp, ShieldCheck, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const BettingAnalyticsTab: React.FC = () => {
  const { matches } = useFootball();

  // Asian Handicap Calculator State
  const [calcHomeScore, setCalcHomeScore] = useState<number>(2);
  const [calcAwayScore, setCalcAwayScore] = useState<number>(1);
  const [calcHandicapLine, setCalcHandicapLine] = useState<number>(-0.75); // Home gives 0.75
  const [calcSelection, setCalcSelection] = useState<'HOME' | 'AWAY'>('HOME');

  const ahResult = calculateAsianHandicap(
    calcHomeScore,
    calcAwayScore,
    calcHandicapLine,
    calcSelection
  );

  // Over/Under Calculator State
  const [ouHomeScore, setOuHomeScore] = useState<number>(2);
  const [ouAwayScore, setOuAwayScore] = useState<number>(1);
  const [ouLine, setOuLine] = useState<number>(2.75);
  const [ouSelection, setOuSelection] = useState<'OVER' | 'UNDER'>('OVER');

  const ouResult = calculateOverUnder(
    ouHomeScore,
    ouAwayScore,
    ouLine,
    ouSelection
  );

  // Get real match odds history if available from API
  const sampleMatch = matches.find(m => m.oddsHistory && m.oddsHistory.length > 0) || matches[0];
  const oddsHistoryData = sampleMatch?.oddsHistory || [];

  const getResultBadge = (result: HandicapResult) => {
    switch (result) {
      case 'WIN':
        return <span className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg font-black text-sm">THẮNG KÈO (WIN 100%)</span>;
      case 'HALF_WIN':
        return <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-lg font-extrabold text-sm">THẮNG NỬA KÈO (HALF WIN +50%)</span>;
      case 'PUSH':
        return <span className="bg-slate-700 text-slate-200 px-3 py-1 rounded-lg font-bold text-sm">HÒA KÈO (PUSH - HOÀN TIỀN)</span>;
      case 'HALF_LOSS':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg font-extrabold text-sm">THUA NỬA KÈO (HALF LOSS -50%)</span>;
      case 'LOSS':
        return <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-black text-sm">THUA KÈO (LOSS 100%)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Betting Analytics &amp; Asian Handicap Settlement Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Module tính toán kết quả kèo Châu Á (quarter-ball `-0.25`, `-0.75`), Tài/Xỉu và phân tích biến động Odds theo chuẩn Section 10 của Spec.
            </p>
          </div>
        </div>
      </div>

      {/* Asian Handicap Interactive Calculator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Máy Tính Settlement Kèo Châu Á (Asian Handicap)</span>
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              Module Section 10
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Tỷ số Đội Nhà (Home):</label>
              <input
                type="number"
                min="0"
                value={calcHomeScore}
                onChange={(e) => setCalcHomeScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 text-white font-mono font-bold text-sm border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Tỷ số Đội Khách (Away):</label>
              <input
                type="number"
                min="0"
                value={calcAwayScore}
                onChange={(e) => setCalcAwayScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 text-white font-mono font-bold text-sm border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Mức Chấp (Handicap Line):</label>
              <select
                value={calcHandicapLine}
                onChange={(e) => setCalcHandicapLine(parseFloat(e.target.value))}
                className="w-full bg-slate-950 text-white font-mono text-xs border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value={0}>0.0 (Đồng banh)</option>
                <option value={-0.25}>-0.25 (Chủ chấp đồng nửa)</option>
                <option value={-0.5}>-0.5 (Chủ chấp nửa trái)</option>
                <option value={-0.75}>-0.75 (Chủ chấp 1/2-1 trái)</option>
                <option value={-1.0}>-1.0 (Chủ chấp 1 trái)</option>
                <option value={-1.25}>-1.25 (Chủ chấp 1-1.25 trái)</option>
                <option value={-1.5}>-1.5 (Chủ chấp 1.5 trái)</option>
                <option value={0.25}>+0.25 (Khách được chấp 1/4)</option>
                <option value={0.5}>+0.5 (Khách được chấp 1/2)</option>
                <option value={0.75}>+0.75 (Khách được chấp 3/4)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Lựa Chọn Đặt Kèo:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCalcSelection('HOME')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    calcSelection === 'HOME'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Chọn Chủ Nhà
                </button>
                <button
                  onClick={() => setCalcSelection('AWAY')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    calcSelection === 'AWAY'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Chọn Đội Khách
                </button>
              </div>
            </div>
          </div>

          {/* Outcome Result Card */}
          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
            <span className="text-xs text-slate-400">Kết quả Settlement:</span>
            <div>{getResultBadge(ahResult)}</div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Tỷ số {calcHomeScore}-{calcAwayScore} với kèo {calcHandicapLine > 0 ? `+${calcHandicapLine}` : calcHandicapLine} cho cửa {calcSelection}.
            </p>
          </div>
        </div>

        {/* Over/Under Settlement Calculator Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Máy Tính Settlement Kèo Tài / Xỉu (Over / Under)</span>
            </h3>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
              Goal Line Engine
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Tỷ số Đội Nhà:</label>
              <input
                type="number"
                min="0"
                value={ouHomeScore}
                onChange={(e) => setOuHomeScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 text-white font-mono font-bold text-sm border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Tỷ số Đội Khách:</label>
              <input
                type="number"
                min="0"
                value={ouAwayScore}
                onChange={(e) => setOuAwayScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 text-white font-mono font-bold text-sm border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Mốc Tài Xỉu (O/U Line):</label>
              <select
                value={ouLine}
                onChange={(e) => setOuLine(parseFloat(e.target.value))}
                className="w-full bg-slate-950 text-white font-mono text-xs border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value={2.0}>2.0 (2 Trái hòa)</option>
                <option value={2.25}>2.25 (2-2.5 Trái)</option>
                <option value={2.5}>2.5 (2 Trái rưỡi)</option>
                <option value={2.75}>2.75 (2.5-3 Trái)</option>
                <option value={3.0}>3.0 (3 Trái hòa)</option>
                <option value={3.25}>3.25 (3-3.5 Trái)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Lựa Chọn Đặt Kèo:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOuSelection('OVER')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    ouSelection === 'OVER'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  TÀI (OVER)
                </button>
                <button
                  onClick={() => setOuSelection('UNDER')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    ouSelection === 'UNDER'
                      ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  XỈU (UNDER)
                </button>
              </div>
            </div>
          </div>

          {/* Outcome Result Card */}
          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
            <span className="text-xs text-slate-400">Kết quả Settlement:</span>
            <div>{getResultBadge(ouResult)}</div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Tổng số bàn thắng: {ouHomeScore + ouAwayScore} bàn vs mốc {ouLine} ({ouSelection}).
            </p>
          </div>
        </div>
      </div>

      {/* Line Movement Tracker */}
      {oddsHistoryData.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>Theo Dõi Biến Động Odds Trước Trận (Odds Line Movement Tracker)</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oddsHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="homeWin" name="Chủ thắng (Home Win)" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="draw" name="Hòa (Draw)" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="awayWin" name="Khách thắng (Away Win)" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
