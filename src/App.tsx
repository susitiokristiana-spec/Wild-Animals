import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  HelpCircle,
  Play,
  RotateCcw,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AnimalId,
  ENCOURAGE_RETRY_LIST,
  PRAISE_SHORT_LIST,
  WILD_ANIMALS,
  WildAnimal,
} from './data/animals';
import { AnimalArtwork } from './components/AnimalArtwork';
import { CelebrationBurst } from './components/CelebrationBurst';
import { RealAnimalPhoto } from './components/RealAnimalPhoto';
import { RealPhotoQuizGame } from './components/RealPhotoQuizGame';
import { RealPhotoMemoryGame } from './components/RealPhotoMemoryGame';
import {
  playCorrectSound,
  playHintSound,
  playSelectSound,
  playTapSound,
  playTryAgainSound,
  playVictorySound,
  setAudioSettings,
  speakFriendly,
  stopAllSpeech,
} from './utils/audio';

type GameView =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'ROUND_SUMMARY'
  | 'PHOTO_QUIZ'
  | 'PHOTO_MEMORY'
  | 'ENCYCLOPEDIA';
type DifficultyLevel = 3 | 4 | 5;
type EncyclopediaMode = 'real' | 'illustration' | 'shadow';

const HERO_IMAGE_PATH = '/src/assets/images/jungle_hero_backdrop_1794893752105.jpg';
const VICTORY_IMAGE_PATH = '/src/assets/images/victory_safari_celebration_1794893752325.jpg';
const TOTAL_ROUNDS = 3;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface DragState {
  animalId: AnimalId;
  x: number;
  y: number;
  startX: number;
  startY: number;
  isDragging: boolean;
  hoveredShadowId: AnimalId | null;
}

