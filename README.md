# LearnPath AI - Modern AI-Powered Education Platform

A modern, feature-rich education platform frontend built with React, Vite, Tailwind CSS, shadcn/ui, and Recharts. This platform provides AI-powered learning diagnosis, personalized roadmaps, tutoring, and analytics.

## 🌟 Features

- **AI-Powered Diagnosis** - Take interactive quizzes to identify weak concepts
- **Personalized Learning Roadmap** - Get customized learning paths based on your performance
- **AI Tutor Chat** - 24/7 AI tutoring with ChatGPT-style interface
- **Progress Analytics** - Track your learning with interactive charts and metrics
- **Dark/Light Mode** - Beautiful theme switching
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Glassmorphism UI** - Modern glass effect components
- **Smooth Animations** - Framer Motion powered interactions
- **Production-Ready Code** - Modular, clean, and maintainable components

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd LearnPathAI2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 🏗️ Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Navbar.jsx
│   └── Footer.jsx
├── pages/            # Page components
│   ├── LandingPage.jsx
│   ├── Dashboard.jsx
│   ├── QuizPage.jsx
│   ├── AITutorPage.jsx
│   └── RoadmapPage.jsx
├── layouts/          # Layout components
├── hooks/            # Custom React hooks
├── services/         # API services (for future FastAPI integration)
├── data/             # Dummy data and fixtures
├── charts/           # Chart components
├── utils/            # Utility functions
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#6366f1)
- **Secondary**: Purple (#8b5cf6)  
- **Accent**: Cyan (#06b6d4)
- **Background**: White (light mode) / Dark slate (dark mode)

### Components
- **Cards**: Glassmorphism effect with backdrop blur
- **Buttons**: Gradient backgrounds with smooth transitions
- **Typography**: Inter font with clean hierarchy
- **Icons**: Lucide React icons

### Animations
- Page transitions and entrance animations
- Hover effects and interactions
- Progress bar animations
- Typing indicators
- Smooth scrolling

## 🛠️ Tech Stack

- **React 18.3** - UI library
- **Vite 5.0** - Build tool
- **Tailwind CSS 3.3** - Styling
- **Framer Motion 10.16** - Animations
- **Recharts 2.10** - Data visualization
- **Lucide React 0.294** - Icons
- **React Router 6.20** - Routing
- **Zustand 4.4** - State management (optional)

## 📱 Pages

### Landing Page
- Hero section with CTA buttons
- Features showcase
- How it works section
- Testimonials
- Footer

### Quiz Page
- Interactive multiple-choice questions
- Progress bar
- Timer
- Question navigation
- Results analysis

### Dashboard
- Student profile & stats
- Weekly progress charts
- Topic breakdown pie chart
- Mastery scores
- Learning roadmap timeline
- Achievement badges
- Recommended resources

### AI Tutor Chat
- ChatGPT-style chat interface
- Suggested prompts
- Chat history sidebar
- Typing animations
- Message timestamps

### Learning Roadmap
- Visual topic progression
- Dependency management
- Progress indicators
- AI recommendations
- Next steps guidance

## 🔗 Future Integration

The codebase is structured to easily integrate with a FastAPI backend:

1. **API Services** - Create services in `src/services/` for API calls
2. **State Management** - Use Zustand for complex state
3. **Data Fetching** - Replace dummy data with actual API responses

Example:
```javascript
// src/services/api.js
import axios from 'axios'

const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000'

export const quizService = {
  getQuestions: async () => {
    const response = await axios.get(`${API_BASE}/quiz/questions`)
    return response.data
  },
  submitAnswers: async (answers) => {
    const response = await axios.post(`${API_BASE}/quiz/submit`, answers)
    return response.data
  },
}
```

## 🎯 Customization

### Change Primary Color
Update the color values in `tailwind.config.js`:

```javascript
colors: {
  primary: "hsl(var(--primary))",
  // ... other colors
}
```

And in `src/index.css`:
```css
:root {
  --primary: 262 80% 50%; /* Change these values */
}
```

### Add New Pages
1. Create a new component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Navbar.jsx`

### Modify Theme
Toggle between light/dark mode or customize theme colors in the CSS variables.

## 📊 Performance Optimizations

- Code splitting with React Router
- Optimized bundle with Vite
- Lazy loading components
- Memoized components to prevent re-renders
- Image optimization

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a hackathon-quality project. Feel free to fork and improve!

## 📄 License

MIT License - feel free to use this project for anything

## 🙋 Support

For questions or issues, please create an issue in the repository.

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org)
- [Vite Documentation](https://vitejs.dev)

---

**Built with ❤️ for learners everywhere**
