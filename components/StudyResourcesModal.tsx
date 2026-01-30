import React, { useState, useMemo } from 'react';
import { STUDY_LINKS, STRATEGIES } from '../constants';
import { X, ExternalLink, Search, BookOpen, Layers, Lightbulb, Monitor, Calculator, Brain, PenTool, Smile, GraduationCap } from 'lucide-react';

interface StudyResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudyResourcesModal: React.FC<StudyResourcesModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'resources' | 'strategies'>('resources');

  // Filter Logic for Links
  const filteredResources = useMemo(() => {
    if (!searchTerm) return STUDY_LINKS;
    const lowerTerm = searchTerm.toLowerCase();
    
    return STUDY_LINKS.map(cat => ({
      category: cat.category,
      links: cat.links.filter(link => 
        link.title.toLowerCase().includes(lowerTerm) ||
        cat.category.toLowerCase().includes(lowerTerm)
      )
    })).filter(cat => cat.links.length > 0);
  }, [searchTerm]);

  // Filter Logic for Strategies
  const filteredStrategies = useMemo(() => {
    if (!searchTerm) return STRATEGIES;
    const lowerTerm = searchTerm.toLowerCase();

    return STRATEGIES.map(cat => ({
      ...cat,
      tips: cat.tips.filter(tip => 
        tip.toLowerCase().includes(lowerTerm) ||
        cat.category.toLowerCase().includes(lowerTerm)
      )
    })).filter(cat => cat.tips.length > 0);
  }, [searchTerm]);

  const getIcon = (iconName?: string) => {
    switch(iconName) {
      case 'Monitor': return <Monitor className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'PenTool': return <PenTool className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Smile': return <Smile className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-card w-full max-w-5xl h-[90vh] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                        <GraduationCap className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Knowledge Base</h2>
                        <p className="text-sm text-white/40">Elite preparation materials & tactical guides</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                >
                    <X className="w-6 h-6 text-white/40 group-hover:text-white" />
                </button>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Tabs */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
                    <button 
                        onClick={() => setActiveTab('resources')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2
                        ${activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Layers className="w-4 h-4" /> Resources
                    </button>
                    <button 
                        onClick={() => setActiveTab('strategies')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2
                        ${activeTab === 'strategies' ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Lightbulb className="w-4 h-4" /> Pro Strategies
                    </button>
                </div>

                {/* Search */}
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'resources' ? "Search links (e.g., 'Khan', 'Calculus')..." : "Search strategies (e.g., 'Desmos', 'Grammar')..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all shadow-inner text-sm"
                        autoFocus
                    />
                </div>
            </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/20">
            
            {/* RESOURCES VIEW */}
            {activeTab === 'resources' && (
                <div className="space-y-8">
                    {filteredResources.length > 0 ? (
                        filteredResources.map((category, idx) => (
                            <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                <h3 className="flex items-center gap-2 text-xs font-bold text-indigo-200/60 uppercase tracking-widest mb-4 ml-1 sticky top-0 bg-[#0c1221]/95 backdrop-blur-sm py-2 z-10 w-fit pr-4 rounded-r-full">
                                    <Layers className="w-3 h-3" />
                                    {category.category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {category.links.map((link, lIdx) => (
                                        <a 
                                            key={lIdx}
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="group flex flex-col justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
                                        >
                                            <span className="text-white/80 font-medium text-sm group-hover:text-white line-clamp-2 mb-2 transition-colors">
                                                {link.title}
                                            </span>
                                            <div className="flex items-center justify-end">
                                                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p>No resources found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* STRATEGIES VIEW */}
            {activeTab === 'strategies' && (
                <div className="columns-1 md:columns-2 gap-6 space-y-6">
                    {filteredStrategies.length > 0 ? (
                        filteredStrategies.map((cat, idx) => (
                            <div key={idx} className="break-inside-avoid animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-colors duration-300">
                                    <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                            {getIcon(cat.icon)}
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{cat.category}</h3>
                                    </div>
                                    <div className="p-5">
                                        <ul className="space-y-4">
                                            {cat.tips.map((tip, tIdx) => (
                                                <li key={tIdx} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5"></span>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30 col-span-full">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p>No strategies found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            )}
            
            <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
};

export default StudyResourcesModal;