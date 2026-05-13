import { useEffect, useRef } from 'react'
import { useScan } from '../context/ScanContext'
import { mockScanResult } from '../data/mockData'

const STAGE_DURATIONS = {
  port:    { min: 2200, max: 3500 },
  header:  { min: 1200, max: 2000 },
  ssl:     { min: 1800, max: 2800 },
  zap:     { min: 3000, max: 5000 },
  scoring: { min: 800,  max: 1400 },
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export function useScanSimulator(scanId, onComplete) {
  const { activeScan, updateStage, completeStage, saveResults } = useScan()
  const running = useRef(false)

  useEffect(() => {
    if (!activeScan || running.current) return
    running.current = true

    const stages = activeScan.stages.map(s => s.key)
    let idx = 0

    const runStage = () => {
      if (idx >= stages.length) {
        // All done → save merged results
        saveResults(scanId, { ...mockScanResult, id: scanId, url: activeScan.url })
        onComplete?.(scanId)
        running.current = false
        return
      }
      const key = stages[idx]
      updateStage(key, { status: 'running', progress: 0 })

      // Simulate incremental progress
      const dur = rand(STAGE_DURATIONS[key].min, STAGE_DURATIONS[key].max)
      const steps = 20
      const interval = dur / steps
      let step = 0

      const tick = setInterval(() => {
        step++
        const pct = Math.min(Math.round((step / steps) * 100), 95)
        updateStage(key, { progress: pct })

        if (step >= steps) {
          clearInterval(tick)
          // Attach per-stage result
          const result = key === 'port'    ? mockScanResult.portResult
                       : key === 'header'  ? mockScanResult.headerResult
                       : key === 'ssl'     ? mockScanResult.sslResult
                       : key === 'zap'     ? mockScanResult.zapResult
                       : { grade: mockScanResult.grade, cvssAvg: mockScanResult.cvssAvg }
          completeStage(key, result)
          idx++
          setTimeout(runStage, 300)
        }
      }, interval)
    }

    runStage()
  }, [activeScan?.id])
}
