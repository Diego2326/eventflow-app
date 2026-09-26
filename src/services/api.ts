import { sessionStorage } from './sessionStorage'
import { DEMO_EMAIL, DEMO_PASSWORD, demoEvents, demoModules } from './demo'

export const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'https://eventflow-backend-990072178406.us-east4.run.app/api').replace(/\/$/, '')
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true'

type TokenPair = { accessToken: string; refreshToken: string; accessExpiresAt?: string }
type ApiErrorPayload = { error?: { message?: string }; detail?: string; title?: string; errors?: Record<string, string[]> }

export class SessionExpiredError extends Error {}

let accessToken: string | null = null
let refreshInFlight: Promise<boolean> | null = null

async function saveTokens(tokens: TokenPair) {
  if (!tokens.accessToken || !tokens.refreshToken) throw new Error('La API devolvió una sesión incompleta.')
  accessToken = tokens.accessToken
  await Promise.all([
    sessionStorage.set('accessToken', tokens.accessToken),
    sessionStorage.set('refreshToken', tokens.refreshToken),
  ])
}

async function clearTokens() {
  accessToken = null
  await Promise.all([sessionStorage.remove('accessToken'), sessionStorage.remove('refreshToken')])
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as ApiErrorPayload | null
  const validation = payload?.errors ? Object.values(payload.errors).flat()[0] : undefined
  return payload?.error?.message ?? payload?.detail ?? validation ?? payload?.title ?? fallback
}

async function fetchApi(input: string, init?: RequestInit) {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error('No se pudo conectar con EventFlow. Revisa tu conexión e inténtalo de nuevo.')
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T
  const value = await response.text()
  return (value ? JSON.parse(value) : undefined) as T
}

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const refreshToken = await sessionStorage.get('refreshToken')
    if (!refreshToken) return false
    const response = await fetchApi(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return false
    await saveTokens(await readResponse<TokenPair>(response))
    return true
  })().finally(() => { refreshInFlight = null })
  return refreshInFlight
}

export async function restore() {
  accessToken = await sessionStorage.get('accessToken')
  if (!accessToken) return false
  if (DEMO_MODE) return true
  const response = await fetchApi(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (response.ok) return true
  if (response.status === 401 && await refreshSession()) return true
  await clearTokens()
  return false
}

export async function login(identifier: string, password: string) {
  if (DEMO_MODE) {
    if (identifier !== DEMO_EMAIL || password !== DEMO_PASSWORD) throw new Error(`Modo demo: usa ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
    await saveTokens({ accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' })
    return
  }
  const response = await fetchApi(`${API_BASE}/auth/login`, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: identifier.trim(), password }),
  })
  if (!response.ok) throw new Error(await errorMessage(response, 'No fue posible iniciar sesión.'))
  await saveTokens(await readResponse<TokenPair>(response))
}

export async function logout() {
  const refreshToken = await sessionStorage.get('refreshToken')
  if (!DEMO_MODE && refreshToken) {
    await fetchApi(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined)
  }
  await clearTokens()
}

export async function request<T>(path: string, method = 'GET', body?: unknown, retry = true): Promise<T> {
  if (DEMO_MODE) return demoData<T>(path)
  const response = await fetchApi(`${API_BASE}${path}`, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 401 && retry) {
    if (await refreshSession()) return request<T>(path, method, body, false)
    await clearTokens()
    throw new SessionExpiredError('Tu sesión expiró. Inicia sesión nuevamente.')
  }
  if (!response.ok) throw new Error(await errorMessage(response, 'No fue posible completar la solicitud.'))
  return readResponse<T>(response)
}

export const api = <T,>(path: string) => request<T>(path)

function demoData<T>(path: string): T {
  if (path === '/events') return demoEvents as T
  if (path === '/modules/templates') return [{ code: 'CONFERENCE', name: 'Congreso', modules: demoModules.map(item => item.code) }] as T
  if (path.includes('/modules')) return demoModules as T
  if (path === '/users/me') return { id: 'demo', name: 'Ana Organizadora', email: DEMO_EMAIL, phone: '+502 5555 0000', status: 'ACTIVE', roles: ['ORGANIZER'], preferences: { email: true, push: true, inApp: true } } as T
  return demoEvents[0] as T
}
