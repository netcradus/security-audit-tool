import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, History, LayoutDashboard } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useScan } from '../../context/ScanContext'
import logo from '../../assets/images/logo.png'
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
      <div className="max-w-5xl mx-auto px-4 py-3 min-h-16 flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group"
        >
          <img
            src={logo}
            alt="Netcrad"
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <span className="flex flex-col items-start leading-none">
            <span className={clsx(
              'font-display font-bold text-sm sm:text-base tracking-wide',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              NET<span className="text-brand-500">CRAD</span>
            </span>
            <span className={clsx(
              'mt-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-wide',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}>
              Powered by Netcradus
            </span>
          </span>
          {/* <span className={clsx(
            'text-xs px-1.5 py-0.5 rounded font-mono',
            isDark ? 'bg-dark-card text-slate-400 border border-dark-border' : 'bg-light-card text-slate-500 border border-light-border'
          )}>v1.0</span> */}
        </button>

        {/* Right nav */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <NavLink to="/" className={({ isActive }) => clsx(
            'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors',
            isActive
              ? 'text-brand-500 bg-brand-500/10'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
          )}>
            <LayoutDashboard size={14} />
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => clsx(
            'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors',
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
        'max-w-5xl mx-auto px-4 flex gap-0 border-t overflow-x-auto',
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
                'px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap',
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
