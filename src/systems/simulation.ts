import {
  GameState,
  CountryId,
  Country,
  Region,
  YearlyTurnResult,
  NewsItem,
  WarResult,
  HistoryRecord,
  GameOverReason,
  EventEffect,
  EventChoice,
  GameEvent
} from '../types/game';
import { SeededRNG } from '../utils/random';
import { GAME_EVENTS } from '../data/events';
import { CHAIN_EVENTS, CHOICE_FLAGS, FLAG_EXPIRE_YEARS } from '../data/chainEvents';
import { pickYearlyGoal, evaluateGoal } from './goals';
import { INITIAL_RULERS } from '../data/rulers';
import { INITIAL_CHARACTERS } from '../data/characters';
import { INITIAL_REGIONS } from '../data/regions';
import { CAMPAIGNS_PER_YEAR, autoResolveDefense } from './battle';
import { PendingDefense } from '../types/game';

// 初始化全新遊戲狀態
export function createInitialGameState(seed?: string, chosenRulerId: CountryId = 'qin'): GameState {
  const finalSeed = seed || SeededRNG.generateRandomSeed();
  const rng = new SeededRNG(finalSeed);

  // 深度複製初始君主、臣將、地域
  const countryIds: CountryId[] = ['qin', 'han', 'sui', 'tang', 'song', 'ming', 'qing'];
  
  const regions: Record<string, Region> = {};
  for (const [key, val] of Object.entries(INITIAL_REGIONS)) {
    regions[key] = { ...val, neighbors: [...val.neighbors] };
  }

  const countries: Record<CountryId, Country> = {} as any;

  countryIds.forEach(id => {
    const rulerBase = INITIAL_RULERS[id];
    // 依種子賦予壽元隨機浮動
    const maxAgeVariance = rng.range(-4, 6);
    const ruler = {
      ...rulerBase,
      maxAge: rulerBase.maxAge + maxAgeVariance,
      personality: { ...rulerBase.personality }
    };

    const characters = (INITIAL_CHARACTERS[id] || []).map(c => ({
      ...c,
      maxAge: c.maxAge + rng.range(-3, 5)
    }));

    // 計算初始領地
    const ownedRegions = Object.values(regions).filter(r => r.countryId === id);
    const capitalRegion = ownedRegions.find(r => r.isCapital) || ownedRegions[0];

    const initialPop = ownedRegions.reduce((sum, r) => sum + r.basePop, 0);

    // 初始外交關係：大致中立
    const relations: Record<CountryId, number> = {} as any;
    countryIds.forEach(otherId => {
      if (otherId === id) {
        relations[otherId] = 100;
      } else {
        relations[otherId] = rng.range(-15, 20);
      }
    });

    countries[id] = {
      id,
      name: ruler.dynasty,
      chineseName: ruler.name,
      color: ruler.color,
      textColor: ruler.accentColor,
      capitalName: capitalRegion ? capitalRegion.chineseName : '帝都',
      capitalRegionId: capitalRegion ? capitalRegion.id : '',
      ruler,
      population: parseFloat(initialPop.toFixed(1)),
      food: rng.range(380, 480),
      treasury: rng.range(420, 520),
      military: rng.range(120, 160), // 單位：千人 (萬人)
      administration: ruler.personality.administration,
      stability: rng.range(75, 88),
      morale: rng.range(78, 88),
      technology: rng.range(45, 65),
      relations,
      alliances: [],
      atWarWith: [],
      isAlive: true,
      characters
    };
  });

  const firstEvent = pickEventForYear(countries[chosenRulerId], 1, rng, [], {});

  return {
    seed: finalSeed,
    year: 1,
    playerCountryId: chosenRulerId,
    countries,
    regions,
    currentEvent: firstEvent,
    worldNews: [
      {
        id: 'news_init_1',
        year: 1,
        text: '七帝爭霸時代降臨！秦、漢、隋、唐、宋、明、清七國並立，共逐天下大勢！',
        type: 'celebration',
        importance: 'critical'
      }
    ],
    historyLog: [
      {
        year: 1,
        rulerAge: countries[chosenRulerId].ruler.currentAge,
        eventTitle: '登基即位',
        choiceMade: '承繼大統，總覽天下輿圖',
        territoryCount: Object.values(regions).filter(r => r.countryId === chosenRulerId).length,
        population: countries[chosenRulerId].population,
        military: countries[chosenRulerId].military,
        treasury: countries[chosenRulerId].treasury,
        highlights: ['七帝並立於同一時代，逐鹿中原。']
      }
    ],
    lastTurnResult: null,
    stats: {
      warsStarted: 0,
      warsWon: 0,
      warsLost: 0,
      maxTerritoryPct: 14.3, // 5 / 35 座地域
      maxPopulation: countries[chosenRulerId].population,
      goalsCompleted: 0,
      goalsFailed: 0,
      milestones: [
        { year: 1, text: `元年：${countries[chosenRulerId].ruler.name} 於 ${countries[chosenRulerId].capitalName} 登基稱尊。` }
      ]
    },
    phase: 'turn_event',
    gameOverReason: null,
    campaignsLeft: CAMPAIGNS_PER_YEAR,
    pendingDefenses: [],
    flags: {},
    goalHistory: [],
    currentGoal: pickYearlyGoal(
      {
        countries,
        regions,
        playerCountryId: chosenRulerId,
        stats: { warsStarted: 0, warsWon: 0, warsLost: 0, maxTerritoryPct: 14.3, maxPopulation: 0, milestones: [] }
      },
      new SeededRNG(`${finalSeed}_goal_1`)
    )
  };
}

