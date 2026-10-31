import type {
  EventCapacity,
  EventItem,
  EventModule,
  EventPass,
  EventRSVP,
} from '../types/events'

export const DEMO_EMAIL =
  'ana.organizadora@eventflow.demo'

export const DEMO_PASSWORD =
  'EventFlowDemo1!'

export const demoEvents: EventItem[] = [
  {
    id: 'demo-event-1',
    name: 'Cumbre Creativa 2026',
    type: 'CONFERENCE',
    startsAt: '2026-10-18T09:00:00-06:00',
    location: 'Centro Cultural Miguel Ángel Asturias',
  },
  {
    id: 'demo-event-2',
    name: 'Noche de Sabores',
    type: 'GALA',
    startsAt: '2026-11-07T18:30:00-06:00',
    location: 'Casa Santo Domingo',
  },
]

export const demoModules: EventModule[] = [
  {
    code: 'agenda',
    name: 'Agenda',
    category: 'Planificación',
    featured: true,
    order: 1,
  },
  {
    code: 'access',
    name: 'Accesos',
    category: 'Operación',
    featured: true,
    order: 2,
  },
  {
    code: 'news',
    name: 'Novedades',
    category: 'Comunicación',
    featured: false,
    order: 3,
  },
  {
    code: 'map',
    name: 'Mapa del evento',
    category: 'Experiencia',
    featured: false,
    order: 4,
  },
]

export const demoRsvps: EventRSVP[] = [
  {
    eventId: 'demo-event-1',
    status: 'PENDING',
    companions: 0,
    maxCompanions: 1,
  },
  {
    eventId: 'demo-event-2',
    status: 'PENDING',
    companions: 0,
    maxCompanions: 1,
  },
]

export const demoCapacities: EventCapacity[] = [
  {
    eventId: 'demo-event-1',
  },
  {
    eventId: 'demo-event-2',
  },
]

export const demoPasses: EventPass[] = [
  {
    id: 'demo-pass-1',
    eventId: 'demo-event-2',
    eventName: 'Noche de Sabores',
    startsAt: '2026-11-07T18:30:00-06:00',
    location: 'Casa Santo Domingo',
    passType: 'Invitado general',
    status: 'ACTIVE',
    accessStatus: 'OUTSIDE',
    reentryAllowed: true,
  },
]
