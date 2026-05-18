import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: backend uses an API key header, not bearer auth.
api.interceptors.request.use(
  config => {
    const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('netcrad-api-key')
    if (apiKey) config.headers['x-api-key'] = apiKey
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
  /** POST /scan - start a new scan, returns { scan_id, status } */
  start: (target) => api.post('/scan', { target }),

  /** GET /scan/:id — poll scan status */
  getStatus: (id) => api.get(`/scan/${id}`),

  /** GET /history - list all past scans */
  getHistory: () => api.get('/history'),
}

export default api
