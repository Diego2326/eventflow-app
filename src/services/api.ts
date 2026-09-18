import { sessionStorage } from './sessionStorage'
import { DEMO_EMAIL, DEMO_PASSWORD, demoEvents, demoModules } from './demo'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5080/api'
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false'
let accessToken: string | null = null

type TokenPair = { accessToken: string; refreshToken: string }

async function saveTokens(tokens: TokenPair) {
  accessToken = tokens.accessToken
  await Promise.all([
    sessionStorage.set('accessToken', tokens.accessToken),
    sessionStorage.set('refreshToken', tokens.refreshToken),
  ])
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null)
  return payload?.error?.message ?? fallback
}

async function fetchApi(input: string, init?: RequestInit) {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error('No se pudo conectar con EventFlow. Verifica que la API esté encendida y que EXPO_PUBLIC_API_URL sea correcta.')
  }
}

export async function restore() {
  accessToken = await sessionStorage.get('accessToken')
  return Boolean(accessToken)
}

export async function login(identifier: string, password: string) {
  if (DEMO_MODE) {
    if (identifier !== DEMO_EMAIL || password !== DEMO_PASSWORD) throw new Error(`Modo demo: usa ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
    await saveTokens({ accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' })
    return
  }
  const response = await fetchApi(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  if (!response.ok) throw new Error(await errorMessage(response, 'No fue posible iniciar sesión.'))
  await saveTokens(await response.json())
}

export async function logout() {
  accessToken = null
  await Promise.all([sessionStorage.remove('accessToken'), sessionStorage.remove('refreshToken')])
}

export async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (DEMO_MODE) return demoData<T>(path)
  const response = await fetchApi(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await errorMessage(response, 'No fue posible completar la solicitud.'))
  return response.status === 204 ? undefined as T : response.json()
}

export async function api<T>(path: string): Promise<T> {
  if (DEMO_MODE) return demoData<T>(path)
  let response = await fetchApi(`${BASE}${path}`, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} })
  if (response.status === 401) {
    const refreshToken = await sessionStorage.get('refreshToken')
    if (refreshToken) {
      const refresh = await fetchApi(`${BASE}/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }),
      })
      if (refresh.ok) {
        await saveTokens(await refresh.json())
        return api<T>(path)
      }
    }
    await logout()
  }
  if (!response.ok) throw new Error(await errorMessage(response, 'Error de red.'))
  return response.json()
}

function demoData<T>(path: string): T {
  if (path === '/events') return demoEvents as T
  if (path.endsWith('/modules/navigation')) return demoModules as T
  if (path.endsWith('/modules')) return demoModules as T
  return demoEvents[0] as T
}
