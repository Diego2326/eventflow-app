export type EventItem = {
  id: string
  name: string
  type: string
  startsAt: string
  location: string
}

export type EventModule = {
  code: string
  name: string
  category: string
  featured: boolean
  order: number
  description?: string
  enabled?: boolean
  configuration?: Record<string, unknown>
}

export type RSVPStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'

export type EventRSVP = {
  eventId: string
  status: RSVPStatus
  companions: number
  maxCompanions?: number
}

export type EventCapacity = {
  eventId: string
  capacity?: number
  confirmedGuests?: number
  availableSpots?: number
}

export type EventPassStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'DECLINED'
  | 'USED'
  | 'REVOKED'

export type EventAccessStatus =
  | 'OUTSIDE'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'

export type EventPass = {
  id: string
  eventId: string
  eventName: string
  startsAt: string
  location: string
  passType: string
  status: EventPassStatus
  qrValue?: string
  accessStatus?: EventAccessStatus
  reentryAllowed?: boolean
  checkedInAt?: string
  checkedOutAt?: string
  revokedAt?: string
  offlineCopy?: boolean
}

export type EventAgendaActivityStatus =
  | 'UPCOMING'
  | 'NOW'
  | 'FINISHED'

export type EventAgendaActivity = {
  id: string
  eventId: string
  title: string
  startsAt: string
  endsAt?: string
  location?: string
  detail?: string
  status?: EventAgendaActivityStatus
}

export type EventAgenda = {
  eventId: string
  current:
    | EventAgendaActivity
    | null
  next:
    | EventAgendaActivity
    | null
  activities: EventAgendaActivity[]
}

