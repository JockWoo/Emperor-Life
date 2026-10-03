import React, { useState, useEffect } from 'react';
import { GameState, CountryId, EventChoice, BattleState, BattleTactic } from './types/game';
import {
  createInitialGameState,
  processYearlyTurn,
  executePlayerAttack
} from './systems/simulation';
import {
  canLaunchCampaign,
  createBattle,
  resolveRound,
  applyBattleOutcome
} from './systems/battle';
import { RulerSelection } from './components/RulerSelection';
import { Dashboard } from './components/Dashboard';
import { YearSummaryModal } from './components/YearSummaryModal';
import { GameOverModal } from './components/GameOverModal';
import { BattleSetupModal } from './components/BattleSetupModal';
import { BattleModal } from './components/BattleModal';
import { SeededRNG } from './utils/random';

export const App: React.FC = () => {
  // Read seed from URL or generate fresh
  const [seed, setSeed] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('seed') || SeededRNG.generateRandomSeed();
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    return createInitialGameState(seed, 'qin');
  });

  const [currentScreen, setCurrentScreen] = useState<'selection' | 'game'>('selection');

  // Battle setup and active tactical battle state
  const [battleSetup, setBattleSetup] = useState<{
    mode: 'attack' | 'defense';
    regionId: string;
    enemyCountryId: CountryId;
    enemyTroops?: number;
  } | null>(null);

  const [currentBattle, setCurrentBattle] = useState<BattleState | null>(null);

  // Sync seed in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', seed);
    window.history.replaceState({}, '', url.toString());
  }, [seed]);

  const handleSeedChange = (newSeed: string) => {
    setSeed(newSeed);
    setGameState(createInitialGameState(newSeed, gameState.playerCountryId));
  };

  const handleStartGame = (rulerId: CountryId) => {
    const newState = createInitialGameState(seed, rulerId);
    setGameState(newState);
    setCurrentScreen('game');
  };

  // Turn decision execution
  const handleMakeChoice = (choice: EventChoice) => {
    const nextState = processYearlyTurn(gameState, choice);
    setGameState(nextState);
  };

  // Turn summary proceed to next year
  const handleProceedYear = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'turn_event'
    }));
  };

  // Manual player military attack on adjacent enemy territory
  const handleAttackRegion = (regionId: string) => {
    const check = canLaunchCampaign(gameState, regionId);
    if (!check.ok) {
      alert(check.reason);
      return;
    }
    const targetRegion = gameState.regions[regionId];
    if (!targetRegion) return;
    setBattleSetup({
      mode: 'attack',
      regionId,
      enemyCountryId: targetRegion.countryId
    });
  };

  // Defense against incoming invasion
  const handleDefendRegion = (regionId: string) => {
    const pending = gameState.pendingDefenses.find(p => p.regionId === regionId) || gameState.pendingDefenses[0];
    if (!pending) return;
    setBattleSetup({
      mode: 'defense',
      regionId: pending.regionId,
      enemyCountryId: pending.attackerId,
      enemyTroops: pending.attackerTroops
    });
  };

  // Launch confirmed battle from setup modal
  const handleConfirmLaunchBattle = (options: { generalId: string | null; commitRatio: number }) => {
    if (!battleSetup) return;
    const battle = createBattle(gameState, {
      mode: battleSetup.mode,
      regionId: battleSetup.regionId,
      enemyCountryId: battleSetup.enemyCountryId,
      playerGeneralId: options.generalId,
      commitRatio: options.commitRatio,
      enemyTroops: battleSetup.enemyTroops
    });
    setBattleSetup(null);
    setCurrentBattle(battle);
  };

  // Select tactic in battle modal
  const handleSelectBattleTactic = (tactic: BattleTactic | 'retreat') => {
    if (!currentBattle) return;
    const updated = resolveRound(gameState, currentBattle, tactic);
    setCurrentBattle(updated);
  };

  // Finish battle and apply results
  const handleFinishBattle = () => {
    if (!currentBattle) return;
    const { state: nextState } = applyBattleOutcome(gameState, currentBattle);
    setGameState(nextState);
    setCurrentBattle(null);
  };

  // Quick Imperial Decrees
  const handleRecruitTroops = () => {
    setGameState(prev => {
      const playerCountry = prev.countries[prev.playerCountryId];
      if (playerCountry.treasury < 50 || playerCountry.food < 40) return prev;
      
      const updatedCountry = {
        ...playerCountry,
        treasury: playerCountry.treasury - 50,
        food: playerCountry.food - 40,
        military: playerCountry.military + 20,
        morale: Math.min(100, playerCountry.morale + 5)
      };

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [prev.playerCountryId]: updatedCountry
        },
        worldNews: [
          {
            id: `recruit_${Date.now()}`,
            year: prev.year,
            text: `【${playerCountry.name}】頒布招募軍隊令，廣募天下壯丁兩萬人入伍！`,
            type: 'recruitment',
            importance: 'high'
          },
          ...prev.worldNews
        ]
      };
    });
  };

  const handleExpandAgriculture = () => {
    setGameState(prev => {
      const playerCountry = prev.countries[prev.playerCountryId];
      if (playerCountry.treasury < 40) return prev;

      const updatedCountry = {
        ...playerCountry,
        treasury: playerCountry.treasury - 40,
        food: playerCountry.food + 60,
        stability: Math.min(100, playerCountry.stability + 4)
      };

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [prev.playerCountryId]: updatedCountry
        },
        worldNews: [
          {
            id: `agri_${Date.now()}`,
            year: prev.year,
            text: `【${playerCountry.name}】推行發展農業，撥發國庫修浚水利、廣開糧倉！`,
            type: 'internal',
            importance: 'normal'
          },
          ...prev.worldNews
        ]
      };
    });
  };

  // Interstate Diplomacy
  const handleSendDiplomaticTribute = (targetId: CountryId) => {
    setGameState(prev => {
      const playerCountry = prev.countries[prev.playerCountryId];
      const targetCountry = prev.countries[targetId];
      if (playerCountry.treasury < 50) return prev;

      const currentRel = playerCountry.relations[targetId] ?? 0;
      const newRel = Math.min(100, currentRel + 25);

      const updatedPlayer = {
        ...playerCountry,
        treasury: playerCountry.treasury - 50,
        relations: { ...playerCountry.relations, [targetId]: newRel }
      };

      const updatedTarget = {
        ...targetCountry,
        treasury: targetCountry.treasury + 40,
        relations: { ...targetCountry.relations, [prev.playerCountryId]: newRel }
      };

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [prev.playerCountryId]: updatedPlayer,
          [targetId]: updatedTarget
        },
        worldNews: [
          {
            id: `tribute_${Date.now()}`,
            year: prev.year,
            text: `【${playerCountry.name}】派遣使臣資助【${targetCountry.name}】，列國邦交大為改善。`,
            type: 'diplomacy',
            importance: 'normal'
          },
          ...prev.worldNews
        ]
      };
    });
  };

  const handleProposeAlliance = (targetId: CountryId) => {
    setGameState(prev => {
      const playerCountry = prev.countries[prev.playerCountryId];
      const targetCountry = prev.countries[targetId];

      const updatedPlayer = {
        ...playerCountry,
        alliances: [...playerCountry.alliances, targetId],
        atWarWith: playerCountry.atWarWith.filter(id => id !== targetId)
      };

      const updatedTarget = {
        ...targetCountry,
        alliances: [...targetCountry.alliances, prev.playerCountryId],
        atWarWith: targetCountry.atWarWith.filter(id => id !== prev.playerCountryId)
      };

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [prev.playerCountryId]: updatedPlayer,
          [targetId]: updatedTarget
        },
        worldNews: [
          {
            id: `alliance_${Date.now()}`,
            year: prev.year,
            text: `【${playerCountry.name}】與【${targetCountry.name}】告天結盟，約定互為盟友，共保太平！`,
            type: 'diplomacy',
            importance: 'high'
          },
          ...prev.worldNews
        ]
      };
    });
  };

  const handleDeclareWar = (targetId: CountryId) => {
    setGameState(prev => {
      const playerCountry = prev.countries[prev.playerCountryId];
      const targetCountry = prev.countries[targetId];

      const updatedPlayer = {
        ...playerCountry,
        alliances: playerCountry.alliances.filter(id => id !== targetId),
        atWarWith: [...playerCountry.atWarWith, targetId],
        relations: { ...playerCountry.relations, [targetId]: -80 },
        morale: Math.min(100, playerCountry.morale + 10)
      };

      const updatedTarget = {
        ...targetCountry,
        alliances: targetCountry.alliances.filter(id => id !== prev.playerCountryId),
        atWarWith: [...targetCountry.atWarWith, prev.playerCountryId],
        relations: { ...targetCountry.relations, [prev.playerCountryId]: -80 }
      };

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [prev.playerCountryId]: updatedPlayer,
          [targetId]: updatedTarget
        },
        worldNews: [
          {
            id: `war_decl_${Date.now()}`,
            year: prev.year,
            text: `烽煙四起！【${playerCountry.name}】對【${targetCountry.name}】正式宣戰，戰火席捲天下！`,
            type: 'war',
            importance: 'critical'
          },
          ...prev.worldNews
        ]
      };
    });
  };

  // Replay options
  const handleRestartSameSeed = () => {
    setGameState(createInitialGameState(seed, gameState.playerCountryId));
    setCurrentScreen('game');
  };

  const handleNewSeedGame = () => {
    const freshSeed = SeededRNG.generateRandomSeed();
    setSeed(freshSeed);
    setGameState(createInitialGameState(freshSeed, gameState.playerCountryId));
    setCurrentScreen('game');
  };

  const handleSelectAnotherRuler = () => {
    setCurrentScreen('selection');
  };

  const playerCountry = gameState.countries[gameState.playerCountryId];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#e2dfd2] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#1e2536] bg-[#0e121c]/90 backdrop-blur-md px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl cursor-pointer" onClick={() => setCurrentScreen('selection')}>
            👑
          </span>
          <div>
            <h1
              className="text-base font-black text-amber-200 tracking-wider font-serif cursor-pointer hover:text-white transition-colors"
              onClick={() => setCurrentScreen('selection')}
            >
              👑 七帝爭霸
            </h1>
            <div className="text-[10px] text-gray-400">
              歷史帝王人生模擬器 · 同世爭霸
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded border border-gray-800 text-gray-400 font-mono">
            <span>種子：</span>
            <span className="text-amber-300 font-bold">{seed}</span>
          </div>
          {currentScreen === 'game' && (
            <button
              onClick={() => setCurrentScreen('selection')}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 text-xs transition-colors cursor-pointer"
            >
              更換君主
            </button>
          )}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col items-center justify-start">
        {currentScreen === 'selection' ? (
          <RulerSelection
            countries={gameState.countries}
            regions={gameState.regions}
            seed={seed}
            onSeedChange={handleSeedChange}
            onSelectAndStart={handleStartGame}
          />
        ) : (
          <Dashboard
            state={gameState}
            onMakeChoice={handleMakeChoice}
            onAttackRegion={handleAttackRegion}
            onDefendRegion={handleDefendRegion}
            onSendDiplomaticTribute={handleSendDiplomaticTribute}
            onProposeAlliance={handleProposeAlliance}
            onDeclareWar={handleDeclareWar}
            onRecruitTroops={handleRecruitTroops}
            onExpandAgriculture={handleExpandAgriculture}
          />
        )}
      </main>

      {/* Battle Setup Modal */}
      {battleSetup && gameState.regions[battleSetup.regionId] && (
        <BattleSetupModal
          mode={battleSetup.mode}
          region={gameState.regions[battleSetup.regionId]}
          playerCountry={playerCountry}
          enemyCountry={gameState.countries[battleSetup.enemyCountryId]}
          enemyTroops={battleSetup.enemyTroops}
          campaignsLeft={gameState.campaignsLeft ?? 2}
          onClose={() => setBattleSetup(null)}
          onConfirmLaunch={handleConfirmLaunchBattle}
        />
      )}

      {/* Interactive Tactical Battle Modal */}
      {currentBattle && gameState.regions[currentBattle.regionId] && (
        <BattleModal
          battle={currentBattle}
          playerCountry={playerCountry}
          enemyCountry={gameState.countries[currentBattle.enemy.countryId]}
          region={gameState.regions[currentBattle.regionId]}
          onSelectTactic={handleSelectBattleTactic}
          onFinishBattle={handleFinishBattle}
        />
      )}

      {/* Modals */}
      {gameState.phase === 'turn_summary' && gameState.lastTurnResult && (
        <YearSummaryModal
          turnResult={gameState.lastTurnResult}
          playerCountry={playerCountry}
          onProceed={handleProceedYear}
        />
      )}

      {gameState.phase === 'game_over' && gameState.gameOverReason && (
        <GameOverModal
          reason={gameState.gameOverReason}
          stats={gameState.stats}
          historyLog={gameState.historyLog}
          playerCountry={playerCountry}
          seed={seed}
          onRestartSameSeed={handleRestartSameSeed}
          onNewSeedGame={handleNewSeedGame}
          onSelectAnotherRuler={handleSelectAnotherRuler}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#1a202e] py-3 text-center text-xs text-gray-500 bg-[#0b0e16]">
        👑 七帝爭霸 · 歷史帝王人生模擬器 — 秦、漢、隋、唐、宋、明、清七朝同世推演
      </footer>
    </div>
  );
};
