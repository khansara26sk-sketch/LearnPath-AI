import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  Brain,
  ListChecks,
  Layers,
  Loader2,
  Clock,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export default function PDFNotesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'guest'

  const [file, setFile] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTool, setActiveTool] = useState('')

  // New State for History
  const [history, setHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const loadHistory = async () => {
    if (!userId || userId === 'guest') return
    setIsLoadingHistory(true)
    try {
      const res = await fetch(`${API_BASE}/pdf/history/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to load history', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [userId])

  const saveToHistory = async (fileName, contentType, generatedContent) => {
    try {
      await fetch(`${API_BASE}/pdf/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          file_name: fileName,
          content_type: contentType,
          content: generatedContent
        })
      })
      loadHistory() // Refresh history list
    } catch (error) {
      console.error('Failed to save history', error)
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]

    if (!selected) return

    if (selected.type !== 'application/pdf') {
      alert('Please upload a PDF file only.')
      return
    }

    setFile(selected)
    setResult('')
  }

  const convertMCQTextToQuiz = (mcqText) => {
    const blocks = mcqText
      .split(/\n\s*\n/)
      .filter((block) => block.trim().length > 0)

    const questions = []

    blocks.forEach((block, index) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      const questionLine = lines.find((line) =>
        line.toLowerCase().startsWith('question')
      )

      const optionLines = lines.filter((line) =>
        /^[A-D][).]/i.test(line)
      )

      const answerLine = lines.find((line) =>
        line.toLowerCase().includes('correct answer')
      )

      if (!questionLine || optionLines.length < 4) return

      const question = questionLine
        .replace(/^question\s*\d*\s*[:.)-]?\s*/i, '')
        .trim()

      const options = optionLines.slice(0, 4).map((line) =>
        line.replace(/^[A-D][).]\s*/i, '').trim()
      )

      let correct = 0

      if (answerLine) {
        const match = answerLine.match(/[A-D]/i)
        if (match) {
          correct = match[0].toUpperCase().charCodeAt(0) - 65
        }
      }

      questions.push({
        id: index + 1,
        question,
        options,
        correct,
        category: 'PDF Quiz',
      })
    })

    return questions
  }

  const generate = async (type) => {
    if (!file) {
      alert('Please upload a PDF first.')
      return
    }

    setLoading(true)
    setActiveTool(type)
    setResult('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE}/pdf/${type}`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (type === 'quiz') {
        const questions = data.questions || []

        if (!questions.length) {
          alert('Quiz could not be created. Please try another PDF.')
          return
        }

        navigate('/quiz', {
          state: {
            generatedQuiz: {
              title: file.name.replace('.pdf', ''),
              questions,
            },
          },
        })
        return
      }

      const generatedResult =
        data.summary ||
        data.notes ||
        data.flashcards ||
        'No result generated.'

      setResult(generatedResult)

      // Save to history automatically after generation
      if (generatedResult !== 'No result generated.') {
        await saveToHistory(file.name, type.charAt(0).toUpperCase() + type.slice(1), generatedResult)
      }

    } catch (error) {
      console.error(error)
      setResult('Failed to generate result.')
    } finally {
      setLoading(false)
    }
  }

  const handleHistoryClick = (item) => {
    setActiveTool(item.content_type.toLowerCase())
    setResult(item.content)
  }

  return (
    <div className="pt-24 min-h-screen bg-background text-foreground px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            PDF Notes Generator
          </h1>

          <p className="text-muted-foreground">
            Upload your study PDF and generate summaries, notes, quizzes, and flashcards.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-card border border-border rounded-2xl p-6"
          >
            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center">
              <Upload className="w-10 h-10 mx-auto mb-3 text-primary" />

              <p className="font-semibold mb-2">
                Upload PDF
              </p>

              <p className="text-sm text-muted-foreground mb-4">
                Choose a PDF file from your computer.
              </p>

              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />

              <label
                htmlFor="pdf-upload"
                className="inline-block cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
              >
                Choose File
              </label>
            </div>

            {file && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium truncate">
                  📄 {file.name}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={() => generate('summary')}
                disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-primary/10 transition disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                Generate Summary
              </button>

              <button
                onClick={() => generate('notes')}
                disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-primary/10 transition disabled:opacity-50"
              >
                <Brain className="w-5 h-5" />
                Generate Notes
              </button>

              <button
                onClick={() => generate('quiz')}
                disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-primary/10 transition disabled:opacity-50"
              >
                <ListChecks className="w-5 h-5" />
                Generate Quiz
              </button>

              <button
                onClick={() => generate('flashcards')}
                disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-primary/10 transition disabled:opacity-50"
              >
                <Layers className="w-5 h-5" />
                Generate Flashcards
              </button>
            </div>

            {/* History Section */}
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Recent Generations</h3>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingHistory ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Loading history...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent documents found.</p>
                ) : (
                  history.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-card rounded-lg text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.content_type} • {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 min-h-[500px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Result
              </h2>

              {activeTool && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                  {activeTool === 'mcqs' ? 'quiz' : activeTool}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                {activeTool === 'mcqs'
                  ? 'Generating quiz and opening Quiz Page...'
                  : `Generating ${activeTool}...`}
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {result}
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground text-center">
                <FileText className="w-12 h-12 mb-3" />
                <p>
                  Upload a PDF and choose an option to generate learning material.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}