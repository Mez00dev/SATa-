import React from 'react';
import { Flame, Zap } from 'lucide-react';

interface StreakRecoveryModalProps {
  isOpen: boolean;
  lostStreak: number;
  onRecover: () => void;
  onAcceptLoss: () => void;
}

const StreakRecoveryModal: React.FC<StreakRecoveryModalProps> = ({ isOpen, lostStreak, onRecover, onAcceptLoss }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full p-8 rounded-[2rem] text-center border border-red-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <Flame className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            </div>

            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Streak Broken!</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
                You missed yesterday. Your hard-earned <span className="text-white font-bold text-lg">{lostStreak}-day</span> streak is about to be reset.
            </p>

            <div className="space-y-4">
                <button 
                    onClick={onRecover}
                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-black text-white shadow-lg hover:scale-[1.02] hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Zap className="w-5 h-5 fill-current animate-pulse relative z-10" />
                    <span className="relative z-10">REPAIR STREAK</span>
                </button>
                
                <div className="flex items-center gap-3 text-xs text-white/30 uppercase tracking-widest font-bold justify-center">
                    <span className="h-px bg-white/10 w-12"></span>
                    Mission: Score 100% on 1 Hard Q
                    <span className="h-px bg-white/10 w-12"></span>
                </div>

                <button 
                    onClick={onAcceptLoss}
                    className="w-full py-3 bg-transparent hover:bg-white/5 rounded-xl font-bold text-white/30 hover:text-white transition-colors border border-transparent hover:border-white/5"
                >
                    Accept Defeat
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StreakRecoveryModal;