import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useTheme } from '../../context/ThemeContext'
import clsx from 'clsx'

export default function Layout() {
  const { isDark } = useTheme()

  return (
    <div className={clsx(
      'min-h-screen font-body transition-colors duration-300',
      isDark
        ? 'bg-dark-bg text-slate-100'
        : 'bg-light-bg text-slate-800'
    )}>
      {/* dot-grid subtle background */}
      <div className={clsx(
        'fixed inset-0 dot-grid opacity-40 pointer-events-none',
        isDark ? 'opacity-30' : 'opacity-50'
      )} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
