import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { GlassOverlay } from '../../components/ui/GlassOverlay'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { getCurrentUser, getEventAssistance, getEventInvitations, getEventPermissions, setInvitationAttendance, updateEventAssistance } from '../../services/api'
import type { AssistanceRequest, EventInvitation } from '../../services/api'
import type { EventItem } from '../../types/events'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const SOFT = '#F0EDFF'
const MUTED = '#737D91'
const BORDER = '#E5E8EF'
const GREEN = '#249B68'
const RED = '#D64550'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })} · ${date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}`
}

function Header({ title, event, navigation }: { title: string; event: EventItem; navigation: any }) {
  return <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}><GlassOverlay style={styles.backGlass} /><Feather name="arrow-left" size={21} color={NAVY} /></Pressable>
    <View style={styles.headerCopy}><Text style={styles.headerTitle}>{title}</Text><Text style={styles.headerSubtitle} numberOfLines={1}>{event.name}</Text></View>
  </View>
}

export function StaffGuestsScreen({ route, navigation }: { route: any; navigation: any }) {
  const event: EventItem = route.params.event
  const insets = useSafeAreaInsets()
  const [guests, setGuests] = useState<EventInvitation[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [canCheckIn, setCanCheckIn] = useState(false)

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const [list, access] = await Promise.all([getEventInvitations(event.id), getEventPermissions(event.id)])
      setGuests(list)
      setCanCheckIn(access.owner || access.permissions.includes('ALL') || access.permissions.includes('CHECK_IN'))
    }
    catch (loadError) { setError((loadError as Error).message || 'No se pudo cargar la lista.') }
    finally { setLoading(false); setRefreshing(false) }
  }, [event.id])

  useEffect(() => { void load() }, [load])

  const filteredGuests = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return guests
    return guests.filter(guest => `${guest.guestName} ${guest.guestEmail ?? ''} ${guest.table ?? ''} ${guest.sector ?? ''} ${guest.seat ?? ''}`.toLocaleLowerCase().includes(term))
  }, [guests, search])

  async function attendance(guest: EventInvitation, direction: 'check-in' | 'check-out', memberIndex?: number) {
    setBusyId(guest.id)
    try { await setInvitationAttendance(event.id, guest.id, direction, memberIndex); await load(true) }
    catch (actionError) { setError((actionError as Error).message || 'No se pudo actualizar el acceso.') }
    finally { setBusyId('') }
  }

  const accepted = guests.filter(guest => guest.status === 'ACCEPTED').length
  const inside = guests.reduce((total, guest) => total + (guest.checkedIn ?? 0), 0)

  return <SafeAreaView style={styles.safeArea} edges={['top']}>
    <StatusBar style="dark" /><Header title="Lista de invitados" event={event} navigation={navigation} />
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={PURPLE} />} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled">
      <View style={styles.stats}><View style={styles.stat}><Text style={styles.statValue}>{accepted}</Text><Text style={styles.statLabel}>Confirmados</Text></View><View style={styles.statDivider} /><View style={styles.stat}><Text style={styles.statValue}>{inside}</Text><Text style={styles.statLabel}>Dentro ahora</Text></View><View style={styles.statDivider} /><View style={styles.stat}><Text style={styles.statValue}>{guests.length}</Text><Text style={styles.statLabel}>Invitaciones</Text></View></View>
      <View style={styles.searchBox}><Feather name="search" size={17} color={MUTED} /><TextInput value={search} onChangeText={setSearch} placeholder="Nombre, mesa o sector" placeholderTextColor="#9AA1AE" style={styles.searchInput} returnKeyType="search" /><Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setSearch('')}><Feather name="x-circle" size={16} color={MUTED} /></Pressable></View>
      {error ? <View style={styles.errorBox}><Feather name="alert-circle" size={17} color={RED} /><Text style={styles.errorText}>{error}</Text></View> : null}
      {loading ? <View style={styles.loading}><ActivityIndicator color={PURPLE} /><Text style={styles.muted}>Cargando invitados…</Text></View> : filteredGuests.map(guest => {
        const current = guest.checkedIn ?? 0
        const individualMode = guest.members?.some(member => member.inside !== null) ?? false
        const currentInside = individualMode ? guest.members?.filter(member => member.inside).length ?? 0 : current
        const confirmed = guest.status === 'ACCEPTED'
        const canIn = confirmed && current < guest.allowedCapacity
        const canOut = currentInside > 0
        const statusColor = confirmed ? GREEN : guest.status === 'DECLINED' ? RED : '#B7791F'
        return <View key={guest.id} style={styles.guestCard}>
          <View style={styles.guestTop}><View style={styles.avatar}><Text style={styles.avatarText}>{guest.guestName.trim().charAt(0).toUpperCase() || '?'}</Text></View><View style={styles.guestCopy}><Text style={styles.guestName}>{guest.guestName}</Text><Text style={[styles.guestStatus, { color: statusColor }]}>{guest.status === 'ACCEPTED' ? 'Confirmado' : guest.status === 'DECLINED' ? 'Declinó' : 'Pendiente'} · {currentInside}/{guest.allowedCapacity} dentro</Text></View><Feather name={confirmed ? 'check-circle' : 'clock'} size={17} color={statusColor} /></View>
          {[guest.table, guest.seat, guest.sector].some(Boolean) ? <View style={styles.assignment}><Feather name="map-pin" size={14} color={PURPLE} /><Text style={styles.assignmentText}>{[guest.table, guest.seat, guest.sector].filter(Boolean).join(' · ')}</Text></View> : null}
          {guest.companions?.length ? <Text style={styles.companions}>{guest.companions.length} acompañante(s): {guest.companions.join(', ')}</Text> : null}
          {canCheckIn && individualMode ? <View style={styles.memberList}>{guest.members?.map(member => <View key={member.index} style={styles.memberRow}><View style={[styles.memberDot, member.inside ? styles.memberDotInside : null]} /><View style={styles.memberCopy}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.memberStatus}>{member.inside ? 'Dentro' : 'Fuera'}</Text></View><Pressable disabled={!!busyId || member.inside === true} onPress={() => void attendance(guest, 'check-in', member.index)} style={[styles.memberAction, member.inside === true && styles.disabled]}><Feather name="log-in" size={13} color={PURPLE} /></Pressable><Pressable disabled={!!busyId || member.inside !== true} onPress={() => void attendance(guest, 'check-out', member.index)} style={[styles.memberAction, member.inside !== true && styles.disabled]}><Feather name="log-out" size={13} color={NAVY} /></Pressable></View>)}</View> : null}
          {canCheckIn && !individualMode ? <View style={styles.attendanceActions}>
            <Pressable disabled={!canIn || !!busyId} onPress={() => void attendance(guest, 'check-in')} style={[styles.attendanceButton, !canIn && styles.disabled]}>{busyId === guest.id ? <ActivityIndicator color={PURPLE} /> : <><Feather name="log-in" size={15} color={PURPLE} /><Text style={styles.attendanceText}>Registrar ingreso</Text></>}</Pressable>
            <Pressable disabled={!canOut || !!busyId} onPress={() => void attendance(guest, 'check-out')} style={[styles.attendanceButton, !canOut && styles.disabled]}><Feather name="log-out" size={15} color={NAVY} /><Text style={[styles.attendanceText, { color: NAVY }]}>Registrar salida</Text></Pressable>
          </View> : null}
        </View>
      })}
      {!loading && filteredGuests.length === 0 ? <View style={styles.empty}><Feather name={search ? 'search' : 'users'} size={23} color={PURPLE} /><Text style={styles.emptyTitle}>{search ? 'Sin coincidencias' : 'No hay invitados'}</Text><Text style={styles.muted}>{search ? 'Prueba con otro nombre o asignación.' : 'Las invitaciones aparecerán aquí.'}</Text></View> : null}
    </ScrollView>
  </SafeAreaView>
}

const NEXT_ACTIONS: Record<AssistanceRequest['status'], Array<{ status: AssistanceRequest['status']; title: string; icon: 'check' | 'navigation' | 'x' }>> = {
  RECEIVED: [{ status: 'ACCEPTED', title: 'Tomar solicitud', icon: 'check' }, { status: 'CANCELLED', title: 'Cerrar', icon: 'x' }],
  ACCEPTED: [{ status: 'ON_THE_WAY', title: 'Voy en camino', icon: 'navigation' }, { status: 'ATTENDED', title: 'Atendida', icon: 'check' }, { status: 'CANCELLED', title: 'Cerrar', icon: 'x' }],
  ON_THE_WAY: [{ status: 'ATTENDED', title: 'Atendida', icon: 'check' }, { status: 'CANCELLED', title: 'Cerrar', icon: 'x' }],
  ATTENDED: [], CANCELLED: [],
}

const STATUS_LABELS: Record<AssistanceRequest['status'], string> = {
  RECEIVED: 'Nueva', ACCEPTED: 'Asignada', ON_THE_WAY: 'En camino', ATTENDED: 'Atendida', CANCELLED: 'Cerrada',
}

export function AssistanceQueueScreen({ route, navigation }: { route: any; navigation: any }) {
  const event: EventItem = route.params.event
  const insets = useSafeAreaInsets()
  const [requests, setRequests] = useState<AssistanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try { setRequests(await getEventAssistance(event.id)) }
    catch (loadError) { setError((loadError as Error).message || 'No se pudieron cargar las solicitudes.') }
    finally { setLoading(false); setRefreshing(false) }
  }, [event.id])

  useEffect(() => { void load() }, [load])

  async function update(request: AssistanceRequest, status: AssistanceRequest['status']) {
    setBusyId(request.id)
    try {
      const currentUser = await getCurrentUser().catch(() => null)
      await updateEventAssistance(event.id, request.id, { status, assignedUserId: status === 'ACCEPTED' ? currentUser?.id : undefined })
      await load(true)
    } catch (actionError) { setError((actionError as Error).message || 'No se pudo actualizar la solicitud.') }
    finally { setBusyId('') }
  }

  const active = requests.filter(request => !['ATTENDED', 'CANCELLED'].includes(request.status))
  const closed = requests.filter(request => ['ATTENDED', 'CANCELLED'].includes(request.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const ordered = [...active, ...closed]

  return <SafeAreaView style={styles.safeArea} edges={['top']}>
    <StatusBar style="dark" /><Header title="Solicitudes de ayuda" event={event} navigation={navigation} />
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={PURPLE} />} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}>
      <View style={styles.queueBanner}><View style={styles.queueIcon}><Feather name="life-buoy" size={20} color={PURPLE} /></View><View style={styles.queueCopy}><Text style={styles.queueTitle}>{active.length} solicitud(es) por atender</Text><Text style={styles.muted}>Las de emergencia aparecen primero.</Text></View><View style={styles.queueCount}><Text style={styles.queueCountText}>{active.length}</Text></View></View>
      {error ? <View style={styles.errorBox}><Feather name="alert-circle" size={17} color={RED} /><Text style={styles.errorText}>{error}</Text></View> : null}
      {loading ? <View style={styles.loading}><ActivityIndicator color={PURPLE} /><Text style={styles.muted}>Cargando solicitudes…</Text></View> : ordered.map(request => {
        const emergency = request.priority >= 100
        return <View key={request.id} style={[styles.requestCard, emergency && styles.emergencyCard]}>
          <View style={styles.requestTop}><View style={[styles.requestIcon, emergency && styles.emergencyIcon]}><Feather name={emergency ? 'alert-triangle' : 'message-circle'} size={17} color={emergency ? RED : PURPLE} /></View><View style={styles.requestCopy}><Text style={styles.requestCategory}>{request.category.replace(/_/g, ' ')}</Text><Text style={styles.requestTime}>{formatDate(request.createdAt)}</Text></View><View style={[styles.statusPill, request.status === 'ATTENDED' ? styles.donePill : request.status === 'CANCELLED' ? styles.closedPill : styles.activePill]}><Text style={[styles.statusPillText, request.status === 'ATTENDED' ? styles.doneText : request.status === 'CANCELLED' ? styles.closedText : styles.activeText]}>{STATUS_LABELS[request.status]}</Text></View></View>
          {request.location ? <View style={styles.assignment}><Feather name="map-pin" size={14} color={PURPLE} /><Text style={styles.assignmentText}>{request.location}</Text></View> : null}
          {request.details ? <Text style={styles.requestDetails}>{request.details}</Text> : null}
          {request.assignedUserId ? <Text style={styles.assignedText}>Responsable asignado</Text> : null}
          {NEXT_ACTIONS[request.status].length ? <View style={styles.requestActions}>{NEXT_ACTIONS[request.status].map(action => <Pressable key={action.status} disabled={!!busyId} onPress={() => void update(request, action.status)} style={[styles.requestAction, action.status === 'CANCELLED' && styles.cancelAction, busyId === request.id && styles.disabled]}>{busyId === request.id ? <ActivityIndicator color={PURPLE} /> : <><Feather name={action.icon} size={14} color={action.status === 'CANCELLED' ? RED : PURPLE} /><Text style={[styles.requestActionText, action.status === 'CANCELLED' && styles.cancelActionText]}>{action.title}</Text></>}</Pressable>)}</View> : null}
        </View>
      })}
      {!loading && !requests.length ? <View style={styles.empty}><Feather name="check-circle" size={23} color={GREEN} /><Text style={styles.emptyTitle}>Todo en orden</Text><Text style={styles.muted}>Las solicitudes de los asistentes aparecerán aquí.</Text></View> : null}
    </ScrollView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' }, header: { minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: BORDER }, back: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, overflow: 'hidden', position: 'relative', backgroundColor: '#F3F4F8' }, backGlass: { borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.56)' }, headerCopy: { flex: 1 }, headerTitle: { color: NAVY, fontSize: 14, fontWeight: '800' }, headerSubtitle: { marginTop: 3, color: MUTED, fontSize: 10 },
  content: { padding: 17, gap: 11 }, stats: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: BORDER, borderRadius: 16, backgroundColor: '#FFFFFF' }, stat: { alignItems: 'center', gap: 2 }, statValue: { color: NAVY, fontSize: 18, fontWeight: '800' }, statLabel: { color: MUTED, fontSize: 9 }, statDivider: { height: 34, borderLeftWidth: 1, borderColor: BORDER },
  searchBox: { minHeight: 47, paddingHorizontal: 12, alignItems: 'center', flexDirection: 'row', gap: 9, borderWidth: 1, borderColor: BORDER, borderRadius: 14, backgroundColor: '#FFFFFF' }, searchInput: { flex: 1, minWidth: 0, color: NAVY, fontSize: 12 }, guestCard: { padding: 14, borderWidth: 1, borderColor: BORDER, borderRadius: 17, backgroundColor: '#FFFFFF', gap: 10 }, guestTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, avatar: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: SOFT }, avatarText: { color: PURPLE, fontSize: 15, fontWeight: '800' }, guestCopy: { flex: 1, gap: 4 }, guestName: { color: NAVY, fontSize: 13, fontWeight: '800' }, guestStatus: { fontSize: 10, fontWeight: '700' }, assignment: { paddingTop: 9, flexDirection: 'row', alignItems: 'center', gap: 7, borderTopWidth: 1, borderTopColor: '#EFF0F4' }, assignmentText: { color: '#586276', fontSize: 10 }, companions: { color: MUTED, fontSize: 10, lineHeight: 15 }, attendanceActions: { flexDirection: 'row', gap: 8, marginTop: 2 }, attendanceButton: { flex: 1, minHeight: 39, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, borderWidth: 1, borderColor: BORDER, borderRadius: 11, backgroundColor: '#F9FAFC' }, attendanceText: { color: PURPLE, fontSize: 9, fontWeight: '800' }, memberList: { paddingTop: 3, borderTopWidth: 1, borderTopColor: '#EFF0F4' }, memberRow: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#F1F2F5' }, memberDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C6CBD5' }, memberDotInside: { backgroundColor: GREEN }, memberCopy: { flex: 1, gap: 3 }, memberName: { color: NAVY, fontSize: 10, fontWeight: '700' }, memberStatus: { color: MUTED, fontSize: 8 }, memberAction: { width: 32, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: SOFT }, disabled: { opacity: 0.38 },
  queueBanner: { minHeight: 68, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER }, queueIcon: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: SOFT }, queueCopy: { flex: 1, gap: 3 }, queueTitle: { color: NAVY, fontSize: 12, fontWeight: '800' }, queueCount: { minWidth: 30, height: 30, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: SOFT }, queueCountText: { color: PURPLE, fontSize: 12, fontWeight: '800' }, requestCard: { padding: 14, gap: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 17, backgroundColor: '#FFFFFF' }, emergencyCard: { borderColor: '#F0B5BC', backgroundColor: '#FFFBFB' }, requestTop: { flexDirection: 'row', alignItems: 'center', gap: 9 }, requestIcon: { width: 37, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: SOFT }, emergencyIcon: { backgroundColor: '#FFE9EB' }, requestCopy: { flex: 1, gap: 3 }, requestCategory: { color: NAVY, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' }, requestTime: { color: MUTED, fontSize: 9 }, statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 }, activePill: { backgroundColor: SOFT }, donePill: { backgroundColor: '#EAF8F1' }, closedPill: { backgroundColor: '#F0F1F4' }, statusPillText: { fontSize: 8, fontWeight: '800' }, activeText: { color: PURPLE }, doneText: { color: GREEN }, closedText: { color: MUTED }, requestDetails: { color: '#586276', fontSize: 11, lineHeight: 16 }, assignedText: { color: PURPLE, fontSize: 9, fontWeight: '700' }, requestActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, requestAction: { minHeight: 34, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, backgroundColor: SOFT }, requestActionText: { color: PURPLE, fontSize: 9, fontWeight: '800' }, cancelAction: { backgroundColor: '#FFF0F1' }, cancelActionText: { color: RED },
  loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 }, muted: { color: MUTED, fontSize: 10, lineHeight: 16, textAlign: 'center' }, empty: { minHeight: 175, alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1, borderColor: BORDER, borderRadius: 17, backgroundColor: '#FFFFFF' }, emptyTitle: { color: NAVY, fontSize: 14, fontWeight: '800' }, errorBox: { padding: 11, alignItems: 'center', flexDirection: 'row', gap: 8, borderRadius: 12, backgroundColor: '#FFF0F1' }, errorText: { flex: 1, color: RED, fontSize: 10, lineHeight: 15 },
})
