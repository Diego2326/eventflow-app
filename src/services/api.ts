import { sessionStorage } from './sessionStorage'

import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  demoCapacities,
  demoEvents,
  demoModules,
  demoPasses,
  demoRsvps,
} from './demo'

import type {
  EventAgenda,
  EventAgendaActivity,
  EventCapacity,
  EventItem,
  EventModule,
  EventPass,
  EventRSVP,
  RSVPStatus,
} from '../types/events'

const BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:5080/api'

export const DEMO_MODE =
  process.env.EXPO_PUBLIC_DEMO_MODE !== 'false'

let accessToken: string | null = null

let demoRsvpState: EventRSVP[] =
  demoRsvps.map(item => ({
    ...item,
  }))

let demoPassState: EventPass[] =
  demoPasses.map(item => ({
    ...item,
  }))

type TokenPair = {
  accessToken: string
  refreshToken: string
}

type JsonRecord = Record<string, unknown>

export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string
  roles: string[]
  status:
    | 'PENDING'
    | 'ACTIVE'
    | 'DISABLED'
    | 'DELETED'
  provider:
    | 'password'
    | 'google'
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user?: AuthUser
}

export type RegisterInput = {
  name: string
  email: string
  phone: string
  password: string
}

export type RegisterResult = {
  userId?: string
  status:
    | 'PENDING'
    | 'ACTIVE'
  message?: string
}

export type GoogleAuthResult =
  | {
      status: 'AUTHENTICATED'
      accessToken: string
      refreshToken: string
      user: AuthUser
    }
  | {
      status:
        'PROFILE_REQUIRED'
      registrationToken: string
      email: string
      name?: string
    }

export type UpdateProfileInput = {
  name?: string
  phone?: string
}

export type ProfileVisibility =
  | 'PRIVATE'
  | 'EVENT_PARTICIPANTS'

export type ProfilePreferences = {
  personalizationEnabled: boolean
  eventCommunicationsEnabled: boolean
  profileVisibility: ProfileVisibility
}

export type UpdateProfilePreferencesInput =
  Partial<ProfilePreferences>

export type NotificationKind =
  | 'GENERAL'
  | 'SEGMENTED'
  | 'MODULE'

export type NotificationIcon =
  | 'calendar'
  | 'bell'
  | 'check-circle'
  | 'users'
  | 'map-pin'

export type NotificationItem = {
  id: string
  title: string
  message: string
  createdAt: string
  icon: NotificationIcon
  unread: boolean
  kind: NotificationKind
  audience: string
  eventId?: string
  moduleCode?: string
}

export const AUTH_ENDPOINTS = {
  register: '/auth/register',
  verifyEmail:
    '/auth/verify-email',
  resendVerification:
    '/auth/resend-verification',
  login: '/auth/login',
  google: '/auth/google',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  logoutAll: '/auth/logout-all',
  forgotPassword:
    '/auth/forgot-password',
  resetPassword:
    '/auth/reset-password',
  changePassword:
    '/auth/change-password',
  me: '/auth/me',
  profile: '/profiles/me',
} as const

export const PROFILE_ENDPOINTS = {
  me: '/profiles/me',
  preferences:
    '/profiles/me/preferences',
} as const

export const NOTIFICATION_ENDPOINTS = {
  list: '/notifications',

  read: (notificationId: string) =>
    `/notifications/${notificationId}/read`,

  readAll:
    '/notifications/read-all',
} as const

export const EVENT_ENDPOINTS = {
  events: '/events',
  passes: '/passes',
  rsvps: '/rsvps',
  capacities: '/capacities',

  modules: (eventId: string) =>
    `/events/${eventId}/modules/navigation`,

  agenda: (eventId: string) =>
    `/events/${eventId}/agenda`,

  rsvp: (eventId: string) =>
    `/rsvps/${eventId}`,

  capacity: (eventId: string) =>
    `/capacities/${eventId}`,

  pass: (passId: string) =>
    `/passes/${passId}`,
} as const

export type UpdateEventRsvpInput = {
  status: RSVPStatus
  companions: number
}

type DemoLocalUser = {
  name: string
  email: string
  phone: string
  password: string
  provider: 'password'
}

type DemoPublicUser = {
  name: string
  email: string
  phone: string
  provider: 'password' | 'google'
}

const DEMO_USERS_KEY =
  'demoLocalUsers'

const DEMO_CURRENT_USER_KEY =
  'demoCurrentUser'

const DEMO_BUILTIN_PASSWORD_KEY =
  'demoBuiltinPassword'

const DEMO_BUILTIN_PROFILE_KEY =
  'demoBuiltinProfile'

let demoProfilePreferences: ProfilePreferences = {
  personalizationEnabled: false,
  eventCommunicationsEnabled: true,
  profileVisibility:
    'EVENT_PARTICIPANTS',
}

