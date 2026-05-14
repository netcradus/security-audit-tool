import clsx from 'clsx'

const map = {
  critical: 'badge-critical',
  high:     'badge-high',
  medium:   'badge-medium',
  low:      'badge-low',
  info:     'badge-info',
  ok:       'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20',
}

export default function SeverityBadge({ severity }) {
  return (
    <span className={map[severity?.toLowerCase()] || map.info}>
      {severity?.charAt(0).toUpperCase() + severity?.slice(1).toLowerCase()}
    </span>
  )
}
