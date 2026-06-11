// src/data/mockData.js

export const mockQuestions = [
  {
    id: 1,
    question: 'What is the derivative of x³?',
    options: ['3x²', 'x²', '3x', 'x³/3'],
    correct: 0,
    category: 'Calculus',
    difficulty: 'medium',
  },
  {
    id: 2,
    question: 'Which of these is NOT a prime number?',
    options: ['17', '23', '25', '31'],
    correct: 2,
    category: 'Mathematics',
    difficulty: 'easy',
  },
  {
    id: 3,
    question: 'What is the mitochondria known as?',
    options: ['Cell nucleus', 'Powerhouse of the cell', 'Cell membrane', 'Protein factory'],
    correct: 1,
    category: 'Biology',
    difficulty: 'easy',
  },
]

export const mockUserProfile = {
  id: '1',
  name: 'Sarah Chen',
  email: 'sarah@learnpath.ai',
  avatar: '👩‍🎓',
  level: 'Intermediate',
  joinDate: '2024-01-15',
  totalLearningTime: 18.38, // hours
  streak: 12, // days
  topicsCompleted: 4,
  averageMastery: 72,
}

export const mockLearningStats = [
  { date: 'Mon', progress: 45 },
  { date: 'Tue', progress: 52 },
  { date: 'Wed', progress: 48 },
  { date: 'Thu', progress: 61 },
  { date: 'Fri', progress: 73 },
  { date: 'Sat', progress: 81 },
  { date: 'Sun', progress: 87 },
]

export const mockTopics = [
  { name: 'Algebra', value: 85, color: '#6366f1' },
  { name: 'Geometry', value: 62, color: '#8b5cf6' },
  { name: 'Calculus', value: 45, color: '#ec4899' },
  { name: 'Statistics', value: 72, color: '#06b6d4' },
]

export const mockMasteryScores = [
  { name: 'Linear Equations', mastery: 95, category: 'Algebra' },
  { name: 'Quadratic Functions', mastery: 78, category: 'Algebra' },
  { name: 'Polynomials', mastery: 61, category: 'Algebra' },
  { name: 'Trigonometry', mastery: 55, category: 'Geometry' },
  { name: 'Integration', mastery: 42, category: 'Calculus' },
]

export const mockCourses = [
  {
    id: '1',
    title: 'Master Quadratic Equations',
    description: 'Understanding and solving quadratic equations from basics to advanced problems',
    progress: 65,
    status: 'in-progress',
    lessons: 24,
    completedLessons: 15,
  },
  {
    id: '2',
    title: 'Calculus Fundamentals',
    description: 'Introduction to calculus: limits, derivatives, and basic integration',
    progress: 0,
    status: 'not-started',
    lessons: 32,
    completedLessons: 0,
  },
  {
    id: '3',
    title: 'Statistics & Probability',
    description: 'Essential statistics, probability theory, and data analysis',
    progress: 0,
    status: 'locked',
    lessons: 28,
    completedLessons: 0,
  },
]

export const mockResources = [
  {
    id: '1',
    title: 'Quadratic Equations Explained',
    type: 'Video',
    duration: '12 min',
    thumbnail: '🎥',
    url: '#',
  },
  {
    id: '2',
    title: 'Practice Problems Set 5',
    type: 'Practice',
    duration: '20 min',
    thumbnail: '📝',
    url: '#',
  },
  {
    id: '3',
    title: 'Visualizing Parabolas',
    type: 'Interactive',
    duration: '15 min',
    thumbnail: '🎨',
    url: '#',
  },
  {
    id: '4',
    title: 'Quiz: Quadratic Equations',
    type: 'Quiz',
    duration: '10 min',
    thumbnail: '📊',
    url: '#',
  },
]

export const mockAchievements = [
  { id: '1', emoji: '🔥', label: 'Week Warrior', description: '7-day learning streak', unlocked: true },
  { id: '2', emoji: '⭐', label: '100% Accuracy', description: 'Perfect score on a quiz', unlocked: true },
  { id: '3', emoji: '🚀', label: 'Speed Runner', description: 'Complete a course in 7 days', unlocked: false },
  { id: '4', emoji: '👑', label: 'Master Mind', description: 'Complete 10 courses', unlocked: false },
  { id: '5', emoji: '📚', label: 'Learning Legend', description: '100+ hours of learning', unlocked: false },
  { id: '6', emoji: '🎓', label: 'Perfect Student', description: '90%+ mastery in all topics', unlocked: false },
]

export const mockChats = [
  { id: '1', title: 'Understanding Algebra', active: true, date: '2024-12-28' },
  { id: '2', title: 'Calculus Basics', active: false, date: '2024-12-27' },
  { id: '3', title: 'Geometry Problems', active: false, date: '2024-12-26' },
]

export const mockMessages = [
  {
    id: '1',
    text: 'Hi! I\'m your AI tutor. I can help you understand any concept, solve problems, and answer your questions. What would you like to learn today?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 3600000),
  },
]

export const mockRecommendations = [
  {
    id: '1',
    title: 'Focus on Quadratic Equations',
    reason: 'You\'re struggling here (45% mastery)',
    icon: '📊',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Review Linear Equations',
    reason: 'Strengthen foundational concepts before moving forward',
    icon: '✅',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Try Challenge Mode',
    reason: 'You\'re ready for harder problems in completed topics',
    icon: '⚡',
    priority: 'low',
  },
]

export const mockWeakAreas = [
  {
    id: '1',
    topic: 'Calculus',
    mastery: 45,
    reason: 'Limited practice on integration techniques',
    suggestedAction: 'Complete integration practice set',
  },
  {
    id: '2',
    topic: 'Trigonometry',
    mastery: 55,
    reason: 'Difficulty with angle transformations',
    suggestedAction: 'Review unit circle concepts',
  },
  {
    id: '3',
    topic: 'Polynomials',
    mastery: 61,
    reason: 'Need more practice on factoring',
    suggestedAction: 'Practice factoring techniques',
  },
]

export const mockRoadmapSections = [
  {
    id: 1,
    title: 'Fundamentals',
    description: 'Master the basics',
    progress: 100,
    status: 'completed',
  },
  {
    id: 2,
    title: 'Intermediate Level',
    description: 'Build on your foundation',
    progress: 65,
    status: 'in-progress',
  },
  {
    id: 3,
    title: 'Advanced Topics',
    description: 'Challenge yourself',
    progress: 0,
    status: 'locked',
  },
  {
    id: 4,
    title: 'Mastery',
    description: 'Become an expert',
    progress: 0,
    status: 'locked',
  },
]
