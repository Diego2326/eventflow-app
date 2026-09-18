import { sessionStorage } from './sessionStorage'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5080/api'
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
  const response = await fetchApi(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await errorMessage(response, 'No fue posible completar la solicitud.'))
  return response.status === 204 ? undefined as T : response.json()
}

export async function api<T>(path: string): Promise<T> {
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
