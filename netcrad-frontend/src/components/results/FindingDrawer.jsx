import { X, Wrench, Info, ExternalLink } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import SeverityBadge from '../shared/SeverityBadge'
import clsx from 'clsx'

export default function FindingDrawer({ finding, onClose }) {
  const { isDark } = useTheme()
  if (!finding) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div
        className={clsx(
          'w-full max-w-md h-full overflow-y-auto border-l flex flex-col shadow-2xl animate-slide-up',
          isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={clsx(
          'sticky top-0 z-10 px-5 py-4 border-b backdrop-blur-md',
          isDark ? 'bg-dark-surface/90 border-dark-border' : 'bg-light-surface/90 border-light-border'
        )}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity={finding.severity} />
                <span className={clsx('text-xs font-mono', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {finding.owasp}
                </span>
                <span className={clsx('text-xs font-mono', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  · {finding.scanner}
                </span>
              </div>
              <h3 className={clsx('font-display font-semibold text-base leading-snug', isDark ? 'text-white' : 'text-slate-900')}>
                {finding.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={clsx(
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                isDark ? 'hover:bg-dark-card text-slate-400' : 'hover:bg-light-card text-slate-500'
              )}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CVSS score */}
        <div className={clsx('mx-5 mt-4 p-3 rounded-xl border', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border')}>
          <div className="flex items-center justify-between">
            <div>
              <div className={clsx('text-xs mb-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>CVSS v3 Score</div>
              <div className={clsx(
                'text-2xl font-display font-bold',
                finding.cvss >= 9 ? 'text-red-400' :
                finding.cvss >= 7 ? 'text-orange-400' :
                finding.cvss >= 4 ? 'text-yellow-400' : 'text-green-400'
              )}>
                {finding.cvss}
              </div>
            </div>
            <div className="text-right">
              <div className={clsx('text-xs mb-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>OWASP Category</div>
              <div className={clsx('font-mono font-semibold text-sm', isDark ? 'text-brand-400' : 'text-brand-600')}>{finding.owasp}</div>
            </div>
            <div className="text-right">
              <div className={clsx('text-xs mb-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>Scanner</div>
              <div className={clsx('font-mono text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>{finding.scanner}</div>
            </div>
          </div>

          {/* CVSS bar */}
          <div className={clsx('mt-3 h-1.5 rounded-full overflow-hidden', isDark ? 'bg-dark-surface' : 'bg-light-muted')}>
            <div
              className={clsx(
                'h-full rounded-full transition-all',
                finding.cvss >= 9 ? 'bg-red-500' :
                finding.cvss >= 7 ? 'bg-orange-500' :
                finding.cvss >= 4 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              style={{ width: `${(finding.cvss / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="px-5 mt-5">
          <div className={clsx('flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
            <Info size={12} /> Description
          </div>
          <p className={clsx('text-sm leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {finding.description}
          </p>
        </div>

        {/* Fix */}
        <div className={clsx('mx-5 mt-5 p-4 rounded-xl border', isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200')}>
          <div className={clsx('flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2', isDark ? 'text-green-400' : 'text-green-700')}>
            <Wrench size={12} /> How to fix
          </div>
          <p className={clsx('text-sm leading-relaxed', isDark ? 'text-green-300' : 'text-green-800')}>
            {finding.fix}
          </p>
        </div>

        {/* Footer spacer */}
        <div className="h-8" />
      </div>
    </div>
  )
}
