import React from 'react';
import { CountryId, Country } from '../types/game';

interface DiplomacyModalProps {
  playerCountry: Country;
  allCountries: Record<CountryId, Country>;
  onClose: () => void;
  onSendTribute: (targetId: CountryId) => void;
  onProposeAlliance: (targetId: CountryId) => void;
  onDeclareWar: (targetId: CountryId) => void;
}

export const DiplomacyModal: React.FC<DiplomacyModalProps> = ({
  playerCountry,
  allCountries,
  onClose,
  onSendTribute,
  onProposeAlliance,
  onDeclareWar
}) => {
  const otherCountryIds = (Object.keys(allCountries) as CountryId[]).filter(
    id => id !== playerCountry.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#121622] border-2 border-[#2b3346] rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-4 text-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Grand Hall of Statecraft · 鴻臚寺天下藩服
            </span>
            <h2 className="text-2xl font-black text-white font-serif tracking-wider">
              DIPLOMATIC RELATIONS & ALLIANCES
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* List of Other 6 Dynasties */}
        <div className="space-y-3">
          {otherCountryIds.map(cid => {
            const country = allCountries[cid];
            const relation = playerCountry.relations[cid] ?? 0;
            const isAllied = playerCountry.alliances.includes(cid);
            const isAtWar = playerCountry.atWarWith.includes(cid);

            let relationColor = 'text-gray-400';
            let relationBadge = 'Neutral';
            if (relation >= 50) {
              relationColor = 'text-emerald-400';
              relationBadge = 'Friendly / Allied';
            } else if (relation >= 15) {
              relationColor = 'text-green-300';
              relationBadge = 'Amiable';
            } else if (relation <= -30) {
              relationColor = 'text-red-500';
              relationBadge = 'Hostile';
            } else if (relation < 0) {
              relationColor = 'text-orange-400';
              relationBadge = 'Distrustful';
            }

            return (
              <div
                key={cid}
                className="bg-[#171b26] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ borderLeftColor: country.color, borderLeftWidth: '5px' }}
              >
                {/* Left info */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{country.ruler.portrait}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {country.name} · {country.ruler.name}
                      </span>
                      {!country.isAlive && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                          EXTINGUISHED
                        </span>
                      )}
                      {isAllied && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                          🤝 ALLY
                        </span>
                      )}
                      {isAtWar && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-700 font-bold">
                          ⚔️ AT WAR
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Capital: {country.capitalName} · Military: <span className="text-red-400 font-mono">{country.military}k</span> · Pop: <span className="text-emerald-400 font-mono">{country.population}M</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 italic">
                      "{country.ruler.personality.description}"
                    </div>
                  </div>
                </div>

                {/* Right relations & actions */}
                <div className="flex flex-col md:items-end gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Disposition:</span>
                    <span className={`font-bold font-mono ${relationColor}`}>
                      {relation > 0 ? `+${relation}` : relation} ({relationBadge})
                    </span>
                  </div>

                  {country.isAlive && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => onSendTribute(cid)}
                        disabled={playerCountry.treasury < 50}
                        className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs rounded border border-amber-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Send 50 Gold as imperial gift to improve relations by +20"
                      >
                        🎁 Send Gold (-50🪙)
                      </button>

                      {!isAllied && (
                        <button
                          onClick={() => onProposeAlliance(cid)}
                          disabled={relation < 20}
                          className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs rounded border border-emerald-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          title={relation < 20 ? 'Requires relations >= 20' : 'Propose Non-Aggression Alliance'}
                        >
                          🤝 Alliance Pact
                        </button>
                      )}

                      {!isAtWar && (
                        <button
                          onClick={() => onDeclareWar(cid)}
                          className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 text-xs rounded border border-red-600/50 transition-all"
                        >
                          ⚔️ Denounce War
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
