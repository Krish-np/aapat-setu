/**
 * RelativeTime — thin wrapper around useRelativeTime for use inside
 * list .map() calls where a hook can't be called directly.
 *
 * Usage:
 *   <RelativeTime ts={incident.created_at} className="text-xs text-ink-400" />
 */
import useRelativeTime from '../lib/useRelativeTime'

export default function RelativeTime({ ts, className = '' }) {
  const when = useRelativeTime(ts)
  return <span className={className}>{when}</span>
}
