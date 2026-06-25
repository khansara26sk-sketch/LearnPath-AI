import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Menu,
  X,
  BookOpen,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  CheckCircle2,
  FileText,
  Brain,
  ListChecks,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

const API_BASE = 'https://learnpath-ai-49xp.onrender.com/api/v1'

const fallbackProgressData = [
  { date: 'Mon', progress: 0 },
  { date: 'Tue', progress: 0 },
  { date: 'Wed', progress: 0 },
  { date: 'Thu', progress: 0 },
  { date: 'Fri', progress: 0 },
  { date: 'Sat', progress: 0 },
  { date: 'Sun', progress: 0 },
]

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4']

export default function Dashboard() {
  const { user, authLoading } = useAuth()
  const navigate = useNavigate()

  const userName =
    user?.displayName || user?.email?.split('@')[0] || 'Student'

  const userId = user?.uid || user?.email || 'guest'

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizHistory, setQuizHistory] = useState([])

  const fetchDashboard = async () => {
  if (!userId || userId === 'guest') {
    setLoading(false)
    return
  }

  console.log("START FETCH")

  try {
    setLoading(true)

    const response = await fetch(`${API_BASE}/dashboard/${userId}`)

    const data = await response.json()
    console.log("Dashboard API:", data)

    setDashboardData(data)
  } catch (error) {
    console.error("Dashboard fetch error:", error)

    setDashboardData({
      success: false,
      user_id: userId,
      quizzes_taken: 0,
      roadmaps_created: 0,
      completed_weeks: 0,
      weak_topics: [],
      needs_revision_count: 0,
    })
  } finally {
    console.log("SETTING FALSE")
    setLoading(false)
  }
}
  const fetchQuizHistory = async () => {
  try {
    const response = await fetch(
      `${API_BASE}/quiz-history/${userId}`
    )

    const data = await response.json()

    if (data.success) {
      setQuizHistory(data.history || [])
    }
  } catch (error) {
    console.error(
      'Quiz history error:',
      error
    )
  }
}

  useEffect(() => {
  if (authLoading) return

  if (!user || userId === 'guest') {
    setLoading(false)
    return
  }

  fetchDashboard()
  fetchQuizHistory()
}, [authLoading, userId])

  const quizzesTaken = dashboardData?.quizzes_taken || 0
  const roadmapsCreated = dashboardData?.roadmaps_created || 0
  const completedWeeks = dashboardData?.completed_weeks || 0
  const weakTopics = dashboardData?.weak_topics || []
  const needsRevisionCount =
    dashboardData?.needs_revision_count || weakTopics.length || 0

  const overallProgress =
    roadmapsCreated > 0
      ? Math.min(
          100,
          Math.round((completedWeeks / (roadmapsCreated * 8)) * 100)
        )
      : 0

  const progressData = dashboardData?.weekly_progress?.length
    ? dashboardData.weekly_progress
    : fallbackProgressData.map((item, index) => ({
        ...item,
        progress:
          index === 6
            ? overallProgress
            : Math.max(0, overallProgress - (6 - index) * 5),
      }))

  const topicsData = [
    { name: 'Quizzes', value: quizzesTaken, color: '#6366f1' },
    { name: 'Roadmaps', value: roadmapsCreated, color: '#8b5cf6' },
    { name: 'Completed Weeks', value: completedWeeks, color: '#06b6d4' },
    { name: 'Needs Revision', value: needsRevisionCount, color: '#ef4444' },
  ].filter((item) => item.value > 0)

  const masteryData = [
    {
      name: 'Roadmap Progress',
      mastery: overallProgress,
      category: 'Learning Path',
    },
    {
      name: 'Quiz Activity',
      mastery: Math.min(100, quizzesTaken * 10),
      category: 'Practice',
    },
    {
      name: 'Consistency',
      mastery: Math.min(100, completedWeeks * 12),
      category: 'Study Habit',
    },
  ]

  const stats = [
    {
      label: 'Quizzes Taken',
      value: quizzesTaken,
      icon: ListChecks,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Roadmaps Created',
      value: roadmapsCreated,
      icon: Target,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Completed Weeks',
      value: completedWeeks,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Needs Revision',
      value: needsRevisionCount,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ]

  const quickTools = [
    {
      title: 'AI Tutor',
      description: 'Ask questions and get instant AI explanations.',
      icon: Zap,
      path: '/tutor',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      title: 'Quiz Practice',
      description: 'Test your knowledge with AI-powered quizzes.',
      icon: ListChecks,
      path: '/quiz',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'Roadmap Generator',
      description: 'Create a personalized learning path.',
      icon: Target,
      path: '/roadmap',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      title: 'PDF Notes Generator',
      description:
        'Upload PDFs and generate summaries, notes, MCQs, and flashcards.',
      icon: FileText,
      path: '/pdf-notes',
      gradient: 'from-orange-500 to-red-600',
    },
  ]

  const liveRoadmap = [
    {
      id: 1,
      title:
        roadmapsCreated > 0
          ? 'Continue your active roadmap'
          : 'Create your first roadmap',
      status: roadmapsCreated > 0 ? 'in-progress' : 'not-started',
      progress: overallProgress,
      path: '/roadmap',
    },
    {
      id: 2,
      title:
        quizzesTaken > 0
          ? 'Review quiz performance'
          : 'Take your first quiz',
      status: quizzesTaken > 0 ? 'in-progress' : 'not-started',
      progress: Math.min(100, quizzesTaken * 10),
      path: '/quiz',
    },
    {
      id: 3,
      title:
        weakTopics.length > 0
          ? `Revise ${weakTopics[0]}`
          : 'Ask AI Tutor for weak topics',
      status: weakTopics.length > 0 ? 'in-progress' : 'not-started',
      progress: weakTopics.length > 0 ? 40 : 0,
      path: '/tutor',
    },
  ]

  const resources = [
    {
      id: 1,
      title:
        weakTopics.length > 0
          ? `Revise ${weakTopics[0]}`
          : 'Generate Roadmap',
      type: weakTopics.length > 0 ? 'Revision' : 'Roadmap',
      duration:
        weakTopics.length > 0 ? 'Needs focus' : `${roadmapsCreated} created`,
      thumbnail: weakTopics.length > 0 ? '⚠️' : '🗺️',
      path: weakTopics.length > 0 ? '/tutor' : '/roadmap',
    },
    {
      id: 2,
      title:
        quizzesTaken > 0 ? 'Practice More Quizzes' : 'Start Quiz Practice',
      type: 'Quiz',
      duration: `${quizzesTaken} taken`,
      thumbnail: '📝',
      path: '/quiz',
    },
    {
      id: 3,
      title: 'Ask AI Tutor',
      type: 'AI Tutor',
      duration: 'Instant help',
      thumbnail: '🤖',
      path: '/tutor',
    },
  ]

  const generateRevisionQuiz = () => {
    const topics = dashboardData?.weak_topics || []

    if (!topics.length) {
      alert('No weak topics found.')
      return
    }

    localStorage.setItem('revision_topics', JSON.stringify(topics))

    const topicString = topics.slice(0, 5).join(', ')

    navigate('/quiz', {
      state: {
        revisionQuizTopic: topicString,
        revisionMode: true,
      },
    })
  }
  
  if (loading) {
  return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-muted-foreground">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
      Loading live dashboard...
    </div>
  )
}

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="flex h-[calc(100vh-64px)]">
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border-r border-border overflow-hidden hidden md:block"
        >
          <div className="p-6 space-y-8 h-full overflow-y-auto">
            <nav className="space-y-3">
              {[
                {
                  icon: BookOpen,
                  label: 'Dashboard',
                  path: '/dashboard',
                  active: true,
                },
                {
                  icon: Target,
                  label: 'Learning Path',
                  path: '/roadmap',
                  active: false,
                },
                {
                  icon: Zap,
                  label: 'AI Tutor',
                  path: '/tutor',
                  active: false,
                },
                {
                  icon: FileText,
                  label: 'PDF Notes',
                  path: '/pdf-notes',
                  active: false,
                },
                {
                  icon: TrendingUp,
                  label: 'Analytics',
                  path: '/dashboard',
                  active: false,
                },
              ].map((item, i) => {
                const Icon = item.icon

                return (
                  <motion.div key={i} whileHover={{ x: 5 }}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                        item.active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-4">
                Live Progress
              </h3>

              <div className="space-y-3">
                {masteryData.map((topic, i) => (
                  <div key={i} className="px-4">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-medium">
                        {topic.name}
                      </span>
                      <span className="text-muted-foreground">
                        {topic.mastery}%
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        style={{
                          width: `${topic.mastery}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                        className="h-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto">
          <div className="bg-card border-b border-border sticky top-0 z-40 p-4 md:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {userName}!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchDashboard}
                  className="hidden md:flex px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 text-sm font-medium"
                >
                  Refresh
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-effect p-6 rounded-xl hover-lift"
                  >
                    <div className={`${stat.bgColor} p-3 rounded-lg w-fit mb-3`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>

                    <p className="text-muted-foreground text-sm mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="glass-effect p-6 rounded-xl border border-red-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">
                  Weak Topics / Needs Revision
                </h3>
              </div>

              {weakTopics.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI detected these weak areas from your quiz analysis.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {weakTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={generateRevisionQuiz}
                    className="mt-5 px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                  >
                    Generate Revision Quiz
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No weak topics found yet. Take a quiz to generate AI analysis.
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-effect p-6 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  AI Learning Tools
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {quickTools.map((tool, i) => {
                  const Icon = tool.icon

                  return (
                    <Link key={tool.title} to={tool.path}>
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        whileHover={{ y: -6 }}
                        className="h-full bg-card p-5 rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center mb-4`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        <h4 className="font-bold mb-2">
                          {tool.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          {tool.description}
                        </p>

                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                          Open
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-effect p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Weekly Progress
                </h3>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="currentColor"
                      style={{ opacity: 0.5 }}
                    />
                    <YAxis
                      stroke="currentColor"
                      style={{ opacity: 0.5 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: '#6366f1', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-effect p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Activity Breakdown
                </h3>

                {topicsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={topicsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {topicsData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: 'none',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No activity yet
                  </div>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2 glass-effect p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Live Mastery Scores
                </h3>

                <div className="space-y-4">
                  {masteryData.map((topic, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">
                            {topic.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {topic.category}
                          </p>
                        </div>

                        <span className="font-bold text-primary">
                          {topic.mastery}%
                        </span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.mastery}%` }}
                          transition={{
                            delay: 0.1 * i,
                            duration: 0.8,
                          }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-effect p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Achievements
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      emoji: '🔥',
                      label: 'Started Learning',
                      unlocked: quizzesTaken > 0 || roadmapsCreated > 0,
                    },
                    {
                      emoji: '⭐',
                      label: 'Quiz Explorer',
                      unlocked: quizzesTaken >= 1,
                    },
                    {
                      emoji: '🚀',
                      label: 'Roadmap Builder',
                      unlocked: roadmapsCreated >= 1,
                    },
                    {
                      emoji: '👑',
                      label: 'Consistent Learner',
                      unlocked: completedWeeks >= 3,
                    },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg flex items-center gap-3 transition-all ${
                        badge.unlocked
                          ? 'bg-yellow-500/10 border border-yellow-500/30'
                          : 'bg-muted/50 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">
                        {badge.emoji}
                      </span>

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {badge.label}
                        </p>
                        {!badge.unlocked && (
                          <p className="text-xs text-muted-foreground">
                            Locked
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-effect p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold mb-6">
                Learning Roadmap
              </h3>

              <div className="space-y-4">
                {liveRoadmap.map((item, i) => {
                  const statusStyles = {
                    'in-progress': 'border-cyan-500/50 bg-cyan-500/5',
                    'not-started': 'border-border',
                    locked: 'border-border opacity-60',
                  }

                  return (
                    <Link key={item.id} to={item.path}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-lg border ${statusStyles[item.status]}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative w-10 h-10">
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full" />
                              <div className="absolute inset-1 bg-card rounded-full flex items-center justify-center">
                                {item.status === 'locked' ? (
                                  '🔒'
                                ) : item.status === 'in-progress' ? (
                                  <span className="text-sm font-bold">
                                    ↻
                                  </span>
                                ) : (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="font-medium">
                                {item.title}
                              </p>
                              {item.progress > 0 && (
                                <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden mt-1">
                                  <div
                                    style={{ width: `${item.progress}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="glass-effect p-6 rounded-xl"
>
  <h3 className="text-lg font-semibold mb-5">
    Recent Quiz History
  </h3>

  {quizHistory.length > 0 ? (
    <div className="space-y-3">
      {quizHistory
        .slice(0, 5)
        .map((quiz, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">
                  {quiz.topic}
                </h4>

                <p className="text-xs text-muted-foreground">
                  {new Date(
                    quiz.created_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-primary font-bold">
                  {quiz.score}%
                </p>

                <p className="text-xs text-muted-foreground">
                  {quiz.correct_answers}/
                  {quiz.total_questions}
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  ) : (
    <p className="text-muted-foreground">
      No quizzes attempted yet.
    </p>
  )}
</motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-effect p-6 rounded-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  Recommended For You
                </h3>

                <Link
                  to="/roadmap"
                  className="text-primary font-medium text-sm hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <Link key={resource.id} to={resource.path}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                    >
                      <div className="text-4xl mb-3">
                        {resource.thumbnail}
                      </div>
                      <h4 className="font-semibold text-sm mb-2">
                        {resource.title}
                      </h4>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{resource.type}</span>
                        <span>{resource.duration}</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}