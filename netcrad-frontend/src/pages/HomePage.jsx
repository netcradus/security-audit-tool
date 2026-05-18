import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Globe, Lock, BarChart2, Server, FileText, Scan } from 'lucide-react'
import { useScan } from '../context/ScanContext'
import { useTheme } from '../context/ThemeContext'
import { scanApi } from '../api'
import clsx from 'clsx'

const features = [
  { icon: Shield,    title: 'OWASP Top 10',    desc: 'A01–A10 mapped findings' },
  { icon: Lock,      title: 'SSL / TLS check', desc: 'Cert expiry & cipher audit' },
  { icon: BarChart2, title: 'CVSS v3 scoring', desc: 'Per-finding risk scores' },
  { icon: Server,    title: 'Port scanner',    desc: 'Nmap 1–1024' },
  { icon: FileText,  title: 'PDF report',      desc: 'Download full audit' },
  { icon: Globe,     title: 'Header analysis', desc: 'CSP, HSTS, X-Frame' },
]

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { startScan } = useScan()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const validate = (v) => {
    try {
      const u = new URL(v.startsWith('http') ? v : `https://${v}`)
      return u.hostname.includes('.')
    } catch { return false }
  }

  const normalizeTarget = (v) => {
    const u = new URL(v.startsWith('http') ? v : `https://${v}`)
    return u.hostname.toLowerCase()
  }

  const handleScan = async () => {
    const trimmed = url.trim()
    if (!trimmed) { setError('Please enter a URL'); return }
    if (!validate(trimmed)) { setError('Enter a valid URL like https://example.com'); return }
    setError('')
    setLoading(true)
    try {
      const target = normalizeTarget(trimmed)
      const response = await scanApi.start(target)
      const id = response.scan_id
      startScan(id, target)
      navigate(`/scan/${id}`)
    } catch (err) {
      setError(err.message || 'Unable to start scan')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleScan() }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-slide-up">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Security audit platform
        </div>
        <h1 className={clsx(
          'font-display font-bold text-4xl leading-tight mb-4',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          Scan any website for<br />
          <span className="text-brand-500">vulnerabilities</span>
        </h1>
        <p className={clsx('text-base max-w-md mx-auto', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Get open ports, missing headers, SSL issues, OWASP Top 10, CVSS scores,
          and a full letter grade — in one click.
        </p>
      </div>

      {/* Input */}
      <div className="mb-3">
        <div className={clsx(
          'flex gap-2 p-2 rounded-xl border transition-all duration-200',
          isDark ? 'bg-dark-card border-dark-border focus-within:border-brand-500/60' : 'bg-light-surface border-light-border focus-within:border-brand-500/60',
          error && 'border-red-500/50'
        )}>
          <div className={clsx('flex items-center pl-2', isDark ? 'text-slate-500' : 'text-slate-400')}>
            <Globe size={16} />
          </div>
          <input
            type="text"
            value={url}
            onChange={e => { setUrl(e.target.value); setError('') }}
            onKeyDown={handleKey}
            placeholder="https://example.com"
            className={clsx(
              'flex-1 bg-transparent py-2.5 px-2 text-sm font-mono focus:outline-none placeholder:text-slate-500',
              isDark ? 'text-slate-100' : 'text-slate-800'
            )}
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-display font-semibold transition-all duration-200 shadow-lg shadow-brand-500/25 disabled:opacity-60"
          >
            <Scan size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Starting…' : 'Run scan'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1.5 pl-2">{error}</p>}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className={clsx(
            'p-4 rounded-xl border transition-all duration-200 hover:border-brand-500/40 group cursor-default',
            isDark ? 'bg-dark-card border-dark-border' : 'bg-light-surface border-light-border'
          )}>
            <Icon size={18} className="text-brand-500 mb-2.5 group-hover:scale-110 transition-transform" />
            <div className={clsx('text-sm font-display font-semibold mb-0.5', isDark ? 'text-slate-200' : 'text-slate-800')}>
              {title}
            </div>
            <div className="text-xs text-slate-500">{desc}</div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      {/* <div className="flex justify-center mt-12">
        <div className={clsx(
          'w-8 h-8 rounded-full border flex items-center justify-center animate-bounce',
          isDark ? 'border-dark-border text-slate-500' : 'border-light-border text-slate-400'
        )}>
          <ChevronDown size={14} />
        </div>
      </div> */}
    </div>
  )
}
