import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import { Card, Badge, Button, Skeleton, EmptyState, priorityBadge, statusBadge } from '../components/ui'
import PageHeader from '../components/PageHeader'
import RelativeTime from '../components/RelativeTime'
import { ClipboardList, AlertTriangle, ExternalLink } from 'lucide-react'

function ReportSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map(i => (
        <Card key={i} className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function MyReports() {
  const { t } = useTranslation()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    api.get('/api/incidents', { params: { mine: true } })
      .then(r => { setReports(r.data); setLoading(false) })
      .catch(e => { setErr(e.message || t('toast.error_generic')); setLoading(false) })
  }, [])

  return (
    <div className="max-w-3xl">
      <PageHeader
        icon={ClipboardList}
        iconColor="text-indigo-500"
        title={t('app.my_reports')}
        subtitle={t('incident.my_reports_subtitle', 'Track the status of emergencies you have reported')}
        actions={
          <Link to="/app/report">
            <Button>
              <AlertTriangle size={16} /> {t('nav.report')}
            </Button>
          </Link>
        }
      />

      {err && (
        <Card className="!bg-red-50 dark:!bg-red-500/10 !border-red-200 dark:!border-red-500/20 text-red-700 dark:text-red-300 text-sm mb-4">
          {err}
        </Card>
      )}

      {loading ? (
        <ReportSkeleton />
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardList size={28} />}
            title={t('app.no_reports')}
            description={t('incident.no_reports_desc', 'When you report an emergency, you will see live updates here.')}
            action={
              <Link to="/app/report">
                <Button variant="secondary" size="sm">{t('app.first_report')}</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {reports.map((r, idx) => {
              const pb = priorityBadge(r.ai_severity || r.severity)
              const sb = statusBadge(r.status)
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3) }}
                >
                  <Card hover className="group">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h3 className="font-semibold capitalize text-ink-900 dark:text-white break-words">
                          {t(`incident_types.${r.incident_type}`, (r.incident_type || '').replaceAll('_', ' '))}
                        </h3>
                        <Badge color={pb.color}>{pb.label}</Badge>
                        <Badge color={sb.color} dot>{sb.label.replaceAll('_', ' ')}</Badge>
                      </div>
                      <RelativeTime ts={r.created_at} className="text-[11px] text-ink-400 whitespace-nowrap tabular-nums flex-shrink-0 mt-0.5" />
                    </div>

                    <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed line-clamp-3 mb-3 break-words">
                      {r.ai_summary || r.description || '—'}
                    </p>

                    {r.ai_summary && (
                      <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mb-3">
                        <span className="font-bold uppercase tracking-wide">AI</span>
                        <span>{t('incident.auto_summarized', 'Auto-summarized')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-ink-400 tabular-nums">#{r.id}</span>
                      <Link to={`/app/incidents/${r.id}`}>
                        <Button variant="ghost" size="sm" className="group-hover:text-brand-600">
                          <ExternalLink size={14} /> {t('common.view_details')}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
