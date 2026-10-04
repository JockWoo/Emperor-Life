import { Country, EventEffect, GameState, GoalResult, YearlyGoal } from '../types/game';
import { SeededRNG } from '../utils/random';
import { applyEventEffects } from './simulation';

interface GoalContext {
  country: Country;
  ownedRegions: number;
  warsWon: number;
}

interface GoalDef {
  id: string;
  title: string;
  description: string;
  rewardText: string;
  reward: EventEffect;
  measure: (ctx: GoalContext) => number;
  isSuccess: (current: number, baseline: number) => boolean;
  weight: (ctx: GoalContext) => number;
}

// 年度目標：依國情加權抽選，給玩家每年一個想達成的小目標
const GOAL_DEFS: GoalDef[] = [
  {
    id: 'treasury_up',
    title: '充盈國庫',
    description: '年底國庫比年初多出 120 以上。',
    rewardText: '行政 +5、穩定度 +5',
    reward: { administration: 5, stability: 5 },
    measure: ctx => ctx.country.treasury,
    isSuccess: (cur, base) => cur >= base + 120,
    weight: ctx => (ctx.country.treasury < 400 ? 3 : 1)
  },
  {
    id: 'food_up',
    title: '倉廩豐實',
    description: '年底糧食比年初多出 120 以上。',
    rewardText: '人口 +0.2 百萬、穩定度 +5',
    reward: { population: 0.2, stability: 5 },
    measure: ctx => ctx.country.food,
    isSuccess: (cur, base) => cur >= base + 120,
    weight: ctx => (ctx.country.food < 350 ? 3 : 1)
  },
  {
    id: 'expand_one',
    title: '開疆拓土',
    description: '年底領土比年初多 1 座以上。',
    rewardText: '國庫 +80、士氣 +10',
    reward: { treasury: 80, morale: 10 },
    measure: ctx => ctx.ownedRegions,
    isSuccess: (cur, base) => cur >= base + 1,
    weight: ctx => (ctx.country.military > 150 ? 3 : 1.5)
  },
  {
    id: 'hold_ground',
    title: '寸土不讓',
    description: '年內不失去任何一座領地。',
    rewardText: '穩定度 +8',
    reward: { stability: 8 },
    measure: ctx => ctx.ownedRegions,
    isSuccess: (cur, base) => cur >= base,
    weight: () => 1
  },
  {
    id: 'stability_keep',
    title: '海晏河清',
    description: '年底穩定度不低於 80。',
    rewardText: '國庫 +40、行政 +5',
    reward: { treasury: 40, administration: 5 },
    measure: () => 0,
    isSuccess: (_cur, _base) => true, // 於 evaluateGoal 內以穩定度檢查
    weight: ctx => (ctx.country.stability < 70 ? 3 : 1)
  },
  {
    id: 'army_grow',
    title: '擴軍備戰',
    description: '年底軍力比年初多出 15 萬以上。',
    rewardText: '士氣 +8、軍械技術 +3',
    reward: { morale: 8, technology: 3 },
    measure: ctx => ctx.country.military,
    isSuccess: (cur, base) => cur >= base + 15,
    weight: () => 2
  },
  {
    id: 'win_battle',
    title: '揚威沙場',
    description: '年內至少取得 1 場戰役勝利。',
    rewardText: '軍力 +10、士氣 +10',
    reward: { military: 10, morale: 10 },
    measure: ctx => ctx.warsWon,
    isSuccess: (cur, base) => cur >= base + 1,
    weight: ctx => (ctx.country.military > 120 ? 2 : 1)
  },
  {
    id: 'pop_growth',
    title: '休養生息',
    description: '年底人口比年初多出 0.6 百萬以上。',
    rewardText: '糧食 +60、穩定度 +4',
    reward: { food: 60, stability: 4 },
    measure: ctx => ctx.country.population,
    isSuccess: (cur, base) => cur >= base + 0.6,
    weight: () => 1.5
  }
];

function makeContext(state: Pick<GameState, 'countries' | 'regions' | 'playerCountryId' | 'stats'>): GoalContext {
  const country = state.countries[state.playerCountryId];
  const ownedRegions = Object.values(state.regions).filter(r => r.countryId === state.playerCountryId).length;
  return { country, ownedRegions, warsWon: state.stats.warsWon };
}

// 依國情抽選新一年的目標
export function pickYearlyGoal(
  state: Pick<GameState, 'countries' | 'regions' | 'playerCountryId' | 'stats'>,
  rng: SeededRNG,
  avoidId?: string
): YearlyGoal {
  const ctx = makeContext(state);
  const pool = GOAL_DEFS.filter(g => g.id !== avoidId);
  const picked = rng.weightedChoice(pool, pool.map(g => g.weight(ctx)));
  return {
    id: picked.id,
    title: picked.title,
    description: picked.description,
    rewardText: picked.rewardText,
    baseline: picked.measure(ctx)
  };
}

// 年末結算目標。成功則直接發放獎勵給玩家國家。
export function evaluateGoal(
  goal: YearlyGoal,
  state: Pick<GameState, 'countries' | 'regions' | 'playerCountryId' | 'stats'>
): GoalResult {
  const def = GOAL_DEFS.find(g => g.id === goal.id);
  if (!def) return { goal, success: false, rewardLogs: [] };

  const ctx = makeContext(state);
  let success = def.isSuccess(def.measure(ctx), goal.baseline);
  if (def.id === 'stability_keep') success = ctx.country.stability >= 80;

  const rewardLogs: string[] = [];
  if (success) {
    rewardLogs.push(...applyEventEffects(ctx.country, def.reward));
  }
  return { goal, success, rewardLogs };
}
