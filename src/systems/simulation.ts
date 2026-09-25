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
import { INITIAL_RULERS } from '../data/rulers';
import { INITIAL_CHARACTERS } from '../data/characters';
import { INITIAL_REGIONS } from '../data/regions';

// Initialize a new game state
export function createInitialGameState(seed?: string, chosenRulerId: CountryId = 'qin'): GameState {
  const finalSeed = seed || SeededRNG.generateRandomSeed();
  const rng = new SeededRNG(finalSeed);

  // Deep clone initial rulers, characters, regions
  const countryIds: CountryId[] = ['qin', 'han', 'sui', 'tang', 'song', 'ming', 'qing'];
  
  const regions: Record<string, Region> = {};
  for (const [key, val] of Object.entries(INITIAL_REGIONS)) {
    regions[key] = { ...val, neighbors: [...val.neighbors] };
  }

  const countries: Record<CountryId, Country> = {} as any;

  countryIds.forEach(id => {
    const rulerBase = INITIAL_RULERS[id];
    // Add small randomized variance to maxAge based on seed
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

    // Find owned regions count
    const ownedRegions = Object.values(regions).filter(r => r.countryId === id);
    const capitalRegion = ownedRegions.find(r => r.isCapital) || ownedRegions[0];

    const initialPop = ownedRegions.reduce((sum, r) => sum + r.basePop, 0);

    // Initial diplomatic relations: neutral or slight historical affinities
    const relations: Record<CountryId, number> = {} as any;
    countryIds.forEach(otherId => {
      if (otherId === id) {
        relations[otherId] = 100;
      } else {
        // -10 to +15 starting neutral/slight friction
        relations[otherId] = rng.range(-15, 20);
      }
    });

    countries[id] = {
      id,
      name: ruler.dynasty,
      chineseName: ruler.name,
      color: ruler.color,
      textColor: ruler.accentColor,
      capitalName: capitalRegion ? capitalRegion.chineseName : 'Imperial Seat',
      capitalRegionId: capitalRegion ? capitalRegion.id : '',
      ruler,
      population: parseFloat(initialPop.toFixed(1)),
      food: rng.range(380, 480),
      treasury: rng.range(420, 520),
      military: rng.range(120, 160), // in thousands
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

  const firstEvent = pickEventForYear(countries[chosenRulerId], 1, rng, []);

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
        text: 'The Era of Seven Emperors begins! Qin, Han, Sui, Tang, Song, Ming, and Qing now contend for the Mandate of Heaven.',
        type: 'celebration',
        importance: 'critical'
      }
    ],
    historyLog: [
      {
        year: 1,
        rulerAge: countries[chosenRulerId].ruler.currentAge,
        eventTitle: 'Ascension to the Imperial Throne',
        choiceMade: 'Assume imperial mantle and survey the realm',
        territoryCount: Object.values(regions).filter(r => r.countryId === chosenRulerId).length,
        population: countries[chosenRulerId].population,
        military: countries[chosenRulerId].military,
        treasury: countries[chosenRulerId].treasury,
        highlights: ['The Seven Dynasties stand assembled in a shared realm.']
      }
    ],
    lastTurnResult: null,
    stats: {
      warsStarted: 0,
      warsWon: 0,
      warsLost: 0,
      maxTerritoryPct: 14.3, // 5 / 35 regions
      maxPopulation: countries[chosenRulerId].population,
      milestones: [
        { year: 1, text: `Year 1: ${countries[chosenRulerId].ruler.name} ascends the throne in ${countries[chosenRulerId].capitalName}.` }
      ]
    },
    phase: 'turn_event',
    gameOverReason: null
  };
}

// Select an event for the year using RNG
export function pickEventForYear(country: Country, year: number, rng: SeededRNG, usedEventIds: string[]): GameEvent {
  const eligible = GAME_EVENTS.filter(e => {
    if (usedEventIds.includes(e.id) && usedEventIds.length < GAME_EVENTS.length) {
      return false;
    }
    if (e.condition && !e.condition(country, year)) {
      return false;
    }
    return true;
  });

  if (eligible.length === 0) {
    return rng.choice(GAME_EVENTS);
  }
  return rng.choice(eligible);
}

