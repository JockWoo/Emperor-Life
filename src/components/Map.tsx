import React, { useState } from 'react';
import { Region, Country, CountryId } from '../types/game';

interface MapProps {
  regions: Record<string, Region>;
  countries: Record<CountryId, Country>;
  playerCountryId?: CountryId;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
  onAttackRegion?: (regionId: string) => void;
  interactive?: boolean;
}

export const Map: React.FC<MapProps> = ({
  regions,
  countries,
  playerCountryId,
  selectedRegionId,
  onSelectRegion,
  onAttackRegion,
  interactive = true
}) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Compute player's adjacent attackable border regions
  const playerOwnedRegions = playerCountryId
    ? Object.values(regions).filter(r => r.countryId === playerCountryId)
    : [];
  
  const adjacentTargetIds = new Set<string>();
  if (playerCountryId) {
    playerOwnedRegions.forEach(pr => {
      pr.neighbors.forEach(nid => {
        const nr = regions[nid];
        if (nr && nr.countryId !== playerCountryId) {
          adjacentTargetIds.add(nid);
        }
      });
    }
  );
  }

  const hoveredRegion = hoveredRegionId ? regions[hoveredRegionId] : null;
  const hoveredCountry = hoveredRegion ? countries[hoveredRegion.countryId] : null;

  return (
    <div className="relative w-full bg-[#11141c] rounded-xl border border-[#2a2f3e] p-3 shadow-2xl overflow-hidden flex flex-col items-center">
      {/* Map Header / Legend Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2 py-1 mb-2 text-xs border-b border-[#232838]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#d4af37] tracking-wider uppercase text-sm">天下輿圖</span>
          <span className="text-gray-400">Realm of the Seven Emperors</span>
        </div>
        
        {/* Dynamic Country Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(countries) as CountryId[]).map(cid => {
            const country = countries[cid];
            const ownedCount = Object.values(regions).filter(r => r.countryId === cid).length;
            const isPlayer = playerCountryId === cid;
            return (
              <div
                key={cid}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium transition-all ${
                  isPlayer
                    ? 'ring-2 ring-yellow-400 font-bold'
                    : ''
                } ${
                  country.isAlive
                    ? 'bg-[#1b202c] border-[#374151]'
                    : 'bg-black/50 border-gray-800 text-gray-500 line-through'
                }`}
                style={{
                  borderLeftColor: country.color,
                  borderLeftWidth: '4px'
                }}
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: country.color }} />
                <span className="text-gray-200">{country.name}</span>
                <span className="text-[10px] text-gray-400">({ownedCount})</span>
                {isPlayer && <span className="text-[10px] text-yellow-300">★</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full max-w-[1050px] aspect-[1000/700] rounded-lg overflow-hidden border border-[#22283a] bg-gradient-to-b from-[#0e121a] via-[#121622] to-[#0a0d14]">
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
        >
          <defs>
            {/* Mountain / River patterns */}
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0d14" stopOpacity="0.9" />
            </radialGradient>
            
            <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Map Texture Grid */}
          <rect width="1000" height="700" fill="url(#mapGlow)" />
          <path
            d="M 50,50 L 950,50 M 50,200 L 950,200 M 50,350 L 950,350 M 50,500 L 950,500 M 50,650 L 950,650"
            stroke="#1a2233"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 200,50 L 200,650 M 400,50 L 400,650 M 600,50 L 600,650 M 800,50 L 800,650"
            stroke="#1a2233"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />

          {/* Yellow River & Yangtze River stylized curves */}
          <path
            d="M 120,240 Q 240,160 360,180 T 490,190 T 670,210 T 780,240"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="4"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <path
            d="M 90,440 Q 240,430 380,480 T 560,420 T 730,440"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="5"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />

          {/* Render all 35 regions */}
          {Object.values(regions).map(region => {
            const country = countries[region.countryId];
            const isHovered = hoveredRegionId === region.id;
            const isSelected = selectedRegionId === region.id;
            const isPlayerTerritory = playerCountryId === region.countryId;
            const isAttackable = adjacentTargetIds.has(region.id);

            let strokeColor = '#242b3d';
            let strokeWidth = 1.8;

            if (isSelected) {
              strokeColor = '#facc15';
              strokeWidth = 3.5;
            } else if (isHovered) {
              strokeColor = '#ffffff';
              strokeWidth = 2.5;
            } else if (isAttackable) {
              strokeColor = '#ef4444';
              strokeWidth = 2.2;
            }

            return (
              <g
                key={region.id}
                className={`transition-all duration-200 ${interactive ? 'cursor-pointer' : ''}`}
                onMouseEnter={() => setHoveredRegionId(region.id)}
                onMouseLeave={() => setHoveredRegionId(null)}
                onClick={() => {
                  if (interactive && onSelectRegion) {
                    onSelectRegion(region.id);
                  }
                }}
              >
                {/* Region Shape */}
                <path
                  d={region.path}
                  fill={country.color}
                  fillOpacity={isHovered ? 0.95 : 0.78}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  style={{
                    transition: 'fill 0.4s ease, stroke 0.2s ease',
                    filter: isHovered || isSelected ? 'url(#activeGlow)' : 'none'
                  }}
                />

                {/* Attackable pulse animation border if adjacent enemy */}
                {isAttackable && (
                  <path
                    d={region.path}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    className="animate-pulse opacity-75"
                  />
                )}

                {/* Capital Icon / Crown */}
                {region.isCapital && (
                  <text
                    x={region.centerX}
                    y={region.centerY - 14}
                    textAnchor="middle"
                    fontSize="13"
                    className="pointer-events-none"
                    fill="#fbbf24"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    👑
                  </text>
                )}

                {/* Region Name Tag (Chinese + English) */}
                <text
                  x={region.centerX}
                  y={region.centerY + 2}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none tracking-wide"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)'
                  }}
                >
                  {region.chineseName}
                </text>

                {/* Secondary Country Label Badge */}
                <text
                  x={region.centerX}
                  y={region.centerY + 16}
                  textAnchor="middle"
                  fill={isPlayerTerritory ? '#fde047' : '#cbd5e1'}
                  fontSize="9.5"
                  fontWeight="500"
                  className="pointer-events-none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  【{country.name}】
                </text>

                {/* Swords marker for attackable border targets */}
                {isAttackable && (
                  <text
                    x={region.centerX + 26}
                    y={region.centerY - 10}
                    textAnchor="middle"
                    fontSize="13"
                    className="pointer-events-none animate-bounce"
                  >
                    ⚔️
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip details on hover */}
        {hoveredRegion && hoveredCountry && (
          <div
            className="absolute bottom-3 left-3 bg-[#131722]/95 backdrop-blur-md border border-[#374151] rounded-lg p-3 shadow-2xl text-xs max-w-xs pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-150"
            style={{ borderLeftColor: hoveredCountry.color, borderLeftWidth: '5px' }}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                {hoveredRegion.isCapital && '👑'} {hoveredRegion.chineseName}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: hoveredCountry.color,
                  color: '#ffffff'
                }}
              >
                {hoveredCountry.name} · {hoveredCountry.ruler.name.split(' ')[0]}
              </span>
            </div>

            <div className="text-[11px] text-gray-400 mb-2">{hoveredRegion.name}</div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-gray-300 text-[11px]">
              <div>Terrain: <span className="text-amber-300 font-medium capitalize">{hoveredRegion.terrain}</span></div>
              <div>Pop: <span className="text-emerald-300 font-medium">{hoveredRegion.basePop}M</span></div>
              <div>Annual Tax: <span className="text-yellow-300 font-medium">{hoveredRegion.baseWealth}🪙</span></div>
              <div>Granary: <span className="text-lime-300 font-medium">{hoveredRegion.baseFood}🌾</span></div>
            </div>

            {adjacentTargetIds.has(hoveredRegion.id) && (
              <div className="mt-2 pt-1.5 border-t border-gray-700/60 text-red-400 font-bold flex items-center gap-1 text-[11px]">
                <span>⚔️ Adjacent Border: Can launch invasion!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Region Action Panel */}
      {selectedRegionId && regions[selectedRegionId] && (
        <div className="w-full mt-3 p-3 bg-[#181d2a] border border-[#2d3748] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-lg">📍</span>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{regions[selectedRegionId].chineseName} ({regions[selectedRegionId].name})</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px]"
                  style={{
                    backgroundColor: countries[regions[selectedRegionId].countryId].color,
                    color: '#fff'
                  }}
                >
                  Owner: {countries[regions[selectedRegionId].countryId].name}
                </span>
              </div>
              <div className="text-gray-400 text-[11px]">
                Terrain: {regions[selectedRegionId].terrain} · Output: {regions[selectedRegionId].baseWealth} Wealth, {regions[selectedRegionId].baseFood} Food
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {adjacentTargetIds.has(selectedRegionId) && onAttackRegion && (
              <button
                onClick={() => onAttackRegion(selectedRegionId)}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded shadow-lg transition-all flex items-center gap-1.5 border border-red-500 hover:scale-105 active:scale-95"
              >
                <span>⚔️</span>
                <span>Launch Campaign (發動征伐)</span>
              </button>
            )}
            <button
              onClick={() => onSelectRegion && onSelectRegion('')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
