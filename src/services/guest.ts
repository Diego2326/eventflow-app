import { API_BASE, DEMO_MODE } from './api'
import { sessionStorage } from './sessionStorage'
import type { AssistanceRequest, GuestExperience, GuestInvitation } from '../types/guest'

const TOKEN_KEY = 'guestInvitationToken'

export const getGuestToken = () => sessionStorage.get(TOKEN_KEY)
export const saveGuestToken = (token: string) => sessionStorage.set(TOKEN_KEY, token.trim())
export const clearGuestToken = () => sessionStorage.remove(TOKEN_KEY)

async function guestFetch<T>(token: string, suffix = '', method = 'GET', body?: unknown): Promise<T> {
  if (DEMO_MODE) return demoGuestData(suffix, body) as T
  let response: Response
  try {
    response = await fetch(`${API_BASE}/invitations/access/${encodeURIComponent(token.trim())}${suffix}`, {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('No pudimos conectar con el evento. Revisa tu conexión.')
  }
  const text = await response.text()
  let payload: any
  try {
    payload = text ? JSON.parse(text) : undefined
  } catch {
    payload = undefined
  }
  if (!response.ok) throw new Error(payload?.error?.message ?? payload?.detail ?? payload?.title ?? 'No fue posible abrir la invitación.')
  return payload as T
}

export const loadGuestExperience = (token: string) => guestFetch<GuestExperience>(token, '/experience')
export const submitRsvp = (token: string, accepted: boolean, companions: string[]) => guestFetch<GuestInvitation>(token, '/rsvp', 'POST', { accepted, companions })
export const requestAssistance = (token: string, category: string, details: string, location: string) => guestFetch<AssistanceRequest>(token, '/assistance', 'POST', { category, details, location })

const demoExperience: GuestExperience = {
  invitation: { id: 'invite-demo', eventId: 'event-demo', guestName: 'Sofía Morales', guestEmail: 'sofia@example.com', status: 'ACCEPTED', allowedCapacity: 2, companions: ['Carlos Morales'], table: 'Mesa 8', seat: '12', sector: 'Jardín', checkedIn: 0 },
  event: { id: 'event-demo', name: 'Boda de Andrea y Mateo', type: 'WEDDING', description: 'Nos emociona compartir este día contigo.', startsAt: '2026-10-18T16:00:00-06:00', endsAt: '2026-10-19T01:00:00-06:00', timezone: 'America/Guatemala', location: 'Casa Santo Domingo, Antigua Guatemala', status: 'PUBLISHED' },
  modules: [
    { code: 'INV', name: 'Confirmación', category: 'Acceso', description: 'Confirma tu asistencia.', order: 1, featured: false, configuration: {} },
    { code: 'GST', name: 'Event Pass', category: 'Acceso', description: 'Tu pase digital.', order: 2, featured: true, configuration: {} },
    { code: 'CAL', name: 'Agenda', category: 'Organización', description: 'Consulta qué ocurre ahora.', order: 3, featured: true, configuration: {} },
    { code: 'MAP', name: 'Mapa', category: 'Organización', description: 'Ubica los espacios.', order: 4, featured: false, configuration: {} },
    { code: 'AST', name: 'Asistencia', category: 'Atención', description: 'Solicita ayuda al personal.', order: 5, featured: true, configuration: {} },
    { code: 'NOT', name: 'Avisos', category: 'Comunicación', description: 'Novedades del evento.', order: 6, featured: false, configuration: {} },
  ],
  agenda: [
    { id: 'a1', eventId: 'event-demo', title: 'Ceremonia', description: 'Inicio de la ceremonia', startsAt: '2026-10-18T16:00:00-06:00', endsAt: '2026-10-18T17:00:00-06:00', zone: 'Capilla', status: 'SCHEDULED' },
    { id: 'a2', eventId: 'event-demo', title: 'Recepción', startsAt: '2026-10-18T17:30:00-06:00', endsAt: '2026-10-18T20:00:00-06:00', zone: 'Jardín', status: 'SCHEDULED' },
  ],
  now: null,
  next: { id: 'a1', eventId: 'event-demo', title: 'Ceremonia', description: 'Inicio de la ceremonia', startsAt: '2026-10-18T16:00:00-06:00', endsAt: '2026-10-18T17:00:00-06:00', zone: 'Capilla', status: 'SCHEDULED' },
  notifications: [{ id: 'n1', title: '¡Bienvenidos!', body: 'La ceremonia inicia puntualmente a las 4:00 p. m.', createdAt: '2026-10-18T14:00:00-06:00' }],
  mapPoints: [{ id: 'm1', type: 'ZONE', title: 'Capilla', payload: { description: 'Ceremonia' } }, { id: 'm2', type: 'ZONE', title: 'Jardín', payload: { description: 'Recepción y Mesa 8' } }],
}

function demoGuestData(suffix: string, body?: unknown) {
  if (suffix === '/experience') return demoExperience
  if (suffix === '/rsvp') {
    const request = body as { accepted: boolean; companions: string[] }
    demoExperience.invitation = { ...demoExperience.invitation, status: request.accepted ? 'ACCEPTED' : 'DECLINED', companions: request.companions }
    return demoExperience.invitation
  }
  return { id: 'help-demo', category: 'GENERAL', status: 'RECEIVED', createdAt: new Date().toISOString() }
}
