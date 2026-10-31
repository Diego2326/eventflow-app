import { sessionStorage } from './sessionStorage'
import { Platform } from 'react-native'

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
  process.env.EXPO_PUBLIC_API_URL ||
  'https://eventflow-backend-990072178406.us-east4.run.app/api'

const API_REQUEST_TIMEOUT_MS = 15_000
const API_READ_CACHE_TTL_MS = 15_000

type ApiReadCacheEntry = {
  hasValue: boolean
  value?: unknown
  expiresAt: number
  pending?: Promise<unknown>
}

const apiReadCache = new Map<string, ApiReadCacheEntry>()

function clearReadCache(...keys: string[]) {
  if (keys.length === 0) {
    apiReadCache.clear()
    return
  }

  keys.forEach(key => apiReadCache.delete(key))
}

async function cachedRead<T>(
  key: string,
  load: () => Promise<T>,
  forceRefresh = false,
): Promise<T> {
  const cached = apiReadCache.get(key)

  if (cached?.pending) {
    return cached.pending as Promise<T>
  }

  if (
    !forceRefresh &&
    cached?.hasValue &&
    cached.expiresAt > Date.now()
  ) {
    return cached.value as T
  }

  const entry: ApiReadCacheEntry = {
    hasValue: cached?.hasValue ?? false,
    value: cached?.value,
    expiresAt: cached?.expiresAt ?? 0,
  }
  const pending = load()
  entry.pending = pending
  apiReadCache.set(key, entry)

  try {
    const value = await pending
    if (apiReadCache.get(key) === entry) {
      apiReadCache.set(key, {
        hasValue: true,
        value,
        expiresAt: Date.now() + API_READ_CACHE_TTL_MS,
      })
    }
    return value
  } catch (error) {
    if (apiReadCache.get(key) === entry) {
      if (cached?.hasValue) apiReadCache.set(key, cached)
      else apiReadCache.delete(key)
    }
    throw error
  }
}

export const DEMO_MODE =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true'

let accessToken: string | null = null

let demoRsvpState: EventRSVP[] =
  demoRsvps.map(item => ({
    ...item,
  }))

let demoPassState: EventPass[] =
  demoPasses.map(item => ({
    ...item,
  }))

const demoAgendaFavorites = new Set<string>()
let demoAssistance: AssistanceRequest[] = []

type TokenPair = {
  accessToken: string
  refreshToken: string
}

type JsonRecord = Record<string, unknown>

export type ModuleRecord = {
  id: string
  eventId: string
  moduleCode: string
  recordType: string
  ownerUserId?: string | null
  parentRecordId?: string | null
  status: string
  title?: string | null
  payload: Record<string, unknown>
  capacity?: number | null
  currentCount: number
  startsAt?: string | null
  endsAt?: string | null
  createdAt: string
}

export type ModuleAction = {
  id: string
  recordId: string
  actorUserId?: string | null
  action: string
  payload: Record<string, unknown>
  createdAt: string
  quantity: number
}

export type QueuePosition = {
  recordId: string
  position: number | null
  peopleAhead: number
  waiting: number
}

export type EventPermissions = {
  eventId: string
  owner: boolean
  permissions: string[]
}

export type EventInvitation = {
  id: string
  eventId: string
  guestName: string
  guestEmail?: string | null
  status: string
  allowedCapacity: number
  companions: string[]
  table?: string | null
  seat?: string | null
  sector?: string | null
  checkedIn?: number
  qrPayload?: string | null
  members?: Array<{ index: number; name: string; inside: boolean | null }>
}

export type AssistanceRequest = {
  id: string
  eventId: string
  invitationId?: string | null
  requesterUserId?: string | null
  assignedUserId?: string | null
  category: string
  details?: string | null
  location?: string | null
  priority: number
  status: 'RECEIVED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ATTENDED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export type EventFile = {
  id: string
  eventId: string
  moduleCode: string
  originalName: string
  contentType: string
  sizeBytes: number
  downloadUrl: string
  moderationStatus: 'PENDING' | 'ACTIVE' | 'REJECTED'
  recipientUserId?: string | null
  official: boolean
}

export type MapSearchResult = {
  id: string
  moduleCode: string
  type: string
  title?: string | null
  payload: Record<string, unknown>
}

export type PublicInvitationExperience = {
  invitation: {
    id: string
    eventId: string
    guestName: string
    guestEmail?: string | null
    status: string
    allowedCapacity: number
    companions: string[]
    table?: string | null
    seat?: string | null
    sector?: string | null
    qrPayload?: string | null
  }
  event: {
    id: string
    name: string
    type: string
    description?: string | null
    startsAt: string
    endsAt?: string | null
    timezone: string
    location?: string | null
    status: string
  }
  modules: Array<Pick<EventModule, 'code' | 'name' | 'category' | 'description' | 'order' | 'featured'> & { configuration?: Record<string, unknown> }>
  agenda: EventAgendaActivity[]
  now?: EventAgendaActivity | null
  next?: EventAgendaActivity | null
  notifications: Array<{ id: string; title: string; body: string; createdAt: string }>
  mapPoints: Array<{ id: string; type: string; title?: string | null; payload: Record<string, unknown> }>
}

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

export type ProfilePreferences = {
  networkingProfileVisible: boolean
  networkingContactVisible: boolean
}

export type UpdateProfilePreferencesInput =
  ProfilePreferences

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
  source?: 'PERSONAL' | 'EVENT'
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
  me: '/profile',
  profile: '/profile',
} as const

export const PROFILE_ENDPOINTS = {
  me: '/profile',
  preferences: '/profile/privacy',
} as const

