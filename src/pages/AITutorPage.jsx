import 'regenerator-runtime/runtime'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import {
  Send,
  MessageCircle,
  Trash2,
  Plus,
  X,
  Camera,
  FileText,
  Mic,
  MicOff,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'https://learnpath-ai-49xp.onrender.com/api/v1'

const initialSuggestedPrompts = [
  'Explain quadratic equations step by step',
  'What is calculus used for?',
  'Help me understand derivatives',
  'Can you solve this: 2x² + 5x - 3 = 0?',
]

const welcomeMessage = {
  id: 1,
  text: "Hi! I'm your AI tutor. I can help you understand concepts, solve problems, analyze images, read PDFs, and answer your questions. What would you like to learn today?",
  sender: 'ai',
  timestamp: new Date(),
}

export default function AITutorPage() {
  const { user } = useAuth()

  const userId = user?.uid || user?.email || 'guest'
  const [messages, setMessages] = useState([welcomeMessage])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedPrompts, setSuggestedPrompts] = useState(initialSuggestedPrompts)
  const [chats, setChats] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Speech Recognition Hooks
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/history/${userId}`)
      const data = await res.json()
      setChats(data)
    } catch (error) {
      console.error('History Error:', error)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Update input text when user speaks
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  // Mic Toggle Logic
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' })
    }
  }

  const loadConversation = async (conversationId) => {
    try {
      const res = await fetch(`${API_BASE}/chat/conversation/${conversationId}`)
      const data = await res.json()

      if (!data || !data.messages) return

      const loadedMessages = data.messages.map((msg, index) => ({
        id: `${conversationId}-${index}`,
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'ai',
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }))

      setMessages(loadedMessages)
      setCurrentConversationId(conversationId)
      setSuggestedPrompts([])
      removeSelectedFile()
    } catch (error) {
      console.error('Load Conversation Error:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    setSelectedFile(file)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  const getFileIcon = (file) => {
    if (!file) return '📎'
    if (file.type.startsWith('image/')) return '📷'
    if (file.type === 'application/pdf') return '📄'
    if (file.name.endsWith('.docx')) return '📝'
    if (file.name.endsWith('.txt')) return '📃'
    return '📎'
  }

  const handleSendMessage = async (text) => {
    const messageText = text || input

    if (!messageText.trim() && !selectedFile) return

    // Stop listening when sending a message
    if (listening) {
      SpeechRecognition.stopListening()
    }

    const userMessage = {
      id: Date.now(),
      text: selectedFile
        ? `${getFileIcon(selectedFile)} ${selectedFile.name}\n\n${
            messageText || 'Analyze this uploaded file'
          }`
        : messageText,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    resetTranscript()
    setSuggestedPrompts([])
    setIsLoading(true)

    try {
      let response

      if (selectedFile) {
        const formData = new FormData()

        formData.append('user_id', userId)
        formData.append('message', messageText || 'Analyze this uploaded file')
        formData.append('subject', 'General')
        formData.append('conversation_id', currentConversationId || '')
        formData.append('file', selectedFile)

        response = await fetch(`${API_BASE}/chat/upload`, {
          method: 'POST',
          body: formData,
        })
      } else {
        response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            message: messageText,
            subject: 'General',
            context_topics: [],
            conversation_id: currentConversationId,
          }),
        })
      }

      if (!response.ok) {
        throw new Error('Backend request failed')
      }

      const data = await response.json()

      setCurrentConversationId(data.conversation_id)

      const aiResponse = {
        id: Date.now() + 1,
        text: data.reply || 'Sorry, I could not generate a response.',
        sender: 'ai',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
      removeSelectedFile()
      await loadHistory()
    } catch (error) {
      console.error('API Error:', error)

      const errorMessage = {
        id: Date.now() + 2,
        text: 'Failed to connect to backend server.',
        sender: 'ai',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([
      {
        ...welcomeMessage,
        timestamp: new Date(),
      },
    ])
    setCurrentConversationId(null)
    setInput('')
    resetTranscript()
    if (listening) SpeechRecognition.stopListening()
    removeSelectedFile()
    setSuggestedPrompts(initialSuggestedPrompts)
  }

  const clearSidebarOnly = () => {
    setChats([])
  }

  const quickImageActions = [
    'Solve this',
    'Explain this',
    'Summarize this',
    'Create notes',
  ]

  return (
    <div className="pt-16 min-h-screen bg-background flex">
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-80 bg-card border-r border-border hidden lg:flex flex-col"
      >
        <div className="p-4 border-b border-border">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-4">
            Recent Chats
          </p>

          <div className="space-y-2">
            {chats.length === 0 && (
              <p className="text-xs text-muted-foreground">No chats yet</p>
            )}

            {chats.map((chat) => (
              <motion.button
                key={chat.conversation_id}
                whileHover={{ x: 5 }}
                onClick={() => loadConversation(chat.conversation_id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  currentConversationId === chat.conversation_id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <p className="truncate text-sm font-medium">
                  {chat.title || chat.conversation_id}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearSidebarOnly}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear Sidebar
          </motion.button>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card sticky top-16 z-40 px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold">AI Tutor</h1>
              <p className="text-sm text-muted-foreground">
                Ask questions with Voice, images, PDFs, and notes
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                      : 'glass-effect text-foreground rounded-bl-none'
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>

                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="glass-effect px-4 py-3 rounded-2xl rounded-bl-none">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {suggestedPrompts.length > 0 && messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 md:px-8 pb-4"
          >
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              Try asking:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-all text-sm text-muted-foreground hover:text-foreground"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="border-t border-border bg-card px-4 md:px-8 py-4">
          {selectedFile && (
            <div className="max-w-4xl mx-auto mb-3 rounded-xl border border-border bg-muted p-3">
              <div className="flex gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg border border-border bg-card flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium truncate">
                        {getFileIcon(selectedFile)} {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedFile.type.startsWith('image/') && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {quickImageActions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => handleSendMessage(action)}
                          disabled={isLoading}
                          className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 disabled:opacity-50"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
            />

            <input
              type="file"
              ref={cameraInputRef}
              hidden
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-lg bg-muted border border-border hover:bg-primary/10 transition"
              title="Upload file"
            >
              <Plus className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-3 rounded-lg bg-muted border border-border hover:bg-primary/10 transition hidden sm:block"
              title="Take photo"
            >
              <Camera className="w-5 h-5" />
            </motion.button>

            {/* Voice Input Button */}
            {browserSupportsSpeechRecognition && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-lg transition-all border ${
                  listening
                    ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse'
                    : 'bg-muted border-border hover:bg-primary/10 text-foreground'
                }`}
                title={listening ? 'Stop listening' : 'Start speaking'}
              >
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  listening
                    ? 'Listening...'
                    : selectedFile
                    ? 'Ask about this image, PDF, diagram, note, or screenshot...'
                    : 'Message LearnPath AI (Type or click Mic to speak)...'
                }
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors ${
                  listening
                    ? 'bg-red-500/5 border-red-500/50 text-foreground'
                    : 'bg-muted border-border focus:border-primary'
                }`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage()}
              disabled={(!input.trim() && !selectedFile) || isLoading}
              className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 max-w-4xl mx-auto">
            💡 Tip: Click the Mic icon to speak, or upload math questions, PDFs, and screenshots.
          </p>
        </div>
      </div>
    </div>
  )
}