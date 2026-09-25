import React, { useState } from 'react';
import { GameState, EventChoice, CountryId } from '../types/game';
import { Map } from './Map';
import { DiplomacyModal } from './DiplomacyModal';

interface DashboardProps {
  state: GameState;
  onMakeChoice: (choice: EventChoice) => void;
  onAttackRegion: (regionId: string) => void;
  onSendDiplomaticTribute: (targetId: CountryId) => void;
  onProposeAlliance: (targetId: CountryId) => void;
  onDeclareWar: (targetId: CountryId) => void;
  onRecruitTroops: () => void;
  onExpandAgriculture: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  onMakeChoice,
  onAttackRegion,
  onSendDiplomaticTribute,
  onProposeAlliance,
  onDeclareWar,
  onRecruitTroops,
  onExpandAgriculture
}) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [showDiplomacy, setShowDiplomacy] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const playerCountry = state.countries[state.playerCountryId];
  const ruler = playerCountry.ruler;
  const currentEvent = state.currentEvent;
  const ownedRegionsCount = Object.values(state.regions).filter(
    r => r.countryId === state.playerCountryId
  ).length;

  const handleResolveTurn = () => {
    if (!currentEvent) return;
    const choice = currentEvent.choices.find(c => c.id === selectedChoiceId) || currentEvent.choices[0];
    onMakeChoice(choice);
    setSelectedChoiceId(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Top Sovereign Status Bar */}
      <div className="bg-[#121622] border-2 border-[#2b3346] rounded-xl p-3 sm:p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Emperor Profile & Year Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-4xl p-2 bg-black/50 border border-gray-700 rounded-xl inline-block shadow-inner">
              {ruler.portrait}
            </span>
            <span
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black"
              style={{ backgroundColor: playerCountry.color }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-serif tracking-wide">
                {ruler.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {playerCountry.name} Dynasty
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span>
                Reign: <strong className="text-amber-300 font-mono">Year {state.year}</strong> (元年 + {state.year - 1})
              </span>
              <span>•</span>
              <span>
                Age: <strong className="text-white font-mono">{ruler.currentAge}</strong> / {ruler.maxAge}
              </span>
              <span>•</span>
              <span>
                Health: <strong className={`${ruler.health > 50 ? 'text-emerald-400' : 'text-red-400'} font-mono`}>{ruler.health}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Core Resources Counter Matrix */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">🪙 Gold</div>
            <div className="font-bold text-yellow-300 font-mono text-sm">{playerCountry.treasury}</div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">🌾 Grain</div>
            <div className="font-bold text-lime-300 font-mono text-sm">{playerCountry.food}</div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">⚔️ Troops</div>
            <div className="font-bold text-red-400 font-mono text-sm">{playerCountry.military}k</div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">👥 Pop</div>
            <div className="font-bold text-emerald-400 font-mono text-sm">{playerCountry.population}M</div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">🗺️ Land</div>
            <div className="font-bold text-amber-300 font-mono text-sm">{ownedRegionsCount}/35</div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">⚖️ Order</div>
            <div className="font-bold text-cyan-300 font-mono text-sm">{playerCountry.stability}</div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">🚩 Morale</div>
            <div className="font-bold text-fuchsia-300 font-mono text-sm">{playerCountry.morale}</div>
          </div>
          <div className="bg-black/50 p-2 rounded border border-gray-800">
            <div className="text-[10px] text-gray-400">🏛️ Admin</div>
            <div className="font-bold text-blue-300 font-mono text-sm">{playerCountry.administration}</div>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDiplomacy(true)}
            className="px-3 py-2 bg-[#1e2538] hover:bg-[#28324a] text-amber-300 text-xs font-bold rounded-lg border border-amber-600/40 transition-all flex items-center gap-1.5 shadow"
          >
            <span>📜</span>
            <span>Diplomacy (外交)</span>
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-2 bg-[#1e2538] hover:bg-[#28324a] text-gray-200 text-xs font-bold rounded-lg border border-gray-700 transition-all flex items-center gap-1.5 shadow"
          >
            <span>📖</span>
            <span>Chronicle (起居注)</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Body: Left Map / Right Yearly Decisions & News */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Map and Imperial Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Map
            regions={state.regions}
            countries={state.countries}
            playerCountryId={state.playerCountryId}
            selectedRegionId={selectedRegionId}
            onSelectRegion={(rid) => setSelectedRegionId(rid)}
            onAttackRegion={(rid) => onAttackRegion(rid)}
            interactive={true}
          />

          {/* Imperial Quick Action Commands */}
          <div className="bg-[#141824] border border-[#262e42] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1">
              <span>⚡</span> Imperial Decrees:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onRecruitTroops}
                disabled={playerCountry.treasury < 50 || playerCountry.food < 40}
                className="px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ⚔️ Recruit 20k Troops (-50🪙 -40🌾)
              </button>
              <button
                onClick={onExpandAgriculture}
                disabled={playerCountry.treasury < 40}
                className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                🌾 Reclamation & Granaries (-40🪙 +60🌾)
              </button>
            </div>
          </div>

          {/* Key Characters Roster Card */}
          <div className="bg-[#141824] border border-[#262e42] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>👥</span> Founding Characters & Ministers (文武班底)
              </h3>
              <span className="text-[11px] text-gray-500">Affects campaign power and administration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {playerCountry.characters.map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                    c.isAlive
                      ? 'bg-black/40 border-gray-800'
                      : 'bg-black/20 border-red-950/50 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white flex items-center gap-1">
                      {c.chineseName}
                      {!c.isAlive && <span className="text-[10px] text-red-500">⚰️</span>}
                    </span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-800 text-amber-300 font-mono">
                      {c.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 truncate mb-1.5">
                    {c.name} · Age {c.age}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center bg-gray-900/60 p-1 rounded text-gray-300">
                    <div>Mil: {c.military}</div>
                    <div>Strat: {c.strategy}</div>
                    <div>Loyal: {c.loyalty}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Yearly Event Decision & World News (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Yearly Event Card */}
          {currentEvent ? (
            <div className="bg-[#151926] border-2 border-amber-600/60 rounded-xl p-5 shadow-2xl relative flex flex-col gap-4">
              {/* Event Badge & Category */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentEvent.category.toUpperCase()} EVENT · 歲朝大計
                </span>
                <span className="text-xs text-gray-400 font-mono">Year {state.year}</span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg font-black text-white font-serif tracking-wide leading-snug">
                  {currentEvent.title}
                </h3>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  {currentEvent.description}
                </p>
                {currentEvent.historicalContext && (
                  <p className="text-[11px] text-amber-300/80 italic mt-2 border-l-2 border-amber-600/40 pl-2">
                    {currentEvent.historicalContext}
                  </p>
                )}
              </div>

              {/* Multiple Choices List */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Imperial Decrees / Options (陛下決策):
                </div>

                {currentEvent.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  return (
                    <div
                      key={choice.id}
                      onClick={() => setSelectedChoiceId(choice.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-[#1a202e] border-gray-800 hover:border-gray-600 hover:bg-[#22293b]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-sm mt-0.5 ${isSelected ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                          {isSelected ? '●' : '○'}
                        </span>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white leading-tight">
                            {choice.text}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1">
                            {choice.description}
                          </div>
                          <div className="text-[10px] text-amber-300 font-mono font-medium mt-1.5 bg-black/40 px-2 py-0.5 rounded inline-block">
                            Consequences: {choice.previewEffects}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit / Advance Year Button */}
              <button
                onClick={handleResolveTurn}
                disabled={!selectedChoiceId}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-sm tracking-wider rounded-xl shadow-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                ENACT DECREE & ADVANCE TO YEAR {state.year + 1} (頒詔行事) ›
              </button>
            </div>
          ) : (
            <div className="bg-[#151926] border border-gray-800 rounded-xl p-5 text-center text-gray-400 text-xs">
              Calculating state transitions...
            </div>
          )}

          {/* World News Dispatch Box */}
          <div className="bg-[#141824] border border-[#262e42] rounded-xl p-4 flex flex-col gap-2 max-h-72 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📜</span> World News & Intelligence (天下風雲)
              </h3>
              <span className="text-[10px] text-gray-500">Autonomous world events</span>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 text-xs">
              {state.worldNews.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-black/30 rounded border border-gray-800/80 flex items-start gap-2"
                >
                  <span className="text-cyan-400 font-mono text-[10px] whitespace-nowrap mt-0.5">
                    [Y{item.year}]
                  </span>
                  <span className="text-gray-300 leading-snug">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Diplomacy Modal */}
      {showDiplomacy && (
        <DiplomacyModal
          playerCountry={playerCountry}
          allCountries={state.countries}
          onClose={() => setShowDiplomacy(false)}
          onSendTribute={(targetId) => {
            onSendDiplomaticTribute(targetId);
            setShowDiplomacy(false);
          }}
          onProposeAlliance={(targetId) => {
            onProposeAlliance(targetId);
            setShowDiplomacy(false);
          }}
          onDeclareWar={(targetId) => {
            onDeclareWar(targetId);
            setShowDiplomacy(false);
          }}
        />
      )}

      {/* History Chronicle Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border-2 border-gray-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 text-gray-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-lg font-bold text-white font-serif">Imperial Annals (起居注實錄)</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {state.historyLog.map((h) => (
                <div key={h.year} className="bg-black/40 border border-gray-800 p-3 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-mono text-amber-300 font-bold mb-1">
                    <span>Year {h.year} (Age {h.rulerAge})</span>
                    <span className="text-gray-400 font-normal">Land: {h.territoryCount} · Military: {h.military}k</span>
                  </div>
                  <div className="font-semibold text-white">{h.eventTitle}</div>
                  <div className="text-gray-400 mt-0.5">{h.choiceMade}</div>
                  {h.highlights.map((hl, idx) => (
                    <div key={idx} className="text-gray-500 italic mt-0.5">› {hl}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
