import { Download, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import clsx from 'clsx'

export default function ReportDownloadModal({
  reportMeta,
  reportError,
  downloading,
  onChange,
  onClose,
  onDownload,
}) {
  const { isDark } = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className={clsx(
        'w-full max-w-md rounded-2xl border shadow-2xl',
        isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border'
      )}>
        <div className={clsx('flex items-center justify-between px-5 py-4 border-b', isDark ? 'border-dark-border' : 'border-light-border')}>
          <div>
            <h3 className={clsx('font-display font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>Report details</h3>
            <p className={clsx('text-xs mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>These details will appear in the backend PDF report.</p>
          </div>
          <button
            onClick={onClose}
            className={clsx('w-8 h-8 rounded-lg flex items-center justify-center transition-colors', isDark ? 'hover:bg-dark-surface text-slate-400' : 'hover:bg-light-card text-slate-500')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block">
            <span className={clsx('block text-xs font-semibold mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>Company name</span>
            <input
              value={reportMeta.companyName}
              onChange={e => onChange('companyName', e.target.value)}
              className="input-field"
              placeholder="Company name"
            />
          </label>

          <label className="block">
            <span className={clsx('block text-xs font-semibold mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>Audit by</span>
            <input
              value={reportMeta.auditBy}
              onChange={e => onChange('auditBy', e.target.value)}
              className="input-field"
              placeholder="Auditor name"
            />
          </label>

          {reportError && <p className="text-xs text-red-400">{reportError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary" disabled={downloading}>Cancel</button>
            <button onClick={onDownload} className="btn-primary" disabled={downloading}>
              <Download size={14} />
              {downloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
