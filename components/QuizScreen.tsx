import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Question, AnswerHistory, Subject } from '../types';
import { Pause, Play, Home, Calculator, FileText, X, Info, Flag } from 'lucide-react';

declare global { interface Window { Desmos?: any; } }

const TimerDisplay = memo(({ timeLeft, totalTime, isPaused, onTogglePause }: { timeLeft: number, totalTime: number, isPaused: boolean, onTogglePause: () => void }) => {
  const percentage = Math.max(0, (timeLeft / totalTime) * 100);
  let phase: 'normal' | 'warning' | 'danger' | 'critical' = 'normal';
  
  if (timeLeft <= 10) phase = 'critical';
  else if (percentage <= 25) phase = 'danger';
  else if (percentage <= 50) phase = 'warning';

  const styles = {
    normal: { 
      text: 'text-emerald-400', 
      stroke: 'text-emerald-400', 
      container: 'bg-emerald-950/40 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
    },
    warning: { 
      text: 'text-amber-400', 
      stroke: 'text-amber-400', 
      container: 'bg-amber-950/40 border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)]' 
    },
    danger: { 
      text: 'text-orange-500', 
      stroke: 'text-orange-500', 
      container: 'bg-orange-950/40 border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.2)]' 
    },
    critical: { 
      text: 'text-rose-500', 
      stroke: 'text-rose-500', 
      container: 'bg-rose-950/50 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.3)] animate-pulse' 
    }
  };

  const current = styles[phase];

  return (
    <div className={`flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 transition-all duration-500 ${current.container} backdrop-blur-md`}>
      <div className={`relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center ${phase === 'critical' ? 'scale-110' : ''} transition-transform duration-300`}>
        <svg className="absolute w-full h-full -rotate-90 overflow-visible">
          <circle cx="50%" cy="50%" r="46%" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
          <circle 
            cx="50%" cy="50%" r="46%" fill="none" stroke="currentColor" strokeWidth="3" 
            className={`${current.stroke} transition-all duration-1000 ease-linear drop-shadow-sm`}
            strokeDasharray="100 100" strokeDashoffset={100 - percentage}
            strokeLinecap="round"
            pathLength="100"
          />
        </svg>
        <div className="flex flex-col items-center justify-center leading-none mt-0.5">
             <span className={`text-sm md:text-xl font-black font-mono tracking-tighter ${current.text} drop-shadow-md`}>
               {timeLeft < 60 ? timeLeft : Math.ceil(timeLeft / 60)}
             </span>
             <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-80 ${current.text}`}>
               {timeLeft < 60 ? 'SEC' : 'MIN'}
             </span>
        </div>
      </div>
      
      <div className="h-8 md:h-10 w-px bg-white/10 mx-1"></div>
      
      <button 
        onClick={onTogglePause} 
        className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all active:scale-95"
      >
        {isPaused ? <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
      </button>
    </div>
  );
});

// Memoized Header controls to avoid re-renders on timer ticks
const QuizHeaderLeft = memo(({ subject, showCalculator, setShowCalculator, showReference, setShowReference, setShowExitConfirm, questions, currentIndex, history, markedIndices }: any) => {
  return (
    <>
      <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setShowExitConfirm(true)} className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5"><Home className="w-4 h-4 md:w-5 md:h-5 text-white/60" /></button>
          {subject === 'math' && (
              <div className="flex gap-1 md:gap-2">
                  <button 
                      onClick={() => setShowCalculator(!showCalculator)} 
                      className={`hidden md:block p-2 md:p-3 rounded-full border ${showCalculator ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/60'}`}
                  >
                      <Calculator className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button onClick={() => setShowReference(true)} className={`p-2 md:p-3 rounded-full border ${showReference ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/60'}`}><FileText className="w-4 h-4 md:w-5 md:h-5" /></button>
              </div>
          )}
      </div>
      
      <div className="flex-1 flex gap-1 px-2 py-1 mx-2 overflow-x-auto justify-center scrollbar-none">
          {questions.map((_: any, i: number) => {
              const status = history.find((h: any) => h.questionIndex === i);
              const isMarked = markedIndices.has(i);
              const isActive = i === currentIndex;
              
              let colorClass = "bg-white/10";
              if (status) {
                  colorClass = status.chosenIndex === status.correctIndex ? "bg-emerald-500/50" : "bg-red-500/50";
                  if (isMarked) colorClass += " border border-amber-400"; // Add border if answered but marked
              } else if (isMarked) {
                  colorClass = "bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
              } else if (isActive) {
                  colorClass = "bg-indigo-500 scale-110 shadow-lg shadow-indigo-500/50";
              }
              
              return <div key={i} className={`w-2 md:w-3 h-1 rounded-full transition-all duration-300 shrink-0 ${colorClass}`} />;
          })}
      </div>
    </>
  );
});