// Apply consequences of player's event choice
export function applyEventEffects(country: Country, effects: EventEffect): string[] {
  const logs: string[] = [];

  if (effects.treasury) {
    country.treasury = Math.max(0, country.treasury + effects.treasury);
    logs.push(`Treasury ${effects.treasury >= 0 ? '+' : ''}${effects.treasury}`);
  }
  if (effects.food) {
    country.food = Math.max(0, country.food + effects.food);
    logs.push(`Food ${effects.food >= 0 ? '+' : ''}${effects.food}`);
  }
  if (effects.military) {
    country.military = Math.max(10, country.military + effects.military);
    logs.push(`Military ${effects.military >= 0 ? '+' : ''}${effects.military}k`);
  }
  if (effects.stability) {
    country.stability = Math.min(100, Math.max(0, country.stability + effects.stability));
    logs.push(`Stability ${effects.stability >= 0 ? '+' : ''}${effects.stability}`);
  }
  if (effects.morale) {
    country.morale = Math.min(100, Math.max(0, country.morale + effects.morale));
    logs.push(`Morale ${effects.morale >= 0 ? '+' : ''}${effects.morale}`);
  }
  if (effects.administration) {
    country.administration = Math.min(100, Math.max(0, country.administration + effects.administration));
    logs.push(`Administration ${effects.administration >= 0 ? '+' : ''}${effects.administration}`);
  }
  if (effects.technology) {
    country.technology = Math.min(100, Math.max(0, country.technology + effects.technology));
    logs.push(`Technology ${effects.technology >= 0 ? '+' : ''}${effects.technology}`);
  }
  if (effects.population) {
    country.population = Math.max(0.5, parseFloat((country.population + effects.population).toFixed(2)));
    logs.push(`Population ${effects.population >= 0 ? '+' : ''}${effects.population}M`);
  }
  if (effects.rulerHealth) {
    country.ruler.health = Math.min(100, Math.max(0, country.ruler.health + effects.rulerHealth));
    logs.push(`Emperor Health ${effects.rulerHealth >= 0 ? '+' : ''}${effects.rulerHealth}`);
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

// Process 1 full year for the entire world
export function processYearlyTurn(
  prevState: GameState,
  playerChoice: EventChoice
): GameState {
  const rng = new SeededRNG(`${prevState.seed}_year_${prevState.year}`);
  const nextYear = prevState.year + 1;
  const playerCountryId = prevState.playerCountryId;

  // Clone countries & regions
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

  // 1. Apply player's choice
  const playerCountry = countries[playerCountryId];
  const choiceEffects = applyEventEffects(playerCountry, playerChoice.effects);
  if (playerChoice.effects.logMessage) {
    playerLogs.push(playerChoice.effects.logMessage);
  }
  playerLogs.push(...choiceEffects);

  // 2. Process AI Country Decisions
  const aliveCountryIds = (Object.keys(countries) as CountryId[]).filter(id => countries[id].isAlive);

  for (const countryId of aliveCountryIds) {
    if (countryId === playerCountryId) continue;
    const aiCountry = countries[countryId];
    executeAIDecision(aiCountry, countries, regions, rng, news, nextYear);
  }

  // 3. Resolve Military Conflicts / Wars
  resolveMilitaryCampaigns(countries, regions, rng, news, wars, nextYear);

  // 4. Economy, Population, Administration, and Troop Upkeep for all countries
  for (const countryId of aliveCountryIds) {
    const c = countries[countryId];
    const ownedRegions = Object.values(regions).filter(r => r.countryId === countryId);
    
    // Check if wiped out of territory
    if (ownedRegions.length === 0) {
      c.isAlive = false;
      news.push({
        id: `news_dynasty_fallen_${c.id}_${nextYear}`,
        year: nextYear,
        text: `The ${c.name} Dynasty has lost its final stronghold and collapsed into history!`,
        type: 'war',
        importance: 'critical'
      });
      continue;
    }

    // Revenue calculation based on territory wealth and administration
    const totalWealth = ownedRegions.reduce((sum, r) => sum + r.baseWealth, 0);
    const totalFoodProd = ownedRegions.reduce((sum, r) => sum + r.baseFood, 0);
    const adminMultiplier = 0.6 + (c.administration / 100) * 0.8;

    // Upkeep costs: military requires food and silver
    const militaryGrainCost = Math.round(c.military * 0.9);
    const militarySilverCost = Math.round(c.military * 0.8);

    const netTreasuryIncome = Math.round(totalWealth * adminMultiplier) - militarySilverCost;
    const netFoodIncome = Math.round(totalFoodProd * adminMultiplier) - militaryGrainCost;

    c.treasury = Math.max(0, c.treasury + netTreasuryIncome);
    c.food = Math.max(0, c.food + netFoodIncome);

    // If starving (food == 0), morale & stability plummet, casualties
    if (c.food <= 0) {
      c.morale = Math.max(10, c.morale - 15);
      c.stability = Math.max(10, c.stability - 15);
      c.military = Math.max(20, Math.round(c.military * 0.85));
      if (countryId === playerCountryId) {
        playerLogs.push('Grain reserves depleted! Armies mutiny and desert from famine.');
      }
    }

    // Natural population growth based on food surplus and stability
    const growthRate = (c.food > 200 ? 0.025 : 0.008) * (c.stability / 100);
    c.population = parseFloat((c.population * (1 + growthRate)).toFixed(2));

    // Natural stability drift towards 80
    if (c.stability < 80) c.stability = Math.min(80, c.stability + 2);
    if (c.stability > 90) c.stability = Math.max(85, c.stability - 1);
  }

  // 5. Age Rulers and Characters
  for (const countryId of aliveCountryIds) {
    const c = countries[countryId];
    c.ruler.currentAge += 1;

    // Health decays slightly with older age
    if (c.ruler.currentAge > 48) {
      c.ruler.health = Math.max(0, c.ruler.health - rng.range(1, 4));
    }

    // Age characters
    c.characters.forEach(char => {
      if (!char.isAlive) return;
      char.age += 1;

      // Experience increases stats slightly
      if (rng.chance(0.35)) {
        if (char.role === 'general') char.military = Math.min(100, char.military + 1);
        if (char.role === 'strategist') char.strategy = Math.min(100, char.strategy + 1);
        if (char.role === 'minister') char.administration = Math.min(100, char.administration + 1);
      }

      // Check death from old age or illness
      if (char.age >= char.maxAge || (char.age > 55 && rng.chance(0.08))) {
        char.isAlive = false;
        char.status = 'deceased';
        const msg = `${char.name} (${char.chineseName}) of ${c.name} passed away at age ${char.age}.`;
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

  // 6. Check End / Victory Conditions for Player
  const playerOwnedRegions = Object.values(regions).filter(r => r.countryId === playerCountryId);
  const totalRegionsCount = Object.keys(regions).length;
  let gameOverReason: GameOverReason | null = null;

  if (playerOwnedRegions.length >= totalRegionsCount) {
    // Total unification!
    gameOverReason = {
      title: 'Mandate of Heaven Fulfilled · China Unified',
      description: `All thirty-five regions under heaven have surrendered to the ${playerCountry.name} Dynasty! ${playerCountry.ruler.name} has unified the realm into an everlasting empire.`,
      victory: true,
      subType: 'unification'
    };
  } else if (playerOwnedRegions.length === 0) {
    gameOverReason = {
      title: 'Dynasty Conquered & Extinguished',
      description: `All imperial territories of the ${playerCountry.name} Dynasty have fallen. The court is extinguished and your dynasty passes into history.`,
      victory: false,
      subType: 'conquered'
    };
  } else if (playerCountry.ruler.currentAge >= playerCountry.ruler.maxAge || playerCountry.ruler.health <= 0) {
    gameOverReason = {
      title: 'The Dragon Ascends to Heaven (Imperial Demise)',
      description: `After reigning for ${nextYear - 1} years, ${playerCountry.ruler.name} passed away in the imperial bedchamber at age ${playerCountry.ruler.currentAge}. Your deeds and conquest shall be sung for millennia!`,
      victory: playerOwnedRegions.length > 10,
      subType: 'natural_death'
    };
  } else if (playerCountry.stability <= 5 && playerCountry.food <= 0 && playerCountry.treasury <= 0) {
    gameOverReason = {
      title: 'Imperial Collapse & Anarchy',
      description: `With empty granaries and bankrupt treasury, widespread rebellions tore the ${playerCountry.name} Dynasty apart. The sovereign was deposed.`,
      victory: false,
      subType: 'collapse'
    };
  }

  // 7. Update Game Stats
  const playerTerritoryPct = parseFloat(((playerOwnedRegions.length / totalRegionsCount) * 100).toFixed(1));
  const newStats = {
    ...prevState.stats,
    maxTerritoryPct: Math.max(prevState.stats.maxTerritoryPct, playerTerritoryPct),
    maxPopulation: Math.max(prevState.stats.maxPopulation, playerCountry.population)
  };

  // Add milestone if captured major territories
  if (playerOwnedRegions.length >= 10 && !newStats.milestones.some(m => m.text.includes('10 territories'))) {
    newStats.milestones.push({ year: nextYear, text: `Year ${nextYear}: Reached 10 regions across China.` });
  }
  if (playerOwnedRegions.length >= 20 && !newStats.milestones.some(m => m.text.includes('20 territories'))) {
    newStats.milestones.push({ year: nextYear, text: `Year ${nextYear}: Controlled over half the realm (20 regions).` });
  }

  // 8. History Log Entry
  const historyRecord: HistoryRecord = {
    year: nextYear,
    rulerAge: playerCountry.ruler.currentAge,
    eventTitle: prevState.currentEvent ? prevState.currentEvent.title : 'Yearly Governance',
    choiceMade: playerChoice.text,
    territoryCount: playerOwnedRegions.length,
    population: playerCountry.population,
    military: playerCountry.military,
    treasury: playerCountry.treasury,
    highlights: [...playerLogs]
  };

  const usedEventIds = prevState.historyLog.map(h => h.eventTitle);
  const nextEvent = gameOverReason ? null : pickEventForYear(playerCountry, nextYear, rng, usedEventIds);

  const turnResult: YearlyTurnResult = {
    year: nextYear,
    news: [...news],
    wars: [...wars],
    playerEffectsSummary: playerLogs,
    deceasedCharacters
  };

  return {
    ...prevState,
    year: nextYear,
    countries,
    regions,
    currentEvent: nextEvent,
    worldNews: [...news, ...prevState.worldNews].slice(0, 30), // keep latest 30 news items
    historyLog: [historyRecord, ...prevState.historyLog],
    lastTurnResult: turnResult,
    stats: newStats,
    phase: gameOverReason ? 'game_over' : 'turn_summary',
    gameOverReason
  };
}

// AI logic for autonomous countries
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

  // 1. Food crisis
  if (country.food < 120) {
    country.food += rng.range(80, 140);
    country.treasury = Math.max(0, country.treasury - 40);
    if (rng.chance(0.25)) {
      news.push({
        id: `ai_grain_${country.id}_${year}`,
        year,
        text: `${country.name} expanded irrigation along river valleys to bolster grain reserves.`,
        type: 'internal',
        importance: 'normal'
      });
    }
    return;
  }

  // 2. Treasury recovery
  if (country.treasury < 100) {
    country.treasury += rng.range(90, 160);
    country.stability = Math.max(30, country.stability - 5);
    if (rng.chance(0.25)) {
      news.push({
        id: `ai_tax_${country.id}_${year}`,
        year,
        text: `${country.name} reformed merchant customs and salt monopolies to replenish the state treasury.`,
        type: 'internal',
        importance: 'normal'
      });
    }
    return;
  }

  // 3. Military Recruitment if high expansion/military focus
  if (country.military < 150 && country.treasury > 200 && (p.militaryFocus > 80 || p.expansion > 80)) {
    const troopsRecruited = rng.range(25, 45);
    country.military += troopsRecruited;
    country.treasury -= 50;
    country.food -= 40;
    news.push({
      id: `ai_recruit_${country.id}_${year}`,
      year,
      text: `${country.name} mobilized ${troopsRecruited},000 fresh infantry and cavalry banner troops.`,
      type: 'recruitment',
      importance: 'normal'
    });
    return;
  }

  // 4. Diplomatic Alliances or Non-Aggression
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
            text: `${country.name} and ${targetCountry.name} signed a strategic non-aggression and mutual trade treaty.`,
            type: 'diplomacy',
            importance: 'high'
          });
          return;
        }
      }
    }
  }

  // 5. Internal Development
  if (p.administration > 85 && country.treasury > 220 && rng.chance(0.4)) {
    country.administration = Math.min(100, country.administration + 3);
    country.stability = Math.min(100, country.stability + 4);
    country.treasury -= 40;
  }
}