// 抽取該年度事件
// 1. 若先前的抉擇埋下伏筆且時機已到，高機率觸發連鎖事件
// 2. 否則依國情加權：缺糧多災荒、缺錢多財政事件、民心不穩多動盪事件
export function pickEventForYear(
  country: Country,
  year: number,
  rng: SeededRNG,
  usedEventIds: string[],
  flags: Record<string, number> = {}
): GameEvent {
  const isUsable = (e: GameEvent) => !usedEventIds.includes(e.id) && !usedEventIds.includes(e.title);

  const dueChain = CHAIN_EVENTS.filter(e => {
    if (!isUsable(e) || !e.requiresFlag) return false;
    const setYear = flags[e.requiresFlag];
    return setYear !== undefined && year - setYear >= (e.minDelay ?? 1);
  });
  if (dueChain.length > 0 && rng.chance(0.75)) {
    return rng.choice(dueChain);
  }

  const eligible = GAME_EVENTS.filter(e => {
    if (!isUsable(e)) return false;
    if (e.condition && !e.condition(country, year)) return false;
    return true;
  });
  if (eligible.length === 0) {
    return rng.choice(GAME_EVENTS);
  }

  const weightOf = (e: GameEvent): number => {
    switch (e.category) {
      case 'disaster': return country.food < 300 ? 2.5 : 1;
      case 'economy': return country.treasury < 300 ? 2.2 : 1;
      case 'military': return country.military < 110 ? 1.8 : 1;
      case 'politics': return country.stability < 65 ? 2.5 : 1;
      default: return 1;
    }
  };
  return rng.weightedChoice(eligible, eligible.map(weightOf));
}

// 套用玩家決策的影響
export function applyEventEffects(country: Country, effects: EventEffect): string[] {
  const logs: string[] = [];

  if (effects.treasury) {
    country.treasury = Math.max(0, country.treasury + effects.treasury);
    logs.push(`國庫 ${effects.treasury >= 0 ? '+' : ''}${effects.treasury}`);
  }
  if (effects.food) {
    country.food = Math.max(0, country.food + effects.food);
    logs.push(`糧食 ${effects.food >= 0 ? '+' : ''}${effects.food}`);
  }
  if (effects.military) {
    country.military = Math.max(10, country.military + effects.military);
    logs.push(`軍力 ${effects.military >= 0 ? '+' : ''}${effects.military} 萬`);
  }
  if (effects.stability) {
    country.stability = Math.min(100, Math.max(0, country.stability + effects.stability));
    logs.push(`穩定度 ${effects.stability >= 0 ? '+' : ''}${effects.stability}`);
  }
  if (effects.morale) {
    country.morale = Math.min(100, Math.max(0, country.morale + effects.morale));
    logs.push(`士氣 ${effects.morale >= 0 ? '+' : ''}${effects.morale}`);
  }
  if (effects.administration) {
    country.administration = Math.min(100, Math.max(0, country.administration + effects.administration));
    logs.push(`行政 ${effects.administration >= 0 ? '+' : ''}${effects.administration}`);
  }
  if (effects.technology) {
    country.technology = Math.min(100, Math.max(0, country.technology + effects.technology));
    logs.push(`軍械技術 ${effects.technology >= 0 ? '+' : ''}${effects.technology}`);
  }
  if (effects.population) {
    country.population = Math.max(0.5, parseFloat((country.population + effects.population).toFixed(2)));
    logs.push(`人口 ${effects.population >= 0 ? '+' : ''}${effects.population} 百萬`);
  }
  if (effects.rulerHealth) {
    country.ruler.health = Math.min(100, Math.max(0, country.ruler.health + effects.rulerHealth));
    logs.push(`君主健康 ${effects.rulerHealth >= 0 ? '+' : ''}${effects.rulerHealth}`);
  }
  if (effects.characterLoyaltyChange) {
    country.characters.forEach(c => {
      if (c.isAlive) {
        c.loyalty = Math.min(100, Math.max(10, c.loyalty + (effects.characterLoyaltyChange || 0)));
      }
    });
  }

  return logs;
}

