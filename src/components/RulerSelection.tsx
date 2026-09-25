import React, { useState } from 'react';
import { CountryId, Country, Region } from '../types/game';
import { Map } from './Map';

interface RulerSelectionProps {
  countries: Record<CountryId, Country>;
  regions: Record<string, Region>;
  seed: string;
  onSeedChange: (newSeed: string) => void;
  onSelectAndStart: (rulerId: CountryId) => void;
}

export const RulerSelection: React.FC<RulerSelectionProps> = ({
  countries,
  regions,
  seed,
  onSeedChange,
  onSelectAndStart
}) => {
  const [selectedRulerId, setSelectedRulerId] = useState<CountryId>('qin');
  const [copiedLink, setCopiedLink] = useState(false);

  const countryIds: CountryId[] = ['qin', 'han', 'sui', 'tang', 'song', 'ming', 'qing'];
  const activeCountry = countries[selectedRulerId];
  const activeRuler = activeCountry.ruler;

  const handleShareSeed = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', seed);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Title & Banner Header */}
      <div className="relative text-center py-6 px-4 bg-gradient-to-r from-red-950/40 via-amber-950/40 to-slate-950/50 rounded-2xl border border-amber-600/30 shadow-2xl backdrop-blur-md">
        <div className="inline-block px-3 py-1 mb-2 bg-amber-500/10 border border-amber-500/40 rounded-full text-amber-300 text-xs font-semibold tracking-widest uppercase">
          Historical Emperor Life Simulator · 歷史帝王人生模擬器
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-600 tracking-wider font-serif">
          七 帝 爭 霸
        </h1>
        <p className="text-lg md:text-xl text-gray-300 font-medium mt-1 tracking-widest">
          EMPEROR LIFE
        </p>
        <p className="text-sm text-gray-400 mt-2 max-w-2xl mx-auto leading-relaxed">
          Seven legendary dynasty founders co-exist simultaneously in one mythical era. 
          Choose your sovereign, govern your realm, wage strategic campaigns, and carve your legacy into the annals of history!
        </p>

        {/* Seed control bar */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-gray-400">Simulation Seed:</span>
          <input
            type="text"
            value={seed}
            onChange={(e) => onSeedChange(e.target.value.trim())}
            className="bg-black/60 border border-gray-700 rounded px-2.5 py-1 text-amber-300 font-mono text-center w-28 focus:border-amber-500 outline-none"
          />
          <button
            onClick={() => onSeedChange(Math.random().toString(36).substring(2, 10))}
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 transition-colors"
            title="Randomize Seed"
          >
            🎲 Roll
          </button>
          <button
            onClick={handleShareSeed}
            className="px-3 py-1 bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 rounded border border-amber-600/50 transition-colors flex items-center gap-1"
          >
            <span>{copiedLink ? '✓ Copied URL!' : '🔗 Share URL'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: 7-Country Interactive Map + Ruler Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Visual World Overview Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🗺️</span> 九州天下風雲圖 · Seven Empires Shared World
            </h2>
            <span className="text-xs text-gray-400">Click any territory to inspect its sovereign</span>
          </div>

          <Map
            regions={regions}
            countries={countries}
            playerCountryId={selectedRulerId}
            onSelectRegion={(rid) => {
              const r = regions[rid];
              if (r) {
                setSelectedRulerId(r.countryId);
              }
            }}
            interactive={true}
          />

          {/* Quick Rulers Grid Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {countryIds.map((cid) => {
              const c = countries[cid];
              const isSelected = selectedRulerId === cid;
              return (
                <button
                  key={cid}
                  onClick={() => setSelectedRulerId(cid)}
                  className={`p-2 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col items-center justify-center text-center ${
                    isSelected
                      ? 'border-yellow-400 bg-yellow-950/40 shadow-lg scale-105'
                      : 'border-gray-800 bg-[#161a24] hover:border-gray-600 hover:bg-[#1f2533]'
                  }`}
                  style={{
                    borderTopColor: c.color,
                    borderTopWidth: isSelected ? '5px' : '3px'
                  }}
                >
                  <span className="text-2xl mb-1">{c.ruler.portrait}</span>
                  <div className="font-bold text-xs text-white leading-tight">
                    {c.ruler.dynasty}
                  </div>
                  <div className="text-[11px] text-gray-300 truncate w-full">
                    {c.ruler.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                    {c.population}M · {c.military}k
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Ruler & Dynasty Dossier Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className="bg-[#141824] border rounded-xl p-5 shadow-2xl relative overflow-hidden transition-all"
            style={{ borderColor: activeCountry.color, borderLeftWidth: '6px' }}
          >
            {/* Top Badge & Quote */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-800 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{activeRuler.portrait}</span>
                  <div>
                    <h3 className="text-2xl font-black text-white font-serif tracking-wide">
                      {activeRuler.name}
                    </h3>
                    <div className="text-xs text-amber-400 font-medium">
                      {activeRuler.title} · {activeCountry.name} Dynasty
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-black/60 rounded border border-gray-700 text-xs font-mono text-gray-300">
                  Seat: {activeCountry.capitalName}
                </span>
                <div className="text-[11px] text-gray-400 mt-1">
                  Starting Age: <span className="text-white font-bold">{activeRuler.baseAge}</span>
                </div>
              </div>
            </div>

            {/* Imperial Quote */}
            <div className="bg-black/40 border-l-2 border-amber-500/60 p-2.5 rounded text-xs text-amber-200/90 italic mb-4 font-serif leading-relaxed">
              "{activeRuler.historicalQuote}"
            </div>

            {/* Bio */}
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              {activeRuler.bio}
            </p>

            {/* Starting Dynasty State Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-black/50 rounded-lg border border-gray-800 mb-4 text-center">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Territories</div>
                <div className="text-base font-bold text-amber-300">
                  {Object.values(regions).filter(r => r.countryId === selectedRulerId).length} Regions
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Population</div>
                <div className="text-base font-bold text-emerald-400">{activeCountry.population}M</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Troop Strength</div>
                <div className="text-base font-bold text-red-400">{activeCountry.military},000</div>
              </div>
            </div>

            {/* Personality Radar / Bars */}
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-300 mb-2 flex items-center justify-between">
                <span>Ruler Strategic Personality (君王韜略)</span>
                <span className="text-[11px] text-amber-400 font-normal">{activeRuler.personality.description}</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Centralization (中央集權)</span>
                  <div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${activeRuler.personality.centralization}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-gray-300">{activeRuler.personality.centralization}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Expansion Urge (拓土擴張)</span>
                  <div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${activeRuler.personality.expansion}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-gray-300">{activeRuler.personality.expansion}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Administration (治國理政)</span>
                  <div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${activeRuler.personality.administration}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-gray-300">{activeRuler.personality.administration}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Diplomacy (縱橫捭闔)</span>
                  <div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeRuler.personality.diplomacy}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-gray-300">{activeRuler.personality.diplomacy}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Talent Trust (知人善任)</span>
                  <div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${activeRuler.personality.talentUtilization}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-gray-300">{activeRuler.personality.talentUtilization}</span>
                </div>
              </div>
            </div>

            {/* Starting Historical Characters */}
            <div className="mb-5">
              <div className="text-xs font-bold text-gray-300 mb-2">
                Founding Pillars & Key Characters (開國賢能棟樑)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeCountry.characters.map((char) => (
                  <div
                    key={char.id}
                    className="p-2 bg-black/40 rounded border border-gray-800 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200">{char.chineseName}</span>
                      <span className="text-[10px] uppercase px-1 py-0.5 rounded bg-gray-800 text-gray-400">
                        {char.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{char.name} (Age {char.age})</div>
                    <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-gray-800/60 text-gray-300 font-mono">
                      <span>⚔️ {char.military}</span>
                      <span>🧠 {char.strategy}</span>
                      <span>📜 {char.administration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Life Button */}
            <button
              onClick={() => onSelectAndStart(selectedRulerId)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-base tracking-wider rounded-xl shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👑</span>
              <span>START LIFE AS {activeRuler.name.toUpperCase()} (即位登基)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
