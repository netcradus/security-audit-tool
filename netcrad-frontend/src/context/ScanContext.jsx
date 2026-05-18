import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ScanContext = createContext()

export function ScanProvider({ children }) {
  const [activeScan, setActiveScan] = useState(null)   // { id, url, stages, results }
  const [scanResults, setScanResults] = useState({})   // id -> results object

  const startScan = useCallback((id, url) => {
    const scan = {
      id,
      url,
      startedAt: new Date().toISOString(),
      stages: [
        { key: 'port',    label: 'Port scan',       sub: 'Nmap scanning ports 1–1024',           status: 'queued',  progress: 0, result: null },
        { key: 'header',  label: 'Header analysis', sub: 'Checking CSP, HSTS, X-Frame-Options',  status: 'queued',  progress: 0, result: null },
        { key: 'ssl',     label: 'SSL / TLS audit', sub: 'Verifying certificate and cipher suites', status: 'queued', progress: 0, result: null },
        { key: 'zap',     label: 'OWASP ZAP scan',  sub: 'Active vulnerability scan',            status: 'queued',  progress: 0, result: null },
        { key: 'scoring', label: 'Risk scoring',    sub: 'CVSS v3 + A–F grade calculation',      status: 'queued',  progress: 0, result: null },
      ],
    }
    setActiveScan(scan)
    return scan
  }, [])

  const updateStage = useCallback((stageKey, updates) => {
    setActiveScan(prev => {
      if (!prev) return prev
      return {
        ...prev,
        stages: prev.stages.map(s => s.key === stageKey ? { ...s, ...updates } : s),
      }
    })
  }, [])

  const completeStage = useCallback((stageKey, result) => {
    updateStage(stageKey, { status: 'done', progress: 100, result })
  }, [updateStage])

  const saveResults = useCallback((id, data) => {
    setScanResults(prev => ({ ...prev, [id]: data }))
  }, [])

  const value = useMemo(() => ({
    activeScan,
    setActiveScan,
    startScan,
    updateStage,
    completeStage,
    scanResults,
    saveResults,
  }), [activeScan, completeStage, saveResults, scanResults, startScan, updateStage])

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  )
}

export const useScan = () => useContext(ScanContext)