let demoNotificationState: NotificationItem[] = [
  {
    id: 'demo-notification-1',
    title:
      'Tu evento está por comenzar',
    message:
      'Revisa la agenda y tu pase antes de ingresar.',
    createdAt: new Date(
      Date.now() -
        10 * 60 * 1000,
    ).toISOString(),
    icon: 'calendar',
    unread: true,
    kind: 'MODULE',
    audience:
      'Invitados del evento',
    eventId: 'demo-event-2',
    moduleCode: 'agenda',
  },
  {
    id: 'demo-notification-2',
    title:
      'Tu pase está disponible',
    message:
      'Ya puedes consultar tu pase digital para tu próximo evento.',
    createdAt: new Date(
      Date.now() -
        60 * 60 * 1000,
    ).toISOString(),
    icon: 'check-circle',
    unread: true,
    kind: 'MODULE',
    audience:
      'Invitado con pase',
    eventId: 'demo-event-2',
    moduleCode: 'access',
  },
  {
    id: 'demo-notification-3',
    title: 'Nueva actividad',
    message:
      'Se agregó una actividad a la agenda del evento.',
    createdAt: new Date(
      Date.now() -
        24 * 60 * 60 * 1000,
    ).toISOString(),
    icon: 'bell',
    unread: false,
    kind: 'GENERAL',
    audience:
      'Todos los invitados',
    eventId: 'demo-event-2',
    moduleCode: 'agenda',
  },
]

function normalizeEmail(
  value: string,
) {
  return value.trim().toLowerCase()
}

function normalizePhone(
  value: string,
) {
  return value.replace(/\D/g, '')
}

async function readDemoBuiltinPassword() {
  return (
    await sessionStorage.get(
      DEMO_BUILTIN_PASSWORD_KEY,
    )
  ) ?? DEMO_PASSWORD
}

async function readDemoBuiltinProfile(): Promise<
  DemoPublicUser
> {
  const raw =
    await sessionStorage.get(
      DEMO_BUILTIN_PROFILE_KEY,
    )

  if (!raw) {
    return {
      name: 'Ana Organizadora',
      email: DEMO_EMAIL,
      phone: '',
      provider: 'password',
    }
  }

  try {
    const parsed =
      JSON.parse(raw)

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.name !==
        'string' ||
      typeof parsed.email !==
        'string' ||
      typeof parsed.phone !==
        'string'
    ) {
      throw new Error()
    }

    return {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      provider: 'password',
    }
  } catch {
    return {
      name: 'Ana Organizadora',
      email: DEMO_EMAIL,
      phone: '',
      provider: 'password',
    }
  }
}

async function saveDemoBuiltinProfile(
  user: DemoPublicUser,
) {
  await sessionStorage.set(
    DEMO_BUILTIN_PROFILE_KEY,
    JSON.stringify({
      name: user.name,
      email: DEMO_EMAIL,
      phone: user.phone,
      provider: 'password',
    }),
  )
}

function addMinutes(
  iso: string,
  minutes: number,
) {
  return new Date(
    new Date(iso).getTime() +
      minutes * 60 * 1000,
  ).toISOString()
}

function buildDemoAgenda(
  eventId: string,
): EventAgenda {
  const event =
    demoEvents.find(
      item => item.id === eventId,
    )

  if (!event) {
    throw new Error(
      'No existe agenda demo para este evento.',
    )
  }

  const definitions =
    eventId === 'demo-event-1'
      ? [
          {
            id: 'demo-agenda-1-1',
            title:
              'El poder de las ideas',
            offset: 60,
            duration: 60,
            detail: 'Lucía Torres',
          },
          {
            id: 'demo-agenda-1-2',
            title:
              'Creatividad en la era IA',
            offset: 150,
            duration: 60,
            detail: 'Diego Ramírez',
          },
          {
            id: 'demo-agenda-1-3',
            title:
              'Panel: El futuro creativo',
            offset: 240,
            duration: 75,
            detail:
              'Ana Martínez, Carlos Vega',
          },
        ]
      : [
          {
            id: 'demo-agenda-2-1',
            title:
              'Recepción y bienvenida',
            offset: 0,
            duration: 45,
            detail:
              'Ingreso de invitados',
          },
          {
            id: 'demo-agenda-2-2',
            title:
              'Experiencia gastronómica',
            offset: 60,
            duration: 90,
            detail:
              'Degustación principal',
          },
          {
            id: 'demo-agenda-2-3',
            title:
              'Cierre y convivencia',
            offset: 165,
            duration: 60,
            detail:
              'Actividad de cierre',
          },
        ]

  const now = Date.now()

  const activities: EventAgendaActivity[] =
    definitions.map(item => {
      const startsAt =
        addMinutes(
          event.startsAt,
          item.offset,
        )

      const endsAt =
        addMinutes(
          startsAt,
          item.duration,
        )

      const startMs =
        new Date(
          startsAt,
        ).getTime()

      const endMs =
        new Date(
          endsAt,
        ).getTime()

      const status =
        now >= startMs &&
        now < endMs
          ? 'NOW'
          : now >= endMs
            ? 'FINISHED'
            : 'UPCOMING'

      return {
        id: item.id,
        eventId,
        title: item.title,
        startsAt,
        endsAt,
        location: event.location,
        detail: item.detail,
        status,
      }
    })

  return {
    eventId,
    current:
      activities.find(
        activity =>
          activity.status === 'NOW',
      ) ?? null,
    next:
      activities.find(
        activity =>
          activity.status ===
          'UPCOMING',
      ) ?? null,
    activities,
  }
}

