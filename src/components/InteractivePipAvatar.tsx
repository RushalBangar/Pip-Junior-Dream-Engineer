import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Eye, Box } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { Pip3DStage } from './Pip3DStage';

interface InteractivePipAvatarProps {
  isNightMode: boolean;
  onTriggerEasterEgg: () => void;
  easterEggFound: boolean;
  visitCount: number;
}

const PIP_GREETINGS = [
  '“Hic—hello! I kept a warm cloud cushion fluffed just for you!”',
  '“Watch my lantern! It glows at 1850K so shadows stay friendly.”',
  '“Psst… try tapping the little pink bow on my nightcap three times!”',
  '“Switch to 3D WebGL mode above to spin my porcelain skull and blocks in 3D!”',
  '“I’m a skull baby, which just means my smile is permanent and extra polite!”',
];

export const InteractivePipAvatar: React.FC<InteractivePipAvatarProps> = ({
  isNightMode,
  onTriggerEasterEgg,
  easterEggFound,
  visitCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState(0);
  const [viewMode, setViewMode] = useState<'interactive' | '3d' | 'studio'>('interactive');
  const [giggleCount, setGiggleCount] = useState(0);
  const [bowClicks, setBowClicks] = useState(0);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Smooth cursor & touch tracking for Pip's glowing eye pinpricks
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.min(1, Math.hypot(dx, dy) / 320);
      const angle = Math.atan2(dy, dx);

      const maxEyeMove = 10;
      setEyeOffset({
        x: Math.cos(angle) * dist * maxEyeMove,
        y: Math.sin(angle) * dist * maxEyeMove,
      });
      setHeadTilt(Math.max(-5, Math.min(5, (dx / 300) * 4)));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Natural sleepy blink timer
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const handlePetPip = () => {
    soundEngine.playPipGiggle();
    setGiggleCount((c) => c + 1);
    setSpeechIndex((i) => (i + 1) % PIP_GREETINGS.length);
  };

  const handleBowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = bowClicks + 1;
    setBowClicks(next);
    soundEngine.playClickChime(1 + next * 0.15);
    if (next >= 3) {
      onTriggerEasterEgg();
      setBowClicks(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl border transition-colors duration-300 p-6 flex flex-col justify-between h-full ${
        isNightMode
          ? 'bg-[#131726] border-[#262D47] text-[#F8F5F0]'
          : 'bg-[#FFFDF9] border-[#EED6DF] text-[#3A2721]'
      }`}
    >
      {/* Top control strip inside the character stage */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/10">
        <div className="text-xs opacity-75">
          <span>Character Stage</span>
          <span className="mx-1.5" aria-hidden="true">·</span>
          <span className="font-mono-tabular">
            {visitCount > 1 ? `Visit #${visitCount}` : 'First Visit'}
          </span>
        </div>

        {/* Segmented control: 2D Eye-Tracker vs Tier 3 3D WebGL vs Studio Artwork */}
        <div
          className={`flex items-center gap-1 p-1 rounded-lg ${
            isNightMode ? 'bg-[#0B0E18]' : 'bg-[#F8ECE7]'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              soundEngine.playClickChime(1);
              setViewMode('interactive');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'interactive'
                ? isNightMode
                  ? 'bg-[#A34063] text-white'
                  : 'bg-white text-[#3A2721] shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            2D Eye-Tracker
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClickChime(1.1);
              setViewMode('3d');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === '3d'
                ? isNightMode
                  ? 'bg-[#A34063] text-white'
                  : 'bg-white text-[#3A2721] shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D WebGL</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClickChime(1.18);
              setViewMode('studio');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'studio'
                ? isNightMode
                  ? 'bg-[#A34063] text-white'
                  : 'bg-white text-[#3A2721] shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Studio Render
          </button>
        </div>
      </div>

      {/* Main Character Viewport */}
      {viewMode === '3d' ? (
        <div className="my-4 flex-1 flex flex-col justify-center">
          <Pip3DStage
            isNightMode={isNightMode}
            onTriggerEasterEgg={onTriggerEasterEgg}
            onGiggle={handlePetPip}
          />
        </div>
      ) : (
        <div
          onClick={handlePetPip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePetPip();
            }
          }}
          aria-label="Click to make Pip giggle. Click Pip's pink nightcap bow three times for a bedtime surprise."
          className="relative my-4 flex-1 min-h-[340px] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden rounded-xl"
          style={{
            background: isNightMode
              ? 'radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.14), rgba(15, 19, 34, 0.92) 72%)'
              : 'radial-gradient(circle at 50% 45%, rgba(255, 228, 236, 0.65), rgba(255, 248, 241, 0.9) 75%)',
          }}
        >
          {viewMode === 'studio' ? (
            <div className="relative flex flex-col items-center justify-center p-4">
              {!imageError ? (
                <img
                  src="/baby/assets/pip_avatar_cloud.png"
                  alt="Pip the Skull Baby waving from a sleepy cloud wearing a starry nightcap with a pink bow"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="max-h-[290px] w-auto object-contain transition-transform duration-200"
                  style={{
                    transform: `translate3d(${eyeOffset.x * 0.8}px, ${eyeOffset.y * 0.8}px, 0) rotate(${headTilt * 0.6}deg)`,
                  }}
                />
              ) : (
                <div className="p-8 text-center">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#A34063]" />
                  <p className="text-sm font-medium">Pip · Official Cloud Render</p>
                </div>
              )}
              <span className="mt-2 text-xs opacity-75">
                Official Track 1 Asset · Click anywhere to hear Pip giggle
              </span>
            </div>
          ) : (
            /* Bespoke Interactive Eye-Tracking & Bow Easter-Egg SVG Puppet */
            <div className="relative flex flex-col items-center justify-center w-full py-2">
              <svg
                viewBox="0 0 360 320"
                className="w-full max-w-[330px] h-auto overflow-visible"
                aria-label="Interactive Pip the Skull Baby whose glowing amber eyes track your cursor"
              >
                <defs>
                  <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="45%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="nightcapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isNightMode ? '#312E81' : '#4C3D75'} />
                    <stop offset="100%" stopColor={isNightMode ? '#1E1B4B' : '#312552'} />
                  </linearGradient>
                  <linearGradient id="skullPorcelain" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="85%" stopColor="#FFF6EE" />
                    <stop offset="100%" stopColor="#F4E3D7" />
                  </linearGradient>
                </defs>

                {/* Ambient stars around Pip */}
                <g className="animate-twinkle" style={{ transformOrigin: '70px 70px' }}>
                  <path
                    d="M70 52 L73 61 L82 64 L73 67 L70 76 L67 67 L58 64 L67 61 Z"
                    fill="#F59E0B"
                    opacity="0.85"
                  />
                </g>
                <g className="animate-twinkle" style={{ transformOrigin: '295px 85px' }}>
                  <path
                    d="M295 70 L297 77 L304 79 L297 81 L295 88 L293 81 L286 79 L293 77 Z"
                    fill="#F59E0B"
                    opacity="0.75"
                  />
                </g>

                {/* Fluffy Cumulus Cloud Cushion (Base) */}
                <g
                  style={{
                    transform: `translate3d(${eyeOffset.x * 0.25}px, ${eyeOffset.y * 0.2}px, 0)`,
                    transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <ellipse cx="180" cy="272" rx="115" ry="30" fill={isNightMode ? '#1E293B' : '#F3E5DC'} opacity="0.6" />
                  <circle cx="105" cy="252" r="34" fill="#FFFDF9" stroke="#EED6DF" strokeWidth="2" />
                  <circle cx="152" cy="244" r="42" fill="#FFFFFF" stroke="#EED6DF" strokeWidth="2" />
                  <circle cx="212" cy="246" r="40" fill="#FFFFFF" stroke="#EED6DF" strokeWidth="2" />
                  <circle cx="258" cy="254" r="32" fill="#FFFDF9" stroke="#EED6DF" strokeWidth="2" />
                  <rect x="102" y="248" width="158" height="34" rx="17" fill="#FFFFFF" />
                </g>

                {/* Pip's Cozy Pajama Torso & Waving Bony Hand */}
                <g
                  style={{
                    transform: `translate3d(${eyeOffset.x * 0.35}px, ${eyeOffset.y * 0.35}px, 0)`,
                    transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <path
                    d="M142 204 C135 224 134 246 142 256 L218 256 C226 246 225 224 218 204 Z"
                    fill="#F4C6D7"
                    stroke="#A34063"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M142 212 C116 202 104 185 110 172 C115 163 127 170 132 184"
                    fill="none"
                    stroke="#FFF6EE"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M142 212 C116 202 104 185 110 172"
                    fill="none"
                    stroke="#5C4033"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M218 214 C238 212 252 202 256 190"
                    fill="none"
                    stroke="#5C4033"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="264" cy="208" r="22" fill="url(#amberGlow)" />
                  <path
                    d="M268 195 A12 12 0 1 0 268 220 A9 9 0 1 1 268 195 Z"
                    fill="#FBBF24"
                    stroke="#B45309"
                    strokeWidth="1.5"
                  />
                </g>

                {/* Pip's Smooth Round Skull Head + Nightcap */}
                <g
                  style={{
                    transformOrigin: '180px 155px',
                    transform: `translate3d(${eyeOffset.x * 0.55}px, ${eyeOffset.y * 0.55}px, 0) rotate(${headTilt}deg)`,
                    transition: 'transform 110ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <path
                    d="M116 125 C120 62 178 36 244 58 C272 68 286 98 274 122 C264 102 242 96 226 108 Z"
                    fill="url(#nightcapGrad)"
                    stroke="#3A2721"
                    strokeWidth="2.5"
                  />
                  <line x1="274" y1="118" x2="282" y2="140" stroke="#F59E0B" strokeWidth="2" />
                  <circle cx="283" cy="144" r="9" fill="#FDE68A" stroke="#D97706" strokeWidth="1.8" />
                  <circle cx="165" cy="78" r="3" fill="#FDE68A" />
                  <circle cx="198" cy="68" r="4" fill="#FBBF24" />
                  <circle cx="228" cy="82" r="2.8" fill="#FDE68A" />

                  <path
                    d="M110 124 C135 108 225 108 248 126 C254 132 250 144 238 142 C205 130 152 130 120 142 C108 144 104 132 110 124 Z"
                    fill="#FFF8F1"
                    stroke="#5C4033"
                    strokeWidth="2.2"
                  />

                  <path
                    d="M118 134 C112 172 126 202 148 208 C152 216 164 220 180 220 C196 220 208 216 212 208 C234 202 248 172 242 134 C236 106 124 106 118 134 Z"
                    fill="url(#skullPorcelain)"
                    stroke="#5C4033"
                    strokeWidth="2.6"
                  />

                  <ellipse cx="132" cy="182" rx="11" ry="6.5" fill="#FDA4AF" opacity="0.55" />
                  <ellipse cx="228" cy="182" rx="11" ry="6.5" fill="#FDA4AF" opacity="0.55" />

                  <ellipse cx="154" cy="158" rx="21" ry="22" fill="#271C22" />
                  <ellipse cx="206" cy="158" rx="21" ry="22" fill="#271C22" />

                  {!isBlinking ? (
                    <g
                      style={{
                        transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`,
                        transition: 'transform 70ms linear',
                      }}
                    >
                      <circle cx="154" cy="158" r="12" fill="url(#amberGlow)" />
                      <circle cx="154" cy="158" r="5.5" fill="#FBBF24" />
                      <circle cx="151.5" cy="155.5" r="2.2" fill="#FFFBEB" />

                      <circle cx="206" cy="158" r="12" fill="url(#amberGlow)" />
                      <circle cx="206" cy="158" r="5.5" fill="#FBBF24" />
                      <circle cx="203.5" cy="155.5" r="2.2" fill="#FFFBEB" />
                    </g>
                  ) : (
                    <g stroke="#FBBF24" strokeWidth="3" fill="none" strokeLinecap="round">
                      <path d="M142 158 Q154 166 166 158" />
                      <path d="M194 158 Q206 166 218 158" />
                    </g>
                  )}

                  <path
                    d="M180 173 C176 178 175 182 178 183 C180 184 180 181 180 181 C180 181 180 184 182 183 C185 182 184 178 180 173 Z"
                    fill="#5C4033"
                  />

                  <path
                    d="M164 196 Q180 205 197 193"
                    fill="none"
                    stroke="#5C4033"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line x1="175" y1="196" x2="175" y2="201" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" />
                  <line x1="186" y1="195" x2="186" y2="200" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" />

                  <g
                    onClick={handleBowClick}
                    className="cursor-pointer group"
                    role="button"
                    aria-label="Pip's pink nightcap bow — click 3 times for secret Easter egg"
                  >
                    <title>Click Pip&apos;s Pink Bow 3 times for a bedtime surprise!</title>
                    <path
                      d="M134 114 C120 102 114 118 126 124 Z"
                      fill="#F472B6"
                      stroke="#831843"
                      strokeWidth="2"
                    />
                    <path
                      d="M138 114 C152 102 158 118 146 124 Z"
                      fill="#F472B6"
                      stroke="#831843"
                      strokeWidth="2"
                    />
                    <circle
                      cx="136"
                      cy="116"
                      r="5.5"
                      fill="#EC4899"
                      stroke="#831843"
                      strokeWidth="2"
                    />
                  </g>
                </g>
              </svg>

              <div
                className={`mt-2 px-4 py-2.5 rounded-xl border text-center max-w-sm transition-colors ${
                  isNightMode
                    ? 'bg-[#1A2035] border-[#2E3654] text-[#FDE68A]'
                    : 'bg-[#FFF8F1] border-[#E8C5D2] text-[#5C4033]'
                }`}
              >
                <p className="text-xs sm:text-sm font-medium italic">
                  {PIP_GREETINGS[speechIndex]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Interactive Telemetry & Easter Egg Hint Bar */}
      <div className="pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 opacity-80">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#A34063]" />
            <span>{viewMode === '3d' ? '3D Orbit Active' : 'Eyes follow pointer'}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">Giggles: {giggleCount}</span>
        </div>

        <button
          type="button"
          onClick={handleBowClick}
          className={`inline-flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            easterEggFound
              ? 'text-amber-500'
              : 'text-[#A34063] hover:underline'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {easterEggFound
              ? 'Starlight Secret Unlocked!'
              : `Bow Tap (${bowClicks}/3)`}
          </span>
        </button>
      </div>
    </div>
  );
};
