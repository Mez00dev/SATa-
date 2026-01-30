import React, { useState } from 'react';
import { AnswerHistory, Question } from '../types';
import { RotateCcw, Home, CheckCircle, XCircle, Trophy, BarChart2, AlertCircle } from 'lucide-react';

interface ResultScreenProps {
  score: number;
  total: number;
  history: AnswerHistory[];
  questions: Question[];
  onRetry: () => void;
  onHome: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, history, questions, onRetry, onHome }) => {
  const [showReview, setShowReview] = useState(false);
  
  const percentage = Math.round((score / total) * 100);
  const satScore = Math.round((score / total) * 800);
  
  let feedback = "Good Effort";
  let color = "from-blue-400 to-cyan-300";
  if (percentage >= 90) { feedback = "Outstanding Performance"; color = "from-emerald-400 to-teal-300"; }
  else if (percentage >= 70) { feedback = "Great Job"; color = "from-indigo-400 to-purple-300"; }
  else if (percentage < 50) { feedback = "Keep Practicing"; color = "from-orange-400 to-red-300"; }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in relative z-10 selection:bg-white/20">
      
      <div className="glass-card w-full max-w-3xl rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden shadow-2xl">
        
        {/* Confetti / Glow Background Effect based on score */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-gradient-to-b ${color} opacity-10 blur-[100px] pointer-events-none rounded-full`}></div>

        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">Session Complete</span>
            </div>
            
            <h1 className={`text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b ${color} tracking-tighter mb-2 drop-shadow-lg`}>
                {satScore}
            </h1>
            <p className="text-white/40 text-lg font-medium tracking-wide mb-8">SCALED SCORE ESTIMATE</p>

            <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-3xl font-bold text-white mb-1">{percentage}%</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">Accuracy</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-3xl font-bold text-emerald-400 mb-1">{score}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">Correct</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-3xl font-bold text-red-400 mb-1">{total - score}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">Incorrect</span>
                </div>
            </div>

            <p className="text-2xl text-white font-medium mb-10">{feedback}</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
                <button 
                    onClick={onRetry}
                    className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                    <RotateCcw className="w-5 h-5" /> Retry Similar
                </button>
                <button 
                    onClick={onHome}
                    className="w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Home className="w-5 h-5" /> Dashboard
                </button>
            </div>

            <button 
                onClick={() => setShowReview(!showReview)}
                className="text-white/40 hover:text-white text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
            >
                <BarChart2 className="w-4 h-4" />
                {showReview ? "Hide Analysis" : "Analyze Mistakes"}
            </button>
        </div>
      </div>

      {showReview && (
        <div className="w-full max-w-3xl mt-8 space-y-6 pb-12 animate-slide-up">
            <h3 className="text-white/50 text-sm font-bold uppercase tracking-widest mb-4 ml-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error Analysis
            </h3>
            {history.map((h, i) => {
                const q = questions[h.questionIndex];
                const isCorrect = h.chosenIndex === h.correctIndex;
                if (isCorrect) return null; 

                return (
                    <div key={i} className="glass-card rounded-[2rem] p-8 hover:bg-white/[0.07] transition-colors relative overflow-hidden">
                        {/* Red Accent Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500/50"></div>
                        
                        <div className="flex flex-col gap-6 pl-4">
                            {/* Question Section */}
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                                    Question {h.questionIndex + 1}
                                </span>
                                <h3 className="text-xl font-medium text-white/90 leading-relaxed font-serif tracking-wide">{q.q}</h3>
                            </div>

                            {/* Options Comparison */}
                            <div className="grid grid-cols-1 gap-2">
                                {q.a.map((option, idx) => {
                                    let optionClass = "p-4 rounded-xl border text-sm font-medium transition-all flex items-center gap-3 ";
                                    
                                    if (idx === h.correctIndex) {
                                        // Correct Answer Style
                                        optionClass += "bg-emerald-500/10 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                                    } else if (idx === h.chosenIndex) {
                                        // Wrong User Selection Style
                                        optionClass += "bg-red-500/10 border-red-500/40 text-red-200";
                                    } else {
                                        // Other options - dimmed
                                        optionClass += "bg-white/5 border-transparent text-white/30 opacity-60";
                                    }

                                    return (
                                        <div key={idx} className={optionClass}>
                                            <span className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold
                                                ${idx === h.correctIndex ? 'bg-emerald-500 text-black' : 
                                                  idx === h.chosenIndex ? 'bg-red-500 text-black' : 'bg-white/10 text-white/50'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="flex-1">{option}</span>
                                            {idx === h.correctIndex && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                                            {idx === h.chosenIndex && <XCircle className="w-5 h-5 text-red-400" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {history.every(h => h.chosenIndex === h.correctIndex) && (
                <div className="text-center py-16 glass-card rounded-[2.5rem] border border-emerald-500/20 bg-emerald-900/10">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">Flawless Victory</h3>
                    <p className="text-white/60">Perfection achieved. No mistakes to analyze.</p>
                </div>
            )}
        </div>
      )}

    </div>
  );
};

export default ResultScreen;