'use client'

import { create } from 'zustand'
import { User } from '@/types'
import { authApi, setToken, removeToken, getToken } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

interface SignupData {
  name: string
  email: string
  password: string
  role?: string
  company_id?: number
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authApi.post('/auth/login', { email, password })
      const { authToken, user } = res.data
      setToken(authToken)
      set({ token: authToken, user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  signup: async (data) => {
    set({ isLoading: true })
    try {
      const res = await authApi.post('/auth/signup', data)
      const { authToken, user } = res.data
      setToken(authToken)
      set({ token: authToken, user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: () => {
    removeToken()
    set({ user: null, token: null })
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  fetchMe: async () => {
    const token = getToken()
    if (!token) {
      set({ isInitialized: true })
      return
    }
    try {
      const res = await authApi.get('/auth/me')
      set({ user: res.data, token, isInitialized: true })
    } catch {
      removeToken()
      set({ user: null, token: null, isInitialized: true })
    }
  },
}))
