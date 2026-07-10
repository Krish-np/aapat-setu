import { create } from 'zustand'

const getInitial = () => {
  const saved = localStorage.getItem('aapat_theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useTheme = create((set) => {
  const initial = getInitial()
  if (initial === 'dark') document.documentElement.classList.add('dark')
  return {
    theme: initial,
    toggle: () => set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('aapat_theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return { theme: next }
    }),
    setTheme: (t) => {
      localStorage.setItem('aapat_theme', t)
      document.documentElement.classList.toggle('dark', t === 'dark')
      set({ theme: t })
    },
  }
})