// 推進一整年的世界推演運算
export function processYearlyTurn(
  rawPrevState: GameState,
  playerChoice: EventChoice
): GameState {
  // 0. 尚未親自迎戰的入侵，由守將自動結算
  let prevState = rawPrevState;
  for (const pd of [...(rawPrevState.pendingDefenses ?? [])]) {
    prevState = autoResolveDefense(prevState, pd);
    if (prevState.phase === 'game_over') return prevState;
  }
  prevState = { ...prevState, pendingDefenses: [] };

  const rng = new SeededRNG(`${prevState.seed}_year_${prevState.year}`);
  const nextYear = prevState.year + 1;
  const playerCountryId = prevState.playerCountryId;

  // 複製國家與地域
  const countries: Record<CountryId, Country> = {} as any;
  for (const [id, c] of Object.entries(prevState.countries) as [CountryId, Country][]) {
    countries[id] = {
      ...c,
      ruler: { ...c.ruler, personality: { ...c.ruler.personality } },
      relations: { ...c.relations },
      alliances: [...c.alliances],
      atWarWith: [...c.atWarWith],
      characters: c.characters.map(ch => ({ ...ch }))
    };
  }

  const regions: Record<string, Region> = {};
  for (const [rid, r] of Object.entries(prevState.regions)) {
    regions[rid] = { ...r, neighbors: [...r.neighbors] };
  }

  const news: NewsItem[] = [];
  const playerLogs: string[] = [];
  const deceasedCharacters: string[] = [];
  const wars: WarResult[] = [];
  const pendingDefenses: PendingDefense[] = [];

  // 1. 套用玩家決策
  const playerCountry = countries[playerCountryId];
  const choiceEffects = applyEventEffects(playerCountry, playerChoice.effects);
  if (playerChoice.effects.logMessage) {
    playerLogs.push(playerChoice.effects.logMessage);
  }
  playerLogs.push(...choiceEffects);

  // 1b. 本次抉擇可能埋下伏筆；過期的伏筆自然消散
  const flags: Record<string, number> = { ...(prevState.flags ?? {}) };
  const planted = CHOICE_FLAGS[playerChoice.id];
  if (planted) {
    flags[planted.flag] = prevState.year;
    playerLogs.push(`🪤 ${planted.hint}`);
  }
  for (const [name, setYear] of Object.entries(flags)) {
    if (nextYear - setYear > FLAG_EXPIRE_YEARS) delete flags[name];
  }

  // 2. 其餘六國自主 AI 決策
  const aliveCountryIds = (Object.keys(countries) as CountryId[]).filter(id => countries[id].isAlive);

  for (const countryId of aliveCountryIds) {
    if (countryId === playerCountryId) continue;
    const aiCountry = countries[countryId];
    executeAIDecision(aiCountry, countries, regions, rng, news, nextYear);
  }

  // 3. 軍事征伐與戰鬥推演（進犯玩家者轉為待迎戰）
  resolveMilitaryCampaigns(countries, regions, rng, news, wars, nextYear, playerCountryId, pendingDefenses);

  // 4. 各國經濟、人口、行政與糧餉消耗
  for (const countryId of aliveCountryIds) {
    const c = countries[countryId];
    const ownedRegions = Object.values(regions).filter(r => r.countryId === countryId);
    
    // 檢查是否失去所有地域滅亡
    if (ownedRegions.length === 0) {
      c.isAlive = false;
      news.push({
        id: `news_dynasty_fallen_${c.id}_${nextYear}`,
        year: nextYear,
        text: `${c.name} 喪失所有城池領土，國祚斷絕，宗廟瓦解！`,
        type: 'war',
        importance: 'critical'
      });
      continue;
    }

    // 依地域產出計算賦稅與糧餉
    const totalWealth = ownedRegions.reduce((sum, r) => sum + r.baseWealth, 0);
    const totalFoodProd = ownedRegions.reduce((sum, r) => sum + r.baseFood, 0);
    const adminMultiplier = 0.6 + (c.administration / 100) * 0.8;

    // 軍隊維護費用
    const militaryGrainCost = Math.round(c.military * 0.9);
    const militarySilverCost = Math.round(c.military * 0.8);

    const netTreasuryIncome = Math.round(totalWealth * adminMultiplier) - militarySilverCost;
    const netFoodIncome = Math.round(totalFoodProd * adminMultiplier) - militaryGrainCost;

    c.treasury = Math.max(0, c.treasury + netTreasuryIncome);
    c.food = Math.max(0, c.food + netFoodIncome);

    // 斷糧處置
    if (c.food <= 0) {
      c.morale = Math.max(10, c.morale - 15);
      c.stability = Math.max(10, c.stability - 15);
      c.military = Math.max(20, Math.round(c.military * 0.85));
      if (countryId === playerCountryId) {
        playerLogs.push('國中糧餉斷絕！軍中因饑饉發生譁變，士卒逃亡。');
      }
    }

    // 人口滋生
    const growthRate = (c.food > 200 ? 0.025 : 0.008) * (c.stability / 100);
    c.population = parseFloat((c.population * (1 + growthRate)).toFixed(2));

    // 穩定度回調
    if (c.stability < 80) c.stability = Math.min(80, c.stability + 2);
    if (c.stability > 90) c.stability = Math.max(85, c.stability - 1);
  }

  // 5. 君主與臣將增長年齡
  for (const countryId of aliveCountryIds) {
    const c = countries[countryId];
    c.ruler.currentAge += 1;

    // 高齡健康衰退
    if (c.ruler.currentAge > 48) {
      c.ruler.health = Math.max(0, c.ruler.health - rng.range(1, 4));
    }

    // 臣將歷練與壽元
    c.characters.forEach(char => {
      if (!char.isAlive) return;
      char.age += 1;

      // 隨機累積歷練
      if (rng.chance(0.35)) {
        if (char.role === 'general') char.military = Math.min(100, char.military + 1);
        if (char.role === 'strategist') char.strategy = Math.min(100, char.strategy + 1);
        if (char.role === 'minister') char.administration = Math.min(100, char.administration + 1);
      }

      // 年老身故
      if (char.age >= char.maxAge || (char.age > 55 && rng.chance(0.08))) {
        char.isAlive = false;
        char.status = 'deceased';
        const msg = `${c.name} 開國功臣【${char.name}】享年 ${char.age} 歲，與世長辭。`;
        deceasedCharacters.push(msg);
        news.push({
          id: `news_char_died_${char.id}_${nextYear}`,
          year: nextYear,
          text: msg,
          type: 'death',
          importance: countryId === playerCountryId ? 'high' : 'normal'
        });
      }
    });
  }

  // 5b. 年度目標結算
  const goalResult = prevState.currentGoal
    ? evaluateGoal(prevState.currentGoal, {
        countries,
        regions,
        playerCountryId,
        stats: prevState.stats
      })
    : null;
  if (goalResult?.success) {
    playerLogs.push(`🎯 達成年度目標「${goalResult.goal.title}」！${goalResult.rewardLogs.join('、')}`);
  } else if (goalResult) {
    playerLogs.push(`🎯 未能達成年度目標「${goalResult.goal.title}」。`);
  }

  // 6. 玩家勝利與終局判斷
  const playerOwnedRegions = Object.values(regions).filter(r => r.countryId === playerCountryId);
  const totalRegionsCount = Object.keys(regions).length;
  let gameOverReason: GameOverReason | null = null;

  if (playerOwnedRegions.length >= totalRegionsCount) {
    // 天下統一
    gameOverReason = {
      title: '天下統一 · 鼎定中原',
      description: `四海歸一，三十五郡盡入版圖！${playerCountry.ruler.name} 掃除六合，一統江山，開創千秋萬世之不朽帝業！`,
      victory: true,
      subType: 'unification'
    };
  } else if (playerOwnedRegions.length === 0) {
    // 國家滅亡
    gameOverReason = {
      title: '社稷傾覆 · 國家滅亡',
      description: `${playerCountry.name} 疆域盡失，宗廟傾覆，一代王朝終成過眼雲煙。`,
      victory: false,
      subType: 'conquered'
    };
  } else if (playerCountry.ruler.currentAge >= playerCountry.ruler.maxAge || playerCountry.ruler.health <= 0) {
    // 龍馭上賓 / 大行崩殂
    gameOverReason = {
      title: '大行崩殂 · 龍馭上賓',
      description: `在位 ${nextYear - 1} 載，${playerCountry.ruler.name} 於寢宮崩殂，享年 ${playerCountry.ruler.currentAge} 歲。功過得失，俱留青史任憑後人評說！`,
      victory: playerOwnedRegions.length > 10,
      subType: 'natural_death'
    };
  } else if (playerCountry.stability <= 5 && playerCountry.food <= 0 && playerCountry.treasury <= 0) {
    // 王朝崩潰
    gameOverReason = {
      title: '天下大亂 · 王朝崩潰',
      description: `府庫枯竭、赤地千里，四方暴亂蜂起，${playerCountry.name} 社稷無以為繼，皇帝退位蒙塵。`,
      victory: false,
      subType: 'collapse'
    };
  }

  // 7. 更新歷史戰績指標
  const playerTerritoryPct = parseFloat(((playerOwnedRegions.length / totalRegionsCount) * 100).toFixed(1));
  const newStats = {
    ...prevState.stats,
    maxTerritoryPct: Math.max(prevState.stats.maxTerritoryPct, playerTerritoryPct),
    maxPopulation: Math.max(prevState.stats.maxPopulation, playerCountry.population),
    goalsCompleted: (prevState.stats.goalsCompleted ?? 0) + (goalResult?.success ? 1 : 0),
    goalsFailed: (prevState.stats.goalsFailed ?? 0) + (goalResult && !goalResult.success ? 1 : 0)
  };

  if (playerOwnedRegions.length >= 10 && !newStats.milestones.some(m => m.text.includes('10 座'))) {
    newStats.milestones.push({ year: nextYear, text: `第 ${nextYear} 年：版圖拓展至 10 座地域要衝。` });
  }
  if (playerOwnedRegions.length >= 20 && !newStats.milestones.some(m => m.text.includes('20 座'))) {
    newStats.milestones.push({ year: nextYear, text: `第 ${nextYear} 年：威加海內，坐擁天下過半版圖（20 座要地）。` });
  }

  // 8. 寫入年度歷史記錄
  const historyRecord: HistoryRecord = {
    year: nextYear,
    rulerAge: playerCountry.ruler.currentAge,
    eventTitle: prevState.currentEvent ? prevState.currentEvent.title : '年度治理',
    choiceMade: playerChoice.text,
    territoryCount: playerOwnedRegions.length,
    population: playerCountry.population,
    military: playerCountry.military,
    treasury: playerCountry.treasury,
    highlights: [...playerLogs]
  };

  // 避免近 8 年內重複抽到相同事件（historyLog 儲存的是事件標題）
  const recentEventTitles = [historyRecord, ...prevState.historyLog].slice(0, 8).map(h => h.eventTitle);
  const nextEvent = gameOverReason ? null : pickEventForYear(playerCountry, nextYear, rng, recentEventTitles, flags);
  if (nextEvent?.requiresFlag && nextEvent.consumeFlag !== false) {
    delete flags[nextEvent.requiresFlag];
  }

  const nextGoal = gameOverReason
    ? null
    : pickYearlyGoal(
        { countries, regions, playerCountryId, stats: newStats },
        new SeededRNG(`${prevState.seed}_goal_${nextYear}`),
        prevState.currentGoal?.id
      );

  const turnResult: YearlyTurnResult = {
    year: nextYear,
    news: [...news],
    wars: [...wars],
    playerEffectsSummary: playerLogs,
    deceasedCharacters,
    goalResult
  };

  return {
    ...prevState,
    year: nextYear,
    countries,
    regions,
    currentEvent: nextEvent,
    worldNews: [...news, ...prevState.worldNews].slice(0, 30),
    historyLog: [historyRecord, ...prevState.historyLog],
    lastTurnResult: turnResult,
    stats: newStats,
    phase: gameOverReason ? 'game_over' : 'turn_summary',
    gameOverReason,
    campaignsLeft: CAMPAIGNS_PER_YEAR,
    pendingDefenses: gameOverReason ? [] : pendingDefenses,
    flags,
    currentGoal: nextGoal,
    goalHistory: goalResult
      ? [{ year: nextYear, title: goalResult.goal.title, success: goalResult.success }, ...(prevState.goalHistory ?? [])]
      : prevState.goalHistory ?? []
  };
}

