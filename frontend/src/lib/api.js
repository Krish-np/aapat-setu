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
    if (err.response?.status === 401 && !location.pathname.endsWith('/app/login')) {
      localStorage.removeItem('aapat_token')
      localStorage.removeItem('aapat_user')
      if (location.pathname.includes('/app')) location.href = '/app/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Singleton WS so we never open duplicate connections across React renders.
let _ws = null
let _listeners = new Set()
let _retry = 0
let _retryTimer = null

function _ensureWs() {
  if (_ws && (_ws.readyState === 0 || _ws.readyState === 1)) return
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${proto}://${location.host}/ws`
  try { _ws?.close() } catch {}
  _ws = new WebSocket(url)
  _ws.onopen = () => { _retry = 0 }
  _ws.onmessage = (e) => {
    let msg
    try { msg = JSON.parse(e.data) } catch { return }
    _listeners.forEach((fn) => {
      try { fn(msg) } catch {}
    })
  }
  _ws.onclose = () => {
    _ws = null
    const d = Math.min(1000 * 2 ** _retry, 8000)
    _retry++
    if (_retryTimer) clearTimeout(_retryTimer)
    _retryTimer = setTimeout(_ensureWs, d)
  }
  _ws.onerror = () => { try { _ws?.close() } catch {} }
}

export function wsConnect(onMessage) {
  _listeners.add(onMessage)
  _ensureWs()
  return {
    send: (data) => _ws && _ws.readyState === 1 && _ws.send(JSON.stringify(data)),
    close: () => {
      _listeners.delete(onMessage)
      // Don't close the global socket — other subscribers may still need it.
    },
  }
}