// Memoized Question View
const QuestionView = memo(({ currentQ, currentIndex, answered, handleAnswer, playSFX, isMarked, toggleMark }: any) => {
  return (
    <div className="flex-1 flex flex-col justify-start md:justify-center overflow-y-auto pb-20 scrollbar-none">
        <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-12 mb-4 md:mb-8 shadow-2xl relative overflow-hidden shrink-0">
             <div className="absolute -right-4 -bottom-10 text-[6rem] md:text-[10rem] font-black text-white/5 select-none leading-none pointer-events-none">{currentIndex + 1}</div>
             
             <div className="flex flex-wrap items-center justify-between mb-3 md:mb-4 relative z-10">
                <div className="flex gap-2">
                    {currentQ.type && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest">
                            <Info className="w-3 h-3 text-indigo-400" /> {currentQ.type}
                        </div>
                    )}
                    {currentQ.topic && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-widest">
                            {currentQ.topic}
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={toggleMark}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all
                    ${isMarked 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                >
                    <Flag className={`w-3 h-3 ${isMarked ? 'fill-current' : ''}`} />
                    {isMarked ? 'Marked' : 'Mark for Review'}
                </button>
             </div>

             {currentQ.instruction && (
                <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 italic">
                   Instruction: {currentQ.instruction}
                </p>
             )}

             <h2 className="text-lg md:text-4xl font-bold leading-tight relative z-10 text-glow whitespace-pre-wrap">{currentQ.q}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 shrink-0">
          {currentQ.a.map((ans: string, idx: number) => {
            let btnClass = "group relative p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-sm md:text-lg font-medium transition-all duration-300 transform active:scale-[0.98] text-left overflow-hidden ";
            if (answered) {
              if (idx === currentQ.correct) btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-200 z-10 scale-[1.01] ";
              else if (idx === answered.chosenIndex) btnClass += "bg-red-500/10 border-red-500/50 text-red-200 opacity-60 ";
              else btnClass += "bg-white/5 border-transparent opacity-30 blur-[1px] ";
            } else btnClass += "bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/30 ";
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} onMouseEnter={() => playSFX('hover')} disabled={!!answered} className={btnClass}>
                <span className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg mr-3 md:mr-4 text-xs font-bold shrink-0 ${answered && idx === currentQ.correct ? 'bg-emerald-500 text-emerald-950' : 'bg-white/10'}`}>{String.fromCharCode(65 + idx)}</span>
                <span className="relative z-10">{ans}</span>
              </button>
            );
          })}
        </div>
      </div>
  );
});

interface QuizScreenProps {
  questions: Question[];
  isTimed: boolean;
  timePerQuestion: number; 
  onComplete: (score: number, history: AnswerHistory[]) => void;
  onExit: () => void;
  subject: Subject;
  playSFX: (type: 'click' | 'success' | 'error' | 'purchase' | 'levelup' | 'hover' | 'tick') => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, isTimed, timePerQuestion, onComplete, onExit, subject, playSFX }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<AnswerHistory[]>([]);
  const [timeLeft, setTimeLeft] = useState(questions.length * timePerQuestion);
  const [isPaused, setIsPaused] = useState(false);
  const totalTime = questions.length * timePerQuestion;
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [markedIndices, setMarkedIndices] = useState<Set<number>>(new Set());

  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  
  const [calcPos, setCalcPos] = useState({ x: 20, y: 80 });
  const [calcSize, setCalcSize] = useState({ w: 350, h: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startLeft: 0, startTop: 0, startW: 0, startH: 0 });

  const calculatorContainerRef = useRef<HTMLDivElement>(null);
  const calculatorInstance = useRef<any>(null);

  const currentQ = questions[currentIndex];
  const answered = history.find(h => h.questionIndex === currentIndex);

  useEffect(() => {
    // Initial calc positioning for desktop
    if (window.innerWidth >= 768) {
        setCalcPos({ x: window.innerWidth / 2 - 300, y: 150 });
        setCalcSize({ w: 600, h: 450 });
    }
  }, []);

  const finishQuiz = useCallback(() => {
    if (calculatorInstance.current) { calculatorInstance.current.destroy(); calculatorInstance.current = null; }
    let score = 0;
    history.forEach(h => { if(questions[h.questionIndex].correct === h.chosenIndex) score++; });
    onComplete(score, history);
  }, [history, questions, onComplete]);

  useEffect(() => {
    if (!isTimed || isPaused) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 10 && next > 0) playSFX('tick');
        if (next <= 0) { clearInterval(interval); finishQuiz(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimed, isPaused, playSFX, finishQuiz]);

  useEffect(() => {
    if (subject === 'math' && calculatorContainerRef.current && !calculatorInstance.current && window.Desmos) {
       calculatorInstance.current = window.Desmos.GraphingCalculator(calculatorContainerRef.current, {
           keypad: true, expressions: true, settingsMenu: true, zoomButtons: true
       });
    }
  }, [subject]); 
  
  useEffect(() => { if (calculatorInstance.current) calculatorInstance.current.resize(); }, [calcSize, showCalculator]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setCalcPos({ x: Math.max(0, dragRef.current.startLeft + (e.clientX - dragRef.current.startX)), y: Math.max(0, dragRef.current.startTop + (e.clientY - dragRef.current.startY)) });
    }
    if (isResizing) {
      setCalcSize({ w: Math.max(300, dragRef.current.startW + (e.clientX - dragRef.current.startX)), h: Math.max(250, dragRef.current.startH + (e.clientY - dragRef.current.startY)) });
    }
  }, [isDragging, isResizing]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); setIsResizing(false); }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleAnswer = useCallback((choiceIndex: number) => {
    if (answered) return;
    
    if (choiceIndex === currentQ.correct) playSFX('success');
    else playSFX('error');

    setHistory(prev => [...prev, { questionIndex: currentIndex, correctIndex: currentQ.correct, chosenIndex: choiceIndex }]);
    if (currentIndex < questions.length - 1) setTimeout(() => setCurrentIndex(prev => prev + 1), 800);
    else setTimeout(() => finishQuiz(), 800);
  }, [answered, currentQ, currentIndex, questions.length, finishQuiz, playSFX]);

  const toggleMark = useCallback(() => {
      setMarkedIndices(prev => {
          const next = new Set(prev);
          if (next.has(currentIndex)) next.delete(currentIndex);
          else next.add(currentIndex);
          return next;
      });
      playSFX('click');
  }, [currentIndex, playSFX]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isPaused || showCalculator || showReference) return;
      if (e.key >= '1' && e.key <= '4') handleAnswer(parseInt(e.key) - 1);
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(prev => prev - 1);
      if (e.key === 'm' || e.key === 'M') toggleMark();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, isPaused, answered, showCalculator, showReference, handleAnswer, questions.length, toggleMark]); 

  return (
    <div className="flex flex-col min-h-screen max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8 relative z-10 overflow-hidden">
      
      {/* Low Time Visual Cue */}
      {isTimed && timeLeft <= 10 && (
        <div className="fixed inset-0 pointer-events-none z-50">
             <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
             <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-rose-900/40 to-transparent"></div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 md:mb-8 animate-fade-in gap-2 shrink-0 relative z-20">
        <QuizHeaderLeft 
            subject={subject}
            showCalculator={showCalculator}
            setShowCalculator={setShowCalculator}
            showReference={showReference}
            setShowReference={setShowReference}
            setShowExitConfirm={setShowExitConfirm}
            questions={questions}
            currentIndex={currentIndex}
            history={history}
            markedIndices={markedIndices}
        />
        {isTimed && <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} isPaused={isPaused} onTogglePause={() => setIsPaused(!isPaused)} />}
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-500 relative z-20 ${isPaused ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'}`}>
          <QuestionView 
              currentQ={currentQ}
              currentIndex={currentIndex}
              answered={answered}
              handleAnswer={handleAnswer}
              playSFX={playSFX}
              isMarked={markedIndices.has(currentIndex)}
              toggleMark={toggleMark}
          />
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
          <div className="glass-card p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-center max-w-sm w-full">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">Abort SAT A! Session?</h2>
            <p className="text-white/50 mb-6 md:mb-8 text-xs md:text-sm">Progress will be lost.</p>
            <div className="flex gap-3 md:gap-4">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm md:text-base font-medium">Resume</button>
              <button onClick={onExit} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/20 text-sm md:text-base font-medium">Exit</button>
            </div>
          </div>
        </div>
      )}

      {showCalculator && (
        <div style={{ left: window.innerWidth < 768 ? 10 : calcPos.x, top: window.innerWidth < 768 ? 60 : calcPos.y, width: window.innerWidth < 768 ? 'calc(100% - 20px)' : calcSize.w, height: window.innerWidth < 768 ? 'calc(100% - 100px)' : calcSize.h, zIndex: 100 }} className="fixed flex flex-col bg-[#111] rounded-xl border border-white/20 shadow-2xl overflow-hidden animate-fade-in">
            <div onMouseDown={(e) => { if (window.innerWidth >= 768) { setIsDragging(true); dragRef.current = { startX: e.clientX, startY: e.clientY, startLeft: calcPos.x, startTop: calcPos.y, startW: 0, startH: 0 }; } }} className="h-10 bg-white/10 border-b border-white/10 flex justify-between items-center px-3 cursor-move">
                <span className="text-[10px] md:text-xs font-bold text-white/90">Desmos Calculator</span>
                <button onClick={() => setShowCalculator(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 bg-white relative">
                <div ref={calculatorContainerRef} className="w-full h-full"></div>
            </div>
            {window.innerWidth >= 768 && <div onMouseDown={(e) => { setIsResizing(true); dragRef.current = { startX: e.clientX, startY: e.clientY, startLeft: 0, startTop: 0, startW: calcSize.w, startH: calcSize.h }; }} className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"></div>}
        </div>
      )}
    </div>
  );
};

export default QuizScreen;