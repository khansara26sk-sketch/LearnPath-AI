import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Brain, Target, TrendingUp, Users, MessageSquare, Award } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI Diagnosis',
      description: 'Pinpoint exactly which concepts you struggle with most',
    },
    {
      icon: Target,
      title: 'Personalized Roadmap',
      description: 'Get a custom learning path tailored to your weaknesses',
    },
    {
      icon: MessageSquare,
      title: 'AI Tutoring',
      description: '24/7 AI tutor available to explain any concept',
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Track your improvement with detailed insights',
    },
    {
      icon: Zap,
      title: 'Spaced Repetition',
      description: 'Scientifically-backed learning techniques',
    },
    {
      icon: Award,
      title: 'Mastery Tracking',
      description: 'Earn badges and certificates as you progress',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Pre-Med Student',
      content: 'LearnPath AI helped me go from struggling with organic chemistry to acing the exam. The personalized approach is game-changing!',
      avatar: '👩‍🎓',
    },
    {
      name: 'Marcus Johnson',
      role: 'Computer Science Student',
      content: 'The AI tutor explains algorithms in a way my textbook never could. Worth every penny.',
      avatar: '👨‍💻',
    },
    {
      name: 'Emma Rodriguez',
      role: 'High School Junior',
      content: 'Finally, a platform that actually identifies what I don\'t understand. Not just more practice problems.',
      avatar: '👩‍🏫',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <div className="pt-20 bg-background">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-2 w-fit mx-auto">
              <Zap className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium">AI-Powered Learning Platform</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Fix the <span className="gradient-text">Root Cause</span> of Learning
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            AI-powered diagnosis identifies your weak concepts, generates personalized learning roadmaps, and provides 24/7 tutoring. Master any subject, fast.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link to="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-xl transition-all"
              >
                Start Diagnosis
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link to="/tutor">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-primary/50 text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all"
              >
                Try AI Tutor
              </motion.button>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-8 border-t border-border/20"
          >
            <div>
              <span className="font-bold text-foreground">10K+</span> Students Learning
            </div>
            <div>
              <span className="font-bold text-foreground">4.9★</span> Rating
            </div>
            <div>
              <span className="font-bold text-foreground">50+</span> Topics
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for <span className="gradient-text">Deep Learning</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to master any subject with scientific, personalized learning.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="glass-effect p-6 rounded-2xl hover-lift"
                >
                  <div className="p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg w-fit mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="gradient-text">LearnPath AI</span> Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process to transform your learning journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Diagnosis Quiz',
                description: 'Take an AI-powered diagnostic quiz that identifies gaps in your knowledge with precision.',
              },
              {
                number: '02',
                title: 'Personalized Roadmap',
                description: 'Receive a custom learning path that prioritizes your weak concepts and builds systematically.',
              },
              {
                number: '03',
                title: 'AI Tutoring',
                description: 'Get instant help from our AI tutor that explains concepts at your level, 24/7.',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative"
              >
                <div className="glass-effect p-8 rounded-2xl h-full">
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Students</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what learners are saying about their experience with LearnPath AI.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-effect p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">⭐</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-effect-strong p-12 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">Transform Your Learning?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your personalized learning journey today. Free diagnostic quiz to identify your knowledge gaps.
              </p>
              <Link to="/quiz">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-xl transition-all mx-auto"
                >
                  Start Free Diagnosis
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
