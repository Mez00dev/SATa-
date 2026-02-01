import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Subject, Difficulty, Mode, Question, Stats, StreakData, AnswerHistory } from './types';
import { DIFFICULTY_SETTINGS } from './constants';
import Background from './components/Background';
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, Sparkles, Award } from 'lucide-react';

// Lazy load components for code splitting
const SetupScreen = lazy(() => import('./components/SetupScreen'));
const QuizScreen = lazy(() => import('./components/QuizScreen'));
const ResultScreen = lazy(() => import('./components/ResultScreen'));
const FlashcardsScreen = lazy(() => import('./components/FlashcardsScreen'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const StudyResourcesModal = lazy(() => import('./components/StudyResourcesModal'));
const StreakRecoveryModal = lazy(() => import('./components/StreakRecoveryModal'));

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'quiz' | 'result' | 'flashcards'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [isDaily, setIsDaily] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<{level: number, reward: string, rankUp?: string} | null>(null);
  
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [isTimed, setIsTimed] = useState(true);
  const [timePerQ, setTimePerQ] = useState(60);
  const [currentSubject, setCurrentSubject] = useState<Subject>('math');
  
  const [lastScore, setLastScore] = useState(0);
  const [lastHistory, setLastHistory] = useState<AnswerHistory[]>([]);

  // Robust State Initialization for Persistence
  const [stats, setStats] = useState<Stats>(() => {
    try {
      const saved = localStorage.getItem('quizStats');
      const defaultStats: Stats = {
        totalQuizzes: 0, totalCorrect: 0, totalIncorrect: 0, totalScore: 0, level: 1,
        subjects: { math: { correct: 0, incorrect: 0 }, english: { correct: 0, incorrect: 0 } },
        topics: {},
        credits: 0,
        inventory: ['theme_default'],
        equippedTheme: 'theme_default'
      };
      
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultStats, ...parsed };
      }
      return defaultStats;
    } catch (e) {
      return {
        totalQuizzes: 0, totalCorrect: 0, totalIncorrect: 0, totalScore: 0, level: 1,
        subjects: { math: { correct: 0, incorrect: 0 }, english: { correct: 0, incorrect: 0 } },
        topics: {},
        credits: 0,
        inventory: ['theme_default'],
        equippedTheme: 'theme_default'
      };
    }
  });

  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem('dailyStreak');
      const defaultStreak: StreakData = { 
        lastDate: null, count: 0, freezes: 2, maxFreezes: 3,
        history: [false, false, false, false, false, false, false] 
      };
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultStreak, ...parsed };
      }
      return defaultStreak;
    } catch (e) {
      return { 
        lastDate: null, count: 0, freezes: 2, maxFreezes: 3,
        history: [false, false, false, false, false, false, false] 
      };
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [lostStreakCount, setLostStreakCount] = useState(0);

  // Audio System
  const playSFX = useCallback((type: 'click' | 'success' | 'error' | 'levelup' | 'hover' | 'tick') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'hover') {
         osc.frequency.setValueAtTime(400, now);
         gain.gain.setValueAtTime(0.01, now);
         gain.gain.linearRampToValueAtTime(0, now + 0.05);
         osc.start(now);
         osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.setValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'levelup') {
         osc.frequency.setValueAtTime(440, now);
         osc.frequency.linearRampToValueAtTime(880, now + 0.5);
         gain.gain.setValueAtTime(0.1, now);
         gain.gain.linearRampToValueAtTime(0, now + 1.0);
         osc.start(now);
         osc.stop(now + 1.0);
      } else if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch (e) {}
  }, []);

  // Save Effect
  useEffect(() => { localStorage.setItem('quizStats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('dailyStreak', JSON.stringify(streak)); }, [streak]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err) { console.error("Fullscreen error:", err); }
  };

  const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
  const getRankName = (lvl: number) => {
    if (lvl >= 150) return "SAT MASTER";
    if (lvl >= 50) return "LEGEND";
    if (lvl >= 10) return "SCHOLAR";
    return "NOVICE";
  };

  // Helper for UTC Date String (YYYY-MM-DD)
  const getTodayUTC = useCallback(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (!streak.lastDate) return;
    const checkStreak = () => {
      const today = getTodayUTC();
      const last = streak.lastDate!;
      
      const dToday = new Date(today);
      const dLast = new Date(last); // Works for ISO YYYY-MM-DD and legacy string

      // If invalid date in storage, ignore or reset
      if (isNaN(dLast.getTime())) return;

      const diffTime = Math.abs(dToday.getTime() - dLast.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 1) {
        if (streak.freezes > 0) {
           // Calculate yesterday UTC
          const yesterday = new Date(dToday);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          setStreak(prev => ({
            ...prev,
            freezes: prev.freezes - 1,
            lastDate: yesterdayStr,
            history: [false, true, ...prev.history.slice(1, 6)] 
          }));
          setToastMessage("❄️ Streak Saved by Freeze!");
          setTimeout(() => setToastMessage(null), 5000);
        } else {
          setLostStreakCount(streak.count);
          setStreak(prev => ({ ...prev, count: 0 }));
          setShowRecovery(true);
        }
      }
    };
    checkStreak();
  }, [streak.lastDate, streak.freezes, getTodayUTC]);

  const fetchAIQuestions = async (subject: Subject, difficulty: Difficulty, count: number): Promise<Question[] | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const instructions = subject === 'math' 
        ? `SAT Math (${difficulty}). Algebra/Advanced Math.`
        : `SAT English (${difficulty}). Grammar/Reading.`;

      const prompt = `Generate ${count} SAT questions (${subject}). ${instructions}. 
      Strict JSON Array: [{ "q": "str", "a": ["str","str","str","str"], "correct": 0-3, "topic": "str", "type": "str", "instruction": "str", "explanation": "short str" }]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                q: { type: Type.STRING },
                a: { type: Type.ARRAY, items: { type: Type.STRING } },
                correct: { type: Type.INTEGER },
                topic: { type: Type.STRING },
                type: { type: Type.STRING },
                instruction: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["q", "a", "correct", "topic", "type", "explanation"]
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text.trim());
        if (Array.isArray(data)) return data;
      }
      return null;
    } catch (error) {
      console.error("AI Gen Failed:", error);
      return null;
    }
  };

  const handleStart = async (subject: Subject, difficulty: Difficulty, mode: Mode) => {
    playSFX('click');
    setIsLoading(true);
    const config = DIFFICULTY_SETTINGS[difficulty];
    const selectedQs = await fetchAIQuestions(subject, difficulty, mode === 'flashcards' ? 10 : config.numQuestions);
    
    if (!selectedQs) {
      setIsLoading(false);
      setToastMessage("❌ Network Interrupt. Retrying...");
      playSFX('error');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    
    setCurrentQuestions(selectedQs);
    setCurrentSubject(subject);
    setIsTimed(true); 
    setTimePerQ(config.timePerQ);
    setIsDaily(false);
    setIsRecovery(false);
    setIsLoading(false);
    
    if (mode === 'flashcards') setView('flashcards');
    else setView('quiz');
  };

  const handleDaily = async () => {
    playSFX('click');
    setIsLoading(true);
    const s = Math.random() > 0.5 ? 'math' : 'english';
    const selectedQs = await fetchAIQuestions(s, 'medium', 5);
    if (!selectedQs) {
      setIsLoading(false);
      setToastMessage("❌ Daily unavailable.");
      playSFX('error');
      return;
    }
    setCurrentQuestions(selectedQs);
    setCurrentSubject(s);
    setIsTimed(true);
    setTimePerQ(60); 
    setIsDaily(true);
    setIsRecovery(false);
    setIsLoading(false);
    setView('quiz');
  };

  const handleRecoverStreak = async () => {
    setShowRecovery(false);
    setIsLoading(true);
    const selectedQs = await fetchAIQuestions('math', 'hard', 1);
    if (!selectedQs) {
      setIsLoading(false);
      setToastMessage("❌ Recovery failed.");
      playSFX('error');
      setShowRecovery(true);
      return;
    }
    setCurrentQuestions(selectedQs);
    setCurrentSubject('math');
    setIsTimed(true);
    setTimePerQ(90); 
    setIsDaily(false);
    setIsRecovery(true);
    setIsLoading(false);
    setView('quiz');
  };

  const applyXPAndLevelUp = (sessionXP: number, score: number = 0, totalQs: number = 0) => {
    const oldXP = stats.totalScore;
    const newXP = oldXP + sessionXP;
    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(newXP);
    
    let rewardText = "";
    let rankUpText: string | undefined = undefined;

    if (newLevel > oldLevel) {
      playSFX('levelup');
      const oldRankName = getRankName(oldLevel);
      const newRankName = getRankName(newLevel);
      if (oldRankName !== newRankName) {
          rankUpText = newRankName;
      }

      const freezesToGrant = newLevel - oldLevel;
      const newMax = streak.maxFreezes + 1; 
      
      setStreak(prev => ({
        ...prev,
        freezes: Math.min(prev.freezes + freezesToGrant, newMax),
        maxFreezes: newMax
      }));
      
      rewardText = `+${freezesToGrant} Streak Freeze`;
      if (newLevel >= 150 && oldLevel < 150) rewardText += " & SAT MASTER EMBLEM!";
      
      setShowLevelUp({ level: newLevel, reward: rewardText, rankUp: rankUpText });
    }

    setStats(prev => ({
      ...prev, totalQuizzes: prev.totalQuizzes + 1, totalCorrect: prev.totalCorrect + score,
      totalIncorrect: prev.totalIncorrect + (totalQs - score), totalScore: newXP, level: newLevel,
      subjects: { ...prev.subjects, [currentSubject]: { correct: prev.subjects[currentSubject].correct + score, incorrect: prev.subjects[currentSubject].incorrect + (totalQs - score) } }
    }));

    // Update Streak for Daily
    const today = getTodayUTC();
    if (isDaily && streak.lastDate !== today) {
      // Logic to determine continuity
      let isConsecutive = false;
      if (streak.lastDate) {
          const dToday = new Date(today);
          const dLast = new Date(streak.lastDate);
          const diffTime = Math.abs(dToday.getTime() - dLast.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) isConsecutive = true;
      }
      
      // If streak count is 0, it resets to 1 anyway.
      // If isConsecutive, increment.
      // Else (diffDays > 1), reset to 1.
      const newCount = (streak.count > 0 && isConsecutive) ? streak.count + 1 : 1;

      setStreak(prev => ({ ...prev, count: newCount, lastDate: today, history: [true, ...prev.history.slice(0, 6)] }));
    }
  };

  const handleQuizComplete = (score: number, history: AnswerHistory[]) => {
    setLastScore(score);
    setLastHistory(history);
    const totalQs = history.length;
    let sessionXP = Math.round((score / (totalQs || 1)) * 800);

    if (isRecovery && score === totalQs) {
        const today = getTodayUTC();
        setStreak(prev => ({ ...prev, count: lostStreakCount, lastDate: today }));
        sessionXP += 500;
        setToastMessage("🔥 Streak Restored!");
    } else if (isRecovery) {
        setToastMessage("❌ Recovery Failed. Streak Reset.");
        setStreak(prev => ({ ...prev, count: 0 }));
    }

    const newTopics = { ...stats.topics };
    history.forEach(h => {
        const q = currentQuestions[h.questionIndex];
        const isCorrect = h.correctIndex === h.chosenIndex;
        if (q.topic) {
            if (!newTopics[q.topic]) newTopics[q.topic] = { correct: 0, total: 0 };
            newTopics[q.topic].total += 1;
            if (isCorrect) newTopics[q.topic].correct += 1;
        }
    });

    setStats(prev => ({ ...prev, topics: newTopics }));
    applyXPAndLevelUp(sessionXP, score, totalQs);
    setView('result');
  };

  const handleFlashcardComplete = (sessionXP: number) => {
    applyXPAndLevelUp(sessionXP);
    setToastMessage(`🔥 Session Mastery: +${sessionXP} XP`);
    setTimeout(() => setToastMessage(null), 3000);
    setView('setup');
  };

  return (
    <div className="font-sans text-gray-100 min-h-screen relative overflow-hidden bg-transparent selection:bg-indigo-500/30">
      <Background />
      
      {showLevelUp && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
          <div className="glass-card p-6 md:p-10 rounded-[2rem] text-center max-w-sm border border-indigo-500/50 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
            <Award className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-black mb-2 text-white italic">LEVEL UP!</h2>
            <p className="text-indigo-200 font-bold text-xl mb-4">Rank {showLevelUp.level}</p>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
               <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Reward</p>
               <p className="text-white font-bold">{showLevelUp.reward}</p>
            </div>
            <button 
              onClick={() => { setShowLevelUp(null); playSFX('click'); }}
              className="w-full py-4 rounded-xl font-black tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg"
            >
              CLAIM
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-up w-full max-w-xs px-4">
           <div className="glass-card px-6 py-3 rounded-full border border-indigo-500/30 flex items-center justify-center gap-2 shadow-2xl bg-black/80 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold text-xs md:text-sm text-white text-center uppercase tracking-wider">{toastMessage}</span>
           </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in px-6">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
          <p className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Generating...</p>
        </div>
      )}

      <Suspense fallback={
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
      }>
        {view === 'setup' && (
            <SetupScreen 
                onStart={handleStart} 
                onDaily={handleDaily} 
                onSettings={() => { playSFX('click'); setShowSettings(true); }} 
                streak={streak} 
                stats={stats} 
                toggleFullscreen={toggleFullscreen} 
                isFullscreen={isFullscreen}
                playSFX={playSFX}
            />
        )}
        {view === 'quiz' && (
            <QuizScreen 
                questions={currentQuestions} 
                isTimed={isTimed} 
                timePerQuestion={timePerQ} 
                onComplete={handleQuizComplete} 
                onExit={() => { playSFX('click'); setView('setup'); }} 
                subject={currentSubject} 
                playSFX={playSFX}
            />
        )}
        {view === 'flashcards' && <FlashcardsScreen questions={currentQuestions} onExit={() => { playSFX('click'); setView('setup'); }} onComplete={handleFlashcardComplete} playSFX={playSFX} />}
        
        {view === 'result' && (
            <ResultScreen 
            score={lastScore} 
            total={currentQuestions.length}
            history={lastHistory}
            questions={currentQuestions}
            onRetry={() => { playSFX('click'); handleStart(currentSubject, 'medium', isTimed ? 'timed' : 'practice'); }}
            onHome={() => { playSFX('click'); setView('setup'); }}
            playSFX={playSFX}
            />
        )}

        <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
            stats={stats} 
            onResetStats={() => setStats({
            totalQuizzes: 0, totalCorrect: 0, totalIncorrect: 0, totalScore: 0, level: 1,
            subjects: { math: { correct: 0, incorrect: 0 }, english: { correct: 0, incorrect: 0 } },
            topics: {},
            credits: 0,
            inventory: ['theme_default'],
            equippedTheme: 'theme_default'
            })}
            onOpenResources={() => { setShowSettings(false); setShowResources(true); }}
        />

        <StudyResourcesModal isOpen={showResources} onClose={() => setShowResources(false)} />
        
        <StreakRecoveryModal 
            isOpen={showRecovery} 
            lostStreak={lostStreakCount} 
            onRecover={handleRecoverStreak} 
            onAcceptLoss={() => { setShowRecovery(false); setStreak(prev => ({ ...prev, count: 0 })); }} 
        />
      </Suspense>
    </div>
  );
};

export default App;