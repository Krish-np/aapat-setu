import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './store/auth'
import { ToastProvider, toast } from './lib/toast'
import { wsConnect } from './lib/api'

import Auth from './pages/Auth'
import ResponderDashboard from './pages/ResponderDashboard'
import CitizenDashboard from './pages/CitizenDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import ReportIncident from './pages/ReportIncident'
import IncidentsList from './pages/IncidentsList'
import IncidentDetail from './pages/IncidentDetail'
import MapPage from './pages/MapPage'
import MyReports from './pages/MyReports'
import MyTasks from './pages/MyTasks'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'

function RoleHome() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'responder') return <ResponderDashboard />
  if (user.role === 'volunteer') return <VolunteerDashboard />
  return <CitizenDashboard />
}

function Protected({ children, roles }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AICopyToast() {
  useEffect(() => {
    // Welcome toast on first app load
    if (!sessionStorage.getItem('welcomed')) {
      setTimeout(() => {
        toast('🤖 AI triage engine online — demo ready', 'ok')
        sessionStorage.setItem('welcomed', '1')
      }, 600)
    }
  }, [])
  return null
}

function LiveUpdates() {
  const navigate = useNavigate()
  useEffect(() => {
    const ws = wsConnect((msg) => {
      const { event, data } = msg
      switch (event) {
        case 'incident_created':
          toast(`🚨 New ${data.incident_type} reported${data.ai_priority ? ` · ${data.ai_priority} priority` : ''}`, 'ok')
          break
        case 'incident_updated':
          // silent in background
          break
        case 'alert_created':
          toast(`📢 Alert: ${data.title}`, 'ok')
          break
        default: break
      }
    })
    return () => ws.close()
  }, [navigate])
  return null
}

export default function App() {
  const { user, refreshMe } = useAuth()
  useEffect(() => { if (user) refreshMe() }, [])

  return (
    <ToastProvider>
      <AICopyToast />
      {user && <LiveUpdates />}
      <Layout>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
          <Route path="/" element={<RoleHome />} />
          <Route path="/report" element={<Protected><ReportIncident /></Protected>} />
          <Route path="/incidents" element={<Protected roles={['responder']}><IncidentsList /></Protected>} />
          <Route path="/incidents/:id" element={<Protected><IncidentDetail /></Protected>} />
          <Route path="/map" element={<Protected><MapPage /></Protected>} />
          <Route path="/my-reports" element={<Protected roles={['citizen']}><MyReports /></Protected>} />
          <Route path="/volunteer" element={<Protected roles={['volunteer','responder']}><VolunteerDashboard /></Protected>} />
          <Route path="/my-tasks" element={<Protected roles={['volunteer','responder']}><MyTasks /></Protected>} />
          <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
          <Route path="/analytics" element={<Protected roles={['responder']}><Analytics /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