export default function App() {
  const [view, setView] = useState<GameView>('TITLE_MENU');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [soundOn, setSoundOn] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [victoryImgFailed, setVictoryImgFailed] = useState(false);

  // Round & match state
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalStars, setTotalStars] = useState(0);
  const [roundAnimals, setRoundAnimals] = useState<WildAnimal[]>([]);
  const [shadowOrder, setShadowOrder] = useState<WildAnimal[]>([]);
  const [matchedIds, setMatchedIds] = useState<AnimalId[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<AnimalId | null>(null);
  const [selectedShadowId, setSelectedShadowId] = useState<AnimalId | null>(null);
  const [hintPairId, setHintPairId] = useState<AnimalId | null>(null);
  const [wrongShadowId, setWrongShadowId] = useState<AnimalId | null>(null);
  const [burstMap, setBurstMap] = useState<Partial<Record<AnimalId, number>>>({});

  // Child-friendly praise & feedback banner
  const [feedback, setFeedback] = useState<{
    tone: 'neutral' | 'praise' | 'encourage' | 'hint';
    title: string;
    message: string;
  }>({
    tone: 'neutral',
    title: 'Ayo Bermain!',
    message: 'Pilih atau seret gambar binatang buas ke bayangannya yang cocok.',
  });

  // Encyclopedia interactive toggle
  const [encyclopediaMode, setEncyclopediaMode] =
    useState<EncyclopediaMode>('real');
  const [activeEncyclopediaId, setActiveEncyclopediaId] =
    useState<AnimalId | null>(null);

  // Pointer drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const roundAdvanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setAudioSettings({ sfx: soundOn, voice: soundOn });
  }, [soundOn]);

  useEffect(() => {
    return () => {
      if (roundAdvanceTimerRef.current) {
        window.clearTimeout(roundAdvanceTimerRef.current);
      }
      stopAllSpeech();
    };
  }, []);

  const clearPendingTimers = useCallback(() => {
    if (roundAdvanceTimerRef.current) {
      window.clearTimeout(roundAdvanceTimerRef.current);
      roundAdvanceTimerRef.current = null;
    }
  }, []);

  const setupRound = useCallback(
    (count: DifficultyLevel, nextRound: number, announce = true) => {
      clearPendingTimers();
      const chosen = shuffleArray(WILD_ANIMALS).slice(0, count);
      // Ensure shadow order is shuffled differently from animal order when possible
      let shuffledShadows = shuffleArray(chosen);
      if (
        chosen.length > 1 &&
        shuffledShadows.every((item, idx) => item.id === chosen[idx].id)
      ) {
        shuffledShadows = [...shuffledShadows.slice(1), shuffledShadows[0]];
      }

      setRoundAnimals(chosen);
      setShadowOrder(shuffledShadows);
      setMatchedIds([]);
      setSelectedAnimalId(null);
      setSelectedShadowId(null);
      setHintPairId(null);
      setWrongShadowId(null);
      setBurstMap({});
      setRoundNumber(nextRound);
      setFeedback({
        tone: 'neutral',
        title: `Babak ${nextRound} · Ayo Cocokkan!`,
        message: 'Ketuk atau seret binatang buas ke bayangan yang bentuknya sama ya!',
      });

      if (announce) {
        speakFriendly(
          `Babak ${nextRound}! Ayo cocokkan gambar binatang buas dengan bayangannya!`
        );
      }
    },
    [clearPendingTimers]
  );

  const startNewGame = useCallback(
    (customDifficulty?: DifficultyLevel) => {
      const level = customDifficulty ?? difficulty;
      playTapSound();
      setTotalStars(0);
      setupRound(level, 1, true);
      setView('PLAYING');
    },
    [difficulty, setupRound]
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setAudioSettings({ sfx: next, voice: next });
    if (next) {
      playTapSound();
      speakFriendly('Suara sudah aktif! Ayo bermain bersama!');
    }
  };

  const evaluateMatch = useCallback(
    (animalId: AnimalId, shadowId: AnimalId) => {
      if (matchedIds.includes(animalId) || matchedIds.includes(shadowId)) return;

      const animal = WILD_ANIMALS.find((a) => a.id === animalId);
      if (!animal) return;

      if (animalId === shadowId) {
        // Correct match!
        const nextMatched = [...matchedIds, animalId];
        setMatchedIds(nextMatched);
        setSelectedAnimalId(null);
        setSelectedShadowId(null);
        setHintPairId(null);
        setWrongShadowId(null);
        setTotalStars((prev) => prev + 1);
        setBurstMap((prev) => ({
          ...prev,
          [shadowId]: (prev[shadowId] ?? 0) + 1,
        }));

        playCorrectSound();

        const shortPraise =
          PRAISE_SHORT_LIST[Math.floor(Math.random() * PRAISE_SHORT_LIST.length)];
        setFeedback({
          tone: 'praise',
          title: `${shortPraise} Itu ${animal.name}!`,
          message: `${animal.praiseLine} (${animal.soundWord})`,
        });

        const isRoundComplete = nextMatched.length === roundAnimals.length;

        if (isRoundComplete) {
          speakFriendly(`${shortPraise} Itu ${animal.name}! Hore, semua cocok!`);
          roundAdvanceTimerRef.current = window.setTimeout(() => {
            playVictorySound();
            setView('ROUND_SUMMARY');
            speakFriendly(
              roundNumber >= TOTAL_ROUNDS
                ? 'Horeee! Kamu juara Sahabat Rimba! Semua babak selesai dengan hebat!'
                : `Yeay! Babak ${roundNumber} selesai! Kamu anak pintar dan hebat sekali!`
            );
          }, 1250);
        } else {
          speakFriendly(animal.praiseLine);
        }
      } else {
        // Gentle encouragement on mismatch
        playTryAgainSound();
        setSelectedAnimalId(null);
        setSelectedShadowId(null);
        setWrongShadowId(shadowId);

        const retryLine =
          ENCOURAGE_RETRY_LIST[
            Math.floor(Math.random() * ENCOURAGE_RETRY_LIST.length)
          ];
        setFeedback({
          tone: 'encourage',
          title: 'Hampir tepat, coba lagi yuk!',
          message: retryLine,
        });
        speakFriendly(retryLine);

        window.setTimeout(() => {
          setWrongShadowId((current) => (current === shadowId ? null : current));
        }, 480);
      }
    },
    [matchedIds, roundAnimals.length, roundNumber]
  );

  const handleSelectAnimal = (animal: WildAnimal) => {
    if (matchedIds.includes(animal.id)) return;
    playSelectSound();

    if (selectedShadowId) {
      evaluateMatch(animal.id, selectedShadowId);
      return;
    }

    const nextSelected = selectedAnimalId === animal.id ? null : animal.id;
    setSelectedAnimalId(nextSelected);
    if (nextSelected) {
      setFeedback({
        tone: 'neutral',
        title: `Kamu memilih ${animal.name}!`,
        message: `Sekarang ketuk bayangan ${animal.name} di sebelah kanan ya.`,
      });
      speakFriendly(`Ini ${animal.name}! ${animal.soundWord} Cari bayangannya ya!`);
    }
  };

  const handleSelectShadow = (shadowAnimal: WildAnimal) => {
    if (matchedIds.includes(shadowAnimal.id)) {
      // Allow tapping an already-matched animal to hear its sound again!
      playTapSound();
      speakFriendly(`${shadowAnimal.name}! ${shadowAnimal.soundWord}`);
      return;
    }

    if (selectedAnimalId) {
      evaluateMatch(selectedAnimalId, shadowAnimal.id);
      return;
    }

    playSelectSound();
    const nextShadow =
      selectedShadowId === shadowAnimal.id ? null : shadowAnimal.id;
    setSelectedShadowId(nextShadow);
    if (nextShadow) {
      setFeedback({
        tone: 'neutral',
        title: 'Bayangan dipilih!',
        message: 'Sekarang ketuk gambar binatang buas yang bentuknya sama ya.',
      });
      speakFriendly('Bayangan dipilih! Mana gambar binatang yang cocok?');
    }
  };

  const handleHint = () => {
    const remaining = roundAnimals.filter((a) => !matchedIds.includes(a.id));
    if (remaining.length === 0) return;
    const target = remaining[0];
    setHintPairId(target.id);
    setSelectedAnimalId(target.id);
    setSelectedShadowId(null);
    playHintSound();
    setFeedback({
      tone: 'hint',
      title: `Petunjuk untuk ${target.name}`,
      message: target.shadowClue,
    });
    speakFriendly(`Petunjuk! ${target.shadowClue}`);
  };

  // Pointer-based drag & drop (works smoothly on both desktop mouse and touch)
  const handleAnimalPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    animal: WildAnimal
  ) => {
    if (matchedIds.includes(animal.id)) return;
    // Ignore clicks on the dedicated speaker icon button inside the card
    if ((e.target as HTMLElement).closest('[data-speaker-btn="true"]')) return;

    setDragState({
      animalId: animal.id,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
      hoveredShadowId: null,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const distance = Math.hypot(dx, dy);

      if (!dragState.isDragging && distance < 10) return;

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const shadowEl = elements.find((el) => el.hasAttribute('data-shadow-id'));
      const hoveredId = shadowEl
        ? (shadowEl.getAttribute('data-shadow-id') as AnimalId)
        : null;

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              x: e.clientX,
              y: e.clientY,
              isDragging: true,
              hoveredShadowId: hoveredId,
            }
          : null
      );
    };

    const handlePointerUp = () => {
      if (dragState.isDragging) {
        if (dragState.hoveredShadowId) {
          evaluateMatch(dragState.animalId, dragState.hoveredShadowId);
        }
      } else {
        const animal = WILD_ANIMALS.find((a) => a.id === dragState.animalId);
        if (animal) {
          handleSelectAnimal(animal);
        }
      }
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  });

  const draggedAnimal = useMemo(
    () =>
      dragState?.isDragging
        ? WILD_ANIMALS.find((a) => a.id === dragState.animalId) ?? null
        : null,
    [dragState]
  );

  const goToView = (targetView: GameView) => {
    playTapSound();
    if (targetView === 'PLAYING' && roundAnimals.length === 0) {
      setupRound(difficulty, 1, true);
    }
    setView(targetView);
  };

  const handleNextRound = () => {
    playTapSound();
    if (roundNumber >= TOTAL_ROUNDS) {
      startNewGame(difficulty);
    } else {
      setupRound(difficulty, roundNumber + 1, true);
      setView('PLAYING');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F3] text-[#1A2E22] selection:bg-amber-200">
      {/* Top Bar Contract: Single row, 3 distinct zones */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#DCE5D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => goToView('TITLE_MENU')}
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#14532D] hover:text-[#15803D] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded-lg"
          >
            Sahabat Rimba
          </button>

          {/* Zone 2: Clean single-line nav links (5 concise items) */}
          <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-base font-medium overflow-x-auto">
            <button
              type="button"
              onClick={() => goToView('TITLE_MENU')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                view === 'TITLE_MENU'
                  ? 'border-amber-500 text-[#14532D] font-semibold'
                  : 'border-transparent text-[#4B5E52] hover:text-[#14532D]'
              }`}
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => goToView('PLAYING')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                view === 'PLAYING' || view === 'ROUND_SUMMARY'
                  ? 'border-amber-500 text-[#14532D] font-semibold'
                  : 'border-transparent text-[#4B5E52] hover:text-[#14532D]'
              }`}
            >
              Tebak Bayangan
            </button>
            <button
              type="button"
              onClick={() => goToView('PHOTO_QUIZ')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                view === 'PHOTO_QUIZ'
                  ? 'border-amber-500 text-[#14532D] font-semibold'
                  : 'border-transparent text-[#4B5E52] hover:text-[#14532D]'
              }`}
            >
              Tebak Suara
            </button>
            <button
              type="button"
              onClick={() => goToView('PHOTO_MEMORY')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                view === 'PHOTO_MEMORY'
                  ? 'border-amber-500 text-[#14532D] font-semibold'
                  : 'border-transparent text-[#4B5E52] hover:text-[#14532D]'
              }`}
            >
              Memori Foto
            </button>
            <button
              type="button"
              onClick={() => goToView('ENCYCLOPEDIA')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                view === 'ENCYCLOPEDIA'
                  ? 'border-amber-500 text-[#14532D] font-semibold'
                  : 'border-transparent text-[#4B5E52] hover:text-[#14532D]'
              }`}
            >
              Kenal Hewan
            </button>
          </nav>

          {/* Zone 3: Single Primary Audio Action */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? 'Matikan suara' : 'Aktifkan suara'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
              soundOn
                ? 'bg-[#15803D] text-white hover:bg-[#166534]'
                : 'bg-[#E5ECE0] text-[#374B3F] hover:bg-[#D7E2CF]'
            }`}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {soundOn ? 'Suara Aktif' : 'Suara Mati'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'TITLE_MENU' && (
          <section className="space-y-8">
            {/* Hero Storybook Card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#DCE5D5] bg-white shadow-sm">
              <div className="grid lg:grid-cols-12 items-stretch">
                {/* Left Copy & Level Controls */}
                <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-[#4B5E52]">
                      Permainan TK B · Tema Binatang Buas (Foto Asli)
                    </p>
                    <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-[#14532D] text-balance">
                      Ayo Cocokkan Foto Asli dengan Bayangannya!
                    </h1>
                    <p className="text-base sm:text-lg text-[#3E5245] leading-relaxed max-w-xl">
                      Kenali 8 sahabat binatang buas lewat foto nyata, dengarkan suara ramah mereka, dan pasangkan setiap foto ke bayangan yang tepat untuk mengumpulkan bintang.
                    </p>
                  </div>

                  {/* Difficulty Selector */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#1A2E22]">
                      Pilih Jumlah Hewan per Babak:
                    </p>
                    <div className="inline-flex flex-wrap gap-2 p-1.5 bg-[#EFF4EA] rounded-2xl border border-[#DCE5D5]">
                      {(
                        [
                          { val: 3, label: '3 Hewan · Mudah' },
                          { val: 4, label: '4 Hewan · Seru' },
                          { val: 5, label: '5 Hewan · Jagoan' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            playTapSound();
                            setDifficulty(opt.val);
                            speakFriendly(`Mode ${opt.label} dipilih!`);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            difficulty === opt.val
                              ? 'bg-white text-[#14532D] shadow-sm'
                              : 'text-[#4B5E52] hover:text-[#14532D]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Action */}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => startNewGame(difficulty)}
                      className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-[#1A2E22] font-display text-xl font-bold shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                    >
                      <Play className="w-6 h-6 fill-current" />
                      Mulai Bermain
                    </button>
                    <button
                      type="button"
                      onClick={() => goToView('ENCYCLOPEDIA')}
                      className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#EFF4EA] hover:bg-[#E2ECDA] text-[#14532D] font-semibold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Kenalan Dulu Yuk
                    </button>
                  </div>
                </div>

                {/* Right Storybook Backdrop with Real Wildlife Photo Previews */}
                <div className="lg:col-span-6 relative min-h-[280px] sm:min-h-[360px] bg-[#E8F1E2]">
                  {!heroImgFailed ? (
                    <img
                      src={HERO_IMAGE_PATH}
                      alt="Ilustrasi hutan rimba cerah tempat tinggal binatang buas"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-lime-50 to-amber-100" />
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#14331F]/70 via-[#14331F]/15 to-transparent"
                    aria-hidden="true"
                  />
                  {/* Real animal photo trio on top of backdrop */}
                  <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-3 pointer-events-none">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/90 shadow-md">
                      <RealAnimalPhoto animal={WILD_ANIMALS[0]} className="w-full h-full" />
                    </div>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/90 shadow-md">
                      <RealAnimalPhoto animal={WILD_ANIMALS[1]} className="w-full h-full" />
                    </div>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/90 shadow-md">
                      <RealAnimalPhoto animal={WILD_ANIMALS[2]} className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Real-Photo Games Showcase */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14532D]">
                  Permainan Lain dengan Foto Nyata
                </h2>
                <p className="text-sm text-[#4B5E52]">
                  Menggunakan foto asli binatang buas di alam bebas
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Game 2: Tebak Suara & Foto Nyata */}
                <div className="bg-white rounded-3xl border border-[#DCE5D5] overflow-hidden flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-1.5 p-3 bg-[#EFF4EA]">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <RealAnimalPhoto animal={WILD_ANIMALS[0]} className="w-full h-full" />
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <RealAnimalPhoto animal={WILD_ANIMALS[1]} className="w-full h-full" />
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <RealAnimalPhoto animal={WILD_ANIMALS[6]} className="w-full h-full" />
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#15803D]">
                        Kuis Suara & Foto Asli · 5 Soal
                      </p>
                      <h3 className="font-display text-2xl font-bold text-[#14532D]">
                        Tebak Suara Binatang Buas
                      </h3>
                      <p className="text-sm sm:text-base text-[#4B5E52] leading-relaxed">
                        Dengarkan suara dan ciri-ciri hewan yang dibacakan dengan ramah, lalu pilih foto nyata binatang yang tepat.
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => goToView('PHOTO_QUIZ')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-display text-base font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Main Tebak Suara
                      </button>
                    </div>
                  </div>
                </div>

                {/* Game 3: Memori Balik Kartu Foto Nyata */}
                <div className="bg-white rounded-3xl border border-[#DCE5D5] overflow-hidden flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-1.5 p-3 bg-[#EFF4EA]">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <RealAnimalPhoto animal={WILD_ANIMALS[2]} className="w-full h-full" />
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <RealAnimalPhoto animal={WILD_ANIMALS[3]} className="w-full h-full" />
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <RealAnimalPhoto animal={WILD_ANIMALS[7]} className="w-full h-full" />
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#15803D]">
                        Latih Daya Ingat · 6 sampai 12 Kartu
                      </p>
                      <h3 className="font-display text-2xl font-bold text-[#14532D]">
                        Memori Pasangan Foto Nyata
                      </h3>
                      <p className="text-sm sm:text-base text-[#4B5E52] leading-relaxed">
                        Buka kartu satu per satu untuk melihat foto nyata binatang buas dan temukan dua kartu yang kembar.
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => goToView('PHOTO_MEMORY')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#1A2E22] font-display text-base font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Main Memori Foto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Simple Steps for Kids & Parents */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-[#DCE5D5] p-6 space-y-2">
                <p className="font-display text-lg font-bold text-[#14532D]">
                  1. Pilih atau Seret Hewan
                </p>
                <p className="text-sm sm:text-base text-[#4B5E52] leading-relaxed">
                  Ketuk kartu binatang buas atau seret langsung dengan mouse maupun jari ke arah bayangannya.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#DCE5D5] p-6 space-y-2">
                <p className="font-display text-lg font-bold text-[#14532D]">
                  2. Cocokkan Bayangan & Foto
                </p>
                <p className="text-sm sm:text-base text-[#4B5E52] leading-relaxed">
                  Latih ketelitian lewat bentuk bayangan dan kenali rupa asli binatang buas melalui foto nyata.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#DCE5D5] p-6 space-y-2">
                <p className="font-display text-lg font-bold text-[#14532D]">
                  3. Dapat Pujian & Bintang
                </p>
                <p className="text-sm sm:text-base text-[#4B5E52] leading-relaxed">
                  Setiap jawaban benar langsung mendapat musik ceria, suara pujian ramah anak, dan bintang emas.
                </p>
              </div>
            </div>
          </section>
        )}

        {view === 'PLAYING' && (
          <section className="space-y-6">
            {/* Unobtrusive Top HUD */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-semibold text-[#3E5245] tabular-nums">
                <span className="font-display text-lg sm:text-xl text-[#14532D]">
                  Babak {roundNumber} dari {TOTAL_ROUNDS}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Cocok {matchedIds.length}/{roundAnimals.length}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 text-amber-700">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  {totalStars} Bintang
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleHint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#78350F] font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  Beri Petunjuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setupRound(difficulty, roundNumber, true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCE5D5] hover:bg-[#EFF4EA] text-[#1A2E22] font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Acak Ulang
                </button>
              </div>
            </div>

            {/* Child-Friendly Appreciation & Guidance Banner */}
            <div
              role="status"
              aria-live="polite"
              className={`rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                feedback.tone === 'praise'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : feedback.tone === 'encourage'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : feedback.tone === 'hint'
                  ? 'bg-sky-50 border-sky-300 text-sky-950'
                  : 'bg-white border-[#DCE5D5] text-[#1A2E22]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    feedback.tone === 'praise'
                      ? 'bg-emerald-500 text-white'
                      : feedback.tone === 'encourage'
                      ? 'bg-amber-400 text-[#1A2E22]'
                      : feedback.tone === 'hint'
                      ? 'bg-sky-500 text-white'
                      : 'bg-[#EFF4EA] text-[#14532D]'
                  }`}
                >
                  {feedback.tone === 'praise' ? (
                    <Star className="w-6 h-6 fill-current" />
                  ) : feedback.tone === 'hint' ? (
                    <HelpCircle className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-display text-lg sm:text-xl font-bold leading-snug">
                    {feedback.title}
                  </p>
                  <p className="text-sm sm:text-base opacity-90">{feedback.message}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => speakFriendly(`${feedback.title}. ${feedback.message}`)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-black/10 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Dengar Lagi
              </button>
            </div>

            {/* Two-Column Interactive Matching Board */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* Left Column: Real Wild Animal Photo Cards */}
              <div className="bg-white rounded-3xl border border-[#DCE5D5] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#14532D]">
                    Foto Asli Binatang Buas
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-[#4B5E52]">
                    Ketuk atau seret
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roundAnimals.map((animal) => {
                    const isMatched = matchedIds.includes(animal.id);
                    const isSelected = selectedAnimalId === animal.id;
                    const isHinted = hintPairId === animal.id && !isMatched;
                    const isBeingDragged =
                      dragState?.isDragging && dragState.animalId === animal.id;

                    return (
                      <div
                        key={animal.id}
                        role="button"
                        tabIndex={isMatched ? -1 : 0}
                        aria-disabled={isMatched}
                        aria-pressed={isSelected}
                        onPointerDown={(e) => handleAnimalPointerDown(e, animal)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectAnimal(animal);
                          }
                        }}
                        className={`relative rounded-2xl border-2 p-3 min-h-[176px] flex flex-col items-center justify-between gap-2.5 transition-all select-none touch-none ${
                          isMatched
                            ? 'bg-[#F3F6F0] border-[#DCE5D5] opacity-45 cursor-default'
                            : isSelected
                            ? 'bg-amber-50 border-amber-500 shadow-md scale-[1.02] cursor-grab'
                            : isHinted
                            ? 'bg-sky-50 border-sky-400 shadow-sm cursor-grab'
                            : 'bg-[#FAFBF8] border-[#DCE5D5] hover:border-amber-400 hover:bg-amber-50/40 cursor-grab active:cursor-grabbing'
                        } ${isBeingDragged ? 'opacity-35' : ''}`}
                      >
                        {/* Quick audio button on each animal card */}
                        {!isMatched && (
                          <button
                            type="button"
                            data-speaker-btn="true"
                            aria-label={`Dengar suara ${animal.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              playTapSound();
                              speakFriendly(
                                `Ini ${animal.name}! Suaranya ${animal.soundWord}`
                              );
                            }}
                            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/95 border border-[#DCE5D5] shadow-sm hover:bg-amber-100 flex items-center justify-center text-[#14532D] transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}

                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#EAEFE4]">
                          <RealAnimalPhoto animal={animal} className="w-full h-full" />
                        </div>

                        <div className="w-full flex items-center justify-center gap-2 pb-0.5">
                          <span className="font-display text-lg sm:text-xl font-bold text-[#1A2E22]">
                            {animal.name}
                          </span>
                          {isMatched && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Exact Shadow Target Wells */}
              <div className="bg-white rounded-3xl border border-[#DCE5D5] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#14532D]">
                    Bayangan yang Cocok
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-[#4B5E52]">
                    Pasangkan di sini
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shadowOrder.map((animal) => {
                    const isMatched = matchedIds.includes(animal.id);
                    const isSelectedShadow = selectedShadowId === animal.id;
                    const isHoveredDrop =
                      dragState?.isDragging &&
                      dragState.hoveredShadowId === animal.id &&
                      !isMatched;
                    const isHinted = hintPairId === animal.id && !isMatched;
                    const isWrong = wrongShadowId === animal.id;

                    return (
                      <button
                        key={`shadow-${animal.id}`}
                        type="button"
                        data-shadow-id={animal.id}
                        onClick={() => handleSelectShadow(animal)}
                        aria-label={
                          isMatched
                            ? `${animal.name} sudah cocok`
                            : 'Pilih bayangan hewan ini'
                        }
                        className={`relative rounded-2xl border-2 p-3 min-h-[176px] flex flex-col items-center justify-between gap-2.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-400 animate-celebrate-pop'
                            : isHoveredDrop
                            ? 'bg-amber-50 border-amber-500 scale-[1.03] shadow-md'
                            : isSelectedShadow
                            ? 'bg-amber-50 border-amber-500 shadow-sm'
                            : isHinted
                            ? 'bg-sky-50 border-sky-400 border-dashed shadow-sm'
                            : 'bg-[#EAEFE4] border-dashed border-[#B7C7AF] hover:border-[#15803D] hover:bg-[#E2EAD9]'
                        } ${isWrong ? 'animate-gentle-shake border-amber-500 bg-amber-50' : ''}`}
                      >
                        <CelebrationBurst triggerKey={burstMap[animal.id] ?? 0} />

                        {isMatched ? (
                          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white">
                            <RealAnimalPhoto animal={animal} className="w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-full aspect-[4/3] rounded-xl flex items-center justify-center p-2">
                            <div className="w-28 h-28 sm:w-32 sm:h-32">
                              <AnimalArtwork animalId={animal.id} isShadow />
                            </div>
                          </div>
                        )}

                        {isMatched ? (
                          <div className="flex items-center gap-2 pb-0.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                            <span className="font-display text-lg sm:text-xl font-bold text-emerald-900">
                              {animal.name}!
                            </span>
                          </div>
                        ) : (
                          <span className="font-display text-base font-semibold text-[#4B5E52] pb-0.5">
                            Siapakah aku?
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'ROUND_SUMMARY' && (
          <section className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-[#DCE5D5] overflow-hidden shadow-sm">
              <div className="relative h-56 sm:h-72 bg-[#E8F1E2]">
                {!victoryImgFailed ? (
                  <img
                    src={VICTORY_IMAGE_PATH}
                    alt="Perayaan kemenangan bersama teman rimba di padang rumput cerah"
                    referrerPolicy="no-referrer"
                    onError={() => setVictoryImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 via-emerald-50 to-sky-100" />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#14331F]/80 via-[#14331F]/25 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-6 bottom-6 text-white space-y-1">
                  <p className="text-sm font-medium text-amber-200">
                    Apresiasi Sahabat Rimba · Babak {roundNumber} dari {TOTAL_ROUNDS}
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-balance">
                    {roundNumber >= TOTAL_ROUNDS
                      ? 'Horeee! Kamu Juara Hebat!'
                      : 'Pintar Sekali! Semua Bayangan Cocok!'}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Star Trophy Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#DCE5D5]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalStars, 10) }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-7 h-7 fill-amber-400 text-amber-500"
                        />
                      ))}
                    </div>
                    <span className="font-display text-2xl font-bold text-[#14532D] tabular-nums">
                      {totalStars} Bintang Terkumpul
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      speakFriendly(
                        `Hebat! Kamu sudah mengumpulkan ${totalStars} bintang! Kamu anak pintar!`
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EFF4EA] hover:bg-[#E1EBD8] text-[#14532D] font-semibold text-sm whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Putar Pujian Lagi
                  </button>
                </div>

                {/* Matched Animals Review */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#4B5E52]">
                    Ketuk hewan di bawah ini untuk mendengar suaranya lagi:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {roundAnimals.map((animal) => (
                      <button
                        key={`done-${animal.id}`}
                        type="button"
                        onClick={() => {
                          playTapSound();
                          speakFriendly(
                            `Ini ${animal.name}! ${animal.soundWord} ${animal.funFact}`
                          );
                        }}
                        className="rounded-2xl border border-[#DCE5D5] bg-[#FAFBF8] hover:bg-amber-50 hover:border-amber-400 p-2.5 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden">
                          <RealAnimalPhoto animal={animal} className="w-full h-full" />
                        </div>
                        <span className="font-display text-base font-bold text-[#1A2E22]">
                          {animal.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Next Action */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-[#1A2E22] font-display text-xl font-bold shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {roundNumber >= TOTAL_ROUNDS
                      ? 'Main Lagi Dari Awal'
                      : `Lanjut Babak ${roundNumber + 1}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => goToView('TITLE_MENU')}
                    className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#EFF4EA] hover:bg-[#E2ECDA] text-[#14532D] font-semibold text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'PHOTO_QUIZ' && (
          <RealPhotoQuizGame
            totalStars={totalStars}
            onEarnStar={(n = 1) => setTotalStars((prev) => prev + n)}
            onBackHome={() => goToView('TITLE_MENU')}
          />
        )}

        {view === 'PHOTO_MEMORY' && (
          <RealPhotoMemoryGame
            totalStars={totalStars}
            onEarnStar={(n = 1) => setTotalStars((prev) => prev + n)}
            onBackHome={() => goToView('TITLE_MENU')}
          />
        )}

        {view === 'ENCYCLOPEDIA' && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#14532D]">
                  Kenal 8 Binatang Buas
                </h1>
                <p className="text-base text-[#4B5E52]">
                  Ketuk kartu hewan untuk mendengar suaranya, lalu bandingkan foto nyata, ilustrasi, dan bayangannya!
                </p>
              </div>

              <div className="inline-flex items-center gap-1 p-1.5 bg-[#E8EFE2] rounded-xl border border-[#DCE5D5]">
                {(
                  [
                    { id: 'real', label: 'Foto Nyata' },
                    { id: 'illustration', label: 'Ilustrasi' },
                    { id: 'shadow', label: 'Bayangan' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setEncyclopediaMode(tab.id);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      encyclopediaMode === tab.id
                        ? 'bg-white text-[#14532D] shadow-sm'
                        : 'text-[#4B5E52] hover:text-[#14532D]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WILD_ANIMALS.map((animal) => {
                const isActive = activeEncyclopediaId === animal.id;
                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => {
                      setActiveEncyclopediaId(animal.id);
                      playSelectSound();
                      speakFriendly(
                        `Ini ${animal.name}! Suaranya ${animal.soundWord}. ${animal.funFact}`
                      );
                    }}
                    className={`text-left rounded-3xl border-2 p-5 flex flex-col justify-between gap-4 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-50 border-amber-400 shadow-sm'
                        : 'bg-white border-[#DCE5D5] hover:border-emerald-400'
                    }`}
                  >
                    {encyclopediaMode === 'real' ? (
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4F7F0]">
                        <RealAnimalPhoto
                          animal={animal}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-2xl bg-[#F4F7F0] flex items-center justify-center p-3">
                        <div className="w-28 h-28">
                          <AnimalArtwork
                            animalId={animal.id}
                            isShadow={encyclopediaMode === 'shadow'}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-display text-2xl font-bold text-[#14532D]">
                          {animal.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D]">
                          <Volume2 className="w-4 h-4" />
                          {animal.soundWord}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#4B5E52]">
                        {animal.habitat}
                      </p>
                      <p className="text-sm text-[#3E5245] leading-relaxed">
                        {animal.funFact}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Floating Drag Ghost Layer */}
      {draggedAnimal && dragState?.isDragging && (
        <div
          className="fixed top-0 left-0 z-50 pointer-events-none"
          style={{
            transform: `translate3d(${dragState.x - 72}px, ${dragState.y - 54}px, 0)`,
          }}
          aria-hidden="true"
        >
          <div className="w-36 aspect-[4/3] rounded-2xl bg-white/95 border-2 border-amber-500 shadow-xl p-1.5 overflow-hidden">
            <RealAnimalPhoto
              animal={draggedAnimal}
              className="w-full h-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
