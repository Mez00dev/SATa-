import React from 'react';
import { Stats } from '../types';
import { X, Trash2, Book, PieChart, Activity } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Stats;
  onResetStats: () => void;
  onOpenResources: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, stats, onResetStats, onOpenResources }) => {
  if (!isOpen) return null;

  const mathTotal = stats.subjects.math.correct + stats.subjects.math.incorrect;
  const engTotal = stats.subjects.english.correct + stats.subjects.english.incorrect;
  const mathAcc = mathTotal ? Math.round((stats.subjects.math.correct / mathTotal) * 100) : 0;
  const engAcc = engTotal ? Math.round((stats.subjects.english.correct / engTotal) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-card w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors group"
        >
          <X className="w-5 h-5 text-white/40 group-hover:text-white" />
        </button>

        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/5 rounded-xl">
                <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Performance Stats</h2>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-4xl font-black text-indigo-400 mb-1 relative z-10">{stats.totalQuizzes}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold relative z-10">Total Sessions</div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-4xl font-black text-emerald-400 mb-1 relative z-10">
                    {stats.totalScore > 0 ? Math.round(stats.totalScore / (stats.totalQuizzes || 1)) : 0}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold relative z-10">Avg Scaled Score</div>
            </div>
        </div>

        {/* Proficiency Bars */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6 mb-8">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Subject Proficiency
            </h3>
            
            <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-white">Math</span>
                    <span className={mathAcc >= 70 ? "text-emerald-400" : "text-white/60"}>{mathAcc}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${mathAcc}%` }}
                    ></div>
                </div>
            </div>

            <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-white">English</span>
                    <span className={engAcc >= 70 ? "text-emerald-400" : "text-white/60"}>{engAcc}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${engAcc}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
            <button 
                onClick={() => { onClose(); onOpenResources(); }}
                className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
            >
                <Book className="w-5 h-5" /> Open Knowledge Base
            </button>

            <button 
                onClick={() => {
                    if (window.confirm("Are you sure you want to reset all stats? This cannot be undone.")) {
                        onResetStats();
                    }
                }}
                className="w-full py-4 bg-transparent hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
                <Trash2 className="w-4 h-4" /> Reset Data
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;