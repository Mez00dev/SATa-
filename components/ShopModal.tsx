import React from 'react';
import { ShopItem, Stats } from '../types';
import { SHOP_ITEMS } from '../constants';
import { X, Lock, Check, ShoppingBag, Coins, Palette } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Stats;
  onBuy: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, stats, onBuy, onEquip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-card w-full max-w-4xl h-[80vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                    <ShoppingBag className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">The Armory</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 font-bold font-mono text-lg">{stats.credits} Credits</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/40 group-hover:text-white" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-black/20 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {SHOP_ITEMS.map((item) => {
                    const isOwned = stats.inventory.includes(item.id);
                    const isEquipped = stats.equippedTheme === item.id;
                    const canAfford = stats.credits >= item.price;

                    return (
                        <div key={item.id} className={`relative group p-6 rounded-2xl border transition-all duration-300 flex flex-col
                            ${isEquipped 
                                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                                : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}>
                            
                            {/* Visual Preview */}
                            <div className={`h-24 rounded-xl mb-4 bg-gradient-to-br ${item.color} shadow-inner flex items-center justify-center relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                {item.type === 'theme' && <Palette className="w-8 h-8 text-white/50 drop-shadow-lg" />}
                                {isOwned && <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded-full p-1"><Check className="w-3 h-3 text-emerald-400" /></div>}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                            <p className="text-xs text-white/50 mb-6 leading-relaxed flex-1">{item.description}</p>

                            <div className="mt-auto">
                                {isOwned ? (
                                    <button 
                                        onClick={() => onEquip(item)}
                                        disabled={isEquipped}
                                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all
                                            ${isEquipped 
                                                ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/20' 
                                                : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                    >
                                        {isEquipped ? 'Equipped' : 'Equip'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => onBuy(item)}
                                        disabled={!canAfford}
                                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all
                                            ${canAfford 
                                                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20' 
                                                : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                                    >
                                        {canAfford ? (
                                            <>Purchase <span className="font-mono opacity-80">{item.price}</span></>
                                        ) : (
                                            <><Lock className="w-3 h-3" /> {item.price}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShopModal;