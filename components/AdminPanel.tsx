import React, { useState } from 'react';
import { Stats, StreakData } from '../types';
import { ShieldAlert, RefreshCw, X, Terminal, Database, Calendar, Activity } from 'lucide-react';

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
  
  if (!isOpen) return null;

  const handleUpdateStreak = () => {
    const count = parseInt(streakInput);
    if (!isNaN(count)) {
      setStreak(prev => ({ ...prev, count }));
    }
  };

  const handleResetDaily = () => {
    setStreak(prev => ({ ...prev, lastDate: null }));
  };

  const handleInjectStats = () => {
    setStats(prev => ({
      ...prev,
      totalQuizzes: prev.totalQuizzes + 10,
      totalScore: prev.totalScore + 8000,
      totalCorrect: prev.totalCorrect + 100,
      subjects: {
        math: { correct: prev.subjects.math.correct + 50, incorrect: prev.subjects.math.incorrect + 5 },
        english: { correct: prev.subjects.english.correct + 50, incorrect: prev.subjects.english.incorrect + 5 }
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in font-mono text-sm">
      <div className="w-full max-w-2xl bg-gray-900 border border-red-500/30 rounded-lg shadow-2xl overflow-hidden relative">
        
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
                <Calendar className="w-4 h-4" /> Streak Manager
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
                <button 
                    onClick={handleResetDaily}
                    className="w-full text-left text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-3 h-3" /> Reset Daily Completion (Allow Retake)
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
                    onClick={handleInjectStats}
                    className="w-full bg-indigo-900/30 hover:bg-indigo-800/50 text-indigo-300 border border-indigo-800/50 px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <Terminal className="w-4 h-4" /> Inject Mock Data (+10 Quizzes)
                </button>
                <button 
                    onClick={() => setStats({
                      totalQuizzes: 0, totalCorrect: 0, totalIncorrect: 0, totalScore: 0,
                      subjects: { math: { correct: 0, incorrect: 0 }, english: { correct: 0, incorrect: 0 } }
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
                        quizzes: stats.totalQuizzes,
                        score: stats.totalScore
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