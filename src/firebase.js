import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAPKG3npC9jaHRFeHMZLstGRApzDe6I-Ck',
  authDomain: 'learnpath-ai-e53e4.firebaseapp.com',
  projectId: 'learnpath-ai-e53e4',
  storageBucket: 'learnpath-ai-e53e4.firebasestorage.app',
  messagingSenderId: '38462339411',
  appId: '1:38462339411:web:2857deaae45f99bf4809a6',
  measurementId: 'G-1Y7ZMJEM3Q',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()