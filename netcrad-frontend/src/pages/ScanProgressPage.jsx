import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, Clock, Loader, Globe, Eye } from 'lucide-react'
import { useScan } from '../context/ScanContext'
import { useTheme } from '../context/ThemeContext'
import { scanApi } from '../api'
import { mapBackendScanToResult, scanStagesFromStatus } from '../utils/scanTransform'
import StageResultModal from '../components/scanner/StageResultModal'
import clsx from 'clsx'

export default function ScanProgressPage() {
  const { id } = useParams()
  const { activeScan, setActiveScan, saveResults } = useScan()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [selectedStage, setSelectedStage] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    let timer

    const pollScan = async () => {
      try {
        const scan = await scanApi.getStatus(id)
        if (cancelled) return

        const result = mapBackendScanToResult(scan, id)
        setActiveScan(prev => ({
          id,
          url: result.url || prev?.url || scan.target,
          startedAt: result.startedAt || prev?.startedAt,
          status: result.status,
          error: result.error,
          stages: scanStagesFromStatus(result),
        }))

        if (result.status === 'completed') {
          saveResults(id, result)
          timer = setTimeout(() => navigate(`/results/${id}`), 800)
          return
        }

        if (result.status === 'failed') {
          setError(result.error || 'Scan failed')
          return
        }

        timer = setTimeout(pollScan, 2500)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load scan status')
      }
    }

    pollScan()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [id, navigate, saveResults, setActiveScan])

  if (!activeScan && !error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Loader size={22} className="mx-auto mb-3 text-brand-500 animate-spin" />
        <p className={clsx('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Loading scan status...</p>
      </div>
    )
  }

  if (error && !activeScan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-400 mb-3">{error}</p>
        <button onClick={() => navigate('/')} className="text-brand-500 hover:underline">Start a new scan</button>
      </div>
    )
  }

  const doneCount = activeScan.stages.filter(s => s.status === 'done').length
  const totalProgress = Math.round((doneCount / activeScan.stages.length) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-slide-up">
      {/* Header card */}
      <div className={clsx(
        'rounded-2xl border p-5 mb-6',
        isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border'
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={clsx('w-7 h-7 rounded-lg border flex items-center justify-center', isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-light-card')}>
            <Globe size={14} className="text-brand-500" />
          </div>
          <span className={clsx('font-mono text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-700')}>
            {activeScan.url}
          </span>
        </div>

        {/* Overall progress bar */}
        <div className={clsx('h-1.5 rounded-full mb-1.5 overflow-hidden', isDark ? 'bg-dark-surface' : 'bg-light-card')}>
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <div className={clsx('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
          {activeScan.status === 'failed' ? activeScan.error || error : `${doneCount} of ${activeScan.stages.length} stages complete`}
        </div>
      </div>

      {/* Stages */}
      <div className={clsx(
        'rounded-2xl border overflow-hidden',
        isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border'
      )}>
        {activeScan.stages.map((stage, i) => (
          <StageRow
            key={stage.key}
            stage={stage}
            isDark={isDark}
            isLast={i === activeScan.stages.length - 1}
            onViewResult={() => stage.result && setSelectedStage(stage)}
          />
        ))}
      </div>

      {/* Result modal */}
      {selectedStage && (
        <StageResultModal
          stage={selectedStage}
          onClose={() => setSelectedStage(null)}
        />
      )}
    </div>
  )
}

function StageRow({ stage, isDark, isLast, onViewResult }) {
  const statusIcon = {
    done:    <CheckCircle size={18} className="text-brand-500" />,
    running: <Loader size={18} className="text-brand-400 animate-spin" />,
    queued:  <Clock size={18} className={isDark ? 'text-slate-600' : 'text-slate-400'} />,
    failed:  <AlertTriangle size={18} className="text-red-400" />,
  }

  const statusLabel = {
    done:    <span className="text-brand-500 text-xs font-semibold">Done</span>,
    running: <span className="text-brand-400 text-xs font-semibold tabular-nums">{stage.progress}%</span>,
    queued:  <span className={clsx('text-xs font-medium', isDark ? 'text-slate-500' : 'text-slate-400')}>Queued</span>,
    failed:  <span className="text-red-400 text-xs font-semibold">Failed</span>,
  }

  return (
    <div className={clsx(
      'px-5 py-4',
      !isLast && (isDark ? 'border-b border-dark-border' : 'border-b border-light-border')
    )}>
      <div className="flex items-center gap-4">
        {/* Status icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center"
          style={{ borderColor: stage.status === 'done' ? '#f05a28' : stage.status === 'running' ? '#ffa07a' : isDark ? '#2a3347' : '#dde2ef' }}>
          {statusIcon[stage.status]}
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className={clsx('text-sm font-display font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>
              {stage.label}
            </span>
            <div className="flex items-center gap-2">
              {statusLabel[stage.status]}
              {stage.status === 'done' && stage.result && (
                <button
                  onClick={onViewResult}
                  className={clsx(
                    'flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors',
                    isDark
                      ? 'border-dark-border text-slate-400 hover:border-brand-500/50 hover:text-brand-400'
                      : 'border-light-border text-slate-500 hover:border-brand-500/50 hover:text-brand-500'
                  )}
                >
                  <Eye size={10} />
                  View
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className={clsx('h-1 rounded-full overflow-hidden', isDark ? 'bg-dark-surface' : 'bg-light-card')}>
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-300',
                stage.status === 'done' ? 'bg-brand-500' :
                stage.status === 'running' ? 'bg-brand-400' : 'bg-transparent'
              )}
              style={{ width: `${stage.progress}%` }}
            />
          </div>
          <p className={clsx('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>{stage.sub}</p>
        </div>
      </div>
    </div>
  )
}
