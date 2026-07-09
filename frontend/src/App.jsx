import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import { useAuth } from './store/auth'
import { useTheme } from './store/theme'
import { wsConnect } from './lib/api'
import { toast, Toaster } from './components/toaster'
import Landing from './pages/Landing'
import { lazy, Suspense } from 'react'
import { Spinner } from './components/ui'

const Auth = lazy(() => import('./pages/Auth'))
const AppHome = lazy(() => import('./pages/AppHome'))
const Report = lazy(() => import('./pages/Report'))
const Incidents = lazy(() => import('./pages/Incidents'))
const IncidentDetail = lazy(() => import('./pages/IncidentDetail'))
const MapPage = lazy(() => import('./pages/MapPage'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Alerts = lazy(() => import('./pages/Alerts'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Resources = lazy(() => import('./pages/Resources'))
const Crews = lazy(() => import('./pages/Crews'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Admin = lazy(() => import('./pages/Admin'))
const AgencyDashboard = lazy(() => import('./pages/AgencyDashboard'))
const Knowledge = lazy(() => import('./pages/Knowledge'))

function Protected({ children, roles }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/app/login" state={{ from: loc.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />
  return children
}

function Loader() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-ink-400">
      <Spinner size={28} className="text-brand-600" />
    </div>
  )
}

function pickHomeByRole(role) {
  if (role === 'admin') return '/app/admin'
  if (role === 'responder') return '/app/command'
  if (['ngo', 'hospital', 'police', 'fire', 'municipality'].includes(role)) return '/app/command'
  return '/app/home'
}

function AppIndex() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/app/login" replace />
  return <Navigate to={pickHomeByRole(user.role)} replace />
}

function WsListener() {
  const nav = useNavigate()
  useEffect(() => {
    const ws = wsConnect((msg) => {
      if (msg.event === 'incident_created') toast(`🚨 New ${msg.data.incident_type} · ${msg.data.ai_severity}`, 'alert')
      if (msg.event === 'alert_created') toast(`📢 ${msg.data.title}`, 'info')
    })
    return () => ws.close()
  }, [nav])
  return null
}

export default function App() {
  useTheme()
  const { user } = useAuth()
  return (
    <AppShell>
      <Toaster />
      {user && <WsListener />}
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app/login" element={<Auth />} />
          <Route path="/app" element={<AppIndex />} />
          <Route path="/app/home" element={<Protected><AppHome /></Protected>} />
          <Route path="/app/command" element={<Protected roles={['responder','ngo','hospital','police','fire','municipality','admin']}><AgencyDashboard /></Protected>} />
          <Route path="/app/admin" element={<Protected roles={['admin']}><Admin /></Protected>} />
          <Route path="/app/report" element={<Protected><Report /></Protected>} />
          <Route path="/app/incidents" element={<Protected roles={['responder','admin','police','fire','municipality','ngo']}><Incidents /></Protected>} />
          <Route path="/app/incidents/:id" element={<Protected><IncidentDetail /></Protected>} />
          <Route path="/app/map" element={<Protected><MapPage /></Protected>} />
          <Route path="/app/tasks" element={<Protected roles={['volunteer','responder','admin','police','fire','hospital','ngo','municipality']}><Tasks /></Protected>} />
          <Route path="/app/alerts" element={<Protected><Alerts /></Protected>} />
          <Route path="/app/analytics" element={<Protected roles={['responder','admin','municipality']}><Analytics /></Protected>} />
          <Route path="/app/resources" element={<Protected roles={['responder','admin','municipality','ngo','hospital','fire','police']}><Resources /></Protected>} />
          <Route path="/app/crews" element={<Protected roles={['responder','admin','municipality']}><Crews /></Protected>} />
          <Route path="/app/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/app/knowledge" element={<Protected><Knowledge /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
