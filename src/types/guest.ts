export type GuestInvitation = {
  id: string
  eventId: string
  guestName: string
  guestEmail?: string | null
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  allowedCapacity: number
  companions: string[]
  table?: string | null
  seat?: string | null
  sector?: string | null
  checkedIn: number
}

export type GuestEvent = {
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

export type GuestModule = {
  code: string
  name: string
  category: string
  description: string
  order: number
  featured: boolean
  configuration: Record<string, unknown>
}

export type AgendaItem = {
  id: string
  eventId: string
  title: string
  description?: string | null
  startsAt: string
  endsAt: string
  zone?: string | null
  responsible?: string | null
  status: string
}

export type GuestNotification = {
  id: string
  title: string
  body: string
  createdAt: string
}

export type GuestMapPoint = {
  id: string
  type: 'ZONE' | 'POINT'
  title?: string | null
  payload: Record<string, unknown>
}

export type GuestExperience = {
  invitation: GuestInvitation
  event: GuestEvent
  modules: GuestModule[]
  agenda: AgendaItem[]
  now?: AgendaItem | null
  next?: AgendaItem | null
  notifications: GuestNotification[]
  mapPoints: GuestMapPoint[]
}

export type AssistanceRequest = {
  id: string
  category: string
  details?: string | null
  location?: string | null
  status: string
  createdAt: string
}