async function readDemoUsers(): Promise<
  DemoLocalUser[]
> {
  const raw =
    await sessionStorage.get(
      DEMO_USERS_KEY,
    )

  if (!raw) {
    return []
  }

  try {
    const parsed =
      JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (
        item,
      ): item is DemoLocalUser =>
        !!item &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.email === 'string' &&
        typeof item.phone === 'string' &&
        typeof item.password === 'string' &&
        item.provider === 'password',
    )
  } catch {
    return []
  }
}

async function saveDemoUsers(
  users: DemoLocalUser[],
) {
  await sessionStorage.set(
    DEMO_USERS_KEY,
    JSON.stringify(users),
  )
}

async function saveDemoCurrentUser(
  user: DemoPublicUser,
) {
  await sessionStorage.set(
    DEMO_CURRENT_USER_KEY,
    JSON.stringify(user),
  )
}

async function saveDemoSession(
  user: DemoPublicUser,
) {
  await saveTokens({
    accessToken:
      `demo-access-token:${user.email}`,
    refreshToken:
      `demo-refresh-token:${user.email}`,
  })

  await saveDemoCurrentUser(user)
}

async function saveTokens(
  tokens: TokenPair,
) {
  accessToken = tokens.accessToken

  await Promise.all([
    sessionStorage.set(
      'accessToken',
      tokens.accessToken,
    ),
    sessionStorage.set(
      'refreshToken',
      tokens.refreshToken,
    ),
  ])
}

async function clearLocalSession() {
  accessToken = null

  await Promise.all([
    sessionStorage.remove(
      'accessToken',
    ),
    sessionStorage.remove(
      'refreshToken',
    ),
    sessionStorage.remove(
      DEMO_CURRENT_USER_KEY,
    ),
  ])
}

async function errorMessage(
  response: Response,
  fallback: string,
) {
  const payload = await response
    .json()
    .catch(() => null)

  return payload?.error?.message ?? fallback
}

async function fetchApi(
  input: string,
  init?: RequestInit,
) {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error(
      'No se pudo conectar con EventFlow. Verifica que la API esté encendida y que EXPO_PUBLIC_API_URL sea correcta.',
    )
  }
}

function asRecord(
  value: unknown,
): JsonRecord {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return {}
  }

  return value as JsonRecord
}

function nowIso() {
  return new Date().toISOString()
}

function findDemoRsvp(
  eventId: string,
) {
  return demoRsvpState.find(
    item => item.eventId === eventId,
  )
}

function findDemoPass(
  passId: string,
) {
  return demoPassState.find(
    item => item.id === passId,
  )
}

function updateDemoRsvp(
  eventId: string,
  body?: unknown,
) {
  const current =
    findDemoRsvp(eventId)

  if (!current) {
    throw new Error(
      'No existe una invitación RSVP demo para este evento.',
    )
  }

  const payload = asRecord(body)

  const nextStatus =
    payload.status

  if (
    nextStatus === 'PENDING' ||
    nextStatus === 'CONFIRMED' ||
    nextStatus === 'DECLINED'
  ) {
    current.status = nextStatus
  }

  if (
    typeof payload.companions ===
      'number' &&
    Number.isFinite(
      payload.companions,
    )
  ) {
    const companions = Math.max(
      0,
      Math.floor(
        payload.companions,
      ),
    )

    if (
      current.maxCompanions !==
        undefined &&
      companions >
        current.maxCompanions
    ) {
      throw new Error(
        `Este evento permite un máximo de ${current.maxCompanions} acompañante(s).`,
      )
    }

    current.companions =
      companions
  }

  return {
    ...current,
  }
}

function checkInDemoPass(
  passId: string,
) {
  const pass =
    findDemoPass(passId)

  if (!pass) {
    throw new Error(
      'No se encontró el pase demo.',
    )
  }

  if (
    pass.status === 'REVOKED'
  ) {
    throw new Error(
      'Este pase fue revocado y no puede utilizarse.',
    )
  }

  if (
    pass.accessStatus ===
      'CHECKED_OUT' &&
    pass.reentryAllowed === false
  ) {
    throw new Error(
      'Este pase no permite reingreso.',
    )
  }

  pass.status = 'ACTIVE'
  pass.accessStatus =
    'CHECKED_IN'
  pass.checkedInAt =
    nowIso()

  return {
    ...pass,
  }
}

