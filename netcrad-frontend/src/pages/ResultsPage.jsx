import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, ChevronRight, Filter, Server, Globe, Lock, Shield, Loader } from 'lucide-react'
import { useScan } from '../context/ScanContext'
import { useTheme } from '../context/ThemeContext'
import { reportApi, scanApi } from '../api'
import { mapBackendScanToResult } from '../utils/scanTransform'
import GradeBadge from '../components/shared/GradeBadge'
import SeverityBadge from '../components/shared/SeverityBadge'
import FindingDrawer from '../components/results/FindingDrawer'
import ReportDownloadModal from '../components/results/ReportDownloadModal'
import StageResultModal from '../components/scanner/StageResultModal'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low']

const scannerTabs = [
  { key: 'merged', label: 'All findings', icon: Filter },
  { key: 'port',   label: 'Port scan',    icon: Server },
  { key: 'header', label: 'Headers',      icon: Globe },
  { key: 'ssl',    label: 'SSL/TLS',      icon: Lock },
  { key: 'zap',    label: 'ZAP',          icon: Shield },
]

export default function ResultsPage() {
  const { id } = useParams()
  const { scanResults, saveResults } = useScan()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [result, setResult] = useState(scanResults[id] || null)
  const [loading, setLoading] = useState(!scanResults[id])
  const [loadError, setLoadError] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [activeScanner, setActiveScanner] = useState('merged')
  const [activeFinding, setActiveFinding] = useState(null)
  const [stageModal, setStageModal] = useState(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportMeta, setReportMeta] = useState({
    companyName: '',
    auditBy: '',
  })
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadResult = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const scan = await scanApi.getStatus(id)
        if (cancelled) return
        const mapped = mapBackendScanToResult(scan, id)
        setResult(mapped)
        if (mapped.status === 'completed') saveResults(id, mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Unable to load scan results')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (scanResults[id]) {
      setResult(scanResults[id])
      setLoading(false)
      return
    }

    loadResult()

    return () => {
      cancelled = true
    }
  }, [id, scanResults, saveResults])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Loader size={22} className="mx-auto mb-3 text-brand-500 animate-spin" />
        <p className={clsx('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Loading scan results...</p>
      </div>
    )
  }

  if (loadError || !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-400 mb-3">{loadError || 'Scan result not found'}</p>
        <button onClick={() => navigate('/history')} className="text-brand-500 hover:underline">Back to history</button>
      </div>
    )
  }

  if (result.status !== 'completed') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className={clsx('text-sm mb-3', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Scan is currently {result.status || 'running'}.
        </p>
        <button onClick={() => navigate(`/scan/${id}`)} className="text-brand-500 hover:underline">View scan progress</button>
      </div>
    )
  }

  const pieData = [
    { name: 'Critical', value: result.critical, color: '#ff3b5c' },
    { name: 'High',     value: result.high,     color: '#ff7a2b' },
    { name: 'Medium',   value: result.medium,   color: '#f5b800' },
    { name: 'Low',      value: result.low,       color: '#22c55e' },
  ].filter(d => d.value > 0)

  const filteredFindings = (result.findings || []).filter(f => {
    if (severityFilter === 'All') return true
    return f.severity.toLowerCase() === severityFilter.toLowerCase()
  }).filter(f => {
    if (activeScanner === 'merged') return true
    const map = { port: 'Nmap', header: 'Headers', ssl: 'SSL', zap: 'ZAP' }
    return f.scanner === map[activeScanner]
  })

  const openStageModal = (key) => {
    const stageMap = {
      port:   { key: 'port',   label: 'Port scan',       result: result.portResult },
      header: { key: 'header', label: 'Header analysis', result: result.headerResult },
      ssl:    { key: 'ssl',    label: 'SSL / TLS audit', result: result.sslResult },
      zap:    { key: 'zap',    label: 'OWASP ZAP scan',  result: result.zapResult },
    }
    if (stageMap[key]) setStageModal(stageMap[key])
  }

  const handleReportMetaChange = (field, value) => {
    setReportMeta(prev => ({ ...prev, [field]: value }))
    setReportError('')
  }

  const handleDownload = async () => {
    if (!reportMeta.companyName.trim() || !reportMeta.auditBy.trim()) {
      setReportError('Company name and audit by are required')
      return
    }

    setDownloadingReport(true)
    setReportError('')

    try {
      const blob = await reportApi.getPdf(id, reportMeta)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeTarget = String(result.url || 'scan').replace(/[^a-z0-9.-]+/gi, '-').toLowerCase()
      a.href = url
      a.download = `netcrad-${safeTarget}-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setReportModalOpen(false)
    } catch (err) {
      setReportError(err.message || 'Unable to download report')
    } finally {
      setDownloadingReport(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-slide-up">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className={clsx('font-display font-bold text-xl', isDark ? 'text-white' : 'text-slate-900')}>
            {result.url}
          </h2>
          <p className={clsx('text-xs mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Scanned {result.scannedAt} · {result.findings?.length} findings
          </p>
        </div>
        <button
          onClick={() => {
            setReportError('')
            setReportModalOpen(true)
          }}
          disabled={downloadingReport}
          className="btn-secondary flex items-center justify-center gap-2 text-sm w-full sm:w-auto disabled:opacity-60"
        >
          <Download size={14} />
          {downloadingReport ? 'Downloading...' : 'Download Report'}
        </button>
      </div>
      {reportError && <p className="text-sm text-red-400 mb-4">{reportError}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — grade card */}
        <div className="lg:col-span-1">
          <div className={clsx('rounded-2xl border p-5', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border')}>
            <div className={clsx('text-xs text-center mb-4', isDark ? 'text-slate-500' : 'text-slate-400')}>Site grade</div>
            <div className="flex justify-center mb-3">
              <GradeBadge grade={result.grade} size="xl" />
            </div>
            <div className={clsx('text-center font-display font-bold text-lg mb-0.5', isDark ? 'text-white' : 'text-slate-900')}>
              CVSS avg {result.cvssAvg}
            </div>
            <div className={clsx('text-center text-xs mb-5', isDark ? 'text-slate-500' : 'text-slate-400')}>
              {result.riskLabel}
            </div>

            {/* Severity grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Critical', val: result.critical, cls: 'text-red-400',    bg: isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200' },
                { label: 'High',     val: result.high,     cls: 'text-orange-400', bg: isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200' },
                { label: 'Medium',   val: result.medium,   cls: 'text-yellow-400', bg: isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200' },
                { label: 'Low',      val: result.low,       cls: 'text-green-400',  bg: isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200' },
              ].map(s => (
                <div key={s.label} className={clsx('p-2 rounded-lg border text-center', s.bg)}>
                  <div className={clsx('text-xl font-bold font-display', s.cls)}>{s.val}</div>
                  <div className={clsx('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Mini pie */}
            <div className="mt-4 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={48} paddingAngle={2} dataKey="value">
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: isDark ? '#1c2333' : '#fff', border: '1px solid #2a3347', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, n) => [v, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right — findings */}
        <div className="lg:col-span-2 min-w-0">
          <div className={clsx('rounded-2xl border overflow-hidden', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border')}>
            {/* Scanner tab bar */}
            <div className={clsx('flex border-b overflow-x-auto', isDark ? 'border-dark-border' : 'border-light-border')}>
              {scannerTabs.map(t => {
                const Icon = t.icon
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setActiveScanner(t.key)
                      if (t.key !== 'merged') openStageModal(t.key)
                    }}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all',
                      activeScanner === t.key
                        ? 'border-brand-500 text-brand-500'
                        : clsx('border-transparent', isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                    )}
                  >
                    <Icon size={12} />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Severity filter pills */}
            <div className="flex items-center gap-2 px-4 py-3">
              <span className={clsx('text-xs mr-1', isDark ? 'text-slate-500' : 'text-slate-400')}>Findings</span>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setSeverityFilter(f)}
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all',
                    severityFilter === f
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : isDark ? 'border-dark-border text-slate-400 hover:border-brand-500/50' : 'border-light-border text-slate-500 hover:border-brand-500/50'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Findings list */}
            <div className="divide-y divide-dark-border/50">
              {filteredFindings.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">No findings for this filter</div>
              ) : (
                filteredFindings.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFinding(f)}
                    className={clsx(
                      'w-full flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-4 py-3 transition-colors text-left group',
                      isDark ? 'hover:bg-dark-surface/60' : 'hover:bg-light-card/60'
                    )}
                  >
                    <SeverityBadge severity={f.severity} />
                    <span className={clsx('flex-1 min-w-[9rem] text-sm font-medium truncate', isDark ? 'text-slate-200' : 'text-slate-800')}>
                      {f.title}
                    </span>
                    <span className={clsx('text-xs font-mono max-w-[11rem] truncate', isDark ? 'text-slate-500' : 'text-slate-400')}>{f.owasp}</span>
                    <span className={clsx(
                      'text-xs font-mono tabular-nums w-8 text-right',
                      f.cvss >= 9 ? 'text-red-400' : f.cvss >= 7 ? 'text-orange-400' : f.cvss >= 4 ? 'text-yellow-400' : 'text-green-400'
                    )}>
                      {f.cvss}
                    </span>
                    <ChevronRight size={14} className={clsx('flex-shrink-0 group-hover:translate-x-0.5 transition-transform', isDark ? 'text-slate-600' : 'text-slate-400')} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Finding drawer */}
      {activeFinding && (
        <FindingDrawer finding={activeFinding} onClose={() => setActiveFinding(null)} />
      )}

      {/* Stage result modal */}
      {stageModal && (
        <StageResultModal stage={stageModal} onClose={() => { setStageModal(null); setActiveScanner('merged') }} />
      )}

      {reportModalOpen && (
        <ReportDownloadModal
          reportMeta={reportMeta}
          reportError={reportError}
          downloading={downloadingReport}
          onChange={handleReportMetaChange}
          onClose={() => setReportModalOpen(false)}
          onDownload={handleDownload}
        />
      )}

    </div>
  )
}