// 自主 AI 決策邏輯
function executeAIDecision(
  country: Country,
  allCountries: Record<CountryId, Country>,
  regions: Record<string, Region>,
  rng: SeededRNG,
  news: NewsItem[],
  year: number
) {
  const p = country.ruler.personality;
  const ownedRegions = Object.values(regions).filter(r => r.countryId === country.id);
  if (ownedRegions.length === 0) return;

  // 1. 糧食危機
  if (country.food < 120) {
    country.food += rng.range(80, 140);
    country.treasury = Math.max(0, country.treasury - 40);
    if (rng.chance(0.25)) {
      news.push({
        id: `ai_grain_${country.id}_${year}`,
        year,
        text: `${country.name} 拓開水利、修築常平倉，充實國中糧倉儲備。`,
        type: 'internal',
        importance: 'normal'
      });
    }
    return;
  }

  // 2. 財政復甦
  if (country.treasury < 100) {
    country.treasury += rng.range(90, 160);
    country.stability = Math.max(30, country.stability - 5);
    if (rng.chance(0.25)) {
      news.push({
        id: `ai_tax_${country.id}_${year}`,
        year,
        text: `${country.name} 整飭鹽鐵官營與商賈稅法，充盈國庫歲入。`,
        type: 'internal',
        importance: 'normal'
      });
    }
    return;
  }

  // 3. 軍事招募
  if (country.military < 150 && country.treasury > 200 && (p.militaryFocus > 80 || p.expansion > 80)) {
    const troopsRecruited = rng.range(25, 45);
    country.military += troopsRecruited;
    country.treasury -= 50;
    country.food -= 40;
    news.push({
      id: `ai_recruit_${country.id}_${year}`,
      year,
      text: `${country.name} 頒布召募重令，徵集 ${troopsRecruited} 萬精銳入伍充實邊防。`,
      type: 'recruitment',
      importance: 'normal'
    });
    return;
  }

  // 4. 外交結盟或互市
  if (p.diplomacy > 70 && rng.chance(0.35)) {
    const otherIds = (Object.keys(allCountries) as CountryId[]).filter(
      id => id !== country.id && allCountries[id].isAlive && !country.alliances.includes(id)
    );
    if (otherIds.length > 0) {
      const targetId = rng.choice(otherIds);
      const targetCountry = allCountries[targetId];
      if (country.relations[targetId] > 0 || p.diplomacy > 85) {
        country.relations[targetId] = Math.min(100, country.relations[targetId] + 25);
        targetCountry.relations[country.id] = Math.min(100, targetCountry.relations[country.id] + 25);
        if (!country.alliances.includes(targetId) && rng.chance(0.5)) {
          country.alliances.push(targetId);
          targetCountry.alliances.push(country.id);
          news.push({
            id: `ai_alliance_${country.id}_${targetId}_${year}`,
            year,
            text: `${country.name} 與 ${targetCountry.name} 締結互不侵犯與睦鄰互市盟約。`,
            type: 'diplomacy',
            importance: 'high'
          });
          return;
        }
      }
    }
  }

  // 5. 內政治理
  if (p.administration > 85 && country.treasury > 220 && rng.chance(0.4)) {
    country.administration = Math.min(100, country.administration + 3);
    country.stability = Math.min(100, country.stability + 4);
    country.treasury -= 40;
  }
}

