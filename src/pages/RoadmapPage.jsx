import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Circle, Zap, BookOpen, ArrowDown, Play } from 'lucide-react'

const roadmapTopics = [
  {
    id: 1,
    title: 'Fundamentals',
    description: 'Master the basics',
    progress: 100,
    status: 'completed',
    topics: [
      { id: '1-1', name: 'Numbers & Operations', status: 'completed' },
      { id: '1-2', name: 'Basic Algebra', status: 'completed' },
      { id: '1-3', name: 'Equations', status: 'completed' },
    ],
  },
  {
    id: 2,
    title: 'Intermediate Level',
    description: 'Build on your foundation',
    progress: 65,
    status: 'in-progress',
    topics: [
      { id: '2-1', name: 'Linear Equations', status: 'completed' },
      { id: '2-2', name: 'Quadratic Equations', status: 'in-progress' },
      { id: '2-3', name: 'Polynomials', status: 'not-started' },
    ],
    dependencies: [1],
  },
  {
    id: 3,
    title: 'Advanced Topics',
    description: 'Challenge yourself',
    progress: 0,
    status: 'locked',
    topics: [
      { id: '3-1', name: 'Calculus Introduction', status: 'locked' },
      { id: '3-2', name: 'Derivatives', status: 'locked' },
      { id: '3-3', name: 'Integration', status: 'locked' },
    ],
    dependencies: [2],
  },
  {
    id: 4,
    title: 'Mastery',
    description: 'Become an expert',
    progress: 0,
    status: 'locked',
    topics: [
      { id: '4-1', name: 'Advanced Calculus', status: 'locked' },
      { id: '4-2', name: 'Multivariable Calculus', status: 'locked' },
      { id: '4-3', name: 'Differential Equations', status: 'locked' },
    ],
    dependencies: [3],
  },
]

const recommendations = [
  {
    id: 1,
    title: 'Focus on Quadratic Equations',
    reason: 'You\'re struggling here (45% mastery)',
    icon: '📊',
    action: 'Start Practice',
  },
  {
    id: 2,
    title: 'Review Linear Equations',
    reason: 'Strengthen foundational concepts before moving forward',
    icon: '✅',
    action: 'Review',
  },
  {
    id: 3,
    title: 'Try Challenge Mode',
    reason: 'You\'re ready for harder problems in completed topics',
    icon: '⚡',
    action: 'Challenge',
  },
]

export default function RoadmapPage() {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Circle className="w-5 h-5 text-cyan-500 animate-pulse" />
      case 'locked':
        return <Lock className="w-5 h-5 text-muted-foreground" />
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 border-green-500/30'
      case 'in-progress':
        return 'bg-cyan-500/10 border-cyan-500/30'
      case 'locked':
        return 'bg-muted/50 opacity-60'
      default:
        return 'bg-card border-border'
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Learning <span className="gradient-text">Roadmap</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            A personalized path based on your strengths and weak areas. Progress through structured milestones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Roadmap */}
          <div className="lg:col-span-2">
            {/* Roadmap Timeline */}
            <div className="space-y-6">
              {roadmapTopics.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  {/* Section Header */}
                  <motion.button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === section.id ? null : section.id
                      )
                    }
                    className={`w-full p-6 rounded-xl border transition-all ${
                      section.status === 'completed'
                        ? 'bg-green-500/5 border-green-500/20'
                        : section.status === 'in-progress'
                        ? 'glass-effect-strong'
                        : 'bg-muted/30 border-border opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="flex items-center gap-3">
                          {section.status === 'completed' && (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          )}
                          {section.status === 'in-progress' && (
                            <div className="w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-cyan-500" />
                            </div>
                          )}
                          {section.status === 'locked' && (
                            <Lock className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Progress */}
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {section.progress}
                            <span className="text-lg text-muted-foreground">%</span>
                          </p>
                          <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden mt-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${section.progress}%` }}
                              transition={{ delay: sectionIndex * 0.2, duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            />
                          </div>
                        </div>

                        <div className="text-muted-foreground">
                          {expandedSection === section.id ? '▼' : '▶'}
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Topics List */}
                  {expandedSection === section.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 pl-4"
                    >
                      {section.topics.map((topic, topicIndex) => (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: topicIndex * 0.05 }}
                          onClick={() => setSelectedTopic(topic)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${getStatusColor(
                            topic.status
                          )}`}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(topic.status)}
                            <div className="flex-1">
                              <p className="font-medium">{topic.name}</p>
                            </div>
                            {topic.status !== 'locked' && (
                              <button className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                                {topic.status === 'completed'
                                  ? 'Review'
                                  : 'Continue'}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {/* Dependency Arrow */}
                      {section.dependencies && sectionIndex < roadmapTopics.length - 1 && (
                        <div className="flex justify-center py-2">
                          <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowDown className="w-5 h-5 text-muted-foreground" />
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar - Recommendations & Info */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-effect-strong p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-500" />
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-xl">{rec.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                      </div>
                    </div>
                    <button className="mt-3 w-full px-3 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                      {rec.action}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Current Focus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-effect p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold mb-4">Current Focus</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-indigo-500" />
                    <p className="font-semibold text-sm">Quadratic Equations</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div className="h-full w-2/3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">65% Complete</p>
                </div>

                <div className="p-4 bg-card rounded-lg border border-border">
                  <h4 className="font-medium text-sm mb-3">Next Steps:</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Complete practice set 5</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Watch video explanation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Take mini quiz</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Estimated Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-effect p-6 rounded-xl text-center"
            >
              <BookOpen className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Estimated Time to Master</p>
              <p className="text-3xl font-bold">42 days</p>
              <p className="text-xs text-muted-foreground mt-2">at your current pace</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