function checkOutDemoPass(
  passId: string,
) {
  const pass =
    findDemoPass(passId)

  if (!pass) {
    throw new Error(
      'No se encontró el pase demo.',
    )
  }

  if (
    pass.status === 'REVOKED'
  ) {
    throw new Error(
      'Este pase fue revocado.',
    )
  }

  if (
    pass.accessStatus !==
    'CHECKED_IN'
  ) {
    throw new Error(
      'El pase no tiene un check-in activo.',
    )
  }

  pass.accessStatus =
    'CHECKED_OUT'
  pass.checkedOutAt =
    nowIso()

  if (
    pass.reentryAllowed === false
  ) {
    pass.status = 'USED'
  }

  return {
    ...pass,
  }
}

function reenterDemoPass(
  passId: string,
) {
  const pass =
    findDemoPass(passId)

  if (!pass) {
    throw new Error(
      'No se encontró el pase demo.',
    )
  }

  if (
    pass.status === 'REVOKED'
  ) {
    throw new Error(
      'Este pase fue revocado y no permite reingreso.',
    )
  }

  if (
    pass.reentryAllowed !== true
  ) {
    throw new Error(
      'Este pase no permite reingreso.',
    )
  }

  if (
    pass.accessStatus !==
    'CHECKED_OUT'
  ) {
    throw new Error(
      'El pase debe registrar una salida antes del reingreso.',
    )
  }

  pass.status = 'ACTIVE'
  pass.accessStatus =
    'CHECKED_IN'
  pass.checkedInAt =
    nowIso()

  return {
    ...pass,
  }
}

function revokeDemoPass(
  passId: string,
) {
  const pass =
    findDemoPass(passId)

  if (!pass) {
    throw new Error(
      'No se encontró el pase demo.',
    )
  }

  pass.status = 'REVOKED'
  pass.revokedAt = nowIso()

  return {
    ...pass,
  }
}

function demoData<T>(
  path: string,
): T {
  if (path === '/events') {
    return demoEvents as T
  }

  if (path === '/passes') {
    return demoPassState.map(
      item => ({
        ...item,
      }),
    ) as T
  }

  if (path === '/rsvps') {
    return demoRsvpState.map(
      item => ({
        ...item,
      }),
    ) as T
  }

  if (
    path === '/capacities'
  ) {
    return demoCapacities.map(
      item => ({
        ...item,
      }),
    ) as T
  }

  const agendaMatch =
    path.match(
      /^\/events\/([^/]+)\/agenda$/,
    )

  if (agendaMatch) {
    return buildDemoAgenda(
      agendaMatch[1],
    ) as T
  }

  const rsvpMatch =
    path.match(
      /^\/rsvps\/([^/]+)$/,
    )

  if (rsvpMatch) {
    const item =
      findDemoRsvp(
        rsvpMatch[1],
      )

    if (!item) {
      throw new Error(
        'No existe información RSVP demo para este evento.',
      )
    }

    return {
      ...item,
    } as T
  }

  const capacityMatch =
    path.match(
      /^\/capacities\/([^/]+)$/,
    )

  if (capacityMatch) {
    const item =
      demoCapacities.find(
        capacity =>
          capacity.eventId ===
          capacityMatch[1],
      )

    if (!item) {
      throw new Error(
        'No existe información de capacidad demo para este evento.',
      )
    }

    return {
      ...item,
    } as T
  }

  const passMatch =
    path.match(
      /^\/passes\/([^/]+)$/,
    )

  if (passMatch) {
    const pass =
      findDemoPass(
        passMatch[1],
      )

    if (!pass) {
      throw new Error(
        'No se encontró el pase demo.',
      )
    }

    return {
      ...pass,
    } as T
  }

  if (
    path.endsWith(
      '/modules/navigation',
    )
  ) {
    return demoModules as T
  }

  if (
    path.endsWith('/modules')
  ) {
    return demoModules as T
  }

  throw new Error(
    `La ruta demo ${path} todavía no está implementada.`,
  )
}

function demoRequest<T>(
  path: string,
  method: string,
  body?: unknown,
): T {
  const normalizedMethod =
    method.toUpperCase()

  if (
    normalizedMethod === 'GET'
  ) {
    return demoData<T>(path)
  }

  const rsvpMatch =
    path.match(
      /^\/rsvps\/([^/]+)$/,
    )

  if (
    rsvpMatch &&
    (
      normalizedMethod ===
        'PATCH' ||
      normalizedMethod ===
        'PUT'
    )
  ) {
    return updateDemoRsvp(
      rsvpMatch[1],
      body,
    ) as T
  }

  const checkInMatch =
    path.match(
      /^\/passes\/([^/]+)\/check-in$/,
    )

  if (
    checkInMatch &&
    normalizedMethod === 'POST'
  ) {
    return checkInDemoPass(
      checkInMatch[1],
    ) as T
  }

  const checkOutMatch =
    path.match(
      /^\/passes\/([^/]+)\/check-out$/,
    )

  if (
    checkOutMatch &&
    normalizedMethod === 'POST'
  ) {
    return checkOutDemoPass(
      checkOutMatch[1],
    ) as T
  }

  const reentryMatch =
    path.match(
      /^\/passes\/([^/]+)\/reentry$/,
    )

  if (
    reentryMatch &&
    normalizedMethod === 'POST'
  ) {
    return reenterDemoPass(
      reentryMatch[1],
    ) as T
  }

  const revokeMatch =
    path.match(
      /^\/passes\/([^/]+)\/revoke$/,
    )

  if (
    revokeMatch &&
    normalizedMethod === 'POST'
  ) {
    return revokeDemoPass(
      revokeMatch[1],
    ) as T
  }

  throw new Error(
    `La operación demo ${normalizedMethod} ${path} todavía no está implementada.`,
  )
}

async function refreshSession() {
  const refreshToken =
    await sessionStorage.get(
      'refreshToken',
    )

  if (!refreshToken) {
    return false
  }

  const refresh =
    await fetchApi(
      `${BASE}${AUTH_ENDPOINTS.refresh}`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          refreshToken,
        }),
      },
    )

  if (!refresh.ok) {
    return false
  }

  await saveTokens(
    await refresh.json(),
  )

  return true
}

async function realRequest<T>(
  path: string,
  method: string,
  body?: unknown,
  retryUnauthorized = true,
): Promise<T> {
  const response =
    await fetchApi(
      `${BASE}${path}`,
      {
        method,

        headers: {
          'Content-Type':
            'application/json',

          ...(accessToken
            ? {
                Authorization:
                  `Bearer ${accessToken}`,
              }
            : {}),
        },

        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      },
    )

  if (
    response.status === 401 &&
    retryUnauthorized
  ) {
    const refreshed =
      await refreshSession()

    if (refreshed) {
      return realRequest<T>(
        path,
        method,
        body,
        false,
      )
    }

    await clearLocalSession()
  }

  if (!response.ok) {
    throw new Error(
      await errorMessage(
        response,
        'No fue posible completar la solicitud.',
      ),
    )
  }

  return response.status === 204
    ? (undefined as T)
    : response.json()
}

export async function restore() {
  accessToken =
    await sessionStorage.get(
      'accessToken',
    )

  if (DEMO_MODE) {
    return Boolean(accessToken)
  }

  try {
    if (!accessToken) {
      const refreshed =
        await refreshSession()

      if (!refreshed) {
        await clearLocalSession()
        return false
      }
    }

    await realRequest<AuthUser>(
      AUTH_ENDPOINTS.me,
      'GET',
    )

    return true
  } catch {
    await clearLocalSession()
    return false
  }
}

export async function registerDemoUser(
  input: {
    name: string
    email: string
    phone: string
    password: string
  },
) {
  if (!DEMO_MODE) {
    throw new Error(
      'El registro demo solo está disponible cuando EXPO_PUBLIC_DEMO_MODE está activo.',
    )
  }

  const name = input.name.trim()
  const email =
    normalizeEmail(input.email)
  const phone =
    normalizePhone(input.phone)

  if (
    !name ||
    !email ||
    !phone ||
    !input.password
  ) {
    throw new Error(
      'Completa todos los datos del registro.',
    )
  }

  const users =
    await readDemoUsers()

  const emailAlreadyExists =
    email ===
      normalizeEmail(DEMO_EMAIL) ||
    users.some(
      user =>
        normalizeEmail(
          user.email,
        ) === email,
    )

  if (emailAlreadyExists) {
    throw new Error(
      'Ese correo ya está registrado en el modo demo.',
    )
  }

  const phoneAlreadyExists =
    users.some(
      user =>
        normalizePhone(
          user.phone,
        ) === phone,
    )

  if (phoneAlreadyExists) {
    throw new Error(
      'Ese teléfono ya está registrado en el modo demo.',
    )
  }

  const user: DemoLocalUser = {
    name,
    email,
    phone,
    password: input.password,
    provider: 'password',
  }

  await saveDemoUsers([
    ...users,
    user,
  ])

  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    provider:
      user.provider,
  } satisfies DemoPublicUser
}

export async function demoGoogleLogin() {
  if (!DEMO_MODE) {
    throw new Error(
      'Google demo solo está disponible cuando EXPO_PUBLIC_DEMO_MODE está activo.',
    )
  }

  const user: DemoPublicUser = {
    name: 'Usuario Google Demo',
    email:
      'google.demo@eventflow.demo',
    phone: '',
    provider: 'google',
  }

  await saveDemoSession(user)

  return user
}

export async function getDemoCurrentUser(): Promise<
  DemoPublicUser | null
> {
  if (!DEMO_MODE) {
    return null
  }

  const raw =
    await sessionStorage.get(
      DEMO_CURRENT_USER_KEY,
    )

  if (!raw) {
    return null
  }

  try {
    const parsed =
      JSON.parse(raw)

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.name !==
        'string' ||
      typeof parsed.email !==
        'string' ||
      typeof parsed.phone !==
        'string' ||
      (
        parsed.provider !==
          'password' &&
        parsed.provider !==
          'google'
      )
    ) {
      return null
    }

    return parsed as DemoPublicUser
  } catch {
    return null
  }
}

