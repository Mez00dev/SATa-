import React, { useState, memo, useCallback } from 'react';
import { Question } from '../types';
import { ChevronLeft, ChevronRight, RotateCw, Home, Brain, Sparkles, Shuffle, Check } from 'lucide-react';

interface FlashcardsScreenProps {
  questions: Question[];
  onExit: () => void;
  onComplete: (xp: number) => void;
  playSFX: (type: 'click' | 'hover') => void;
}

const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({ questions, onExit, onComplete, playSFX }) => {
  const [deck, setDeck] = useState<Question[]>([...questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedIndices, setViewedIndices] = useState<Set<number>>(new Set([0]));

  const currentCard = deck[currentIndex];
  const progress = ((viewedIndices.size) / deck.length) * 100;

  const handleShuffle = () => {
    playSFX('click');
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    setDeck(newDeck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedIndices(new Set([0]));
  };

  const handleNext = () => {
    playSFX('click');
    if (currentIndex < deck.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsFlipped(false);
      setViewedIndices(prev => new Set([...prev, nextIdx]));
    } else {
        // Complete session
        onComplete(viewedIndices.size * 50); // 50 XP per unique card viewed
    }
  };

  const handlePrev = () => {
    playSFX('click');
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = useCallback(() => {
    playSFX('hover'); // Use hover sound for flip swoosh effect
    setIsFlipped(prev => !prev);
  }, [playSFX]);

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto px-4 py-8 relative z-10 animate-fade-in selection:bg-indigo-500/30">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors hover:scale-110 active:scale-95">
          <Home className="w-5 h-5 text-white/60" />
        </button>
        <div className="flex-1 max-w-xs mx-4">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Progression</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{currentIndex + 1} / {deck.length}</span>
            </div>
        </div>
        <button 
            onClick={handleShuffle} 
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors group hover:scale-110 active:scale-95"
            title="Shuffle Deck"
        >
          <Shuffle className="w-5 h-5 text-white/60 group-hover:text-indigo-400 transition-colors" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 md:py-10">
        <div 
          className="relative w-full max-w-2xl aspect-[4/5] md:aspect-[16/9] perspective-1000 cursor-pointer group"
          onClick={handleFlip}
        >
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : 'animate-float'}`}>
            
            {/* Front Side */}
            <div className="absolute inset-0 backface-hidden glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col items-center justify-center text-center border-2 border-white/10 shadow-2xl hover:border-indigo-500/30 transition-colors">
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                    <Brain className="w-3 h-3" /> {currentCard.type || 'Concept'}
                </div>
                
                <div className="flex-1 flex items-center justify-center w-full">
                    <h2 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-lg whitespace-pre-wrap select-none">
                        {currentCard.q}
                    </h2>
                </div>

                <div className="mt-8 text-white/20 group-hover:text-white/40 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <RotateCw className="w-4 h-4" /> Tap to reveal
                </div>
            </div>

            {/* Back Side (The Explanation) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col items-center justify-center text-center border-2 border-indigo-500/30 bg-indigo-950/40 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> Solution
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg space-y-6">
                    <div className="text-emerald-400 text-xl md:text-2xl font-black underline decoration-emerald-500/30">
                        {currentCard.a[currentCard.correct]}
                    </div>
                    <p className="text-sm md:text-base text-white/80 leading-relaxed font-medium overflow-y-auto max-h-[200px] custom-scrollbar pr-2">
                        {currentCard.explanation || "No extended explanation provided for this concept."}
                    </p>
                </div>

                <div className="mt-8 text-white/20 group-hover:text-white/40 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <RotateCw className="w-4 h-4" /> Tap to flip back
                </div>
            </div>

          </div>
        </div>

        <div className="flex gap-4 mt-8 md:mt-12 w-full max-w-sm">
            <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                disabled={currentIndex === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
            >
                <ChevronLeft className="w-5 h-5" /> Prev
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="flex-2 flex items-center justify-center gap-3 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all hover:scale-105"
            >
                {currentIndex === deck.length - 1 ? 'Finish' : 'Next'} {currentIndex === deck.length - 1 ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default memo(FlashcardsScreen);