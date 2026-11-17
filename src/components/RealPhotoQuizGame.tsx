import React, { useCallback, useEffect, useState } from 'react';
import { Check, Play, RotateCcw, Star, Volume2 } from 'lucide-react';
import {
  AnimalId,
  ENCOURAGE_RETRY_LIST,
  PRAISE_SHORT_LIST,
  WILD_ANIMALS,
  WildAnimal,
} from '../data/animals';
import { RealAnimalPhoto } from './RealAnimalPhoto';
import { CelebrationBurst } from './CelebrationBurst';
import {
  playCorrectSound,
  playTapSound,
  playTryAgainSound,
  playVictorySound,
  speakFriendly,
} from '../utils/audio';

interface QuizQuestion {
  target: WildAnimal;
  options: WildAnimal[];
}

interface RealPhotoQuizGameProps {
  onEarnStar: (count?: number) => void;
  totalStars: number;
  onBackHome: () => void;
}

const TOTAL_QUESTIONS = 5;

function shuffleList<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuizDeck(): QuizQuestion[] {
  const targets = shuffleList(WILD_ANIMALS).slice(0, TOTAL_QUESTIONS);
  return targets.map((target) => {
    const distractors = shuffleList(
      WILD_ANIMALS.filter((a) => a.id !== target.id)
    ).slice(0, 2);
    return {
      target,
      options: shuffleList([target, ...distractors]),
    };
  });
}

