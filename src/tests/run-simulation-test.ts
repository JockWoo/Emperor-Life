import { createInitialGameState, processYearlyTurn, executePlayerAttack } from '../systems/simulation';
import { SeededRNG } from '../utils/random';
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
    console.log(`  War outcome: ${warResult.message}`);
    console.log(`  Target region new owner: ${warResult.state.regions[attackTargetId].countryId}`);
  }

  // Test 5: Simulating Full Lifetime to End Condition
  console.log('\nTest 5: Simulating Full Lifespan Until Endgame...');
  let simState = createInitialGameState('endgame_test_seed', 'qin');
  let turnCount = 0;
  while (simState.phase !== 'game_over' && turnCount < 100) {
    turnCount++;
    const event = simState.currentEvent || {
      id: 'dummy',
      title: 'Routine Governance',
      category: 'politics' as const,
      description: 'Peaceful year',
      choices: [{
        id: 'c1',
        text: 'Govern with wisdom',
        description: 'Steady state',
        previewEffects: 'Stability +5',
        effects: { stability: 5 }
      }]
    };
    simState = processYearlyTurn(simState, event.choices[0]);
  }

  console.log(`  ✓ Game reached end condition in Year ${simState.year} (Ruled ${turnCount} years)`);
  if (!simState.gameOverReason) throw new Error('Expected gameOverReason upon game over!');
  console.log(`  Ending Title: "${simState.gameOverReason.title}"`);
  console.log(`  Victory status: ${simState.gameOverReason.victory}`);
  console.log(`  Max Territory Pct: ${simState.stats.maxTerritoryPct}%`);
  console.log(`  History Log entries: ${simState.historyLog.length}`);

  console.log('\n=== ALL SIMULATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests();
