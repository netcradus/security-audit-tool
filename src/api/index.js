import axios from 'axios'

// Base URL — swap to real backend URL when ready
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach auth token if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('netcrad-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  err => Promise.reject(err)
)

// Response interceptor — normalise errors
api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

// ── Scan endpoints ────────────────────────────────────────
export const scanApi = {
  /** POST /scan — start a new scan, returns { scan_id } */
  start: (url) => api.post('/scan', { url }),

  /** GET /scan/:id — poll scan status */
  getStatus: (id) => api.get(`/scan/${id}`),

  /** GET /scan/history — list all past scans */
  getHistory: () => api.get('/scan/history'),

  /** GET /scan/:id/results — full merged results */
  getResults: (id) => api.get(`/scan/${id}/results`),
}

// ── Per-scanner result endpoints ──────────────────────────
export const scannerApi = {
  /** GET /scan/:id/port  — Nmap port scan result */
  getPortResult: (id) => api.get(`/scan/${id}/port`),

  /** GET /scan/:id/headers — header analysis result */
  getHeaderResult: (id) => api.get(`/scan/${id}/headers`),

  /** GET /scan/:id/ssl — SSL/TLS audit result */
  getSslResult: (id) => api.get(`/scan/${id}/ssl`),

  /** GET /scan/:id/zap — OWASP ZAP result */
  getZapResult: (id) => api.get(`/scan/${id}/zap`),

  /** GET /scan/:id/scoring — risk scoring result */
  getScoringResult: (id) => api.get(`/scan/${id}/scoring`),
}

// ── Report endpoints ──────────────────────────────────────
export const reportApi = {
  /** GET /report/:id/pdf — download PDF report */
  getPdf: (id) => api.get(`/report/${id}/pdf`, { responseType: 'blob' }),

  /** GET /report/:id/json — get JSON export */
  getJson: (id) => api.get(`/report/${id}/json`),
}

// ── WebSocket helper ──────────────────────────────────────
export const createScanSocket = (scanId, onMessage, onClose) => {
  const WS_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + `/ws/${scanId}`
  const ws = new WebSocket(WS_URL)
  ws.onmessage = e => onMessage(JSON.parse(e.data))
  ws.onclose   = onClose
  ws.onerror   = e => console.error('WebSocket error', e)
  return ws
}

export default api