export const RealPhotoQuizGame: React.FC<RealPhotoQuizGameProps> = ({
  onEarnStar,
  totalStars,
  onBackHome,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuizDeck());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [wrongOptionId, setWrongOptionId] = useState<AnimalId | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'neutral' | 'praise' | 'encourage';
    title: string;
    message: string;
  }>({
    tone: 'neutral',
    title: 'Dengarkan Suara & Petunjuknya!',
    message: 'Pilih foto nyata binatang buas yang sesuai dengan cerita di atas ya.',
  });

  const currentQuestion = questions[currentIndex];

  const speakCurrentClue = useCallback((q: QuizQuestion) => {
    speakFriendly(
      `Siapakah aku? ${q.target.voiceQuizClue} Ayo ketuk foto nyata diriku!`
    );
  }, []);

  useEffect(() => {
    if (!finished && currentQuestion) {
      speakCurrentClue(currentQuestion);
    }
  }, [currentIndex, finished, currentQuestion, speakCurrentClue]);

  const startOver = () => {
    playTapSound();
    const fresh = buildQuizDeck();
    setQuestions(fresh);
    setCurrentIndex(0);
    setAnsweredCorrectly(false);
    setWrongOptionId(null);
    setBurstKey(0);
    setFinished(false);
    setFeedback({
      tone: 'neutral',
      title: 'Dengarkan Suara & Petunjuknya!',
      message: 'Pilih foto nyata binatang buas yang sesuai dengan cerita di atas ya.',
    });
  };

  const handleChooseOption = (chosen: WildAnimal) => {
    if (answeredCorrectly || finished) return;

    if (chosen.id === currentQuestion.target.id) {
      setAnsweredCorrectly(true);
      setWrongOptionId(null);
      setBurstKey((prev) => prev + 1);
      onEarnStar(1);
      playCorrectSound();

      const shortPraise =
        PRAISE_SHORT_LIST[Math.floor(Math.random() * PRAISE_SHORT_LIST.length)];
      const message = `Benar, ini foto nyata ${chosen.name}! ${chosen.funFact}`;
      setFeedback({
        tone: 'praise',
        title: `${shortPraise} Itu ${chosen.name}!`,
        message,
      });
      speakFriendly(`${shortPraise} Benar sekali, ini foto nyata ${chosen.name}!`);
    } else {
      playTryAgainSound();
      setWrongOptionId(chosen.id);
      const retry =
        ENCOURAGE_RETRY_LIST[
          Math.floor(Math.random() * ENCOURAGE_RETRY_LIST.length)
        ];
      setFeedback({
        tone: 'encourage',
        title: `Itu foto ${chosen.name}. Yuk coba pilih yang lain!`,
        message: retry,
      });
      speakFriendly(
        `Ups, itu ${chosen.name}. Dengarkan lagi petunjuknya ya! ${currentQuestion.target.voiceQuizClue}`
      );
      window.setTimeout(() => {
        setWrongOptionId((prev) => (prev === chosen.id ? null : prev));
      }, 500);
    }
  };

  const handleNextQuestion = () => {
    playTapSound();
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      playVictorySound();
      speakFriendly(
        'Horeee! Kamu hebat sekali! Semua foto binatang buas berhasil kamu tebak dengan benar!'
      );
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnsweredCorrectly(false);
      setWrongOptionId(null);
      setFeedback({
        tone: 'neutral',
        title: 'Dengarkan Suara & Petunjuknya!',
        message: 'Pilih foto nyata binatang buas yang sesuai dengan cerita di atas ya.',
      });
    }
  };

  if (finished) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#DCE5D5] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE5D5] pb-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#4B5E52]">
                Tebak Suara · Foto Nyata Selesai
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#14532D]">
                Horeee! Kamu Hebat Sekali!
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 text-amber-700 font-display text-2xl font-bold tabular-nums">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
              {totalStars} Bintang
            </div>
          </div>

          <p className="text-base text-[#3E5245]">
            Semua {TOTAL_QUESTIONS} foto nyata binatang buas berhasil kamu kenali. Ketuk foto di bawah untuk mendengar suaranya lagi!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {questions.map((q) => (
              <button
                key={q.target.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  speakFriendly(
                    `Ini ${q.target.name}! ${q.target.soundWord} ${q.target.funFact}`
                  );
                }}
                className="rounded-2xl border border-[#DCE5D5] bg-[#FAFBF8] hover:border-amber-400 p-2.5 flex flex-col items-center gap-2 transition-colors cursor-pointer"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden">
                  <RealAnimalPhoto animal={q.target} className="w-full h-full" />
                </div>
                <span className="font-display text-base font-bold text-[#1A2E22]">
                  {q.target.name}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-[#1A2E22] font-display text-xl font-bold shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Main Tebak Suara Lagi
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#EFF4EA] hover:bg-[#E2ECDA] text-[#14532D] font-semibold text-base whitespace-nowrap shrink-0 cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* HUD Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-semibold text-[#3E5245] tabular-nums">
          <span className="font-display text-lg sm:text-xl text-[#14532D]">
            Tebak Suara · Foto Nyata
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Soal {currentIndex + 1} dari {TOTAL_QUESTIONS}
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-amber-700">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            {totalStars} Bintang
          </span>
        </div>

        <button
          type="button"
          onClick={startOver}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCE5D5] hover:bg-[#EFF4EA] text-[#1A2E22] font-semibold text-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Mulai Ulang
        </button>
      </div>

      {/* Clue & Voice Prompt Card */}
      <div className="bg-white rounded-3xl border border-[#DCE5D5] p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-semibold text-[#15803D]">
            Suara Hewan: {currentQuestion.target.soundWord}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14532D] leading-snug">
            {currentQuestion.target.voiceQuizClue}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            speakCurrentClue(currentQuestion);
          }}
          className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-[#1A2E22] font-display text-lg font-bold shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
          Dengar Petunjuk
        </button>
      </div>

      {/* Feedback Banner */}
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

        {answeredCorrectly && (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-display text-lg font-bold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {currentIndex + 1 >= TOTAL_QUESTIONS ? 'Lihat Hasil' : 'Soal Berikutnya'}
          </button>
        )}
      </div>

      {/* 3 Realistic Wildlife Photo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {currentQuestion.options.map((option) => {
          const isTarget = option.id === currentQuestion.target.id;
          const isSolvedCard = answeredCorrectly && isTarget;
          const isDimmed = answeredCorrectly && !isTarget;
          const isWrong = wrongOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleChooseOption(option)}
              disabled={answeredCorrectly}
              className={`relative rounded-3xl border-2 p-3.5 sm:p-4 text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                isSolvedCard
                  ? 'bg-emerald-50 border-emerald-500 shadow-md animate-celebrate-pop'
                  : isDimmed
                  ? 'bg-white border-[#DCE5D5] opacity-45 cursor-default'
                  : isWrong
                  ? 'bg-amber-50 border-amber-500 animate-gentle-shake'
                  : 'bg-white border-[#DCE5D5] hover:border-amber-400 hover:shadow-md'
              }`}
            >
              {isSolvedCard && <CelebrationBurst triggerKey={burstKey} />}

              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#EAEFE4]">
                <RealAnimalPhoto animal={option} className="w-full h-full" />
              </div>

              <div className="pt-3.5 pb-1 px-1 flex items-center justify-between gap-2">
                {answeredCorrectly ? (
                  <>
                    <span className="font-display text-2xl font-bold text-[#14532D]">
                      {option.name}
                    </span>
                    {isSolvedCard && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                        <Check className="w-5 h-5 stroke-[3]" />
                        Benar!
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-display text-lg font-semibold text-[#4B5E52]">
                    Ketuk foto ini jika benar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
