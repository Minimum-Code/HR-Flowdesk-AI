import axios, { AxiosInstance, AxiosError } from 'axios'

const TOKEN_KEY = 'hr_flowdesk_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
