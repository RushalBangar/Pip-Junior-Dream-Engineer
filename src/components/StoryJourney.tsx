import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Volume2 } from 'lucide-react';
import { STORY_SCENES, StoryScene } from '../data/pipCanon';
import { soundEngine } from '../utils/soundEngine';

interface StoryJourneyProps {
  isNightMode: boolean;
  onJumpToGuestbook: () => void;
}

export const StoryJourney: React.FC<StoryJourneyProps> = ({
  isNightMode,
  onJumpToGuestbook,
}) => {
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [dioramaSparkle, setDioramaSparkle] = useState<number>(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeScene: StoryScene = STORY_SCENES[activeSceneIdx];

  // Scroll-synchronized scene tracking via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
              setActiveSceneIdx(idx);
            }
          });
        },
        { threshold: [0.55] }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleSceneInteraction = (idx: number) => {
    setDioramaSparkle((s) => s + 1);
    if (idx === 0) {
      soundEngine.playPipGiggle();
    } else if (idx === 1) {
      soundEngine.playMusicBoxNote(659.25, 0.9, 0.4);
    } else if (idx === 2) {
      soundEngine.playEasterEggMelody();
    } else {
      soundEngine.playClickChime(1.2);
      onJumpToGuestbook();
    }
  };

  return (
    <div className="space-y-8">
      {/* Chapter Progress Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STORY_SCENES.map((scene, idx) => {
          const isCurrent = idx === activeSceneIdx;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1 + idx * 0.1);
                setActiveSceneIdx(idx);
                cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? isNightMode
                    ? 'bg-[#1A2036] border-[#A34063] ring-1 ring-[#A34063]'
                    : 'bg-[#FFFDF9] border-[#A34063] ring-1 ring-[#A34063] shadow-xs'
                  : isNightMode
                  ? 'bg-[#121625] border-[#242B44] opacity-75 hover:opacity-100'
                  : 'bg-[#FFF8F1] border-[#EED6DF] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-xs opacity-75 font-mono-tabular">
                <span>{scene.chapterNumber}</span>
                <span>{scene.timeStamp.split('·')[0]}</span>
              </div>
              <h3 className="text-base font-semibold mt-1 tracking-tight">{scene.title}</h3>
              <p className="text-xs opacity-75 mt-0.5 truncate">{scene.location}</p>
            </button>
          );
        })}
      </div>

      {/* Split Scroll-Driven Story & Sticky Interactive Diorama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 cols: Sticky Interactive SVG Diorama Stage */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => handleSceneInteraction(activeSceneIdx)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSceneInteraction(activeSceneIdx);
            }
          }}
          className={`lg:col-span-6 lg:sticky lg:top-24 rounded-2xl border p-6 flex flex-col items-center justify-between cursor-pointer select-none transition-all ${
            isNightMode
              ? 'bg-[#0C0F1A] border-[#232A42]'
              : 'bg-[#251E35] border-[#42355C] text-[#FFF8F1]'
          }`}
        >
          <div className="w-full flex items-center justify-between text-xs text-[#FDE68A]/85">
            <span>{activeScene.location}</span>
            <span className="font-mono-tabular">Scene 0{activeSceneIdx + 1} / 04</span>
          </div>

          <div className="my-6 w-full flex items-center justify-center min-h-[230px]">
            <svg viewBox="0 0 420 240" className="w-full max-w-[380px] h-auto overflow-visible">
              <defs>
                <radialGradient id="sceneAmber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="55" cy="48" r="2.5" fill="#FDE68A" />
              <circle cx="350" cy="40" r="3" fill="#FBBF24" />
              <circle cx="290" cy="75" r="2" fill="#FFF8F1" />
              <circle cx="110" cy="80" r="2" fill="#FDE68A" />

              {activeScene.illustrationTheme === 'crib-star' && (
                <g>
                  <path
                    d="M40 35 Q140 65 210 115"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                  />
                  <circle cx="210" cy="115" r="45" fill="url(#sceneAmber)" />
                  <ellipse cx="210" cy="175" rx="95" ry="30" fill="#FFF8F1" />
                  <rect
                    x="160"
                    y="125"
                    width="100"
                    height="52"
                    rx="14"
                    fill="#F4C6D7"
                    stroke="#A34063"
                    strokeWidth="2.5"
                  />
                  <circle cx="210" cy="115" r="24" fill="#FFFFFF" stroke="#3A2721" strokeWidth="2.2" />
                  <circle cx="202" cy="114" r="5" fill="#271C22" />
                  <circle cx="218" cy="114" r="5" fill="#271C22" />
                  <circle cx="202" cy="114" r="2.5" fill="#FBBF24" />
                  <circle cx="218" cy="114" r="2.5" fill="#FBBF24" />
                </g>
              )}

              {activeScene.illustrationTheme === 'nursery-desk' && (
                <g>
                  <rect x="65" y="160" width="290" height="16" rx="6" fill="#A34063" />
                  <rect x="115" y="118" width="64" height="42" rx="6" fill="#F4C6D7" stroke="#FFF8F1" strokeWidth="2" />
                  <circle cx="147" cy="105" r="22" fill="url(#sceneAmber)" />
                  <circle cx="250" cy="128" r="26" fill="#FFF8F1" />
                  <path d="M225 112 Q250 72 285 96 Z" fill="#4C3D75" />
                  <circle cx="242" cy="128" r="5" fill="#271C22" />
                  <circle cx="258" cy="128" r="5" fill="#271C22" />
                  <circle cx="242" cy="128" r="2.5" fill="#FBBF24" />
                  <circle cx="258" cy="128" r="2.5" fill="#FBBF24" />
                </g>
              )}

              {activeScene.illustrationTheme === 'silence-bell' && (
                <g>
                  <polygon
                    points="210,85 80,210 340,210"
                    fill="rgba(251, 191, 36, 0.22)"
                  />
                  <circle cx="210" cy="85" r="38" fill="url(#sceneAmber)" />
                  <path d="M215 68 A18 18 0 1 0 215 102 A13 13 0 1 1 215 68 Z" fill="#FBBF24" />
                  <path
                    d="M40 220 L90 175 L140 220 L205 168 L265 220 L325 178 L380 220 Z"
                    fill="#1E1B4B"
                    stroke="#FDE68A"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {activeScene.illustrationTheme === 'rooftop-lantern' && (
                <g>
                  <circle cx="210" cy="120" r="65" fill="url(#sceneAmber)" />
                  <ellipse cx="210" cy="150" rx="85" ry="26" fill="#FFF8F1" />
                  <rect x="175" y="102" width="70" height="46" rx="8" fill="#A34063" stroke="#FDE68A" strokeWidth="2" />
                  <text x="210" y="130" textAnchor="middle" fill="#FFF8F1" fontSize="12" fontWeight="bold">
                    DREAM MAIL
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="w-full pt-3 border-t border-white/15 flex items-center justify-between text-xs text-[#FDE68A]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeScene.interactiveHint}</span>
            </span>
            <span className="font-mono-tabular">Chimes: {dioramaSparkle}</span>
          </div>
        </motion.div>

        {/* Right 6 cols: Scrollable Chapter Cards (<150 words each) */}
        <div className="lg:col-span-6 space-y-6">
          {STORY_SCENES.map((scene, idx) => {
            const isActive = idx === activeSceneIdx;
            return (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => {
                  soundEngine.playClickChime(1 + idx * 0.08);
                  setActiveSceneIdx(idx);
                }}
                className={`rounded-2xl border p-6 lg:p-7 transition-all cursor-pointer ${
                  isActive
                    ? isNightMode
                      ? 'bg-[#131726] border-[#A34063] ring-1 ring-[#A34063]'
                      : 'bg-[#FFFDF9] border-[#A34063] ring-1 ring-[#A34063] shadow-xs'
                    : isNightMode
                    ? 'bg-[#111522] border-[#222840] opacity-80 hover:opacity-100'
                    : 'bg-[#FFFDF9]/80 border-[#EED6DF] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs opacity-75">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular font-semibold text-[#A34063]">
                      {scene.chapterNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{scene.timeStamp}</span>
                  </div>
                  <span className="font-mono-tabular">{scene.wordCount} words</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold mt-2 tracking-tight">
                  {scene.title}
                </h3>
                <p className="text-xs sm:text-sm opacity-75 mt-0.5">{scene.subtitle}</p>

                <p className="text-sm sm:text-base leading-relaxed mt-4 opacity-95">
                  {scene.narrative}
                </p>

                <div
                  className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isNightMode
                      ? 'bg-[#0D101B] border-[#222840]'
                      : 'bg-[#FFF8F1] border-[#EED6DF]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-display italic text-[#A34063]">
                    {scene.pipQuote}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSceneIdx(idx);
                      handleSceneInteraction(idx);
                    }}
                    className="text-xs font-medium text-[#A34063] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Chime</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
