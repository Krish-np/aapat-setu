import { create } from 'zustand'
import api from '../lib/api'

function loadUser() {
  try { return JSON.parse(localStorage.getItem('aapat_user') || 'null') } catch { return null }
}

export const useAuth = create((set, get) => ({
  user: loadUser(),
  token: localStorage.getItem('aapat_token'),
  loading: false,

  setAuth: (user, token) => {
    localStorage.setItem('aapat_user', JSON.stringify(user))
    localStorage.setItem('aapat_token', token)
    set({ user, token })
  },
  login: async (phone, password) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/api/auth/login', { phone, password })
      get().setAuth(data.user, data.access_token)
      return data.user
    } finally { set({ loading: false }) }
  },
  register: async (payload) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/api/auth/register', payload)
      get().setAuth(data.user, data.access_token)
      return data.user
    } finally { set({ loading: false }) }
  },
  logout: () => {
    localStorage.removeItem('aapat_user'); localStorage.removeItem('aapat_token')
    set({ user: null, token: null })
  },
}))
