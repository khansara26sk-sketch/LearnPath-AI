import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  Brain,
  Loader2,
  Database,
  History,
  Clock,
  Sparkles,
  BookOpen,
  ListChecks,
  Layers,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'https://learnpath-ai-49xp.onrender.com/api/v1'

export default function PDFNotesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.uid || user?.email || 'guest'

  const [file, setFile] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [quizTimer, setQuizTimer] = useState(10)

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchHistory = async () => {
    if (userId === 'guest') return

    try {
      setLoadingHistory(true)

      const response = await fetch(`${API_BASE}/pdf/history/${userId}`)

      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('History fetch error:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [userId])

  const handleFileChange = (event) => {
    const selected = event.target.files[0]

    if (!selected) {
      alert('Please upload a valid file.')
      return
    }

    setFile(selected)
    setResult('')
  }

  const trainAI = async () => {
    if (!file) {
      alert('Please upload a PDF first.')
      return
    }

    try {
      setIsTraining(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', userId)

      const response = await fetch(`${API_BASE}/pdf/learn-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Training failed')
      }

      alert('AI successfully trained on this PDF!')
      await fetchHistory()
    } catch (error) {
      console.error(error)
      alert('Failed to train AI.')
    } finally {
      setIsTraining(false)
    }
  }

  const generate = async (type) => {
    if (!file) {
      alert('Please upload a PDF first.')
      return
    }

    try {
      setLoading(true)
      setResult('')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', userId)

      const response = await fetch(`${API_BASE}/pdf/${type}`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error('PDF generation failed')
      }

      if (type === 'quiz') {
        navigate('/quiz', {
          state: {
            generatedQuiz: {
              title: file.name,
              questions: data.questions || [],
            },
            customTimeLimitSeconds: quizTimer * 60,
          },
        })

        return
      }

      setResult(
        data.summary ||
          data.notes ||
          data.mcqs ||
          data.flashcards ||
          'No result generated.'
      )

      await fetchHistory()
    } catch (error) {
      console.error(error)
      setResult('Failed to generate result.')
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryItem = (item) => {
    setResult(item.content || item.summary || item.notes || 'No content saved.')
  }

  const tools = [
    {
      label: 'Generate Summary',
      icon: FileText,
      action: () => generate('summary'),
      className:
        'bg-card border border-border hover:border-primary/50 hover:bg-primary/5',
    },
    {
      label: 'Generate Notes',
      icon: BookOpen,
      action: () => generate('notes'),
      className:
        'bg-card border border-border hover:border-primary/50 hover:bg-primary/5',
    },
    {
      label: 'Generate MCQs',
      icon: ListChecks,
      action: () => generate('mcqs'),
      className:
        'bg-card border border-border hover:border-primary/50 hover:bg-primary/5',
    },
    {
      label: 'Generate Flashcards',
      icon: Layers,
      action: () => generate('flashcards'),
      className:
        'bg-card border border-border hover:border-primary/50 hover:bg-primary/5',
    },
  ]

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            PDF Learning <span className="gradient-text">Studio</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl">
            Upload PDFs and generate summaries, study notes, MCQs,
            flashcards, quizzes, and train your AI tutor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="glass-effect-strong p-6 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                  <Upload className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">Upload PDF</h2>
                  <p className="text-sm text-muted-foreground">
                    Select a PDF to generate learning material.
                  </p>
                </div>
              </div>

              <label className="block cursor-pointer rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center hover:bg-primary/10 transition-all mb-5">
                <Upload className="w-9 h-9 mx-auto mb-3 text-primary" />

                <p className="font-semibold">
                  {file ? file.name : 'Click to upload PDF'}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  PDF files only
                </p>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <div className="space-y-3">
                {tools.map((tool) => {
                  const Icon = tool.icon

                  return (
                    <button
                      key={tool.label}
                      onClick={tool.action}
                      disabled={loading}
                      className={`w-full p-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${tool.className}`}
                    >
                      <Icon className="w-4 h-4" />
                      {tool.label}
                    </button>
                  )
                })}

                <div className="p-3 rounded-xl bg-card border border-border">
                  <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Quiz Timer
                  </label>

                  <select
                    value={quizTimer}
                    onChange={(event) =>
                      setQuizTimer(Number(event.target.value))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>

                <button
                  onClick={() => generate('quiz')}
                  disabled={loading}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Quiz
                    </>
                  )}
                </button>

                <button
                  onClick={trainAI}
                  disabled={isTraining || !file}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Training AI...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Train AI on PDF
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="glass-effect-strong p-6 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-2 mb-5">
                <History className="w-5 h-5 text-primary" />

                <h3 className="text-lg font-semibold">
                  Recent PDF History
                </h3>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No recent PDFs found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {history.map((item, index) => (
                    <button
                      key={item._id || index}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <p className="font-semibold text-sm truncate">
                        {item.filename || 'Uploaded PDF'}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.type || 'Document'}
                        </p>

                        <span className="text-xs text-primary">
                          Open
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            className="lg:col-span-2 glass-effect-strong p-6 rounded-2xl border border-border min-h-[650px] flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">Generated Result</h2>
                <p className="text-sm text-muted-foreground">
                  Your generated study material will appear here.
                </p>
              </div>
            </div>

            <div className="flex-1 glass-effect rounded-2xl p-6 overflow-y-auto">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                  <p className="font-medium">Processing PDF...</p>
                  <p className="text-sm mt-1">
                    AI is reading and generating content.
                  </p>
                </div>
              ) : result ? (
                <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base text-foreground">
                  {result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
                  <Brain className="w-14 h-14 mb-4 text-primary opacity-60" />

                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Ready to learn from your PDF
                  </h3>

                  <p className="max-w-md">
                    Upload a PDF and generate notes, summaries,
                    flashcards, MCQs, quizzes, or train your AI tutor.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}