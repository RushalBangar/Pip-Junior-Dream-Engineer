import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Award,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface DreamCatcherMiniGameProps {
  isNightMode: boolean;
}

type GameState = 'title' | 'playing' | 'paused' | 'victory';

interface FallingEntity {
  id: number;
  x: number;
  baseX: number;
  y: number;
  vy: number;
  vx: number;
  phase: number;
  type: 'star' | 'milk' | 'note' | 'comet' | 'alarm';
  symbol: string;
  points: number;
  freq: number;
  windupTimer: number; // visible telegraph for hazards
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

const SCALE_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export const DreamCatcherMiniGame: React.FC<DreamCatcherMiniGameProps> = ({
  isNightMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('title');
  const [isFullscreenShell, setIsFullscreenShell] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isMuted);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(window.localStorage.getItem('pip_dream_catcher_hi') || '120');
    }
    return 120;
  });
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [combo, setCombo] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);

  // Custom Dream Parcel Certificate state
  const [recipientName, setRecipientName] = useState('Little Cloud Builder');
  const [dreamBase, setDreamBase] = useState('Cumulus Cushion Wool');
  const [dreamScent, setDreamScent] = useState('Warm Cinnamon Bun Steam');
  const [dreamMelody, setDreamMelody] = useState('432 Hz Cloud Nine Waltz');

  // Simulation mutable refs (zero React re-render inside 60fps loop)
  const gameStateRef = useRef<GameState>('title');
  const playerRef = useRef({
    x: 320,
    vx: 0,
    squashX: 1,
    squashY: 1,
    hitFlash: 0,
    dashCooldown: 0,
    dashActive: 0,
  });
  const heldKeysRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const entitiesRef = useRef<FallingEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<FloatingPopup[]>([]);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(45);
  const hitstopRef = useRef<number>(0);
  const shakeRef = useRef<number>(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const spawnParticleBurst = (x: number, y: number, color: string, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 60 + Math.random() * 140;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        color,
        size: 2.2 + Math.random() * 2.5,
      });
    }
  };

  const startNewGame = useCallback(() => {
    soundEngine.playClickChime(1.2);
    scoreRef.current = 0;
    comboRef.current = 0;
    timeLeftRef.current = 45;
    entitiesRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];
    hitstopRef.current = 0;
    shakeRef.current = 0;
    playerRef.current = {
      x: 320,
      vx: 0,
      squashX: 1.2,
      squashY: 0.82,
      hitFlash: 0,
      dashCooldown: 0,
      dashActive: 0,
    };
    setScore(0);
    setCombo(0);
    setTimeLeft(45);
    setWave(1);
    setGameState('playing');
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
    if (!next) soundEngine.playClickChime(1.15);
  };

  // Keyboard input & window blur handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        heldKeysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        heldKeysRef.current.right = true;
      }

      // Edge-triggered actions
      if ((e.key === 'Enter' || e.key === ' ') && gameStateRef.current === 'title') {
        e.preventDefault();
        startNewGame();
      } else if ((e.key === 'Enter' || e.key === ' ') && gameStateRef.current === 'victory') {
        e.preventDefault();
        startNewGame();
      } else if (e.key === ' ' && gameStateRef.current === 'playing' && !e.repeat) {
        e.preventDefault();
        // Cloud Puff Dash boost
        if (playerRef.current.dashCooldown <= 0) {
          playerRef.current.dashActive = 0.22;
          playerRef.current.dashCooldown = 1.1;
          playerRef.current.squashX = 1.35;
          playerRef.current.squashY = 0.72;
          soundEngine.playClickChime(1.35);
          spawnParticleBurst(playerRef.current.x, 300, '#FFF8F1', 10);
        }
      } else if (e.key === 'Escape') {
        if (gameStateRef.current === 'playing') {
          soundEngine.playClickChime(0.9);
          setGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          soundEngine.playClickChime(1.1);
          setGameState('playing');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        heldKeysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        heldKeysRef.current.right = false;
      }
    };

    const handleBlur = () => {
      heldKeysRef.current.left = false;
      heldKeysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [startNewGame]);

  // 1-second HUD clock sync while playing
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 15) setWave(3);
        else if (next <= 30) setWave(2);
        else setWave(1);

        if (next <= 0) {
          setGameState('victory');
          soundEngine.playEasterEggMelody();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Isolated 60fps simulation & render loop with clamped dt
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let prevTime = performance.now();
    let spawnAccumulator = 0;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      const rawDt = (now - prevTime) / 1000;
      prevTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamped frame delta

      const W = canvas.width;
      const H = canvas.height;
      const p = playerRef.current;

      // Hitstop freeze on heavy impact (30-60ms)
      if (hitstopRef.current > 0) {
        hitstopRef.current -= dt;
      } else if (gameStateRef.current === 'playing') {
        // Difficulty ramp based on remaining time
        const elapsedRatio = (45 - timeLeftRef.current) / 45;
        const spawnInterval = Math.max(0.28, 0.56 - elapsedRatio * 0.24);
        spawnAccumulator += dt;

        if (spawnAccumulator >= spawnInterval) {
          spawnAccumulator = 0;
          const roll = Math.random();
          let type: FallingEntity['type'] = 'star';
          let symbol = '★';
          let points = 10;
          let vy = 135 + Math.random() * 75 + elapsedRatio * 65;
          let windupTimer = 0;

          if (roll > 0.78) {
            type = 'alarm';
            symbol = '⏰';
            points = -20;
            vy = 185 + elapsedRatio * 80;
            windupTimer = 0.42; // 420ms visible telegraph at top lane before dropping
          } else if (roll > 0.68) {
            type = 'comet';
            symbol = '☄️';
            points = 35;
            vy = 210 + elapsedRatio * 60;
          } else if (roll > 0.48) {
            type = 'milk';
            symbol = '🍼';
            points = 25;
          } else if (roll > 0.25) {
            type = 'note';
            symbol = '♪';
            points = 15;
          }

          const spawnX = 48 + Math.random() * (W - 96);
          entitiesRef.current.push({
            id: now + Math.random(),
            x: spawnX,
            baseX: spawnX,
            y: type === 'alarm' ? 24 : -18,
            vy,
            vx: type === 'comet' ? (Math.random() > 0.5 ? 55 : -55) : 0,
            phase: Math.random() * Math.PI * 2,
            type,
            symbol,
            points,
            freq: SCALE_NOTES[Math.floor(Math.random() * SCALE_NOTES.length)],
            windupTimer,
          });
        }

        // Player movement with dash boost & squash-and-stretch recovery
        const dir =
          (heldKeysRef.current.right ? 1 : 0) - (heldKeysRef.current.left ? 1 : 0);
        const moveSpeed = p.dashActive > 0 ? 640 : 340;
        if (dir !== 0) {
          p.vx = dir * moveSpeed;
          p.x = Math.max(48, Math.min(W - 48, p.x + p.vx * dt));
        } else {
          p.vx *= 0.82;
        }

        if (p.dashActive > 0) p.dashActive -= dt;
        if (p.dashCooldown > 0) p.dashCooldown -= dt;
        if (p.hitFlash > 0) p.hitFlash -= dt;

        // Exponential spring return to (1, 1) scale
        p.squashX += (1 - p.squashX) * Math.min(1, dt * 14);
        p.squashY += (1 - p.squashY) * Math.min(1, dt * 14);

        // Update entities & collision detection
        const nextEntities: FallingEntity[] = [];
        const by = H - 38;

        for (const ent of entitiesRef.current) {
          if (ent.windupTimer > 0) {
            ent.windupTimer -= dt;
            nextEntities.push(ent);
            continue;
          }

          ent.y += ent.vy * dt;
          if (ent.type === 'note') {
            ent.x = ent.baseX + Math.sin(now * 0.005 + ent.phase) * 26;
          } else if (ent.type === 'comet') {
            ent.x += ent.vx * dt;
            if (ent.x < 36 || ent.x > W - 36) ent.vx *= -1;
          }

          const dx = Math.abs(ent.x - p.x);
          const dy = Math.abs(ent.y - by);

          if (dx < 48 && dy < 26) {
            if (ent.type === 'alarm') {
              // Hazard impact: 55ms hitstop + screen shake + red flash
              soundEngine.playWindKeyTick(1);
              hitstopRef.current = 0.055;
              shakeRef.current = 9;
              p.hitFlash = 0.28;
              p.squashX = 1.38;
              p.squashY = 0.68;
              comboRef.current = 0;
              setCombo(0);
              scoreRef.current = Math.max(0, scoreRef.current + ent.points);
              spawnParticleBurst(ent.x, by - 10, '#FB7185', 16);
              popupsRef.current.push({
                x: ent.x,
                y: by - 22,
                text: '-20 NOISY ALARM!',
                color: '#FB7185',
                alpha: 1,
              });
            } else {
              // Catch reward: musical chime + squash-and-stretch + particle burst
              soundEngine.playMusicBoxNote(ent.freq, 0.55, 0.45);
              if (ent.type === 'comet') {
                hitstopRef.current = 0.035;
                shakeRef.current = 4;
              }
              p.squashX = 0.84;
              p.squashY = 1.22;
              comboRef.current += 1;
              setCombo(comboRef.current);
              const gained = ent.points + Math.min(20, comboRef.current * 2);
              scoreRef.current += gained;
              spawnParticleBurst(
                ent.x,
                by - 10,
                ent.type === 'note' ? '#F4C6D7' : '#FBBF24',
                ent.type === 'comet' ? 20 : 12
              );
              popupsRef.current.push({
                x: ent.x,
                y: by - 20,
                text: `+${gained} ${ent.symbol}`,
                color: ent.type === 'comet' ? '#FEF08A' : '#FDE68A',
                alpha: 1,
              });
            }
            setScore(scoreRef.current);
            setHighScore((prevHi) => {
              const updated = Math.max(prevHi, scoreRef.current);
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('pip_dream_catcher_hi', String(updated));
              }
              return updated;
            });
          } else if (ent.y < H + 24) {
            nextEntities.push(ent);
          }
        }
        entitiesRef.current = nextEntities;
      } else if (gameStateRef.current === 'title') {
        // Gentle idle bob on title screen
        p.x = W / 2 + Math.sin(now * 0.0018) * 95;
      }

      // Update Particles
      const nextParticles: Particle[] = [];
      for (const pt of particlesRef.current) {
        pt.life += dt;
        if (pt.life < pt.maxLife) {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 240 * dt;
          nextParticles.push(pt);
        }
      }
      particlesRef.current = nextParticles;

      // Decay screen shake
      if (shakeRef.current > 0) {
        shakeRef.current = Math.max(0, shakeRef.current - dt * 28);
      }

      // --- RENDER PASS ---
      ctx.save();
      if (shakeRef.current > 0.2) {
        const sx = (Math.random() - 0.5) * shakeRef.current * 2;
        const sy = (Math.random() - 0.5) * shakeRef.current * 2;
        ctx.translate(sx, sy);
      }

      // Nocturnal sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0B0E1D');
      grad.addColorStop(0.65, '#1B1630');
      grad.addColorStop(1, '#2B1F3C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Distant crescent moon & twinkling stars
      ctx.fillStyle = 'rgba(253, 230, 138, 0.38)';
      for (let i = 0; i < 22; i++) {
        const sx = ((i * 97) % (W - 20)) + 10;
        const sy = ((i * 53) % (H - 70)) + 14;
        const r = (i % 2) + 1 + Math.sin(now * 0.003 + i) * 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.6, r), 0, Math.PI * 2);
        ctx.fill();
      }

      // Sleepy village rooftop silhouette along bottom edge
      ctx.fillStyle = 'rgba(10, 12, 22, 0.65)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H - 22);
      ctx.lineTo(55, H - 42);
      ctx.lineTo(115, H - 20);
      ctx.lineTo(190, H - 36);
      ctx.lineTo(260, H - 18);
      ctx.lineTo(350, H - 45);
      ctx.lineTo(430, H - 20);
      ctx.lineTo(520, H - 38);
      ctx.lineTo(W, H - 18);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Draw Falling Entities & Hazard Telegraphs
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const ent of entitiesRef.current) {
        if (ent.windupTimer > 0) {
          // Hazard windup warning telegraph
          ctx.save();
          ctx.strokeStyle = 'rgba(251, 113, 133, 0.55)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(ent.x, 28);
          ctx.lineTo(ent.x, H - 40);
          ctx.stroke();
          ctx.fillStyle = '#FB7185';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('! ALARM !', ent.x, 16);
          ctx.restore();
        }

        ctx.font =
          ent.type === 'star' || ent.type === 'note'
            ? 'bold 23px Georgia'
            : '21px sans-serif';
        ctx.fillStyle =
          ent.type === 'alarm'
            ? '#FB7185'
            : ent.type === 'note'
            ? '#F4C6D7'
            : ent.type === 'comet'
            ? '#FEF08A'
            : '#FBBF24';
        ctx.fillText(ent.symbol, ent.x, ent.y);
      }

      // Draw Particle Bursts
      for (const pt of particlesRef.current) {
        const alpha = 1 - pt.life / pt.maxLife;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Floating Popups
      const nextPopups: FloatingPopup[] = [];
      for (const pop of popupsRef.current) {
        pop.y -= 0.95;
        pop.alpha -= 0.024;
        if (pop.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, pop.alpha);
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = pop.color;
          ctx.fillText(pop.text, pop.x, pop.y);
          ctx.restore();
          nextPopups.push(pop);
        }
      }
      popupsRef.current = nextPopups;

      // Draw Pip's Cloud Catcher Basket with Squash-and-Stretch & Hit Flash
      const bx = p.x;
      const by = H - 36;
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(p.squashX, p.squashY);

      ctx.fillStyle = p.hitFlash > 0 ? '#FDA4AF' : '#FFF8F1';
      ctx.beginPath();
      ctx.arc(-25, 2, 16, 0, Math.PI * 2);
      ctx.arc(0, -5, 22, 0, Math.PI * 2);
      ctx.arc(25, 2, 16, 0, Math.PI * 2);
      ctx.fill();

      // Pip's starry nightcap tip peeking above cloud
      ctx.fillStyle = '#312E81';
      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.quadraticCurveTo(0, -36, 18, -22);
      ctx.closePath();
      ctx.fill();

      // Pink nightcap bow
      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(-11, -18, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Pip's two glowing amber eye pinpricks
      ctx.fillStyle = '#271C22';
      ctx.beginPath();
      ctx.arc(-7, -6, 4.8, 0, Math.PI * 2);
      ctx.arc(7, -6, 4.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(-7, -6, 2.3, 0, Math.PI * 2);
      ctx.arc(7, -6, 2.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameStateRef.current !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    playerRef.current.x = Math.max(48, Math.min(canvas.width - 48, x));
  };

  const handleDownloadCertificate = () => {
    soundEngine.playEasterEggMelody();
    const certCanvas = document.createElement('canvas');
    certCanvas.width = 880;
    certCanvas.height = 520;
    const c = certCanvas.getContext('2d');
    if (!c) return;

    c.fillStyle = '#FFF8F1';
    c.fillRect(0, 0, 880, 520);

    c.strokeStyle = '#A34063';
    c.lineWidth = 6;
    c.strokeRect(24, 24, 832, 472);
    c.strokeStyle = '#E8C5D2';
    c.lineWidth = 2;
    c.strokeRect(36, 36, 808, 448);

    c.fillStyle = '#A34063';
    c.font = 'bold 16px monospace';
    c.fillText('MIDNIGHT NURSERY · STUDIO 04 · OFFICIAL DREAM PARCEL DISPATCH', 64, 84);

    c.fillStyle = '#3A2721';
    c.font = 'bold 36px Georgia, serif';
    c.fillText('Certificate of Cozy Dream Engineering', 64, 138);

    c.font = '18px sans-serif';
    c.fillStyle = '#5C4033';
    c.fillText(`Prepared personally by Pip (Badge #004-PIP) for:`, 64, 190);

    c.font = 'bold 30px Georgia, serif';
    c.fillStyle = '#A34063';
    c.fillText(recipientName || 'Honorary Dreamer', 64, 232);

    c.font = '16px monospace';
    c.fillStyle = '#3A2721';
    c.fillText(`• Cloud Cushion Base : ${dreamBase}`, 64, 295);
    c.fillText(`• Aromatic Note      : ${dreamScent}`, 64, 330);
    c.fillText(`• Lullaby Calibration: ${dreamMelody}`, 64, 365);
    c.fillText(`• Dream Catcher Score: ${highScore} pts (Verified at 1850K Warm Amber)`, 64, 400);

    c.font = 'italic 16px Georgia, serif';
    c.fillStyle = '#A34063';
    c.fillText('Signed with a tiny crooked smile & pink nightcap bow — Pip ★', 64, 455);

    const link = document.createElement('a');
    link.download = `pip-dream-parcel-${(recipientName || 'dreamer')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}.png`;
    link.href = certCanvas.toDataURL('image/png');
    link.click();
  };

  const cardSurface = isNightMode
    ? 'bg-[#131726] border-[#262D47] text-[#F8F5F0]'
    : 'bg-[#FFFDF9] border-[#EED6DF] text-[#3A2721]';

  const subSurface = isNightMode
    ? 'bg-[#0D101B] border-[#222840]'
    : 'bg-[#FFF8F1] border-[#EED6DF]';

  const gameViewportNode = (
    <div
      className={
        isFullscreenShell
          ? 'fixed inset-0 z-50 bg-[#0B0E1D] text-[#FFF8F1] flex flex-col justify-between p-4 sm:p-6 select-none'
          : `lg:col-span-7 rounded-xl border p-5 flex flex-col justify-between ${subSurface}`
      }
    >
      {/* Low-Occlusion World-Matched Perimeter HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-current/10">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="text-xs opacity-75">
              <span>Midnight Nursery Arcade</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Wave 0{wave}</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              Starlight Dream Catcher
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tabular">
          <span>
            Score: <strong>{score}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Best: <strong>{highScore}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Combo: <strong>{combo}x</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Time: <strong>{timeLeft}s</strong>
          </span>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className="p-1.5 rounded-lg border border-current/20 hover:border-[#A34063] cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {gameState === 'playing' && (
            <button
              type="button"
              onClick={() => setGameState('paused')}
              aria-label="Pause game"
              className="p-1.5 rounded-lg border border-current/20 hover:border-[#A34063] cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundEngine.playClickChime(1.1);
              setIsFullscreenShell(!isFullscreenShell);
            }}
            className="px-2.5 py-1 rounded-lg border border-current/20 hover:border-[#A34063] inline-flex items-center gap-1 font-sans font-medium cursor-pointer"
          >
            {isFullscreenShell ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Full Shell</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Game Shell</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Isolated Canvas Mount + Title / Pause / Victory Shell Overlays (Zero backdrop-filter) */}
      <div className="my-4 relative flex-1 flex items-center justify-center rounded-xl overflow-hidden border border-white/10 bg-[#0B0E1D]">
        <canvas
          ref={canvasRef}
          width={640}
          height={340}
          onPointerMove={handleCanvasPointerMove}
          className="w-full h-full max-h-[68vh] object-contain block cursor-ew-resize touch-none"
        />

        {/* Title Screen Overlay with Bespoke Inline SVG Lockup */}
        {gameState === 'title' && (
          <div className="pointer-events-none absolute inset-0 bg-[#0B0E1D]/82 flex flex-col items-center justify-center p-6 text-center text-[#FFF8F1]">
            <svg
              viewBox="0 0 320 68"
              className="w-full max-w-[290px] h-auto mb-2"
              aria-hidden="true"
            >
              <path
                d="M36 16 A16 16 0 1 0 36 48 A12 12 0 1 1 36 16 Z"
                fill="#FBBF24"
              />
              <circle cx="284" cy="24" r="4" fill="#FDE68A" />
              <circle cx="268" cy="42" r="2.5" fill="#F4C6D7" />
              <text
                x="160"
                y="34"
                textAnchor="middle"
                fill="#FFF8F1"
                fontFamily="Fraunces, Georgia, serif"
                fontWeight="bold"
                fontSize="22"
              >
                STARLIGHT CATCHER
              </text>
              <text
                x="160"
                y="54"
                textAnchor="middle"
                fill="#FDE68A"
                fontFamily="JetBrains Mono, monospace"
                fontSize="10"
                letterSpacing="1.5"
              >
                PIP’S NIGHTLY CLOUD SHIFT
              </text>
            </svg>

            <p className="text-xs opacity-85 max-w-sm mb-4">
              Catch falling stars (★), lullaby notes (♪), warm milk (🍼), and comets (☄️). Dodge the telegraphing red alarm clocks (⏰)!
            </p>

            <button
              type="button"
              onClick={startNewGame}
              className="pointer-events-auto px-6 py-2.5 rounded-xl bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Shift (Enter / Space)</span>
            </button>

            <div className="mt-3 text-[11px] font-mono-tabular text-[#FDE68A]/85">
              A/D or ←/→ Move · Space Cloud-Dash · Esc Pause
            </div>
          </div>
        )}

        {/* Pause Modal */}
        {gameState === 'paused' && (
          <div className="pointer-events-none absolute inset-0 bg-[#0B0E1D]/88 flex flex-col items-center justify-center p-6 text-center text-[#FFF8F1]">
            <div className="text-xs font-mono-tabular text-[#FDE68A] mb-1">
              SHIFT PAUSED · WAVE 0{wave}
            </div>
            <h4 className="text-2xl font-semibold font-display mb-4">
              Pip’s Cloud Cushion is Resting
            </h4>
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickChime(1.1);
                  setGameState('playing');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Shift</span>
              </button>
              <button
                type="button"
                onClick={startNewGame}
                className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/50 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory / Shift Complete Modal */}
        {gameState === 'victory' && (
          <div className="pointer-events-none absolute inset-0 bg-[#0B0E1D]/88 flex flex-col items-center justify-center p-6 text-center text-[#FFF8F1]">
            <Award className="w-9 h-9 text-amber-400 mb-2" />
            <h4 className="text-2xl font-semibold font-display">
              Night Shift Complete! Score: {score} pts
            </h4>
            <p className="text-xs opacity-85 max-w-sm mt-1 mb-4">
              All dreams safely bottled before dawn! Personal Best: {highScore} pts. Export your official signed Dream Certificate on the right.
            </p>
            <button
              type="button"
              onClick={startNewGame}
              className="pointer-events-auto px-6 py-2.5 rounded-xl bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Another Shift (Enter / Space)</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs opacity-80">
        <span>Controls: Pointer, Touch, or A/D / ←/→ · Space to Dash · Esc Pause</span>
        <span className="font-mono-tabular">Hazard Telegraph: Red Lane Warning</span>
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl border p-6 lg:p-8 transition-colors ${cardSurface}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {gameViewportNode}

        {/* Right 5 Cols: Custom Dream Parcel Bottler & Certificate Exporter */}
        <div className={`lg:col-span-5 rounded-xl border p-5 flex flex-col justify-between ${subSurface}`}>
          <div>
            <div className="text-xs opacity-75 mb-1">
              <span>Souvenir Dispatch</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>PNG Canvas Export</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-[#A34063]" />
              <span>Custom Dream Parcel Bottler</span>
            </h3>
            <p className="text-xs opacity-80 mt-1 leading-relaxed">
              Mix your own custom bedtime dream recipe and download an official Midnight Nursery certificate signed by Pip.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 opacity-80">Recipient Name</label>
                <input
                  type="text"
                  maxLength={32}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-xs outline-none focus:border-[#A34063]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 opacity-80">Cloud Cushion Base</label>
                <select
                  value={dreamBase}
                  onChange={(e) => setDreamBase(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border border-current/20 text-xs outline-none ${subSurface}`}
                >
                  <option value="Cumulus Cushion Wool">Cumulus Cushion Wool</option>
                  <option value="Starlight Flannel Quilt">Starlight Flannel Quilt</option>
                  <option value="Velvet Dusk Featherbed">Velvet Dusk Featherbed</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 opacity-80">Aromatic Bedtime Note</label>
                <select
                  value={dreamScent}
                  onChange={(e) => setDreamScent(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border border-current/20 text-xs outline-none ${subSurface}`}
                >
                  <option value="Warm Cinnamon Bun Steam">Warm Cinnamon Bun Steam (Owl Bakery)</option>
                  <option value="Chamomile & Honey Milk">Chamomile & Honey Milk</option>
                  <option value="Pine Needles & Autumn Rain">Pine Needles & Autumn Rain</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 opacity-80">Harmonic Lullaby Tuning</label>
                <select
                  value={dreamMelody}
                  onChange={(e) => setDreamMelody(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border border-current/20 text-xs outline-none ${subSurface}`}
                >
                  <option value="432 Hz Cloud Nine Waltz">432 Hz Cloud Nine Waltz</option>
                  <option value="Starlight Honey Milk (76 BPM)">Starlight Honey Milk (76 BPM)</option>
                  <option value="Cribside Nocturne in C Major">Cribside Nocturne in C Major</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-5 border-t border-current/10">
            <button
              type="button"
              onClick={handleDownloadCertificate}
              className="w-full py-2.5 px-4 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Dream Certificate (.PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
