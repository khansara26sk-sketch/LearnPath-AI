import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  deleteUser,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext(null)
const REGISTERED_USERS_KEY = 'learnpath_registered_users'

function getRegisteredUsers() {
  const stored = localStorage.getItem(REGISTERED_USERS_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveRegisteredUser(email) {
  const users = getRegisteredUsers()

  if (!users.includes(email)) {
    users.push(email)
    localStorage.setItem(
      REGISTERED_USERS_KEY,
      JSON.stringify(users)
    )
  }
}

function isRegisteredUser(email) {
  return getRegisteredUsers().includes(email)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  return result
}

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}