export const NOTIFICATION_ENDPOINTS = {
  list: '/profile/notifications',

  readPersonal: (notificationId: string) =>
    `/profile/notifications/${notificationId}/read`,
  readEvent: (eventId: string, notificationId: string) =>
    `/events/${eventId}/notifications/${notificationId}/read`,
  readAllEvent: (eventId: string) =>
    `/events/${eventId}/notifications/read-all`,
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

const OFFLINE_PASSES_KEY = 'offlineEventPasses'

let demoProfilePreferences: ProfilePreferences = {
  networkingProfileVisible: true,
  networkingContactVisible: true,
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

let demoModuleRecords: ModuleRecord[] = demoEvents.flatMap(event => {
  const createdAt = new Date().toISOString()
  const activityStartsAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const activityEndsAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
  const prefix = `demo-${event.id}`

  return [
    {
      id: `${prefix}-queue`,
      eventId: event.id,
      moduleCode: 'QUE',
      recordType: 'QUEUE',
      status: 'ACTIVE',
      title: 'Degustación de temporada',
      payload: { description: 'Únete a la fila y consulta tu turno desde aquí.' },
      capacity: 40,
      currentCount: 0,
      createdAt,
    },
    {
      id: `${prefix}-activity`,
      eventId: event.id,
      moduleCode: 'BKG',
      recordType: 'ACTIVITY',
      status: 'ACTIVE',
      title: 'Taller de sabores locales',
      payload: { description: 'Una experiencia guiada para descubrir ingredientes de la región.' },
      capacity: 24,
      currentCount: 7,
      startsAt: activityStartsAt,
      endsAt: activityEndsAt,
      createdAt,
    },
    {
      id: `${prefix}-poll`,
      eventId: event.id,
      moduleCode: 'INT',
      recordType: 'POLL',
      status: 'ACTIVE',
      title: '¿Qué experiencia te interesa más?',
      payload: {
        options: [
          { id: 'taller', label: 'Talleres en vivo' },
          { id: 'degustacion', label: 'Degustación' },
          { id: 'musica', label: 'Música y ambiente' },
        ],
        allowMultiple: false,
        resultsPublished: false,
      },
      currentCount: 0,
      createdAt,
    },
    {
      id: `${prefix}-question-board`,
      eventId: event.id,
      moduleCode: 'INT',
      recordType: 'QUESTION_BOARD',
      status: 'ACTIVE',
      title: 'Preguntas para el equipo',
      payload: { moderationRequired: false, allowVotes: true },
      currentCount: 0,
      createdAt,
    },
    {
      id: `${prefix}-category-food`,
      eventId: event.id,
      moduleCode: 'ORD',
      recordType: 'MENU_CATEGORY',
      status: 'ACTIVE',
      title: 'Para compartir',
      payload: { description: 'Selección de la casa' },
      currentCount: 0,
      createdAt,
    },
    {
      id: `${prefix}-category-drink`,
      eventId: event.id,
      moduleCode: 'ORD',
      recordType: 'MENU_CATEGORY',
      status: 'ACTIVE',
      title: 'Bebidas',
      payload: {},
      currentCount: 0,
      createdAt,
    },
    {
      id: `${prefix}-item-tostadas`,
      eventId: event.id,
      moduleCode: 'ORD',
      recordType: 'MENU_ITEM',
      parentRecordId: `${prefix}-category-food`,
      status: 'ACTIVE',
      title: 'Tostadas de aguacate',
      payload: { price: 38, available: true, description: 'Aguacate, hierbas frescas y tomate.' },
      capacity: 30,
      currentCount: 0,
      createdAt,
    },
    {
      id: `${prefix}-item-tamalitos`,
      eventId: event.id,
      moduleCode: 'ORD',
      recordType: 'MENU_ITEM',
      parentRecordId: `${prefix}-category-food`,
      status: 'ACTIVE',
      title: 'Tamalitos de chipilín',
      payload: { price: 32, available: true, description: 'Receta tradicional, recién preparados.' },
      capacity: 30,
      currentCount: 0,
      createdAt,
    },
    {
      id: `${prefix}-item-limonada`,
      eventId: event.id,
      moduleCode: 'ORD',
      recordType: 'MENU_ITEM',
      parentRecordId: `${prefix}-category-drink`,
      status: 'ACTIVE',
      title: 'Limonada con hierbabuena',
      payload: { price: 18, available: true, description: 'Preparada al momento.' },
      capacity: 50,
      currentCount: 0,
      createdAt,
    },
  ]
})

let demoModuleActions: ModuleAction[] = []

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
  await clearOfflinePasses()

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

async function clearOfflinePasses() {
  await sessionStorage.remove(
    OFFLINE_PASSES_KEY,
  )
}

async function clearLocalSession() {
  accessToken = null
  clearReadCache()

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
    sessionStorage.remove(OFFLINE_PASSES_KEY),
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
  const controller = new AbortController()
  const upstreamSignal = init?.signal
  let timedOut = false
  const abortFromCaller = () => controller.abort()

  if (upstreamSignal?.aborted) {
    controller.abort()
  } else {
    upstreamSignal?.addEventListener(
      'abort',
      abortFromCaller,
      { once: true },
    )
  }

  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, API_REQUEST_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch {
    if (timedOut) {
      throw new Error(
        'La solicitud tardó más de 15 segundos. Revisa tu conexión e inténtalo de nuevo.',
      )
    }

    if (upstreamSignal?.aborted) {
      throw new Error('La solicitud fue cancelada.')
    }

    throw new Error(
      'No se pudo conectar con EventFlow. Verifica que la API esté encendida y que EXPO_PUBLIC_API_URL sea correcta.',
    )
  } finally {
    clearTimeout(timeout)
    upstreamSignal?.removeEventListener(
      'abort',
      abortFromCaller,
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

type ApiProfile = {
  id: string
  name: string
  email: string
  phoneNumber?: string | null
  status: string
  roles?: string[]
}

function mapApiProfile(value: unknown): AuthUser {
  const profile = asRecord(value) as ApiProfile
  const status = profile.status === 'PENDING_VERIFICATION'
    ? 'PENDING'
    : profile.status === 'DELETION_PENDING'
      ? 'ACTIVE'
      : profile.status

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phoneNumber ?? '',
    roles: profile.roles ?? [],
    status: status as AuthUser['status'],
    provider: 'password',
  }
}

type ApiGuestExperience = {
  invitation: {
    id: string
    eventId: string
    status: string
    allowedCapacity: number
    companions: string[]
    qrPayload?: string | null
    checkedIn?: number
  }
  event: {
    id: string
    name: string
    startsAt: string
    location?: string | null
    reentryAllowed?: boolean
  }
}

type ApiAgendaItem = {
  id: string
  eventId: string
  title: string
  description?: string | null
  startsAt: string
  endsAt: string
  zone?: string | null
  responsible?: string | null
  status?: string
}

type ApiEvent = {
  id: string
  name: string
  type: string
  startsAt: string
  location?: string | null
  reentryAllowed?: boolean
}

function mapAgenda(
  items: ApiAgendaItem[],
  moments: { now: ApiAgendaItem | null; next: ApiAgendaItem | null },
  eventId: string,
): EventAgenda {
  const currentId = moments.now?.id
  const nextId = moments.next?.id
  const now = Date.now()
  const activities: EventAgendaActivity[] = items
    .filter(item => item.status !== 'CANCELLED')
    .map((item): EventAgendaActivity => ({
      id: item.id,
      eventId: item.eventId,
      title: item.title,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      location: item.zone ?? undefined,
      detail: item.description ?? item.responsible ?? undefined,
      status: item.id === currentId
        ? 'NOW'
        : item.id === nextId || new Date(item.startsAt).getTime() > now
          ? 'UPCOMING'
          : 'FINISHED',
    }))

  return {
    eventId,
    current: activities.find(item => item.id === currentId) ?? null,
    next: activities.find(item => item.id === nextId) ?? null,
    activities,
  }
}

type ApiTicketOrder = {
  eventId: string
  tickets: Array<{
    id: string
    typeName: string
    status: string
    checkedIn: boolean
    qrPayload?: string | null
  }>
}

type ApiNotification = {
  id: string
  eventId?: string | null
  title: string
  body: string
  createdAt: string
  audienceType: string
  readAt?: string | null
}

function mapRsvp(experience: ApiGuestExperience): EventRSVP {
  const { invitation } = experience
  return {
    eventId: invitation.eventId,
    status: invitation.status === 'ACCEPTED'
      ? 'CONFIRMED'
      : invitation.status === 'DECLINED'
        ? 'DECLINED'
        : 'PENDING',
    companions: invitation.companions?.length ?? 0,
    maxCompanions: Math.max(0, invitation.allowedCapacity - 1),
  }
}

function mapNotification(
  value: ApiNotification,
  source: 'PERSONAL' | 'EVENT' = 'PERSONAL',
): NotificationItem {
  const segmented = value.audienceType !== 'ALL'
  return {
    id: value.id,
    title: value.title,
    message: value.body,
    createdAt: value.createdAt,
    icon: 'bell',
    unread: !value.readAt,
    kind: segmented ? 'SEGMENTED' : 'GENERAL',
    audience: value.audienceType,
    eventId: value.eventId ?? undefined,
    source,
  }
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
  authenticated = true,
): Promise<T> {
  const response =
    await fetchApi(
      `${BASE}${path}`,
      {
        method,

        headers: {
          'Content-Type':
            'application/json',

          ...(authenticated && accessToken
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
        authenticated,
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

function apiRoot() {
  return BASE.replace(/\/api\/?$/, '')
}

async function currentAccessToken() {
  if (!accessToken) accessToken = await sessionStorage.get('accessToken')
  return accessToken
}

async function authorizedAssetHeaders() {
  const token = await currentAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : undefined
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
  } catch (error) {
    // Keep the signed-in shell available during an outage so the cached digital pass can still be opened.
    const message = (error as Error).message ?? ''
    if (
      accessToken &&
      (message.includes('No se pudo conectar') ||
        message.includes('tardó más de 15 segundos'))
    ) {
      return true
    }
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

  clearReadCache()
  await clearOfflinePasses()
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

  const response = await realRequest<{
    message?: string
    developmentToken?: string | null
  }>(
    AUTH_ENDPOINTS.register,
    'POST',
    input,
    false,
  )

  return {
    status: 'PENDING',
    message: response.message ?? 'Cuenta creada. Revisa el enlace de activación.',
  }
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

  const response = await realRequest<{
    message?: string
  }>(
    AUTH_ENDPOINTS.verifyEmail,
    'POST',
    {
      token,
    },
    false,
  )

  return {
    status: 'ACTIVE' as const,
    message: response.message,
  }
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
    {
      token: input.token,
      password: input.newPassword,
    },
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
  googleProfile?: { email: string; name?: string },
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

  let result: AuthSession & {
    userId: string
    name: string
    email: string
    roles: string[]
    profileComplete: boolean
  }

  try {
    result = await realRequest<typeof result>(
      AUTH_ENDPOINTS.google,
      'POST',
      { idToken },
      false,
    )
  } catch (error) {
    const message = (error as Error).message
    if (!message.toLowerCase().includes('teléfono válido')) {
      throw error
    }

    return {
      status: 'PROFILE_REQUIRED',
      registrationToken: idToken,
      email: googleProfile?.email ?? '',
      name: googleProfile?.name,
    }
  }

  if (!result.profileComplete) {
    return {
      status: 'PROFILE_REQUIRED',
      registrationToken: idToken,
      email: result.email,
      name: result.name,
    }
  }

  await clearOfflinePasses()
  await saveTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  })

  return {
    status: 'AUTHENTICATED',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.userId,
      name: result.name,
      email: result.email,
      phone: '',
      roles: result.roles,
      status: 'ACTIVE',
      provider: 'google',
    },
  }
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
      {
        idToken: input.registrationToken,
        phoneNumber: input.phone,
        acceptedTerms: input.acceptedTerms,
      },
      false,
    )

  await clearOfflinePasses()
  await saveTokens({
    accessToken:
      result.accessToken,
    refreshToken:
      result.refreshToken,
  })

  await realRequest<ApiProfile>(
    PROFILE_ENDPOINTS.me,
    'PATCH',
    {
      name: input.name,
      phoneNumber: input.phone,
    },
  )

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

  return mapApiProfile(await realRequest<ApiProfile>(
    AUTH_ENDPOINTS.me,
    'GET',
  ))
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

  return mapApiProfile(await realRequest<ApiProfile>(
    PROFILE_ENDPOINTS.me,
    'PATCH',
    {
      name: input.name,
      phoneNumber: input.phone,
    },
  ))
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
    'PUT',
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

export async function getEvents(forceRefresh = false) {
  if (DEMO_MODE) {
    return request<EventItem[]>(EVENT_ENDPOINTS.events, 'GET')
  }

  return cachedRead('events', async () => {
    const events = await realRequest<ApiEvent[]>(EVENT_ENDPOINTS.events, 'GET')
    return events.map(event => ({
      ...event,
      location: event.location ?? '',
    }))
  }, forceRefresh)
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

export async function getPublicInvitationExperience(token: string) {
  if (DEMO_MODE) {
    throw new Error('Abre el enlace de invitación con la configuración conectada a la API real.')
  }
  const safeToken = encodeURIComponent(token)
  return realRequest<PublicInvitationExperience>(
    `/invitations/access/${safeToken}/experience`,
    'GET',
    undefined,
    false,
    false,
  )
}

export async function respondToPublicInvitation(
  token: string,
  accepted: boolean,
  companions: string[],
) {
  if (DEMO_MODE) {
    throw new Error('El RSVP de enlaces de invitación requiere la conexión a la API real.')
  }
  return realRequest<PublicInvitationExperience['invitation']>(
    `/invitations/access/${encodeURIComponent(token)}/rsvp`,
    'POST',
    { accepted, companions },
    false,
    false,
  )
}

export async function linkPublicInvitation(token: string) {
  if (DEMO_MODE) {
    throw new Error('Vincular una invitación requiere iniciar sesión en la API real.')
  }
  return realRequest<PublicInvitationExperience['invitation']>(
    `/invitations/access/${encodeURIComponent(token)}/link`,
    'POST',
  )
}

export async function getModuleRecords(
  eventId: string,
  moduleCode: string,
  recordType: string,
) {
  const module = moduleCode.toUpperCase()
  const type = recordType.toUpperCase()

  if (DEMO_MODE) {
    return demoModuleRecords
      .filter(record =>
        record.eventId === eventId &&
        record.moduleCode === module &&
        record.recordType === type &&
        record.status !== 'ARCHIVED',
      )
      .map(record => JSON.parse(JSON.stringify(record)) as ModuleRecord)
  }

  return realRequest<ModuleRecord[]>(
    `/events/${eventId}/module-data/${module}/${type}`,
    'GET',
  )
}

export async function getModuleActionHistory(
  eventId: string,
  recordId: string,
) {
  if (DEMO_MODE) {
    return demoModuleActions
      .filter(action => action.recordId === recordId)
      .map(action => ({ ...action, payload: { ...action.payload } }))
  }

  return realRequest<ModuleAction[]>(
    `/events/${eventId}/module-data/records/${recordId}/actions`,
    'GET',
  )
}

export async function submitModuleAction(
  eventId: string,
  recordId: string,
  input: {
    action: string
    payload?: Record<string, unknown>
    quantity?: number
  },
) {
  if (DEMO_MODE) {
    const record = demoModuleRecords.find(item =>
      item.eventId === eventId && item.id === recordId,
    )
    if (!record || record.status !== 'ACTIVE') {
      throw new Error('Este registro ya no está disponible.')
    }

    const action = input.action.toUpperCase()
    const quantity = input.quantity ?? 1
    const history = demoModuleActions.filter(item => item.recordId === recordId)
    const joins = history.filter(item => item.action === 'JOIN').length
    const leaves = history.filter(item => item.action === 'LEAVE').length
    const reservations = history.filter(item => item.action === 'RESERVE').length
    const cancellations = history.filter(item => item.action === 'CANCEL').length
    const priorVotes = history.filter(item => ['VOTE', 'ANSWER'].includes(item.action))
    const multiplePollVotes = record.recordType === 'POLL' && record.payload.allowMultiple === true

    if (action === 'JOIN' && joins > leaves) {
      throw new Error('Ya estás en esta cola.')
    }
    if (action === 'LEAVE' && joins <= leaves) {
      throw new Error('No tienes un turno activo en esta cola.')
    }
    if (action === 'RESERVE' && reservations > cancellations) {
      throw new Error('Ya tienes una reserva para esta actividad.')
    }
    if (action === 'CANCEL' && reservations <= cancellations) {
      throw new Error('No tienes una reserva activa que cancelar.')
    }
    if (['VOTE', 'ANSWER'].includes(action) && priorVotes.length > 0 && !multiplePollVotes) {
      throw new Error('Tu respuesta ya fue registrada.')
    }
    if (action === 'VOTE' && multiplePollVotes &&
      priorVotes.some(item => item.payload.optionId === input.payload?.optionId)) {
      throw new Error('Ya votaste por esta opción.')
    }
    if (['JOIN', 'RESERVE'].includes(action) &&
      record.capacity != null && record.currentCount + quantity > record.capacity) {
      throw new Error('Ya no hay cupo disponible.')
    }

    if (['JOIN', 'RESERVE'].includes(action)) record.currentCount += quantity
    if (['LEAVE', 'CANCEL'].includes(action)) record.currentCount = Math.max(0, record.currentCount - quantity)

    const saved: ModuleAction = {
      id: `demo-action-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      recordId,
      actorUserId: 'demo-user',
      action,
      payload: input.payload ?? {},
      createdAt: new Date().toISOString(),
      quantity,
    }
    demoModuleActions.push(saved)
    return { ...saved, payload: { ...saved.payload } }
  }

  return realRequest<ModuleAction>(
    `/events/${eventId}/module-data/records/${recordId}/actions`,
    'POST',
    { ...input, action: input.action.toUpperCase() },
  )
}

export async function getQueuePosition(
  eventId: string,
  recordId: string,
) {
  if (DEMO_MODE) {
    const active = new Map<string, number>()
    demoModuleActions
      .filter(action => action.recordId === recordId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach(action => {
        const actorId = action.actorUserId ?? 'demo-user'
        if (action.action === 'JOIN' && !active.has(actorId)) active.set(actorId, active.size + 1)
        if (action.action === 'LEAVE') active.delete(actorId)
      })
    const position = [...active.keys()].indexOf('demo-user')
    return {
      recordId,
      position: position >= 0 ? position + 1 : null,
      peopleAhead: position >= 0 ? position : 0,
      waiting: active.size,
    } satisfies QueuePosition
  }

  return realRequest<QueuePosition>(
    `/events/${eventId}/module-data/queues/${recordId}/position`,
    'GET',
  )
}

export async function getNetworkingSuggestions(
  eventId: string,
) {
  if (DEMO_MODE) return [] as ModuleRecord[]

  return realRequest<ModuleRecord[]>(
    `/events/${eventId}/module-data/networking/suggestions`,
    'GET',
  )
}

export async function createModuleRecord(
  eventId: string,
  moduleCode: string,
  recordType: string,
  input: {
    title?: string
    payload?: Record<string, unknown>
    status?: string
    capacity?: number
    startsAt?: string
    endsAt?: string
    parentRecordId?: string
  },
) {
  const module = moduleCode.toUpperCase()
  const type = recordType.toUpperCase()

  if (DEMO_MODE) {
    let payload = input.payload ?? {}
    let status = input.status ?? 'ACTIVE'
    if (module === 'ORD' && type === 'ORDER') {
      const items = (payload.items as Array<{ itemId: string; quantity: number }> | undefined) ?? []
      const total = items.reduce((sum, item) => {
        const menuItem = demoModuleRecords.find(record => record.id === item.itemId)
        const price = Number(menuItem?.payload.price ?? 0)
        return sum + price * item.quantity
      }, 0)
      payload = { ...payload, total }
      status = 'PENDING'
      items.forEach(item => {
        const menuItem = demoModuleRecords.find(record => record.id === item.itemId)
        if (menuItem) menuItem.currentCount += item.quantity
      })
    }

    const record: ModuleRecord = {
      id: `demo-record-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      eventId,
      moduleCode: module,
      recordType: type,
      ownerUserId: 'demo-user',
      parentRecordId: input.parentRecordId,
      status,
      title: input.title,
      payload,
      capacity: input.capacity,
      currentCount: 0,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      createdAt: new Date().toISOString(),
    }
    demoModuleRecords.unshift(record)
    return JSON.parse(JSON.stringify(record)) as ModuleRecord
  }

  return realRequest<ModuleRecord>(
    `/events/${eventId}/module-data/${module}/${type}`,
    'POST',
    input,
  )
}

export async function updateModuleRecord(
  eventId: string,
  recordId: string,
  input: { status?: string; title?: string; payload?: Record<string, unknown> },
) {
  if (DEMO_MODE) {
    const record = demoModuleRecords.find(item => item.eventId === eventId && item.id === recordId)
    if (!record) throw new Error('No se encontró el registro.')
    if (record.moduleCode === 'ORD' && record.recordType === 'ORDER' && record.status === 'PENDING' && input.status === 'CANCELLED') {
      const items = (record.payload.items as Array<{ itemId: string; quantity: number }> | undefined) ?? []
      items.forEach(item => {
        const menuItem = demoModuleRecords.find(candidate => candidate.id === item.itemId)
        if (menuItem) menuItem.currentCount = Math.max(0, menuItem.currentCount - item.quantity)
      })
      record.status = 'CANCELLED'
      return JSON.parse(JSON.stringify(record)) as ModuleRecord
    }
    if (record.moduleCode === 'NET' && record.recordType === 'PROFILE' && input.payload) {
      record.payload = { ...record.payload, ...input.payload }
      return JSON.parse(JSON.stringify(record)) as ModuleRecord
    }
    throw new Error('No se puede cambiar el estado de este registro.')
  }

  return realRequest<ModuleRecord>(
    `/events/${eventId}/module-data/records/${recordId}`,
    'PATCH',
    input,
  )
}

export async function getEventAgenda(
  eventId: string,
) {
  if (DEMO_MODE) {
    return request<EventAgenda>(EVENT_ENDPOINTS.agenda(eventId), 'GET')
  }

  const [items, moments] = await Promise.all([
    realRequest<ApiAgendaItem[]>(`/events/${eventId}/agenda`, 'GET'),
    realRequest<{ now: ApiAgendaItem | null; next: ApiAgendaItem | null }>(
      `/events/${eventId}/agenda/now-next`,
      'GET',
    ),
  ])
  return mapAgenda(items, moments, eventId)
}

export async function getMyAgenda(eventId: string) {
  if (DEMO_MODE) {
    const agenda = await getEventAgenda(eventId)
    return agenda.activities.filter(item => demoAgendaFavorites.has(item.id))
  }
  const items = await realRequest<ApiAgendaItem[]>(`/events/${eventId}/agenda/mine`, 'GET')
  return items.map(item => ({
    id: item.id,
    eventId: item.eventId,
    title: item.title,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    location: item.zone ?? undefined,
    detail: item.description ?? item.responsible ?? undefined,
    status: new Date(item.startsAt).getTime() > Date.now() ? 'UPCOMING' as const : 'FINISHED' as const,
  }))
}

export async function setAgendaFavorite(eventId: string, activityId: string, enabled: boolean) {
  if (DEMO_MODE) {
    if (enabled) demoAgendaFavorites.add(activityId)
    else demoAgendaFavorites.delete(activityId)
    return
  }
  return realRequest<void>(`/events/${eventId}/agenda/${activityId}/favorite?enabled=${enabled}`, 'PUT')
}

export async function getEventPermissions(eventId: string) {
  if (DEMO_MODE) return { eventId, owner: true, permissions: ['ALL'] } satisfies EventPermissions
  return realRequest<EventPermissions>(`/events/${eventId}/permissions`, 'GET')
}

export async function getEventInvitations(eventId: string) {
  if (DEMO_MODE) {
    return demoPassState.filter(pass => pass.eventId === eventId).map((pass, index) => ({
      id: pass.id,
      eventId,
      guestName: `Invitado ${index + 1}`,
      status: pass.status === 'ACTIVE' ? 'ACCEPTED' : pass.status,
      allowedCapacity: 1,
      companions: [],
      checkedIn: pass.accessStatus === 'CHECKED_IN' ? 1 : 0,
      qrPayload: pass.qrValue,
    }))
  }
  return realRequest<EventInvitation[]>(`/events/${eventId}/invitations`, 'GET')
}

export async function scanEventPass(eventId: string, qrPayload: string, direction: 'check-in' | 'check-out') {
  if (DEMO_MODE) {
    const pass = demoPassState.find(item => item.eventId === eventId && item.qrValue === qrPayload)
    if (!pass) throw new Error('El código no pertenece a un pase de este evento.')
    if (direction === 'check-in') {
      if (pass.accessStatus === 'CHECKED_IN') throw new Error('Este pase ya registró su ingreso.')
      pass.accessStatus = 'CHECKED_IN'
    } else {
      if (pass.accessStatus !== 'CHECKED_IN') throw new Error('Este pase no aparece dentro del evento.')
      pass.accessStatus = 'CHECKED_OUT'
    }
    return pass
  }
  return realRequest<EventInvitation>(`/events/${eventId}/${direction}`, 'POST', { qrPayload, quantity: 1 })
}

export async function setInvitationAttendance(eventId: string, invitationId: string, direction: 'check-in' | 'check-out', memberIndex?: number) {
  if (DEMO_MODE) {
    const pass = demoPassState.find(item => item.id === invitationId || item.id === `invitation:${invitationId}`)
    if (!pass) throw new Error('No se encontró a esta persona.')
    if (direction === 'check-in') {
      if (pass.accessStatus === 'CHECKED_IN') throw new Error('Esta persona ya registró su ingreso.')
      pass.accessStatus = 'CHECKED_IN'
    } else {
      if (pass.accessStatus !== 'CHECKED_IN') throw new Error('Esta persona no aparece dentro del evento.')
      pass.accessStatus = 'CHECKED_OUT'
    }
    return pass
  }
  return realRequest<EventInvitation>(`/events/${eventId}/invitations/${invitationId}/${direction}`, 'POST', { quantity: 1, ...(memberIndex === undefined ? {} : { memberIndex }) })
}

export async function getEventAssistance(eventId: string) {
  if (DEMO_MODE) return demoAssistance.filter(item => item.eventId === eventId)
  return realRequest<AssistanceRequest[]>(`/events/${eventId}/assistance`, 'GET')
}

export async function createEventAssistance(
  eventId: string,
  input: { category: string; details?: string; location?: string; invitationId?: string },
  token?: string,
) {
  if (DEMO_MODE) {
    const saved: AssistanceRequest = {
      id: `demo-help-${Date.now()}`, eventId, category: input.category,
      details: input.details, location: input.location, priority: /FIRST_AID|EMERGENCY|PRIMEROS/i.test(input.category) ? 100 : 0,
      status: 'RECEIVED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    demoAssistance = [saved, ...demoAssistance]
    return saved
  }
  const path = token
    ? `/invitations/access/${encodeURIComponent(token)}/assistance`
    : `/events/${eventId}/assistance`
  return realRequest<AssistanceRequest>(path, 'POST', input, !token, !token)
}

export async function updateEventAssistance(
  eventId: string,
  requestId: string,
  input: { status: AssistanceRequest['status']; assignedUserId?: string },
) {
  if (DEMO_MODE) {
    const request = demoAssistance.find(item => item.id === requestId)
    if (!request) throw new Error('No se encontró la solicitud de ayuda.')
    Object.assign(request, input, { updatedAt: new Date().toISOString() })
    return request
  }
  return realRequest<AssistanceRequest>(`/events/${eventId}/assistance/${requestId}`, 'PATCH', input)
}

export async function searchEventMap(eventId: string, query: string) {
  const search = query.trim()
  if (search.length < 2) return [] as MapSearchResult[]
  if (DEMO_MODE) {
    const records = await Promise.all(['ZONE', 'POINT'].map(type => getModuleRecords(eventId, 'MAP', type)))
    const term = search.toLocaleLowerCase()
    return records.flat().filter(item => `${item.title ?? ''} ${item.payload.description ?? ''}`.toLocaleLowerCase().includes(term))
      .map(item => ({ id: item.id, moduleCode: item.moduleCode, type: item.recordType, title: item.title, payload: item.payload }))
  }
  return realRequest<MapSearchResult[]>(`/events/${eventId}/module-data/map/search?q=${encodeURIComponent(search)}`, 'GET')
}

export async function getMyMapLocation(eventId: string) {
  if (DEMO_MODE) return [] as MapSearchResult[]
  return realRequest<MapSearchResult[]>(`/events/${eventId}/module-data/map/my-location`, 'GET')
}

export async function getEventFiles(eventId: string) {
  if (DEMO_MODE) return [] as EventFile[]
  return realRequest<EventFile[]>(`/events/${eventId}/files?module=GAL`, 'GET')
}

export async function getEventFileImageSource(file: EventFile) {
  const headers = await authorizedAssetHeaders()
  return { uri: `${apiRoot()}${file.downloadUrl}`, headers }
}

export async function uploadEventPhoto(eventId: string, asset: { uri: string; fileName?: string | null; mimeType?: string | null }, official = false) {
  if (DEMO_MODE) throw new Error('La galería compartida necesita la API conectada y el almacenamiento del evento configurado.')
  const path = `/events/${eventId}/files?module=GAL${official ? '&official=true' : ''}`
  const send = async (token: string | null) => {
    const form = new FormData()
    const name = asset.fileName || `eventflow-${Date.now()}.jpg`
    if (Platform.OS === 'web') {
      const image = await fetch(asset.uri)
      form.append('file', await image.blob(), name)
    } else {
      form.append('file', { uri: asset.uri, name, type: asset.mimeType || 'image/jpeg' } as unknown as Blob)
    }
    return fetchApi(`${BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    })
  }
  let token = await currentAccessToken()
  let response = await send(token)
  if (response.status === 401 && await refreshSession()) {
    token = await currentAccessToken()
    response = await send(token)
  }
  if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo publicar la foto.'))
  return response.json() as Promise<EventFile>
}

export async function moderateEventPhoto(eventId: string, fileId: string, status: 'ACTIVE' | 'REJECTED') {
  if (DEMO_MODE) throw new Error('La moderación de fotos necesita la API conectada.')
  return realRequest<EventFile>(`/events/${eventId}/files/${fileId}/moderation`, 'PATCH', { status })
}

export async function getEventRsvp(
  eventId: string,
) {
  if (DEMO_MODE) {
    return request<EventRSVP>(
      EVENT_ENDPOINTS.rsvp(eventId),
      'GET',
    )
  }

  const invitations = await getMyGuestExperiences()
  const experience = invitations.find(item => item.event.id === eventId)
  if (!experience) {
    throw new Error('No hay una invitación vinculada a este evento.')
  }
  return mapRsvp(experience)
}

async function getMyGuestExperiences(forceRefresh = false) {
  return cachedRead(
    'guest-experiences',
    () => realRequest<ApiGuestExperience[]>('/invitations/mine', 'GET'),
    forceRefresh,
  )
}

export async function getRsvps(forceRefresh = false) {
  if (DEMO_MODE) {
    return request<EventRSVP[]>(EVENT_ENDPOINTS.rsvps, 'GET')
  }

  const invitations = await getMyGuestExperiences(forceRefresh)
  return invitations.map(mapRsvp)
}

export async function updateEventRsvp(
  eventId: string,
  input: UpdateEventRsvpInput,
) {
  if (DEMO_MODE) {
    return request<EventRSVP>(
      EVENT_ENDPOINTS.rsvp(eventId),
      'PATCH',
      input,
    )
  }

  const invitations = await getMyGuestExperiences(true)
  const experience = invitations.find(item => item.event.id === eventId)
  if (!experience) {
    throw new Error('No hay una invitación vinculada a este evento.')
  }

  const companions = input.status === 'DECLINED'
    ? []
    : experience.invitation.companions.slice(0, input.companions)
  while (companions.length < input.companions) {
    companions.push(`Acompañante ${companions.length + 1}`)
  }

  const updated = await realRequest<ApiGuestExperience['invitation']>(
    `/invitations/${experience.invitation.id}/rsvp`,
    'POST',
    { accepted: input.status === 'CONFIRMED', companions },
  )
  clearReadCache('guest-experiences', 'passes')
  return mapRsvp({ ...experience, invitation: updated })
}

export async function getEventCapacity(
  eventId: string,
) {
  if (DEMO_MODE) {
    return request<EventCapacity>(EVENT_ENDPOINTS.capacity(eventId), 'GET')
  }

  const event = await realRequest<{
    estimatedCapacity?: number | null
  }>(`/events/${eventId}`, 'GET')
  return {
    eventId,
    capacity: event.estimatedCapacity ?? undefined,
  }
}

export async function getCapacities() {
  if (DEMO_MODE) {
    return request<EventCapacity[]>(EVENT_ENDPOINTS.capacities, 'GET')
  }

  const events = await realRequest<Array<{
    id: string
    estimatedCapacity?: number | null
  }>>('/events', 'GET')
  return events.map(event => ({
    eventId: event.id,
    capacity: event.estimatedCapacity ?? undefined,
  }))
}

export async function getPasses(forceRefresh = false) {
  if (DEMO_MODE) {
    return request<EventPass[]>(EVENT_ENDPOINTS.passes, 'GET')
  }

  return cachedRead('passes', async () => {
    try {
      const [invitations, orders, events] = await Promise.all([
        getMyGuestExperiences(forceRefresh),
        realRequest<ApiTicketOrder[]>('/ticket-orders/mine', 'GET'),
        getEvents(forceRefresh),
      ])
      const eventById = new Map<string, EventItem>()
      events.forEach(event => eventById.set(event.id, event))

      const invitationPasses = invitations.map((experience): EventPass => {
        const { invitation, event } = experience
        const eventDetails = eventById.get(event.id)
        return {
          id: `invitation:${invitation.id}`,
          eventId: event.id,
          eventName: event.name,
          startsAt: event.startsAt,
          location: event.location ?? '',
          passType: 'Invitación',
          status: invitation.status === 'ACCEPTED'
            ? 'ACTIVE'
            : invitation.status === 'DECLINED'
              ? 'DECLINED'
              : 'PENDING',
          qrValue: invitation.qrPayload ?? undefined,
          accessStatus: invitation.checkedIn && invitation.checkedIn > 0
            ? 'CHECKED_IN'
            : 'OUTSIDE',
          reentryAllowed: eventDetails?.reentryAllowed,
        }
      })

      const ticketPasses = orders.flatMap((order): EventPass[] => {
        const event = eventById.get(order.eventId)
        if (!event) return []
        return order.tickets.map((ticket): EventPass => ({
          id: `ticket:${ticket.id}`,
          eventId: order.eventId,
          eventName: event.name,
          startsAt: event.startsAt,
          location: event.location ?? '',
          passType: ticket.typeName,
          status: ticket.status === 'ACTIVE'
            ? 'ACTIVE'
            : ticket.status === 'CANCELLED'
              ? 'REVOKED'
              : 'USED',
          qrValue: ticket.qrPayload ?? undefined,
          accessStatus: ticket.checkedIn ? 'CHECKED_IN' : 'OUTSIDE',
          reentryAllowed: event.reentryAllowed,
        }))
      })

      const passes = [...invitationPasses, ...ticketPasses]
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      await sessionStorage.set(OFFLINE_PASSES_KEY, JSON.stringify(passes)).catch(() => undefined)
      return passes
    } catch (error) {
      const message = (error as Error).message || ''
      if (
        !message.includes('No se pudo conectar') &&
        !message.includes('tardó más de 15 segundos')
      ) {
        throw error
      }
      const raw = await sessionStorage.get(OFFLINE_PASSES_KEY)
      if (!raw) throw error
      try {
        const cached = JSON.parse(raw)
        if (!Array.isArray(cached)) throw error
        return cached.filter(item => item && typeof item.id === 'string' && typeof item.eventId === 'string')
          .map((item: EventPass) => ({ ...item, offlineCopy: true }))
      } catch {
        throw error
      }
    }
  }, forceRefresh)
}

export async function getPass(
  passId: string,
) {
  if (DEMO_MODE) {
    return request<EventPass>(EVENT_ENDPOINTS.pass(passId), 'GET')
  }

  const pass = (await getPasses()).find(item => item.id === passId)
  if (!pass) throw new Error('No se encontró el pase asociado a tu cuenta.')
  return pass
}

/*
 * =====================================================
 * NOTIFICACIONES
 * =====================================================
 */

export async function getNotifications(forceRefresh = false) {
  if (DEMO_MODE) {
    return demoNotificationState.map(
      item => ({
        ...item,
      }),
    )
  }

  return cachedRead('notifications', async () => {
    const [personal, events] = await Promise.all([
      realRequest<ApiNotification[]>(NOTIFICATION_ENDPOINTS.list, 'GET'),
      getEvents(),
    ])
    const eventNotifications = await Promise.all(events.map(async event => {
      try {
        return await realRequest<ApiNotification[]>(
          `/events/${event.id}/notifications`,
          'GET',
        )
      } catch {
        return []
      }
    }))
    const unique = new Map<string, NotificationItem>()
    personal.forEach(item => unique.set(item.id, mapNotification(item, 'PERSONAL')))
    eventNotifications.flat().forEach(item => {
      unique.set(item.id, mapNotification(item, 'EVENT'))
    })
    return [...unique.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, forceRefresh)
}

export async function markNotificationRead(
  notificationId: string,
  eventId?: string,
  source?: 'PERSONAL' | 'EVENT',
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

  const path = source === 'EVENT' && eventId
    ? NOTIFICATION_ENDPOINTS.readEvent(eventId, notificationId)
    : NOTIFICATION_ENDPOINTS.readPersonal(notificationId)
  const notification = await realRequest<ApiNotification>(
    path,
    'POST',
  )
  clearReadCache('notifications')
  return mapNotification(notification, source ?? 'PERSONAL')
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

  const unread = (await getNotifications()).filter(item => item.unread)
  const personal = unread.filter(item => item.source !== 'EVENT')
  const eventIds = [...new Set(unread
    .filter(item => item.source === 'EVENT' && item.eventId)
    .map(item => item.eventId as string))]
  await Promise.all([
    ...personal.map(item => realRequest<void>(
      NOTIFICATION_ENDPOINTS.readPersonal(item.id),
      'POST',
    )),
    ...eventIds.map(eventId => realRequest<{ updated: number }>(
      NOTIFICATION_ENDPOINTS.readAllEvent(eventId),
      'POST',
    )),
  ])
  clearReadCache('notifications')
  return { success: true }
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

