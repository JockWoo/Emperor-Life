import {
  GameState,
  CountryId,
  Country,
  Character,
  TerrainType,
  BattleState,
  BattleSide,
  BattleTactic,
  ClashTactic,
  BattleRoundLog,
  ScoutReport,
  PendingDefense,
  NewsItem,
  GameOverReason
} from '../types/game';
import { SeededRNG } from '../utils/random';

// ================================================================
// 戰役對決系統（三回合戰法相剋）
//   衝鋒 克 火攻（趁敵佈置未成，鐵騎直搗）
//   火攻 克 固守（堅營死守，正好一把火燒光）
//   固守 克 衝鋒（深溝高壘，以逸待勞）
//   單挑：每場限一次，主將陣前對決，高風險高報酬
// ================================================================

export const CAMPAIGNS_PER_YEAR = 2;
export const CAMPAIGN_FOOD_COST = 50;
export const CAMPAIGN_TREASURY_COST = 30;

export const TACTIC_INFO: Record<BattleTactic, { name: string; icon: string; desc: string }> = {
  charge: { name: '衝鋒', icon: '🐎', desc: '鐵騎突擊。克制火攻，但會被固守克制。平原、高原大利。' },
  hold: { name: '固守', icon: '🛡️', desc: '深溝高壘。克制衝鋒，但怕火攻。山地、江河有利。' },
  fire: { name: '火攻', icon: '🔥', desc: '縱火焚營。克制固守，但怕衝鋒。丘陵大利，水邊不利。' },
  duel: { name: '單挑', icon: '⚔️', desc: '主將陣前對決（每場限一次）。勝則敵軍心崩，敗則我將負傷。' }
};

// A 克制 BEATS[A]
const BEATS: Record<ClashTactic, ClashTactic> = { charge: 'fire', fire: 'hold', hold: 'charge' };
// 能克制 X 的戰法
const COUNTER_OF: Record<ClashTactic, ClashTactic> = { fire: 'charge', hold: 'fire', charge: 'hold' };

const TERRAIN_TACTIC_MOD: Record<TerrainType, Record<ClashTactic, number>> = {
  plains: { charge: 1.25, hold: 0.9, fire: 1.0 },
  mountains: { charge: 0.8, hold: 1.25, fire: 1.05 },
  river: { charge: 0.9, hold: 1.1, fire: 0.75 },
  hills: { charge: 0.95, hold: 1.05, fire: 1.25 },
  plateau: { charge: 1.15, hold: 1.0, fire: 0.95 },
  coast: { charge: 1.0, hold: 1.05, fire: 0.85 }
};

