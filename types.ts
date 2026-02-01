export type Subject = 'math' | 'english';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Mode = 'timed' | 'practice' | 'flashcards' | 'simulation';

export interface Question {
  q: string;
  a: string[];
  correct: number;
  topic?: string;
  type?: string;
  instruction?: string;
  explanation?: string;
  id?: number;
  subject?: Subject;
  difficulty?: Difficulty;
}

export interface TopicStat {
  correct: number;
  total: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'theme' | 'powerup';
  color: string;
}

export interface Stats {
  totalQuizzes: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalScore: number; // XP
  level: number;
  subjects: {
    math: { correct: number; incorrect: number };
    english: { correct: number; incorrect: number };
  };
  topics: Record<string, TopicStat>;
  credits: number;
  inventory: string[];
  equippedTheme: string;
}

export interface StreakData {
  lastDate: string | null;
  count: number;
  freezes: number;
  maxFreezes: number;
  // Index 0 is today, Index 1 is yesterday, etc.
  history: boolean[]; 
}

export interface AnswerHistory {
  questionIndex: number;
  correctIndex: number;
  chosenIndex: number;
}