export async function changeDemoPassword(
  currentPassword: string,
  newPassword: string,
) {
  if (!DEMO_MODE) {
    throw new Error(
      'El cambio demo solo está disponible cuando EXPO_PUBLIC_DEMO_MODE está activo.',
    )
  }

  const currentUser =
    await getDemoCurrentUser()

  if (!currentUser) {
    throw new Error(
      'No hay una sesión demo activa.',
    )
  }

  if (
    currentUser.provider ===
    'google'
  ) {
    throw new Error(
      'La sesión Google demo no utiliza una contraseña local.',
    )
  }

  if (
    normalizeEmail(
      currentUser.email,
    ) ===
    normalizeEmail(
      DEMO_EMAIL,
    )
  ) {
    const savedPassword =
      await readDemoBuiltinPassword()

    if (
      savedPassword !==
      currentPassword
    ) {
      throw new Error(
        'La contraseña actual no es correcta.',
      )
    }

    await sessionStorage.set(
      DEMO_BUILTIN_PASSWORD_KEY,
      newPassword,
    )

    return
  }

  const users =
    await readDemoUsers()

  const index =
    users.findIndex(
      user =>
        normalizeEmail(
          user.email,
        ) ===
        normalizeEmail(
          currentUser.email,
        ),
    )

  if (index < 0) {
    throw new Error(
      'No se encontró la cuenta demo actual.',
    )
  }

  if (
    users[index].password !==
    currentPassword
  ) {
    throw new Error(
      'La contraseña actual no es correcta.',
    )
  }

  users[index] = {
    ...users[index],
    password: newPassword,
  }

  await saveDemoUsers(users)
}

export async function login(
  identifier: string,
  password: string,
) {
  if (DEMO_MODE) {
    const cleanIdentifier =
      identifier.trim()

    const normalizedEmail =
      normalizeEmail(
        cleanIdentifier,
      )

    const normalizedPhone =
      normalizePhone(
        cleanIdentifier,
      )

    const builtinPassword =
      await readDemoBuiltinPassword()

    if (
      normalizedEmail ===
        normalizeEmail(
          DEMO_EMAIL,
        ) &&
      password === builtinPassword
    ) {
      const builtinProfile =
        await readDemoBuiltinProfile()

      await saveDemoSession(
        builtinProfile,
      )

      return
    }

    const users =
      await readDemoUsers()

    const user =
      users.find(item => {
        const sameEmail =
          normalizeEmail(
            item.email,
          ) === normalizedEmail

        const samePhone =
          normalizedPhone.length >
            0 &&
          normalizePhone(
            item.phone,
          ) ===
            normalizedPhone

        return (
          sameEmail ||
          samePhone
        )
      })

    if (
      !user ||
      user.password !== password
    ) {
      throw new Error(
        'Credenciales inválidas. Usa la cuenta demo incluida o una cuenta creada desde Registro.',
      )
    }

    await saveDemoSession({
      name: user.name,
      email: user.email,
      phone: user.phone,
      provider:
        user.provider,
    })

    return
  }

  const response =
    await fetchApi(
      `${BASE}${AUTH_ENDPOINTS.login}`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          identifier,
          password,
        }),
      },
    )

  if (!response.ok) {
    throw new Error(
      await errorMessage(
        response,
        'No fue posible iniciar sesión.',
      ),
    )
  }

  await saveTokens(
    await response.json(),
  )
}

export async function logout() {
  if (DEMO_MODE) {
    await clearLocalSession()
    return
  }

  try {
    if (accessToken) {
      await realRequest<void>(
        AUTH_ENDPOINTS.logout,
        'POST',
        undefined,
        false,
      )
    }
  } finally {
    await clearLocalSession()
  }
}

export async function request<T>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  if (DEMO_MODE) {
    return demoRequest<T>(
      path,
      method,
      body,
    )
  }

  return realRequest<T>(
    path,
    method,
    body,
  )
}

export async function api<T>(
  path: string,
): Promise<T> {
  return request<T>(
    path,
    'GET',
  )
}

/*
 * =====================================================
 * CONTRATO PÚBLICO PARA LAS PANTALLAS
 * =====================================================
 *
 * A partir de aquí las pantallas deben preferir estas
 * funciones en lugar de llamar request('/auth/...') de
 * forma directa.
 *
 * Cuando EXPO_PUBLIC_DEMO_MODE=false, estas funciones
 * llaman al backend real.
 */

export async function registerAccount(
  input: RegisterInput,
): Promise<RegisterResult> {
  if (DEMO_MODE) {
    const user =
      await registerDemoUser(
        input,
      )

    return {
      status: 'ACTIVE',
      message:
        `Cuenta demo local creada para ${user.email}.`,
    }
  }

  return realRequest<RegisterResult>(
    AUTH_ENDPOINTS.register,
    'POST',
    input,
    false,
  )
}