// 模擬邊境各國戰役推演
const MAX_AI_WARS_PER_YEAR = 3;

function resolveMilitaryCampaigns(
  countries: Record<CountryId, Country>,
  regions: Record<string, Region>,
  rng: SeededRNG,
  news: NewsItem[],
  wars: WarResult[],
  year: number,
  playerCountryId: CountryId,
  pendingDefenses: PendingDefense[]
) {
  const aliveCountryIds = (Object.keys(countries) as CountryId[]).filter(id => countries[id].isAlive);
  let warsThisYear = 0;

  for (const attackerId of rng.shuffle(aliveCountryIds)) {
    if (warsThisYear >= MAX_AI_WARS_PER_YEAR) break;
    if (attackerId === playerCountryId) continue;
    const attacker = countries[attackerId];
    if (attacker.military < 90 || attacker.food < 120 || attacker.treasury < 100) continue;

    // 擴張慾望檢測（與玩家交戰中者更積極）
    const atWarWithPlayer = attacker.atWarWith.includes(playerCountryId);
    const attackChance = (attacker.ruler.personality.expansion / 100) * 0.45 + (atWarWithPlayer ? 0.2 : 0);
    if (!rng.chance(attackChance)) continue;

    // 尋找接壤之敵對地域（交戰國、弱國權重較高）
    const attackerRegions = Object.values(regions).filter(r => r.countryId === attackerId);
    const borderTargets: { region: Region; defender: Country }[] = [];

    attackerRegions.forEach(ar => {
      ar.neighbors.forEach(nid => {
        const neighborRegion = regions[nid];
        if (neighborRegion && neighborRegion.countryId !== attackerId) {
          const defender = countries[neighborRegion.countryId];
          if (defender && defender.isAlive && !attacker.alliances.includes(defender.id)) {
            let weight = 1;
            if (attacker.atWarWith.includes(defender.id)) weight += 2;
            if (defender.military < attacker.military * 0.8) weight += 1;
            for (let i = 0; i < weight; i++) borderTargets.push({ region: neighborRegion, defender });
          }
        }
      });
    });

    if (borderTargets.length === 0) continue;

    const targetEntry = rng.choice(borderTargets);
    const targetRegion = targetEntry.region;
    const defender = targetEntry.defender;
    warsThisYear++;

    // 進犯玩家：轉為玩家親自指揮的守城戰
    if (defender.id === playerCountryId) {
      if (pendingDefenses.some(p => p.regionId === targetRegion.id)) continue;
      const committed = Math.min(attacker.military, Math.round(attacker.military * rng.range(45, 70) / 100));
      attacker.food = Math.max(0, attacker.food - 40);
      attacker.treasury = Math.max(0, attacker.treasury - 30);
      if (!attacker.atWarWith.includes(playerCountryId)) attacker.atWarWith.push(playerCountryId);
      if (!defender.atWarWith.includes(attackerId)) defender.atWarWith.push(attackerId);
      attacker.relations[playerCountryId] = Math.max(-100, (attacker.relations[playerCountryId] ?? 0) - 30);
      defender.relations[attackerId] = Math.max(-100, (defender.relations[attackerId] ?? 0) - 30);
      pendingDefenses.push({ attackerId, regionId: targetRegion.id, attackerTroops: committed });
      news.push({
        id: `war_invade_player_${attackerId}_${targetRegion.id}_${year}`,
        year,
        text: `⚠️ 邊關告急！${attacker.name} 起兵 ${committed} 萬，兵鋒直指我國 ${targetRegion.chineseName}！`,
        type: 'war',
        importance: 'critical'
      });
      continue;
    }

    // 統帥能力加成
    const attackerGeneral = attacker.characters.find(c => c.isAlive && c.role === 'general');
    const attackerCmdBonus = attackerGeneral ? (attackerGeneral.military + attackerGeneral.strategy) / 200 : 0.4;

    const defenderGeneral = defender.characters.find(c => c.isAlive && c.role === 'general');
    const defenderCmdBonus = defenderGeneral ? (defenderGeneral.military + defenderGeneral.strategy) / 200 : 0.4;

    // 地形防禦加成
    let terrainBonus = 1.0;
    if (targetRegion.terrain === 'mountains') terrainBonus = 1.4;
    else if (targetRegion.terrain === 'river') terrainBonus = 1.25;
    else if (targetRegion.isCapital) terrainBonus = 1.35;

    const attackerCombatPower = attacker.military * (attacker.morale / 100) * (1 + attackerCmdBonus) * rng.range(85, 115);
    const defenderCombatPower = defender.military * (defender.morale / 100) * (1 + defenderCmdBonus) * terrainBonus * rng.range(85, 115);

    const attackerCommitted = Math.min(attacker.military, rng.range(40, 90));
    const defenderCommitted = Math.min(defender.military, rng.range(30, 80));

    let conquered = false;
    let attackerLoss = 0;
    let defenderLoss = 0;

    if (attackerCombatPower > defenderCombatPower * 1.1) {
      // 進攻方獲勝佔領
      conquered = true;
      attackerLoss = Math.round(attackerCommitted * rng.range(10, 22) / 100);
      defenderLoss = Math.round(defenderCommitted * rng.range(25, 45) / 100);

      // 領土易手！
      targetRegion.countryId = attackerId;

      attacker.morale = Math.min(100, attacker.morale + 10);
      defender.morale = Math.max(10, defender.morale - 15);
      defender.stability = Math.max(10, defender.stability - 12);

      attacker.military = Math.max(15, attacker.military - attackerLoss);
      defender.military = Math.max(15, defender.military - defenderLoss);

      attacker.food = Math.max(0, attacker.food - 60);
      attacker.treasury = Math.max(0, attacker.treasury - 40);

      const summary = `${attacker.name} 興兵大舉進攻，自 ${defender.name} 手中奪下 ${targetRegion.chineseName}！`;
      wars.push({
        attackerId,
        defenderId: defender.id,
        targetRegionId: targetRegion.id,
        conquered: true,
        attackerCasualties: attackerLoss,
        defenderCasualties: defenderLoss,
        summary
      });

      news.push({
        id: `war_conquer_${attackerId}_${targetRegion.id}_${year}`,
        year,
        text: `${attacker.name} 鐵騎突入破城，攻克 ${defender.name} 所屬的 ${targetRegion.chineseName}！`,
        type: 'territory',
        importance: 'high'
      });

      attacker.relations[defender.id] = Math.max(-100, attacker.relations[defender.id] - 40);
      defender.relations[attackerId] = Math.max(-100, defender.relations[attackerId] - 60);
    } else {
      // 防守方成功抵禦
      attackerLoss = Math.round(attackerCommitted * rng.range(20, 35) / 100);
      defenderLoss = Math.round(defenderCommitted * rng.range(12, 22) / 100);

      attacker.morale = Math.max(10, attacker.morale - 10);
      defender.morale = Math.min(100, defender.morale + 8);

      attacker.military = Math.max(15, attacker.military - attackerLoss);
      defender.military = Math.max(15, defender.military - defenderLoss);

      attacker.food = Math.max(0, attacker.food - 50);

      const summary = `${defender.name} 守軍堅壁清野奮勇抵抗，擊退 ${attacker.name} 對 ${targetRegion.chineseName} 的進犯。`;
      wars.push({
        attackerId,
        defenderId: defender.id,
        targetRegionId: targetRegion.id,
        conquered: false,
        attackerCasualties: attackerLoss,
        defenderCasualties: defenderLoss,
        summary
      });

      news.push({
        id: `war_repel_${attackerId}_${defender.id}_${year}`,
        year,
        text: `${defender.name} 守軍挫敗了 ${attacker.name} 對 ${targetRegion.chineseName} 的軍事圍攻。`,
        type: 'war',
        importance: 'normal'
      });
    }
  }
}

