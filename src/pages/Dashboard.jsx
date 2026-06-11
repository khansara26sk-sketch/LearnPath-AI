import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Menu, X, BookOpen, TrendingUp, Zap, Target, Clock,
  Flame, Award, ArrowRight, CheckCircle2, FileText, Brain, ListChecks
} from 'lucide-react'

const progressData = [
  { date: 'Mon', progress: 45 },
  { date: 'Tue', progress: 52 },
  { date: 'Wed', progress: 48 },
  { date: 'Thu', progress: 61 },
  { date: 'Fri', progress: 73 },
  { date: 'Sat', progress: 81 },
  { date: 'Sun', progress: 87 },
]

const topicsData = [
  { name: 'Algebra', value: 85, color: '#6366f1' },
  { name: 'Geometry', value: 62, color: '#8b5cf6' },
  { name: 'Calculus', value: 45, color: '#ec4899' },
  { name: 'Statistics', value: 72, color: '#06b6d4' },
]

const masteryData = [
  { name: 'Linear Equations', mastery: 95, category: 'Algebra' },
  { name: 'Quadratic Functions', mastery: 78, category: 'Algebra' },
  { name: 'Polynomials', mastery: 61, category: 'Algebra' },
  { name: 'Trigonometry', mastery: 55, category: 'Geometry' },
  { name: 'Integration', mastery: 42, category: 'Calculus' },
]

const roadmap = [
  { id: 1, title: 'Master Quadratic Equations', status: 'in-progress', progress: 65 },
  { id: 2, title: 'Understand Calculus Fundamentals', status: 'locked', progress: 0 },
  { id: 3, title: 'Advanced Integration Techniques', status: 'locked', progress: 0 },
  { id: 4, title: 'Statistics & Probability', status: 'not-started', progress: 0 },
]

const resources = [
  {
    id: 1,
    title: 'Quadratic Equations Explained',
    type: 'Video',
    duration: '12 min',
    thumbnail: '🎥',
  },
  {
    id: 2,
    title: 'Practice Problems Set 5',
    type: 'Practice',
    duration: '20 min',
    thumbnail: '📝',
  },
  {
    id: 3,
    title: 'Visualizing Parabolas',
    type: 'Interactive',
    duration: '15 min',
    thumbnail: '🎨',
  },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const stats = [
    {
      label: 'Learning Streak',
      value: '12 days',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Topics Mastered',
      value: '4',
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Average Mastery',
      value: '72%',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Study Time',
      value: '18h 23m',
      icon: Clock,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
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
      description: 'Upload PDFs and generate summaries, notes, MCQs, and flashcards.',
      icon: FileText,
      path: '/pdf-notes',
      gradient: 'from-orange-500 to-red-600',
    },
  ]

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
                { icon: BookOpen, label: 'Dashboard', path: '/dashboard', active: true },
                { icon: Target, label: 'Learning Path', path: '/roadmap', active: false },
                { icon: Zap, label: 'AI Tutor', path: '/tutor', active: false },
                { icon: FileText, label: 'PDF Notes', path: '/pdf-notes', active: false },
                { icon: TrendingUp, label: 'Analytics', path: '#', active: false },
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
                Progress
              </h3>

              <div className="space-y-3">
                {topicsData.map((topic, i) => (
                  <div key={i} className="px-4">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-medium">{topic.name}</span>
                      <span className="text-muted-foreground">{topic.value}%</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${topic.value}%`, backgroundColor: topic.color }}
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
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Sarah!</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
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

                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-effect p-6 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Learning Tools</h3>
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
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        <h4 className="font-bold mb-2">{tool.title}</h4>

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
                <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="currentColor" style={{ opacity: 0.5 }} />
                    <YAxis stroke="currentColor" style={{ opacity: 0.5 }} />
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
                <h3 className="text-lg font-semibold mb-4">Topics Breakdown</h3>

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
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2 glass-effect p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4">Mastery Scores</h3>

                <div className="space-y-4">
                  {masteryData.map((topic, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">{topic.name}</p>
                          <p className="text-xs text-muted-foreground">{topic.category}</p>
                        </div>

                        <span className="font-bold text-primary">{topic.mastery}%</span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.mastery}%` }}
                          transition={{ delay: 0.1 * i, duration: 0.8 }}
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
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>

                <div className="space-y-3">
                  {[
                    { emoji: '🔥', label: 'Week Warrior', unlocked: true },
                    { emoji: '⭐', label: '100% Accuracy', unlocked: true },
                    { emoji: '🚀', label: 'Speed Runner', unlocked: false },
                    { emoji: '👑', label: 'Master Mind', unlocked: false },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg flex items-center gap-3 transition-all ${
                        badge.unlocked
                          ? 'bg-yellow-500/10 border border-yellow-500/30'
                          : 'bg-muted/50 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">{badge.emoji}</span>

                      <div className="flex-1">
                        <p className="text-sm font-medium">{badge.label}</p>
                        {!badge.unlocked && (
                          <p className="text-xs text-muted-foreground">Locked</p>
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
              <h3 className="text-lg font-semibold mb-6">Learning Roadmap</h3>

              <div className="space-y-4">
                {roadmap.map((item, i) => {
                  const statusStyles = {
                    'in-progress': 'border-cyan-500/50 bg-cyan-500/5',
                    'not-started': 'border-border',
                    'locked': 'border-border opacity-60',
                  }

                  return (
                    <motion.div
                      key={item.id}
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
                                <span className="text-sm font-bold">↻</span>
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="font-medium">{item.title}</p>
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
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-effect p-6 rounded-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recommended For You</h3>

                <a href="#" className="text-primary font-medium text-sm hover:underline">
                  View All
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    whileHover={{ y: -5 }}
                    className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="text-4xl mb-3">{resource.thumbnail}</div>
                    <h4 className="font-semibold text-sm mb-2">{resource.title}</h4>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{resource.type}</span>
                      <span>{resource.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}