// Simulated War Resolution between neighboring borders
function resolveMilitaryCampaigns(
  countries: Record<CountryId, Country>,
  regions: Record<string, Region>,
  rng: SeededRNG,
  news: NewsItem[],
  wars: WarResult[],
  year: number
) {
  const aliveCountryIds = (Object.keys(countries) as CountryId[]).filter(id => countries[id].isAlive);

  for (const attackerId of aliveCountryIds) {
    const attacker = countries[attackerId];
    if (attacker.military < 90 || attacker.food < 120 || attacker.treasury < 100) continue;

    // Check expansion urge
    const attackChance = (attacker.ruler.personality.expansion / 100) * 0.45;
    if (!rng.chance(attackChance)) continue;

    // Find border regions belonging to other nations adjacent to attacker's regions
    const attackerRegions = Object.values(regions).filter(r => r.countryId === attackerId);
    const borderTargets: { region: Region; defender: Country }[] = [];

    attackerRegions.forEach(ar => {
      ar.neighbors.forEach(nid => {
        const neighborRegion = regions[nid];
        if (neighborRegion && neighborRegion.countryId !== attackerId) {
          const defender = countries[neighborRegion.countryId];
          // Do not attack solemn allies unless low stability/betrayal
          if (defender && defender.isAlive && !attacker.alliances.includes(defender.id)) {
            borderTargets.push({ region: neighborRegion, defender });
          }
        }
      });
    });

    if (borderTargets.length === 0) continue;

    // Choose target (prefer weaker defenders or non-capitals first)
    const targetEntry = rng.choice(borderTargets);
    const targetRegion = targetEntry.region;
    const defender = targetEntry.defender;

    // Calculate combat strengths
    // Commander bonuses
    const attackerGeneral = attacker.characters.find(c => c.isAlive && c.role === 'general');
    const attackerCmdBonus = attackerGeneral ? (attackerGeneral.military + attackerGeneral.strategy) / 200 : 0.4;

    const defenderGeneral = defender.characters.find(c => c.isAlive && c.role === 'general');
    const defenderCmdBonus = defenderGeneral ? (defenderGeneral.military + defenderGeneral.strategy) / 200 : 0.4;

    // Terrain defensive bonus
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
      // Attacker triumph
      conquered = true;
      attackerLoss = Math.round(attackerCommitted * rng.range(10, 22) / 100);
      defenderLoss = Math.round(defenderCommitted * rng.range(25, 45) / 100);

      // Ownership flips!
      const previousOwnerId = targetRegion.countryId;
      targetRegion.countryId = attackerId;

      attacker.morale = Math.min(100, attacker.morale + 10);
      defender.morale = Math.max(10, defender.morale - 15);
      defender.stability = Math.max(10, defender.stability - 12);

      // Casualties
      attacker.military = Math.max(15, attacker.military - attackerLoss);
      defender.military = Math.max(15, defender.military - defenderLoss);

      // Food & supply consumption
      attacker.food = Math.max(0, attacker.food - 60);
      attacker.treasury = Math.max(0, attacker.treasury - 40);

      const summary = `${attacker.name} launched a fierce campaign, taking ${targetRegion.chineseName} from ${defender.name}!`;
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
        text: `${attacker.name} storm troopers broke through the defenses of ${defender.name} and captured ${targetRegion.chineseName} (${targetRegion.name})!`,
        type: 'territory',
        importance: 'high'
      });

      // Diplomatic hatred
      attacker.relations[defender.id] = Math.max(-100, attacker.relations[defender.id] - 40);
      defender.relations[attackerId] = Math.max(-100, defender.relations[attackerId] - 60);
    } else {
      // Repelled!
      attackerLoss = Math.round(attackerCommitted * rng.range(20, 35) / 100);
      defenderLoss = Math.round(defenderCommitted * rng.range(12, 22) / 100);

      attacker.morale = Math.max(10, attacker.morale - 10);
      defender.morale = Math.min(100, defender.morale + 8);

      attacker.military = Math.max(15, attacker.military - attackerLoss);
      defender.military = Math.max(15, defender.military - defenderLoss);

      attacker.food = Math.max(0, attacker.food - 50);

      const summary = `${defender.name} valiantly repelled the assault of ${attacker.name} at ${targetRegion.chineseName}.`;
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
        text: `${defender.name} forces repulsed an invasion by ${attacker.name} at ${targetRegion.chineseName}.`,
        type: 'war',
        importance: 'normal'
      });
    }

    // Only one major war declared per nation turn to prevent infinite cascade
    break;
  }
}

