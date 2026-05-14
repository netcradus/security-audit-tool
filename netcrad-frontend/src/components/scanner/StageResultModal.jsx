import { X, Terminal, CheckCircle, AlertTriangle, Globe } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import SeverityBadge from '../shared/SeverityBadge'
import clsx from 'clsx'

export default function StageResultModal({ stage, onClose }) {
  const { isDark } = useTheme()
  if (!stage?.result) return null

  const base = clsx(
    'fixed inset-0 z-50 flex items-center justify-center p-4',
    'bg-black/70 backdrop-blur-sm animate-fade-in'
  )

  const card = clsx(
    'relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border flex flex-col',
    isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'
  )

  return (
    <div className={base} onClick={onClose}>
      <div className={card} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={clsx(
          'flex items-center justify-between px-5 py-4 border-b',
          isDark ? 'border-dark-border' : 'border-light-border'
        )}>
          <div>
            <h3 className={clsx('font-display font-semibold text-base', isDark ? 'text-white' : 'text-slate-900')}>
              {stage.label} — Results
            </h3>
            <p className={clsx('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {stage.result.summary}
            </p>
          </div>
          <button onClick={onClose} className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            isDark ? 'hover:bg-dark-card text-slate-400' : 'hover:bg-light-card text-slate-500'
          )}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {stage.key === 'port' && <PortResultBody result={stage.result} isDark={isDark} />}
          {stage.key === 'header' && <HeaderResultBody result={stage.result} isDark={isDark} />}
          {stage.key === 'ssl' && <SslResultBody result={stage.result} isDark={isDark} />}
          {stage.key === 'zap' && <ZapResultBody result={stage.result} isDark={isDark} />}
          {stage.key === 'scoring' && <ScoringResultBody result={stage.result} isDark={isDark} />}
        </div>
      </div>
    </div>
  )
}

