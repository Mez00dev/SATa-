import React, { useState, useEffect, useCallback } from 'react';
import { Subject, Difficulty, Mode, Question, Stats, StreakData, AnswerHistory } from './types';
import { DIFFICULTY_SETTINGS } from './constants';
import Background from './components/Background';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import SettingsModal from './components/SettingsModal';
import StudyResourcesModal from './components/StudyResourcesModal';
import AdminPanel from './components/AdminPanel';
import QuestionBankScreen from './components/QuestionBankScreen';
import StreakRecoveryModal from './components/StreakRecoveryModal';
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, Sparkles, Maximize, Minimize } from 'lucide-react';

const App: React.FC = () => {
  // --- View State ---
  const [view, setView] = useState<'setup' | 'quiz' | 'result' | 'bank'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [isDaily, setIsDaily] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // --- Quiz Config State ---
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [isTimed, setIsTimed] = useState(true);
  const [timePerQ, setTimePerQ] = useState(60);
  const [currentSubject, setCurrentSubject] = useState<Subject>('math');
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  
  // --- Results State ---
  const [lastScore, setLastScore] = useState(0);
  const [lastHistory, setLastHistory] = useState<AnswerHistory[]>([]);

  // --- Persistent State ---
  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('quizStats');
    return saved ? JSON.parse(saved) : {
      totalQuizzes: 0, totalCorrect: 0, totalIncorrect: 0, totalScore: 0,
      subjects: { math: { correct: 0, incorrect: 0 }, english: { correct: 0, incorrect: 0 } }
    };
  });

  const [streak, setStreak] = useState<StreakData>(() => {
    const saved = localStorage.getItem('dailyStreak');
    const defaultStreak: StreakData = { 
      lastDate: null, 
      count: 0, 
      freezes: 2, 
      history: [false, false, false, false, false, false, false] 
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultStreak, ...parsed };
    }
    return defaultStreak;
  });

  // --- Modals ---
  const [showSettings, setShowSettings] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [lostStreakCount, setLostStreakCount] = useState(0);

  // Sync state to local storage
  useEffect(() => { localStorage.setItem('quizStats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('dailyStreak', JSON.stringify(streak)); }, [streak]);

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Streak verification
  useEffect(() => {
    if (!streak.lastDate) return;
    const checkStreak = () => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const last = new Date(streak.lastDate!);
      last.setHours(0,0,0,0);
      const diffDays = Math.ceil(Math.abs(today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)); 

      if (diffDays > 1) {
        if (streak.freezes > 0) {
          setStreak(prev => ({
            ...prev,
            freezes: prev.freezes - 1,
            lastDate: new Date(today.getTime() - 86400000).toDateString(),
            history: [false, true, ...prev.history.slice(1, 6)] 
          }));
          setToastMessage("❄️ Streak Freeze Activated!");
          setTimeout(() => setToastMessage(null), 5000);
        } else {
          setLostStreakCount(streak.count);
          setStreak(prev => ({ ...prev, count: 0 }));
          setShowRecovery(true);
        }
      }
    };
    checkStreak();
  }, []);

  // Admin access (Ctrl+L+R)
  useEffect(() => {
    const pressed = new Set<string>();
    const handleKeyDown = (e: KeyboardEvent) => {
      pressed.add(e.key.toLowerCase());
      if ((e.ctrlKey || e.metaKey) && pressed.has('l') && pressed.has('r')) {
        setShowAdmin(prev => !prev);
        pressed.clear();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => pressed.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- AI Generation Logic ---
  const fetchAIQuestions = async (subject: Subject, difficulty: Difficulty, count: number): Promise<Question[] | null> => {
    if (!process.env.API_KEY) {
      setToastMessage("❌ API Key missing.");
      return null;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const instructions = subject === 'math' 
        ? `SAT MATH (${difficulty.toUpperCase()}). ${difficulty === 'hard' ? 'Advanced functions and geometry.' : 'Linear algebra and basic stats.'}`
        : `SAT ENGLISH (${difficulty.toUpperCase()}). ${difficulty === 'hard' ? 'Logical inference and complex structure.' : 'Grammar and vocabulary.'}`;

      const prompt = `Generate ${count} unique, premium SAT practice questions. ${instructions}. Return a JSON array. Each object must have "q" (string), "a" (array of 4 strings), "correct" (int 0-3), and "topic" (string).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Correct model for fast text generation
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
                topic: { type: Type.STRING }
              },
              required: ["q", "a", "correct", "topic"]
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        if (Array.isArray(data) && data.length > 0) return data;
      }
      return null;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  };

  // --- Session Handlers ---
  const handleStart = async (subject: Subject, difficulty: Difficulty, mode: Mode) => {
    setIsLoading(true);
    const config = DIFFICULTY_SETTINGS[difficulty];
    let selectedQs = await fetchAIQuestions(subject, difficulty, config.numQuestions);

    if (!selectedQs) {
      // Automatic retry for reliability
      selectedQs = await fetchAIQuestions(subject, difficulty, config.numQuestions);
    }

    if (!selectedQs) {
      setIsLoading(false);
      setToastMessage("❌ AI Generation failed. Check connection.");
      return;
    }
    
    setCurrentQuestions(selectedQs);
    setCurrentSubject(subject);
    setCurrentDifficulty(difficulty);
    setIsTimed(mode === 'timed');
    setTimePerQ(config.timePerQ);
    setIsDaily(false);
    setIsRecovery(false);
    setIsLoading(false);
    setView('quiz');
  };

  const handleDaily = async () => {
    setIsLoading(true);
    const s = Math.random() > 0.5 ? 'math' : 'english';
    const selectedQs = await fetchAIQuestions(s, 'medium', 1);

    if (!selectedQs) {
      setIsLoading(false);
      setToastMessage("❌ Failed to load Daily Op.");
      return;
    }

    setCurrentQuestions(selectedQs);
    setCurrentSubject(s);
    setCurrentDifficulty('medium');
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
      setToastMessage("❌ Recovery mission failed to load.");
      setShowRecovery(true);
      return;
    }

    setCurrentQuestions(selectedQs);
    setCurrentSubject('math');
    setCurrentDifficulty('hard');
    setIsTimed(true);
    setTimePerQ(90); 
    setIsDaily(false);
    setIsRecovery(true);
    setIsLoading(false);
    setView('quiz');
  };

  const handleComplete = (score: number, history: AnswerHistory[]) => {
    setLastScore(score);
    setLastHistory(history);

    const totalQs = history.length;
    const quizScore = Math.round((score / (totalQs || 1)) * 800);
    
    setStats(prev => ({
      ...prev,
      totalQuizzes: prev.totalQuizzes + 1,
      totalCorrect: prev.totalCorrect + score,
      totalIncorrect: prev.totalIncorrect + (totalQs - score),
      totalScore: prev.totalScore + quizScore,
      subjects: {
        ...prev.subjects,
        [currentSubject]: {
          correct: prev.subjects[currentSubject].correct + score,
          incorrect: prev.subjects[currentSubject].incorrect + (totalQs - score)
        }
      }
    }));

    const today = new Date().toDateString();
    if (isRecovery) {
      if (score === totalQs) {
        setStreak(prev => ({ ...prev, count: lostStreakCount + 1, lastDate: today, history: [true, ...prev.history.slice(0, 6)] }));
        setToastMessage("🔥 STREAK RESTORED!");
      } else {
        setStreak(prev => ({ ...prev, count: 0, lastDate: today, history: [false, ...prev.history.slice(0, 6)] }));
        setToastMessage("Recovery failed. Streak reset.");
      }
    } else if (isDaily && streak.lastDate !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const isConsistent = streak.lastDate === yesterday.toDateString();
      const newCount = isConsistent ? streak.count + 1 : 1;
      let newFreezes = streak.freezes;
      if (newCount > 0 && newCount % 7 === 0) {
        newFreezes = Math.min(newFreezes + 1, 5);
        setToastMessage("🎉 7-Day Streak! +1 Freeze.");
      }
      setStreak(prev => ({ ...prev, count: newCount, freezes: newFreezes, lastDate: today, history: [true, ...prev.history.slice(0, 6)] }));
    }

    setView('result');
  };

  const handleResetStats = () => {
    setStats({ totalQuizzes: 0, totalCorrect: 0, totalIncorrect: 0, totalScore: 0, subjects: { math: { correct: 0, incorrect: 0 }, english: { correct: 0, incorrect: 0 } } });
    setStreak({ lastDate: null, count: 0, freezes: 2, history: [false, false, false, false, false, false, false] });
    setShowSettings(false);
  };

  return (
    <div className="font-sans text-gray-100 min-h-screen relative overflow-hidden bg-gray-950">
      <Background />

      <div className="fixed top-6 right-20 z-50 hidden md:block">
        <button onClick={toggleFullscreen} className="p-3 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 transition-colors">
          {isFullscreen ? <Minimize className="w-5 h-5 text-white/60" /> : <Maximize className="w-5 h-5 text-white/60" />}
        </button>
      </div>

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
           <div className="glass-card px-6 py-3 rounded-full border border-indigo-500/30 flex items-center gap-2 shadow-2xl bg-black/50 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-sm text-white">{toastMessage}</span>
           </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
          <div className="mt-6 flex flex-col items-center gap-2">
             <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
                <span className="text-xl font-medium text-white/90 animate-pulse">Generating SAT Mastery...</span>
             </div>
             <p className="text-sm text-white/40">Querying gemini-3-flash-preview</p>
          </div>
        </div>
      )}

      {view === 'setup' && <SetupScreen onStart={handleStart} onDaily={handleDaily} onSettings={() => setShowSettings(true)} onOpenBank={() => setView('bank')} streak={streak} stats={stats} toggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />}
      {view === 'quiz' && <QuizScreen questions={currentQuestions} isTimed={isTimed} timePerQuestion={timePerQ} onComplete={handleComplete} onExit={() => setView('setup')} subject={currentSubject} />}
      {view === 'result' && <ResultScreen score={lastScore} total={currentQuestions.length} history={lastHistory} questions={currentQuestions} onRetry={() => handleStart(currentSubject, currentDifficulty, isTimed ? 'timed' : 'practice')} onHome={() => setView('setup')} />}
      {view === 'bank' && <QuestionBankScreen onBack={() => setView('setup')} />}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} stats={stats} onResetStats={handleResetStats} onOpenResources={() => setShowResources(true)} />
      <StudyResourcesModal isOpen={showResources} onClose={() => setShowResources(false)} />
      <StreakRecoveryModal isOpen={showRecovery} lostStreak={lostStreakCount} onRecover={handleRecoverStreak} onAcceptLoss={() => setShowRecovery(false)} />
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} stats={stats} setStats={setStats} streak={streak} setStreak={setStreak} view={view} setView={setView} />
    </div>
  );
};

export default App;