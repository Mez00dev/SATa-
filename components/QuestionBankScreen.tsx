import React, { useState, useMemo } from 'react';
import { QUESTIONS } from '../constants';
import { ChevronLeft, Search, Brain, PenTool, Eye, EyeOff, Filter, Hash } from 'lucide-react';
import { Subject, Difficulty } from '../types';

interface QuestionBankScreenProps {
  onBack: () => void;
}

const QuestionBankScreen: React.FC<QuestionBankScreenProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  // Flatten and normalize data
  const allQuestions = useMemo(() => {
    const list = [];
    let idCounter = 0;
    
    // Math
    (['easy', 'medium', 'hard'] as Difficulty[]).forEach(diff => {
      QUESTIONS.math[diff].forEach(q => {
        list.push({ ...q, subject: 'math' as Subject, difficulty: diff, id: idCounter++ });
      });
    });

    // English
    (['easy', 'medium', 'hard'] as Difficulty[]).forEach(diff => {
      QUESTIONS.english[diff].forEach(q => {
        list.push({ ...q, subject: 'english' as Subject, difficulty: diff, id: idCounter++ });
      });
    });

    return list;
  }, []);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchesSearch = q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.topic?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
      const matchesDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      return matchesSearch && matchesSubject && matchesDiff;
    });
  }, [searchTerm, filterSubject, filterDifficulty, allQuestions]);

  const toggleReveal = (id: number) => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedAnswers(newRevealed);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto px-4 py-6 relative z-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={onBack}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Question Bank
              </span>
            </h1>
            <p className="text-white/40 text-sm font-medium">
              {filteredQuestions.length} questions available
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto bg-black/20 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-indigo-500/30 transition-all"
            />
          </div>

          <div className="h-px md:h-auto md:w-px bg-white/10 mx-1"></div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
             <select 
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value as any)}
                className="bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-sm text-white/70 focus:outline-none focus:bg-white/10 cursor-pointer"
             >
                <option value="all">All Subjects</option>
                <option value="math">Math</option>
                <option value="english">English</option>
             </select>

             <select 
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value as any)}
                className="bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-sm text-white/70 focus:outline-none focus:bg-white/10 cursor-pointer"
             >
                <option value="all">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
             </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {filteredQuestions.map((q) => {
          const isRevealed = revealedAnswers.has(q.id);
          
          return (
            <div 
                key={q.id} 
                className="glass-card p-6 rounded-[1.5rem] flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                    <span className={`p-2 rounded-lg ${q.subject === 'math' ? 'bg-indigo-500/10 text-indigo-300' : 'bg-purple-500/10 text-purple-300'}`}>
                        {q.subject === 'math' ? <Brain className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center border
                        ${q.difficulty === 'easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 
                          q.difficulty === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 
                          'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                        {q.difficulty}
                    </span>
                </div>
                <div className="text-xs text-white/20 font-mono">#{q.id + 1}</div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                {q.topic && (
                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {q.topic}
                    </div>
                )}
                <p className="text-white/90 font-medium leading-relaxed font-serif">
                    {q.q}
                </p>
              </div>

              {/* Options & Interaction */}
              <div className="space-y-3 mt-auto">
                {isRevealed ? (
                    <div className="space-y-2 animate-fade-in">
                        {q.a.map((opt, idx) => (
                            <div 
                                key={idx} 
                                className={`text-sm p-2 rounded-lg flex gap-3 items-center border ${
                                    idx === q.correct 
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' 
                                    : 'bg-white/5 border-transparent text-white/40'
                                }`}
                            >
                                <span className="font-bold w-5 h-5 flex items-center justify-center bg-black/20 rounded text-xs">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {opt}
                            </div>
                        ))}
                    </div>
                ) : (
                    <button 
                        onClick={() => toggleReveal(q.id)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Reveal Answer
                    </button>
                )}

                {isRevealed && (
                    <button 
                        onClick={() => toggleReveal(q.id)}
                        className="w-full py-2 bg-transparent text-xs font-medium text-white/30 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <EyeOff className="w-3 h-3" /> Hide
                    </button>
                )}
              </div>

              {/* Decorative Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-20 pointer-events-none transition-colors duration-500
                 ${q.subject === 'math' ? 'bg-indigo-600' : 'bg-purple-600'}`}></div>

            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/30">
                <Filter className="w-12 h-12 mb-4 opacity-50" />
                <p>No questions found matching your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankScreen;