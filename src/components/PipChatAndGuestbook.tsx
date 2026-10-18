import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageCircleHeart,
  BookHeart,
  Sparkles,
  UserCheck,
  Star,
  Play,
  X,
  Music,
} from 'lucide-react';
import {
  INITIAL_GUESTBOOK_WISHES,
  GuestbookWish,
  AttachedMelody,
} from '../data/pipCanon';
import { soundEngine } from '../utils/soundEngine';

interface PipChatAndGuestbookProps {
  isNightMode: boolean;
  retroMode?: boolean;
  visitCount: number;
  savedVisitorName: string;
  onUpdateVisitorName: (name: string) => void;
  onTriggerEasterEgg: () => void;
  pendingMelody?: AttachedMelody | null;
  onClearPendingMelody?: () => void;
}

interface ChatTurn {
  sender: 'pip' | 'visitor';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'How do you engineer a dream?',
  'Why do you have a skull face?',
  'Tell me a bedtime secret!',
  'What is your favorite lullaby?',
];

const CREATURE_TYPES = [
  'Cloud Bunny',
  'Sleepy Hedgehog',
  'Night-Owl',
  'Star-Kitten',
  'Porcelain Ghost',
  'Friendly Builder',
];

export const PipChatAndGuestbook: React.FC<PipChatAndGuestbookProps> = ({
  isNightMode,
  retroMode = false,
  visitCount,
  savedVisitorName,
  onUpdateVisitorName,
  onTriggerEasterEgg,
  pendingMelody,
  onClearPendingMelody,
}) => {
  const [messages, setMessages] = useState<ChatTurn[]>(() => [
    {
      sender: 'pip',
      text: savedVisitorName
        ? `“Hic—welcome back, ${savedVisitorName}! I remember you from visit #${visitCount}! I kept your cloud cushion fluffed and my 432 Hz music box wound up!”`
        : visitCount > 1
        ? `“Hic—hello again! This is your visit #${visitCount} to Midnight Nursery! Tell me your name above so I can write it on your cloud pillow!”`
        : '“Hello! I’m Pip, Junior Dream Engineer. I hate silence, so ask me anything about my dreams, porcelain lanterns, or lullabies below!”',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const [wishes, setWishes] = useState<GuestbookWish[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('pip_guestbook_wishes_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_GUESTBOOK_WISHES;
        }
      }
    }
    return INITIAL_GUESTBOOK_WISHES;
  });

  const [starCounts, setStarCounts] = useState<Record<string, number>>({
    'wish-1': 14,
    'wish-2': 9,
    'wish-3': 11,
  });
  const [playingWishId, setPlayingWishId] = useState<string | null>(null);
  const [playingStepIdx, setPlayingStepIdx] = useState<number>(-1);

  const [visitorName, setVisitorName] = useState(savedVisitorName || '');
  const [creatureType, setCreatureType] = useState(CREATURE_TYPES[0]);
  const [dreamWish, setDreamWish] = useState('');
  const [justSigned, setJustSigned] = useState(false);

  useEffect(() => {
    fetch('/api/guestbook')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.wishes) && data.wishes.length > 0) {
          setWishes(data.wishes);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pip_guestbook_wishes_v1', JSON.stringify(wishes));
    }
  }, [wishes]);

  const handlePlayAttachedMelody = (wishId: string, melody: AttachedMelody) => {
    if (playingWishId === wishId) return;
    setPlayingWishId(wishId);
    setPlayingStepIdx(0);
    const stepMs = Math.round((60 / (melody.bpm || 88) / 2) * 1000);
    melody.notes.forEach((freq, idx) => {
      setTimeout(() => {
        setPlayingStepIdx(idx);
        if (freq > 0) {
          soundEngine.playMusicBoxNote(freq, 0.9, 0.45);
        }
        if (idx === melody.notes.length - 1) {
          setTimeout(() => {
            setPlayingWishId(null);
            setPlayingStepIdx(-1);
          }, 420);
        }
      }, idx * stepMs);
    });
  };

  const handleSendChat = async (textToUse?: string) => {
    const query = (textToUse ?? chatInput).trim();
    if (!query || isThinking) return;

    soundEngine.playClickChime(1.1);
    const userTurn: ChatTurn = {
      sender: 'visitor',
      text: query,
      time: 'Now',
    };

    setMessages((prev) => [...prev.slice(-6), userTurn]);
    if (!textToUse) setChatInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/pip-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          visitorName: savedVisitorName || visitorName,
          visitCount,
          isNightMode,
        }),
      });
      const data = await res.json();
      const pipTurn: ChatTurn = {
        sender: 'pip',
        text:
          data?.reply ||
          '“Giggle! My brass music box just chimed a happy note for you!”',
        time: 'Now',
      };
      setMessages((prev) => [...prev, pipTurn]);
      soundEngine.playPipGiggle();
      if (query.toLowerCase().includes('secret')) {
        onTriggerEasterEgg();
      }
    } catch {
      const fallbackTurn: ChatTurn = {
        sender: 'pip',
        text: '“Hic—giggle! I wrote your question onto a golden star note and tucked it into my cloud parcel bag!”',
        time: 'Now',
      };
      setMessages((prev) => [...prev, fallbackTurn]);
      soundEngine.playPipGiggle();
    } finally {
      setIsThinking(false);
    }
  };

  const handleSignGuestbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !dreamWish.trim()) return;

    soundEngine.playEasterEggMelody();
    onUpdateVisitorName(visitorName.trim());

    const moodVal = isNightMode ? 'Starlight Indigo' : 'Cozy Cream';
    const optimisticEntry: GuestbookWish = {
      id: `wish-${Date.now()}`,
      visitorName: visitorName.trim(),
      creatureType,
      dreamWish: dreamWish.trim(),
      timestamp: 'Just now · Nursery Wall',
      mood: moodVal,
      ...(pendingMelody ? { attachedMelody: pendingMelody } : {}),
    };

    setWishes((prev) => [optimisticEntry, ...prev]);
    setDreamWish('');
    if (onClearPendingMelody) onClearPendingMelody();
    setJustSigned(true);
    setTimeout(() => setJustSigned(false), 3000);

    fetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorName: optimisticEntry.visitorName,
        creatureType: optimisticEntry.creatureType,
        dreamWish: optimisticEntry.dreamWish,
        mood: moodVal,
        attachedMelody: optimisticEntry.attachedMelody,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.wishes)) {
          setWishes(data.wishes);
        }
      })
      .catch(() => {});
  };

  const handleStarWish = (id: string, idx: number) => {
    soundEngine.playMusicBoxNote(587.33 + (idx % 4) * 110, 0.65, 0.45);
    setStarCounts((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 3) + 1,
    }));
  };

  const cardSurface = isNightMode
    ? 'bg-[#131726] border-[#262D47] text-[#F8F5F0]'
    : 'bg-[#FFFDF9] border-[#EED6DF] text-[#3A2721]';

  const subSurface = isNightMode
    ? 'bg-[#0D101B] border-[#222840]'
    : 'bg-[#FFF8F1] border-[#EED6DF]';

  const retroFrame = retroMode
    ? 'border-2 border-[#3A2721] shadow-[4px_4px_0px_#A34063]'
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Left 5 cols: Talk to Pip + Visitor Memory Tag */}
      <div
        className={`lg:col-span-5 rounded-2xl border p-6 flex flex-col justify-between ${cardSurface} ${retroFrame}`}
      >
        <div>
          {retroMode && (
            <div className="-mx-6 -mt-6 mb-4 px-3 py-1.5 rounded-t-xl bg-[#A34063] text-white text-[11px] font-mono-tabular flex items-center justify-between border-b-2 border-[#3A2721]">
              <span>C:\NURSERY\INTERCOM_CHAT.CGI</span>
              <span>[ _ ] [ □ ] [ × ]</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs opacity-75 mb-1">
            <span>Nursery Intercom · Studio 04</span>
            <span className="font-mono-tabular">Visit #{visitCount}</span>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <MessageCircleHeart className="w-5 h-5 text-[#A34063]" />
            <span>Talk to Pip</span>
          </h3>

          <div
            className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${subSurface}`}
          >
            <div className="flex items-center gap-2 min-w-0 w-full">
              <UserCheck className="w-4 h-4 text-[#A34063] shrink-0" />
              <span className="opacity-80 shrink-0">Your Name:</span>
              <input
                type="text"
                maxLength={24}
                value={savedVisitorName}
                onChange={(e) => {
                  onUpdateVisitorName(e.target.value);
                  setVisitorName(e.target.value);
                }}
                placeholder="Write your name on Pip's cloud tag..."
                className="bg-transparent border-b border-current/25 focus:border-[#A34063] outline-none text-xs font-semibold w-full truncate"
              />
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div
          className={`my-4 p-4 rounded-xl border space-y-3 max-h-[270px] overflow-y-auto ${subSurface}`}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl text-xs leading-relaxed ${
                m.sender === 'pip'
                  ? isNightMode
                    ? 'bg-[#1A2036] text-[#FDE68A] border border-[#2E385B]'
                    : 'bg-white text-[#3A2721] border border-[#EED6DF]'
                  : 'bg-[#A34063] text-white ml-6'
              }`}
            >
              <div className="font-semibold mb-1 opacity-80">
                {m.sender === 'pip' ? 'Pip · Junior Dream Engineer' : savedVisitorName || 'You'}
              </div>
              <p>{m.text}</p>
            </div>
          ))}
          {isThinking && (
            <div className="text-xs italic opacity-70 px-2">
              Pip is winding the brass music box and thinking…
            </div>
          )}
        </div>

        {/* Quick Prompt Buttons + Input */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendChat(prompt)}
                className="px-2.5 py-1 rounded-md border border-current/15 hover:border-[#A34063] text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Whisper a question to Pip..."
              className={`flex-1 px-3.5 py-2.5 rounded-lg border text-xs outline-none focus:border-[#A34063] ${subSurface}`}
            />
            <button
              type="submit"
              disabled={isThinking}
              className="px-4 py-2.5 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Pip</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right 7 cols: Live Dream Guestbook */}
      <div
        className={`lg:col-span-7 rounded-2xl border p-6 flex flex-col justify-between ${cardSurface} ${retroFrame}`}
      >
        <div>
          {retroMode && (
            <div className="-mx-6 -mt-6 mb-4 px-3 py-1.5 rounded-t-xl bg-[#A34063] text-white text-[11px] font-mono-tabular flex items-center justify-between border-b-2 border-[#3A2721]">
              <span>C:\NURSERY\GUESTBOOK_WALL.CGI</span>
              <span>[ _ ] [ □ ] [ × ]</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs opacity-75 mb-1">
            <span>Midnight Nursery Wall · Dream Dispatch</span>
            <span className="font-mono-tabular">{wishes.length} Wishes Pinned</span>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookHeart className="w-5 h-5 text-[#A34063]" />
            <span>Live Dream Guestbook</span>
          </h3>
          <p className="text-xs opacity-75 mt-1">
            Leave a bedtime wish or kind note for Pip. Every message is pinned to the nursery wall for tonight’s cloud flight.
          </p>

          {pendingMelody && (
            <div className="mt-3 px-3.5 py-2.5 rounded-xl border border-[#A34063]/40 bg-[#A34063]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 font-medium text-[#A34063]">
                <Music className="w-4 h-4 shrink-0" />
                <div>
                  <div>Attached Lullaby: {pendingMelody.label}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {pendingMelody.notes.map((freq, sIdx) => (
                      <span
                        key={sIdx}
                        className={`w-3.5 h-1.5 rounded-xs transition-all ${
                          playingWishId === 'pending-preview' && playingStepIdx === sIdx
                            ? 'bg-amber-400 scale-125'
                            : freq > 0
                            ? 'bg-[#A34063]'
                            : 'bg-current/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePlayAttachedMelody('pending-preview', pendingMelody)}
                  className="px-2.5 py-1 rounded-md bg-[#A34063] text-white font-medium inline-flex items-center gap-1 hover:bg-[#8D3554] transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>
                    {playingWishId === 'pending-preview' ? 'Chiming...' : 'Test Chime'}
                  </span>
                </button>
                {onClearPendingMelody && (
                  <button
                    type="button"
                    onClick={onClearPendingMelody}
                    aria-label="Remove attached lullaby"
                    className="p-1 hover:opacity-75 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSignGuestbook} className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              type="text"
              required
              maxLength={36}
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Your name or handle"
              className={`sm:col-span-4 px-3.5 py-2 rounded-lg border text-xs outline-none focus:border-[#A34063] ${subSurface}`}
            />
            <select
              value={creatureType}
              onChange={(e) => setCreatureType(e.target.value)}
              aria-label="Choose your sleepy creature persona"
              className={`sm:col-span-4 px-3 py-2 rounded-lg border text-xs outline-none focus:border-[#A34063] ${subSurface}`}
            >
              {CREATURE_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="sm:col-span-4 px-4 py-2 rounded-lg bg-[#A34063] hover:bg-[#8D3554] text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{justSigned ? 'Pinned to Wall!' : 'Pin Dream Wish'}</span>
            </button>
            <input
              type="text"
              required
              maxLength={140}
              value={dreamWish}
              onChange={(e) => setDreamWish(e.target.value)}
              placeholder="Write your dream request or bedtime message for Pip..."
              className={`sm:col-span-12 px-3.5 py-2.5 rounded-lg border text-xs outline-none focus:border-[#A34063] ${subSurface}`}
            />
          </form>
        </div>

        <div className="mt-5 pt-4 border-t border-current/10 space-y-2.5 max-h-[250px] overflow-y-auto">
          {wishes.map((w, idx) => {
            const count = starCounts[w.id] ?? 3;
            const isPlayingThis = playingWishId === w.id;
            return (
              <div
                key={w.id}
                className={`p-3.5 rounded-xl border transition-colors ${subSurface}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs opacity-75">
                  <div>
                    <span className="font-semibold opacity-100">{w.visitorName}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>{w.creatureType}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {w.attachedMelody && (
                      <button
                        type="button"
                        onClick={() => handlePlayAttachedMelody(w.id, w.attachedMelody!)}
                        className="px-2.5 py-0.5 rounded bg-[#A34063]/15 text-[#A34063] hover:bg-[#A34063] hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>
                          {isPlayingThis ? 'Chiming...' : w.attachedMelody.label}
                        </span>
                        <span className="inline-flex items-center gap-0.5 ml-1" aria-hidden="true">
                          {w.attachedMelody.notes.slice(0, 8).map((n, sIdx) => (
                            <span
                              key={sIdx}
                              className={`w-1 h-2 rounded-xs ${
                                isPlayingThis && playingStepIdx === sIdx
                                  ? 'bg-amber-400 scale-y-125'
                                  : n > 0
                                  ? 'bg-current opacity-85'
                                  : 'bg-current opacity-25'
                              }`}
                            />
                          ))}
                        </span>
                      </button>
                    )}
                    <span className="font-mono-tabular">{w.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleStarWish(w.id, idx)}
                      title="Send a warm starlight chime to this wish"
                      className="inline-flex items-center gap-1 text-amber-500 hover:underline font-mono-tabular font-semibold cursor-pointer"
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{count}</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm mt-1.5 leading-relaxed">“{w.dreamWish}”</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
