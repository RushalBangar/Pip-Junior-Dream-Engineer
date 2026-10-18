import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  KeyRound,
  Shuffle,
  Copy,
  Check,
  BookHeart,
} from 'lucide-react';
import { AttachedMelody } from '../data/pipCanon';
import { soundEngine } from '../utils/soundEngine';

interface LullabyLabProps {
  isNightMode: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onAttachToGuestbook?: (melody: AttachedMelody) => void;
}

const NOTES = [
  { label: 'E6 · Star Tip', short: 'E6', freq: 1318.51 },
  { label: 'C6 · High Cloud', short: 'C6', freq: 1046.5 },
  { label: 'A5 · Moonbeam', short: 'A5', freq: 880.0 },
  { label: 'G5 · Warm Milk', short: 'G5', freq: 783.99 },
  { label: 'E5 · Crib Bell', short: 'E5', freq: 659.25 },
  { label: 'C5 · Root Pillow', short: 'C5', freq: 523.25 },
];

const PRESETS: Record<string, { name: string; bpm: number; grid: boolean[][] }> = {
  waltz: {
    name: 'Cloud Nine Waltz',
    bpm: 88,
    grid: [
      [false, false, false, true, false, false, false, true],
      [false, true, false, false, false, true, false, false],
      [false, false, true, false, false, false, true, false],
      [true, false, false, false, true, false, false, false],
      [false, false, true, false, false, true, false, false],
      [true, false, false, false, true, false, false, false],
    ],
  },
  milk: {
    name: 'Starlight Honey Milk',
    bpm: 76,
    grid: [
      [true, false, false, false, false, false, true, false],
      [false, false, true, false, true, false, false, false],
      [false, true, false, false, false, true, false, false],
      [false, false, false, true, false, false, false, true],
      [true, false, false, false, true, false, false, false],
      [false, false, true, false, false, false, true, false],
    ],
  },
  nocturne: {
    name: 'Cribside Nocturne',
    bpm: 96,
    grid: [
      [false, true, false, true, false, false, true, false],
      [true, false, false, false, true, false, false, true],
      [false, false, true, false, false, true, false, false],
      [false, true, false, false, true, false, true, false],
      [true, false, false, true, false, false, false, false],
      [true, false, false, false, false, false, true, false],
    ],
  },
};