// 玩家主動發起戰役進攻
export function executePlayerAttack(
  state: GameState,
  targetRegionId: string
): { success: boolean; message: string; state: GameState } {
  const playerCountry = state.countries[state.playerCountryId];
  const targetRegion = state.regions[targetRegionId];

  if (!targetRegion) {
    return { success: false, message: '目標地域無效。', state };
  }
  if (targetRegion.countryId === state.playerCountryId) {
    return { success: false, message: '該領土已在朝廷掌控之中。', state };
  }

  // 檢查是否與本土接壤
  const playerOwnedRegions = Object.values(state.regions).filter(r => r.countryId === state.playerCountryId);
  const isAdjacent = playerOwnedRegions.some(pr => pr.neighbors.includes(targetRegionId));

  if (!isAdjacent) {
    return { success: false, message: '兵鋒無法直達！此地未與我國邊境接壤。', state };
  }

  if (playerCountry.military < 40) {
    return { success: false, message: '軍力不足！出師圍城至少需 4 萬兵力。', state };
  }
  if (playerCountry.food < 60) {
    return { success: false, message: '糧餉告急！軍隊遠征至少需備糧 60 擔。', state };
  }

  const rng = new SeededRNG(`${state.seed}_player_war_${state.year}_${targetRegionId}`);
  const defender = state.countries[targetRegion.countryId];

  // 統帥能力加成
  const playerGeneral = playerCountry.characters.find(c => c.isAlive && c.role === 'general');
  const playerCmdBonus = playerGeneral ? (playerGeneral.military + playerGeneral.strategy) / 200 : 0.45;

  const defenderGeneral = defender.characters.find(c => c.isAlive && c.role === 'general');
  const defenderCmdBonus = defenderGeneral ? (defenderGeneral.military + defenderGeneral.strategy) / 200 : 0.4;

  let terrainBonus = 1.0;
  if (targetRegion.terrain === 'mountains') terrainBonus = 1.4;
  else if (targetRegion.terrain === 'river') terrainBonus = 1.25;
  else if (targetRegion.isCapital) terrainBonus = 1.35;

  const attackerPower = playerCountry.military * (playerCountry.morale / 100) * (1 + playerCmdBonus) * rng.range(90, 120);
  const defenderPower = defender.military * (defender.morale / 100) * (1 + defenderCmdBonus) * terrainBonus * rng.range(85, 115);

  const attackerLoss = Math.round(playerCountry.military * rng.range(8, 20) / 100);
  const defenderLoss = Math.round(defender.military * rng.range(15, 35) / 100);

  const updatedCountries = { ...state.countries };
  const updatedRegions = { ...state.regions };

  let conquered = false;
  let logText = '';

  if (attackerPower >= defenderPower) {
    conquered = true;
    targetRegion.countryId = state.playerCountryId;

    playerCountry.military = Math.max(20, playerCountry.military - attackerLoss);
    defender.military = Math.max(10, defender.military - defenderLoss);
    playerCountry.food = Math.max(0, playerCountry.food - 50);
    playerCountry.treasury = Math.max(0, playerCountry.treasury - 30);

    playerCountry.morale = Math.min(100, playerCountry.morale + 12);
    defender.morale = Math.max(10, defender.morale - 15);

    logText = `大捷！王師克復 ${targetRegion.chineseName}！敵軍傷亡 ${defenderLoss} 萬（我軍損失 ${attackerLoss} 萬）。`;
  } else {
    conquered = false;
    playerCountry.military = Math.max(20, playerCountry.military - (attackerLoss * 1.5));
    defender.military = Math.max(10, defender.military - defenderLoss);
    playerCountry.food = Math.max(0, playerCountry.food - 50);
    playerCountry.morale = Math.max(10, playerCountry.morale - 12);

    logText = `失利！強攻 ${targetRegion.chineseName} 受挫，大軍被擊退（我軍傷亡 ${Math.round(attackerLoss * 1.5)} 萬）。`;
  }

  const newsItem: NewsItem = {
    id: `player_war_${Date.now()}`,
    year: state.year,
    text: logText,
    type: 'war',
    importance: 'critical'
  };

  const updatedStats = {
    ...state.stats,
    warsStarted: state.stats.warsStarted + 1,
    warsWon: state.stats.warsWon + (conquered ? 1 : 0),
    warsLost: state.stats.warsLost + (conquered ? 0 : 1)
  };

  const nextState: GameState = {
    ...state,
    countries: updatedCountries,
    regions: updatedRegions,
    stats: updatedStats,
    worldNews: [newsItem, ...state.worldNews]
  };

  return {
    success: conquered,
    message: logText,
    state: nextState
  };
}