export async function verifyEmail(
  token: string,
) {
  if (DEMO_MODE) {
    return {
      status:
        'ACTIVE' as const,
      message:
        'Cuenta demo verificada.',
    }
  }

  return realRequest<{
    status: 'ACTIVE'
    message?: string
  }>(
    AUTH_ENDPOINTS.verifyEmail,
    'POST',
    {
      token,
    },
    false,
  )
}

export async function resendVerification(
  email: string,
) {
  if (DEMO_MODE) {
    return {
      message:
        'Modo demo: no se envía correo real.',
    }
  }

  return realRequest<{
    message: string
  }>(
    AUTH_ENDPOINTS
      .resendVerification,
    'POST',
    {
      email:
        normalizeEmail(email),
    },
    false,
  )
}

export async function forgotPassword(
  email: string,
) {
  if (DEMO_MODE) {
    return {
      message:
        'Si existe una cuenta asociada a ese correo, recibirás instrucciones para recuperar tu acceso.',
    }
  }

  return realRequest<{
    message: string
  }>(
    AUTH_ENDPOINTS
      .forgotPassword,
    'POST',
    {
      email:
        normalizeEmail(email),
    },
    false,
  )
}

export async function resetPassword(
  input: {
    token: string
    newPassword: string
    closeAllSessions?: boolean
  },
) {
  if (DEMO_MODE) {
    return {
      message:
        'El restablecimiento demo no envía enlaces reales.',
    }
  }

  return realRequest<{
    message?: string
  }>(
    AUTH_ENDPOINTS
      .resetPassword,
    'POST',
    input,
    false,
  )
}

export async function changePassword(
  input: {
    currentPassword: string
    newPassword: string
    closeAllSessions?: boolean
  },
) {
  if (DEMO_MODE) {
    await changeDemoPassword(
      input.currentPassword,
      input.newPassword,
    )

    return {
      message:
        'La contraseña demo fue actualizada localmente.',
    }
  }

  return realRequest<{
    message?: string
  }>(
    AUTH_ENDPOINTS
      .changePassword,
    'POST',
    input,
  )
}

export async function loginWithGoogleToken(
  idToken: string,
): Promise<GoogleAuthResult> {
  if (DEMO_MODE) {
    const user =
      await demoGoogleLogin()

    return {
      status:
        'AUTHENTICATED',
      accessToken:
        'demo-google-access-token',
      refreshToken:
        'demo-google-refresh-token',
      user: {
        id:
          'demo-google-user',
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: ['GUEST'],
        status: 'ACTIVE',
        provider: 'google',
      },
    }
  }

  const result =
    await realRequest<GoogleAuthResult>(
      AUTH_ENDPOINTS.google,
      'POST',
      {
        idToken,
      },
      false,
    )

  if (
    result.status ===
    'AUTHENTICATED'
  ) {
    await saveTokens({
      accessToken:
        result.accessToken,
      refreshToken:
        result.refreshToken,
    })
  }

  return result
}

export async function completeGoogleRegistration(
  input: {
    registrationToken: string
    name: string
    phone: string
    acceptedTerms: boolean
    acceptedPrivacy: boolean
  },
): Promise<AuthSession> {
  if (DEMO_MODE) {
    throw new Error(
      'El modo demo no necesita completar un registro Google real.',
    )
  }

  const result =
    await realRequest<AuthSession>(
      AUTH_ENDPOINTS.google,
      'POST',
      input,
      false,
    )

  await saveTokens({
    accessToken:
      result.accessToken,
    refreshToken:
      result.refreshToken,
  })

  return result
}

export async function getCurrentUser(): Promise<
  AuthUser | null
