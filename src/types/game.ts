export type CountryId = 'qin' | 'han' | 'sui' | 'tang' | 'song' | 'ming' | 'qing';

export interface Personality {
  centralization: number;   // 0-100: Desire for absolute imperial control
  expansion: number;        // 0-100: Tendency to declare wars and conquer
  militaryFocus: number;    // 0-100: Prioritize troops & defense
  administration: number;   // 0-100: Prioritize governance, laws, infrastructure
  diplomacy: number;        // 0-100: Willingness to ally and negotiate
  talentUtilization: number;// 0-100: Relying on ministers and generals
  adaptability: number;     // 0-100: Flexibility in crises
  description: string;
}

export interface Ruler {
  id: CountryId;
  name: string;             // e.g. "Qin Shi Huang / 嬴政"
  dynasty: string;          // e.g. "Qin / 秦"
  title: string;            // e.g. "First Emperor / 始皇帝"
  color: string;            // Primary hex
  accentColor: string;
  portrait: string;         // Icon/symbol representation
  baseAge: number;          // Starting age (e.g. 21)
  currentAge: number;
  maxAge: number;           // Natural life expectancy (55-80, dynamic)
  health: number;           // 0-100
  personality: Personality;
  bio: string;
  historicalQuote: string;
}

export interface Character {
  id: string;
  name: string;
  chineseName: string;
  countryId: CountryId;
  role: 'general' | 'minister' | 'strategist';
  military: number;         // 1-100
  strategy: number;         // 1-100
  administration: number;   // 1-100
  diplomacy: number;        // 1-100
  loyalty: number;          // 0-100
  age: number;
  maxAge: number;
  isAlive: boolean;
  status: 'active' | 'injured' | 'retired' | 'deceased';
  specialty: string;
}

export type TerrainType = 'plains' | 'mountains' | 'river' | 'hills' | 'plateau' | 'coast';

export interface Region {
  id: string;
  name: string;
  chineseName: string;
  countryId: CountryId;
  basePop: number;          // in millions, e.g. 1.2
  baseWealth: number;       // annual tax output
  baseFood: number;         // annual grain output
  terrain: TerrainType;
  path: string;             // SVG polygon/path data
  centerX: number;          // For label/capital placement
  centerY: number;
  neighbors: string[];      // Adjacent region IDs
  isCapital?: boolean;
}

export interface Country {
  id: CountryId;
  name: string;
  chineseName: string;
  color: string;
  textColor: string;
  capitalName: string;
  capitalRegionId: string;
  ruler: Ruler;
  
  // Core stats
  population: number;       // in millions (e.g. 18.5)
  food: number;             // grain reserves (0 - 1500)
  treasury: number;         // gold coins (0 - 1500)
  military: number;         // troop strength in thousands (e.g. 120k)
  administration: number;   // 1-100
  stability: number;        // 1-100
  morale: number;           // 1-100
  technology: number;       // 1-100
  
  // Dynamic relations (-100 hostile to +100 trusted ally)
  relations: Record<CountryId, number>;
  alliances: CountryId[];
  atWarWith: CountryId[];
  isAlive: boolean;
  
  // Characters
  characters: Character[];
}

export interface EventEffect {
  treasury?: number;
  food?: number;
  military?: number;
  stability?: number;
  morale?: number;
  administration?: number;
  technology?: number;
  population?: number; // change in millions
  rulerHealth?: number;
  relations?: Partial<Record<CountryId, number>>;
  triggerWar?: CountryId;
  triggerAlliance?: CountryId;
  characterLoyaltyChange?: number;
  logMessage?: string;
}

export interface EventChoice {
  id: string;
  text: string;
  description: string;
  previewEffects: string;   // short user-visible consequence hint
  effects: EventEffect;
}

export interface GameEvent {
  id: string;
  title: string;
  category: 'disaster' | 'military' | 'politics' | 'economy' | 'diplomacy' | 'character' | 'culture';
  description: string;
  historicalContext?: string;
  choices: EventChoice[];
  condition?: (country: Country, year: number) => boolean;
}

export interface NewsItem {
  id: string;
  year: number;
  text: string;
  type: 'war' | 'diplomacy' | 'disaster' | 'recruitment' | 'territory' | 'celebration' | 'internal' | 'death';
  importance: 'critical' | 'high' | 'normal';
}

export interface WarResult {
  attackerId: CountryId;
  defenderId: CountryId;
  targetRegionId: string;
  conquered: boolean;
  attackerCasualties: number;
  defenderCasualties: number;
  summary: string;
}

export interface YearlyTurnResult {
  year: number;
  news: NewsItem[];
  wars: WarResult[];
  playerEffectsSummary: string[];
  deceasedCharacters: string[];
}

export interface HistoryRecord {
  year: number;
  rulerAge: number;
  eventTitle: string;
  choiceMade: string;
  territoryCount: number;
  population: number;
  military: number;
  treasury: number;
  highlights: string[];
}

export interface GameStats {
  warsStarted: number;
  warsWon: number;
  warsLost: number;
  maxTerritoryPct: number;
  maxPopulation: number;
  milestones: { year: number; text: string }[];
}

export interface GameOverReason {
  title: string;
  description: string;
  victory: boolean;
  subType: 'unification' | 'natural_death' | 'illness' | 'assassinated' | 'conquered' | 'collapse';
}

export interface GameState {
  seed: string;
  year: number;
  playerCountryId: CountryId;
  countries: Record<CountryId, Country>;
  regions: Record<string, Region>;
  currentEvent: GameEvent | null;
  worldNews: NewsItem[];
  historyLog: HistoryRecord[];
  lastTurnResult: YearlyTurnResult | null;
  stats: GameStats;
  phase: 'selection' | 'turn_event' | 'turn_summary' | 'game_over';
  gameOverReason: GameOverReason | null;
}
