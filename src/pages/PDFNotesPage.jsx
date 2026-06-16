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
  
  // 🔥 NAYA STATE: History save karne ke liye
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // 🔥 NAYA FUNCTION: Page khulte hi history fetch karne ke liye
  const fetchHistory = async () => {
    if (userId === 'guest') return;
    
    try {
      setLoadingHistory(true)
      // Hum assume kar rahe hain ki backend par yeh rasta hoga
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

  // Page load hote hi history fetch karo
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
        await fetchHistory() // 🔄 Training ke baad history update karo
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
      formData.append('user_id', userId) // backend tracking ke liye

      const response = await fetch(`${API_BASE}/pdf/${type}`, { method: 'POST', body: formData })
      const data = await response.json()

      if (type === 'quiz') {
        navigate('/quiz', { state: { generatedQuiz: { title: file.name, questions: data.questions || [] } } })
        return
      }
      setResult(data.summary || data.notes || data.flashcards || 'No result generated.')
      await fetchHistory() // 🔄 Generate hone ke baad history update karo
    } catch (error) {
      setResult('Failed to generate result.')
    } finally {
      setLoading(false)
    }
  }

  // 🔥 NAYA FUNCTION: History item par click karne par result dikhane ke liye
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
                <button onClick={() => generate('quiz')} className="w-full p-3 bg-muted hover:bg-muted/80 transition rounded-lg font-medium">Generate Quiz</button>
                <button onClick={trainAI} disabled={isTraining || !file} className="w-full p-3 bg-teal-600 hover:bg-teal-700 text-white transition rounded-lg font-medium flex items-center justify-center gap-2">
                  {isTraining ? <><Loader2 className="w-4 h-4 animate-spin"/> Training...</> : <><Database className="w-4 h-4"/> Train AI on PDF</>}
                </button>
              </div>
            </div>

            {/* 🔥 NAYA UI: History Section */}
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