> {
  if (DEMO_MODE) {
    const demoUser =
      await getDemoCurrentUser()

    if (!demoUser) {
      return null
    }

    return {
      id:
        `demo:${demoUser.email}`,
      name: demoUser.name,
      email: demoUser.email,
      phone: demoUser.phone,
      roles: ['GUEST'],
      status: 'ACTIVE',
      provider:
        demoUser.provider,
    }
  }

  return realRequest<AuthUser>(
    AUTH_ENDPOINTS.me,
    'GET',
  )
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<AuthUser> {
  if (DEMO_MODE) {
    const current =
      await getDemoCurrentUser()

    if (!current) {
      throw new Error(
        'No hay una sesión demo activa.',
      )
    }

    const nextUser: DemoPublicUser = {
      ...current,
      name:
        input.name?.trim() ||
        current.name,
      phone:
        input.phone ===
        undefined
          ? current.phone
          : input.phone,
    }

    await saveDemoCurrentUser(
      nextUser,
    )

    if (
      normalizeEmail(
        current.email,
      ) ===
      normalizeEmail(
        DEMO_EMAIL,
      )
    ) {
      await saveDemoBuiltinProfile(
        nextUser,
      )
    } else if (
      current.provider ===
      'password'
    ) {
      const users =
        await readDemoUsers()

      const index =
        users.findIndex(
          user =>
            normalizeEmail(
              user.email,
            ) ===
            normalizeEmail(
              current.email,
            ),
        )

      if (index >= 0) {
        users[index] = {
          ...users[index],
          name: nextUser.name,
          phone: nextUser.phone,
        }

        await saveDemoUsers(
          users,
        )
      }
    }

    return {
      id:
        `demo:${nextUser.email}`,
      name: nextUser.name,
      email: nextUser.email,
      phone: nextUser.phone,
      roles: ['GUEST'],
      status: 'ACTIVE',
      provider:
        nextUser.provider,
    }
  }

  return realRequest<AuthUser>(
    PROFILE_ENDPOINTS.me,
    'PATCH',
    input,
  )
}

export async function getProfilePreferences() {
  if (DEMO_MODE) {
    return {
      ...demoProfilePreferences,
    }
  }

  return realRequest<ProfilePreferences>(
    PROFILE_ENDPOINTS.preferences,
    'GET',
  )
}

export async function updateProfilePreferences(
  input: UpdateProfilePreferencesInput,
) {
  if (DEMO_MODE) {
    demoProfilePreferences = {
      ...demoProfilePreferences,
      ...input,
    }

    return {
      ...demoProfilePreferences,
    }
  }

  return realRequest<ProfilePreferences>(
    PROFILE_ENDPOINTS.preferences,
    'PATCH',
    input,
  )
}

/*
 * =====================================================
 * EVENTOS / INVITACIONES / AGENDA / PASES
 * =====================================================
 *
 * Las pantallas deben consumir estas funciones en lugar
 * de construir rutas manualmente. El backend solo debe
 * respetar este contrato HTTP.
 */

export async function getEvents() {
  return request<EventItem[]>(
    EVENT_ENDPOINTS.events,
    'GET',
  )
}

export async function getEventModules(
  eventId: string,
) {
  return request<EventModule[]>(
    EVENT_ENDPOINTS.modules(
      eventId,
    ),
    'GET',
  )
}

export async function getEventAgenda(
  eventId: string,
) {
  return request<EventAgenda>(
    EVENT_ENDPOINTS.agenda(
      eventId,
    ),
    'GET',
  )
}

export async function getEventRsvp(
  eventId: string,
) {
  return request<EventRSVP>(
    EVENT_ENDPOINTS.rsvp(
      eventId,
    ),
    'GET',
  )
}

export async function getRsvps() {
  return request<EventRSVP[]>(
    EVENT_ENDPOINTS.rsvps,
    'GET',
  )
}

export async function updateEventRsvp(
  eventId: string,
  input: UpdateEventRsvpInput,
) {
  return request<EventRSVP>(
    EVENT_ENDPOINTS.rsvp(
      eventId,
    ),
    'PATCH',
    input,
  )
}

export async function getEventCapacity(
  eventId: string,
) {
  return request<EventCapacity>(
    EVENT_ENDPOINTS.capacity(
      eventId,
    ),
    'GET',
  )
}

export async function getCapacities() {
  return request<EventCapacity[]>(
    EVENT_ENDPOINTS.capacities,
    'GET',
  )
}

export async function getPasses() {
  return request<EventPass[]>(
    EVENT_ENDPOINTS.passes,
    'GET',
  )
}

export async function getPass(
  passId: string,
) {
  return request<EventPass>(
    EVENT_ENDPOINTS.pass(
      passId,
    ),
    'GET',
  )
}

/*
 * =====================================================
 * NOTIFICACIONES
 * =====================================================
 */

export async function getNotifications() {
  if (DEMO_MODE) {
    return demoNotificationState.map(
      item => ({
        ...item,
      }),
    )
  }

  return realRequest<NotificationItem[]>(
    NOTIFICATION_ENDPOINTS.list,
    'GET',
  )
}

export async function markNotificationRead(
  notificationId: string,
) {
  if (DEMO_MODE) {
    demoNotificationState =
      demoNotificationState.map(
        item =>
          item.id ===
          notificationId
            ? {
                ...item,
                unread: false,
              }
            : item,
      )

    const updated =
      demoNotificationState.find(
        item =>
          item.id ===
          notificationId,
      )

    if (!updated) {
      throw new Error(
        'No se encontró la notificación demo.',
      )
    }

    return {
      ...updated,
    }
  }

  return realRequest<NotificationItem>(
    NOTIFICATION_ENDPOINTS.read(
      notificationId,
    ),
    'PATCH',
  )
}

export async function markAllNotificationsRead() {
  if (DEMO_MODE) {
    demoNotificationState =
      demoNotificationState.map(
        item => ({
          ...item,
          unread: false,
        }),
      )

    return {
      success: true,
    }
  }

  return realRequest<{
    success: boolean
  }>(
    NOTIFICATION_ENDPOINTS.readAll,
    'POST',
  )
}

export async function logoutAllSessions() {
  if (DEMO_MODE) {
    await clearLocalSession()
    return
  }

  try {
    await realRequest<void>(
      AUTH_ENDPOINTS.logoutAll,
      'POST',
      undefined,
      false,
    )
  } finally {
    await clearLocalSession()
  }
}

