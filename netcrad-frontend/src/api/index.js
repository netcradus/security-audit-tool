import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api/v1'


const api = axios.create({

  baseURL: BASE_URL,

  timeout: 30000,

  headers: {
    'Content-Type': 'application/json',
  },
})


// =====================================
// REQUEST INTERCEPTOR
// =====================================

api.interceptors.request.use(

  config => {

    const apiKey =

      import.meta.env.VITE_API_KEY ||

      localStorage.getItem(
        'netcrad-api-key'
      )

    if (apiKey) {

      config.headers['x-api-key'] =
        apiKey
    }

    return config
  },

  err => Promise.reject(err)
)


// =====================================
// RESPONSE INTERCEPTOR
// =====================================

api.interceptors.response.use(

  res => res,

  err => {

    const msg =

      err.response?.data?.detail ||

      err.response?.data?.message ||

      err.message ||

      'Request failed'

    return Promise.reject(
      new Error(msg)
    )
  }
)


// =====================================
// SCAN API
// =====================================

export const scanApi = {

  start: async (payload) => {

    const res = await api.post(
      '/scan',
      payload
    )

    return res.data
  },

  getStatus: async (id) => {

    const res = await api.get(
      `/scan/${id}`
    )

    return res.data
  },

  getHistory: async () => {

    const res = await api.get(
      '/history'
    )

    return res.data
  },
}


// =====================================
// REPORT API
// =====================================

export const reportApi = {

  getPdf: async (id, meta) => {

    const res = await api.get(

      `/scan/${id}/report`,

      {

        responseType: 'blob',

        params: {

          company_name:
            meta.companyName,

          audit_by:
            meta.auditBy,
        },
      }
    )

    return res.data
  },
}

export default api