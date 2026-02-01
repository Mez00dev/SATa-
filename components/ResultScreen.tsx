import React, { useState, useEffect, memo } from 'react';
import { AnswerHistory, Question } from '../types';
import { RotateCcw, Home, CheckCircle, XCircle, Trophy, BarChart2, AlertCircle } from 'lucide-react';

interface ResultScreenProps {
  score: number;
  total: number;
  history: AnswerHistory[];
  questions: Question[];
  onRetry: () => void;
  onHome: () => void;
  playSFX: (type: 'click' | 'success' | 'error' | 'purchase' | 'levelup' | 'hover') => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, history, questions, onRetry, onHome, playSFX }) => {
  const [showReview, setShowReview] = useState(false);
  
  const percentage = Math.round((score / total) * 100);
  const satScore = Math.round((score / total) * 800);
  
  let feedback = "Good Effort";
  let color = "from-blue-400 to-cyan-300";
  if (percentage >= 90) { feedback = "Outstanding Performance"; color = "from-emerald-400 to-teal-300"; }
  else if (percentage >= 70) { feedback = "Great Job"; color = "from-indigo-400 to-purple-300"; }
  else if (percentage < 50) { feedback = "Keep Practicing"; color = "from-orange-400 to-red-300"; }

  useEffect(() => {
    if (percentage > 80) playSFX('levelup');
    else playSFX('success');
  }, []);

  return (
    <div className="flex flex-col items-center justify-start md:justify-center min-h-screen p-4 animate-fade-in relative z-10 selection:bg-white/20 overflow-y-auto">
      
      <div className="glass-card w-full max-w-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-14 text-center relative overflow-hidden shadow-2xl mt-8 md:mt-0 shrink-0">
        
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-gradient-to-b ${color} opacity-10 blur-[100px] pointer-events-none rounded-full`}></div>

        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 md:mb-8 backdrop-blur-md">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Session Complete</span>
            </div>
            
            <h1 className={`text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b ${color} tracking-tighter mb-1 md:mb-2 drop-shadow-lg`}>
                {satScore}
            </h1>
            <p className="text-white/40 text-xs md:text-lg font-medium tracking-wide mb-6 md:mb-8 uppercase">Scaled Score Estimate</p>

            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-10 max-w-lg mx-auto">
                <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{percentage}%</span>
                    <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-white/40 font-bold">Accuracy</span>
                </div>
                <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-xl md:text-3xl font-bold text-emerald-400 mb-0.5 md:mb-1">{score}</span>
                    <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-white/40 font-bold">Correct</span>
                </div>
                <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-xl md:text-3xl font-bold text-rose-400 mb-0.5 md:mb-1">{total - score}</span>
                    <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-white/40 font-bold">Incorrect</span>
                </div>
            </div>

            <p className="text-xl md:text-2xl text-white font-medium mb-8 md:mb-10">{feedback}</p>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-center mb-6 md:mb-8">
                <button 
                    onClick={onRetry}
                    className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-sm md:text-base"
                >
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> Retry Session
                </button>
                <button 
                    onClick={onHome}
                    className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                    <Home className="w-4 h-4 md:w-5 md:h-5" /> Dashboard
                </button>
            </div>

            <button 
                onClick={() => setShowReview(!showReview)}
                className="text-white/40 hover:text-white text-[10px] md:text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors"
            >
                <BarChart2 className="w-4 h-4" />
                {showReview ? "Hide Analysis" : "Analyze Mistakes"}
            </button>
        </div>
      </div>

      {showReview && (
        <div className="w-full max-w-3xl mt-6 md:mt-8 space-y-4 md:space-y-6 pb-12 animate-slide-up shrink-0">
            <h3 className="text-white/50 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-4 ml-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Detailed Error Analysis
            </h3>
            {history.map((h, i) => {
                const q = questions[h.questionIndex];
                const isCorrect = h.chosenIndex === h.correctIndex;
                if (isCorrect) return null; 

                return (
                    <div key={i} className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 hover:bg-white/[0.07] transition-colors relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-rose-500/50"></div>
                        
                        <div className="flex flex-col gap-4 md:gap-6 pl-2 md:pl-4">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
                                    <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-white/5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        Question {h.questionIndex + 1}
                                    </span>
                                    {q.type && (
                                        <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-indigo-500/10 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                            {q.type}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm md:text-xl font-medium text-white/90 leading-relaxed tracking-wide whitespace-pre-wrap">{q.q}</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {q.a.map((option, idx) => {
                                    let optionClass = "p-3 md:p-4 rounded-xl border text-[11px] md:text-sm font-medium transition-all flex items-center gap-2 md:gap-3 ";
                                    
                                    if (idx === h.correctIndex) {
                                        optionClass += "bg-emerald-500/10 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                                    } else if (idx === h.chosenIndex) {
                                        optionClass += "bg-rose-500/10 border-rose-500/40 text-rose-200";
                                    } else {
                                        optionClass += "bg-white/5 border-transparent text-white/30 opacity-60";
                                    }

                                    return (
                                        <div key={idx} className={optionClass}>
                                            <span className={`flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-md text-[10px] md:text-xs font-bold shrink-0
                                                ${idx === h.correctIndex ? 'bg-emerald-500 text-black' : 
                                                  idx === h.chosenIndex ? 'bg-rose-500 text-black' : 'bg-white/10 text-white/50'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="flex-1">{option}</span>
                                            {idx === h.correctIndex && <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 shrink-0" />}
                                            {idx === h.chosenIndex && <XCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-400 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {history.every(h => h.chosenIndex === h.correctIndex) && (
                <div className="text-center py-10 md:py-16 glass-card rounded-[2rem] border border-emerald-500/20 bg-emerald-900/10 shrink-0 mx-2">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 italic">FLAWLESS PERFORMANCE</h3>
                    <p className="text-xs md:text-sm text-white/60">Perfection achieved. No mistakes to analyze.</p>
                </div>
            )}
        </div>
      )}
      <div className="h-10 md:hidden shrink-0"></div>
    </div>
  );
};

export default memo(ResultScreen);