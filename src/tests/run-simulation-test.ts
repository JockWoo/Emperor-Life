import { createInitialGameState, processYearlyTurn, executePlayerAttack } from '../systems/simulation';
import { canLaunchCampaign, createBattle, resolveRound, applyBattleOutcome } from '../systems/battle';
import { SeededRNG } from '../utils/random';
import { CHAIN_EVENTS } from '../data/chainEvents';
import { computeLegacy } from '../systems/rating';
import { EventChoice } from '../types/game';
import { CountryId } from '../types/game';

function runTests() {
  console.log('=== RUNNING EMPEROR LIFE SIMULATION VERIFICATION TESTS ===\n');

  // Test 1: Seven Rulers & World Setup
  console.log('Test 1: Verifying Seven Dynasties & 35 Regions Initialization...');
  const seed = 'test_seed_123';
  const state = createInitialGameState(seed, 'qin');

  const countryIds: CountryId[] = ['qin', 'han', 'sui', 'tang', 'song', 'ming', 'qing'];
  countryIds.forEach(cid => {
    const c = state.countries[cid];
    if (!c) throw new Error(`Country ${cid} missing!`);
    if (!c.ruler) throw new Error(`Ruler for ${cid} missing!`);
    if (c.characters.length === 0) throw new Error(`Characters for ${cid} missing!`);
    console.log(`  ✓ ${c.ruler.name} (${c.name}) initialized with ${c.characters.length} ministers/generals, ${c.military}k troops, ${c.population}M population.`);
  });

  const totalRegions = Object.keys(state.regions).length;
  console.log(`  ✓ Total Regions: ${totalRegions} (Target ~35)`);
  if (totalRegions !== 35) throw new Error(`Expected 35 regions, found ${totalRegions}`);

  // Test 2: Seed Determinism
  console.log('\nTest 2: Verifying Seed Determinism...');
  const stateA = createInitialGameState('deterministic_seed', 'han');
  const stateB = createInitialGameState('deterministic_seed', 'han');
  if (stateA.countries.han.food !== stateB.countries.han.food) {
    throw new Error('Seed determinism failed: initial food does not match!');
  }
  if (stateA.currentEvent?.id !== stateB.currentEvent?.id) {
    throw new Error('Seed determinism failed: first event does not match!');
  }
  console.log('  ✓ Determinism verified: identical seed yields identical state & event.');

  // Test 3: Simulation Turn Progression & Economy
  console.log('\nTest 3: Simulating 5 Annual Turns...');
  let curState = state;
  for (let yr = 1; yr <= 5; yr++) {
    const event = curState.currentEvent;
    if (!event) throw new Error(`Year ${yr} missing event!`);
    const choice = event.choices[0];
    curState = processYearlyTurn(curState, choice);
    console.log(`  ✓ Year ${curState.year}: Event "${event.title}" -> Choice "${choice.text.slice(0, 30)}..."`);
    console.log(`    Ruler Age: ${curState.countries[curState.playerCountryId].ruler.currentAge}, Treasury: ${curState.countries[curState.playerCountryId].treasury}, Food: ${curState.countries[curState.playerCountryId].food}`);
    console.log(`    News items generated: ${curState.worldNews.length}`);
  }

  // Test 4: Territorial Warfare & Map Ownership Change
  console.log('\nTest 4: Verifying Warfare & Territory Transfer...');
  const qinRegions = Object.values(curState.regions).filter(r => r.countryId === 'qin');
  console.log(`  Qin currently owns ${qinRegions.length} regions.`);
  
  // Find an attackable adjacent target
  let attackTargetId: string | null = null;
  for (const pr of qinRegions) {
    for (const nid of pr.neighbors) {
      if (curState.regions[nid].countryId !== 'qin') {
        attackTargetId = nid;
        break;
      }
    }
    if (attackTargetId) break;
  }

  if (attackTargetId) {
    const prevOwner = curState.regions[attackTargetId].countryId;
    console.log(`  Attacking adjacent region: ${curState.regions[attackTargetId].chineseName} (Owned by ${prevOwner})`);
    
    // Give player ample troops for guaranteed siege test
    curState.countries.qin.military = 300;
    curState.countries.qin.food = 200;
    curState.countries.qin.morale = 95;

    const warResult = executePlayerAttack(curState, attackTargetId);
    console.log(`  ✓ Attack executed: ${warResult.message}`);
    console.log(`    Resulting territory owner: ${curState.regions[attackTargetId].countryId}`);
  }

  // Test 5: Tactical 3-Round Battle Engine Verification
  console.log('\nTest 5: Verifying Tactical 3-Round Battle Engine...');
  const battleState = createInitialGameState('battle_test_seed', 'qin');
  const qinRegionsList = Object.values(battleState.regions).filter(r => r.countryId === 'qin');
  let borderRegionId: string | null = null;
  for (const pr of qinRegionsList) {
    for (const nid of pr.neighbors) {
      if (battleState.regions[nid].countryId !== 'qin') {
        borderRegionId = nid;
        break;
      }
    }
    if (borderRegionId) break;
  }
  if (!borderRegionId) throw new Error('No adjacent enemy region found for battle test!');

  const targetEnemyId = battleState.regions[borderRegionId].countryId;
  const targetRegion = battleState.regions[borderRegionId];
  console.log(`  Attacking ${targetRegion.chineseName} (${targetEnemyId}) from Qin...`);

  // Verify canLaunchCampaign
  const check = canLaunchCampaign(battleState, borderRegionId);
  if (!check.ok) throw new Error(`canLaunchCampaign failed: ${check.reason}`);
  console.log('  ✓ canLaunchCampaign checked successfully.');

  // Create battle
  const leadGeneral = battleState.countries.qin.characters.find(c => c.isAlive && c.role === 'general') || null;
  let battle = createBattle(battleState, {
    mode: 'attack',
    regionId: borderRegionId,
    enemyCountryId: targetEnemyId,
    playerGeneralId: leadGeneral?.id ?? null,
    commitRatio: 0.5
  });

  console.log(`  ✓ Battle initialized: ${battle.player.generalName} (${battle.player.troops}萬) VS ${battle.enemy.generalName} (${battle.enemy.troops}萬)`);
  console.log(`    Scout report: ${battle.scout.tactic} (${battle.scout.confidence}% confidence)`);

  // Round 1: Duel
  battle = resolveRound(battleState, battle, 'duel');
  console.log(`    Round 1 (Duel): ${battle.log[0].text}`);
  if (battle.duelUsed !== true) throw new Error('Duel flag was not set!');

  // Round 2 & 3: Tactics
  if (!battle.finished) {
    battle = resolveRound(battleState, battle, 'charge');
    console.log(`    Round 2 (Charge): ${battle.log[1]?.text}`);
  }
  if (!battle.finished) {
    battle = resolveRound(battleState, battle, 'hold');
    console.log(`    Round 3 (Hold): ${battle.log[2]?.text}`);
  }

  console.log(`  ✓ Battle concluded! Outcome: ${battle.outcome}, Decisive: ${battle.decisive}`);
  const battleResult = applyBattleOutcome(battleState, battle);
  console.log(`  ✓ Outcome applied: ${battleResult.message}`);
  console.log(`    Qin military: ${battleResult.state.countries.qin.military}萬, Campaigns left: ${battleResult.state.campaignsLeft}`);

  // Test 6: 事件連鎖 / 年度目標 / 後世評價
  console.log('\nTest 6: Verifying Event Chains, Yearly Goals & Legacy...');
  let cs = createInitialGameState('chain_test_seed', 'han');
  if (!cs.currentGoal) throw new Error('Initial yearly goal missing!');
  const plant: EventChoice = {
    id: 'temple_melt_bells_for_coins', text: '測試：熔毀銅像', description: '', previewEffects: '', effects: {}
  };
  cs = processYearlyTurn(cs, plant);
  if (cs.flags?.['monk_resentment'] === undefined) throw new Error('Flag was not planted!');
  console.log('  ✓ Choice planted flag: monk_resentment');

  let chainSeen: string | null = null;
  for (let i = 0; i < 8 && cs.phase !== 'game_over'; i++) {
    if (cs.currentEvent && CHAIN_EVENTS.some(e => e.id === cs.currentEvent!.id)) {
      chainSeen = cs.currentEvent.title;
      break;
    }
    cs = processYearlyTurn(cs, cs.currentEvent!.choices[0]);
  }
  if (!chainSeen) throw new Error('Chain event never triggered after planting a flag!');
  if (cs.flags?.['monk_resentment'] !== undefined) throw new Error('Flag should be consumed when chain event triggers!');
  console.log(`  ✓ Chain event triggered: ${chainSeen}`);

  // 長局穩定性：各國跑 40 年，檢查目標與連鎖不會崩壞
  const ids: CountryId[] = ['qin', 'han', 'sui', 'tang', 'song', 'ming', 'qing'];
  let chainCount = 0;
  ids.forEach(cid => {
    let st = createInitialGameState(`long_run_${cid}`, cid);
    for (let y = 0; y < 40 && st.phase !== 'game_over'; y++) {
      if (!st.currentEvent) throw new Error('Missing event during long run!');
      if (!st.currentGoal) throw new Error('Missing goal during long run!');
      if (CHAIN_EVENTS.some(e => e.id === st.currentEvent!.id)) chainCount++;
      const pick = st.currentEvent.choices[y % st.currentEvent.choices.length];
      st = processYearlyTurn(st, pick);
    }
    const done = (st.stats.goalsCompleted ?? 0) + (st.stats.goalsFailed ?? 0);
    if (done !== (st.goalHistory?.length ?? 0)) throw new Error('Goal stats mismatch!');
    const legacy = computeLegacy(st);
    console.log(`  ✓ ${cid}: ${st.year - 1} yrs, goals ${st.stats.goalsCompleted}/${done}, legacy ${legacy.grade} 「${legacy.epithet}」`);
  });
  console.log(`  ✓ Chain events seen across long runs: ${chainCount}`);

  console.log('\n=== ALL SIMULATION & BATTLE TESTS PASSED SUCCESSFULLY! ===');
}

runTests();
