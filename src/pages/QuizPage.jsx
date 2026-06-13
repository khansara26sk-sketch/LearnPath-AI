import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export default function QuizPage() {
  const location = useLocation()
  const { user } = useAuth()

  const userId = user?.uid || user?.email || 'guest'

  const generatedQuiz = location.state?.generatedQuiz || null

  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [quizData, setQuizData] = useState([])
  const [quizTitle, setQuizTitle] = useState(
    generatedQuiz?.title || ''
  )
  const [loadingQuiz, setLoadingQuiz] = useState(false)

  const activeQuiz =
    generatedQuiz?.questions?.length > 0
      ? generatedQuiz.questions
      : quizData

  const finalQuizTitle =
    generatedQuiz?.title || quizTitle || 'AI Generated Quiz'

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
  }, [generatedQuiz, quizData, quizDuration])

  useEffect(() => {
    if (showResults || activeQuiz.length === 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
  handleSubmit()
  return 0
}

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showResults, activeQuiz.length])

  const normalizeQuestions = (questions) => {
    return questions
      .map((q, index) => {
        let correctIndex = q.correct

        if (typeof correctIndex !== 'number' && q.answer) {
          correctIndex = q.options?.findIndex(
            (option) =>
              option.toLowerCase().trim() ===
              String(q.answer).toLowerCase().trim()
          )
        }

        if (![0, 1, 2, 3].includes(correctIndex)) {
          correctIndex = 0
        }

        return {
          id: q.id || index + 1,
          question: q.question,
          options: q.options || [],
          correct: correctIndex,
          category: q.category || topic || 'AI Quiz',
        }
      })
      .filter(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4
      )
  }

  const generateQuiz = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic.')
      return
    }

    try {
      setLoadingQuiz(true)
      setQuizData([])
      setSelectedAnswers({})
      setCurrentQuestion(0)
      setShowResults(false)

      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          topic,
          difficulty,
          count: Number(questionCount),
          question_count: Number(questionCount),
        }),
      })

      if (!response.ok) {
        throw new Error('Quiz generation failed')
      }

      const data = await response.json()

      const questions = normalizeQuestions(data.questions || [])

      if (!questions.length) {
        alert('AI could not generate quiz. Try another topic.')
        return
      }

      setQuizTitle(data.title || `${topic} Quiz`)
      setQuizData(questions)
    } catch (error) {
      console.error(error)
      alert('Could not generate quiz.')
    } finally {
      setLoadingQuiz(false)
    }
  }

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

  const saveQuizSubmission = async () => {
  try {
    const answers = activeQuiz.map((question, index) => {
      const selected = selectedAnswers[index]

      return {
  question_id: String(question.id || index + 1),
  selected_option:
    selected !== undefined
      ? question.options[selected]
      : 'Not answered',
  is_correct: selected === question.correct,
}
    })

    const response = await fetch(`${API_BASE}/submit-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        subject: topic || finalQuizTitle || 'AI Quiz',
        topic: topic || finalQuizTitle || 'AI Quiz',
        answers,
        time_taken_seconds: quizDuration - timeRemaining,
      }),
    })

    if (!response.ok) {
  const errorText = await response.text()
  console.error('Quiz submit failed:', errorText)
} else {
  const saved = await response.json()
  console.log('Quiz saved successfully:', saved)
}
  } catch (error) {
    console.error('Quiz save failed:', error)
  }
}

const handleSubmit = async () => {
  await saveQuizSubmission()
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
        <div className="max-w-2xl mx-auto glass-effect-strong p-8 rounded-3xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              AI Quiz Generator
            </h1>

            <p className="text-muted-foreground">
              Generate a custom quiz on any topic using AI.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Topic
              </label>

              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Python, Genetics, DBMS, Calculus..."
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Number of Questions
              </label>

              <select
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(Number(e.target.value))
                }
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary outline-none"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <button
              onClick={generateQuiz}
              disabled={loadingQuiz}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingQuiz ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
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
              Here's your result for {finalQuizTitle}
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
                  Wrong
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
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg ${
                        isCorrect
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
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
                              {q.category || 'AI Quiz'}
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

                <p className="text-xs text-muted-foreground mt-1">
                  {finalQuizTitle}
                </p>
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
                  width: `${
                    ((currentQuestion + 1) / activeQuiz.length) *
                    100
                  }%`,
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
                {question.category || 'AI Quiz'}
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