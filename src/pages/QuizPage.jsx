import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react'

// Agar backend se data na aaye toh fallback ke liye default questions
const defaultQuizData = [
  { id: 1, question: 'What is the derivative of x³?', options: ['3x²', 'x²', '3x', 'x³/3'], correct: 0, category: 'Calculus' },
  { id: 2, question: 'Which of these is NOT a prime number?', options: ['17', '23', '25', '31'], correct: 2, category: 'Mathematics' },
]

export default function QuizPage() {
  const location = useLocation()
  // Backend se aaya hua data handle karna
  const generatedQuiz = location.state?.generatedQuiz || null
  const activeQuiz = generatedQuiz?.questions || defaultQuizData
  const quizTitle = generatedQuiz?.title || 'Diagnostic Quiz'
  const quizDuration = activeQuiz.length * 60

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(quizDuration)

  useEffect(() => {
    if (showResults) return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showResults])

  const handleSelectAnswer = (optionIndex) => {
    if (!showResults) {
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: optionIndex })
    }
  }

  const score = Object.entries(selectedAnswers).filter(([idx, ans]) => activeQuiz[idx]?.correct === ans).length

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-background">
      {!showResults ? (
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Question {currentQuestion + 1} of {activeQuiz.length}</span>
              <span className={timeRemaining < 60 ? "text-red-500" : ""}>
                <Clock className="inline w-4 h-4 mr-1"/>
                {Math.floor(timeRemaining/60)}:{String(timeRemaining%60).padStart(2,'0')}
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <motion.div className="h-full bg-indigo-600" animate={{ width: `${((currentQuestion+1)/activeQuiz.length)*100}%` }}/>
            </div>
          </div>

          {/* Question Box */}
          <div className="glass-effect-strong p-8 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold mb-6">{activeQuiz[currentQuestion].question}</h2>
            <div className="space-y-3">
              {activeQuiz[currentQuestion].options.map((opt, i) => (
                <button key={i} onClick={() => handleSelectAnswer(i)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${selectedAnswers[currentQuestion] === i ? 'bg-indigo-600 text-white' : 'bg-card hover:border-indigo-500'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between">
            <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion-1))} disabled={currentQuestion === 0} className="p-3 border rounded-lg"> <ChevronLeft/> </button>
            {currentQuestion === activeQuiz.length - 1 ? (
              <button onClick={() => setShowResults(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold">Submit</button>
            ) : (
              <button onClick={() => setCurrentQuestion(currentQuestion+1)} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold">Next</button>
            )}
            <button onClick={() => setCurrentQuestion(Math.min(activeQuiz.length-1, currentQuestion+1))} disabled={currentQuestion === activeQuiz.length-1} className="p-3 border rounded-lg"> <ChevronRight/> </button>
          </div>
        </div>
      ) : (
        // Results Section
        <div className="max-w-2xl mx-auto glass-effect-strong p-12 rounded-3xl text-center">
          <h1 className="text-4xl font-bold mb-6">Quiz Complete!</h1>
          <p className="text-2xl mb-8">Score: {score} / {activeQuiz.length}</p>
          <button onClick={() => window.location.href='/dashboard'} className="px-6 py-3 bg-indigo-600 text-white rounded-lg">Go to Dashboard</button>
        </div>
      )}
    </div>
  )
}