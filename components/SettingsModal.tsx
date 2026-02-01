import React from 'react';
import { Stats } from '../types';
import { X, Trash2, Book, PieChart, Activity } from 'lucide-react';
import RadarChart from './RadarChart';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Stats;
  onResetStats: () => void;
  onOpenResources: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, stats, onResetStats, onOpenResources }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-card w-full max-w-xl rounded-3xl p-8 shadow-2xl relative border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-white/40" /></button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-6 h-6 text-indigo-400" /> Academy Profile</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                <div className="text-3xl font-black text-indigo-400">{stats.level}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Level</div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                <div className="text-3xl font-black text-emerald-400">{stats.totalCorrect}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Solved</div>
            </div>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-6 flex flex-col items-center">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 self-start"><PieChart className="w-4 h-4 inline mr-2" /> Proficiency</h3>
            <RadarChart stats={stats.topics} size={220} />
        </div>

        <div className="space-y-3">
            <button onClick={() => { onClose(); onOpenResources(); }} className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <Book className="w-5 h-5" /> Knowledge Base
            </button>

            <button 
                onClick={() => { if (window.confirm("Reset all progress?")) onResetStats(); }}
                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
                <Trash2 className="w-4 h-4" /> Reset Profile
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;