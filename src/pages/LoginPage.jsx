import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const { user, loginWithGoogle, authLoading } = useAuth()

  const isSignup = mode === 'signup'

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(mode)
      navigate('/dashboard', { replace: true })
    } catch (error) {
  console.error(error)

  if (error.message === 'NO_ACCOUNT_FOUND') {
    alert('No account found. Please sign up first.')
    navigate('/signup')
    return
  }

  alert('Google authentication failed. Please try again.')
}
  }

  if (authLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>

          <p className="text-muted-foreground">
            {isSignup
              ? 'Sign up with Google to start using LearnPath AI.'
              : 'Login with Google to continue learning.'}
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition"
        >
          <span className="text-xl">G</span>
          {isSignup ? 'Signup with Google' : 'Login with Google'}
        </button>

        <div className="text-sm text-center mt-6 text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold">
                Login
              </Link>
            </>
          ) : (
            <>
              New to LearnPath AI?{' '}
              <Link to="/signup" className="text-primary font-semibold">
                Signup
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}