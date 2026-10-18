import React, { useState, useEffect } from 'react';
import {
  Flame,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  RotateCcw,
  Volume2,
  Play,
  Square,
} from 'lucide-react';
import {
  DELIVERY_STOPS,
  STORYBOOK_PAGES,
  GROWTH_MILESTONES,
  DeliveryStop,
} from '../data/pipCanon';
import { soundEngine } from '../utils/soundEngine';

interface InteractiveWorkshopsProps {
  activeTab: 'nightlight' | 'routes' | 'toys' | 'storybook' | 'growth';
  isNightMode: boolean;
  torchEnabled: boolean;
  onToggleTorch: () => void;
}

const LANTERN_MODELS = [
  {
    id: 'crescent',
    name: 'Sleeping Crescent Porcelain',
    kelvin: 1850,
    glowHex: '#F59E0B',
    desc: 'Pip’s signature curved bone-china moon with a hand-bent brass carrying loop.',
  },
  {
    id: 'starjar',
    name: 'Star-Jar Honey Lantern',
    kelvin: 2100,
    glowHex: '#FBBF24',
    desc: 'Frosted apothecary jar filled with seven slow-floating origami paper stars.',
  },
  {
    id: 'cloud',
    name: 'Cumulus Milk Diffuser',
    kelvin: 2450,
    glowHex: '#FDE68A',
    desc: 'Spun-glass cloud shade that turns sharp closet shadows into soft cotton puffs.',
  },
  {
    id: 'rose',
    name: 'Berry-Rose Dusk Sconce',
    kelvin: 1950,
    glowHex: '#FB7185',
    desc: 'Tinted with crushed hibiscus petals for rainy nights when thunder rumbles.',
  },
];

interface ToyBlock {
  id: string;
  char: string;
  label: string;
  color: string;
  freq: number;
}

const INITIAL_BLOCKS: ToyBlock[] = [
  { id: 'b1', char: 'h', label: 'Honey Milk', color: '#F4C6D7', freq: 523.25 },
  { id: 'b2', char: 'a', label: 'Amber Glow', color: '#FDE68A', freq: 587.33 },
  { id: 'b3', char: 'X', label: 'Xylophone Chime', color: '#C7D2FE', freq: 659.25 },
  { id: 'b4', char: '♡', label: 'Kind Heart', color: '#FECDD3', freq: 783.99 },
  { id: 'b5', char: '★', label: 'Star Tassel', color: '#FCD34D', freq: 880.0 },
  { id: 'b6', char: '☾', label: 'Crescent Crib', color: '#E9D5FF', freq: 1046.5 },
];

