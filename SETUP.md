# LearnPath AI - Setup & Installation Guide

## 🎯 Project Overview

LearnPath AI is a modern, full-featured education platform frontend built with cutting-edge technologies. It includes all pages, components, and styling needed for a complete learning platform.

## 📋 What's Included

### ✅ Pages
- **Landing Page** - Hero section, features, testimonials, CTA
- **Quiz Page** - Interactive diagnostic quiz with timer and progress
- **Dashboard** - Analytics, progress charts, achievements, roadmap
- **AI Tutor Chat** - ChatGPT-style chat interface with suggested prompts
- **Learning Roadmap** - Visual learning path with dependencies and recommendations

### ✅ Components
- **Navbar** - Responsive navigation with theme toggle
- **Footer** - Links, social, company info
- **Reusable UI Components** - Cards, buttons, progress bars, charts

### ✅ Features
- Dark/Light theme support
- Fully responsive design
- Smooth animations with Framer Motion
- Interactive charts with Recharts
- Glassmorphism UI design
- Production-ready code structure

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd LearnPathAI2
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to `http://localhost:3000`

That's it! The app should load with hot reload enabled.

## 📁 Project Structure

```
LearnPathAI2/
├── src/
│   ├── pages/              # Page components
│   │   ├── LandingPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── QuizPage.jsx
│   │   ├── AITutorPage.jsx
│   │   └── RoadmapPage.jsx
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── hooks/             # Custom React hooks
│   │   └── useLearningState.js
│   ├── services/          # API services
│   │   └── api.js
│   ├── data/              # Mock data
│   │   └── mockData.js
│   ├── utils/             # Utility functions
│   │   └── helpers.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML entry point
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── README.md              # Documentation
└── .gitignore             # Git ignore rules
```

## 🛠️ Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🎨 Customization Guide

### Change Primary Color
Edit `tailwind.config.js` and `src/index.css`:

```css
/* In src/index.css */
:root {
  --primary: 262 80% 50%;      /* Change this to any HSL value */
  --secondary: 217 91% 60%;
}
```

### Add New Page
1. Create `src/pages/MyPage.jsx`
2. Add import in `src/App.jsx`
3. Add route: `<Route path="/mypage" element={<MyPage />} />`
4. Add link in Navbar

### Modify Theme
The app automatically detects system preference for dark/light mode. Users can toggle via the sun/moon icon in the navbar.

### Use Real API
Update `src/services/api.js` with your FastAPI backend URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://your-api-domain.com'
```

Create `.env` file:
```
VITE_API_URL=http://localhost:8000
```

Then use services in components:
```javascript
import { quizService } from '../services/api'

const handleGetQuestions = async () => {
  const questions = await quizService.getQuestions()
  setQuestions(questions)
}
```

## 💻 Tech Stack Details

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI Library |
| Vite | 5.0 | Build Tool |
| Tailwind CSS | 3.3 | Styling |
| Framer Motion | 10.16 | Animations |
| Recharts | 2.10 | Charts |
| Lucide React | 0.294 | Icons |
| React Router | 6.20 | Routing |

## 🎯 Key Features Explained

### Dark/Light Mode
- Auto-detects system preference
- Persists to localStorage
- Toggle with sun/moon icon in navbar
- Uses CSS variables for theming

### Animations
- Page entrance animations
- Hover lift effects on cards
- Smooth transitions
- Loading skeleton animations
- Typing indicators

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Tailwind responsive utilities
- Mobile navigation with hamburger menu

### State Management
- Currently using React hooks
- Ready for Zustand integration
- Mock data for development
- Easy to connect to real API

## 🔌 Backend Integration Ready

The project is structured to easily connect to a FastAPI backend:

### Quiz Endpoint Example
```python
# FastAPI backend
@app.post("/quiz/submit")
async def submit_quiz(answers: Dict):
    # Process answers
    # Calculate score
    # Analyze weak areas
    # Return results
```

### Update Frontend
```javascript
// src/pages/QuizPage.jsx
const handleSubmit = async () => {
  try {
    const results = await quizService.submitQuiz(selectedAnswers)
    setShowResults(true)
    // Process results...
  } catch (error) {
    console.error('Error submitting quiz:', error)
  }
}
```

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Debugging

### Check Console
```
Cmd+Option+J (Mac)
Ctrl+Shift+J (Windows)
```

### React DevTools
Install React DevTools browser extension for component inspection

### Network Tab
Monitor API calls in browser DevTools Network tab

## 📦 Building for Production

```bash
npm run build
```

Creates optimized `dist/` folder ready for deployment.

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms
- Netlify: `npm run build` then drag `dist/` folder
- GitHub Pages: Configure in `vite.config.js`
- Traditional Server: Upload `dist/` contents

## 🤝 Extending the Project

### Add New Chart
```javascript
// In Dashboard.jsx
import { ScatterChart, Scatter } from 'recharts'

<ScatterChart data={data}>
  <Scatter dataKey="value" fill="#6366f1" />
</ScatterChart>
```

### Create New Component
```javascript
// src/components/MyComponent.jsx
import { motion } from 'framer-motion'

export default function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 rounded-lg bg-card"
    >
      Content here
    </motion.div>
  )
}
```

### Add Loading States
```javascript
import { useState } from 'react'

const [loading, setLoading] = useState(false)

// Show loading skeleton
{loading && <div className="animate-shimmer" />}
```

## 📚 Learning Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Vite Guide](https://vitejs.dev/guide/)

## ❓ FAQ

**Q: How do I change the app name?**
A: Update `index.html`, `package.json`, and the navbar logo text.

**Q: Can I use TypeScript?**
A: Yes! Rename files to `.tsx` and they'll work with Vite.

**Q: How do I add authentication?**
A: Create login/register pages and use `localStorage` or a state management library.

**Q: What about mobile app?**
A: Use React Native or frameworks like Expo for mobile.

## 🚨 Troubleshooting

### Port 3000 already in use
```bash
# Use different port
npm run dev -- --port 3001
```

### Dependencies not installing
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
# Clear dist folder
rm -rf dist
npm run build
```

## 📞 Support

For issues or questions:
1. Check the README.md
2. Review component examples
3. Check browser console for errors
4. Inspect Network tab for API issues

## ✨ Next Steps

1. ✅ Project is fully functional
2. Replace mock data with real API calls
3. Add user authentication
4. Implement backend services
5. Deploy to production
6. Add testing (Jest + React Testing Library)

---

**Happy Learning! 🎓**

Built with ❤️ for learners and developers
