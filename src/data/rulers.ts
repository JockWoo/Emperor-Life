import { Ruler, CountryId } from '../types/game';

export const INITIAL_RULERS: Record<CountryId, Ruler> = {
  qin: {
    id: 'qin',
    name: '嬴政',
    dynasty: '秦',
    title: '始皇帝',
    color: '#334155', // 鐵玄黑
    accentColor: '#fbbf24', // 青銅金
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
      description: '崇尚法治與絕對集權，以雷霆萬鈞之勢橫掃六合，銳意開疆拓土。'
    },
    bio: '行法家嚴律，書同文、車同軌，築萬里長城，志在開創萬世不拔之基業。',
    historicalQuote: '朕為始皇帝。後世以計數，二世三世至於萬世，傳之無窮！'
  },
  han: {
    id: 'han',
    name: '劉邦',
    dynasty: '漢',
    title: '漢高祖',
    color: '#b91c1c', // 赤帝朱紅
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
      description: '胸襟開闊且善於用人，應變機敏，長於縱橫捭闔與籠絡豪傑。'
    },
    bio: '起於布衣提三尺劍取天下，知人善任，深諳退讓與乘虛而入的博弈之道。',
    historicalQuote: '大風起兮雲飛揚，威加海內兮歸故鄉，安得猛士兮守四方！'
  },
  sui: {
    id: 'sui',
    name: '楊堅',
    dynasty: '隋',
    title: '隋文帝',
    color: '#d97706', // 赭黃琥珀
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
      description: '長於綜理政事、節儉愛民，開創科舉與三省六部，天下殷實。'
    },
    bio: '終結南北紛爭分裂，置常平倉、立開皇律，使天下府庫充盈、戶口大增。',
    historicalQuote: '百姓何辜，罹此荼毒！當行仁政，藏富於民，開皇之治！'
  },
  tang: {
    id: 'tang',
    name: '李淵',
    dynasty: '唐',
    title: '唐高祖',
    color: '#eab308', // 盛唐赭黃
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
      description: '審時度勢、文武兼備，善用精銳騎兵與和親納降之策定鼎中原。'
    },
    bio: '自晉陽起兵逐鹿天下，兼融胡漢諸部，廣納天下英雄，開啟盛唐基業。',
    historicalQuote: '晉陽起兵，撫馭英雄，建號大唐，安輯兆庶！'
  },
  song: {
    id: 'song',
    name: '趙匡胤',
    dynasty: '宋',
    title: '宋太祖',
    color: '#0284c7', // 天青霽藍
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
      description: '崇文抑武、謹慎防弊，善於和平收攬軍權，注重內治商貿。'
    },
    bio: '陳橋兵變黃袍加身，杯酒釋兵權以消藩鎮之患，崇尚文治與商貿繁榮。',
    historicalQuote: '杯酒釋兵權，臥榻之側，豈容他人鼾睡乎！'
  },
  ming: {
    id: 'ming',
    name: '朱元璋',
    dynasty: '明',
    title: '洪武帝',
    color: '#ea580c', // 烈火朱丹
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
      description: '鐵腕肅貪、極度集權，力促農桑生息，對北伐用兵意志堅決。'
    },
    bio: '起自草莽布衣平定群雄、驅逐胡虜，制定大明律，整飭綱紀不容纖毫舞弊。',
    historicalQuote: '驅除胡虜，恢復中華，立綱陳紀，救濟斯民！'
  },
  qing: {
    id: 'qing',
    name: '皇太極',
    dynasty: '清',
    title: '清太宗',
    color: '#4338ca', // 八旗靛青
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
      description: '精擅八旗治軍與滿漢融通，引入紅衣大砲，善用攻堅與同盟策略。'
    },
    bio: '改國號為大清，降服漠南蒙古，創設滿漢八旗，為入主中原奠定雄厚基石。',
    historicalQuote: '崇德易名，撫順四方，融會漢滿蒙，定鼎中原！'
  }
};
