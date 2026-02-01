import React, { useState, memo } from 'react';
import { Subject, Difficulty, Mode, StreakData, Stats } from '../types';
import { Flame, Settings, Play, Sparkles, Brain, PenTool, Snowflake, Trophy, Target, Zap, Maximize, Minimize, ChevronRight, Star, Gem, TrendingUp, Layers } from 'lucide-react';

interface SetupScreenProps {
  onStart: (subject: Subject, difficulty: Difficulty, mode: Mode) => void;
  onDaily: () => void;
  onSettings: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  streak: StreakData;
  stats: Stats;
  playSFX: (type: 'click' | 'hover') => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ 
  onStart, onDaily, onSettings, toggleFullscreen, isFullscreen, streak, stats, playSFX 
}) => {
  const [subject, setSubject] = useState<Subject>('math');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // Use UTC date string matching App.tsx logic
  const todayUTC = new Date().toISOString().split('T')[0];
  const isDailyDone = streak.lastDate === todayUTC;

  const totalScore = stats.totalScore || 0;
  const level = stats.level || Math.floor(Math.sqrt(totalScore / 100)) + 1;
  const currentLevelScore = Math.pow(level - 1, 2) * 100;
  const nextLevelScore = Math.pow(level, 2) * 100;
  const xpInLevel = totalScore - currentLevelScore;
  const xpNeededForNext = nextLevelScore - currentLevelScore;
  const progressRaw = (xpInLevel / xpNeededForNext) * 100;
  const progress = Math.min(100, Math.max(0, isNaN(progressRaw) ? 0 : progressRaw));
  
  const getRankTitle = (lvl: number) => {
      if (lvl >= 150) return "SAT MASTER";
      if (lvl >= 100) return "MYTHIC";
      if (lvl >= 75) return "TITAN";
      if (lvl >= 50) return "LEGEND";
      if (lvl >= 25) return "ELITE";
      if (lvl >= 10) return "SCHOLAR";
      if (lvl >= 5) return "APPRENTICE";
      return "NOVICE";
  };
  const rank = getRankTitle(level);
  const isMaster = level >= 150;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
        day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        active: streak.history ? streak.history[6 - i] : false
    };
  });

  // Milestones logic
  const nextMilestone = streak.count < 7 ? 7 : streak.count < 30 ? 30 : streak.count < 100 ? 100 : 365;
  const milestoneProgress = (streak.count / nextMilestone) * 100;

  return (
    <div className="flex flex-col items-center justify-start md:justify-center min-h-screen px-4 py-8 md:py-6 relative z-10 selection:bg-indigo-500/30 overflow-y-auto">
      
      {/* Dynamic HUD */}
      <div className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 pointer-events-none">
        <div className={`pointer-events-auto flex items-center gap-3 md:gap-4 bg-black/40 backdrop-blur-md border border-white/10 p-1.5 md:p-2 pr-4 md:pr-6 rounded-full animate-slide-in-right shadow-lg group transition-all duration-500 hover:scale-105 ${isMaster ? 'border-yellow-500/40 shadow-yellow-500/10' : ''}`}>
            <div className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border group-hover:scale-110 transition-transform duration-300 ${isMaster ? 'bg-yellow-500/20 border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'bg-indigo-500/20 border-indigo-500/30'}`}>
                {isMaster ? <Gem className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" /> : <Trophy className="w-4 h-4 md:w-5 md:h-5 text-indigo-300" />}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle cx="50%" cy="50%" r="48%" fill="none" stroke={isMaster ? '#facc15' : '#818cf8'} strokeWidth="2.5" 
                        strokeDasharray="100 100" strokeDashoffset={100 - progress} strokeLinecap="round" 
                        pathLength="100"/>
                </svg>
                {isMaster && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />}
            </div>
            <div className="flex flex-col">
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isMaster ? 'text-yellow-400 animate-pulse' : 'text-indigo-300'}`}>
                    Lvl {level} — {rank} {isMaster && <Star className="w-2.5 h-2.5 fill-current" />}
                </span>
                <span className="text-[10px] md:text-xs text-white/60 font-bold">
                    {Math.floor(xpInLevel)} / {Math.floor(xpNeededForNext)} XP
                </span>
            </div>
        </div>

        <div className="flex gap-2 md:gap-3 pointer-events-auto">
             <button 
                onClick={toggleFullscreen}
                onMouseEnter={() => playSFX('hover')}
                className="hidden md:block p-3 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95 group"
              >
                {isFullscreen ? <Minimize className="w-5 h-5 text-white/60" /> : <Maximize className="w-5 h-5 text-white/60" />}
             </button>
            <button 
              onClick={onSettings}
              onMouseEnter={() => playSFX('hover')}
              className="p-2.5 md:p-3 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95 group"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all" />
            </button>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-6 md:space-y-8 animate-slide-up mt-16 md:mt-10">
        
        {/* Hero */}
        <div className="text-center space-y-2 relative">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] mb-2 md:mb-4 animate-fade-in hover:scale-105 transition-transform cursor-default ${isMaster ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'}`}>
                {isMaster ? <Gem className="w-3 h-3 animate-spin-slow" /> : <Sparkles className="w-3 h-3" />} {isMaster ? 'Ascended Mastery' : 'Digital SAT Prep'}
            </div>
            <h1 className={`text-6xl md:text-9xl font-black text-transparent bg-clip-text tracking-tighter drop-shadow-2xl italic transition-all duration-1000 select-none ${isMaster ? 'bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 scale-105' : 'bg-gradient-to-b from-white via-white to-white/40'}`}>
                SAT A!
            </h1>
            <p className="text-sm md:text-lg text-white/40 font-bold tracking-widest max-w-xs mx-auto md:max-w-none uppercase">
                Precision Built for Elite Scholars.
            </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Streak Card */}
            <div className="glass-card p-4 md:p-6 rounded-[1.5rem] flex flex-col justify-between relative overflow-hidden group min-h-[170px] border border-white/10 hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-orange-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Mastery Streak
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                             <span className="text-4xl md:text-5xl font-black text-white group-hover:scale-110 transition-transform duration-500 inline-block drop-shadow-lg">{streak.count}</span>
                             <span className="text-xs font-black text-orange-500">Days</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1 rounded-lg text-[10px] font-black text-blue-300 border border-blue-500/20 shadow-inner">
                            <Snowflake className="w-3.5 h-3.5 animate-spin-slow" /> {streak.freezes} / {streak.maxFreezes}
                        </div>
                        <span className="text-[8px] uppercase tracking-tighter text-white/30 font-black">Reserves</span>
                     </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span className="group-hover:text-orange-400 transition-colors">Goal: {nextMilestone} Days</span>
                        <span className="text-orange-400 font-mono">{Math.floor(milestoneProgress)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-400 transition-all duration-1000 group-hover:animate-shimmer bg-[length:200%_auto]" style={{ width: `${milestoneProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        {weekDays.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-700
                                    ${d.active 
                                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-110' 
                                        : 'bg-white/5 text-white/20 hover:bg-white/10 cursor-help'}`}>
                                    {d.active ? <Flame className="w-4 h-4 fill-current animate-bounce-slow" /> : d.day}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bounty Card */}
            <button 
                onClick={onDaily}
                onMouseEnter={() => playSFX('hover')}
                disabled={isDailyDone}
                className={`p-4 md:p-6 rounded-[1.5rem] flex flex-col justify-between relative overflow-hidden transition-all duration-300 border min-h-[170px] group
                    ${isDailyDone 
                        ? 'bg-emerald-500/10 border-emerald-500/20 cursor-default opacity-90' 
                        : 'glass-card hover:bg-white/5 hover:border-indigo-500/50 hover:shadow-indigo-500/20 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer active:scale-[0.98]'}`}
            >
                 <div className="flex justify-between items-start w-full relative z-10">
                     <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active bounty</span>
                        <h3 className="text-xl md:text-2xl font-black text-white mt-1 leading-tight group-hover:text-indigo-300 transition-colors">
                            {isDailyDone ? "Mission Clear" : "Daily Challenge"}
                        </h3>
                     </div>
                     <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg
                        ${isDailyDone ? 'bg-emerald-500/20 scale-110 shadow-emerald-500/20' : 'bg-indigo-500/20 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-indigo-500/20'}`}>
                        {isDailyDone ? <Target className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" /> : <Zap className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />}
                     </div>
                 </div>

                 <div className="mt-auto relative z-10 flex flex-col gap-3 w-full">
                    {isDailyDone ? (
                        <div className="flex items-center gap-2 text-emerald-300 text-[10px] md:text-xs font-black italic tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            MISSION SUCCESS. RESTORING ENERGY.
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] text-white/60 font-black tracking-widest uppercase">Reward: +800 XP & Streak</span>
                                <div className="p-1.5 bg-white text-black rounded transition-all group-hover:translate-x-2 group-hover:bg-indigo-500 group-hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-indigo-500 animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #6366f1 100%)' }}></div>
                            </div>
                        </>
                    )}
                 </div>
                 {!isDailyDone && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 group-hover:opacity-100 opacity-0 transition-opacity"></div>}
            </button>
        </div>

        {/* Configuration */}
        <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-6 md:space-y-8 relative shadow-2xl border border-white/10 hover:shadow-indigo-500/5 transition-all duration-500 hover:translate-y-1">
            <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">Training Program</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-black/30 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => { setSubject('math'); playSFX('click'); }}
                        className={`flex items-center justify-center gap-2 py-4 md:py-5 rounded-xl text-xs md:text-sm font-black transition-all duration-300
                        ${subject === 'math' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-[1.02]' : 'text-white/40 hover:text-white hover:bg-white/5 hover:scale-[1.01]'}`}
                    >
                        <Brain className="w-4 h-4 md:w-5 md:h-5" /> MATH DEPT.
                    </button>
                    <button 
                        onClick={() => { setSubject('english'); playSFX('click'); }}
                        className={`flex items-center justify-center gap-2 py-4 md:py-5 rounded-xl text-xs md:text-sm font-black transition-all duration-300
                        ${subject === 'english' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] scale-[1.02]' : 'text-white/40 hover:text-white hover:bg-white/5 hover:scale-[1.01]'}`}
                    >
                        <PenTool className="w-4 h-4 md:w-5 md:h-5" /> ENGLISH DEPT.
                    </button>
                </div>
            </div>

            <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">Complexity Matrix</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                        <button
                            key={d}
                            onClick={() => { setDifficulty(d); playSFX('click'); }}
                            className={`py-3 md:py-4 rounded-xl border text-[10px] md:text-xs font-black capitalize transition-all duration-300 tracking-[0.1em]
                            ${difficulty === d 
                                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-110' 
                                : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white hover:scale-105'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => onStart(subject, difficulty, 'timed')}
                    onMouseEnter={() => playSFX('hover')}
                    className={`w-full group relative py-6 md:py-8 rounded-2xl font-black text-lg md:text-2xl tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl overflow-hidden
                        ${isMaster 
                            ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-600 text-amber-950 shadow-yellow-500/40 border-t border-yellow-300/50' 
                            : 'bg-white text-black shadow-white/10 hover:shadow-white/20'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    <span className="flex items-center justify-center gap-4 relative z-10 italic">
                        {isMaster ? 'ASCEND' : 'INITIATE'} <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                    </span>
                </button>

                <button 
                    onClick={() => onStart(subject, difficulty, 'flashcards')}
                    onMouseEnter={() => playSFX('hover')}
                    className="w-full py-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-200 hover:text-white transition-all group shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:scale-[1.01]"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Layers className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Flashcards Mode</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </div>
        </div>
      </div>
      <div className="h-12 md:hidden shrink-0"></div>
    </div>
  );
};

export default memo(SetupScreen);