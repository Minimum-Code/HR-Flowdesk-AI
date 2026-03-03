import axios, { AxiosInstance, AxiosError } from 'axios'

const TOKEN_KEY = 'hr_flowdesk_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  // Mirror token to cookie so middleware can verify authentication server-side
  document.cookie = `${TOKEN_KEY}=1; path=/; SameSite=Strict; Secure`
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
}

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const dataSource = process.env.NEXT_PUBLIC_XANO_DATA_SOURCE
    if (dataSource) {
      config.headers['X-Data-Source'] = dataSource
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const authApi = createClient(process.env.NEXT_PUBLIC_API_AUTH!)
export const employeeApi = createClient(process.env.NEXT_PUBLIC_API_EMPLOYEE!)
export const hrApi = createClient(process.env.NEXT_PUBLIC_API_HR!)
export const adminApi = createClient(process.env.NEXT_PUBLIC_API_ADMIN!)
export const superAdminApi = createClient(process.env.NEXT_PUBLIC_API_SUPER_ADMIN!)

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message
  }
  return 'An unexpected error occurred'
}
