import { QuestionData } from './types';

// Fallback pool removed to ensure 100% AI generation.
// The constants now only hold configuration and resource links.
export const QUESTIONS: QuestionData = {
  math: { easy: [], medium: [], hard: [] },
  english: { easy: [], medium: [], hard: [] }
};

export const DIFFICULTY_SETTINGS = {
  easy: { numQuestions: 10, timePerQ: 60 },
  medium: { numQuestions: 15, timePerQ: 45 },
  hard: { numQuestions: 20, timePerQ: 30 }
};

export const STUDY_LINKS = [
  {
    category: "Official HQ Resources",
    links: [
      { title: "Bluebook™ Testing App (Required)", url: "https://bluebook.collegeboard.org/" },
      { title: "College Board — SAT Suite", url: "https://satsuite.collegeboard.org/sat" },
      { title: "Khan Academy — Official SAT Prep", url: "https://www.khanacademy.org/test-prep/sat" },
      { title: "Full-Length Practice Tests", url: "https://satsuite.collegeboard.org/sat/practice-preparation/practice-tests" }
    ]
  },
  {
    category: "Math: Mastery",
    links: [
      { title: "Desmos — Graphing Calculator", url: "https://www.desmos.com/calculator" },
      { title: "Math is Fun — Algebra Index", url: "https://www.mathsisfun.com/algebra/index.html" },
      { title: "Wolfram — Probability Concepts", url: "https://mathworld.wolfram.com/Probability.html" }
    ]
  },
  {
    category: "English: Mastery",
    links: [
      { title: "Purdue OWL — Grammar Rules", url: "https://owl.purdue.edu/owl/general_writing/grammar/index.html" },
      { title: "Grammarly Blog — Tips", url: "https://www.grammarly.com/blog/" },
      { title: "Vocabulary.com", url: "https://www.vocabulary.com/" }
    ]
  }
];

export const STRATEGIES = [
  {
    category: "Digital Format Mastery",
    icon: "Monitor",
    tips: [
      "Master the built-in tools: 'Mark for Review', 'Strikethrough', and the 'Reference Sheet'.",
      "The test is adaptive. A harder second module means you did well in the first.",
      "There is no penalty for guessing. Never leave a blank answer.",
      "Master Desmos shortcuts like typing 'sqrt' or using the exponent hotkey '^'."
    ]
  },
  {
    category: "Math: Strategy",
    icon: "Brain",
    tips: [
      "Backsolving: Plug the answer choices into the question, starting with C.",
      "Picking Numbers: Replace abstract variables with small integers like 2 or 3.",
      "Figures are not always to scale, but close. Use visual estimation to cull options.",
      "Memorize 30-60-90 and 45-45-90 triangle properties."
    ]
  },
  {
    category: "English: Tactics",
    icon: "PenTool",
    tips: [
      "Read the question stem BEFORE the passage to know what to look for.",
      "Beware of extreme language: 'always', 'never', 'only' are usually wrong.",
      "Shorter is often better. Conciseness is a hallmark of correct SAT writing answers.",
      "Read the sentences before and after a transition word to confirm the logic."
    ]
  }
];