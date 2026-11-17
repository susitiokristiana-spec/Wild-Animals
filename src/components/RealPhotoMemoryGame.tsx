import React, { useCallback, useEffect, useState } from 'react';
import { Check, Leaf, Play, RotateCcw, Star, Volume2 } from 'lucide-react';
import {
  AnimalId,
  PRAISE_SHORT_LIST,
  WILD_ANIMALS,
  WildAnimal,
} from '../data/animals';
import { RealAnimalPhoto } from './RealAnimalPhoto';
import { CelebrationBurst } from './CelebrationBurst';
import {
  playCorrectSound,
  playSelectSound,
  playTapSound,
  playTryAgainSound,
  playVictorySound,
  speakFriendly,
} from '../utils/audio';

interface MemoryCard {
  uid: string;
  animal: WildAnimal;
}

interface RealPhotoMemoryGameProps {
  onEarnStar: (count?: number) => void;
  totalStars: number;
  onBackHome: () => void;
}

type PairCount = 3 | 4 | 6;

function shuffleCards<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildMemoryDeck(pairCount: PairCount): MemoryCard[] {
  const chosen = shuffleCards(WILD_ANIMALS).slice(0, pairCount);
  const pairs: MemoryCard[] = [];
  chosen.forEach((animal) => {
    pairs.push({ uid: `${animal.id}-a`, animal });
    pairs.push({ uid: `${animal.id}-b`, animal });
  });
  return shuffleCards(pairs);
}

