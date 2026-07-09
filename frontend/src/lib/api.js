import axios from 'axios'

const api = axios.create({ baseURL: '/' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aapat_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aapat_token')
      localStorage.removeItem('aapat_user')
      if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/register')) {
        location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

export function wsConnect(onMessage) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${proto}://${location.host}/ws`
  let ws
  let retry = 0
  function connect() {
    ws = new WebSocket(url)
    ws.onopen = () => { retry = 0; console.log('[WS] connected') }
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch {} }
    ws.onclose = () => {
      const delay = Math.min(1000 * 2 ** retry, 8000)
      retry++
      setTimeout(connect, delay)
    }
    ws.onerror = () => ws.close()
  }
  connect()
  return {
    send: (data) => ws && ws.readyState === 1 && ws.send(JSON.stringify(data)),
    close: () => ws && ws.close(),
  }
}
