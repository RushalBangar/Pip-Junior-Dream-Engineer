/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Flame,
  Download,
  Award,
  Heart,
  Gamepad2,
  ArrowUpRight,
  Monitor,
} from 'lucide-react';
import {
  PIP_CANON_PROFILE,
  SHOWCASE_PROJECTS,
  ShowcaseProject,
  AttachedMelody,
} from './data/pipCanon';
import { soundEngine } from './utils/soundEngine';
import { InteractivePipAvatar } from './components/InteractivePipAvatar';
import { LullabyLab } from './components/LullabyLab';
import { InteractiveWorkshops } from './components/InteractiveWorkshops';
import { DreamCatcherMiniGame } from './components/DreamCatcherMiniGame';
import { StoryJourney } from './components/StoryJourney';
import { PipChatAndGuestbook } from './components/PipChatAndGuestbook';
import { BriefInspectorModal } from './components/BriefInspectorModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';

interface SparklePoint {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

type WorkshopTabType = ShowcaseProject['interactiveTabId'] | 'minigame';
type SectionId = 'identity' | 'inventions' | 'workshop' | 'story' | 'guestbook';

const NAV_ITEMS: { id: SectionId; num: string; label: string; mobileLabel: string; pitch: number }[] = [
  { id: 'identity', num: '01.', label: 'Identity', mobileLabel: '01. Identity', pitch: 1.02 },
  { id: 'inventions', num: '02.', label: 'Inventions', mobileLabel: '02. Inventions', pitch: 1.06 },
  { id: 'workshop', num: '03.', label: 'Workshop', mobileLabel: '03. Lab', pitch: 1.1 },
  { id: 'story', num: '04.', label: 'Story', mobileLabel: '04. Story', pitch: 1.14 },
  { id: 'guestbook', num: '05.', label: 'Guestbook', mobileLabel: '05. Guestbook', pitch: 1.18 },
];

export default function App() {
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [retroMode, setRetroMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isMuted);
  const [sparkleTrailOn, setSparkleTrailOn] = useState<boolean>(true);
  const [sparkles, setSparkles] = useState<SparklePoint[]>([]);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 500, y: 350 });
  const [activeWorkshopTab, setActiveWorkshopTab] = useState<WorkshopTabType>('lullaby');
  const [activeSection, setActiveSection] = useState<SectionId>('identity');
  const [lightboxProject, setLightboxProject] = useState<ShowcaseProject | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);

  const [easterEggFound, setEasterEggFound] = useState<boolean>(false);
  const [visitCount, setVisitCount] = useState<number>(1);
  const [savedVisitorName, setSavedVisitorName] = useState<string>('');
  const [odometerValue, setOdometerValue] = useState<number>(10482);
  const [portraitError, setPortraitError] = useState<boolean>(false);
  const [pendingMelody, setPendingMelody] = useState<AttachedMelody | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prevVisits = Number(window.localStorage.getItem('pip_nursery_visits') || '0');
      const nextVisits = prevVisits + 1;
      window.localStorage.setItem('pip_nursery_visits', String(nextVisits));
      setVisitCount(nextVisits);
      setOdometerValue(10480 + nextVisits);

      const storedName = window.localStorage.getItem('pip_visitor_name_v1') || '';
      if (storedName) setSavedVisitorName(storedName);

      const egg = window.localStorage.getItem('pip_easter_egg_found') === 'true';
      if (egg) setEasterEggFound(true);

      fetch('/api/odometer', { method: 'POST' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data.odometer === 'number') {
            setOdometerValue(data.odometer);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Scroll-Spy IntersectionObserver for Desktop & Mobile Navigation
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const sectionIds: SectionId[] = ['identity', 'inventions', 'workshop', 'story', 'guestbook'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0.05 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleUpdateVisitorName = useCallback((name: string) => {
    setSavedVisitorName(name);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pip_visitor_name_v1', name);
    }
  }, []);

  useEffect(() => {
    let lastSpawn = 0;
    const symbols = ['★', '✦', '♡', '☾'];
    const handlePointerMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      const now = performance.now();
      if (sparkleTrailOn && now - lastSpawn > 55) {
        lastSpawn = now;
        const newPoint: SparklePoint = {
          id: now + Math.random(),
          x: e.clientX,
          y: e.clientY,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
        };
        setSparkles((prev) => [...prev.slice(-11), newPoint]);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [sparkleTrailOn]);

  useEffect(() => {
    if (!sparkleTrailOn || sparkles.length === 0) return;
    const timer = setTimeout(() => {
      setSparkles((prev) => prev.slice(1));
    }, 350);
    return () => clearTimeout(timer);
  }, [sparkles, sparkleTrailOn]);

  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
    if (!next) {
      soundEngine.playClickChime(1.15);
    }
  }, [isMuted]);

  const handleTriggerEasterEgg = useCallback(() => {
    setEasterEggFound(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pip_easter_egg_found', 'true');
    }
    soundEngine.playEasterEggMelody();
    try {
      confetti({
        particleCount: 70,
        spread: 68,
        origin: { y: 0.55 },
        colors: ['#A34063', '#FBBF24', '#F4C6D7', '#FFF8F1'],
      });
    } catch {
      // Fallback if canvas-confetti fails
    }
  }, []);

  // Secret keyboard listener ("milk" or "pip") when not typing in an input
  useEffect(() => {
    let buffer = '';
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key.length === 1) {
        buffer = (buffer + e.key.toLowerCase()).slice(-6);
        if (buffer.endsWith('milk') || buffer.endsWith('pip')) {
          buffer = '';
          handleTriggerEasterEgg();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTriggerEasterEgg]);

  const scrollToSection = (sectionId: SectionId, pitch = 1.05) => {
    soundEngine.playClickChime(pitch);
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const jumpToWorkshop = (tabId: WorkshopTabType) => {
    soundEngine.playClickChime(1.1);
    setActiveWorkshopTab(tabId);
    setActiveSection('workshop');
    const el = document.getElementById('workshop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const jumpToGuestbook = () => {
    soundEngine.playClickChime(1.1);
    setActiveSection('guestbook');
    const el = document.getElementById('guestbook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const retroCardFrame = retroMode
    ? 'border-2 border-[#3A2721] shadow-[4px_4px_0px_#A34063]'
    : '';

  return (
    <div
      id="top"
      className={`min-h-screen transition-colors duration-300 relative selection:bg-[#A34063] selection:text-white ${
        isNightMode
          ? 'bg-[#0B0E18] text-[#F8F5F0]'
          : 'bg-[#FFF8F1] text-[#3A2721]'
      } ${retroMode ? 'font-mono-tabular' : ''}`}
    >
      {/* Sparkle Cursor Trail Overlay */}
      {sparkleTrailOn && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
          {sparkles.map((sp) => (
            <span
              key={sp.id}
              style={{
                transform: `translate3d(${sp.x - 6}px, ${sp.y - 6}px, 0)`,
              }}
              className="fixed top-0 left-0 text-xs text-amber-400 opacity-80 transition-opacity duration-300 select-none"
            >
              {sp.symbol}
            </span>
          ))}
        </div>
      )}

      {/* Nightlight Torch Flashlight Overlay */}
      {torchEnabled && (
        <div
          className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-200"
          aria-hidden="true"
          style={{
            background: `radial-gradient(260px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(251, 191, 36, 0.14), rgba(8, 10, 20, 0.78) 85%)`,
          }}
        />
      )}

      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isNightMode
            ? 'bg-[#0B0E18]/90 border-[#222840]'
            : 'bg-[#FFF8F1]/90 border-[#EED6DF]'
        }`}
      >
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              soundEngine.playClickChime(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-lg font-bold tracking-tight font-display whitespace-nowrap shrink-0"
          >
            Pip · Midnight Nursery
          </a>

          {/* Zone 2: 5 concise single-line text navigation links with active scroll-spy */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id, item.pitch);
                  }}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#A34063] font-semibold underline underline-offset-4'
                      : 'opacity-80 hover:opacity-100 hover:underline underline-offset-4'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={jumpToGuestbook}
              className="px-4 py-2 text-xs font-medium text-white bg-[#A34063] rounded-lg hover:bg-[#8D3554] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Guestbook
            </button>
          </div>
        </div>

        {/* Mobile Quick-Jump Navigation Strip (< 768px) with Active Section Indicator */}
        <nav
          aria-label="Mobile Section Navigation"
          className="md:hidden border-t border-current/10 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto text-xs font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id, item.pitch);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#A34063] text-white font-semibold'
                    : 'opacity-80 hover:text-[#A34063]'
                }`}
              >
                {item.mobileLabel}
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => jumpToWorkshop('minigame')}
            className="px-2.5 py-1 rounded-md border border-[#A34063]/40 text-[#A34063] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            ★ Game
          </button>
        </nav>
      </header>

      <main className="max-w-[1240px] mx-auto px-6">
        {/* 90s WHIMSY MODE NOSTALGIC MARQUEE BANNER */}
        {retroMode && (
          <div className="mt-5 rounded-lg border-2 border-[#3A2721] bg-[#A34063] text-[#FFF8F1] py-1.5 px-3 overflow-hidden text-xs font-mono-tabular shadow-[3px_3px_0px_#3A2721]">
            <div className="animate-marquee">
              <span className="mx-6">
                ★ WELCOME TO PIP’S CYBER-NURSERY HOMEPAGE (EST. OCT 1999) · BEST VIEWED AT 800×600 & 1850K WARM AMBER · WIND THE 432HZ CELESTA · TAP MY PINK NIGHTCAP BOW 3X FOR A SECRET · DON’T FORGET TO SIGN MY DREAM GUESTBOOK! ★
              </span>
              <span className="mx-6" aria-hidden="true">
                ★ WELCOME TO PIP’S CYBER-NURSERY HOMEPAGE (EST. OCT 1999) · BEST VIEWED AT 800×600 & 1850K WARM AMBER · WIND THE 432HZ CELESTA · TAP MY PINK NIGHTCAP BOW 3X FOR A SECRET · DON’T FORGET TO SIGN MY DREAM GUESTBOOK! ★
              </span>
            </div>
          </div>
        )}

        {/* NURSERY ATMOSPHERE & SENSORY CONTROL STRIP */}
        <div
          className={`mt-6 p-3 sm:px-5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
            isNightMode
              ? 'bg-[#131726] border-[#262D47]'
              : 'bg-[#FFFDF9] border-[#EED6DF]'
          } ${retroMode ? 'border-2 border-dashed border-[#A34063]' : ''}`}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs opacity-85">
            <span className="font-medium text-[#A34063]">Midnight Nursery · Cloud-Crib District</span>
            <span aria-hidden="true">·</span>
            <span>
              {savedVisitorName
                ? `Welcome back, ${savedVisitorName} (Visit #${visitCount})`
                : visitCount > 1
                ? `Welcome back for Visit #${visitCount}`
                : 'Shift Hours: Dusk Bell to First Sparrow'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(isNightMode ? 1.2 : 0.85);
                setIsNightMode(!isNightMode);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isNightMode
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                  : 'bg-[#F8ECE7] border-[#E5C8D3] text-[#3A2721]'
              }`}
            >
              {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isNightMode ? 'Cozy Cream Day' : 'Midnight Slumber'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isMuted
                  ? 'border-rose-400/40 text-rose-400'
                  : 'border-current/15 hover:border-current/35'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Sound Muted' : 'Chimes On'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1.08);
                setSparkleTrailOn(!sparkleTrailOn);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sparkleTrailOn
                  ? 'border-[#A34063] text-[#A34063]'
                  : 'border-current/15 opacity-70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{sparkleTrailOn ? 'Sparkles On' : 'Sparkles Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1.15);
                setTorchEnabled(!torchEnabled);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                torchEnabled
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'border-current/15 opacity-80 hover:opacity-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{torchEnabled ? 'Torch On' : 'Nightlight Torch'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playPipGiggle();
                setRetroMode(!retroMode);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                retroMode
                  ? 'bg-[#A34063] text-white border-[#A34063]'
                  : 'border-current/15 opacity-80 hover:opacity-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{retroMode ? '90s DreamOS Active' : '90s Whimsy Mode'}</span>
            </button>
          </div>
        </div>

        {/* HERO SECTION: 2-Column Split + Full-Width Proof Row Below */}
        <section className="py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left 7 Cols: Editorial Hierarchy with Staggered Framer Motion Entrance */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.12,
                    delayChildren: 0.05,
                  },
                },
              }}
              className="lg:col-span-7 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-5">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="text-xs sm:text-sm font-medium text-[#A34063]"
                >
                  <span>Junior Dream Engineer</span>
                  <span className="mx-2" aria-hidden="true">·</span>
                  <span>Midnight Nursery Studio 04</span>
                  <span className="mx-2" aria-hidden="true">·</span>
                  <span>
                    {savedVisitorName
                      ? `Prepared for ${savedVisitorName}`
                      : 'Badge #004-PIP'}
                  </span>
                </motion.div>

                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.08]"
                  style={{ textWrap: 'balance' }}
                >
                  Hi, I’m Pip. I build cozy lullabies, porcelain nightlights, and gentle dreams.
                </motion.h1>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="text-base sm:text-lg opacity-85 leading-relaxed max-w-[64ch]"
                >
                  Welcome to my cloud cushion! I’m a friendly little skull baby with two warm amber eye-lights and a starry bedtime nightcap. Every evening at dusk, I wind my brass music box and deliver handcrafted dreams so no creature in the valley ever has to sleep in the dark.
                </motion.p>

                {easterEggFound && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                      isNightMode
                        ? 'bg-amber-500/10 border-amber-400/40 text-amber-200'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                      <Award className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>
                        <strong>Secret Unlocked:</strong> Honorary Midnight Milk & Starlight Inspector! You found Pip’s secret!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerEasterEgg}
                      className="text-xs font-semibold underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Chime Again
                    </button>
                  </motion.div>
                )}
              </div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="pt-2 flex flex-wrap items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => jumpToWorkshop('lullaby')}
                  className="px-6 py-3 rounded-xl bg-[#A34063] hover:bg-[#8D3554] text-white text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Play The Lullaby Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => jumpToWorkshop('minigame')}
                  className="px-5 py-3 rounded-xl border border-current/20 hover:border-[#A34063] text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-[#A34063]" />
                  <span>Play Dream Catcher</span>
                </button>

                <a
                  href="#inventions"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('inventions', 1.08);
                  }}
                  className="px-5 py-3 rounded-xl border border-current/15 hover:border-[#A34063] text-sm font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore 6 Inventions</span>
                  <ArrowUpRight className="w-4 h-4 text-[#A34063]" />
                </a>
              </motion.div>
            </motion.div>

            {/* Right 5 Cols: Interactive Eye-Tracking + 3D WebGL Pip Stage */}
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <InteractivePipAvatar
                isNightMode={isNightMode}
                onTriggerEasterEgg={handleTriggerEasterEgg}
                easterEggFound={easterEggFound}
                visitCount={visitCount}
              />
            </motion.div>
          </div>

          {/* Full-Width 4-Column Metric Proof Strip Below Hero Split */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl border transition-colors ${
              isNightMode
                ? 'bg-[#131726] border-[#262D47]'
                : 'bg-[#FFFDF9] border-[#EED6DF]'
            } ${retroCardFrame}`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono-tabular text-[#A34063]">
                28.5 in
              </div>
              <div className="text-xs font-semibold mt-1">Nursery Doorframe Height</div>
              <div className="text-xs opacity-70">+3.2 in with starry nightcap</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono-tabular text-[#A34063]">
                432 Hz
              </div>
              <div className="text-xs font-semibold mt-1">Brass Celesta Tuning</div>
              <div className="text-xs opacity-70">3 turns of the golden key</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono-tabular text-[#A34063]">
                1,850 K
              </div>
              <div className="text-xs font-semibold mt-1">Porcelain Lantern Warmth</div>
              <div className="text-xs opacity-70">Calibrated candle-amber glow</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono-tabular text-[#A34063]">
                99.4%
              </div>
              <div className="text-xs font-semibold mt-1">On-Time Slumber Rate</div>
              <div className="text-xs opacity-70">Delivered before Yawn #3</div>
            </div>
          </motion.div>
        </section>

        {/* PILLAR 01: WHAT PIP IS (CANON IDENTITY & STUDIO DOSSIER) */}
        <section id="identity" className="py-12 lg:py-16 border-t border-current/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          >
            <div>
              <div className="text-xs opacity-75">
                <span>01. Character Identity</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>What Pip Is</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-1 tracking-tight">
                Meet Pip: Junior Dream Engineer
              </h2>
            </div>
            <a
              href="/baby/pip.jpg"
              download="pip-reference-sketch.jpg"
              onClick={() => soundEngine.playClickChime(1.1)}
              className="text-xs font-medium text-[#A34063] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Studio Reference Sketch (.JPG)</span>
            </a>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`lg:col-span-5 rounded-2xl border p-6 flex flex-col justify-between ${
                isNightMode
                  ? 'bg-[#131726] border-[#262D47]'
                  : 'bg-[#FFFDF9] border-[#EED6DF]'
              } ${retroCardFrame}`}
            >
              <div>
                {retroMode && (
                  <div className="-mx-6 -mt-6 mb-4 px-3 py-1.5 rounded-t-xl bg-[#A34063] text-white text-[11px] font-mono-tabular flex items-center justify-between border-b-2 border-[#3A2721]">
                    <span>C:\NURSERY\PORTRAIT_VIEWER.BMP</span>
                    <span>[ _ ] [ □ ] [ × ]</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs opacity-75">
                  <span>Studio Portrait · Reference Sheet</span>
                  <span className="font-mono-tabular">ID: PIP-01</span>
                </div>
              </div>

              <div className="my-5 flex items-center justify-center">
                {!portraitError ? (
                  <img
                    src="/baby/assets/pip_portrait.png"
                    alt="Official full-body portrait of Pip holding a glowing crescent nightlight lantern"
                    referrerPolicy="no-referrer"
                    onError={() => setPortraitError(true)}
                    className="max-h-[300px] w-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="py-16 text-center">
                    <Heart className="w-10 h-10 mx-auto mb-2 text-[#A34063]" />
                    <span className="text-xs">Pip Character Portrait</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-2 text-xs opacity-80">
                <span>Press & Studio Cutouts:</span>
                <div className="flex items-center gap-3">
                  <a
                    href="/baby/assets/pip_avatar_cloud.png"
                    download="pip_avatar_cloud.png"
                    className="text-[#A34063] hover:underline font-medium"
                  >
                    Cloud PNG
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href="/baby/assets/pip_lullaby_box.png"
                    download="pip_lullaby_box.png"
                    className="text-[#A34063] hover:underline font-medium"
                  >
                    Music Box PNG
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href="/baby/assets/pip_dream_lantern.png"
                    download="pip_dream_lantern.png"
                    className="text-[#A34063] hover:underline font-medium"
                  >
                    Lantern PNG
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`lg:col-span-7 rounded-2xl border p-6 lg:p-8 flex flex-col justify-between ${
                isNightMode
                  ? 'bg-[#131726] border-[#262D47]'
                  : 'bg-[#FFFDF9] border-[#EED6DF]'
              } ${retroCardFrame}`}
            >
              <div className="space-y-4">
                {retroMode && (
                  <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-4 px-3 py-1.5 rounded-t-xl bg-[#A34063] text-white text-[11px] font-mono-tabular flex items-center justify-between border-b-2 border-[#3A2721]">
                    <span>C:\NURSERY\PIP_DOSSIER_1999.TXT</span>
                    <span>[ _ ] [ □ ] [ × ]</span>
                  </div>
                )}
                <h3 className="text-xl font-semibold tracking-tight">
                  “Cute, sleepy, and gentle—never spooky or scary.”
                </h3>
                <p className="text-sm opacity-85 leading-relaxed">
                  {PIP_CANON_PROFILE.whatPipIs} {PIP_CANON_PROFILE.personality}
                </p>

                <div className="pt-2 divide-y divide-current/10">
                  {PIP_CANON_PROFILE.traits.map((trait) => (
                    <div
                      key={trait.label}
                      className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm"
                    >
                      <dt className="sm:col-span-4 font-medium opacity-75">{trait.label}</dt>
                      <dd className="sm:col-span-8 font-semibold">{trait.value}</dd>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`mt-6 p-4 rounded-xl border transition-all ${
                  torchEnabled
                    ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                    : isNightMode
                    ? 'bg-[#0D101B] border-[#222840]'
                    : 'bg-[#FFF8F1] border-[#EED6DF]'
                }`}
              >
                <div className="text-xs font-mono-tabular text-[#A34063] font-semibold">
                  {torchEnabled
                    ? '★ NIGHTLIGHT TORCH REVEAL · SECRET BLUEPRINT NOTE'
                    : 'Nursery Margin Note (Turn on Nightlight Torch to illuminate)'}
                </div>
                <p className="text-xs mt-1 opacity-85">
                  {torchEnabled
                    ? 'Secret Recipe #09: Pip keeps an extra jar of warm starlight behind the 432 Hz celesta tines. Tap Pip’s pink bow 3 times in the hero stage (or type "milk" on your keyboard) to release the star confetti!'
                    : 'Pip’s pocket always holds three maple alphabet blocks, one brass winding key, and a crumpled napkin from Owl Post Bakery.'}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PILLAR 02: WHAT PIP DOES (DYNAMIC BENTO GRID OF 6 INVENTIONS WITH VISUAL ARTWORK) */}
        <section id="inventions" className="py-12 lg:py-16 border-t border-current/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          >
            <div>
              <div className="text-xs opacity-75">
                <span>02. Craft & Inventions</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>What Pip Does</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-1 tracking-tight">
                Selected Works from Midnight Nursery
              </h2>
            </div>
            <p className="text-xs sm:text-sm opacity-75 max-w-md">
              Click any invention card to inspect its studio blueprint in the lightbox or launch its interactive instrument below.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHOWCASE_PROJECTS.map((project, idx) => {
              const isWide = idx === 0 || idx === 3;
              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.55,
                    delay: idx * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => {
                    soundEngine.playClickChime(1 + idx * 0.06);
                    setLightboxProject(project);
                  }}
                  className={`${
                    isWide ? 'md:col-span-2' : 'md:col-span-1'
                  } group rounded-2xl border p-6 flex flex-col justify-between transition-all cursor-pointer ${
                    isNightMode
                      ? 'bg-[#131726] border-[#262D47] hover:border-[#A34063]'
                      : 'bg-[#FFFDF9] border-[#EED6DF] hover:border-[#A34063]'
                  } ${retroCardFrame}`}
                >
                  {retroMode && (
                    <div className="-mx-6 -mt-6 mb-4 px-3 py-1.5 rounded-t-xl bg-[#A34063] text-white text-[11px] font-mono-tabular flex items-center justify-between border-b-2 border-[#3A2721]">
                      <span>PIP_INVENTION_{project.index}.EXE</span>
                      <span>[ _ ] [ □ ] [ × ]</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className={isWide ? 'sm:col-span-7' : 'sm:col-span-12'}>
                      <div className="flex flex-wrap items-center gap-2 text-xs opacity-75">
                        <span className="font-mono-tabular font-semibold text-[#A34063]">
                          {project.index}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.year}</span>
                      </div>

                      <h3 className="text-xl font-semibold mt-2 tracking-tight group-hover:text-[#A34063] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm opacity-80 mt-2 leading-relaxed">
                        {project.summary}
                      </p>
                    </div>

                    <div
                      className={`${
                        isWide ? 'sm:col-span-5' : 'sm:col-span-12'
                      } rounded-xl border p-4 flex items-center justify-center h-40 overflow-hidden ${
                        isNightMode
                          ? 'bg-[#0B0E18] border-[#222840]'
                          : 'bg-[#FFF8F1] border-[#EED6DF]'
                      }`}
                    >
                      <img
                        src={project.image}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="max-h-32 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between gap-4">
                    <div className="text-xs font-mono-tabular opacity-75">
                      {project.specs[0].label}: {project.specs[0].value}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToWorkshop(project.interactiveTabId);
                      }}
                      className="text-xs font-semibold text-[#A34063] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Launch Interactive</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE NURSERY WORKSHOPS */}
        <section id="workshop" className="py-12 lg:py-16 border-t border-current/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8"
          >
            <div>
              <div className="text-xs opacity-75">
                <span>Interactive Sandbox</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Playable Nursery Instruments</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-1 tracking-tight">
                Pip’s Interactive Dream Engineering Lab
              </h2>
            </div>

            <div
              className={`flex flex-wrap items-center gap-1 p-1.5 rounded-xl ${
                isNightMode ? 'bg-[#131726]' : 'bg-[#F5E6EC]'
              } ${retroMode ? 'border-2 border-[#3A2721]' : ''}`}
            >
              {[
                { id: 'lullaby', label: '01. Lullaby Lab' },
                { id: 'nightlight', label: '02. Nightlights' },
                { id: 'routes', label: '03. Flight Map' },
                { id: 'toys', label: '04. Block Toybox' },
                { id: 'storybook', label: '05. Storybook' },
                { id: 'growth', label: '06. Growth Chart' },
                { id: 'minigame', label: '07. Dream Catcher & Cert' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClickChime(1.08);
                    setActiveWorkshopTab(tab.id as WorkshopTabType);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeWorkshopTab === tab.id
                      ? isNightMode
                        ? 'bg-[#A34063] text-white'
                        : 'bg-white text-[#3A2721] shadow-xs'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={retroMode ? 'rounded-2xl border-2 border-[#3A2721] shadow-[4px_4px_0px_#A34063] overflow-hidden' : ''}
          >
            {retroMode && (
              <div className="px-3.5 py-1.5 bg-[#A34063] text-white text-[11px] font-mono-tabular flex items-center justify-between border-b-2 border-[#3A2721]">
                <span>C:\NURSERY\DREAM_LAB_SYNTH_{activeWorkshopTab.toUpperCase()}.EXE</span>
                <span>[ _ ] [ □ ] [ × ]</span>
              </div>
            )}
            {activeWorkshopTab === 'lullaby' ? (
              <LullabyLab
                isNightMode={isNightMode}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onAttachToGuestbook={(melody) => {
                  setPendingMelody(melody);
                  jumpToGuestbook();
                }}
              />
            ) : activeWorkshopTab === 'minigame' ? (
              <DreamCatcherMiniGame isNightMode={isNightMode} />
            ) : (
              <InteractiveWorkshops
                activeTab={activeWorkshopTab}
                isNightMode={isNightMode}
                torchEnabled={torchEnabled}
                onToggleTorch={() => setTorchEnabled(!torchEnabled)}
              />
            )}
          </motion.div>
        </section>

        {/* PILLAR 03: WHAT PIP'S STORY IS */}
        <section id="story" className="py-12 lg:py-16 border-t border-current/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          >
            <div>
              <div className="text-xs opacity-75">
                <span>03. Origin & Bedtime Journey</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Four Illustrated Nocturnal Chapters</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-1 tracking-tight">
                How Pip Floated Down to Midnight Nursery
              </h2>
            </div>
            <div className="text-xs opacity-75">
              Scroll through the chapters or click the diorama stage to chime along
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={retroMode ? 'rounded-2xl border-2 border-[#3A2721] shadow-[4px_4px_0px_#A34063] p-4' : ''}
          >
            {retroMode && (
              <div className="-mx-4 -mt-4 mb-4 px-3.5 py-1.5 rounded-t-xl bg-[#A34063] text-white text-[11px] font-mono-tabular flex items-center justify-between border-b-2 border-[#3A2721]">
                <span>C:\NURSERY\BEDTIME_TALE_V1.DOC</span>
                <span>[ _ ] [ □ ] [ × ]</span>
              </div>
            )}
            <StoryJourney
              isNightMode={isNightMode}
              onJumpToGuestbook={jumpToGuestbook}
            />
          </motion.div>
        </section>

        {/* PILLAR 04: TALK TO PIP & LIVE DREAM GUESTBOOK */}
        <section id="guestbook" className="py-12 lg:py-16 border-t border-current/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          >
            <div>
              <div className="text-xs opacity-75">
                <span>04. Nursery Intercom & Community Wall</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Ask Pip a Question or Leave a Bedtime Wish</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-1 tracking-tight">
                Chat with Pip & Sign the Dream Guestbook
              </h2>
            </div>
            <div className="text-xs opacity-75">
              Leave a wish below—Pip packs every guestbook message into tonight’s cloud delivery!
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <PipChatAndGuestbook
              isNightMode={isNightMode}
              retroMode={retroMode}
              visitCount={visitCount}
              savedVisitorName={savedVisitorName}
              onUpdateVisitorName={handleUpdateVisitorName}
              onTriggerEasterEgg={handleTriggerEasterEgg}
              pendingMelody={pendingMelody}
              onClearPendingMelody={() => setPendingMelody(null)}
            />
          </motion.div>
        </section>
      </main>

      {/* QUIET EDITORIAL FOOTER WITH VINTAGE HIT COUNTER ODOMETER & 88x31 RETRO STAMPS */}
      <footer
        className={`mt-12 border-t py-10 transition-colors ${
          isNightMode
            ? 'bg-[#080A12] border-[#1E243B] text-[#F8F5F0]'
            : 'bg-[#F8EFE6] border-[#E5D0DA] text-[#3A2721]'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="font-display font-bold text-base">
              Pip · Junior Dream Engineer at Midnight Nursery
            </div>
            <p className="text-xs opacity-75">
              Studio 04, Cloud-Crib District · Built for haX.baby’s “Baby’s First Website”.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 font-mono-tabular text-[10px]">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPipGiggle();
                  setRetroMode(!retroMode);
                }}
                className="px-2 py-0.5 border border-[#A34063] bg-[#A34063] text-white font-bold cursor-pointer hover:opacity-90"
              >
                {retroMode ? '★ PIP_OS v1.99 ON' : '88×31 · PIP_OS v1.99'}
              </button>
              <button
                type="button"
                onClick={() => soundEngine.playMusicBoxNote(659.25, 0.8, 0.45)}
                className="px-2 py-0.5 border border-current/40 hover:border-[#A34063] cursor-pointer"
              >
                432HZ CELESTA READY
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickChime(1.15);
                  setTorchEnabled(!torchEnabled);
                }}
                className="px-2 py-0.5 border border-current/40 hover:border-[#A34063] cursor-pointer"
              >
                1850K NIGHTLIGHT SAFE
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xs opacity-75">Nursery Odometer:</span>
              <div
                className="inline-flex items-center gap-0.5 font-mono-tabular text-xs font-semibold"
                aria-label={`Visitor odometer count ${odometerValue}`}
              >
                {String(odometerValue)
                  .padStart(6, '0')
                  .split('')
                  .map((digit, i) => (
                    <span
                      key={i}
                      className={`w-6 h-7 rounded border flex items-center justify-center ${
                        isNightMode
                          ? 'bg-[#131726] border-[#2C3554] text-amber-300'
                          : 'bg-white border-[#D9BDC8] text-[#3A2721]'
                      }`}
                    >
                      {digit}
                    </span>
                  ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClickChime(1.1);
                setIsBriefModalOpen(true);
              }}
              className="text-xs font-medium text-[#A34063] hover:underline cursor-pointer whitespace-nowrap shrink-0"
            >
              Studio Dossier & Feature Index →
            </button>
          </div>
        </div>
      </footer>

      <ProjectDetailModal
        project={lightboxProject}
        onClose={() => setLightboxProject(null)}
        onLaunchWorkshop={jumpToWorkshop}
        isNightMode={isNightMode}
      />

      <BriefInspectorModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        isNightMode={isNightMode}
        easterEggFound={easterEggFound}
        onJumpToSection={(sectionId) => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
