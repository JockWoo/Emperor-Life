import React from 'react';
import { YearlyTurnResult, CountryId, Country } from '../types/game';

interface YearSummaryModalProps {
  turnResult: YearlyTurnResult;
  playerCountry: Country;
  onProceed: () => void;
}

export const YearSummaryModal: React.FC<YearSummaryModalProps> = ({
  turnResult,
  playerCountry,
  onProceed
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#121622] border-2 border-amber-600/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 text-gray-200 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-amber-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              歲末年報
            </span>
            <h2 className="text-2xl font-black text-white font-serif tracking-wider">
              在位第 {turnResult.year - 1} 年
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">君主年齡</div>
            <div className="text-xl font-bold text-amber-300 font-mono">
              {playerCountry.ruler.currentAge} 歲
            </div>
          </div>
        </div>

        {/* Player Effects Highlights */}
        {turnResult.playerEffectsSummary.length > 0 && (
          <div className="bg-black/50 border border-gray-800 rounded-lg p-3 text-xs">
            <div className="text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
              <span>🏛️</span>
              <span>廷議決策結果</span>
            </div>
            <ul className="space-y-1 text-gray-300">
              {turnResult.playerEffectsSummary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 年度目標結算 */}
        {turnResult.goalResult && (
          <div
            className={`rounded-lg p-3 text-xs border ${
              turnResult.goalResult.success
                ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                : 'bg-red-950/20 border-red-900/50 text-red-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>🎯</span>
              <span>
                年度目標「{turnResult.goalResult.goal.title}」
                {turnResult.goalResult.success ? '：達成！' : '：未達成'}
              </span>
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {turnResult.goalResult.success
                ? `獎勵：${turnResult.goalResult.rewardLogs.join('、') || turnResult.goalResult.goal.rewardText}`
                : turnResult.goalResult.goal.description}
            </div>
          </div>
        )}

        {/* Military Battles of the Year */}
        {turnResult.wars.length > 0 && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-xs">
            <div className="text-red-400 font-bold mb-1.5 flex items-center gap-1.5">
              <span>⚔️</span>
              <span>年度戰役交鋒</span>
            </div>
            <div className="space-y-1.5">
              {turnResult.wars.map((w, idx) => (
                <div key={idx} className="text-gray-300 flex items-center justify-between bg-black/40 p-2 rounded">
                  <span>{w.summary}</span>
                  <span className="text-red-400 font-mono text-[11px] whitespace-nowrap ml-2">
                    傷亡：{w.attackerCasualties + w.defenderCasualties} 萬
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deceased Characters */}
        {turnResult.deceasedCharacters.length > 0 && (
          <div className="bg-gray-900/70 border border-gray-700/60 rounded-lg p-3 text-xs">
            <div className="text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
              <span>🕯️</span>
              <span>重臣逝世誌哀</span>
            </div>
            <ul className="space-y-1 text-gray-400">
              {turnResult.deceasedCharacters.map((msg, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span>🕊️</span>
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* World News Snippets */}
        <div className="bg-black/40 border border-gray-800 rounded-lg p-3 text-xs flex-1 max-h-48 overflow-y-auto">
          <div className="text-cyan-400 font-bold mb-1.5 flex items-center gap-1.5">
            <span>📜</span>
            <span>天下消息速遞</span>
          </div>
          {turnResult.news.length === 0 ? (
            <div className="text-gray-500 italic">天下各方今年大體平靜，無特大動盪。</div>
          ) : (
            <ul className="space-y-1.5">
              {turnResult.news.map((n) => (
                <li key={n.id} className="text-gray-300 flex items-start gap-1.5">
                  <span className="text-cyan-500">•</span>
                  <span>{n.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={onProceed}
          className="w-full py-3 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-sm tracking-wider rounded-xl shadow-lg transition-all duration-150 hover:scale-[1.01] active:scale-95 cursor-pointer mt-1"
        >
          進入下一年 (第 {turnResult.year} 年) ›
        </button>
      </div>
    </div>
  );
};
