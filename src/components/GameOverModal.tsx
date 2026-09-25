import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameOverReason, GameStats, HistoryRecord, Country } from '../types/game';

interface GameOverModalProps {
  reason: GameOverReason;
  stats: GameStats;
  historyLog: HistoryRecord[];
  playerCountry: Country;
  seed: string;
  onRestartSameSeed: () => void;
  onNewSeedGame: () => void;
  onSelectAnotherRuler: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  stats,
  historyLog,
  playerCountry,
  seed,
  onRestartSameSeed,
  onNewSeedGame,
  onSelectAnotherRuler
}) => {
  const ruler = playerCountry.ruler;
  const yearsRuled = historyLog.length;

  useEffect(() => {
    if (reason.victory) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [reason.victory]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-[#11141e] border-2 border-amber-600/70 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-gray-200 relative my-8">
        {/* Imperial Gold Top Trim */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 ${
            reason.victory
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500'
              : 'bg-gradient-to-r from-red-600 via-stone-700 to-zinc-800'
          }`}
        />

        {/* Header Title */}
        <div className="text-center pt-2">
          <div className="text-4xl mb-2">{reason.victory ? '👑' : '⚰️'}</div>
          <div className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold mb-1">
            Historical Imperial Chronicle · 帝王列傳
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-500 font-serif tracking-widest">
            THE LIFE OF {ruler.name.toUpperCase()}
          </h2>
          <div className="text-sm font-bold text-gray-300 mt-1">
            {reason.title}
          </div>
          <p className="text-xs text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
            {reason.description}
          </p>
        </div>

        {/* Life Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/50 p-4 rounded-xl border border-gray-800 text-center font-mono">
          <div className="p-2 bg-[#171b26] rounded border border-gray-800">
            <div className="text-[11px] text-gray-400 font-sans">Age at Demise</div>
            <div className="text-2xl font-bold text-amber-300">{ruler.currentAge}</div>
          </div>
          <div className="p-2 bg-[#171b26] rounded border border-gray-800">
            <div className="text-[11px] text-gray-400 font-sans">Years Ruled</div>
            <div className="text-2xl font-bold text-yellow-300">{yearsRuled}</div>
          </div>
          <div className="p-2 bg-[#171b26] rounded border border-gray-800">
            <div className="text-[11px] text-gray-400 font-sans">Max Realm Area</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.maxTerritoryPct}%</div>
          </div>
          <div className="p-2 bg-[#171b26] rounded border border-gray-800">
            <div className="text-[11px] text-gray-400 font-sans">Max Population</div>
            <div className="text-2xl font-bold text-cyan-400">{stats.maxPopulation}M</div>
          </div>
        </div>

        {/* Military Campaign Records */}
        <div className="flex items-center justify-around bg-red-950/20 border border-red-900/40 rounded-xl p-3 text-xs text-center">
          <div>
            <span className="text-gray-400">Total Wars: </span>
            <span className="font-bold text-white font-mono text-sm">{stats.warsStarted}</span>
          </div>
          <div className="text-emerald-400">
            <span className="text-gray-400">Triumphs: </span>
            <span className="font-bold font-mono text-sm">{stats.warsWon}</span>
          </div>
          <div className="text-red-400">
            <span className="text-gray-400">Defeats: </span>
            <span className="font-bold font-mono text-sm">{stats.warsLost}</span>
          </div>
          <div>
            <span className="text-gray-400">Win Rate: </span>
            <span className="font-bold text-amber-300 font-mono text-sm">
              {stats.warsStarted > 0 ? `${Math.round((stats.warsWon / stats.warsStarted) * 100)}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Major Chronicle Timeline */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>📜</span>
            <span>Historical Annals & Major Events (帝王起居注)</span>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-4 max-h-56 overflow-y-auto space-y-3 text-xs">
            {historyLog.slice().reverse().map((record) => (
              <div key={record.year} className="border-l-2 border-amber-600/70 pl-3 relative">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-500" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300 font-mono">Year {record.year}:</span>
                  <span className="font-semibold text-white">{record.eventTitle}</span>
                  <span className="text-[10px] text-gray-500 font-mono">(Age {record.rulerAge})</span>
                </div>
                <div className="text-gray-300 text-[11px] mt-0.5">{record.choiceMade}</div>
                {record.highlights.length > 0 && (
                  <div className="text-[10px] text-gray-400 italic mt-0.5">
                    {record.highlights[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Seed note */}
        <div className="text-center text-xs text-gray-500 font-mono">
          Simulation Seed: <span className="text-amber-400 font-bold">{seed}</span> (Exact reproduction of history)
        </div>

        {/* Three Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={onRestartSameSeed}
            className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-gray-600 transition-all active:scale-95"
          >
            🔄 Replay Same Seed
          </button>
          <button
            onClick={onNewSeedGame}
            className="py-3 px-4 bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-600/50 transition-all active:scale-95"
          >
            🎲 New Random Realm
          </button>
          <button
            onClick={onSelectAnotherRuler}
            className="py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95"
          >
            👑 Play Another Ruler
          </button>
        </div>
      </div>
    </div>
  );
};
