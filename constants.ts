export const DIFFICULTY_SETTINGS = {
  easy: { numQuestions: 20, timePerQ: 90 },   // 30 minutes total
  medium: { numQuestions: 20, timePerQ: 30 }, // 10 minutes total
  hard: { numQuestions: 20, timePerQ: 15 },   // 5 minutes total
};

export const STUDY_LINKS = [
  {
    category: "Official Elite HQ",
    links: [
      { title: "Bluebook™ Testing App (Required)", url: "https://bluebook.collegeboard.org/" },
      { title: "College Board — SAT Suite Home", url: "https://satsuite.collegeboard.org/sat" },
      { title: "Khan Academy — Digital SAT Official", url: "https://www.khanacademy.org/test-prep/sat" },
      { title: "SAT Score Bank (CollegeBoard)", url: "https://satsuitequestionbank.collegeboard.org/" },
    ]
  },
  {
    category: "Math: Algebra Mastery",
    links: [
      { title: "Linear Equations Masterclass", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs" },
      { title: "Systems of Equations Breakdown", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations" },
      { title: "Desmos Graphing Calculator", url: "https://www.desmos.com/calculator" }
    ]
  },
  {
    category: "English: Standard Conventions",
    links: [
      { title: "Purdue OWL — Punctuation Hub", url: "https://owl.purdue.edu/owl/general_writing/punctuation/index.html" },
      { title: "The Ultimate Guide to Commas", url: "https://www.grammarly.com/blog/comma/" }
    ]
  }
];

export const STRATEGIES = [
  {
    category: "The Digital SAT Mindset",
    icon: "Monitor",
    tips: [
      "The test is adaptive. A significantly harder second module is a badge of honor—it means you're in the elite scoring bracket.",
      "Master the 'Mark for Review' button; it's your primary safety net for time management.",
      "There is no penalty for guessing. Eliminate the obvious and commit to an answer before moving on.",
      "Desmos is built-in. Use it for ANY question involving an equation, intersection, or function modeling."
    ]
  },
  {
    category: "Math: Professional Tier",
    icon: "Brain",
    tips: [
      "Plug-and-Chug: If variables are in the answer choices, plug in easy primes like 2, 3, or 5 to see which choice holds true.",
      "Backsolving: Start with choice C for questions asking for a specific value. If it's too high, try A or B.",
      "Discriminant Hack: Use b²-4ac for quadratic questions to immediately identify the number of roots."
    ]
  },
  {
    category: "English: Elite Precision",
    icon: "PenTool",
    tips: [
      "Conciseness is King: The shortest grammatically correct answer is correct over 60% of the time.",
      "Sentence Boundaries: Periods, semicolons, and commas + conjunctions (FANBOYS) are logically identical.",
      "Vocab Charge: Identify if the context is positive, negative, or neutral before looking at the word choices."
    ]
  }
];

export const SHOP_ITEMS = [
  {
    id: 'theme_default',
    name: 'Void Black',
    description: 'The standard elite interface.',
    price: 0,
    type: 'theme',
    color: 'from-gray-900 to-black'
  },
  {
    id: 'theme_neon',
    name: 'Cyberpunk',
    description: 'High contrast neon aesthetics.',
    price: 500,
    type: 'theme',
    color: 'from-indigo-600 to-purple-600'
  },
  {
    id: 'theme_forest',
    name: 'Zen Garden',
    description: 'Calming greens for deep focus.',
    price: 300,
    type: 'theme',
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'theme_crimson',
    name: 'Red Shift',
    description: 'Aggressive red tones for speed.',
    price: 400,
    type: 'theme',
    color: 'from-red-600 to-orange-700'
  }
];