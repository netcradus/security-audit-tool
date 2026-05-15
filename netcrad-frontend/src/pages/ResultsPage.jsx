import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, ChevronRight, Filter, Server, Globe, Lock, Shield, BarChart2, X } from 'lucide-react'
import { useScan } from '../context/ScanContext'
import { useTheme } from '../context/ThemeContext'
import { getResultById, mockScanResult } from '../data/mockData'
import GradeBadge from '../components/shared/GradeBadge'
import SeverityBadge from '../components/shared/SeverityBadge'
import FindingDrawer from '../components/results/FindingDrawer'
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
  const { scanResults } = useScan()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [severityFilter, setSeverityFilter] = useState('All')
  const [activeScanner, setActiveScanner] = useState('merged')
  const [activeFinding, setActiveFinding] = useState(null)
  const [stageModal, setStageModal] = useState(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportMeta, setReportMeta] = useState({
    companyName: '',
    auditBy: '',
  })
  const [reportError, setReportError] = useState('')

  // Resolve result: from context (live) or mock fallback
  const result = scanResults[id] || getResultById(id) || mockScanResult

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

  const handleDownload = () => {
    if (!reportMeta.companyName.trim() || !reportMeta.auditBy.trim()) {
      setReportError('Company name and audit by are required')
      return
    }

    const reportHtml = buildReportHtml(result, reportMeta)
    const blob = new Blob([reportHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const safeTarget = String(result.url || 'scan').replace(/[^a-z0-9.-]+/gi, '-').toLowerCase()
    a.href = url
    a.download = `netcrad-${safeTarget}-security-report.html`
    a.click()
    URL.revokeObjectURL(url)
    setReportModalOpen(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-slide-up">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className={clsx('font-display font-bold text-xl', isDark ? 'text-white' : 'text-slate-900')}>
            {result.url}
          </h2>
          <p className={clsx('text-xs mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Scanned {result.scannedAt} · {result.findings?.length} findings
          </p>
        </div>
        <button onClick={() => setReportModalOpen(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={14} />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left — grade card */}
        <div className="col-span-1">
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
        <div className="col-span-2">
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
                      'w-full flex items-center gap-3 px-4 py-3 transition-colors text-left group',
                      isDark ? 'hover:bg-dark-surface/60' : 'hover:bg-light-card/60'
                    )}
                  >
                    <SeverityBadge severity={f.severity} />
                    <span className={clsx('flex-1 text-sm font-medium truncate', isDark ? 'text-slate-200' : 'text-slate-800')}>
                      {f.title}
                    </span>
                    <span className={clsx('text-xs font-mono', isDark ? 'text-slate-500' : 'text-slate-400')}>{f.owasp}</span>
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
          isDark={isDark}
          reportMeta={reportMeta}
          reportError={reportError}
          onChange={handleReportMetaChange}
          onClose={() => setReportModalOpen(false)}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}

function ReportDownloadModal({ isDark, reportMeta, reportError, onChange, onClose, onDownload }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className={clsx(
        'w-full max-w-md rounded-2xl border shadow-2xl',
        isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border'
      )}>
        <div className={clsx('flex items-center justify-between px-5 py-4 border-b', isDark ? 'border-dark-border' : 'border-light-border')}>
          <div>
            <h3 className={clsx('font-display font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>Report details</h3>
            <p className={clsx('text-xs mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>These details will appear on the downloaded audit report.</p>
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
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={onDownload} className="btn-primary">
              <Download size={14} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const rows = (items, cells) => (items || []).map(item => (
  `<tr>${cells.map(cell => `<td>${escapeHtml(typeof cell === 'function' ? cell(item) : item[cell])}</td>`).join('')}</tr>`
)).join('')

function buildReportHtml(result, meta) {
  const generatedAt = new Date().toLocaleString()
  const findings = result.findings || []
  const totalFindings = findings.length
  const summary = `${totalFindings} findings were identified for ${result.url}. The current site grade is ${result.grade}, with an average CVSS score of ${result.cvssAvg}. The strongest remediation priority is to address critical and high severity findings first, then resolve medium and low issues as part of normal hardening.`

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Netcrad Security Report - ${escapeHtml(result.url)}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #172033; background: #f5f7fb; line-height: 1.5; }
    main { max-width: 960px; margin: 0 auto; padding: 36px 28px; background: #fff; }
    h1, h2, h3 { margin: 0; color: #111827; }
    h1 { font-size: 30px; }
    h2 { margin-top: 34px; padding-bottom: 8px; border-bottom: 2px solid #f05a28; font-size: 20px; }
    h3 { margin-top: 22px; font-size: 16px; }
    p { margin: 8px 0 0; }
    .cover { padding: 28px; background: #111827; color: #fff; border-radius: 12px; }
    .cover h1, .cover p { color: #fff; }
    .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }
    .box { border: 1px solid #d9dee8; border-radius: 8px; padding: 12px; background: #fafbfe; }
    .label { display: block; font-size: 11px; color: #687386; text-transform: uppercase; letter-spacing: .04em; }
    .value { display: block; margin-top: 3px; font-weight: 700; color: #172033; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background: #172033; color: #fff; text-align: left; }
    th, td { border: 1px solid #d9dee8; padding: 9px; vertical-align: top; }
    tr:nth-child(even) td { background: #fafbfe; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; }
    .score { border-radius: 8px; padding: 14px; color: #fff; }
    .critical { background: #dc2626; }
    .high { background: #ea580c; }
    .medium { background: #ca8a04; }
    .low { background: #16a34a; }
    .note { padding: 12px; border-left: 4px solid #f05a28; background: #fff7ed; margin-top: 12px; }
    .footer { margin-top: 34px; font-size: 12px; color: #687386; }
    @media print { body { background: #fff; } main { padding: 0; } .cover { border-radius: 0; } }
  </style>
</head>
<body>
<main>
  <section class="cover">
    <h1>Web Security Assessment Report</h1>
    <p>Prepared for ${escapeHtml(meta.companyName)} by ${escapeHtml(meta.auditBy)}</p>
  </section>

  <section class="meta">
    <div class="box"><span class="label">Target</span><span class="value">${escapeHtml(result.url)}</span></div>
    <div class="box"><span class="label">Generated</span><span class="value">${escapeHtml(generatedAt)}</span></div>
    <div class="box"><span class="label">Grade</span><span class="value">${escapeHtml(result.grade)}</span></div>
    <div class="box"><span class="label">CVSS Average</span><span class="value">${escapeHtml(result.cvssAvg)}</span></div>
  </section>

  <h2>Short Summary</h2>
  <p>${escapeHtml(summary)}</p>
  <div class="note">This report should be used for authorized security review only. Confirm every finding before production remediation.</div>

  <h2>Severity Overview</h2>
  <div class="summary-grid">
    <div class="score critical"><strong>${escapeHtml(result.critical)}</strong><br />Critical</div>
    <div class="score high"><strong>${escapeHtml(result.high)}</strong><br />High</div>
    <div class="score medium"><strong>${escapeHtml(result.medium)}</strong><br />Medium</div>
    <div class="score low"><strong>${escapeHtml(result.low)}</strong><br />Low</div>
  </div>

  <h2>Scanner Results</h2>
  <h3>Port Scan</h3>
  <p>${escapeHtml(result.portResult?.summary || 'No port scan summary available.')}</p>
  <table><thead><tr><th>Port</th><th>Protocol</th><th>Service</th><th>State</th><th>Version</th><th>Risk</th></tr></thead><tbody>
    ${rows(result.portResult?.ports, ['port', 'protocol', 'service', 'state', 'version', 'risk']) || '<tr><td colspan="6">No port records available.</td></tr>'}
  </tbody></table>

  <h3>Header Analysis</h3>
  <p>${escapeHtml(result.headerResult?.summary || 'No header summary available.')}</p>
  <table><thead><tr><th>Header</th><th>Present</th><th>Severity</th><th>Value</th><th>Recommendation</th></tr></thead><tbody>
    ${rows(result.headerResult?.headers, ['name', item => item.present ? 'Yes' : 'No', 'severity', 'value', 'recommendation']) || '<tr><td colspan="5">No header records available.</td></tr>'}
  </tbody></table>

  <h3>SSL / TLS</h3>
  <p>${escapeHtml(result.sslResult?.summary || 'No SSL summary available.')}</p>
  <table><tbody>
    <tr><th>Certificate Expiry</th><td>${escapeHtml(result.sslResult?.certExpiry)}</td></tr>
    <tr><th>Days Left</th><td>${escapeHtml(result.sslResult?.daysLeft)}</td></tr>
    <tr><th>Issuer</th><td>${escapeHtml(result.sslResult?.issuer)}</td></tr>
    <tr><th>Weak Ciphers</th><td>${escapeHtml((result.sslResult?.weakCiphers || []).join(', ') || 'None reported')}</td></tr>
  </tbody></table>

  <h3>OWASP ZAP</h3>
  <p>${escapeHtml(result.zapResult?.summary || 'No ZAP summary available.')}</p>
  <table><thead><tr><th>Alert</th><th>URL</th><th>Risk</th><th>Confidence</th><th>Description</th></tr></thead><tbody>
    ${rows(result.zapResult?.alerts, ['name', 'url', 'risk', 'confidence', 'description']) || '<tr><td colspan="5">No ZAP alerts available.</td></tr>'}
  </tbody></table>

  <h2>Detailed Findings</h2>
  <table><thead><tr><th>#</th><th>Severity</th><th>Finding</th><th>OWASP</th><th>CVSS</th><th>Scanner</th><th>Explanation</th><th>Recommended Fix</th></tr></thead><tbody>
    ${findings.map((finding, index) => `<tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(finding.severity)}</td>
      <td>${escapeHtml(finding.title)}</td>
      <td>${escapeHtml(finding.owasp)}</td>
      <td>${escapeHtml(finding.cvss)}</td>
      <td>${escapeHtml(finding.scanner)}</td>
      <td>${escapeHtml(finding.description)}</td>
      <td>${escapeHtml(finding.fix || finding.solution || 'Review configuration and apply vendor security guidance.')}</td>
    </tr>`).join('') || '<tr><td colspan="8">No findings available.</td></tr>'}
  </tbody></table>

  <h2>Recommended Remediation Order</h2>
  <ol>
    <li>Fix critical findings immediately, especially injection, exposed database services, and missing browser protections.</li>
    <li>Resolve high severity network, TLS, and application issues before public release.</li>
    <li>Harden headers, cookies, and HTTP methods to reduce attack surface.</li>
    <li>Re-scan the target after remediation and compare the new report with this baseline.</li>
  </ol>

  <p class="footer">Generated by Netcrad security audit frontend. Company: ${escapeHtml(meta.companyName)}. Audit by: ${escapeHtml(meta.auditBy)}.</p>
</main>
</body>
</html>`
}
