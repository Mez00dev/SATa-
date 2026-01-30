import React, { useState } from 'react';
import { Subject, Difficulty, Mode, StreakData, Stats } from '../types';
import { Flame, Clock, BookOpen, Settings, Play, Sparkles, Brain, PenTool, Database, Snowflake, Trophy, Target, Zap, Maximize, Minimize } from 'lucide-react';

interface SetupScreenProps {
  onStart: (subject: Subject, difficulty: Difficulty, mode: Mode) => void;
  onDaily: () => void;
  onSettings: () => void;
  onOpenBank: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  streak: StreakData;
  stats: Stats;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ 
  onStart, onDaily, onSettings, onOpenBank, toggleFullscreen, isFullscreen, streak, stats 
}) => {
  const [subject, setSubject] = useState<Subject>('math');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<Mode>('timed');

  const isDailyDone = streak.lastDate === new Date().toDateString();

  // Level Calculation
  const totalScore = stats.totalScore || 0;
  const level = Math.floor(Math.sqrt(totalScore / 100)) + 1;
  const currentLevelScore = Math.pow(level - 1, 2) * 100;
  const nextLevelScore = Math.pow(level, 2) * 100;
  const progressRaw = ((totalScore - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;
  const progress = Math.min(100, Math.max(0, isNaN(progressRaw) ? 0 : progressRaw));
  
  const getRankTitle = (lvl: number) => {
      if (lvl >= 50) return "Grandmaster";
      if (lvl >= 30) return "Legend";
      if (lvl >= 20) return "Elite";
      if (lvl >= 10) return "Scholar";
      if (lvl >= 5) return "Apprentice";
      return "Novice";
  };
  const rank = getRankTitle(level);

  // Generate Week Days for History
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
        day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        active: streak.history ? streak.history[6 - i] : false // Reverse mapping (index 0 is today)
    };
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 relative z-10 selection:bg-indigo-500/30">
      
      {/* Top Bar with Leveling & Settings */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
        
        {/* Level Widget */}
        <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 p-2 pr-6 rounded-full animate-slide-in-right shadow-lg">
            <div className="relative w-12 h-12 flex items-center justify-center bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <Trophy className="w-5 h-5 text-indigo-300" />
                {/* Circular Progress SVG */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle cx="24" cy="24" r="23" fill="none" stroke="#818cf8" strokeWidth="2" 
                        strokeDasharray={144.5} strokeDashoffset={144.5 - (144.5 * progress) / 100} strokeLinecap="round" />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Lvl {level} {rank}</span>
                <span className="text-xs text-white/60 font-medium">{Math.floor(totalScore)} XP</span>
            </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
             <button 
                onClick={toggleFullscreen}
                className="md:hidden p-3 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 transition-colors group"
              >
                {isFullscreen ? <Minimize className="w-5 h-5 text-white/60" /> : <Maximize className="w-5 h-5 text-white/60" />}
             </button>

            <button 
              onClick={onSettings}
              className="p-3 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 transition-colors group"
            >
              <Settings className="w-5 h-5 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all" />
            </button>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-8 animate-slide-up">
        
        {/* Header Title */}
        <div className="text-center space-y-2 mt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" /> SAT Prep Redefined
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter drop-shadow-2xl italic">
                SAT A!
            </h1>
            <p className="text-lg text-white/40 font-medium tracking-wide">
                Your direct path to a 1600.
            </p>
        </div>

        {/* Streak & Daily Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ENHANCED STREAK CARD */}
            <div className="glass-card p-5 rounded-[1.5rem] flex flex-col justify-between relative overflow-hidden group min-h-[160px] border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Streak</span>
                        <div className="flex items-baseline gap-1">
                             <span className="text-4xl font-black text-white">{streak.count}</span>
                             <span className="text-sm font-bold text-orange-500">Days</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg text-xs font-bold text-blue-300 border border-blue-500/20" title="Streak Freezes Available">
                        <Snowflake className="w-3.5 h-3.5" /> {streak.freezes}
                    </div>
                </div>

                {/* 7-Day History Calendar */}
                <div className="flex justify-between items-end mt-auto pt-2">
                    {weekDays.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${d.active 
                                    ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)] scale-110' 
                                    : 'bg-white/5 text-white/20'}`}>
                                {d.active ? <Flame className="w-4 h-4 fill-current" /> : d.day}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DAILY CHALLENGE CARD */}
            <button 
                onClick={onDaily}
                disabled={isDailyDone}
                className={`p-5 rounded-[1.5rem] flex flex-col justify-between relative overflow-hidden transition-all border min-h-[160px] group
                    ${isDailyDone 
                        ? 'bg-emerald-500/10 border-emerald-500/20 cursor-default' 
                        : 'glass-card hover:bg-white/5 hover:border-indigo-500/40 cursor-pointer active:scale-[0.98]'}`}
            >
                 <div className="flex justify-between items-start w-full relative z-10">
                     <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Daily Ops</span>
                        <h3 className="text-xl font-bold text-white mt-1">
                            {isDailyDone ? "Mission Complete" : "Target Acquired"}
                        </h3>
                     </div>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${isDailyDone ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}>
                        {isDailyDone ? <Target className="w-5 h-5 text-emerald-400" /> : <Zap className="w-5 h-5 text-indigo-400" />}
                     </div>
                 </div>

                 <div className="mt-auto relative z-10">
                    {isDailyDone ? (
                        <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Refreshes at midnight
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-white/60">XP Multiplier Active</span>
                            <span className="px-3 py-1 bg-white text-black text-xs font-black rounded-full uppercase">Start</span>
                        </div>
                    )}
                 </div>
                 
                 {!isDailyDone && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 group-hover:opacity-100 opacity-0 transition-opacity"></div>}
            </button>
        </div>

        {/* Setup Controls */}
        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] space-y-8 relative shadow-2xl border border-white/10">
            
            {/* Subject Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Subject</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-black/20 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setSubject('math')}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all
                        ${subject === 'math' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Brain className="w-4 h-4" /> Math
                    </button>
                    <button 
                        onClick={() => setSubject('english')}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all
                        ${subject === 'english' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <PenTool className="w-4 h-4" /> English
                    </button>
                </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`py-3 rounded-xl border text-sm font-bold capitalize transition-all duration-300
                            ${difficulty === d 
                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
                                : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Mode</label>
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 relative">
                    <button 
                        onClick={() => setMode('timed')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                        ${mode === 'timed' ? 'bg-red-500/80 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                    >
                        <Clock className="w-3.5 h-3.5" /> Timed
                    </button>
                    <button 
                        onClick={() => setMode('practice')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                        ${mode === 'practice' ? 'bg-emerald-500/80 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                    >
                        <BookOpen className="w-3.5 h-3.5" /> Practice
                    </button>
                </div>
            </div>

            {/* Start Action */}
            <button 
                onClick={() => onStart(subject, difficulty, mode)}
                className="w-full group relative py-6 bg-white text-black rounded-2xl font-black text-xl tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="flex items-center justify-center gap-2 relative z-10">
                    START SESSION <Play className="w-6 h-6 fill-current" />
                </span>
            </button>

            {/* Question Bank Link */}
            <button 
                onClick={onOpenBank}
                className="w-full text-center text-xs font-bold text-white/30 hover:text-indigo-300 transition-colors flex items-center justify-center gap-2"
            >
                <Database className="w-3 h-3" /> BROWSE QUESTION BANK
            </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