export const InteractiveWorkshops: React.FC<InteractiveWorkshopsProps> = ({
  activeTab,
  isNightMode,
  torchEnabled,
  onToggleTorch,
}) => {
  // Project 2: Nightlight state
  const [selectedLantern, setSelectedLantern] = useState(LANTERN_MODELS[0]);
  const [brightness, setBrightness] = useState(85);
  const [lanternImgError, setLanternImgError] = useState(false);

  // Project 3: Dream Delivery Routes state
  const [selectedStop, setSelectedStop] = useState<DeliveryStop>(DELIVERY_STOPS[2]);
  const [flightProgress, setFlightProgress] = useState<number>(50);
  const [isAutoFlying, setIsAutoFlying] = useState<boolean>(false);

  // Project 4: Rattle & Block Toybox state
  const [stackedBlocks, setStackedBlocks] = useState<ToyBlock[]>(INITIAL_BLOCKS.slice(0, 4));
  const [rattleCount, setRattleCount] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [playingBlockIdx, setPlayingBlockIdx] = useState<number | null>(null);

  // Project 5: Bedtime Storybook state
  const [pageIdx, setPageIdx] = useState<number>(0);

  // Project 6: Growth Chart state
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number>(0);

  // Auto-fly animation loop for Project 03
  useEffect(() => {
    if (!isAutoFlying || activeTab !== 'routes') return;
    const timer = setInterval(() => {
      setFlightProgress((prev) => {
        const next = (prev + 2) % 102;
        const clamped = next > 100 ? 0 : next;
        const stopIdx = Math.round((clamped / 100) * (DELIVERY_STOPS.length - 1));
        if (clamped % 25 === 0 && DELIVERY_STOPS[stopIdx]) {
          setSelectedStop(DELIVERY_STOPS[stopIdx]);
          soundEngine.playMusicBoxNote(523.25 + stopIdx * 90, 0.75, 0.45);
        }
        return clamped;
      });
    }, 110);
    return () => clearInterval(timer);
  }, [isAutoFlying, activeTab]);

  const cardSurface = isNightMode
    ? 'bg-[#131726] border-[#262D47] text-[#F8F5F0]'
    : 'bg-[#FFFDF9] border-[#EED6DF] text-[#3A2721]';

  const subSurface = isNightMode
    ? 'bg-[#0D101B] border-[#222840]'
    : 'bg-[#FFF8F1] border-[#EED6DF]';

  if (activeTab === 'nightlight') {
    const shadowStatus =
      brightness >= 75
        ? '100% Friendly Bunny-Plush Shadows · Certified Cozy'
        : brightness >= 45
        ? 'Closet Shadows Softening into Fluffy Cotton Clouds'
        : 'Dim Candlelight Mode · Turn Up Dimmer to Soften Corners';

    return (
      <div className={`rounded-2xl border p-6 lg:p-8 transition-colors ${cardSurface}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 5 cols: Illuminated Porcelain Lantern Viewport */}
          <div
            className={`lg:col-span-5 rounded-xl border p-6 flex flex-col items-center justify-between relative overflow-hidden ${subSurface}`}
            style={{
              background: `radial-gradient(circle at 50% 48%, ${selectedLantern.glowHex}${Math.round(
                (brightness / 100) * 65
              )
                .toString(16)
                .padStart(2, '0')}, ${isNightMode ? '#0B0E18' : '#FFF8F1'} 74%)`,
            }}
          >
            <div className="w-full flex items-center justify-between text-xs opacity-80">
              <span>Invention No. 02</span>
              <span className="font-mono-tabular">{selectedLantern.kelvin}K · {brightness}% Lumen</span>
            </div>

            <div className="my-6 relative flex items-center justify-center">
              {!lanternImgError ? (
                <img
                  src="/baby/assets/pip_dream_lantern.png"
                  alt={selectedLantern.name}
                  referrerPolicy="no-referrer"
                  onError={() => setLanternImgError(true)}
                  className="max-h-[230px] w-auto object-contain transition-all duration-300"
                  style={{
                    filter: `brightness(${0.65 + (brightness / 100) * 0.55}) drop-shadow(0 0 ${
                      Math.round(brightness * 0.28)
                    }px ${selectedLantern.glowHex})`,
                  }}
                />
              ) : (
                <div className="py-12 text-center">
                  <Flame className="w-12 h-12 mx-auto mb-2 text-amber-400" />
                  <span className="text-xs">{selectedLantern.name}</span>
                </div>
              )}
            </div>

            <div className="w-full pt-3 border-t border-current/10 flex items-center justify-between gap-3">
              <span className="text-xs opacity-80">Inspect dark corners with cursor:</span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickChime(1.15);
                  onToggleTorch();
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  torchEnabled
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-[#A34063] text-white hover:bg-[#8D3554]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{torchEnabled ? 'Nightlight Torch Active' : 'Enable Nightlight Torch'}</span>
              </button>
            </div>
          </div>

          {/* Right 7 cols: Lantern Selector & Warmth Dimmer */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs opacity-75 mb-1">
                <span>Porcelain & Brass Craft</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Zero-Scary-Shadow Guarantee</span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">
                Nightlight Collection Studio
              </h3>
              <p className="text-sm opacity-80 mt-2 leading-relaxed">
                Pip glazes every porcelain lantern so bedtime rooms feel like warm honey milk. Choose a lamp silhouette below and calibrate its dimmer glow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LANTERN_MODELS.map((model) => {
                const active = selectedLantern.id === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playMusicBoxNote(587.33 + model.kelvin * 0.1, 0.7, 0.5);
                      setSelectedLantern(model);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-[#A34063] ring-1 ring-[#A34063]'
                        : 'border-current/15 hover:border-current/35'
                    } ${subSurface}`}
                  >
                    <div className="flex items-center justify-between text-xs opacity-75 mb-1">
                      <span className="font-mono-tabular">{model.kelvin}K Warm</span>
                      <span>Porcelain Glaze</span>
                    </div>
                    <h4 className="text-sm font-semibold">{model.name}</h4>
                    <p className="text-xs opacity-75 mt-1 leading-relaxed">{model.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-current/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Bedside Dimmer Intensity</span>
                <span className="font-mono-tabular font-semibold">{brightness}% Glow</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-[#A34063] cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs opacity-80 pt-1">
                <span>Nursery Shadow Check:</span>
                <span className="font-medium text-[#A34063]">{shadowStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'routes') {
    const stopIndexFloat = (flightProgress / 100) * (DELIVERY_STOPS.length - 1);
    const lowIdx = Math.floor(stopIndexFloat);
    const highIdx = Math.min(DELIVERY_STOPS.length - 1, lowIdx + 1);
    const t = stopIndexFloat - lowIdx;
    const gliderX =
      DELIVERY_STOPS[lowIdx].x + (DELIVERY_STOPS[highIdx].x - DELIVERY_STOPS[lowIdx].x) * t;
    const gliderY =
      DELIVERY_STOPS[lowIdx].y + (DELIVERY_STOPS[highIdx].y - DELIVERY_STOPS[lowIdx].y) * t;

    return (
      <div className={`rounded-2xl border p-6 lg:p-8 transition-colors ${cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-current/10">
          <div>
            <div className="text-xs opacity-75 mb-1">
              <span>Invention No. 03</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Interactive SVG Rooftop Flight Map</span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Dream Delivery Flight Routes
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tabular">
            <span>Glider Progress: {flightProgress}%</span>
            <span aria-hidden="true">·</span>
            <span>Active Stop: {selectedStop.code}</span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1.15);
                setIsAutoFlying(!isAutoFlying);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-sans font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isAutoFlying
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-[#A34063] text-white hover:bg-[#8D3554]'
              }`}
            >
              {isAutoFlying ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Pause Flight</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Auto-Fly Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-stretch">
          {/* Interactive SVG Map Canvas */}
          <div className={`lg:col-span-8 rounded-xl border p-4 flex flex-col justify-between ${subSurface}`}>
            <svg
              viewBox="0 0 920 320"
              className="w-full h-auto rounded-lg"
              style={{
                background: isNightMode
                  ? 'linear-gradient(180deg, #090C15 0%, #141B2D 100%)'
                  : 'linear-gradient(180deg, #231F38 0%, #3A2E4F 100%)',
              }}
            >
              {/* Subtle constellation grid lines */}
              <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
                <line x1="0" y1="80" x2="920" y2="80" />
                <line x1="0" y1="160" x2="920" y2="160" />
                <line x1="0" y1="240" x2="920" y2="240" />
                <line x1="230" y1="0" x2="230" y2="320" />
                <line x1="460" y1="0" x2="460" y2="320" />
                <line x1="690" y1="0" x2="690" y2="320" />
              </g>

              {/* Sleepy Village Rooftop Silhouettes at bottom */}
              <path
                d="M0 320 L0 275 L55 245 L110 275 L165 250 L220 280 L290 240 L355 275 L430 250 L495 280 L575 235 L640 275 L725 250 L790 275 L855 225 L920 265 L920 320 Z"
                fill="rgba(12, 14, 24, 0.78)"
              />

              {/* Dashed Flight Path connecting the 5 stops */}
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="7 7"
                opacity="0.55"
                points={DELIVERY_STOPS.map((s) => `${s.x},${s.y}`).join(' ')}
              />

              {/* Stop Nodes */}
              {DELIVERY_STOPS.map((stop, idx) => {
                const isSelected = selectedStop.id === stop.id;
                return (
                  <g
                    key={stop.id}
                    onClick={() => {
                      setIsAutoFlying(false);
                      soundEngine.playMusicBoxNote(523.25 + idx * 90, 0.85, 0.45);
                      setSelectedStop(stop);
                      setFlightProgress(Math.round((idx / (DELIVERY_STOPS.length - 1)) * 100));
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={stop.x}
                      cy={stop.y}
                      r={isSelected ? 18 : 12}
                      fill={isSelected ? 'rgba(245, 158, 11, 0.28)' : 'rgba(255, 255, 255, 0.1)'}
                    />
                    <circle
                      cx={stop.x}
                      cy={stop.y}
                      r={isSelected ? 8 : 6}
                      fill={isSelected ? '#FBBF24' : '#FFF8F1'}
                      stroke="#A34063"
                      strokeWidth="2.5"
                    />
                    <text
                      x={stop.x}
                      y={stop.y - 16}
                      textAnchor="middle"
                      fill="#FFF8F1"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {stop.code}
                    </text>
                  </g>
                );
              })}

              {/* Pip's Animated Cloud Glider Marker */}
              <g
                style={{
                  transform: `translate3d(${gliderX}px, ${gliderY}px, 0)`,
                  transition: 'transform 110ms linear',
                }}
              >
                <ellipse cx="0" cy="-24" rx="26" ry="13" fill="#FFF8F1" stroke="#A34063" strokeWidth="2" />
                <circle cx="-6" cy="-26" r="3" fill="#F59E0B" />
                <circle cx="6" cy="-26" r="3" fill="#F59E0B" />
                <text
                  x="0"
                  y="-42"
                  textAnchor="middle"
                  fill="#FDE68A"
                  fontSize="10"
                  fontWeight="600"
                >
                  PIP GLIDER
                </text>
              </g>
            </svg>

            {/* Scrubber bar */}
            <div className="mt-4 pt-3 border-t border-current/10 flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xs whitespace-nowrap shrink-0">
                Scrub Cloud Glider along route:
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={flightProgress}
                onChange={(e) => {
                  setIsAutoFlying(false);
                  const val = Number(e.target.value);
                  setFlightProgress(val);
                  const idx = Math.round((val / 100) * (DELIVERY_STOPS.length - 1));
                  if (DELIVERY_STOPS[idx] && DELIVERY_STOPS[idx].id !== selectedStop.id) {
                    setSelectedStop(DELIVERY_STOPS[idx]);
                    soundEngine.playClickChime(1 + idx * 0.08);
                  }
                }}
                className="w-full accent-[#A34063] cursor-pointer"
              />
            </div>
          </div>

          {/* Right 4 cols: Selected Stop Parcel Manifest */}
          <div className={`lg:col-span-4 rounded-xl border p-5 flex flex-col justify-between ${subSurface}`}>
            <div>
              <div className="text-xs font-mono-tabular opacity-75">
                <span>{selectedStop.code}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>{selectedStop.eta}</span>
              </div>
              <h4 className="text-lg font-semibold mt-1">{selectedStop.name}</h4>
              <p className="text-xs opacity-75 mt-1">Resident: {selectedStop.resident}</p>

              <div className="mt-5 pt-4 border-t border-current/10 space-y-3 text-xs">
                <div>
                  <span className="opacity-70 block">Assigned Dream Parcel</span>
                  <span className="font-semibold text-sm block mt-0.5">{selectedStop.dreamParcel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Cruising Altitude</span>
                  <span className="font-mono-tabular font-medium">{selectedStop.altitudeFt} Cloud Ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Harmonic Key</span>
                  <span className="font-mono-tabular font-medium">{selectedStop.lullabyKey}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-current/10 space-y-2">
              <p className="text-xs opacity-75">Click any rooftop stop below:</p>
              <div className="grid grid-cols-5 gap-1.5">
                {DELIVERY_STOPS.map((stop, idx) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => {
                      setIsAutoFlying(false);
                      soundEngine.playMusicBoxNote(523.25 + idx * 90, 0.85, 0.45);
                      setSelectedStop(stop);
                      setFlightProgress(Math.round((idx / (DELIVERY_STOPS.length - 1)) * 100));
                    }}
                    className={`py-1.5 rounded-md text-xs font-mono-tabular font-medium transition-colors cursor-pointer ${
                      selectedStop.id === stop.id
                        ? 'bg-[#A34063] text-white'
                        : 'border border-current/15 hover:border-current/35'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'toys') {
    const handleAddBlock = (block: ToyBlock) => {
      soundEngine.playMusicBoxNote(block.freq, 0.65, 0.5);
      if (stackedBlocks.length < 7) {
        setStackedBlocks([...stackedBlocks, { ...block, id: `${block.id}-${Date.now()}` }]);
      }
    };

    const handlePlayTowerMelody = () => {
      if (stackedBlocks.length === 0) return;
      stackedBlocks.forEach((b, idx) => {
        setTimeout(() => {
          setPlayingBlockIdx(idx);
          soundEngine.playMusicBoxNote(b.freq, 0.8, 0.45);
          if (idx === stackedBlocks.length - 1) {
            setTimeout(() => setPlayingBlockIdx(null), 400);
          }
        }, idx * 210);
      });
    };

    const handleShakeRattle = () => {
      soundEngine.playRattleShake();
      setRattleCount((c) => c + 1);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 320);
    };

    const handleShuffleTower = () => {
      soundEngine.playPipGiggle();
      const shuffled = [...stackedBlocks].sort(() => Math.random() - 0.5);
      setStackedBlocks(shuffled);
    };

    return (
      <div className={`rounded-2xl border p-6 lg:p-8 transition-colors ${cardSurface}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 6 cols: Interactive Block Tower Canvas */}
          <div className={`lg:col-span-6 rounded-xl border p-6 flex flex-col justify-between ${subSurface}`}>
            <div className="flex items-center justify-between text-xs opacity-80">
              <span>Invention No. 04 · Playable Toybox</span>
              <span className="font-mono-tabular">Tower Height: {stackedBlocks.length} / 7 Blocks</span>
            </div>

            <div className="my-6 min-h-[260px] flex flex-col-reverse items-center justify-start gap-2 pt-4 border-b-2 border-[#A34063]/30">
              {stackedBlocks.map((b, idx) => {
                const isChiming = playingBlockIdx === idx;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playMusicBoxNote(b.freq, 0.7, 0.4);
                      setStackedBlocks(stackedBlocks.filter((item) => item.id !== b.id));
                    }}
                    title="Click block to chime and pop from tower"
                    style={{
                      backgroundColor: b.color,
                      transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * ((idx * 1.3) % 3)}deg) scale(${
                        isChiming ? 1.12 : 1
                      })`,
                    }}
                    className="w-32 h-11 rounded-lg border-2 border-[#3A2721] text-[#3A2721] font-bold text-lg flex items-center justify-between px-3 shadow-xs hover:scale-105 transition-transform cursor-pointer"
                  >
                    <span className="font-display">{b.char}</span>
                    <span className="text-[11px] font-mono-tabular font-normal opacity-80">
                      {b.label}
                    </span>
                  </button>
                );
              })}
              {stackedBlocks.length === 0 && (
                <p className="text-xs opacity-60 my-auto">
                  Tower tumbled! Click any maple block on the right to stack again.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handlePlayTowerMelody}
                disabled={stackedBlocks.length === 0}
                className="px-3.5 py-1.5 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white inline-flex items-center gap-1.5 font-medium cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Tower Arpeggio</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShuffleTower}
                  className="px-3 py-1.5 rounded-lg border border-current/20 hover:border-current/40 inline-flex items-center gap-1.5 font-medium cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Wobble</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickChime(0.85);
                    setStackedBlocks(INITIAL_BLOCKS.slice(0, 4));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-current/20 hover:border-current/40 inline-flex items-center gap-1.5 font-medium cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 6 cols: Block Picker & Brass Star Rattle */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs opacity-75 mb-1">
                <span>Tactile Nursery Engineering</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Maple & Brass Acoustics</span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">
                Rattle & Block Toy Inventions
              </h3>
              <p className="text-sm opacity-80 mt-2 leading-relaxed">
                Pip carved these pastel maple blocks (`h-a-X-♡-★-☾`) so every block plays a soothing musical interval when stacked. Add blocks to the tower or shake Pip’s brass rattle below!
              </p>
            </div>

            <div>
              <p className="text-xs font-medium mb-2.5 opacity-80">
                Tap a maple block to stack onto the tower (max 7):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {INITIAL_BLOCKS.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    disabled={stackedBlocks.length >= 7}
                    onClick={() => handleAddBlock(block)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer disabled:opacity-40 ${subSurface} hover:border-[#A34063]`}
                  >
                    <div>
                      <span className="text-lg font-bold font-display block">{block.char}</span>
                      <span className="text-xs opacity-75">{block.label}</span>
                    </div>
                    <Plus className="w-4 h-4 text-[#A34063]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Star Rattle Card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${subSurface}`}>
              <div>
                <div className="text-xs opacity-75">
                  <span>Acoustic Toy #2</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono-tabular">Shakes: {rattleCount}</span>
                </div>
                <h4 className="text-sm font-semibold mt-0.5">Brass Starlight Rattle</h4>
                <p className="text-xs opacity-75 mt-0.5">
                  Filled with dried lavender seeds and a C6 celesta bell.
                </p>
              </div>
              <button
                type="button"
                onClick={handleShakeRattle}
                className={`px-4 py-2.5 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center gap-2 transition-transform whitespace-nowrap shrink-0 cursor-pointer ${
                  isShaking ? 'scale-105 -rotate-3' : ''
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Shake Rattle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'storybook') {
    const page = STORYBOOK_PAGES[pageIdx];

    const goPrev = () => {
      const nextIdx = (pageIdx - 1 + STORYBOOK_PAGES.length) % STORYBOOK_PAGES.length;
      setPageIdx(nextIdx);
      soundEngine.playMusicBoxNote(STORYBOOK_PAGES[nextIdx].soundNote, 0.85, 0.5);
    };

    const goNext = () => {
      const nextIdx = (pageIdx + 1) % STORYBOOK_PAGES.length;
      setPageIdx(nextIdx);
      soundEngine.playMusicBoxNote(STORYBOOK_PAGES[nextIdx].soundNote, 0.85, 0.5);
    };

    return (
      <div
        className={`rounded-2xl border p-6 lg:p-8 transition-colors ${cardSurface}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') goPrev();
          if (e.key === 'ArrowRight') goNext();
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-current/10">
          <div>
            <div className="text-xs opacity-75 mb-1">
              <span>Invention No. 05</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Interactive Bedtime Flipbook</span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              “The Night Pip Dropped the Moon”
            </h3>
          </div>
          <div className="text-xs font-mono-tabular opacity-80">
            Spread {page.pageNumber} of {STORYBOOK_PAGES.length} · Use ← / → keys or buttons
          </div>
        </div>

        {/* Open Book Two-Page Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-stretch">
          {/* Left Page: Bespoke Storybook Illustration */}
          <div
            className={`lg:col-span-6 rounded-xl border p-6 flex flex-col items-center justify-center min-h-[260px] ${subSurface}`}
          >
            <svg viewBox="0 0 360 220" className="w-full max-w-[320px] h-auto">
              <rect
                x="10"
                y="10"
                width="340"
                height="200"
                rx="14"
                fill={isNightMode ? '#161C30' : '#26203A'}
                stroke="#A34063"
                strokeWidth="2"
              />
              {/* Stars */}
              <circle cx="65" cy="50" r="3" fill="#FDE68A" />
              <circle cx="290" cy="45" r="3.5" fill="#FBBF24" />
              <circle cx="140" cy="40" r="2.5" fill="#FDE68A" />

              {/* Dynamic Scene Illustration per Page */}
              {page.sceneCode === 'moon-slip' && (
                <g>
                  <rect x="90" y="150" width="38" height="38" rx="6" fill="#F4C6D7" />
                  <rect x="96" y="114" width="34" height="34" rx="6" fill="#FDE68A" />
                  <circle cx="114" cy="92" r="20" fill="#FFF8F1" />
                  <circle cx="108" cy="90" r="3" fill="#F59E0B" />
                  <circle cx="120" cy="90" r="3" fill="#F59E0B" />
                  <path d="M220 65 A38 38 0 1 0 220 140 A28 28 0 1 1 220 65 Z" fill="#FBBF24" />
                </g>
              )}
              {page.sceneCode === 'cloud-net' && (
                <g>
                  <ellipse cx="140" cy="110" rx="55" ry="26" fill="#FFF8F1" />
                  <circle cx="140" cy="82" r="22" fill="#FFF8F1" />
                  <path d="M128 72 L152 72" stroke="#F472B6" strokeWidth="5" strokeLinecap="round" />
                  <path d="M245 115 A28 28 0 1 0 245 170 A20 20 0 1 1 245 115 Z" fill="#FBBF24" />
                </g>
              )}
              {page.sceneCode === 'lantern-glow' && (
                <g>
                  <circle cx="180" cy="110" r="65" fill="rgba(251, 191, 36, 0.2)" />
                  <ellipse cx="160" cy="120" rx="48" ry="22" fill="#FFF8F1" />
                  <circle cx="220" cy="105" r="24" fill="#FBBF24" />
                </g>
              )}
              {page.sceneCode === 'owl-tea' && (
                <g>
                  <rect x="135" y="130" width="90" height="70" fill="#8D3554" rx="6" />
                  <ellipse cx="180" cy="124" rx="42" ry="18" fill="#FDE68A" />
                  <path d="M185 75 A26 26 0 1 0 185 125 A19 19 0 1 1 185 75 Z" fill="#FBBF24" />
                </g>
              )}
              {page.sceneCode === 'sweet-slumber' && (
                <g>
                  <path d="M185 50 A36 36 0 1 0 185 120 A27 27 0 1 1 185 50 Z" fill="#FBBF24" />
                  <ellipse cx="180" cy="165" rx="85" ry="26" fill="#FFF8F1" />
                  <text x="180" y="170" textAnchor="middle" fill="#A34063" fontSize="13" fontWeight="bold">
                    z Z z · Cinnamon Dreams
                  </text>
                </g>
              )}
            </svg>
            <span className="text-xs opacity-70 mt-3">
              Illustration Plate 0{page.pageNumber} · Gouache & Berry Ink on Cream Paper
            </span>
          </div>

          {/* Right Page: Story Typography & Audio Cue */}
          <div
            className={`lg:col-span-6 rounded-xl border p-6 lg:p-8 flex flex-col justify-between ${subSurface}`}
          >
            <div>
              <span className="text-xs font-mono-tabular text-[#A34063] font-semibold">
                {page.title}
              </span>
              <p className="text-base sm:text-lg font-display leading-relaxed mt-4">
                {page.text}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => soundEngine.playMusicBoxNote(page.soundNote, 1.1, 0.4)}
                className="text-xs font-medium text-[#A34063] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Chime Page Note ({Math.round(page.soundNote)} Hz)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="px-3.5 py-2 rounded-lg border border-current/20 hover:border-current/40 text-xs font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="px-4 py-2 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Turn Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Project 6: Nursery Wall Growth Chart
  const activeMilestone = GROWTH_MILESTONES[selectedMilestoneIdx];
  return (
    <div className={`rounded-2xl border p-6 lg:p-8 transition-colors ${cardSurface}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 5 cols: Interactive Wooden Doorframe Ruler */}
        <div className={`lg:col-span-5 rounded-xl border p-5 flex flex-col justify-between ${subSurface}`}>
          <div>
            <div className="text-xs opacity-75 mb-1">
              <span>Invention No. 06</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Nursery Doorframe Notches</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              Pip’s Growth & Skill Ruler
            </h3>
          </div>

          <div className="my-4 space-y-2">
            {GROWTH_MILESTONES.map((m, idx) => {
              const active = idx === selectedMilestoneIdx;
              return (
                <button
                  key={m.heightInches}
                  type="button"
                  onClick={() => {
                    soundEngine.playMusicBoxNote(1046.5 - idx * 85, 0.75, 0.45);
                    setSelectedMilestoneIdx(idx);
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    active
                      ? 'bg-[#A34063] border-[#A34063] text-white'
                      : 'border-current/15 hover:border-current/35'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tabular font-semibold text-sm shrink-0">
                      {m.heightInches}
                    </span>
                    <span className="text-xs font-medium truncate">{m.title}</span>
                  </div>
                  <span className="text-[11px] opacity-80 whitespace-nowrap shrink-0">
                    {m.ageLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 cols: Selected Notch Detail */}
        <div className={`lg:col-span-7 rounded-xl border p-6 lg:p-8 flex flex-col justify-between ${subSurface}`}>
          <div>
            <div className="flex items-center gap-2 text-xs opacity-75">
              <Ruler className="w-4 h-4 text-[#A34063]" />
              <span className="font-mono-tabular">Pencil Mark at {activeMilestone.heightInches}</span>
              <span aria-hidden="true">·</span>
              <span>{activeMilestone.ageLabel}</span>
            </div>

            <h4 className="text-2xl sm:text-3xl font-semibold mt-3 tracking-tight">
              {activeMilestone.title}
            </h4>

            <div className="mt-6 pt-5 border-t border-current/10 space-y-4">
              <div>
                <span className="text-xs opacity-70 block">Dream Engineering Capability Unlocked</span>
                <p className="text-base font-semibold mt-1 text-[#A34063]">
                  {activeMilestone.skillUnlocked}
                </p>
              </div>
              <div>
                <span className="text-xs opacity-70 block">Elder Sand-Owl Inspection Note</span>
                <p className="text-sm opacity-85 mt-1 leading-relaxed">
                  “{activeMilestone.note}”
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-current/10 flex items-center justify-between text-xs opacity-75">
            <span>Measured barefoot on a fluffy cloud cushion</span>
            <span className="font-mono-tabular">+3.2&quot; with starry nightcap</span>
          </div>
        </div>
      </div>
    </div>
  );
};
