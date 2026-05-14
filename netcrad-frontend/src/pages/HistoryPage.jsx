import { useNavigate } from 'react-router-dom'
import { Download, ChevronRight, BarChart2 } from 'lucide-react'
import { useScan } from '../context/ScanContext'
import { useTheme } from '../context/ThemeContext'
import { mockHistory } from '../data/mockData'
import GradeBadge from '../components/shared/GradeBadge'
import clsx from 'clsx'

export default function HistoryPage() {
  const { isDark } = useTheme()
  const { scanResults } = useScan()
  const navigate = useNavigate()

  // Merge live scans + mock history
  const liveScanEntries = Object.values(scanResults).map(r => ({
    id: r.id,
    url: r.url,
    grade: r.grade,
    findings: r.findings?.length || 0,
    cvssAvg: r.cvssAvg,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    critical: r.critical, high: r.high, medium: r.medium, low: r.low,
  }))

  const allHistory = [...liveScanEntries, ...mockHistory]

  const handleDownload = (id, url) => {
    alert(`Downloading report for ${url}...\n(Connect to GET /api/report/${id}/pdf)`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={clsx('font-display font-bold text-xl', isDark ? 'text-white' : 'text-slate-900')}>
            Scan history
          </h2>
          <p className={clsx('text-xs mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>
            {allHistory.length} scans recorded
          </p>
        </div>
        <div className={clsx('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border', isDark ? 'border-dark-border text-slate-400 bg-dark-card' : 'border-light-border text-slate-500 bg-light-card')}>
          <BarChart2 size={12} />
          All scans
        </div>
      </div>

      {/* Table */}
      <div className={clsx('rounded-2xl border overflow-hidden', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border')}>
        {/* Table header */}
        <div className={clsx(
          'grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wide border-b',
          isDark ? 'border-dark-border text-slate-500 bg-dark-surface/50' : 'border-light-border text-slate-400 bg-light-card/50'
        )}>
          <div className="col-span-4">Target</div>
          <div className="col-span-2 text-center">Grade</div>
          <div className="col-span-2 text-center">Findings</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-1" />
        </div>

        {/* Table rows */}
        {allHistory.map((scan, i) => (
          <div
            key={scan.id}
            className={clsx(
              'grid grid-cols-12 items-center px-5 py-4 cursor-pointer transition-colors group',
              i < allHistory.length - 1 && (isDark ? 'border-b border-dark-border' : 'border-b border-light-border'),
              isDark ? 'hover:bg-dark-surface/60' : 'hover:bg-light-card/60'
            )}
          >
            {/* Target */}
            <div
              className="col-span-4 flex items-center gap-2 min-w-0"
              onClick={() => navigate(`/results/${scan.id}`)}
            >
              <div className={clsx(
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                scan.grade === 'A' ? 'bg-green-500' :
                scan.grade === 'B' ? 'bg-teal-500' :
                scan.grade === 'C' ? 'bg-yellow-500' :
                scan.grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
              )} />
              <span className={clsx('text-sm font-medium truncate font-mono', isDark ? 'text-slate-200' : 'text-slate-800')}>
                {scan.url}
              </span>
            </div>

            {/* Grade */}
            <div className="col-span-2 flex justify-center" onClick={() => navigate(`/results/${scan.id}`)}>
              <GradeBadge grade={scan.grade} size="sm" />
            </div>

            {/* Findings count with mini breakdown */}
            <div className="col-span-2 flex flex-col items-center" onClick={() => navigate(`/results/${scan.id}`)}>
              <span className={clsx('text-sm font-bold font-display', isDark ? 'text-slate-200' : 'text-slate-800')}>
                {scan.findings}
              </span>
              {scan.critical > 0 && (
                <span className="text-xs text-red-400">{scan.critical} critical</span>
              )}
            </div>

            {/* Date */}
            <div className="col-span-3" onClick={() => navigate(`/results/${scan.id}`)}>
              <span className={clsx('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {scan.date}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end gap-1">
              <button
                onClick={() => handleDownload(scan.id, scan.url)}
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100',
                  isDark ? 'hover:bg-dark-border text-slate-400' : 'hover:bg-light-border text-slate-500'
                )}
              >
                <Download size={13} />
              </button>
              <button
                onClick={() => navigate(`/results/${scan.id}`)}
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0',
                  isDark ? 'hover:bg-dark-border text-slate-400' : 'hover:bg-light-border text-slate-500'
                )}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}

        {allHistory.length === 0 && (
          <div className="py-16 text-center">
            <p className={clsx('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>No scans yet. <button onClick={() => navigate('/')} className="text-brand-500 hover:underline">Run your first scan</button></p>
          </div>
        )}
      </div>
    </div>
  )
}
