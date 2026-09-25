import { Ruler, CountryId } from '../types/game';

export const INITIAL_RULERS: Record<CountryId, Ruler> = {
  qin: {
    id: 'qin',
    name: 'Qin Shi Huang (嬴政)',
    dynasty: 'Qin (秦)',
    title: 'First Emperor (始皇帝)',
    color: '#334155', // Iron slate black
    accentColor: '#fbbf24', // Bronze gold
    portrait: '🐉',
    baseAge: 22,
    currentAge: 22,
    maxAge: 56,
    health: 90,
    personality: {
      centralization: 95,
      expansion: 95,
      militaryFocus: 92,
      administration: 90,
      diplomacy: 30,
      talentUtilization: 78,
      adaptability: 70,
      description: 'Iron-fisted conqueror prioritizing total centralization, standard laws, and relentless imperial conquest.'
    },
    bio: 'Unify all under heaven with absolute legalism, vast territorial conquest, and grand architectural works.',
    historicalQuote: '朕為始皇帝。後世以計數，二世三世至於萬世，傳之無窮！'
  },
  han: {
    id: 'han',
    name: 'Liu Bang (劉邦)',
    dynasty: 'Han (漢)',
    title: 'Emperor Gaozu (高祖)',
    color: '#b91c1c', // Imperial red
    accentColor: '#fde047',
    portrait: '🦅',
    baseAge: 32,
    currentAge: 32,
    maxAge: 64,
    health: 88,
    personality: {
      centralization: 70,
      expansion: 80,
      militaryFocus: 72,
      administration: 76,
      diplomacy: 90,
      talentUtilization: 96,
      adaptability: 95,
      description: 'Charismatic leader who excels at recruiting geniuses, flexible maneuvering, and opportunistic diplomacy.'
    },
    bio: 'Rose from common grass to master the realm by placing absolute trust in unmatched strategists and commanders.',
    historicalQuote: '大風起兮雲飛揚，威加海內兮歸故鄉，安得猛士兮守四方！'
  },
  sui: {
    id: 'sui',
    name: 'Yang Jian (楊堅)',
    dynasty: 'Sui (隋)',
    title: 'Emperor Wen (文帝)',
    color: '#d97706', // Ocher amber
    accentColor: '#fef3c7',
    portrait: '🌾',
    baseAge: 30,
    currentAge: 30,
    maxAge: 65,
    health: 92,
    personality: {
      centralization: 88,
      expansion: 70,
      militaryFocus: 76,
      administration: 96,
      diplomacy: 68,
      talentUtilization: 82,
      adaptability: 78,
      description: 'Master statesman focused on national granaries, civil examinations, legal reform, and immense economic wealth.'
    },
    bio: 'Consolidator of fractured realms whose Kaihuang reign established unmatched grain granaries and administrative order.',
    historicalQuote: '百姓何辜，罹此荼毒！當行仁政，藏富於民，開皇之治！'
  },
  tang: {
    id: 'tang',
    name: 'Li Yuan (李淵)',
    dynasty: 'Tang (唐)',
    title: 'Emperor Gaozu (高祖)',
    color: '#eab308', // Royal saffron gold
    accentColor: '#451a03',
    portrait: '🐎',
    baseAge: 35,
    currentAge: 35,
    maxAge: 70,
    health: 86,
    personality: {
      centralization: 82,
      expansion: 82,
      militaryFocus: 86,
      administration: 85,
      diplomacy: 82,
      talentUtilization: 90,
      adaptability: 84,
      description: 'Pragmatic aristocrat blending elite cavalry, open multi-ethnic diplomacy, and formidable military princes.'
    },
    bio: 'Founder of the glorious Golden Age, skillfully balancing northern nomadic alliances and southern pacification.',
    historicalQuote: '晉陽起兵，撫馭英雄，建號大唐，安輯兆庶！'
  },
  song: {
    id: 'song',
    name: 'Zhao Kuangyin (趙匡胤)',
    dynasty: 'Song (宋)',
    title: 'Emperor Taizu (太祖)',
    color: '#0284c7', // Celestial cyan / sapphire
    accentColor: '#e0f2fe',
    portrait: '📜',
    baseAge: 29,
    currentAge: 29,
    maxAge: 62,
    health: 94,
    personality: {
      centralization: 86,
      expansion: 55,
      militaryFocus: 84,
      administration: 92,
      diplomacy: 85,
      talentUtilization: 88,
      adaptability: 82,
      description: 'Shrewd military reformer who dissolved rival warlord power peacefully over wine and elevated civilian governance.'
    },
    bio: 'Master of stable statecraft, civil prosperity, and commercial innovation, cautious in foreign war but resilient in defense.',
    historicalQuote: '杯酒釋兵權，臥榻之側，豈容他人鼾睡乎！'
  },
  ming: {
    id: 'ming',
    name: 'Zhu Yuanzhang (朱元璋)',
    dynasty: 'Ming (明)',
    title: 'Hongwu Emperor (洪武帝)',
    color: '#ea580c', // Fiery vermilion
    accentColor: '#ffedd5',
    portrait: '🔥',
    baseAge: 28,
    currentAge: 28,
    maxAge: 72,
    health: 95,
    personality: {
      centralization: 98,
      expansion: 88,
      militaryFocus: 92,
      administration: 96,
      diplomacy: 42,
      talentUtilization: 68,
      adaptability: 82,
      description: 'Unyielding peasant emperor who purged corruption with terror, rebuilt agrarian society, and led relentless northern strikes.'
    },
    bio: 'Rose from mendicant monk to expel foreign invaders and establish the most tightly controlled centralized court in history.',
    historicalQuote: '驅除胡虜，恢復中華，立綱陳紀，救濟斯民！'
  },
  qing: {
    id: 'qing',
    name: 'Hong Taiji (皇太極)',
    dynasty: 'Qing (清)',
    title: 'Emperor Taizong (太宗)',
    color: '#4338ca', // Royal indigo navy
    accentColor: '#e0e7ff',
    portrait: '🏹',
    baseAge: 27,
    currentAge: 27,
    maxAge: 62,
    health: 91,
    personality: {
      centralization: 86,
      expansion: 92,
      militaryFocus: 94,
      administration: 88,
      diplomacy: 86,
      talentUtilization: 88,
      adaptability: 90,
      description: 'Strategic military visionary who integrated the Eight Banners, adopted firearms, and allied with steppe Mongols.'
    },
    bio: 'Architect of the Great Qing, transforming tribal banner warriors into an unstoppable imperial coalition.',
    historicalQuote: '崇德易名，撫順四方，融會漢滿蒙，定鼎中原！'
  }
};
