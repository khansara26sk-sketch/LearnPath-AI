import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  Brain,
  ListChecks,
  Loader2,
  Database,
  History,
  Clock // Naye icons add kiye hain
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
  const [isTraining, setIsTraining] = useState(false)
  
  // 🔥 NAYA STATE: Quiz ke timer ke liye (default 10 minutes)
  const [quizTimer, setQuizTimer] = useState(10) 

  // History states
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchHistory = async () => {
    if (userId === 'guest') return;
    
    try {
      setLoadingHistory(true)
      const response = await fetch(`${API_BASE}/pdf/history/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error("History fetch error:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [userId])

  const trainAI = async () => {
    if (!file) { alert('Please upload a PDF first.'); return }
    setIsTraining(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', userId)

      const response = await fetch(`${API_BASE}/pdf/learn-pdf`, {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        alert('AI successfully trained on this PDF!')
        await fetchHistory() 
      } else {
        alert('Failed to train AI.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsTraining(false)
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setResult('')
      console.log("File selected successfully:", selected.name)
    } else {
      alert('Please upload a valid file.')
    }
  }

  const generate = async (type) => {
    if (!file) { alert('Please upload a PDF first.'); return }
    setLoading(true)
    setResult('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', userId)

      const response = await fetch(`${API_BASE}/pdf/${type}`, { method: 'POST', body: formData })
      const data = await response.json()

      if (type === 'quiz') {
        // 🔥 UPDATE: Yahan hum timer ka data quiz page ko bhej rahe hain
        navigate('/quiz', { 
          state: { 
            generatedQuiz: { title: file.name, questions: data.questions || [] },
            timeLimit: quizTimer // <-- Naya data
          } 
        })
        return
      }
      setResult(data.summary || data.notes || data.flashcards || 'No result generated.')
      await fetchHistory() 
    } catch (error) {
      setResult('Failed to generate result.')
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryItem = (item) => {
    setResult(item.content || item.summary || item.notes || "No content saved.")
  }

  return (
    <div className="pt-24 min-h-screen bg-background text-foreground px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PDF Notes Generator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload & History */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Upload Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <input type="file" onChange={handleFileChange} className="mb-4 w-full text-sm" />
              <div className="space-y-3">
                <button onClick={() => generate('summary')} className="w-full p-3 bg-muted hover:bg-muted/80 transition rounded-lg font-medium">Generate Summary</button>
                <button onClick={() => generate('notes')} className="w-full p-3 bg-muted hover:bg-muted/80 transition rounded-lg font-medium">Generate Notes</button>
                
                {/* 🔥 NAYA UI: Timer Select karne ka Dropdown */}
                <div className="flex items-center justify-between gap-2 bg-muted p-2 rounded-lg mt-2">
                  <label className="text-sm font-medium text-muted-foreground whitespace-nowrap pl-1">Quiz Timer:</label>
                  <select 
                    value={quizTimer} 
                    onChange={(e) => setQuizTimer(Number(e.target.value))}
                    className="w-1/2 p-2 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                  >
                    <option value={5}>5 Mins</option>
                    <option value={10}>10 Mins</option>
                    <option value={15}>15 Mins</option>
                    <option value={30}>30 Mins</option>
                  </select>
                </div>

                <button onClick={() => generate('quiz')} className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-lg font-medium">Generate Quiz</button>
                <button onClick={trainAI} disabled={isTraining || !file} className="w-full p-3 bg-teal-600 hover:bg-teal-700 text-white transition rounded-lg font-medium flex items-center justify-center gap-2">
                  {isTraining ? <><Loader2 className="w-4 h-4 animate-spin"/> Training...</> : <><Database className="w-4 h-4"/> Train AI on PDF</>}
                </button>
              </div>
            </div>

            {/* History Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex-1">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                Recent History
              </h3>
              
              {loadingHistory ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center p-4">No recent PDFs found.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {history.map((item, index) => (
                    <button 
                      key={index}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full text-left p-3 rounded-lg border border-border bg-background hover:border-primary/50 transition"
                    >
                      <p className="font-semibold text-sm truncate">{item.filename || "Uploaded PDF"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {item.type || "Document"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Result Viewer */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 min-h-[500px] shadow-sm flex flex-col">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Generated Result
            </h2>
            <div className="flex-1 bg-background rounded-xl p-4 border border-border overflow-y-auto">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Processing PDF...</p>
                </div>
              ) : result ? (
                <div className="whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">{result}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <Brain className="w-12 h-12 mb-3" />
                  <p>Upload a PDF and generate notes, or select from history.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}