export const LullabyLab: React.FC<LullabyLabProps> = ({
  isNightMode,
  isMuted,
  onToggleMute,
  onAttachToGuestbook,
}) => {
  const [activePreset, setActivePreset] = useState<string>('waltz');
  const [grid, setGrid] = useState<boolean[][]>(PRESETS.waltz.grid);
  const [bpm, setBpm] = useState<number>(88);
  const [warmth, setWarmth] = useState<number>(0.45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [windTurns, setWindTurns] = useState<number>(3);
  const [imgError, setImgError] = useState<boolean>(false);
  const [copiedMelody, setCopiedMelody] = useState<boolean>(false);
  const [attachedFeedback, setAttachedFeedback] = useState<boolean>(false);

  const stepRef = useRef(0);
  const gridRef = useRef(grid);
  const warmthRef = useRef(warmth);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    warmthRef.current = warmth;
  }, [warmth]);

  useEffect(() => {
    if (!isPlaying) return;
    const stepMs = Math.round((60 / bpm / 2) * 1000);
    const timer = setInterval(() => {
      const s = stepRef.current;
      setCurrentStep(s);
      gridRef.current.forEach((row, noteIdx) => {
        if (row[s]) {
          soundEngine.playMusicBoxNote(NOTES[noteIdx].freq, 1.05, warmthRef.current);
        }
      });
      stepRef.current = (s + 1) % 8;
    }, stepMs);

    return () => clearInterval(timer);
  }, [isPlaying, bpm]);

  const handleToggleCell = (rIdx: number, cIdx: number) => {
    const next = grid.map((row, r) =>
      row.map((val, c) => (r === rIdx && c === cIdx ? !val : val))
    );
    setGrid(next);
    if (!grid[rIdx][cIdx]) {
      soundEngine.playMusicBoxNote(NOTES[rIdx].freq, 0.9, warmth);
    } else {
      soundEngine.playClickChime(0.85);
    }
  };

  const handleSelectPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    soundEngine.playClickChime(1.1);
    setActivePreset(key);
    setGrid(p.grid.map((r) => [...r]));
    setBpm(p.bpm);
  };

  const handleRandomizeMelody = () => {
    soundEngine.playPipGiggle();
    setActivePreset('custom');
    const randomGrid = NOTES.map((_, rIdx) =>
      Array.from({ length: 8 }, (__, cIdx) => {
        if (rIdx === 5 && (cIdx === 0 || cIdx === 4)) return true;
        return Math.random() < 0.24;
      })
    );
    setGrid(randomGrid);
  };

  const handleCopyMelody = () => {
    const stepSummary = Array.from({ length: 8 }, (_, col) => {
      const activeNotes = NOTES.filter((__, row) => grid[row][col]).map((n) => n.short);
      return activeNotes.length > 0 ? activeNotes.join('+') : '·';
    }).join(' | ');
    const text = `Pip's 432Hz Lullaby Box (${bpm} BPM): [ ${stepSummary} ]`;
    navigator.clipboard.writeText(text).catch(() => {});
    soundEngine.playClickChime(1.2);
    setCopiedMelody(true);
    setTimeout(() => setCopiedMelody(false), 2200);
  };

  const handleAttachGuestbook = () => {
    if (!onAttachToGuestbook) return;
    const notesPerStep = Array.from({ length: 8 }, (_, col) => {
      for (let r = 0; r < NOTES.length; r++) {
        if (grid[r][col]) return NOTES[r].freq;
      }
      return 0;
    });
    const presetTitle = PRESETS[activePreset]?.name || 'Custom Starlight Lullaby';
    soundEngine.playEasterEggMelody();
    setAttachedFeedback(true);
    setTimeout(() => setAttachedFeedback(false), 2200);
    onAttachToGuestbook({
      label: `${presetTitle} (${bpm} BPM)`,
      bpm,
      notes: notesPerStep,
    });
  };

  const handleWindKey = () => {
    const nextTurns = Math.min(5, windTurns + 1);
    setWindTurns(nextTurns);
    soundEngine.playWindKeyTick(nextTurns);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-6 lg:p-8 transition-colors ${
        isNightMode
          ? 'bg-[#131726] border-[#262D47] text-[#F8F5F0]'
          : 'bg-[#FFFDF9] border-[#EED6DF] text-[#3A2721]'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 4 cols: Official Music Box Studio Render & Winding Controls */}
        <div
          className={`lg:col-span-4 rounded-xl border p-5 flex flex-col justify-between ${
            isNightMode
              ? 'bg-[#0D101B] border-[#222840]'
              : 'bg-[#FFF8F1] border-[#EED6DF]'
          }`}
        >
          <div>
            <div className="text-xs opacity-75 mb-1">
              <span>Invention No. 01</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>432 Hz Brass Celesta</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              The Lullaby Lab Music Box
            </h3>
            <p className="text-sm opacity-80 mt-1.5 leading-relaxed">
              Wind the golden brass key or tap any star node to weave a custom 8-step bedtime chime for the nursery.
            </p>
          </div>

          <div className="my-5 flex items-center justify-center relative">
            {!imgError ? (
              <img
                src="/baby/assets/pip_lullaby_box.png"
                alt="Pip's pastel Lullaby Lab music box with golden winding key and star chimes"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className={`max-h-[195px] w-auto object-contain transition-transform duration-300 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
            ) : (
              <div className="py-10 text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#A34063]" />
                <span className="text-xs">Music Box Studio Render</span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-current/10">
            <div className="flex items-center justify-between text-xs">
              <span>Brass Key Spring Tension</span>
              <span className="font-mono-tabular font-semibold text-[#A34063]">
                {windTurns} / 5 Turns
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWindKey}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Wind Golden Key & Play</span>
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                className={`py-2.5 px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isMuted
                    ? 'border-rose-400/50 text-rose-400'
                    : 'border-current/20 hover:border-current/40'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'Muted' : 'Audio On'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 8 cols: Interactive 6x8 Star Chime Sequencer */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
          {/* Top toolbar: Presets + Play/Stop */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/10">
            <div
              className={`flex flex-wrap items-center gap-1 p-1 rounded-lg ${
                isNightMode ? 'bg-[#0B0E18]' : 'bg-[#F8ECE7]'
              }`}
            >
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPreset(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activePreset === key
                      ? isNightMode
                        ? 'bg-[#A34063] text-white'
                        : 'bg-white text-[#3A2721] shadow-xs'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickChime(isPlaying ? 0.8 : 1.2);
                  setIsPlaying(!isPlaying);
                }}
                className={`py-2 px-4 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-[#A34063] text-white hover:bg-[#8D3554]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Chimes</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Lullaby</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRandomizeMelody}
                className="py-2 px-3 rounded-lg border border-current/15 hover:border-[#A34063] text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#A34063]" />
                <span>Cozy Random</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMelody}
                className="py-2 px-3 rounded-lg border border-current/15 hover:border-[#A34063] text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedMelody ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#A34063]" />
                )}
                <span>{copiedMelody ? 'Copied Notation!' : 'Copy Score'}</span>
              </button>

              {onAttachToGuestbook && (
                <button
                  type="button"
                  onClick={handleAttachGuestbook}
                  className="py-2 px-3 rounded-lg border border-[#A34063]/40 bg-[#A34063]/10 hover:bg-[#A34063] hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BookHeart className="w-3.5 h-3.5" />
                  <span>{attachedFeedback ? 'Attached to Guestbook!' : 'Pin Melody to Guestbook'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickChime(0.9);
                  setIsPlaying(false);
                  setGrid(NOTES.map(() => Array(8).fill(false)));
                }}
                className="py-2 px-3 rounded-lg border border-current/15 hover:border-current/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* 6x8 Sequencer Matrix */}
          <div className="space-y-2 overflow-x-auto pb-1">
            {NOTES.map((note, rIdx) => (
              <div key={note.label} className="grid grid-cols-12 items-center gap-2 min-w-[520px]">
                <div className="col-span-3 text-xs font-mono-tabular opacity-80 truncate pr-2">
                  {note.label}
                </div>
                <div className="col-span-9 grid grid-cols-8 gap-2">
                  {grid[rIdx].map((active, cIdx) => {
                    const isCurrentCol = isPlaying && currentStep === cIdx;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => handleToggleCell(rIdx, cIdx)}
                        aria-label={`Toggle ${note.label} at step ${cIdx + 1}`}
                        aria-pressed={active}
                        className={`h-10 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                          active
                            ? isCurrentCol
                              ? 'bg-amber-400 border-amber-300 text-slate-950 scale-105 shadow-sm'
                              : 'bg-[#A34063] border-[#A34063] text-white'
                            : isCurrentCol
                            ? isNightMode
                              ? 'bg-[#252C48] border-amber-400/50'
                              : 'bg-[#F6E3EA] border-[#A34063]/40'
                            : isNightMode
                            ? 'bg-[#191E31] border-[#28304D] hover:border-[#3E4A75]'
                            : 'bg-[#FFF8F1] border-[#E7D4DC] hover:border-[#C99FB0]'
                        }`}
                      >
                        <span
                          className={`text-xs font-mono-tabular ${
                            active ? 'opacity-100 font-semibold' : 'opacity-30'
                          }`}
                        >
                          {active ? '★' : cIdx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sliders: Tempo & Acoustic Warmth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-current/10">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Cribside Tempo</span>
                <span className="font-mono-tabular font-medium">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min={60}
                max={132}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-[#A34063] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Porcelain Bell Warmth (Low-Pass Filter)</span>
                <span className="font-mono-tabular font-medium">{Math.round(warmth * 100)}% Cozy</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={warmth}
                onChange={(e) => setWarmth(Number(e.target.value))}
                className="w-full accent-[#A34063] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
