import React, { useState } from 'react';
import { Stats, StreakData } from '../types';
import { ShieldAlert, RefreshCw, X, Database, Calendar, Activity, Zap, Unlock } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Stats;
  setStats: React.Dispatch<React.SetStateAction<Stats>>;
  streak: StreakData;
  setStreak: React.Dispatch<React.SetStateAction<StreakData>>;
  view: string;
  setView: (view: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, onClose, stats, setStats, streak, setStreak, view 
}) => {
  const [streakInput, setStreakInput] = useState(streak.count.toString());
  const [levelInput, setLevelInput] = useState(stats.level.toString());
  
  if (!isOpen) return null;

  const handleUpdateStreak = () => {
    const count = parseInt(streakInput);
    if (!isNaN(count)) {
      setStreak(prev => ({ ...prev, count }));
    }
  };

  const handleUpdateLevel = () => {
    const lvl = parseInt(levelInput);
    if (!isNaN(lvl)) {
       // XP = (Level - 1)^2 * 100
       const newXP = Math.pow(lvl - 1, 2) * 100;
       setStats(prev => ({ ...prev, level: lvl, totalScore: newXP }));
    }
  };

  const handleInfiniteXP = () => {
    setStats(prev => ({ ...prev, totalScore: prev.totalScore + 1000000 }));
  };

  const handleResetDaily = () => {
    setStreak(prev => ({ ...prev, lastDate: null }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in font-mono text-sm">
      <div className="w-full max-w-2xl bg-gray-900 border border-red-500/30 rounded-lg shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-red-950/30 border-b border-red-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="font-bold tracking-widest uppercase">Admin Debug Console</h2>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Streak Control */}
          <div className="space-y-4">
             <h3 className="text-gray-500 uppercase text-xs font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Streak & Level
             </h3>
             <div className="bg-black/40 p-4 rounded border border-gray-800 space-y-3">
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={streakInput} 
                        onChange={(e) => setStreakInput(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white px-3 py-1 rounded w-full focus:border-red-500 outline-none"
                        placeholder="Streak Count"
                    />
                    <button 
                        onClick={handleUpdateStreak}
                        className="bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1 rounded border border-red-800 transition-colors"
                    >
                        Set
                    </button>
                </div>
                 <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={levelInput} 
                        onChange={(e) => setLevelInput(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white px-3 py-1 rounded w-full focus:border-red-500 outline-none"
                        placeholder="Level"
                    />
                    <button 
                        onClick={handleUpdateLevel}
                        className="bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1 rounded border border-red-800 transition-colors"
                    >
                        Set
                    </button>
                </div>
                <button 
                    onClick={handleResetDaily}
                    className="w-full text-left text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-3 h-3" /> Reset Daily Completion
                </button>
             </div>
          </div>

          {/* God Mode */}
          <div className="space-y-4">
             <h3 className="text-gray-500 uppercase text-xs font-bold flex items-center gap-2">
                <Zap className="w-4 h-4" /> God Mode
             </h3>
             <div className="bg-black/40 p-4 rounded border border-gray-800 space-y-3">
                <button 
                    onClick={handleInfiniteXP}
                    className="w-full bg-yellow-900/30 hover:bg-yellow-800/50 text-yellow-300 border border-yellow-800/50 px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <Zap className="w-4 h-4" /> Add 1,000,000 XP
                </button>
             </div>
          </div>

          {/* Stats Control */}
          <div className="space-y-4">
             <h3 className="text-gray-500 uppercase text-xs font-bold flex items-center gap-2">
                <Database className="w-4 h-4" /> Data Injection
             </h3>
             <div className="bg-black/40 p-4 rounded border border-gray-800 space-y-3">
                <button 
                    onClick={() => setStats({
                      totalQuizzes: 0, totalCorrect: 0, totalIncorrect: 0, totalScore: 0, level: 1,
                      topics: {},
                      subjects: { math: { correct: 0, incorrect: 0 }, english: { correct: 0, incorrect: 0 } },
                      credits: 0, inventory: [], equippedTheme: 'default'
                    })}
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <X className="w-4 h-4" /> Nuke All Stats
                </button>
             </div>
          </div>

          {/* View State Inspector */}
          <div className="col-span-1 md:col-span-2 space-y-4">
             <h3 className="text-gray-500 uppercase text-xs font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" /> State Inspector
             </h3>
             <div className="bg-black/60 p-4 rounded border border-gray-800 font-mono text-xs text-green-400 overflow-x-auto h-32 custom-scrollbar">
                <pre>{JSON.stringify({ 
                    view, 
                    streak,
                    statsSummary: {
                        level: stats.level,
                    }
                }, null, 2)}</pre>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;