// ── Port result ────────────────────────────────────────────
function PortResultBody({ result, isDark }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-dark-border/50">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className={clsx('border-b', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border')}>
              {['Port', 'Protocol', 'Service', 'Version', 'Risk'].map(h => (
                <th key={h} className={clsx('px-3 py-2 text-left font-semibold', isDark ? 'text-slate-400' : 'text-slate-500')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.ports.map(p => (
              <tr key={p.port} className={clsx('border-b last:border-0', isDark ? 'border-dark-border/40' : 'border-light-border')}>
                <td className={clsx('px-3 py-2 font-bold', isDark ? 'text-brand-400' : 'text-brand-600')}>{p.port}</td>
                <td className={clsx('px-3 py-2', isDark ? 'text-slate-300' : 'text-slate-600')}>{p.protocol}</td>
                <td className={clsx('px-3 py-2', isDark ? 'text-slate-300' : 'text-slate-600')}>{p.service}</td>
                <td className={clsx('px-3 py-2 text-slate-500')}>{p.version}</td>
                <td className="px-3 py-2"><SeverityBadge severity={p.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Raw Nmap output */}
      <div>
        <div className={clsx('text-xs font-semibold mb-1.5 flex items-center gap-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
          <Terminal size={12} /> Raw Nmap output
        </div>
        <pre className={clsx(
          'text-xs p-3 rounded-lg border overflow-x-auto whitespace-pre font-mono leading-relaxed',
          isDark ? 'bg-dark-bg border-dark-border text-green-400' : 'bg-slate-900 border-slate-700 text-green-400'
        )}>
          {result.raw}
        </pre>
      </div>
    </div>
  )
}

// ── Header result ──────────────────────────────────────────
function HeaderResultBody({ result, isDark }) {
  return (
    <div className="space-y-2">
      {result.headers.map(h => (
        <div key={h.name} className={clsx(
          'flex items-start justify-between gap-3 p-3 rounded-lg border',
          isDark ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border'
        )}>
          <div className="flex items-start gap-2.5 min-w-0">
            {h.present
              ? <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
              : <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            }
            <div className="min-w-0">
              <div className={clsx('text-sm font-mono font-medium truncate', isDark ? 'text-slate-200' : 'text-slate-800')}>
                {h.name}
              </div>
              {h.value && <div className="text-xs text-slate-500 mt-0.5 truncate">{h.value}</div>}
              {h.recommendation && <div className="text-xs text-slate-500 mt-0.5">{h.recommendation}</div>}
            </div>
          </div>
          <SeverityBadge severity={h.severity === 'ok' ? 'info' : h.severity} />
        </div>
      ))}
    </div>
  )
}

// ── SSL result ─────────────────────────────────────────────
function SslResultBody({ result, isDark }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Cert expiry',  value: result.certExpiry },
          { label: 'Days left',    value: result.daysLeft },
          { label: 'Issuer',       value: result.issuer },
        ].map(s => (
          <div key={s.label} className={clsx('p-3 rounded-lg border', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border')}>
            <div className={clsx('text-xs mb-1', isDark ? 'text-slate-500' : 'text-slate-400')}>{s.label}</div>
            <div className={clsx('text-sm font-semibold', isDark ? 'text-slate-100' : 'text-slate-800')}>{s.value}</div>
          </div>
        ))}
      </div>
      <div>
        <div className={clsx('text-xs font-semibold mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>TLS Versions</div>
        <div className="space-y-1.5">
          {result.tlsVersions.map(v => (
            <div key={v.version} className={clsx(
              'flex items-center justify-between px-3 py-2 rounded-lg border text-sm',
              isDark ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border'
            )}>
              <span className={clsx('font-mono', isDark ? 'text-slate-300' : 'text-slate-700')}>{v.version}</span>
              <div className="flex items-center gap-2">
                {v.supported && !v.safe && <span className="text-xs text-red-400">⚠ Deprecated</span>}
                <SeverityBadge severity={!v.supported ? 'info' : v.safe ? 'low' : 'high'} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {result.weakCiphers.length > 0 && (
        <div>
          <div className={clsx('text-xs font-semibold mb-2 text-red-400')}>Weak cipher suites detected</div>
          {result.weakCiphers.map(c => (
            <div key={c} className={clsx('text-xs font-mono px-3 py-1.5 rounded border mb-1', isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-600')}>{c}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ZAP result ─────────────────────────────────────────────
function ZapResultBody({ result, isDark }) {
  return (
    <div className="space-y-2">
      {result.alerts.map((a, i) => (
        <div key={i} className={clsx('p-3 rounded-lg border', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border')}>
          <div className="flex items-center gap-2 mb-1.5">
            <SeverityBadge severity={a.risk} />
            <span className={clsx('text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>{a.name}</span>
          </div>
          <div className={clsx('text-xs font-mono mb-1.5', isDark ? 'text-brand-400' : 'text-brand-600')}>{a.url}</div>
          <div className={clsx('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>{a.description}</div>
        </div>
      ))}
    </div>
  )
}

// ── Scoring result ─────────────────────────────────────────
function ScoringResultBody({ result, isDark }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className={clsx(
        'w-20 h-20 rounded-full border-4 flex items-center justify-center font-display font-bold text-4xl',
        result.grade === 'A' ? 'border-green-500 text-green-400' :
        result.grade === 'B' ? 'border-teal-500 text-teal-400' :
        result.grade === 'C' ? 'border-yellow-500 text-yellow-400' :
        result.grade === 'D' ? 'border-orange-500 text-orange-400' :
        'border-red-500 text-red-400'
      )}>
        {result.grade}
      </div>
      <div className="text-center">
        <div className={clsx('text-xl font-bold font-display', isDark ? 'text-white' : 'text-slate-900')}>
          CVSS avg {result.cvssAvg}
        </div>
        <div className={clsx('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>Risk scoring complete</div>
      </div>
    </div>
  )
}
