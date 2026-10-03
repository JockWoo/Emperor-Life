import React, { useState } from 'react';
import {
  BattleState,
  BattleTactic,
  ClashTactic,
  Country,
  Region
} from '../types/game';
import { TACTIC_INFO, TERRAIN_LABEL, getTerrainTacticMod } from '../systems/battle';

interface BattleModalProps {
  battle: BattleState;
  playerCountry: Country;
  enemyCountry: Country;
  region: Region;
  onSelectTactic: (tactic: BattleTactic | 'retreat') => void;
  onFinishBattle: () => void;
}

export const BattleModal: React.FC<BattleModalProps> = ({
  battle,
  playerCountry,
  enemyCountry,
  region,
  onSelectTactic,
  onFinishBattle
}) => {
  const [animating, setAnimating] = useState(false);

  const handleTacticClick = (tactic: BattleTactic | 'retreat') => {
    if (battle.finished || animating) return;
    setAnimating(true);
    onSelectTactic(tactic);
    setTimeout(() => {
      setAnimating(false);
    }, 400);
  };

  const isAttack = battle.mode === 'attack';
  const playerTroopPct = Math.max(0, Math.min(100, Math.round((battle.player.troops / battle.player.initialTroops) * 100)));
  const enemyTroopPct = Math.max(0, Math.min(100, Math.round((battle.enemy.troops / battle.enemy.initialTroops) * 100)));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#10131d] border-2 border-red-900/80 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-gray-200 relative my-auto">
        {/* Top Trim Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-amber-600 rounded-t-2xl" />

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isAttack ? '⚔️' : '🛡️'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-300 border border-red-800">
                  {isAttack ? '征伐攻城戰' : '邊關保衛戰'}
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  📍 {region.chineseName}
                </span>
                <span className="text-[11px] text-gray-400">
                  （{TERRAIN_LABEL[region.terrain]}）
                </span>
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-gray-400">戰況進程</span>
            <div className="text-sm font-black text-amber-400">
              第 {battle.round} / {battle.maxRounds} 回合
            </div>
          </div>
        </div>

        {/* 雙方對峙面板 (Army Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 我軍陣容 */}
          <div
            className="bg-[#141824] border-2 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden"
            style={{ borderColor: playerCountry.color }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{playerCountry.ruler.portrait}</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>【{playerCountry.name}】{battle.player.generalName}</span>
                    {battle.playerGeneralInjured && (
                      <span className="text-[10px] px-1 bg-red-950 text-red-400 border border-red-800 rounded">負傷</span>
                    )}
                    {battle.playerGeneralKilled && (
                      <span className="text-[10px] px-1 bg-black text-red-500 border border-red-900 rounded font-bold">陣亡</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    統帥: <span className="text-red-400">{battle.player.generalMilitary}</span> · 智謀: <span className="text-cyan-400">{battle.player.generalStrategy}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {battle.player.troops} 萬
              </span>
            </div>

            {/* 兵力條 */}
            <div className="flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between text-gray-400 font-mono">
                <span>參戰兵力 ({playerTroopPct}%)</span>
                <span>{battle.player.troops} / {battle.player.initialTroops} 萬</span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                  style={{ width: `${playerTroopPct}%` }}
                />
              </div>
            </div>

            {/* 軍心士氣條 */}
            <div className="flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between text-gray-400 font-mono">
                <span>軍心士氣</span>
                <span className={battle.player.morale > 40 ? 'text-amber-300' : 'text-red-400 animate-pulse font-bold'}>
                  {battle.player.morale}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    battle.player.morale > 40
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-red-600 to-red-400'
                  }`}
                  style={{ width: `${battle.player.morale}%` }}
                />
              </div>
            </div>
          </div>

          {/* 敵軍陣容 */}
          <div
            className="bg-[#141824] border-2 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden"
            style={{ borderColor: enemyCountry.color }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{enemyCountry.ruler.portrait}</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>【{enemyCountry.name}】{battle.enemy.generalName}</span>
                    {battle.enemyGeneralKilled && (
                      <span className="text-[10px] px-1 bg-black text-red-500 border border-red-900 rounded font-bold">被斬</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    統帥: <span className="text-red-400">{battle.enemy.generalMilitary}</span> · 智謀: <span className="text-cyan-400">{battle.enemy.generalStrategy}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-red-400 font-mono">
                {battle.enemy.troops} 萬
              </span>
            </div>

            {/* 敵方兵力條 */}
            <div className="flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between text-gray-400 font-mono">
                <span>敵軍兵力 ({enemyTroopPct}%)</span>
                <span>{battle.enemy.troops} / {battle.enemy.initialTroops} 萬</span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-300"
                  style={{ width: `${enemyTroopPct}%` }}
                />
              </div>
            </div>

            {/* 敵方士氣條 */}
            <div className="flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between text-gray-400 font-mono">
                <span>敵軍軍心</span>
                <span className={battle.enemy.morale > 40 ? 'text-amber-300' : 'text-red-400 font-bold'}>
                  {battle.enemy.morale}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${battle.enemy.morale}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 軍師斥候密報卡 (Scout Intel) */}
        {!battle.finished && (
          <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-black/50 border border-amber-600/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <div>
                <span className="font-bold text-amber-300">【軍師斥候密報】</span>
                <span className="text-gray-300">
                  前鋒探得敵軍本回合欲採【<strong className="text-yellow-300 font-bold">{TACTIC_INFO[battle.scout.tactic].name}</strong>】之策！
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
              <span>情報把握度:</span>
              <span className="text-cyan-300 font-bold">{battle.scout.confidence}%</span>
            </div>
          </div>
        )}

        {/* 戰鬥演繹記錄視窗 (Combat Logs) */}
        <div className="bg-black/60 border border-gray-800 rounded-xl p-3 max-h-48 overflow-y-auto flex flex-col gap-2 text-xs">
          {battle.log.length === 0 ? (
            <div className="text-center py-4 text-gray-500 italic">
              兩軍列陣相對，戰鼓擂動，待陛下頒下首回合戰法軍令！
            </div>
          ) : (
            battle.log.map((entry, idx) => {
              return (
                <div key={idx} className="p-2.5 bg-[#141824] rounded-lg border border-gray-800/80 flex flex-col gap-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300 font-mono">
                      【第 {entry.round} 回合】我方「{TACTIC_INFO[entry.playerTactic].name}」VS 敵方「{TACTIC_INFO[entry.enemyTactic].name}」
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      我損 -{entry.playerTroopLoss}萬 · 敵損 -{entry.enemyTroopLoss}萬
                    </span>
                  </div>
                  <div className="text-white text-xs leading-relaxed">
                    {entry.text}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <span className={entry.playerMoraleLoss > 0 ? 'text-red-400' : 'text-gray-500'}>
                      我軍心: -{entry.playerMoraleLoss}%
                    </span>
                    <span className={entry.enemyMoraleLoss > 0 ? 'text-emerald-400' : 'text-gray-500'}>
                      敵軍心: -{entry.enemyMoraleLoss}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 戰法決策面板 (Tactics Buttons) */}
        {!battle.finished ? (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-bold text-gray-400 flex items-center justify-between">
              <span>戰法相剋：衝鋒 🐎 克 火攻 🔥 · 火攻 🔥 克 固守 🛡️ · 固守 🛡️ 克 衝鋒 🐎</span>
              <span className="text-amber-400">地勢：{TERRAIN_LABEL[region.terrain]}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['charge', 'hold', 'fire'] as ClashTactic[]).map(tac => {
                const info = TACTIC_INFO[tac];
                const terrainMod = getTerrainTacticMod(region.terrain, tac);
                const hasBuff = terrainMod > 1.05;
                const hasDebuff = terrainMod < 0.95;

                return (
                  <button
                    key={tac}
                    onClick={() => handleTacticClick(tac)}
                    disabled={animating}
                    className="p-3 bg-[#171c29] hover:bg-[#222a3d] border border-gray-700 hover:border-amber-500 rounded-xl text-left transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white flex items-center gap-1">
                          <span>{info.icon}</span> {info.name}
                        </span>
                        {hasBuff && (
                          <span className="text-[10px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                            地利 +{Math.round((terrainMod - 1) * 100)}%
                          </span>
                        )}
                        {hasDebuff && (
                          <span className="text-[10px] px-1 rounded bg-red-950 text-red-400 border border-red-900 font-mono">
                            受制 {Math.round((terrainMod - 1) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 leading-snug">
                        {info.desc}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* 單挑專用按鈕 */}
              <button
                onClick={() => handleTacticClick('duel')}
                disabled={animating || battle.duelUsed}
                className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  battle.duelUsed
                    ? 'bg-black/30 border-gray-800 opacity-40 cursor-not-allowed'
                    : 'bg-gradient-to-br from-red-950/60 to-amber-950/60 border-red-600/60 hover:border-red-400 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-yellow-300 flex items-center gap-1">
                      <span>⚔️</span> 主將單挑
                    </span>
                    <span className="text-[10px] px-1 rounded bg-black/60 text-amber-300 font-mono">
                      {battle.duelUsed ? '已用過' : '限一次'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-300 mt-1 leading-snug">
                    主將陣前對決！勝則敵軍心大挫（甚至斬將），敗則主將負傷。
                  </div>
                </div>
              </button>
            </div>

            {/* 鳴金收兵 */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleTacticClick('retreat')}
                disabled={animating}
                className="text-[11px] text-gray-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>🏳️</span> 鳴金收兵（審時度勢主動撤軍，保全主力）
              </button>
            </div>
          </div>
        ) : (
          /* 戰役終局結算畫面 */
          <div className="bg-[#141926] border-2 border-amber-600/80 rounded-xl p-4 flex flex-col items-center gap-3 text-center animate-in zoom-in-95 duration-200">
            <div className="text-4xl">
              {battle.outcome === 'victory' ? '🏆' : battle.outcome === 'retreat' ? '🏳️' : '💀'}
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-serif tracking-wider">
                {battle.outcome === 'victory'
                  ? isAttack ? '大捷！克復城池！' : '大捷！保境安民！'
                  : battle.outcome === 'retreat'
                  ? '鳴金退軍 · 全師而歸'
                  : '失利受挫 · 損兵折將'}
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                {battle.outcome === 'victory'
                  ? isAttack
                    ? `王師勢如破竹，全殲敵軍抵抗，【${region.chineseName}】已正式歸入大朝版圖！`
                    : `城下浴血奮戰，成功擊潰【${enemyCountry.name}】犯境狂徒，保全疆土！`
                  : battle.outcome === 'retreat'
                  ? `大軍審時度勢，有序後撤，主力猶存，待時再舉。`
                  : `強攻受挫，敵軍頑強反撲，大軍折損慘重，暫退本營。`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-gray-800 w-full max-w-sm">
              <div>
                我軍損失：<span className="text-red-400 font-bold">{battle.player.initialTroops - battle.player.troops} 萬</span>
              </div>
              <div>
                敵軍傷亡：<span className="text-emerald-400 font-bold">{battle.enemy.initialTroops - battle.enemy.troops} 萬</span>
              </div>
            </div>

            <button
              onClick={onFinishBattle}
              className="px-8 py-2.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer mt-1"
            >
              班師回朝 · 結算戰果 ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
