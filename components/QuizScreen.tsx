import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, AnswerHistory, Subject } from '../types';
import { Pause, Play, ChevronLeft, ChevronRight, Home, Clock, Calculator, FileText, X, GripHorizontal, Scaling } from 'lucide-react';

// Declare Desmos on the window object to satisfy TS
declare global {
    interface Window {
        Desmos?: any;
    }
}

interface QuizScreenProps {
  questions: Question[];
  isTimed: boolean;
  timePerQuestion: number; 
  onComplete: (score: number, history: AnswerHistory[]) => void;
  onExit: () => void;
  subject: Subject;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, isTimed, timePerQuestion, onComplete, onExit, subject }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<AnswerHistory[]>([]);
  const [timeLeft, setTimeLeft] = useState(questions.length * timePerQuestion);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime] = useState(questions.length * timePerQuestion);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Math Tools State
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  
  // Floating Calculator State
  const [calcPos, setCalcPos] = useState({ x: 50, y: 100 });
  const [calcSize, setCalcSize] = useState({ w: 600, h: 450 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs for Drag/Resize logic to avoid stale closures in event listeners
  const dragRef = useRef({ startX: 0, startY: 0, startLeft: 0, startTop: 0, startW: 0, startH: 0 });

  // Desmos Refs
  const calculatorContainerRef = useRef<HTMLDivElement>(null);
  const calculatorInstance = useRef<any>(null);

  const currentQ = questions[currentIndex];
  const answered = history.find(h => h.questionIndex === currentIndex);

  useEffect(() => {
    if (!isTimed || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimed, isPaused]);

  // Initialize Desmos only once when the math subject is active
  useEffect(() => {
    if (subject === 'math' && calculatorContainerRef.current && !calculatorInstance.current && window.Desmos) {
       calculatorInstance.current = window.Desmos.GraphingCalculator(calculatorContainerRef.current, {
           keypad: true,
           expressions: true,
           settingsMenu: true,
           zoomButtons: true,
           expressionsCollapsed: false,
           capExpressionSize: false,
           lockViewport: false,
           border: false
       });
    }
  }, [subject]); 
  
  // Trigger Desmos resize when container size changes
  useEffect(() => {
    if (calculatorInstance.current) {
        calculatorInstance.current.resize();
    }
  }, [calcSize, showCalculator]);

  // --- Drag & Resize Logic ---
  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: calcPos.x,
        startTop: calcPos.y,
        startW: 0, 
        startH: 0
    };
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: 0, 
        startTop: 0,
        startW: calcSize.w,
        startH: calcSize.h
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setCalcPos({
                x: Math.max(0, dragRef.current.startLeft + dx),
                y: Math.max(0, dragRef.current.startTop + dy)
            });
        }
        if (isResizing) {
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setCalcSize({
                w: Math.max(300, dragRef.current.startW + dx),
                h: Math.max(250, dragRef.current.startH + dy)
            });
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    if (isDragging || isResizing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        // Prevent selection while dragging
        document.body.style.userSelect = 'none';
    } else {
        document.body.style.userSelect = '';
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing]);


  const finishQuiz = useCallback(() => {
    // Cleanup calculator
    if (calculatorInstance.current) {
        calculatorInstance.current.destroy();
        calculatorInstance.current = null;
    }

    let score = 0;
    history.forEach(h => {
        if(questions[h.questionIndex].correct === h.chosenIndex) score++;
    });
    onComplete(score, history);
  }, [history, questions, onComplete]);

  useEffect(() => {
    if (history.length === questions.length) {
        setTimeout(() => finishQuiz(), 800);
    }
  }, [history, questions.length, finishQuiz]);

  const handleAnswer = (choiceIndex: number) => {
    if (answered) return;
    
    setHistory(prev => [...prev, {
      questionIndex: currentIndex,
      correctIndex: currentQ.correct,
      chosenIndex: choiceIndex
    }]);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 800);
    }
  };

  const getTimeProgress = () => (timeLeft / totalTime) * 100;
  
  // Timer Visual Logic
  const percentage = getTimeProgress();
  let phase: 'normal' | 'warning' | 'danger' | 'critical' = 'normal';
  if (timeLeft <= 10) phase = 'critical';
  else if (percentage <= 25) phase = 'danger';
  else if (percentage <= 50) phase = 'warning';

  const timerStyles = {
      normal: {
          text: 'text-emerald-400',
          stroke: 'text-emerald-400',
          container: 'bg-emerald-900/10 border-emerald-500/20',
          shadow: ''
      },
      warning: {
          text: 'text-amber-400',
          stroke: 'text-amber-400',
          container: 'bg-amber-900/10 border-amber-500/30',
          shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]'
      },
      danger: {
          text: 'text-orange-500',
          stroke: 'text-orange-500',
          container: 'bg-orange-900/10 border-orange-500/40',
          shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]'
      },
      critical: {
          text: 'text-rose-500',
          stroke: 'text-rose-500',
          container: 'bg-rose-900/20 border-rose-500/50',
          shadow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]'
      }
  };

  const currentStyle = timerStyles[phase];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Disable shortcuts if calculator or reference is open to prevent accidental answers
      if (isPaused || showCalculator || showReference) return;
      
      if (e.key >= '1' && e.key <= '4') {
        handleAnswer(parseInt(e.key) - 1);
      }
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, isPaused, answered, showCalculator, showReference]); 

  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="glass-card p-8 rounded-[2rem] text-center max-w-sm w-full mx-4">
          <h2 className="text-2xl font-bold mb-2 text-white">Abort Session?</h2>
          <p className="text-white/50 mb-8 text-sm">Progress will not be saved.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowExitConfirm(false)}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Resume
            </button>
            <button 
              onClick={onExit}
              className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/20 font-medium transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-5xl mx-auto px-6 py-8 relative z-10">
      
      {/* Top HUD */}
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div className="flex items-center gap-4">
            <button onClick={() => setShowExitConfirm(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5">
                <Home className="w-5 h-5 text-white/60" />
            </button>

            {/* Math Tools */}
            {subject === 'math' && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowCalculator(!showCalculator)}
                        className={`p-3 rounded-full transition-all border ${showCalculator ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                        title="Toggle Desmos Calculator"
                    >
                        <Calculator className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setShowReference(true)}
                        className={`p-3 rounded-full transition-all border ${showReference ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                        title="Reference Sheet"
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>

        {/* Question Counter Pills */}
        <div className="hidden md:flex gap-1.5 overflow-x-auto max-w-[40%] md:max-w-[50%] no-scrollbar px-2 py-1 mx-4">
            {questions.map((_, i) => {
                const status = history.find(h => h.questionIndex === i);
                const isActive = i === currentIndex;
                
                let colorClass = "bg-white/10 border-transparent";
                if (isActive) colorClass = "bg-indigo-500 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110";
                else if (status?.chosenIndex === status?.correctIndex) colorClass = "bg-emerald-500/50 border-emerald-500/30";
                else if (status) colorClass = "bg-red-500/50 border-red-500/30";
                
                return (
                    <div 
                        key={i}
                        className={`w-2 h-2 md:w-3 md:h-1 rounded-full border transition-all duration-300 shrink-0 ${colorClass}`}
                    />
                );
            })}
        </div>

        {isTimed && (
            <div className={`flex items-center gap-4 px-5 py-3 rounded-full border transition-all duration-500 ${currentStyle.container} ${currentStyle.shadow}`}>
                <div className={`relative w-12 h-12 flex items-center justify-center ${phase === 'critical' ? 'animate-pulse' : ''}`}>
                    {/* Background Circle */}
                    <svg className="absolute w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                        <circle 
                            cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" 
                            className={`${currentStyle.stroke} transition-all duration-1000`}
                            strokeDasharray={125.6} 
                            strokeDashoffset={125.6 - (125.6 * percentage) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className={`text-sm font-black font-mono tracking-tighter ${currentStyle.text}`}>
                        {timeLeft < 60 ? timeLeft : Math.ceil(timeLeft / 60)}
                        <span className="text-[9px] opacity-70 ml-0.5">{timeLeft < 60 ? 's' : 'm'}</span>
                    </span>
                </div>
                
                <div className="h-8 w-px bg-white/10 mx-1"></div>

                <button onClick={() => setIsPaused(!isPaused)} className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                    {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                </button>
            </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col justify-center transition-all duration-500 ${isPaused ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'}`}>
        
        {/* Question Box */}
        <div className="glass-card rounded-[2rem] p-8 md:p-12 mb-8 animate-slide-up shadow-2xl relative overflow-hidden">
             {/* Decorative Background Number */}
             <div className="absolute -right-4 -bottom-10 text-[10rem] font-black text-white/5 select-none font-sans leading-none pointer-events-none">
                 {currentIndex + 1}
             </div>
             
             {/* Topic Tag if available */}
             {currentQ.topic && (
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                    {currentQ.topic}
                </div>
             )}

             <h2 className="text-2xl md:text-4xl font-bold leading-tight relative z-10 text-glow">
                {currentQ.q}
             </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.a.map((ans, idx) => {
            let btnClass = "group relative p-6 rounded-2xl border-2 text-lg font-medium transition-all duration-300 transform active:scale-[0.98] text-left overflow-hidden ";
            
            if (answered) {
              if (idx === currentQ.correct) btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.3)] z-10 scale-[1.02] ";
              else if (idx === answered.chosenIndex) btnClass += "bg-red-500/10 border-red-500/50 text-red-200 opacity-60 ";
              else btnClass += "bg-white/5 border-transparent opacity-30 blur-[1px] ";
            } else {
              btnClass += "bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 ";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={!!answered}
                className={btnClass}
              >
                {/* Number badge */}
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-4 text-sm font-bold transition-colors
                    ${answered && idx === currentQ.correct ? 'bg-emerald-500 text-emerald-950' : 'bg-white/10 group-hover:bg-white/20'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                
                <span className="relative z-10">{ans}</span>
                
                {/* Hover shine for unselected */}
                {!answered && (
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-8 text-white/30 text-sm font-medium">
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 hover:text-white disabled:opacity-0 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="hidden md:block opacity-50">Keyboard: 1-4 to select • Arrows to nav</span>

        <button 
          onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 hover:text-white disabled:opacity-0 transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center animate-fade-in">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-8 drop-shadow-2xl">PAUSED</h2>
            <button 
                onClick={() => setIsPaused(false)}
                className="px-10 py-4 bg-white text-black rounded-full font-bold tracking-wider hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
                RESUME SESSION
            </button>
        </div>
      )}

      {/* FLOATING CALCULATOR (Draggable & Resizable) */}
      <div 
        style={{ 
            left: calcPos.x, 
            top: calcPos.y, 
            width: calcSize.w, 
            height: calcSize.h,
            display: showCalculator ? 'flex' : 'none',
            zIndex: 100 // Ensure it's above other elements
        }}
        className="fixed flex-col bg-[#111] rounded-xl border border-white/20 shadow-2xl overflow-hidden animate-fade-in"
      >
        {/* Draggable Header */}
        <div 
            onMouseDown={startDrag}
            className="h-10 bg-white/10 hover:bg-white/15 border-b border-white/10 flex justify-between items-center px-3 cursor-move select-none transition-colors"
        >
            <div className="flex items-center gap-2 text-white/90 font-bold text-sm">
                <GripHorizontal className="w-4 h-4 text-indigo-400" />
                Desmos Calculator
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setShowCalculator(false); }} 
                className="hover:bg-white/10 p-1 rounded-md transition-colors"
            >
                <X className="w-4 h-4 text-white/60 hover:text-white" />
            </button>
        </div>

        {/* Desmos Container */}
        <div className="flex-1 relative bg-white">
            <div ref={calculatorContainerRef} className="w-full h-full"></div>
        </div>

        {/* Resize Handle */}
        <div 
            onMouseDown={startResize}
            className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center cursor-nwse-resize text-black/50 hover:text-black z-10"
        >
            <Scaling className="w-4 h-4" />
        </div>
      </div>

      {/* REFERENCE SHEET MODAL (Standard Modal) */}
      {showReference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-4xl max-h-[90vh] bg-[#1e293b] rounded-2xl border border-white/10 overflow-y-auto custom-scrollbar relative shadow-2xl">
                <div className="sticky top-0 bg-[#1e293b]/95 backdrop-blur border-b border-white/5 p-4 flex justify-between items-center z-10">
                    <span className="text-white font-bold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" /> SAT Math Reference Sheet
                    </span>
                    <button onClick={() => setShowReference(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                    {/* Area & Circumference */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Area & Circumference</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                <div className="text-2xl font-serif mb-2">A = &pi;r&sup2;</div>
                                <div className="text-2xl font-serif">C = 2&pi;r</div>
                                <div className="text-[10px] uppercase mt-2 text-white/40">Circle</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                <div className="text-2xl font-serif mb-2">A = lw</div>
                                <div className="text-[10px] uppercase mt-8 text-white/40">Rectangle</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                <div className="text-2xl font-serif mb-2">A = &frac12;bh</div>
                                <div className="text-[10px] uppercase mt-2 text-white/40">Triangle</div>
                            </div>
                        </div>
                    </div>

                    {/* Volume */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Volume</h3>
                        <div className="space-y-3 font-serif text-lg">
                            <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg">
                                <span>Rectangular Prism</span>
                                <span className="text-indigo-300">V = lwh</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg">
                                <span>Cylinder</span>
                                <span className="text-indigo-300">V = &pi;r&sup2;h</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg">
                                <span>Sphere</span>
                                <span className="text-indigo-300">V = &#8308;&frasl;&#8323;&pi;r&sup3;</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg">
                                <span>Cone</span>
                                <span className="text-indigo-300">V = &#8531;&pi;r&sup2;h</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg">
                                <span>Pyramid</span>
                                <span className="text-indigo-300">V = &#8531;lwh</span>
                            </div>
                        </div>
                    </div>

                    {/* Special Right Triangles */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Special Right Triangles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 30-60-90 */}
                            <div className="bg-white/5 p-6 rounded-xl relative h-40 flex items-end justify-center">
                                <div className="w-0 h-0 border-l-[60px] border-l-transparent border-b-[100px] border-b-indigo-500/20 border-r-[0px] border-r-transparent relative">
                                    <div className="absolute -left-[30px] bottom-0 w-[60px] h-[100px] border-l-2 border-b-2 border-indigo-400"></div>
                                </div>
                                <span className="absolute bottom-2 left-[30%] text-sm">x</span>
                                <span className="absolute left-[30%] top-[40%] text-sm">2x</span>
                                <span className="absolute bottom-2 right-[30%] text-sm">x&radic;3</span>
                                <span className="absolute top-4 right-4 text-xs font-bold text-white/50">30&deg;-60&deg;-90&deg;</span>
                            </div>
                            
                            {/* 45-45-90 */}
                            <div className="bg-white/5 p-6 rounded-xl relative h-40 flex items-end justify-center">
                                <div className="w-24 h-24 border-l-2 border-b-2 border-indigo-400 relative">
                                    <div className="absolute top-0 right-0 w-[140%] h-[1px] bg-indigo-400 origin-top-left rotate-45"></div>
                                </div>
                                <span className="absolute bottom-2 left-[40%] text-sm">s</span>
                                <span className="absolute left-[20%] bottom-[40%] text-sm">s</span>
                                <span className="absolute top-[35%] right-[25%] text-sm">s&radic;2</span>
                                <span className="absolute top-4 right-4 text-xs font-bold text-white/50">45&deg;-45&deg;-90&deg;</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 text-center text-white/30 text-xs italic">
                        The number of degrees of arc in a circle is 360. <br/>
                        The number of radians of arc in a circle is 2&pi;. <br/>
                        The sum of the measures in degrees of the angles of a triangle is 180.
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default QuizScreen;