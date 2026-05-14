import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Shield, History, LayoutDashboard } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useScan } from '../../context/ScanContext'
import clsx from 'clsx'

const tabs = [
  { label: 'New scan',         path: '/' },
  { label: 'Scan in progress', path: '/scan/active' },
  { label: 'Results',          path: '/results/scan_001' },
  { label: 'History',          path: '/history' },
]

export default function Navbar() {
  const { isDark, toggle } = useTheme()
  const { activeScan, scanResults } = useScan()
  const location = useLocation()
  const navigate = useNavigate()

  const getTabPath = (tab) => {
    if (tab.label === 'Scan in progress' && activeScan) return `/scan/${activeScan.id}`
    if (tab.label === 'Results') {
      const ids = Object.keys(scanResults)
      if (ids.length) return `/results/${ids[ids.length - 1]}`
    }
    return tab.path
  }

  const isTabActive = (tab) => {
    if (tab.label === 'New scan') return location.pathname === '/'
    if (tab.label === 'Scan in progress') return location.pathname.startsWith('/scan/')
    if (tab.label === 'Results') return location.pathname.startsWith('/results/')
    if (tab.label === 'History') return location.pathname === '/history'
    return false
  }

  return (
    <header className={clsx(
      'sticky top-0 z-50 border-b backdrop-blur-md',
      isDark ? 'bg-dark-bg/80 border-dark-border' : 'bg-light-bg/80 border-light-border'
    )}>
      {/* Top bar */}
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center shadow-md shadow-brand-500/30">
            <Shield size={14} className="text-white" />
          </div>
          <span className={clsx(
            'font-display font-bold text-base tracking-wide',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            NET<span className="text-brand-500">CRAD</span>
          </span>
          <span className={clsx(
            'text-xs px-1.5 py-0.5 rounded font-mono',
            isDark ? 'bg-dark-card text-slate-400 border border-dark-border' : 'bg-light-card text-slate-500 border border-light-border'
          )}>v1.0</span>
        </button>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          <NavLink to="/" className={({ isActive }) => clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'text-brand-500 bg-brand-500/10'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
          )}>
            <LayoutDashboard size={14} />
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'text-brand-500 bg-brand-500/10'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
          )}>
            <History size={14} />
            History
          </NavLink>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className={clsx(
              'ml-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              isDark ? 'bg-dark-card border border-dark-border hover:border-brand-500/50 text-slate-400' : 'bg-light-card border border-light-border hover:border-brand-500/50 text-slate-500'
            )}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className={clsx(
        'max-w-5xl mx-auto px-4 flex gap-0 border-t',
        isDark ? 'border-dark-border/50' : 'border-light-border'
      )}>
        {tabs.map(tab => {
          const active = isTabActive(tab)
          const path = getTabPath(tab)
          return (
            <button
              key={tab.label}
              onClick={() => navigate(path)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap',
                active
                  ? 'border-brand-500 text-brand-500'
                  : clsx(
                      'border-transparent',
                      isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                    )
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
