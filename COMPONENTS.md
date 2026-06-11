# 📚 LearnPath AI - Component Documentation

## Overview

This document details every component and page in the LearnPath AI project, explaining structure, props, and how to use them.

---

## 📄 Pages (Full Screen Components)

### 1. **LandingPage** (`src/pages/LandingPage.jsx`)

The main landing/home page showcasing the platform.

#### Features:
- Hero section with gradient text and CTA buttons
- 6 feature cards in grid layout
- How it works section (3 steps)
- Testimonials carousel
- Final CTA section
- Scroll animations with Framer Motion

#### Key Elements:
```javascript
<motion.div>              // Animated container
<Link to="/quiz">         // Navigation
<gradient-text>           // Color effect
<glass-effect>            // Card styling
```

#### How to Modify:
- Change hero text: Update h1 content
- Add features: Add to `features` array
- Modify testimonials: Update `testimonials` array
- Change CTA links: Update `to` attributes

#### Used Components:
- Icon components from Lucide React
- Framer Motion for animations

---

### 2. **QuizPage** (`src/pages/QuizPage.jsx`)

Interactive quiz with timer, progress tracking, and results.

#### Features:
- Question display with category badge
- 4 multiple-choice options
- Progress bar showing completion
- Timer (5 minutes)
- Question navigation (Previous/Next)
- Results screen with score analysis
- Question indicators at bottom

#### State:
```javascript
const [currentQuestion, setCurrentQuestion]   // Current question index
const [selectedAnswers, setSelectedAnswers]   // User's answers
const [showResults, setShowResults]           // Results screen toggle
const [timeRemaining, setTimeRemaining]       // Timer countdown
```

#### Quiz Data Structure:
```javascript
{
  id: 1,
  question: 'Question text?',
  options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  correct: 0,  // Index of correct answer
  category: 'Calculus'
}
```

#### How to Modify:
- Add questions: Update `quizData` array
- Change timer: Modify `setTimeout(300)` (in seconds)
- Customize result screen: Edit results JSX
- Add animations: Use Framer Motion directives

---

### 3. **Dashboard** (`src/pages/Dashboard.jsx`)

Main dashboard with analytics, progress charts, and learning resources.

#### Features:
- Sidebar navigation (collapsible)
- 4 stat cards (Streak, Mastery, Topics, Time)
- Weekly progress line chart
- Topics breakdown pie chart
- Mastery scores with progress bars
- Achievement badges
- Learning roadmap timeline
- Recommended resources

#### Key Sections:
```javascript
// Sidebar - Navigation and quick stats
// Header - Title and mobile menu toggle
// Main Content:
//   - Stats Grid
//   - Charts Row (Progress + Topics)
//   - Mastery and Achievements
//   - Learning Roadmap
//   - Resources
```

#### Charts Used:
```javascript
<LineChart>        // Weekly progress
<PieChart>         // Topic breakdown
<BarChart>         // Could be added for mastery
```

#### How to Modify:
- Add new stats: Update `stats` array
- Change chart data: Modify `progressData`, `topicsData`
- Update achievements: Edit badges array
- Add/remove sidebar items: Update nav array

#### Real API Integration:
```javascript
import { analyticsService } from '../services/api'

const loadCharts = async () => {
  const weeklyData = await analyticsService.getWeeklyProgress()
  const topicsData = await analyticsService.getTopicBreakdown()
  // Use data...
}
```

---

### 4. **AITutorPage** (`src/pages/AITutorPage.jsx`)

ChatGPT-style AI tutoring interface.

#### Features:
- Main chat area with message bubbles
- User and AI message differentiation
- Typing animation indicator
- Suggested prompts for new users
- Chat history sidebar
- New chat button
- Message timestamps
- Input field with send button

#### State:
```javascript
const [messages, setMessages]                 // Chat messages
const [input, setInput]                       // Input field text
const [isLoading, setIsLoading]               // Typing animation
const [suggestedPrompts, setSuggestedPrompts] // Initial suggestions
const [chats, setChats]                       // Chat history
```

#### Message Structure:
```javascript
{
  id: 1,
  text: 'Message content',
  sender: 'user' | 'ai',
  timestamp: new Date()
}
```