// Player initiated offensive war declaration
export function executePlayerAttack(
  state: GameState,
  targetRegionId: string
): { success: boolean; message: string; state: GameState } {
  const playerCountry = state.countries[state.playerCountryId];
  const targetRegion = state.regions[targetRegionId];

  if (!targetRegion) {
    return { success: false, message: 'Invalid region targeted.', state };
  }
  if (targetRegion.countryId === state.playerCountryId) {
    return { success: false, message: 'You already control this territory.', state };
  }

  // Check border adjacency
  const playerOwnedRegions = Object.values(state.regions).filter(r => r.countryId === state.playerCountryId);
  const isAdjacent = playerOwnedRegions.some(pr => pr.neighbors.includes(targetRegionId));

  if (!isAdjacent) {
    return { success: false, message: 'Cannot march on this region — it does not share a border with your territories!', state };
  }

  if (playerCountry.military < 40) {
    return { success: false, message: 'Insufficient troops! You need at least 40,000 soldiers for a siege.', state };
  }
  if (playerCountry.food < 60) {
    return { success: false, message: 'Insufficient grain! Armies cannot march without at least 60 grain.', state };
  }

  const rng = new SeededRNG(`${state.seed}_player_war_${state.year}_${targetRegionId}`);
  const defender = state.countries[targetRegion.countryId];

  // Commander bonuses
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

    logText = `VICTORY! Imperial banners raised over ${targetRegion.chineseName}! Enemy sustained ${defenderLoss}k casualties (Losses: ${attackerLoss}k).`;
  } else {
    conquered = false;
    playerCountry.military = Math.max(20, playerCountry.military - (attackerLoss * 1.5));
    defender.military = Math.max(10, defender.military - defenderLoss);
    playerCountry.food = Math.max(0, playerCountry.food - 50);
    playerCountry.morale = Math.max(10, playerCountry.morale - 12);

    logText = `DEFEAT! The siege of ${targetRegion.chineseName} was repelled with heavy casualties (-${Math.round(attackerLoss * 1.5)}k troops).`;
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
