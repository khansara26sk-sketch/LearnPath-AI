import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react'

const defaultQuizData = [
  {
    id: 1,
    question: 'What is the derivative of x³?',
    options: ['3x²', 'x²', '3x', 'x³/3'],
    correct: 0,
    category: 'Calculus',
  },
  {
    id: 2,
    question: 'Which of these is NOT a prime number?',
    options: ['17', '23', '25', '31'],
    correct: 2,
    category: 'Mathematics',
  },
  {
    id: 3,
    question: 'What is the mitochondria known as?',
    options: [
      'Cell nucleus',
      'Powerhouse of the cell',
      'Cell membrane',
      'Protein factory',
    ],
    correct: 1,
    category: 'Biology',
  },
  {
    id: 4,
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correct: 2,
    category: 'History',
  },
  {
    id: 5,
    question: 'What is the capital of France?',
    options: ['Lyon', 'Paris', 'Marseille', 'Toulouse'],
    correct: 1,
    category: 'Geography',
  },
]

export default function QuizPage() {
  const location = useLocation()

  const generatedQuiz = location.state?.generatedQuiz || null

  const activeQuiz =
    generatedQuiz?.questions?.length > 0
      ? generatedQuiz.questions
      : defaultQuizData

  const quizTitle = generatedQuiz?.title || 'Diagnostic Quiz'

  const quizDuration = activeQuiz.length * 60

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(quizDuration)

  useEffect(() => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setTimeRemaining(quizDuration)
  }, [generatedQuiz, quizDuration])

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
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion]: optionIndex,
      })
    }
  }

  const handleNext = () => {
    if (currentQuestion < activeQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0

    Object.entries(selectedAnswers).forEach(
      ([questionIndex, answerIndex]) => {
        const question = activeQuiz[parseInt(questionIndex)]

        if (question?.correct === answerIndex) {
          correct++
        }
      }
    )

    return correct
  }

  const handleRetake = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setTimeRemaining(quizDuration)
  }

  const score = calculateScore()

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!activeQuiz || activeQuiz.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 bg-background">
        <div className="max-w-2xl mx-auto text-center glass-effect-strong p-12 rounded-3xl">
          <h1 className="text-3xl font-bold mb-3">
            No Quiz Available
          </h1>

          <p className="text-muted-foreground mb-6">
            Please generate a quiz from the PDF Notes Generator.
          </p>

          <button
            onClick={() => (window.location.href = '/pdf-notes')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold"
          >
            Go to PDF Notes Generator
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-effect-strong p-12 rounded-3xl text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold mb-2">
              Quiz Complete!
            </h1>

            <p className="text-muted-foreground mb-8">
              Here's your result for {quizTitle}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-xl p-4">
                <div className="text-3xl font-bold gradient-text">
                  {score}/{activeQuiz.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Score
                </p>
              </div>

              <div className="bg-card rounded-xl p-4">
                <div className="text-3xl font-bold text-cyan-500">
                  {Math.round((score / activeQuiz.length) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Accuracy
                </p>
              </div>

              <div className="bg-card rounded-xl p-4">
                <div className="text-3xl font-bold text-purple-500">
                  {activeQuiz.length - score}
                </div>
                <p className="text-sm text-muted-foreground">
                  Weak Areas
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8 text-left">
              <h3 className="font-semibold text-lg">
                Diagnostic Summary:
              </h3>

              <ul className="space-y-3">
                {activeQuiz.map((q, index) => {
                  const isCorrect =
                    selectedAnswers[index] === q.correct

                  return (
                    <motion.li
                      key={q.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg ${
                        isCorrect
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            isCorrect
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {isCorrect ? '✓' : '✗'}
                        </div>

                        <div>
                          <p className="font-medium text-sm">
                            {q.question}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Category:{' '}
                            <span className="font-semibold">
                              {q.category || 'PDF Quiz'}
                            </span>
                          </p>

                          {!isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Correct answer:{' '}
                              <span className="font-semibold">
                                {q.options?.[q.correct]}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  )
                })}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                View Dashboard
              </button>

              <button
                onClick={handleRetake}
                className="flex-1 px-6 py-3 border border-primary/50 text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const question = activeQuiz[currentQuestion]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-medium">
                  Question {currentQuestion + 1} of {activeQuiz.length}
                </span>

                {generatedQuiz && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Generated from PDF
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="w-4 h-4 text-cyan-500" />

                <span
                  className={
                    timeRemaining < 60
                      ? 'text-red-500'
                      : 'text-foreground'
                  }
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentQuestion + 1) / activeQuiz.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-effect-strong p-8 rounded-2xl mb-8"
          >
            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                {question.category || 'PDF Quiz'}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold">
                {question.question}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-card border border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === index
                          ? 'bg-white/20 border-white'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {selectedAnswers[currentQuestion] === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>

                    {option}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="p-3 rounded-lg border border-border hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {currentQuestion === activeQuiz.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              Submit Quiz
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              Next Question
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={currentQuestion === activeQuiz.length - 1}
            className="p-3 rounded-lg border border-border hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="mt-8 flex gap-2 justify-center flex-wrap">
          {activeQuiz.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              whileHover={{ scale: 1.1 }}
              className={`w-10 h-10 rounded-full font-semibold transition-all ${
                currentQuestion === index
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : selectedAnswers[index] !== undefined
                  ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}