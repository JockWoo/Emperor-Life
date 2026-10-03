import React, { useState } from 'react';
import { Country, Region, Character, CountryId } from '../types/game';
import { CAMPAIGN_FOOD_COST, CAMPAIGN_TREASURY_COST, TERRAIN_LABEL } from '../systems/battle';

interface BattleSetupModalProps {
  mode: 'attack' | 'defense';
  region: Region;
  playerCountry: Country;
  enemyCountry: Country;
  enemyTroops?: number;
  campaignsLeft: number;
  onClose: () => void;
  onConfirmLaunch: (options: { generalId: string | null; commitRatio: number }) => void;
}

export const BattleSetupModal: React.FC<BattleSetupModalProps> = ({
  mode,
  region,
  playerCountry,
  enemyCountry,
  enemyTroops,
  campaignsLeft,
  onClose,
  onConfirmLaunch
}) => {
  const aliveCharacters = playerCountry.characters.filter(c => c.isAlive);
  const generals = aliveCharacters.filter(c => c.role === 'general');
  const defaultGeneral = generals.length > 0
    ? [...generals].sort((a, b) => (b.military + b.strategy) - (a.military + a.strategy))[0]
    : aliveCharacters[0] || null;

  const [selectedGeneralId, setSelectedGeneralId] = useState<string | null>(defaultGeneral ? defaultGeneral.id : null);
  const [commitRatio, setCommitRatio] = useState<number>(0.5);

  const selectedGeneral = aliveCharacters.find(c => c.id === selectedGeneralId) || null;
  const committedTroops = Math.max(10, Math.round(playerCountry.military * commitRatio));
  const estimatedEnemyTroops = enemyTroops ?? Math.max(10, Math.round(enemyCountry.military * 0.5));

  // 地形提示
  const terrainTips: Record<string, string> = {
    plains: '平原廣袤無垠：利於鐵騎【衝鋒】（威力 +25%），不利固守。',
    mountains: '山勢高聳險峻：利於依山【固守】（防禦 +25%），【衝鋒】受限削弱。',
    river: '江河縱橫水網：【火攻】受阻不易蔓延，利於設伏防守。',
    hills: '丘陵溝壑起伏：極利藉風縱【火攻】（威力 +25%），易斷敵糧道。',
    plateau: '高原居高臨下：【衝鋒】具下衝之勢，戰局節奏極快。',
    coast: '沿海潮汐多變：利於牽制交鋒，水陸並進。'
  };

  const isAttack = mode === 'attack';
  const canAfford = !isAttack || (playerCountry.food >= CAMPAIGN_FOOD_COST && playerCountry.treasury >= CAMPAIGN_TREASURY_COST);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#121622] border-2 border-amber-600/70 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-gray-200 relative max-h-[92vh] overflow-y-auto">
        {/* Top Trim Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isAttack ? '⚔️' : '🚨'}</span>
            <div>
              <h2 className="text-xl font-black text-white font-serif tracking-wider">
                {isAttack ? '發動征伐 · 戰前軍議' : '邊關告急 · 禦敵軍議'}
              </h2>
              <div className="text-xs text-amber-400">
                {isAttack
                  ? `揮師征討【${enemyCountry.name}】轄境【${region.chineseName}】`
                  : `【${enemyCountry.name}】大軍正進犯我國【${region.chineseName}】！`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 戰場要地資訊卡片 */}
        <div className="bg-black/50 border border-gray-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span>📍 {region.chineseName}</span>
              <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: enemyCountry.color, color: '#fff' }}>
                {isAttack ? `所屬：${enemyCountry.name}` : `我國轄境`}
              </span>
              {region.isCapital && (
                <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px]">
                  👑 敵國都城
                </span>
              )}
            </div>
            <div className="text-gray-400 mt-1 flex flex-wrap gap-2 text-[11px]">
              <span>地形：<strong className="text-amber-300">{TERRAIN_LABEL[region.terrain] || region.terrain}</strong></span>
              <span>•</span>
              <span>人口：{region.basePop} 萬</span>
              <span>•</span>
              <span>歲賦：{region.baseWealth} 🪙</span>
              <span>•</span>
              <span>倉儲：{region.baseFood} 🌾</span>
            </div>
          </div>
          <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg text-[11px] text-amber-200/90 sm:max-w-xs">
            <span className="font-bold text-amber-300">💡 地利參詳：</span>
            {terrainTips[region.terrain] || '地勢平緩，宜依敵陣靈活變換戰法。'}
          </div>
        </div>

        {/* 主將調遣區 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🎖️</span> 遴選統兵主將
            </span>
            <span className="text-[11px] text-gray-500 font-normal">
              主將統帥增幅戰力，智謀影響戰法與斥候探報
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {aliveCharacters.map(char => {
              const isSelected = selectedGeneralId === char.id;
              const isGen = char.role === 'general';
              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedGeneralId(char.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-[#181d2a] border-gray-800 hover:border-gray-600 hover:bg-[#1e2538]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1">
                      {char.chineseName}
                      {isGen && <span className="text-amber-400 text-[10px]">⚔️</span>}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                      {char.role === 'general' ? '武將' : char.role === 'strategist' ? '謀臣' : '文官'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono mt-1.5 text-gray-300 bg-black/40 p-1 rounded">
                    <div>統帥: <strong className="text-red-400">{char.military}</strong></div>
                    <div>智謀: <strong className="text-cyan-400">{char.strategy}</strong></div>
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-1">
                    {char.specialty}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 出征兵力調配 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🚩</span> 參戰兵力配比
            </span>
            <span className="text-xs font-mono text-amber-300">
              總兵力：{playerCountry.military} 萬 → 本役出動：<strong className="text-red-400 text-sm">{committedTroops} 萬</strong>
            </span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { ratio: 0.3, label: '先鋒試探 (30%)', desc: '保存主力，小損即退' },
              { ratio: 0.5, label: '主力出征 (50%)', desc: '攻守兼備，常規大軍' },
              { ratio: 0.8, label: '傾國親征 (80%)', desc: '壓倒優勢，勢在必得' }
            ].map(tier => {
              const isSelected = commitRatio === tier.ratio;
              return (
                <button
                  key={tier.ratio}
                  type="button"
                  onClick={() => setCommitRatio(tier.ratio)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/70 border-red-500 ring-1 ring-red-500'
                      : 'bg-[#181d2a] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{tier.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{tier.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 雙方戰前陣容對比 & 戰費預覽 */}
        <div className="bg-[#151926] border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-[10px] text-gray-400">我軍統帥</div>
              <div className="font-bold text-white text-xs">{selectedGeneral?.chineseName || '皇帝親征'}</div>
              <div className="text-red-400 font-bold">{committedTroops} 萬</div>
            </div>
            <span className="text-xl font-sans text-gray-500">VS</span>
            <div className="text-center">
              <div className="text-[10px] text-gray-400">敵方守備</div>
              <div className="font-bold text-white text-xs">{enemyCountry.name} 守將</div>
              <div className="text-amber-400 font-bold">約 {estimatedEnemyTroops} 萬</div>
            </div>
          </div>

          {isAttack && (
            <div className="text-right text-[11px] text-gray-400 border-t sm:border-t-0 sm:border-l border-gray-800 pt-2 sm:pt-0 sm:pl-3">
              <div>戰役耗糧：<span className="text-lime-300 font-bold">-{CAMPAIGN_FOOD_COST} 🌾</span></div>
              <div>軍費耗餉：<span className="text-yellow-300 font-bold">-{CAMPAIGN_TREASURY_COST} 🪙</span></div>
              <div>剩餘征伐令：<span className="text-amber-300 font-bold">{campaignsLeft} / 2</span></div>
            </div>
          )}
        </div>

        {!canAfford && (
          <div className="text-center text-xs text-red-400 font-bold bg-red-950/50 p-2 rounded-lg border border-red-900">
            ⚠️ 糧草或國庫不足以支撐大軍遠征！（需糧草 50、國庫 30）
          </div>
        )}

        {/* 確認發兵按鈕 */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            暫緩行軍
          </button>
          <button
            onClick={() => {
              if (!canAfford) return;
              onConfirmLaunch({ generalId: selectedGeneralId, commitRatio });
            }}
            disabled={!canAfford}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAttack ? '⚔️ 擂鼓出征 · 發動戰役' : '🛡️ 披甲迎敵 · 出城禦敵'}
          </button>
        </div>
      </div>
    </div>
  );
};