#### How to Modify:
- Change suggested prompts: Update `initialSuggestedPrompts`
- Customize AI responses: Edit `generateAIResponse()` function
- Add chat persistence: Connect to backend API
- Modify message styling: Update className colors

#### Real API Integration:
```javascript
import { tutorService } from '../services/api'

const handleSendMessage = async (text) => {
  const response = await tutorService.sendMessage(text, conversationId)
  setMessages([...messages, response])
}
```

---

### 5. **RoadmapPage** (`src/pages/RoadmapPage.jsx`)

Visual learning roadmap with dependencies and recommendations.

#### Features:
- 4-level learning progression
- Expandable topic sections
- Progress tracking
- Status indicators (completed, in-progress, locked)
- Topic dependencies
- AI recommendations panel
- Current focus sidebar
- Estimated time to mastery

#### Roadmap Structure:
```javascript
{
  id: 1,
  title: 'Fundamentals',
  description: 'Master the basics',
  progress: 100,
  status: 'completed' | 'in-progress' | 'locked',
  topics: [
    { id: '1-1', name: 'Topic Name', status: 'completed' }
  ],
  dependencies: [previousLevelId]
}
```

#### Status Colors:
- **Completed**: Green with checkmark
- **In-Progress**: Cyan with pulse animation
- **Locked**: Gray with lock icon

#### How to Modify:
- Update roadmap structure: Edit `roadmapTopics` array
- Change recommendations: Modify `recommendations` array
- Add levels: Add new section to roadmap
- Customize styling: Update status-based className logic

---

## 🧩 Reusable Components

### 1. **Navbar** (`src/components/Navbar.jsx`)

Navigation bar at top of every page.

#### Props:
```javascript
{
  isDarkMode: boolean,
  toggleTheme: function
}
```

#### Features:
- Logo with gradient effect
- Navigation links (Home, Dashboard, Quiz, AI Tutor, Roadmap)
- Theme toggle button (Sun/Moon icon)
- Mobile hamburger menu
- Responsive design

#### How to Modify:
- Add/remove links: Update `navItems` array
- Change logo: Replace Zap icon or text
- Adjust breakpoint: Change `hidden md:flex` to other breakpoints

#### Usage in App.jsx:
```javascript
<Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
```

---

### 2. **Footer** (`src/components/Footer.jsx`)

Footer on every page.

#### Features:
- Brand section
- 4 columns (Product, Resources, Social, Legal)
- Social media links
- Copyright info
- Responsive grid layout

#### How to Modify:
- Add links: Update link arrays
- Change social icons: Add more icon links
- Modify footer text: Edit column content
- Add newsletter signup: Insert form component

#### Footer Sections:
```javascript
// Brand - Logo and description
// Product - Links to features
// Resources - Help and docs
// Social - Social media links
```

---

## 🎨 Design System

### Color Utilities
```javascript
// Gradient text
<span className="gradient-text">Text</span>

// Glass effect
<div className="glass-effect">Content</div>
<div className="glass-effect-strong">Strong Effect</div>

// Glow effects
<div className="glow-sm">Small Glow</div>
<div className="glow-md">Medium Glow</div>
<div className="glow-lg">Large Glow</div>

// Hover lift
<div className="hover-lift">Content</div>
```

### Animations
```javascript
// Framer Motion example
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Animated content
</motion.div>
```

### Responsive Classes
```javascript
// Tailwind breakpoints
hidden md:block        // Hide on mobile, show on md+
grid-cols-1 md:grid-cols-2  // 1 col on mobile, 2 on md+
px-4 md:px-8          // Different padding
text-lg md:text-xl    // Different font sizes
```

---

## 🪝 Custom Hooks

### `useLearningState` (`src/hooks/useLearningState.js`)

Manages learning-related state.

#### Returns:
```javascript
{
  userProfile,           // User data
  setUserProfile,        // Update user
  weakTopics,           // Weak topics array
  setWeakTopics,        // Update weak topics
  learningProgress,     // Progress by topic
  updateProgress,       // Update progress function
  updateStreak,         // Update streak function
}
```

#### Usage:
```javascript
import useLearningState from '../hooks/useLearningState'

function MyComponent() {
  const { userProfile, updateProgress } = useLearningState()
  // Use in component...
}
```

---

