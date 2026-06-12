import { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import QuizPage from './pages/QuizPage'
import AITutorPage from './pages/AITutorPage'
import RoadmapPage from './pages/RoadmapPage'
import PDFNotesPage from './pages/PDFNotesPage'

import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      setIsDarkMode(
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
      )
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={<LandingPage />}
            />

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor"
              element={
                <ProtectedRoute>
                  <AITutorPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <RoadmapPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pdf-notes"
              element={
                <ProtectedRoute>
                  <PDFNotesPage />
                </ProtectedRoute>
              }
            />
            <Route
  path="/signup"
  element={<LoginPage mode="signup" />}
/>
<Route
  path="/login"
  element={<LoginPage mode="login" />}
/>
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App