export const TERRAIN_LABEL: Record<TerrainType, string> = {
  plains: '平原',
  mountains: '山地',
  river: '水網',
  hills: '丘陵',
  plateau: '高原',
  coast: '沿海'
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function getTerrainTacticMod(terrain: TerrainType, tactic: ClashTactic): number {
  return TERRAIN_TACTIC_MOD[terrain]?.[tactic] ?? 1;
}

function bestGeneral(country: Country): Character | null {
  const pool = country.characters.filter(c => c.isAlive && c.role === 'general');
  const fallback = country.characters.filter(c => c.isAlive);
  const list = pool.length > 0 ? pool : fallback;
  if (list.length === 0) return null;
  return [...list].sort((a, b) => b.military + b.strategy - (a.military + a.strategy))[0];
}

function bestStrategy(country: Country): number {
  const alive = country.characters.filter(c => c.isAlive);
  if (alive.length === 0) return 40;
  return Math.max(...alive.map(c => c.strategy));
}

function makeSide(country: Country, general: Character | null, troops: number): BattleSide {
  return {
    countryId: country.id,
    generalId: general ? general.id : null,
    generalName: general ? general.chineseName : '無名偏將',
    generalMilitary: general ? general.military : 55,
    generalStrategy: general ? general.strategy : 50,
    troops,
    initialTroops: troops,
    morale: clamp(country.morale, 40, 100)
  };
}

// 敵將戰法傾向（依君主性格、地形、主將謀略）
export function getEnemyTacticWeights(
  enemy: Country,
  side: BattleSide,
  terrain: TerrainType,
  enemyIsDefender: boolean
): Record<ClashTactic, number> {
  const p = enemy.ruler.personality;
  const w: Record<ClashTactic, number> = {
    charge: 30 + p.militaryFocus * 0.3 + p.expansion * 0.2,
    hold: 30 + p.administration * 0.2 + (enemyIsDefender ? 25 : 0),
    fire: 20 + p.talentUtilization * 0.15 + p.adaptability * 0.15 + side.generalStrategy * 0.2
  };
  (Object.keys(w) as ClashTactic[]).forEach(t => {
    w[t] *= getTerrainTacticMod(terrain, t);
  });
  return w;
}

function weightedPick(rng: SeededRNG, w: Record<ClashTactic, number>): ClashTactic {
  const keys = Object.keys(w) as ClashTactic[];
  const total = keys.reduce((s, k) => s + w[k], 0);
  let roll = rng.next() * total;
  for (const k of keys) {
    roll -= w[k];
    if (roll <= 0) return k;
  }
  return keys[keys.length - 1];
}

export function describeEnemyTendency(w: Record<ClashTactic, number>): string {
  const top = (Object.keys(w) as ClashTactic[]).sort((a, b) => w[b] - w[a])[0];
  const lines: Record<ClashTactic, string> = {
    charge: '敵主性烈好戰，麾下慣於鐵騎突擊。',
    hold: '敵軍用兵持重，向來深溝高壘、以守代攻。',
    fire: '敵將工於奇謀，常以火計出奇制勝。'
  };
  return lines[top];
}

function rollEnemyTactic(
  state: GameState,
  battle: BattleState,
  rng: SeededRNG,
  lastPlayerTactic: BattleTactic | null
): ClashTactic {
  const enemy = state.countries[battle.enemy.countryId];
  const region = state.regions[battle.regionId];
  const weights = getEnemyTacticWeights(enemy, battle.enemy, region.terrain, battle.mode === 'attack');
  // 隨機應變：依君主應變能力，嘗試克制玩家上一回合的戰法
  if (lastPlayerTactic && lastPlayerTactic !== 'duel') {
    const adaptChance = enemy.ruler.personality.adaptability / 180;
    if (rng.chance(adaptChance)) return COUNTER_OF[lastPlayerTactic];
  }
  return weightedPick(rng, weights);
}

function makeScoutReport(state: GameState, battle: BattleState, rng: SeededRNG): ScoutReport {
  const player = state.countries[battle.player.countryId];
  const s = bestStrategy(player);
  const accuracy = clamp(0.35 + (s - 50) / 100, 0.35, 0.85);
  let tactic = battle.enemyNextTactic;
  if (!rng.chance(accuracy)) {
    const others = (['charge', 'hold', 'fire'] as ClashTactic[]).filter(t => t !== tactic);
    tactic = rng.choice(others);
  }
  return { tactic, confidence: Math.round(accuracy * 100) };
}

function defenderBonus(state: GameState, regionId: string): number {
  const r = state.regions[regionId];
  let b = 1.05;
  if (r.terrain === 'mountains') b = 1.3;
  else if (r.terrain === 'river') b = 1.15;
  if (r.isCapital) b = Math.max(b, 1.25);
  return b;
}

// 檢查能否發動征伐
export function canLaunchCampaign(state: GameState, regionId: string): { ok: boolean; reason?: string } {
  const player = state.countries[state.playerCountryId];
  const region = state.regions[regionId];
  if (!region) return { ok: false, reason: '目標地域無效。' };
  if (region.countryId === state.playerCountryId) return { ok: false, reason: '該領土已在朝廷掌控之中。' };
  const adjacent = Object.values(state.regions).some(
    r => r.countryId === state.playerCountryId && r.neighbors.includes(regionId)
  );
  if (!adjacent) return { ok: false, reason: '兵鋒無法直達！此地未與我國邊境接壤。' };
  if (state.campaignsLeft <= 0) return { ok: false, reason: '本年征伐令已用盡！請待來年再興兵。' };
  if (player.military < 40) return { ok: false, reason: '軍力不足！出師至少需 40 萬兵力。' };
  if (player.food < CAMPAIGN_FOOD_COST + 10) return { ok: false, reason: `糧餉告急！出征至少需備糧 ${CAMPAIGN_FOOD_COST + 10}。` };
  return { ok: true };
}

export interface BattleSetupOptions {
  mode: 'attack' | 'defense';
  regionId: string;
  enemyCountryId: CountryId;
  playerGeneralId: string | null;
  commitRatio: number;        // 0.3 / 0.5 / 0.8
  enemyTroops?: number;       // 防守戰時，敵方入侵兵力
}

export function createBattle(state: GameState, opts: BattleSetupOptions): BattleState {
  const player = state.countries[state.playerCountryId];
  const enemy = state.countries[opts.enemyCountryId];
  const playerGeneral = opts.playerGeneralId
    ? player.characters.find(c => c.id === opts.playerGeneralId && c.isAlive) || null
    : null;
  const enemyGeneral = bestGeneral(enemy);

  const playerTroops = Math.max(10, Math.round(player.military * opts.commitRatio));
  const enemyTroops =
    opts.enemyTroops ?? Math.max(10, Math.round(enemy.military * (0.45 + enemy.ruler.personality.militaryFocus / 400)));

  const id = `${opts.mode}_${opts.regionId}_${state.year}_${state.campaignsLeft}_${state.pendingDefenses.length}`;
  const rng = new SeededRNG(`${state.seed}_battle_${id}_r0`);

  const battle: BattleState = {
    id,
    mode: opts.mode,
    regionId: opts.regionId,
    player: makeSide(player, playerGeneral, playerTroops),
    enemy: makeSide(enemy, enemyGeneral, enemyTroops),
    round: 1,
    maxRounds: 3,
    enemyNextTactic: 'charge',
    scout: { tactic: 'charge', confidence: 50 },
    duelUsed: false,
    log: [],
    finished: false,
    outcome: null,
    decisive: false,
    playerGeneralInjured: false,
    playerGeneralKilled: false,
    enemyGeneralKilled: false
  };
  battle.enemyNextTactic = rollEnemyTactic(state, battle, rng, null);
  battle.scout = makeScoutReport(state, battle, rng);
  return battle;
}

function clashText(p: ClashTactic, e: ClashTactic, pName: string, eName: string, result: 'win' | 'lose' | 'tie'): string {
  const P = TACTIC_INFO[p].name;
  const E = TACTIC_INFO[e].name;
  if (result === 'tie') {
    const tie: Record<ClashTactic, string> = {
      charge: `兩軍鐵騎迎面對撞，${pName} 與 ${eName} 殺得難分難解！`,
      hold: `雙方皆堅壁不出，隔陣對峙，僅有零星箭雨往來。`,
      fire: `兩軍同時縱火，烈焰交織，雙方各有焚損。`
    };
    return tie[p];
  }
  const winLines: Record<string, string> = {
    'charge>fire': `敵軍正欲佈置火計，${pName} 率鐵騎疾馳突入，敵陣未成即被衝散！`,
    'fire>hold': `敵軍閉營死守，${pName} 趁夜順風縱火，敵營頓成火海！`,
    'hold>charge': `敵軍貿然衝鋒，正撞上我軍拒馬強弩，${pName} 以逸待勞大破之！`
  };
  const loseLines: Record<string, string> = {
    'fire>charge': `我軍火計尚未佈置妥當，${eName} 鐵騎已殺入陣中，前軍大亂！`,
    'hold>fire': `我軍深溝固守，卻被 ${eName} 順風一把火燒得營寨盡毀！`,
    'charge>hold': `我軍貿然衝鋒，撞上 ${eName} 的拒馬強弩，死傷慘重！`
  };
  if (result === 'win') return winLines[`${p}>${e}`] || `我軍${P}克制敵軍${E}，大獲全勝！`;
  return loseLines[`${p}>${e}`] || `我軍${P}被敵軍${E}所克，損兵折將！`;
}

// 進行一回合
export function resolveRound(
  state: GameState,
  battle: BattleState,
  playerTactic: BattleTactic | 'retreat'
): BattleState {
  if (battle.finished) return battle;
  const b: BattleState = {
    ...battle,
    player: { ...battle.player },
    enemy: { ...battle.enemy },
    log: [...battle.log]
  };
  const rng = new SeededRNG(`${state.seed}_battle_${b.id}_r${b.round}_${playerTactic}`);
  const region = state.regions[b.regionId];

  if (playerTactic === 'retreat') {
    const loss = Math.round(b.player.troops * 0.06);
    b.player.troops -= loss;
    b.log.push({
      round: b.round,
      playerTactic: 'hold',
      enemyTactic: b.enemyNextTactic,
      text: `${b.player.generalName} 鳴金收兵，大軍且戰且退，折損 ${loss} 萬。`,
      playerMoraleLoss: 0,
      enemyMoraleLoss: 0,
      playerTroopLoss: loss,
      enemyTroopLoss: 0
    });
    b.finished = true;
    b.outcome = 'retreat';
    return b;
  }

  const eTactic = b.enemyNextTactic;
  let entry: BattleRoundLog;

  if (playerTactic === 'duel') {
    b.duelUsed = true;
    const pRoll = b.player.generalMilitary + rng.range(0, 30);
    const hasEnemyGeneral = b.enemy.generalId !== null;
    const eRoll = hasEnemyGeneral ? b.enemy.generalMilitary + rng.range(0, 30) : -1;
    if (!hasEnemyGeneral) {
      entry = {
        round: b.round, playerTactic, enemyTactic: eTactic,
        text: `${b.player.generalName} 單騎出陣叫戰，敵軍竟無一將敢應，全軍士氣大挫！`,
        playerMoraleLoss: 0, enemyMoraleLoss: 28, playerTroopLoss: 0, enemyTroopLoss: 0
      };
    } else if (pRoll >= eRoll) {
      const kill = rng.chance(0.25);
      b.enemyGeneralKilled = kill;
      entry = {
        round: b.round, playerTactic, enemyTactic: eTactic,
        text: kill
          ? `${b.player.generalName} 與 ${b.enemy.generalName} 大戰三十回合，一刀斬敵將於馬下！敵軍駭然！`
          : `${b.player.generalName} 力壓 ${b.enemy.generalName}，敵將負傷敗走，敵陣軍心動搖！`,
        playerMoraleLoss: 0, enemyMoraleLoss: kill ? 45 : 32, playerTroopLoss: 0, enemyTroopLoss: 0
      };
    } else {
      const killed = rng.chance(0.15);
      b.playerGeneralKilled = killed;
      b.playerGeneralInjured = !killed;
      entry = {
        round: b.round, playerTactic, enemyTactic: eTactic,
        text: killed
          ? `${b.player.generalName} 力戰不敵，竟為 ${b.enemy.generalName} 所斬！三軍痛哭！`
          : `${b.player.generalName} 不敵 ${b.enemy.generalName}，身負重傷被親兵救回，我軍士氣低落。`,
        playerMoraleLoss: killed ? 40 : 28, enemyMoraleLoss: 0, playerTroopLoss: 0, enemyTroopLoss: 0
      };
    }
  } else {
    const pIsDef = b.mode === 'defense';
    const dBonus = defenderBonus(state, b.regionId);
    const counter = (mine: ClashTactic, theirs: ClashTactic) =>
      BEATS[mine] === theirs ? 1.7 : BEATS[theirs] === mine ? 0.6 : 1.0;
    const power = (side: BattleSide, t: ClashTactic, isDef: boolean, opp: ClashTactic) =>
      side.troops *
      (1 + (side.generalMilitary + side.generalStrategy) / 400) *
      (0.6 + side.morale / 250) *
      getTerrainTacticMod(region.terrain, t) *
      (isDef ? dBonus : 1) *
      counter(t, opp) *
      (rng.range(85, 115) / 100);

    const pP = power(b.player, playerTactic, pIsDef, eTactic);
    const eP = power(b.enemy, eTactic, !pIsDef, playerTactic);
    const share = pP / (pP + eP);

    const enemyMoraleLoss = Math.max(4, Math.round(18 + 72 * (share - 0.5)));
    const playerMoraleLoss = Math.max(4, Math.round(18 + 72 * (0.5 - share)));
    const enemyTroopLoss = Math.max(1, Math.round(b.enemy.troops * (0.04 + 0.16 * share)));
    const playerTroopLoss = Math.max(1, Math.round(b.player.troops * (0.04 + 0.16 * (1 - share))));

    const result = BEATS[playerTactic] === eTactic ? 'win' : BEATS[eTactic] === playerTactic ? 'lose' : 'tie';
    entry = {
      round: b.round,
      playerTactic,
      enemyTactic: eTactic,
      text: clashText(playerTactic, eTactic, b.player.generalName, b.enemy.generalName, result),
      playerMoraleLoss,
      enemyMoraleLoss,
      playerTroopLoss,
      enemyTroopLoss
    };
  }

  b.player.morale = Math.max(0, b.player.morale - entry.playerMoraleLoss);
  b.enemy.morale = Math.max(0, b.enemy.morale - entry.enemyMoraleLoss);
  b.player.troops = Math.max(0, b.player.troops - entry.playerTroopLoss);
  b.enemy.troops = Math.max(0, b.enemy.troops - entry.enemyTroopLoss);
  b.log.push(entry);

  // 勝負判定
  if (b.enemy.morale <= 0 || b.enemy.troops <= 0) {
    b.finished = true;
    b.outcome = 'victory';
    b.decisive = true;
  } else if (b.player.morale <= 0 || b.player.troops <= 0) {
    b.finished = true;
    b.outcome = 'defeat';
    b.decisive = true;
  } else if (b.round >= b.maxRounds) {
    b.finished = true;
    const win = b.mode === 'attack' ? b.player.morale > b.enemy.morale : b.player.morale >= b.enemy.morale;
    b.outcome = win ? 'victory' : 'defeat';
  } else {
    b.round += 1;
    b.enemyNextTactic = rollEnemyTactic(state, b, rng, playerTactic);
    b.scout = makeScoutReport(state, b, rng);
  }
  return b;
}

// ---------- 套用戰果 ----------
function cloneForBattle(state: GameState, ids: CountryId[]): GameState {
  const countries = { ...state.countries };
  ids.forEach(id => {
    const c = state.countries[id];
    countries[id] = {
      ...c,
      relations: { ...c.relations },
      alliances: [...c.alliances],
      atWarWith: [...c.atWarWith],
      characters: c.characters.map(ch => ({ ...ch }))
    };
  });
  const regions = { ...state.regions };
  return { ...state, countries, regions, stats: { ...state.stats, milestones: [...state.stats.milestones] } };
}

function checkPostBattleEnd(state: GameState, news: NewsItem[]): GameState {
  const pid = state.playerCountryId;
  const owned = Object.values(state.regions).filter(r => r.countryId === pid).length;
  const total = Object.keys(state.regions).length;
  // 其他國家滅亡檢查
  (Object.keys(state.countries) as CountryId[]).forEach(cid => {
    const c = state.countries[cid];
    if (c.isAlive && !Object.values(state.regions).some(r => r.countryId === cid)) {
      state.countries[cid] = { ...c, isAlive: false };
      news.push({
        id: `battle_fall_${cid}_${state.year}`,
        year: state.year,
        text: `${c.name} 最後一城陷落，國祚斷絕，宗廟瓦解！`,
        type: 'war',
        importance: 'critical'
      });
    }
  });
  const pct = parseFloat(((owned / total) * 100).toFixed(1));
  state.stats.maxTerritoryPct = Math.max(state.stats.maxTerritoryPct, pct);

  let reason: GameOverReason | null = null;
  const player = state.countries[pid];
  if (owned >= total) {
    reason = {
      title: '天下統一 · 鼎定中原',
      description: `四海歸一，三十五郡盡入版圖！${player.ruler.name} 掃除六合，一統江山，開創千秋萬世之不朽帝業！`,
      victory: true,
      subType: 'unification'
    };
  } else if (owned === 0) {
    reason = {
      title: '社稷傾覆 · 國家滅亡',
      description: `${player.name} 最後的城池陷落，宗廟傾覆，一代王朝終成過眼雲煙。`,
      victory: false,
      subType: 'conquered'
    };
  }
  if (reason) {
    return { ...state, phase: 'game_over', gameOverReason: reason, currentEvent: null };
  }
  return state;
}

export function applyBattleOutcome(prev: GameState, battle: BattleState): { state: GameState; message: string } {
  const pid = prev.playerCountryId;
  const eid = battle.enemy.countryId;
  const state = cloneForBattle(prev, [pid, eid]);
  const player = state.countries[pid];
  const enemy = state.countries[eid];
  const region = state.regions[battle.regionId];
  const rng = new SeededRNG(`${state.seed}_battle_${battle.id}_outcome`);
  const news: NewsItem[] = [];
  const lines: string[] = [];

  const pLoss = battle.player.initialTroops - battle.player.troops;
  const eLoss = battle.enemy.initialTroops - battle.enemy.troops;
  player.military = Math.max(10, player.military - pLoss);
  enemy.military = Math.max(10, enemy.military - eLoss);

  // 主將傷亡
  if (battle.player.generalId) {
    const g = player.characters.find(c => c.id === battle.player.generalId);
    if (g && battle.playerGeneralKilled) {
      g.isAlive = false;
      g.status = 'deceased';
      lines.push(`痛失大將【${g.chineseName}】！`);
    } else if (g && battle.playerGeneralInjured) {
      g.military = Math.max(30, g.military - 3);
      g.status = 'injured';
    } else if (g && battle.outcome === 'victory') {
      g.military = Math.min(100, g.military + 1);
      g.loyalty = Math.min(100, g.loyalty + 5);
    }
  }
  if (battle.enemy.generalId && battle.enemyGeneralKilled) {
    const g = enemy.characters.find(c => c.id === battle.enemy.generalId);
    if (g) {
      g.isAlive = false;
      g.status = 'deceased';
    }
  }

  if (battle.mode === 'attack') {
    player.food = Math.max(0, player.food - CAMPAIGN_FOOD_COST);
    player.treasury = Math.max(0, player.treasury - CAMPAIGN_TREASURY_COST);
    state.campaignsLeft = Math.max(0, state.campaignsLeft - 1);

    // 開戰即進入交戰狀態；若原為盟友則為背盟
    if (player.alliances.includes(eid)) {
      player.alliances = player.alliances.filter(id => id !== eid);
      enemy.alliances = enemy.alliances.filter(id => id !== pid);
      player.stability = Math.max(5, player.stability - 10);
      lines.push(`背棄與${enemy.name}之盟約，朝野譁然（穩定度 -10）。`);
    }
    if (!player.atWarWith.includes(eid)) player.atWarWith.push(eid);
    if (!enemy.atWarWith.includes(pid)) enemy.atWarWith.push(pid);
    player.relations[eid] = Math.max(-100, (player.relations[eid] ?? 0) - 40);
    enemy.relations[pid] = Math.max(-100, (enemy.relations[pid] ?? 0) - 50);
  }

  state.stats.warsStarted += 1;
  const won = battle.outcome === 'victory';
  if (won) state.stats.warsWon += 1;
  else state.stats.warsLost += 1;

  let headline = '';
  if (battle.mode === 'attack') {
    if (won) {
      state.regions[battle.regionId] = { ...region, countryId: pid };
      player.morale = Math.min(100, player.morale + (battle.decisive ? 12 : 8));
      enemy.morale = Math.max(10, enemy.morale - 12);
      enemy.stability = Math.max(10, enemy.stability - 10);
      headline = `大捷！王師攻克${region.chineseName}！`;
      if (region.isCapital) {
        const loot = Math.min(enemy.treasury, 120);
        enemy.treasury -= loot;
        player.treasury += loot;
        lines.push(`攻破${enemy.name}都城，繳獲國庫 ${loot}！`);
      }
    } else {
      player.morale = Math.max(10, player.morale - (battle.outcome === 'retreat' ? 4 : 10));
      headline = battle.outcome === 'retreat' ? `${region.chineseName}之役，我軍審時度勢，全師而退。` : `失利！強攻${region.chineseName}受挫。`;
    }
  } else {
    if (won) {
      player.morale = Math.min(100, player.morale + 8);
      enemy.morale = Math.max(10, enemy.morale - 10);
      headline = `${region.chineseName}保衛戰大捷！${enemy.name}大軍鎩羽而歸。`;
    } else {
      state.regions[battle.regionId] = { ...region, countryId: eid };
      player.stability = Math.max(5, player.stability - 8);
      player.morale = Math.max(10, player.morale - 8);
      headline = `${region.chineseName}失守！${enemy.name}兵鋒入境。`;
    }
  }

  // 陣前招降敵將
  if (won && battle.decisive && battle.enemy.generalId && !battle.enemyGeneralKilled && rng.chance(0.5)) {
    const idx = enemy.characters.findIndex(c => c.id === battle.enemy.generalId && c.isAlive);
    if (idx >= 0) {
      const captured = { ...enemy.characters[idx], countryId: pid, loyalty: 55 };
      enemy.characters = enemy.characters.filter((_, i) => i !== idx);
      player.characters = [...player.characters, captured];
      lines.push(`敵將【${captured.chineseName}】兵敗被俘，感陛下恩義，歸降效命！`);
      state.stats.milestones.push({ year: state.year, text: `第 ${state.year} 年：陣前招降${enemy.name}名將${captured.chineseName}。` });
    }
  }

  const casualties = `我軍傷亡 ${pLoss} 萬，敵軍傷亡 ${eLoss} 萬。`;
  const message = [headline, casualties, ...lines].join(' ');
  news.unshift({
    id: `battle_${battle.id}`,
    year: state.year,
    text: message,
    type: won ? 'territory' : 'war',
    importance: 'critical'
  });

  if (battle.mode === 'defense') {
    state.pendingDefenses = state.pendingDefenses.filter(
      p => !(p.regionId === battle.regionId && p.attackerId === eid)
    );
  }

  const withNews = { ...state, worldNews: [...news, ...state.worldNews].slice(0, 30) };
  const finalNews: NewsItem[] = [];
  const ended = checkPostBattleEnd(withNews, finalNews);
  return { state: { ...ended, worldNews: [...finalNews, ...ended.worldNews].slice(0, 30) }, message };
}

// 玩家未親自迎戰時的自動結算（保底機制）
export function autoResolveDefense(state: GameState, pd: PendingDefense): GameState {
  const enemy = state.countries[pd.attackerId];
  const region = state.regions[pd.regionId];
  if (!enemy || !enemy.isAlive || !region || region.countryId !== state.playerCountryId) {
    return { ...state, pendingDefenses: state.pendingDefenses.filter(p => p !== pd) };
  }
  const player = state.countries[state.playerCountryId];
  const gen = bestGeneral(player);
  let battle = createBattle(state, {
    mode: 'defense',
    regionId: pd.regionId,
    enemyCountryId: pd.attackerId,
    playerGeneralId: gen ? gen.id : null,
    commitRatio: 0.5,
    enemyTroops: pd.attackerTroops
  });
  // 守將依地形擇優而戰
  while (!battle.finished) {
    const t = (['hold', 'charge', 'fire'] as ClashTactic[]).sort(
      (a, b) => getTerrainTacticMod(region.terrain, b) - getTerrainTacticMod(region.terrain, a)
    )[0];
    battle = resolveRound(state, battle, t);
  }
  return applyBattleOutcome(state, battle).state;
}
