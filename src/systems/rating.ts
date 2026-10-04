import { GameState } from '../types/game';

export interface Achievement {
  icon: string;
  name: string;
  desc: string;
}

export interface Legacy {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  score: number;
  epithet: string;       // 後世對這位君主的評語
  verdict: string;       // 史官總評
  achievements: Achievement[];
}

// 依整場人生計算「後世評價」與成就
export function computeLegacy(state: GameState): Legacy {
  const player = state.countries[state.playerCountryId];
  const total = Object.keys(state.regions).length;
  const owned = Object.values(state.regions).filter(r => r.countryId === state.playerCountryId).length;
  const years = Math.max(1, state.year - 1);
  const reason = state.gameOverReason;
  const victory = reason?.subType === 'unification';
  const goalsDone = state.stats.goalsCompleted ?? 0;
  const { warsStarted, warsWon, warsLost, maxTerritoryPct } = state.stats;

  const score = Math.round(
    Math.min(40, (owned / total) * 100 * 0.4) +
      (victory ? 25 : 0) +
      Math.min(15, goalsDone * 2.5) +
      Math.min(10, years / 4) +
      Math.min(10, player.stability / 10)
  );
  const grade: Legacy['grade'] = score >= 85 ? 'S' : score >= 65 ? 'A' : score >= 45 ? 'B' : score >= 25 ? 'C' : 'D';

  let epithet = '一代雄主';
  if (victory) epithet = '千古一帝';
  else if (reason?.subType === 'conquered' || reason?.subType === 'collapse') epithet = '亡國之君';
  else if (warsStarted >= 8 && player.stability < 55) epithet = '窮兵黷武的暴君';
  else if (player.stability >= 75 && warsStarted <= 3) epithet = '仁德之君';
  else if (warsWon >= 5) epithet = '開疆霸主';
  else if (years >= 30) epithet = '守成明君';

  const verdictMap: Record<string, string> = {
    千古一帝: '四海歸一，萬世稱頌。史官曰：「其功蓋三皇，德兼五帝。」',
    亡國之君: '社稷傾覆，宗廟成墟。史官曰：「興亡之際，豈非天命，亦由人事。」',
    窮兵黷武的暴君: '頻興戰事、民力凋敝。史官曰：「武功雖盛，而民不堪命。」',
    仁德之君: '少動干戈、與民休息。史官曰：「治世之君，百姓安之。」',
    開疆霸主: '屢克強敵、拓土千里。史官曰：「威加海內，武功赫赫。」',
    守成明君: '在位久遠、國祚綿長。史官曰：「謹守成法，上下相安。」',
    一代雄主: '功過參半，各有千秋。史官曰：「是非功過，留待後人評說。」'
  };

  const achievements: Achievement[] = [];
  if (victory) achievements.push({ icon: '🏆', name: '天下一統', desc: '完成統一天下的千秋偉業' });
  if (maxTerritoryPct >= 57) achievements.push({ icon: '🗺️', name: '威加海內', desc: '領土一度超過天下過半' });
  if (warsWon >= 5) achievements.push({ icon: '⚔️', name: '常勝將軍', desc: '贏得 5 場以上戰役' });
  if (warsLost >= 3) achievements.push({ icon: '🩹', name: '屢敗屢戰', desc: '經歷 3 場以上敗仗仍不屈服' });
  if (player.stability >= 80) achievements.push({ icon: '🕊️', name: '海晏河清', desc: '終局穩定度達 80 以上' });
  if (years >= 40) achievements.push({ icon: '⏳', name: '長壽天子', desc: '在位超過 40 年' });
  if (goalsDone >= 10) achievements.push({ icon: '🎯', name: '一諾千金', desc: '完成 10 次以上年度目標' });
  if (player.treasury >= 1200) achievements.push({ icon: '💰', name: '富可敵國', desc: '國庫累積至 1200 以上' });
  if (achievements.length === 0) achievements.push({ icon: '📜', name: '青史留名', desc: '寫下屬於自己的一頁歷史' });

  return { grade, score, epithet, verdict: verdictMap[epithet], achievements };
}