export const RealPhotoMemoryGame: React.FC<RealPhotoMemoryGameProps> = ({
  onEarnStar,
  totalStars,
  onBackHome,
}) => {
  const [pairCount, setPairCount] = useState<PairCount>(3);
  const [deck, setDeck] = useState<MemoryCard[]>(() => buildMemoryDeck(3));
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedAnimalIds, setMatchedAnimalIds] = useState<AnimalId[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [burstMap, setBurstMap] = useState<Partial<Record<AnimalId, number>>>({});
  const [feedback, setFeedback] = useState<{
    tone: 'neutral' | 'praise' | 'encourage';
    title: string;
    message: string;
  }>({
    tone: 'neutral',
    title: 'Cari Pasangan Foto Nyata!',
    message: 'Buka dua kartu yang sama untuk mendapatkan bintang dan pujian.',
  });

  const resetGame = useCallback((count: PairCount, announce = true) => {
    setPairCount(count);
    setDeck(buildMemoryDeck(count));
    setFlippedUids([]);
    setMatchedAnimalIds([]);
    setIsChecking(false);
    setBurstMap({});
    setFeedback({
      tone: 'neutral',
      title: 'Cari Pasangan Foto Nyata!',
      message: 'Buka dua kartu yang sama untuk mendapatkan bintang dan pujian.',
    });
    if (announce) {
      speakFriendly(
        `Ayo bermain memori foto nyata! Buka dua kartu yang sama ya!`
      );
    }
  }, []);

  useEffect(() => {
    speakFriendly('Ayo buka dua kartu foto binatang buas yang sama!');
  }, []);

  const handleFlipCard = (card: MemoryCard) => {
    if (isChecking) return;
    if (matchedAnimalIds.includes(card.animal.id)) {
      playTapSound();
      speakFriendly(`Foto ${card.animal.name}! ${card.animal.soundWord}`);
      return;
    }
    if (flippedUids.includes(card.uid)) return;

    playSelectSound();
    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 1) {
      speakFriendly(card.animal.name);
      return;
    }

    if (nextFlipped.length === 2) {
      const firstCard = deck.find((c) => c.uid === nextFlipped[0]);
      const secondCard = card;
      if (!firstCard) return;

      if (firstCard.animal.id === secondCard.animal.id) {
        const nextMatched = [...matchedAnimalIds, secondCard.animal.id];
        setMatchedAnimalIds(nextMatched);
        setFlippedUids([]);
        onEarnStar(1);
        playCorrectSound();
        setBurstMap((prev) => ({
          ...prev,
          [secondCard.animal.id]: (prev[secondCard.animal.id] ?? 0) + 1,
        }));

        const shortPraise =
          PRAISE_SHORT_LIST[Math.floor(Math.random() * PRAISE_SHORT_LIST.length)];

        if (nextMatched.length === pairCount) {
          playVictorySound();
          setFeedback({
            tone: 'praise',
            title: 'Horeee! Semua Pasangan Foto Cocok!',
            message: `Ingatanmu hebat sekali! Kamu berhasil memasangkan semua ${pairCount} foto nyata binatang buas!`,
          });
          speakFriendly(
            `Horeee! Kamu hebat sekali! Semua pasangan foto ${secondCard.animal.name} dan teman-temannya berhasil ditemukan!`
          );
        } else {
          setFeedback({
            tone: 'praise',
            title: `${shortPraise} Sepasang Foto ${secondCard.animal.name}!`,
            message: `${secondCard.animal.funFact}`,
          });
          speakFriendly(
            `${shortPraise} Kamu menemukan sepasang foto ${secondCard.animal.name}!`
          );
        }
      } else {
        setIsChecking(true);
        playTryAgainSound();
        setFeedback({
          tone: 'encourage',
          title: `Kartunya ${firstCard.animal.name} dan ${secondCard.animal.name}`,
          message: 'Belum sama nih! Yuk ingat letak fotonya dan coba buka lagi.',
        });
        speakFriendly(
          `Ini ${secondCard.animal.name}. Belum sama, yuk ingat letaknya ya!`
        );

        window.setTimeout(() => {
          setFlippedUids([]);
          setIsChecking(false);
        }, 1150);
      }
    }
  };

  const allMatched = matchedAnimalIds.length === pairCount;

  return (
    <section className="space-y-6">
      {/* HUD & Difficulty Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-semibold text-[#3E5245] tabular-nums">
          <span className="font-display text-lg sm:text-xl text-[#14532D]">
            Memori Foto Nyata
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Pasangan {matchedAnimalIds.length}/{pairCount}
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-amber-700">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            {totalStars} Bintang
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-[#E8EFE2] rounded-xl border border-[#DCE5D5]">
            {(
              [
                { val: 3, label: '6 Kartu' },
                { val: 4, label: '8 Kartu' },
                { val: 6, label: '12 Kartu' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => {
                  playTapSound();
                  resetGame(opt.val, true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  pairCount === opt.val
                    ? 'bg-white text-[#14532D] shadow-sm'
                    : 'text-[#4B5E52] hover:text-[#14532D]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              resetGame(pairCount, true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DCE5D5] hover:bg-[#EFF4EA] text-[#1A2E22] font-semibold text-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Acak Kartu
          </button>
        </div>
      </div>

      {/* Feedback & Praise Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`rounded-2xl border p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
          feedback.tone === 'praise'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : feedback.tone === 'encourage'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-white border-[#DCE5D5] text-[#1A2E22]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              feedback.tone === 'praise'
                ? 'bg-emerald-500 text-white'
                : feedback.tone === 'encourage'
                ? 'bg-amber-400 text-[#1A2E22]'
                : 'bg-[#EFF4EA] text-[#14532D]'
            }`}
          >
            {feedback.tone === 'praise' ? (
              <Star className="w-6 h-6 fill-current" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-display text-lg sm:text-xl font-bold">
              {feedback.title}
            </p>
            <p className="text-sm sm:text-base opacity-90">{feedback.message}</p>
          </div>
        </div>

        {allMatched && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                resetGame(pairCount, true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#1A2E22] font-display text-base font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Main Lagi
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#DCE5D5] hover:bg-[#EFF4EA] text-[#14532D] font-semibold text-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              Beranda
            </button>
          </div>
        )}
      </div>

      {/* Memory Cards Grid */}
      <div
        className={`grid gap-4 sm:gap-5 ${
          pairCount === 3
            ? 'grid-cols-2 sm:grid-cols-3'
            : pairCount === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}
      >
        {deck.map((card) => {
          const isMatched = matchedAnimalIds.includes(card.animal.id);
          const isRevealed = isMatched || flippedUids.includes(card.uid);

          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlipCard(card)}
              aria-label={
                isRevealed
                  ? `Kartu terbuka: ${card.animal.name}`
                  : 'Buka kartu foto binatang buas'
              }
              className={`relative rounded-3xl border-2 p-3 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                isMatched
                  ? 'bg-emerald-50 border-emerald-400 shadow-sm animate-celebrate-pop'
                  : isRevealed
                  ? 'bg-white border-amber-400 shadow-md'
                  : 'bg-[#15803D] border-[#166534] hover:bg-[#166534] hover:scale-[1.02] shadow-sm'
              }`}
            >
              {isMatched && (
                <CelebrationBurst triggerKey={burstMap[card.animal.id] ?? 0} />
              )}

              {isRevealed ? (
                <div className="space-y-2.5">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#EAEFE4]">
                    <RealAnimalPhoto
                      animal={card.animal}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 pb-0.5">
                    <span className="font-display text-lg sm:text-xl font-bold text-[#14532D]">
                      {card.animal.name}
                    </span>
                    {isMatched && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-emerald-300/60 flex flex-col items-center justify-center gap-2 text-white py-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-amber-200" />
                  </div>
                  <span className="font-display text-lg font-bold tracking-wide text-amber-100">
                    Buka Foto
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
