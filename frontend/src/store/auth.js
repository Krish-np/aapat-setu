import { create } from 'zustand'
import api from '../lib/api'

export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem('aapat_user') || 'null'),
  token: localStorage.getItem('aapat_token') || null,
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
      useAuth.getState().setAuth(data.user, data.access_token)
      return data.user
    } finally { set({ loading: false }) }
  },

  register: async (payload) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/api/auth/register', payload)
      useAuth.getState().setAuth(data.user, data.access_token)
      return data.user
    } finally { set({ loading: false }) }
  },

  logout: () => {
    localStorage.removeItem('aapat_user')
    localStorage.removeItem('aapat_token')
    set({ user: null, token: null })
  },

  refreshMe: async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      localStorage.setItem('aapat_user', JSON.stringify(data))
      set({ user: data })
    } catch {}
  },
}))