## 🔧 Utility Functions

### `src/utils/helpers.js`

Utility functions for common operations:

```javascript
// Format time
formatTimeRemaining(300)  // "5:00"

// Calculate mastery
calculateMastery(8, 10)  // 80

// Get colors
getMasteryColor(85)  // "text-green-500"
getMasteryBgColor(85)  // "bg-green-500/10"

// Format numbers
formatNumber(1500)  // "1.5K"

// Get greeting
getGreeting()  // "Good morning"

// Generate ID
generateId()  // Random string

// Debounce/Throttle
debounce(func, 300)
throttle(func, 1000)

// Calculate days to mastery
calculateDaysToMastery(45)  // ~9 days

// Get achievements
getAchievements(stats)  // Array of achieved badges

// Email validation
validateEmail('test@example.com')  // true

// Reading time
getReadingTime(text)  // Minutes to read
```

---

## 📊 Mock Data

### `src/data/mockData.js`

All dummy data for the application:

```javascript
mockQuestions        // Quiz questions
mockUserProfile      // User data
mockLearningStats    // Progress over time
mockTopics          // Topic mastery data
mockMasteryScores   // Detailed scores
mockCourses         // Available courses
mockResources       // Learning resources
mockAchievements    // Badges
mockChats           // Chat history
mockMessages        // Initial messages
mockRecommendations // AI recommendations
mockWeakAreas       // Weak topics
mockRoadmapSections // Roadmap structure
```

#### Using Mock Data:
```javascript
import { mockQuestions } from '../data/mockData'

// In component
const [questions, setQuestions] = useState(mockQuestions)
```

---

## 🔌 API Services

### `src/services/api.js`

Ready for backend integration:

```javascript
// Quiz API
quizService.getQuestions()
quizService.submitQuiz(answers)
quizService.getQuizResults(quizId)

// User API
userService.getProfile()
userService.updateProfile(userData)
userService.getProgress()

// Learning API
learningService.getRoadmap()
learningService.getWeakTopics()
learningService.getRecommendations()
learningService.getCourses()

// Tutor API
tutorService.sendMessage(message, conversationId)
tutorService.getConversations()
tutorService.getConversation(conversationId)
tutorService.createConversation(title)

// Analytics API
analyticsService.getWeeklyProgress()
analyticsService.getTopicBreakdown()
analyticsService.getMasteryScores()

// Auth API
authService.login(email, password)
authService.register(userData)
authService.logout()
```

#### Example Usage:
```javascript
import { quizService } from '../services/api'

const loadQuiz = async () => {
  try {
    const questions = await quizService.getQuestions()
    setQuestions(questions)
  } catch (error) {
    console.error('Failed to load quiz:', error)
  }
}
```

---

## 📱 Responsive Breakpoints

```css
/* Tailwind Breakpoints */
sm:  640px   /* Small devices */
md:  768px   /* Tablets */
lg:  1024px  /* Small laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

### Example Responsive Component:
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column mobile, 2 medium, 3 large */}
</div>
```

---

## 🎬 Animation Patterns

### Page Entrance
```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### Staggered Children
```javascript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}
```

### Hover Effect
```javascript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

---

## 🚀 Adding New Features

### Add New Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Add nav link in `Navbar.jsx`

### Add New Chart
```javascript
import { BarChart, Bar, XAxis, YAxis } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Bar dataKey="value" fill="#6366f1" />
  </BarChart>
</ResponsiveContainer>
```

### Add Animation
```javascript
<motion.div
  initial={{ ... }}
  animate={{ ... }}
  transition={{ ... }}
>
  Animated content
</motion.div>
```

---

## 📝 Best Practices

1. **Keep components focused** - One responsibility per component
2. **Use hooks for state** - useState, useEffect, custom hooks
3. **Import optimally** - Only import what you use
4. **Add error handling** - Try-catch for async operations
5. **Make responsive** - Mobile-first approach
6. **Animate smoothly** - Use Framer Motion for interactions
7. **Follow naming** - Clear, descriptive names
8. **Document code** - Comments for complex logic

---

## 🔗 Quick Links

- **React Docs**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion/
- **Recharts**: https://recharts.org
- **Lucide Icons**: https://lucide.dev

---

**Happy coding! 🎓✨**
