import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Download, Copy, Check, Sparkles, ArrowUpRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface BriefInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode: boolean;
  easterEggFound: boolean;
  onJumpToSection?: (sectionId: string) => void;
}

export const BriefInspectorModal: React.FC<BriefInspectorModalProps> = ({
  isOpen,
  onClose,
  isNightMode,
  easterEggFound,
  onJumpToSection,
}) => {
  const [activeView, setActiveView] = useState<'features' | 'presskit' | 'track2'>('features');
  const [copiedSheet, setCopiedSheet] = useState(false);

  // Track 2 5-Point Character Sheet interactive generator
  const [charName, setCharName] = useState('Nimbus');
  const [charSpecies, setCharSpecies] = useState('Sleepy Cumulus Cloud Sprite');
  const [charPersonality, setCharPersonality] = useState(
    'Fluffy, easily startled by hiccups, collects lost kites'
  );
  const [charCraft, setCharCraft] = useState('Apprentice Rainbow Weaver & Drizzle Calibrator');
  const [charOrigin, setCharOrigin] = useState(
    'Drifted out of a kettle spout on a rainy Sunday morning'
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyTrack2Sheet = () => {
    const markdown = `### Track 2 · 5-Point Character Sheet (haX.baby)
1. **Name**: ${charName}
2. **What they are**: ${charSpecies}
3. **Personality**: ${charPersonality}
4. **What they do (Craft)**: ${charCraft}
5. **Origin Story**: ${charOrigin}`;
    navigator.clipboard.writeText(markdown).catch(() => {});
    soundEngine.playClickChime(1.2);
    setCopiedSheet(true);
    setTimeout(() => setCopiedSheet(false), 2500);
  };

  const handleJump = (id: string) => {
    soundEngine.playClickChime(1.1);
    onClose();
    if (onJumpToSection) {
      onJumpToSection(id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const subSurface = isNightMode
    ? 'bg-[#0C0F1A] border-[#222842]'
    : 'bg-[#FFF8F1] border-[#EED6DF]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl border p-6 sm:p-8 shadow-2xl transition-colors ${
          isNightMode
            ? 'bg-[#111524] border-[#2A3252] text-[#F8F5F0]'
            : 'bg-[#FFFDF9] border-[#E8C5D2] text-[#3A2721]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-current/10">
          <div>
            <div className="text-xs opacity-75">
              <span>Midnight Nursery Studio 04</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>haX.baby “Baby’s First Website” Showcase</span>
            </div>
            <h2 id="brief-modal-title" className="text-2xl font-semibold mt-1 tracking-tight">
              Interactive Feature Index, Studio Press Kit & Character Passport
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClickChime(0.9);
              onClose();
            }}
            aria-label="Close modal"
            className="p-2 rounded-lg border border-current/15 hover:border-current/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 my-5">
          <div
            className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-lg ${
              isNightMode ? 'bg-[#0B0E18]' : 'bg-[#F8ECE7]'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1);
                setActiveView('features');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'features'
                  ? isNightMode
                    ? 'bg-[#A34063] text-white'
                    : 'bg-white text-[#3A2721] shadow-xs'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              Interactive Feature Index
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1.08);
                setActiveView('presskit');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'presskit'
                  ? isNightMode
                    ? 'bg-[#A34063] text-white'
                    : 'bg-white text-[#3A2721] shadow-xs'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              Canon Specs & Assets
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1.15);
                setActiveView('track2');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'track2'
                  ? isNightMode
                    ? 'bg-[#A34063] text-white'
                    : 'bg-white text-[#3A2721] shadow-xs'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              Original Baby Passport Maker
            </button>
          </div>

          <a
            href="/baby/pip.jpg"
            download="pip-reference-sketch.jpg"
            className="text-xs font-medium text-[#A34063] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official Pip Sketch</span>
          </a>
        </div>

        {activeView === 'features' && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${subSurface}`}>
              <div>
                <h3 className="text-base font-semibold mb-1">
                  Track 1 · Pip, The Skull Baby (“Same Baby, 1,000 Websites”)
                </h3>
                <p className="opacity-85 leading-relaxed text-xs">
                  Every interactive toy, 3D model, synthesizer, and story chapter on this site is live and playable. Click any section below to jump straight to it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleJump('workshop')}
                className="px-4 py-2 rounded-lg bg-[#A34063] text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Open Interactive Lab</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border space-y-2.5 ${subSurface}`}>
                <div className="text-xs font-mono-tabular text-[#A34063] font-semibold">
                  Core Portfolio & Identity
                </div>
                <h4 className="font-semibold text-base">Meet Pip & Story</h4>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Smooth cursor & touch eye-tracking + head tilt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>4-Scene Origin Journey (73–77 words per scene)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Cozy Cream Day / Midnight Slumber toggle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      Pink Nightcap Bow Secret ({easterEggFound ? 'Unlocked!' : 'Tap bow 3x'})
                    </span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border space-y-2.5 ${subSurface}`}>
                <div className="text-xs font-mono-tabular text-[#A34063] font-semibold">
                  6 Playable Inventions
                </div>
                <h4 className="font-semibold text-base">Nursery Instruments</h4>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Lullaby Lab Web Audio 6x8 synth + mute switch</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Nightlight Torch cursor illuminating dark notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Dream Delivery SVG rooftop map & auto-fly mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>5-Spread Bedtime Storybook & Starlight Catcher Game</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border space-y-2.5 ${subSurface}`}>
                <div className="text-xs font-mono-tabular text-[#A34063] font-semibold">
                  3D WebGL & Community
                </div>
                <h4 className="font-semibold text-base">Live Nursery World</h4>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>3D WebGL / Three.js Stage:</strong> Orbit & tap Pip in 3D</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Live Dream Guestbook:</strong> Persistent wall + star applause</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Visitor Memory & Chat:</strong> Pip remembers your name & visit #</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Early-Web Soul:</strong> Odometer, Sparkle Trail & 90s Mode</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeView === 'presskit' && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border space-y-2 ${subSurface}`}>
                <div className="text-xs font-mono-tabular text-[#A34063] font-semibold">
                  Official Pip Canon Specification
                </div>
                <ul className="space-y-2 text-xs leading-relaxed">
                  <li>
                    <strong>Character:</strong> Pip, The Skull Baby (sleepy, gentle, smooth round porcelain skull face, warm 1850K amber eye pinpricks, starry nightcap with pink bow).
                  </li>
                  <li>
                    <strong>Profession:</strong> Junior Dream Engineer at Midnight Nursery, Cloud-Crib District.
                  </li>
                  <li>
                    <strong>Tone & Palette:</strong> Warm Cream (<code>#FFF8F1</code>), Berry Rose (<code>#A34063</code>), Espresso Bark (<code>#3A2721</code>), and Starlight Amber (<code>#FBBF24</code>).
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${subSurface}`}>
                <div className="text-xs font-mono-tabular text-[#A34063] font-semibold">
                  Downloadable Studio Cutouts
                </div>
                <p className="text-xs opacity-80 leading-relaxed">
                  All official transparent PNG cutouts and custom SVG blueprints used in this portfolio can be downloaded directly:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="/baby/assets/pip_avatar_cloud.png"
                    download="pip_avatar_cloud.png"
                    className="p-2 rounded-lg border border-current/15 hover:border-[#A34063] text-xs font-medium inline-flex items-center justify-between"
                  >
                    <span>Pip on Cloud (.PNG)</span>
                    <Download className="w-3.5 h-3.5 text-[#A34063]" />
                  </a>
                  <a
                    href="/baby/assets/pip_lullaby_box.png"
                    download="pip_lullaby_box.png"
                    className="p-2 rounded-lg border border-current/15 hover:border-[#A34063] text-xs font-medium inline-flex items-center justify-between"
                  >
                    <span>Lullaby Box (.PNG)</span>
                    <Download className="w-3.5 h-3.5 text-[#A34063]" />
                  </a>
                  <a
                    href="/baby/assets/pip_dream_lantern.png"
                    download="pip_dream_lantern.png"
                    className="p-2 rounded-lg border border-current/15 hover:border-[#A34063] text-xs font-medium inline-flex items-center justify-between"
                  >
                    <span>Dream Lantern (.PNG)</span>
                    <Download className="w-3.5 h-3.5 text-[#A34063]" />
                  </a>
                  <a
                    href="/baby/assets/pip_portrait.png"
                    download="pip_portrait.png"
                    className="p-2 rounded-lg border border-current/15 hover:border-[#A34063] text-xs font-medium inline-flex items-center justify-between"
                  >
                    <span>Full Portrait (.PNG)</span>
                    <Download className="w-3.5 h-3.5 text-[#A34063]" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'track2' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="opacity-85">
              Want to invent a friend for Pip in Midnight Nursery? Customize a <strong>5-Point Character Passport</strong> below and copy the card:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">1. Character Name</label>
                  <input
                    type="text"
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">2. What They Are (Species & Look)</label>
                  <input
                    type="text"
                    value={charSpecies}
                    onChange={(e) => setCharSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">3. Personality & Quirks</label>
                  <input
                    type="text"
                    value={charPersonality}
                    onChange={(e) => setCharPersonality(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">4. What They Do (Craft / Job)</label>
                  <input
                    type="text"
                    value={charCraft}
                    onChange={(e) => setCharCraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">5. Origin Story Summary</label>
                  <input
                    type="text"
                    value={charOrigin}
                    onChange={(e) => setCharOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-xs"
                  />
                </div>
              </div>

              <div className={`lg:col-span-5 p-4 rounded-xl border flex flex-col justify-between ${subSurface}`}>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono-tabular text-[#A34063] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>MIDNIGHT NURSERY PASSPORT</span>
                  </div>
                  <div className="text-lg font-bold font-display">{charName || 'Unnamed Baby'}</div>
                  <div className="text-xs opacity-80">{charSpecies}</div>
                  <div className="pt-2 text-xs space-y-1">
                    <div><strong>Craft:</strong> {charCraft}</div>
                    <div><strong>Quirks:</strong> {charPersonality}</div>
                    <div><strong>Origin:</strong> {charOrigin}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTrack2Sheet}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedSheet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSheet ? 'Copied 5-Point Sheet!' : 'Copy Character Sheet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
