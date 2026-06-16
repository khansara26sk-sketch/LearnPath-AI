import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap,
  BookOpen,
  Loader2,
  Calendar,
  Target,
  Clock,
  Layers,
  CheckCircle2,
  Circle,
  Lock,
  Trash2, // 🔥 Naya icon delete button ke liye
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export default function RoadmapPage() {
  const { user, authLoading } = useAuth()
  const navigate = useNavigate()

  const userId = user?.uid || user?.email || 'guest'

  const [quizLoadingWeek, setQuizLoadingWeek] = useState(null)
  const [goal, setGoal] = useState('')
  const [purpose, setPurpose] = useState('Competitive Exam')
  const [level, setLevel] = useState('Beginner')
  const [weeklyHours, setWeeklyHours] = useState(10)
  const [durationWeeks, setDurationWeeks] = useState(8)
  const [weakTopics, setWeakTopics] = useState('')

  const [roadmap, setRoadmap] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [progressData, setProgressData] = useState(null)

  const [loading, setLoading] = useState(false)
  const [savedLoading, setSavedLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [expandedWeek, setExpandedWeek] = useState(null)

  const fetchProgress = async (uid, roadmapId) => {
    try {
      const response = await fetch(
        `${API_BASE}/generate-roadmap/progress/${uid}/${roadmapId}`
      )

      const data = await response.json()

      if (data?.found && data?.progress) {
        setProgressData(data.progress)
      } else {
        setProgressData(null)
      }
    } catch (error) {
      console.error('Progress fetch error:', error)
    }
  }

  const loadSavedRoadmaps = async () => {
    if (!userId || userId === 'guest') return

    try {
      setSavedLoading(true)

      const response = await fetch(
        `${API_BASE}/generate-roadmap/user/${userId}`
      )

      const data = await response.json()

      console.log('Saved Roadmaps:', data)

      if (data?.roadmaps) {
        setSavedRoadmaps(data.roadmaps)

        if (data.roadmaps.length > 0 && !roadmap) {
          const latest = data.roadmaps[0]

          setRoadmap(latest)

          if (latest?.milestones?.length > 0) {
            setExpandedWeek(latest.milestones[0].week)
          }

          await fetchProgress(userId, latest.roadmap_id)
        }
      }
    } catch (error) {
      console.error('Saved roadmap fetch error:', error)
    } finally {
      setSavedLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && userId !== 'guest') {
      loadSavedRoadmaps()
    }
  }, [authLoading, userId])

  const openSavedRoadmap = async (selectedRoadmap) => {
    setRoadmap(selectedRoadmap)
    setProgressData(null)

    if (selectedRoadmap?.milestones?.length > 0) {
      setExpandedWeek(selectedRoadmap.milestones[0].week)
    }

    await fetchProgress(userId, selectedRoadmap.roadmap_id)
  }

  // 🔥 NAYA FUNCTION: Roadmap delete karne ka logic
  const handleDeleteRoadmap = async (e, roadmapId) => {
    e.stopPropagation() // Isse click karne par roadmap open nahi hoga, sirf delete hoga
    
    if (!window.confirm("Are you sure you want to delete this roadmap? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/generate-roadmap/${userId}/${roadmapId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete roadmap')
      }

      // UI se delete kiya hua roadmap hata do
      setSavedRoadmaps((prev) => prev.filter((r) => r.roadmap_id !== roadmapId))
      
      // Agar currently open roadmap delete kiya hai, toh screen clear kar do
      if (roadmap?.roadmap_id === roadmapId) {
        setRoadmap(null)
        setProgressData(null)
        setExpandedWeek(null)
      }

    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete roadmap.')
    }
  }

  const getWeekStatus = (weekNumber) => {
    const found = progressData?.weeks?.find(
      (item) => item.week === weekNumber
    )

    return found?.status || 'locked'
  }

  const generateRoadmap = async () => {
    if (!goal.trim()) {
      alert('Please enter your goal or subject.')
      return
    }

    if (!userId || userId === 'guest') {
      alert('Please login first.')
      return
    }

    try {
      setLoading(true)
      setRoadmap(null)
      setProgressData(null)
      setExpandedWeek(null)

      const weakTopicsArray = weakTopics
        .split(',')
        .map((topic) => topic.trim())
        .filter(Boolean)

      const payload = {
        user_id: userId,
        goal,
        purpose,
        level,
        weekly_hours: Number(weeklyHours),
        duration_weeks: Number(durationWeeks),
        subject: goal,
        weak_topics: weakTopicsArray,
        learning_goal: `Create a ${durationWeeks}-week roadmap for ${goal}`,
      }

      console.log('Roadmap payload:', payload)

      const response = await fetch(`${API_BASE}/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      console.log('ROADMAP GENERATED:', data)

      if (!response.ok) {
        console.error('Roadmap generation error:', data)
        throw new Error('Failed to generate roadmap')
      }

      setRoadmap(data)

      localStorage.setItem('learnpath_roadmap_id', data.roadmap_id)
      localStorage.setItem('learnpath_user_id', data.user_id)

      if (data?.milestones?.length > 0) {
        setExpandedWeek(data.milestones[0].week)
      }

      await fetchProgress(data.user_id, data.roadmap_id)
      await loadSavedRoadmaps()
    } catch (error) {
      console.error(error)
      alert('Roadmap could not be generated. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const completeWeek = async (weekNumber) => {
    if (!roadmap?.roadmap_id) return

    const status = getWeekStatus(weekNumber)

    if (status === 'locked') {
      alert('This week is locked. Complete the previous week first.')
      return
    }

    if (status === 'completed') {
      alert('This week is already completed.')
      return
    }

    try {
      setProgressLoading(true)

      const response = await fetch(
        `${API_BASE}/generate-roadmap/progress/${userId}/${roadmap.roadmap_id}/week/${weekNumber}`,
        {
          method: 'PATCH',
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update progress')
      }

      if (data.progress) {
        setProgressData(data.progress)
      } else {
        await fetchProgress(userId, roadmap.roadmap_id)
      }
    } catch (error) {
      console.error(error)
      alert('Could not update week progress.')
    } finally {
      setProgressLoading(false)
    }
  }

  const generateQuizFromWeek = async (week) => {
    try {
      setQuizLoadingWeek(week.week)

      const topic =
        week.topics?.length > 0 ? week.topics.join(', ') : week.title

      const response = await fetch(`${API_BASE}/generate-from-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          week: week.week,
          topic,
          goal: roadmap?.goal || goal,
          count: 15,
        }),
      })

      if (!response.ok) {
        throw new Error('Quiz generation failed')
      }

      const data = await response.json()

      if (!data.questions || data.questions.length === 0) {
        alert('Quiz could not be generated.')
        return
      }

      navigate('/quiz', {
        state: {
          generatedQuiz: {
            title: data.title || `Week ${week.week}: ${week.title} Quiz`,
            questions: data.questions,
          },
        },
      })
    } catch (error) {
      console.error(error)
      alert('Could not generate quiz.')
    } finally {
      setQuizLoadingWeek(null)
    }
  }

  const totalWeeks = roadmap?.milestones?.length || 0
  const completedCount = progressData?.completed_weeks?.length || 0
  const progress =
    totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
          ✅ Completed
        </span>
      )
    }

    if (status === 'in-progress') {
      return (
        <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-semibold">
          🔄 In Progress
        </span>
      )
    }

    return (
      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
        🔒 Locked
      </span>
    )
  }

  const getStatusIcon = (status) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-7 h-7 text-green-500" />
    }

    if (status === 'in-progress') {
      return <Circle className="w-7 h-7 text-yellow-500 animate-pulse" />
    }

    return <Lock className="w-7 h-7 text-muted-foreground" />
  }

  if (authLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 bg-background min-h-screen">
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
            AI Learning <span className="gradient-text">Roadmap</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl">
            Generate a personalized roadmap for school subjects,
            competitive exams, college skills, or career goals.
          </p>
        </motion.div>

        {savedRoadmaps.length > 0 && (
          <div className="glass-effect-strong p-6 rounded-2xl mb-8 border border-border">
            <h2 className="text-2xl font-bold mb-4">My Saved Roadmaps</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedRoadmaps.map((item) => (
                // 🔥 YAHAN UI CHANGE KIYA HAI: Button ko Div banaya aur Delete icon add kiya
                <div
                  key={item.roadmap_id}
                  onClick={() => openSavedRoadmap(item)}
                  className={`relative text-left p-4 rounded-xl border transition cursor-pointer group flex justify-between items-start ${
                    roadmap?.roadmap_id === item.roadmap_id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="pr-4">
                    <p className="font-semibold line-clamp-2">
                      {item.title}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                      {item.purpose || 'Learning'} ·{' '}
                      {item.milestones?.length || 0} weeks
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteRoadmap(e, item.roadmap_id)}
                    title="Delete Roadmap"
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {savedLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            Loading saved roadmaps...
          </p>
        )}

        <div className="glass-effect-strong p-6 rounded-2xl mb-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Generate Your Roadmap</h2>

              <p className="text-sm text-muted-foreground">
                Example: NEET Biology, Class 10 Maths, Python, DSA,
                Data Engineer
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Goal / Subject
              </label>

              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="NEET Biology, Python, Class 12 Physics..."
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Purpose
              </label>

              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
              >
                <option>School Exam</option>
                <option>Competitive Exam</option>
                <option>College Skill</option>
                <option>Career Goal</option>
                <option>General Learning</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Level
              </label>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Weekly Study Hours
              </label>

              <input
                type="number"
                min="1"
                max="80"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Duration Weeks
              </label>

              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Weak Topics Optional
              </label>

              <input
                value={weakTopics}
                onChange={(e) => setWeakTopics(e.target.value)}
                placeholder="Genetics, Organic Chemistry..."
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Roadmap...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate AI Roadmap
              </>
            )}
          </button>
        </div>

        {!roadmap && !loading && (
          <div className="glass-effect p-10 rounded-2xl border border-border text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />

            <h3 className="text-2xl font-bold mb-2">
              Start by entering your learning goal
            </h3>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              You can create a roadmap for board exams, NEET, JEE,
              UPSC, Python, web development, data science, DSA, or any
              custom subject.
            </p>
          </div>
        )}

        {loading && (
          <div className="glass-effect-strong p-12 rounded-2xl border border-border text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />

            <h3 className="text-2xl font-bold mb-2">
              Building your personalized roadmap
            </h3>

            <p className="text-muted-foreground">
              AI is planning topics, resources, tasks, and weekly
              milestones.
            </p>
          </div>
        )}

        {roadmap && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              <div className="glass-effect-strong p-6 rounded-2xl border border-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {roadmap.title}
                    </h2>

                    <p className="text-muted-foreground mt-2">
                      {roadmap.purpose || purpose} ·{' '}
                      {roadmap.level || level} ·{' '}
                      {roadmap.weekly_hours || weeklyHours} hours/week
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold gradient-text">
                      {progress}%
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Completed
                    </p>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mt-5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  />
                </div>
              </div>

              {roadmap.milestones?.map((week, index) => {
                const isExpanded = expandedWeek === week.week
                const weekStatus = getWeekStatus(week.week)
                const isCompleted = weekStatus === 'completed'
                const isLocked = weekStatus === 'locked'
                const isInProgress = weekStatus === 'in-progress'

                return (
                  <motion.div
                    key={week.week}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.06,
                    }}
                    className={`rounded-2xl border overflow-hidden ${
                      isCompleted
                        ? 'bg-green-500/5 border-green-500/30'
                        : isInProgress
                        ? 'bg-yellow-500/5 border-yellow-500/30'
                        : 'glass-effect-strong border-border opacity-70'
                    }`}
                  >
                    <button
                      onClick={() =>
                        setExpandedWeek(isExpanded ? null : week.week)
                      }
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          {getStatusIcon(weekStatus)}
                        </div>

                        <div>
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <p className="text-sm text-muted-foreground">
                              Week {week.week}
                            </p>

                            {getStatusBadge(weekStatus)}
                          </div>

                          <h3 className="text-xl font-bold">
                            {week.title}
                          </h3>

                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {week.estimated_hours} hours
                          </p>
                        </div>
                      </div>

                      <span className="text-muted-foreground">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: 'auto',
                        }}
                        className="px-6 pb-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-card rounded-xl border border-border p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Layers className="w-4 h-4 text-primary" />
                              Topics
                            </h4>

                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {week.topics?.map((topic, i) => (
                                <li key={i} className="flex gap-2">
                                  <span>•</span>
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-card rounded-xl border border-border p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Tasks
                            </h4>

                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {week.tasks?.map((task, i) => (
                                <li key={i} className="flex gap-2">
                                  <span>•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-card rounded-xl border border-border p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-cyan-500" />
                              Resources
                            </h4>

                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {week.resources?.map((resource, i) => (
                                <li key={i} className="flex gap-2">
                                  <span>•</span>
                                  <span>{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-4">
                            <h4 className="font-semibold mb-3">
                              Practice / Project
                            </h4>

                            <p className="text-sm text-muted-foreground">
                              {week.project ||
                                'Practice set / revision task'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          {!isLocked && (
                            <button
                              onClick={() => generateQuizFromWeek(week)}
                              disabled={quizLoadingWeek === week.week}
                              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {quizLoadingWeek === week.week ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating Quiz...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4" />
                                  Generate Quiz
                                </>
                              )}
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              onClick={() => completeWeek(week.week)}
                              disabled={progressLoading}
                              className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {progressLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark Week Complete
                                </>
                              )}
                            </button>
                          )}

                          {isCompleted && (
                            <button
                              disabled
                              className="px-5 py-2 rounded-lg bg-green-500/10 text-green-500 font-semibold cursor-not-allowed"
                            >
                              ✅ Week Completed
                            </button>
                          )}

                          {isLocked && (
                            <button
                              disabled
                              className="px-5 py-2 rounded-lg bg-muted text-muted-foreground font-semibold cursor-not-allowed"
                            >
                              🔒 Complete previous week first
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <div className="space-y-6">
              <div className="glass-effect-strong p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-500" />
                  Roadmap Summary
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">
                      Goal
                    </p>
                    <p className="font-semibold">
                      {roadmap.goal || goal}
                    </p>
                  </div>

                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">
                      Duration
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {totalWeeks} weeks
                    </p>
                  </div>

                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">
                      Current Week
                    </p>
                    <p className="font-semibold">
                      Week {progressData?.current_week || 1}
                    </p>
                  </div>

                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">
                      Weekly Hours
                    </p>
                    <p className="font-semibold">
                      {roadmap.weekly_hours || weeklyHours} hours/week
                    </p>
                  </div>

                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">
                      AI Mode
                    </p>
                    <p className="font-semibold uppercase">
                      {roadmap.ai_mode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-effect p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold mb-4">
                  Focus Areas
                </h3>

                <div className="flex flex-wrap gap-2">
                  {roadmap.focus_areas?.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-effect p-6 rounded-2xl border border-border text-center">
                <BookOpen className="w-9 h-9 text-cyan-500 mx-auto mb-3" />

                <p className="text-sm text-muted-foreground mb-2">
                  Progress
                </p>

                <p className="text-4xl font-bold">
                  {completedCount}/{totalWeeks}
                </p>

                <p className="text-xs text-muted-foreground mt-2">
                  weeks completed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}