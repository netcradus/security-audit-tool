import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ScanProgressPage from './pages/ScanProgressPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"            element={<HomePage />} />
        <Route path="/scan/:id"    element={<ScanProgressPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="/history"     element={<HistoryPage />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
