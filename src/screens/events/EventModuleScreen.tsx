import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentProps } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { ImageSourcePropType } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Calendar from 'expo-calendar'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

import {
  createModuleRecord,
  createEventAssistance,
  DEMO_MODE,
  getCurrentUser,
  getEventAgenda,
  getEventFileImageSource,
  getEventFiles,
  getEventPermissions,
  getModuleActionHistory,
  getModuleRecords,
  getMyAgenda,
  getMyMapLocation,
  getNetworkingSuggestions,
  getQueuePosition,
  moderateEventPhoto,
  searchEventMap,
  setAgendaFavorite,
  submitModuleAction,
  uploadEventPhoto,
  updateModuleRecord,
} from '../../services/api'
import type { EventFile, EventPermissions, MapSearchResult, ModuleAction, ModuleRecord, QueuePosition } from '../../services/api'
import type { EventAgenda, EventItem, EventModule } from '../../types/events'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_SOFT = '#F0EDFF'
const WHITE = '#FFFFFF'
const MUTED = '#737D91'
const BORDER = '#E5E8EF'
const PAGE = '#F7F8FC'
const GREEN = '#249B68'
const RED = '#D64550'

const RECORD_TYPES: Record<string, string[]> = {
  QUE: ['QUEUE'],
  BKG: ['ACTIVITY'],
  INT: ['POLL', 'QUESTION_BOARD', 'QUESTION', 'TRIVIA', 'SONG', 'GUEST_MESSAGE'],
  ORD: ['MENU_CATEGORY', 'MENU_ITEM', 'ORDER'],
  MAP: ['ZONE', 'POINT'],
  NET: ['PROFILE'],
  EXH: ['EXHIBITOR', 'STAND'],
  SES: ['SESSION', 'SPEAKER'],
  TRN: ['ROUTE', 'DEPARTURE'],
  SPT: ['MATCH', 'TEAM', 'PARTICIPANT'],
  LNF: ['LOST_ITEM', 'FOUND_ITEM'],
  RSC: ['RESOURCE', 'CERTIFICATE'],
  GAL: ['PHOTO'],
  REV: ['SURVEY'],
  GAM: ['MISSION', 'BADGE'],
  AFO: ['SERVICE_STATUS', 'ZONE_CAPACITY'],
  GST: ['SEATING_AREA'],
}

const ICONS: Record<string, ComponentProps<typeof Feather>['name']> = {
  QUE: 'users', BKG: 'calendar', INT: 'message-circle', ORD: 'shopping-bag',
  MAP: 'map', NET: 'user-plus', EXH: 'briefcase', SES: 'mic', TRN: 'navigation',
  SPT: 'award', LNF: 'search', RSC: 'book-open', GAL: 'image', REV: 'star',
  GAM: 'zap', AFO: 'activity', GST: 'grid',
}

type Option = { id: string; label: string }

function textValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function optionsFor(record: ModuleRecord): Option[] {
  const options = record.payload.options
  if (!Array.isArray(options)) return []
  return options.flatMap(option => {
    if (!option || typeof option !== 'object') return []
    const value = option as Record<string, unknown>
    if (typeof value.id !== 'string' || typeof value.label !== 'string') return []
    return [{ id: value.id, label: value.label }]
  })
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })} · ${date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}`
}

function priceLabel(value: unknown) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 2,
  }).format(amount)
}

function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: 'Esperando confirmación',
    ACCEPTED: 'Pedido aceptado',
    PREPARING: 'En preparación',
    READY: 'Listo para recoger',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }
  return labels[status] ?? status
}

function remainingCapacity(record: ModuleRecord) {
  if (record.capacity == null) return null
  return Math.max(0, record.capacity - record.currentCount)
}

export function EventModuleScreen({
  route,
  navigation,
}: {
  route: any
  navigation: any
}) {
  const insets = useSafeAreaInsets()
  const event: EventItem = route.params.event
  const module: EventModule = route.params.module
  const invitationToken: string | undefined = route.params.token
  const code = module.code.toUpperCase()

  const [records, setRecords] = useState<ModuleRecord[]>([])
  const [histories, setHistories] = useState<Record<string, ModuleAction[]>>({})
  const [queuePositions, setQueuePositions] = useState<Record<string, QueuePosition>>({})
  const [agenda, setAgenda] = useState<EventAgenda | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [questionDrafts, setQuestionDrafts] = useState<Record<string, string>>({})
  const [cart, setCart] = useState<Record<string, number>>({})
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [eventFiles, setEventFiles] = useState<EventFile[]>([])
  const [fileSources, setFileSources] = useState<Record<string, ImageSourcePropType>>({})
  const [permissions, setPermissions] = useState<EventPermissions | null>(null)
  const [galleryFilter, setGalleryFilter] = useState<'ALL' | 'OFFICIAL'>('ALL')
  const [uploadOfficial, setUploadOfficial] = useState(false)
  const [mapQuery, setMapQuery] = useState('')
  const [mapResults, setMapResults] = useState<MapSearchResult[]>([])
  const [mapLocation, setMapLocation] = useState<MapSearchResult[]>([])
  const [mapBusy, setMapBusy] = useState(false)
  const [helpCategory, setHelpCategory] = useState('')
  const [helpDetails, setHelpDetails] = useState('')
  const [helpLocation, setHelpLocation] = useState('')
  const [networkProfile, setNetworkProfile] = useState<ModuleRecord | null>(null)
  const [networkName, setNetworkName] = useState('')
  const [networkOrganization, setNetworkOrganization] = useState('')
  const [networkBio, setNetworkBio] = useState('')
  const [networkInterests, setNetworkInterests] = useState('')
  const [networkContact, setNetworkContact] = useState('')
  const [networkConsent, setNetworkConsent] = useState(false)

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      if (code === 'AGENDA') {
        const [agendaData, mine] = await Promise.all([getEventAgenda(event.id), getMyAgenda(event.id)])
        setAgenda(agendaData)
        setFavoriteIds(mine.map(item => item.id))
        setRecords([])
        return
      }

      if (code === 'NET') {
        const [suggestions, ownProfiles, user] = await Promise.all([
          getNetworkingSuggestions(event.id),
          getModuleRecords(event.id, 'NET', 'PROFILE'),
          getCurrentUser().catch(() => null),
        ])
        const own = ownProfiles.find(profile => profile.ownerUserId === user?.id || DEMO_MODE && profile.ownerUserId === 'demo-user') ?? null
        setNetworkProfile(own)
        if (own) {
          setNetworkName(textValue(own.payload.displayName) || own.title || '')
          setNetworkOrganization(textValue(own.payload.organization))
          setNetworkBio(textValue(own.payload.bio))
          setNetworkInterests(Array.isArray(own.payload.interests) ? own.payload.interests.join(', ') : '')
          setNetworkContact(textValue(own.payload.contact))
          setNetworkConsent(own.payload.consent === true)
        }
        setRecords(suggestions)
        setHistories({})
        return
      }

      if (code === 'MAP') {
        setMapLocation(await getMyMapLocation(event.id))
        setRecords([])
        return
      }

      if (code === 'GAL') {
        const [files, eventPermissions] = await Promise.all([getEventFiles(event.id), getEventPermissions(event.id)])
        setEventFiles(files)
        setPermissions(eventPermissions)
        const sources = await Promise.all(files.map(async file => [file.id, await getEventFileImageSource(file)] as const))
        setFileSources(Object.fromEntries(sources))
        setRecords([])
        return
      }

      const types = RECORD_TYPES[code] ?? []
      if (!types.length) {
        setRecords([])
        return
      }

      const responses = await Promise.allSettled(
        types.map(type => getModuleRecords(event.id, code, type)),
      )
      const loaded = responses.flatMap(result =>
        result.status === 'fulfilled' ? result.value : [],
      )
      const rejected = responses.find(result => result.status === 'rejected')
      if (!loaded.length && rejected?.status === 'rejected') throw rejected.reason

      loaded.sort((a, b) => {
        const startA = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER
        const startB = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER
        return startA - startB || a.createdAt.localeCompare(b.createdAt)
      })
      setRecords(loaded)

      const historyResults = await Promise.allSettled(
        loaded.map(record => getModuleActionHistory(event.id, record.id)),
      )
      const nextHistories: Record<string, ModuleAction[]> = {}
      historyResults.forEach((result, index) => {
        if (result.status === 'fulfilled') nextHistories[loaded[index].id] = result.value
      })
      setHistories(nextHistories)
      const nextPositions: Record<string, QueuePosition> = {}
      if (code === 'QUE') {
        const positionResults = await Promise.allSettled(
          loaded.map(record => getQueuePosition(event.id, record.id)),
        )
        positionResults.forEach((result, index) => {
          if (result.status === 'fulfilled') nextPositions[loaded[index].id] = result.value
        })
      }
      setQueuePositions(nextPositions)
    } catch (loadError) {
      setError((loadError as Error).message || 'No se pudo cargar este módulo.')
      setRecords([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [code, event.id])

  useEffect(() => {
    void load()
  }, [load])

  const menuCategories = useMemo(
    () => records.filter(record => record.recordType === 'MENU_CATEGORY'),
    [records],
  )
  const menuItems = useMemo(
    () => records.filter(record => record.recordType === 'MENU_ITEM'),
    [records],
  )
  const orders = useMemo(
    () => records.filter(record => record.recordType === 'ORDER'),
    [records],
  )
  const cartTotal = useMemo(() => menuItems.reduce(
    (total, item) => total + Number(item.payload.price ?? 0) * (cart[item.id] ?? 0),
  0), [cart, menuItems])
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)

  function hasActiveAction(record: ModuleRecord, action: string, release: string) {
    const actions = histories[record.id] ?? []
    return actions.filter(item => item.action === action).length >
      actions.filter(item => item.action === release).length
  }

  async function performAction(
    record: ModuleRecord,
    action: string,
    payload: Record<string, unknown> = {},
  ) {
    setBusyId(record.id)
    try {
      await submitModuleAction(event.id, record.id, { action, payload })
      await load(true)
      if (action === 'JOIN') Alert.alert('Ya estás en la fila', 'Puedes volver a esta pantalla para consultar tu turno.')
      if (action === 'RESERVE') Alert.alert('Reserva confirmada', 'Tu lugar quedó reservado para esta actividad.')
      if (action === 'VOTE' || action === 'ANSWER') Alert.alert('Respuesta registrada', 'Gracias por participar.')
    } catch (actionError) {
      Alert.alert('No se pudo completar', (actionError as Error).message)
    } finally {
      setBusyId('')
    }
  }

  async function askQuestion(board: ModuleRecord) {
    const title = (questionDrafts[board.id] ?? '').trim()
    if (title.length < 4) {
      Alert.alert('Escribe tu pregunta', 'La pregunta debe tener al menos 4 caracteres.')
      return
    }
    setBusyId(board.id)
    try {
      await createModuleRecord(event.id, 'INT', 'QUESTION', {
        title,
        payload: {},
        parentRecordId: board.id,
      })
      setQuestionDrafts(current => ({ ...current, [board.id]: '' }))
      await load(true)
      Alert.alert('Pregunta enviada', 'Tu pregunta quedó registrada en el tablero.')
    } catch (questionError) {
      Alert.alert('No se pudo enviar', (questionError as Error).message)
    } finally {
      setBusyId('')
    }
  }

  async function submitVote(record: ModuleRecord, optionIds: string[], action: 'VOTE' | 'ANSWER') {
    if (!optionIds.length) return
    setBusyId(record.id)
    try {
      for (const optionId of optionIds) {
        await submitModuleAction(event.id, record.id, { action, payload: { optionId } })
      }
      setSelectedOptions(current => ({ ...current, [record.id]: [] }))
      await load(true)
      Alert.alert('Respuesta registrada', 'Gracias por participar.')
    } catch (voteError) {
      Alert.alert('No se pudo registrar el voto', (voteError as Error).message)
      await load(true)
    } finally {
      setBusyId('')
    }
  }

  async function placeOrder() {
    const items = Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }))
    if (!items.length) return
    setBusyId('order')
    try {
      const order = await createModuleRecord(event.id, 'ORD', 'ORDER', {
        payload: { items, location: 'Para llevar' },
      })
      setCart({})
      await load(true)
      Alert.alert(
        'Pedido recibido',
        `El equipo confirmará el pedido. Total calculado por el servicio: ${priceLabel(order.payload.total) || 'pendiente'}.`,
      )
    } catch (orderError) {
      Alert.alert('No se pudo crear el pedido', (orderError as Error).message)
    } finally {
      setBusyId('')
    }
  }

  async function cancelOrder(order: ModuleRecord) {
    setBusyId(order.id)
    try {
      await updateModuleRecord(event.id, order.id, { status: 'CANCELLED' })
      await load(true)
      Alert.alert('Pedido cancelado', 'Se liberaron las existencias reservadas para el pedido.')
    } catch (cancelError) {
      Alert.alert('No se pudo cancelar', (cancelError as Error).message)
    } finally {
      setBusyId('')
    }
  }

  async function toggleAgendaFavorite(item: NonNullable<EventAgenda['activities']>[number]) {
    const enabled = !favoriteIds.includes(item.id)
    setBusyId(item.id)
    try {
      await setAgendaFavorite(event.id, item.id, enabled)
      setFavoriteIds(current => enabled ? [...new Set([...current, item.id])] : current.filter(id => id !== item.id))
      if (enabled) {
        Alert.alert('Actividad guardada', 'La añadimos a tu agenda personal. Puedes consultarla desde la sección Mi agenda.')
      } else {
        Alert.alert('Actividad retirada', 'La quitamos de tu agenda personal.')
      }
    } catch (actionError) {
      Alert.alert('No se pudo actualizar tu agenda', (actionError as Error).message)
    } finally { setBusyId('') }
  }

  async function addActivityToCalendar(item: NonNullable<EventAgenda['activities']>[number]) {
    try {
      const permission = await Calendar.requestCalendarPermissions(true)
      if (!permission.granted) {
        Alert.alert('Permiso necesario', 'Permite agregar eventos al calendario para guardar esta actividad.')
        return
      }
      const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT)
      if (!calendars.length) {
        Alert.alert('Calendario no disponible', 'No encontramos un calendario donde agregar esta actividad.')
        return
      }
      await calendars[0].addEventWithForm({
        title: item.title,
        startDate: new Date(item.startsAt),
        endDate: new Date(item.endsAt || new Date(new Date(item.startsAt).getTime() + 60 * 60_000).toISOString()),
        location: item.location || event.location,
        notes: item.detail || `Actividad de ${event.name}`,
      })
    } catch (calendarError) {
      Alert.alert('No se pudo abrir el calendario', (calendarError as Error).message || 'Revisa los permisos del dispositivo y vuelve a intentarlo.')
    }
  }

  async function submitAssistance() {
    if (!helpCategory) {
      Alert.alert('Selecciona el tipo de ayuda', 'Elige una categoría para que el equipo pueda responder mejor.')
      return
    }
    setBusyId('assistance')
    try {
      await createEventAssistance(event.id, { category: helpCategory, details: helpDetails.trim() || undefined, location: helpLocation.trim() || undefined }, invitationToken)
      setHelpDetails('')
      Alert.alert('Solicitud enviada', 'El equipo del evento recibió tu solicitud y podrá darle seguimiento.')
    } catch (assistanceError) {
      Alert.alert('No se pudo enviar la solicitud', (assistanceError as Error).message)
    } finally { setBusyId('') }
  }

  async function runMapSearch(query = mapQuery) {
    const search = query.trim()
    if (search.length < 2) {
      setMapResults([])
      return
    }
    setMapBusy(true)
    setError('')
    try { setMapResults(await searchEventMap(event.id, search)) }
    catch (searchError) { setError((searchError as Error).message || 'No se pudo buscar en el mapa.') }
    finally { setMapBusy(false) }
  }

  async function publishProfile() {
    const displayName = networkName.trim()
    if (!displayName) {
      Alert.alert('Agrega tu nombre', 'El nombre es lo que verán otros asistentes en la lista de networking.')
      return
    }
    if (!networkConsent) {
      Alert.alert('Confirma tu consentimiento', 'Activa la casilla para publicar tu perfil y hacerlo visible a otras personas.')
      return
    }
    setBusyId('network')
    try {
      const interests = networkInterests.split(/[,\n]/).map(item => item.trim()).filter(Boolean).slice(0, 20)
      await createModuleRecord(event.id, 'NET', 'PROFILE', {
        title: displayName,
        payload: { consent: true, visible: true, displayName, bio: networkBio.trim(), organization: networkOrganization.trim(), interests, contact: networkContact.trim() || undefined },
      })
      await load(true)
      Alert.alert('Perfil publicado', 'Ya puedes aparecer en sugerencias para otros asistentes. Puedes ocultarlo cuando quieras.')
    } catch (profileError) {
      Alert.alert('No se pudo publicar tu perfil', (profileError as Error).message)
    } finally { setBusyId('') }
  }

  async function setProfileVisible(visible: boolean) {
    if (!networkProfile) return
    setBusyId('network')
    try {
      await updateModuleRecord(event.id, networkProfile.id, { payload: { consent: true, visible } })
      await load(true)
      Alert.alert(visible ? 'Perfil visible' : 'Perfil oculto', visible ? 'Volviste a aparecer en sugerencias.' : 'Ya no aparecerás en búsquedas ni sugerencias de networking.')
    } catch (profileError) { Alert.alert('No se pudo actualizar el perfil', (profileError as Error).message) }
    finally { setBusyId('') }
  }

  async function choosePhoto(capture: boolean) {
    if (busyId) return
    try {
      const picker = capture
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 })
      const asset = picker.canceled ? null : picker.assets?.[0]
      if (!asset) return
      setBusyId('photo')
      const context = ImageManipulator.manipulate(asset.uri)
      const scale = Math.min(1, 1800 / Math.max(asset.width, asset.height))
      if (scale < 1) context.resize({ width: Math.round(asset.width * scale), height: Math.round(asset.height * scale) })
      const image = await context.renderAsync()
      const compressed = await image.saveAsync({ compress: 0.78, format: SaveFormat.JPEG })
      context.release()
      image.release()
      const photo = await uploadEventPhoto(event.id, { uri: compressed.uri, fileName: `eventflow-${Date.now()}.jpg`, mimeType: 'image/jpeg' }, uploadOfficial)
      setEventFiles(current => [photo, ...current.filter(file => file.id !== photo.id)])
      setFileSources(current => ({ ...current, [photo.id]: { uri: `${process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || ''}${photo.downloadUrl}` } }))
      if (photo.moderationStatus === 'PENDING') Alert.alert('Foto enviada', 'Quedó en revisión antes de mostrarse a los demás asistentes.')
      else Alert.alert('Foto publicada', 'Ya está disponible en la galería del evento.')
      await load(true)
    } catch (uploadError) {
      Alert.alert('No se pudo compartir la foto', (uploadError as Error).message || 'Vuelve a intentarlo más tarde.')
    } finally { setBusyId('') }
  }

  async function moderatePhoto(file: EventFile, status: 'ACTIVE' | 'REJECTED') {
    setBusyId(file.id)
    try {
      await moderateEventPhoto(event.id, file.id, status)
      await load(true)
    } catch (moderationError) { Alert.alert('No se pudo moderar la foto', (moderationError as Error).message) }
    finally { setBusyId('') }
  }

  function updateCart(item: ModuleRecord, delta: number) {
    setCart(current => {
      const nextQuantity = Math.max(0, (current[item.id] ?? 0) + delta)
      const stock = remainingCapacity(item)
      if (delta > 0 && item.payload.available === false) return current
      if (delta > 0 && stock != null && nextQuantity > stock) {
        Alert.alert('Sin existencias', 'No quedan suficientes unidades de este producto.')
        return current
      }
      const next = { ...current }
      if (!nextQuantity) delete next[item.id]
      else next[item.id] = nextQuantity
      return next
    })
  }

  function renderActionButton(
    record: ModuleRecord,
    label: string,
    action: string,
    release?: string,
  ) {
    const active = release ? hasActiveAction(record, action, release) : false
    const remaining = remainingCapacity(record)
    const disabled = record.status !== 'ACTIVE' || !!busyId || (!active && remaining === 0)
    const activeLabel = release === 'LEAVE'
      ? 'Salir de la fila'
      : release === 'CANCEL'
        ? 'Cancelar reserva'
        : 'Quitar de guardados'
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => void performAction(record, active && release ? release : action)}
        style={({ pressed }) => [styles.primaryButton, disabled && styles.disabledButton, pressed && !disabled && styles.pressed]}
      >
        {busyId === record.id ? <ActivityIndicator color={WHITE} /> : (
          <>
            <Feather name={active ? 'check' : 'arrow-right'} size={16} color={WHITE} />
            <Text style={styles.primaryButtonText}>{active && release ? activeLabel : label}</Text>
          </>
        )}
      </Pressable>
    )
  }

  function renderRecord(record: ModuleRecord) {
    const description = textValue(record.payload.description)
    const remaining = remainingCapacity(record)
    const isQueue = code === 'QUE' && record.recordType === 'QUEUE'
    const isBooking = code === 'BKG' && record.recordType === 'ACTIVITY'
    const isPoll = code === 'INT' && ['POLL', 'TRIVIA'].includes(record.recordType)
    const isBoard = code === 'INT' && record.recordType === 'QUESTION_BOARD'
    const isSong = code === 'INT' && record.recordType === 'SONG'
    const votes = (histories[record.id] ?? []).filter(action => ['VOTE', 'ANSWER'].includes(action.action))
    const allowMultiple = record.recordType === 'POLL' && record.payload.allowMultiple === true
    const voted = votes.length > 0
    const options = optionsFor(record)
    const votedOptions = votes.map(action => String(action.payload.optionId ?? ''))

    return (
      <View key={record.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.recordIcon}>
            <Feather name={isQueue ? 'users' : isBooking ? 'calendar' : isPoll ? 'bar-chart-2' : isBoard ? 'message-circle' : 'file-text'} size={18} color={PURPLE} />
          </View>
          <View style={styles.recordHeading}>
            <Text style={styles.recordTitle}>{record.title || 'Actividad'}</Text>
            <Text style={styles.recordType}>{record.recordType.replace(/_/g, ' ').toLowerCase()}</Text>
          </View>
          {record.status === 'ACTIVE' ? <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>Disponible</Text></View> : <View style={styles.closedBadge}><Text style={styles.closedBadgeText}>{record.status === 'CLOSED' ? 'Cerrado' : 'No disponible'}</Text></View>}
        </View>

        {description ? <Text style={styles.description}>{description}</Text> : null}

        {(record.startsAt || record.endsAt) ? (
          <View style={styles.metaRow}><Feather name="clock" size={15} color={MUTED} /><Text style={styles.metaText}>{formatDate(record.startsAt)}{record.endsAt ? ` · hasta ${new Date(record.endsAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}` : ''}</Text></View>
        ) : null}

        {record.payload.location ? (
          <View style={styles.metaRow}><Feather name="map-pin" size={15} color={MUTED} /><Text style={styles.metaText}>{textValue(record.payload.location)}</Text></View>
        ) : null}

        {record.capacity != null ? (
          <View style={styles.capacityRow}>
            <Text style={styles.capacityLabel}>{isQueue ? `${queuePositions[record.id]?.waiting ?? record.currentCount} en espera` : `${record.currentCount} de ${record.capacity} lugares`}</Text>
            <Text style={[styles.capacityLabel, remaining === 0 && { color: RED }]}>{remaining === 0 ? 'Agotado' : remaining == null ? 'Cupo abierto' : `${remaining} disponibles`}</Text>
          </View>
        ) : null}

        {isQueue ? (
          <>
            {queuePositions[record.id]?.position ? (
              <View style={styles.positionBanner}>
                <Feather name="clock" size={18} color={PURPLE} />
                <Text style={styles.positionText}>Tu turno: #{queuePositions[record.id].position} · {queuePositions[record.id].peopleAhead} delante</Text>
              </View>
            ) : null}
            {renderActionButton(record, 'Tomar turno', 'JOIN', 'LEAVE')}
          </>
        ) : null}

        {isBooking ? renderActionButton(record, 'Reservar mi lugar', 'RESERVE', 'CANCEL') : null}

        {isPoll ? (
          <View style={styles.optionsList}>
            {options.map(option => {
              const optionAlreadyVoted = votedOptions.includes(option.id)
              const selected = selectedOptions[record.id]?.includes(option.id) || optionAlreadyVoted
              return (
                <Pressable
                  key={option.id}
                  disabled={record.status !== 'ACTIVE' || optionAlreadyVoted || (voted && !allowMultiple)}
                  onPress={() => setSelectedOptions(current => {
                    const selectedIds = current[record.id] ?? []
                    const nextIds = allowMultiple
                      ? selectedIds.includes(option.id)
                        ? selectedIds.filter(id => id !== option.id)
                        : [...selectedIds, option.id]
                      : [option.id]
                    return { ...current, [record.id]: nextIds }
                  })}
                  style={[styles.option, selected && styles.optionSelected, optionAlreadyVoted && styles.optionVoted]}
                >
                  <View style={[styles.radio, allowMultiple && styles.checkbox, selected && styles.radioSelected]}>{selected ? <View style={[styles.radioDot, allowMultiple && styles.checkboxDot]} /> : null}</View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {optionAlreadyVoted ? <Feather name="check-circle" size={17} color={GREEN} /> : null}
                </Pressable>
              )
            })}
            {(() => {
              const pendingOptions = (selectedOptions[record.id] ?? []).filter(optionId => !votedOptions.includes(optionId))
              const disabled = record.status !== 'ACTIVE' || (!allowMultiple && voted) || !pendingOptions.length || !!busyId
              return (
                <Pressable
                  disabled={disabled}
                  onPress={() => void submitVote(record, pendingOptions, record.recordType === 'TRIVIA' ? 'ANSWER' : 'VOTE')}
                  style={[styles.primaryButton, disabled && styles.disabledButton]}
                >
                  {busyId === record.id ? <ActivityIndicator color={WHITE} /> : <Text style={styles.primaryButtonText}>{(!allowMultiple && voted) ? 'Respuesta registrada' : record.recordType === 'TRIVIA' ? 'Enviar respuesta' : allowMultiple ? 'Enviar votos' : 'Votar'}</Text>}
                </Pressable>
              )
            })()}
          </View>
        ) : null}

        {isBoard ? (
          <View style={styles.questionComposer}>
            <TextInput
              value={questionDrafts[record.id] ?? ''}
              onChangeText={value => setQuestionDrafts(current => ({ ...current, [record.id]: value }))}
              placeholder="Escribe una pregunta para el equipo"
              placeholderTextColor="#9AA1AE"
              maxLength={200}
              multiline
              style={styles.questionInput}
            />
            <Pressable disabled={record.status !== 'ACTIVE' || !!busyId} onPress={() => void askQuestion(record)} style={[styles.primaryButton, (record.status !== 'ACTIVE' || !!busyId) && styles.disabledButton]}>
              {busyId === record.id ? <ActivityIndicator color={WHITE} /> : <><Feather name="send" size={15} color={WHITE} /><Text style={styles.primaryButtonText}>Enviar pregunta</Text></>}
            </Pressable>
          </View>
        ) : null}

        {isSong ? (
          <Pressable disabled={record.status !== 'ACTIVE' || voted || !!busyId} onPress={() => void performAction(record, 'VOTE')} style={[styles.primaryButton, (record.status !== 'ACTIVE' || voted || !!busyId) && styles.disabledButton]}>
            {busyId === record.id ? <ActivityIndicator color={WHITE} /> : <Text style={styles.primaryButtonText}>{voted ? 'Ya votaste por esta canción' : 'Votar por esta canción'}</Text>}
          </Pressable>
        ) : null}

        {code === 'INT' && record.recordType === 'QUESTION' ? (
          <Pressable disabled={record.status !== 'ACTIVE' || voted || !!busyId} onPress={() => void performAction(record, 'VOTE')} style={[styles.primaryButton, (record.status !== 'ACTIVE' || voted || !!busyId) && styles.disabledButton]}>
            {busyId === record.id ? <ActivityIndicator color={WHITE} /> : <Text style={styles.primaryButtonText}>{voted ? 'Ya votaste por esta pregunta' : 'Votar por esta pregunta'}</Text>}
          </Pressable>
        ) : null}

        {!isQueue && !isBooking && !isPoll && !isBoard && !isSong ? (
          <View style={styles.genericInfo}>
            {record.payload.category ? <Text style={styles.genericMeta}>{textValue(record.payload.category)}</Text> : null}
            {record.payload.organization ? <Text style={styles.genericMeta}>{textValue(record.payload.organization)}</Text> : null}
            {record.recordType === 'RESOURCE' && typeof record.payload.url === 'string' ? <Text style={styles.genericMeta}>Recurso disponible en el portal del evento</Text> : null}
            {['SESSION', 'EXHIBITOR', 'STAND', 'RESOURCE'].includes(record.recordType) ? renderActionButton(record, 'Guardar', 'SAVE', 'REMOVE') : null}
          </View>
        ) : null}
      </View>
    )
  }

  function renderAgenda() {
    const activities = agenda?.activities ?? []
    if (!activities.length) return <EmptyState message="La agenda todavía no tiene actividades publicadas." />
    return <>
      <View style={styles.featureBanner}><View style={styles.featureBannerIcon}><Feather name="bookmark" size={18} color={PURPLE} /></View><View style={styles.featureBannerCopy}><Text style={styles.featureBannerTitle}>{favoriteIds.length ? `${favoriteIds.length} actividad(es) guardada(s)` : 'Arma tu agenda personal'}</Text><Text style={styles.featureBannerText}>Guarda lo que te interesa, recibe un recordatorio y agrégalo al calendario del teléfono.</Text></View></View>
      {activities.map(item => {
        const favorite = favoriteIds.includes(item.id)
        const running = busyId === item.id
        return <View key={item.id} style={styles.card}>
          <View style={styles.metaRow}><Feather name="clock" size={15} color={PURPLE} /><Text style={styles.metaText}>{formatDate(item.startsAt)}</Text><View style={[styles.agendaTag, item.status === 'NOW' && styles.agendaTagNow]}><Text style={[styles.agendaTagText, item.status === 'NOW' && styles.agendaTagTextNow]}>{item.status === 'NOW' ? 'AHORA' : item.status === 'FINISHED' ? 'FINALIZADA' : 'PRÓXIMA'}</Text></View></View>
          <Text style={styles.recordTitle}>{item.title}</Text>
          {item.location ? <View style={styles.metaRow}><Feather name="map-pin" size={14} color={MUTED} /><Text style={styles.description}>{item.location}</Text></View> : null}
          {item.detail ? <Text style={styles.description}>{item.detail}</Text> : null}
          <View style={styles.agendaActions}>
            <Pressable disabled={!!busyId || item.status === 'FINISHED'} onPress={() => void toggleAgendaFavorite(item)} style={[styles.agendaAction, favorite && styles.agendaActionActive, (busyId || item.status === 'FINISHED') && styles.disabledButton]}>{running ? <ActivityIndicator color={PURPLE} /> : <><Feather name="bookmark" size={14} color={favorite ? WHITE : PURPLE} /><Text style={[styles.agendaActionText, favorite && styles.agendaActionTextActive]}>{favorite ? 'Guardada · aviso 15 min antes' : 'Guardar y recibir aviso'}</Text></>}</Pressable>
            <Pressable onPress={() => void addActivityToCalendar(item)} style={styles.calendarAction}><Feather name="calendar" size={14} color={NAVY} /><Text style={styles.calendarActionText}>Calendario</Text></Pressable>
          </View>
        </View>
      })}
    </>
  }

  function renderMap() {
    const locationEntries = mapLocation.filter(item => item.title || item.payload.tableLabel || item.payload.sectorLabel)
    return <>
      {locationEntries.length ? <View style={styles.assignmentBanner}><View style={styles.featureBannerIcon}><Feather name="map-pin" size={18} color={PURPLE} /></View><View style={styles.featureBannerCopy}><Text style={styles.featureBannerTitle}>Tu ubicación asignada</Text><Text style={styles.featureBannerText}>{locationEntries.map(item => [item.title, item.payload.tableLabel, item.payload.sectorLabel].filter(Boolean).join(' · ')).join('\n')}</Text></View></View> : null}
      <View style={styles.mapSearchBox}><Feather name="search" size={17} color={MUTED} /><TextInput value={mapQuery} onChangeText={value => { setMapQuery(value); if (value.trim().length < 2) setMapResults([]) }} onSubmitEditing={() => void runMapSearch()} returnKeyType="search" placeholder="Buscar mesa, zona, baño…" placeholderTextColor="#9AA1AE" style={styles.mapSearchInput} /><Pressable disabled={mapBusy || mapQuery.trim().length < 2} onPress={() => void runMapSearch()} style={styles.mapSearchButton}>{mapBusy ? <ActivityIndicator size="small" color={WHITE} /> : <Feather name="arrow-right" size={16} color={WHITE} />}</Pressable></View>
      <Text style={styles.mapHint}>Busca lugares, servicios, sesiones y puntos publicados para este evento.</Text>
      {mapResults.map(result => <View key={`${result.moduleCode}-${result.id}`} style={styles.mapResultCard}><View style={styles.mapResultIcon}><Feather name={result.moduleCode === 'MAP' ? 'map-pin' : 'grid'} size={17} color={PURPLE} /></View><View style={styles.mapResultCopy}><Text style={styles.mapResultTitle}>{result.title || 'Ubicación'}</Text><Text style={styles.mapResultDescription}>{textValue(result.payload.description) || [result.payload.tableLabel, result.payload.sectorLabel, result.payload.location].filter(Boolean).map(String).join(' · ') || `${result.moduleCode} · ${result.type}`}</Text></View>{typeof result.payload.x === 'number' && typeof result.payload.y === 'number' ? <View style={styles.coords}><Text style={styles.coordsText}>{Math.round(result.payload.x)}%, {Math.round(result.payload.y)}%</Text></View> : null}</View>)}
      {!mapResults.length ? <View style={styles.mapEmpty}><View style={styles.mapEmptyIcon}><Feather name="map" size={22} color={PURPLE} /></View><Text style={styles.emptyTitle}>{mapQuery.trim().length >= 2 ? 'Sin resultados todavía' : 'Encuentra lo que necesitas'}</Text><Text style={styles.emptyText}>{mapQuery.trim().length >= 2 ? 'Prueba con otro nombre o lugar.' : 'Busca zonas, mesas, servicios y puntos dentro del evento.'}</Text></View> : null}
    </>
  }

  function renderAssistance() {
    const configured = module.configuration?.categories
    const categories = Array.isArray(configured) ? configured.filter((item): item is string => typeof item === 'string') : ['INFORMATION', 'ACCESSIBILITY', 'FIRST_AID', 'EMERGENCY', 'OTHER']
    const labels: Record<string, string> = { INFORMATION: 'Información', ACCESSIBILITY: 'Accesibilidad', FIRST_AID: 'Primeros auxilios', EMERGENCY: 'Emergencia', OTHER: 'Otro' }
    return <>
      <View style={styles.helpBanner}><View style={styles.helpBannerIcon}><Feather name="life-buoy" size={20} color={PURPLE} /></View><View style={styles.featureBannerCopy}><Text style={styles.featureBannerTitle}>¿Necesitas ayuda?</Text><Text style={styles.featureBannerText}>Tu solicitud llegará al equipo del evento. Para emergencias médicas, selecciona primeros auxilios o emergencia.</Text></View></View>
      {categories.length ? <>
        <Text style={styles.fieldLabel}>¿Qué tipo de ayuda necesitas?</Text>
        <View style={styles.helpCategories}>{categories.map(category => <Pressable key={category} onPress={() => setHelpCategory(category)} style={[styles.helpCategory, helpCategory === category && styles.helpCategoryActive]}><Feather name={/FIRST_AID|EMERGENCY|PRIMEROS/i.test(category) ? 'alert-triangle' : category === 'ACCESSIBILITY' ? 'heart' : 'info'} size={14} color={helpCategory === category ? WHITE : PURPLE} /><Text style={[styles.helpCategoryText, helpCategory === category && styles.helpCategoryTextActive]}>{labels[category] || category.replace(/_/g, ' ')}</Text></Pressable>)}</View>
        <Text style={styles.fieldLabel}>¿Dónde estás?</Text><TextInput value={helpLocation} onChangeText={setHelpLocation} placeholder="Ej. salón principal, mesa 12" placeholderTextColor="#9AA1AE" style={styles.formInput} maxLength={120} />
        <Text style={styles.fieldLabel}>Cuéntanos un poco más <Text style={styles.optional}>· opcional</Text></Text><TextInput value={helpDetails} onChangeText={setHelpDetails} placeholder="Describe cómo podemos ayudarte" placeholderTextColor="#9AA1AE" style={[styles.formInput, styles.formTextArea]} maxLength={700} multiline textAlignVertical="top" />
        <Pressable disabled={busyId === 'assistance'} onPress={() => void submitAssistance()} style={[styles.primaryButton, busyId === 'assistance' && styles.disabledButton]}>{busyId === 'assistance' ? <ActivityIndicator color={WHITE} /> : <><Feather name="send" size={15} color={WHITE} /><Text style={styles.primaryButtonText}>Enviar solicitud</Text></>}</Pressable>
      </> : <EmptyState message="El organizador todavía no configuró las categorías de ayuda para este evento." />}
      <Text style={styles.privacyNote}>Solo el personal autorizado verá los detalles de tu solicitud.</Text>
    </>
  }

  function renderNetworking() {
    const visible = networkProfile?.payload.visible !== false
    const profileExists = networkProfile != null
    const suggestions = records.filter(record => record.status === 'ACTIVE' && record.payload.visible !== false)
    return <>
      <View style={styles.networkBanner}><View style={styles.featureBannerIcon}><Feather name="users" size={18} color={PURPLE} /></View><View style={styles.featureBannerCopy}><Text style={styles.featureBannerTitle}>Conecta con otros asistentes</Text><Text style={styles.featureBannerText}>Tú eliges si apareces en sugerencias. Tu perfil se puede ocultar en cualquier momento.</Text></View></View>
      {profileExists ? <View style={styles.networkProfileCard}>
        <View style={styles.networkProfileHeader}><View style={styles.networkAvatar}><Feather name="user" size={20} color={PURPLE} /></View><View style={styles.networkProfileCopy}><Text style={styles.networkProfileName}>{networkProfile.title || textValue(networkProfile.payload.displayName) || 'Tu perfil'}</Text><Text style={styles.networkProfileStatus}>{visible ? 'Visible para networking' : 'Oculto para otros asistentes'}</Text></View><View style={[styles.networkVisibility, !visible && styles.networkHidden]}><Feather name={visible ? 'eye' : 'eye-off'} size={16} color={visible ? GREEN : MUTED} /></View></View>
        <Text style={styles.networkProfileDescription}>{textValue(networkProfile.payload.bio) || textValue(networkProfile.payload.organization)}</Text>
        <Pressable disabled={busyId === 'network'} onPress={() => void setProfileVisible(!visible)} style={styles.networkToggle}>{busyId === 'network' ? <ActivityIndicator color={PURPLE} /> : <><Feather name={visible ? 'eye-off' : 'eye'} size={15} color={PURPLE} /><Text style={styles.networkToggleText}>{visible ? 'Ocultar mi perfil' : 'Volver a mostrarlo'}</Text></>}</Pressable>
      </View> : <View style={styles.networkForm}>
        <Text style={styles.formTitle}>Crea tu perfil</Text><Text style={styles.networkFormHint}>Comparte lo que quieras; contacto es opcional.</Text>
        <Text style={styles.fieldLabel}>Nombre para mostrar</Text><TextInput value={networkName} onChangeText={setNetworkName} placeholder="Tu nombre" placeholderTextColor="#9AA1AE" style={styles.formInput} maxLength={100} />
        <Text style={styles.fieldLabel}>Organización</Text><TextInput value={networkOrganization} onChangeText={setNetworkOrganization} placeholder="Empresa, equipo o institución" placeholderTextColor="#9AA1AE" style={styles.formInput} maxLength={140} />
        <Text style={styles.fieldLabel}>Sobre ti</Text><TextInput value={networkBio} onChangeText={setNetworkBio} placeholder="¿Qué te interesa conversar?" placeholderTextColor="#9AA1AE" style={[styles.formInput, styles.shortTextArea]} maxLength={500} multiline textAlignVertical="top" />
        <Text style={styles.fieldLabel}>Intereses</Text><TextInput value={networkInterests} onChangeText={setNetworkInterests} placeholder="Diseño, tecnología, sostenibilidad" placeholderTextColor="#9AA1AE" style={styles.formInput} maxLength={400} />
        <Text style={styles.fieldLabel}>Contacto <Text style={styles.optional}>· opcional</Text></Text><TextInput value={networkContact} onChangeText={setNetworkContact} placeholder="Correo o enlace profesional" placeholderTextColor="#9AA1AE" style={styles.formInput} maxLength={140} autoCapitalize="none" />
        <Pressable onPress={() => setNetworkConsent(value => !value)} style={styles.consentRow}><View style={[styles.consentCheck, networkConsent && styles.consentCheckActive]}>{networkConsent ? <Feather name="check" size={13} color={WHITE} /> : null}</View><Text style={styles.consentText}>Acepto aparecer en las sugerencias de networking del evento.</Text></Pressable>
        <Pressable disabled={busyId === 'network'} onPress={() => void publishProfile()} style={[styles.primaryButton, busyId === 'network' && styles.disabledButton]}>{busyId === 'network' ? <ActivityIndicator color={WHITE} /> : <><Feather name="user-plus" size={15} color={WHITE} /><Text style={styles.primaryButtonText}>Publicar perfil</Text></>}</Pressable>
      </View>}
      <Text style={styles.sectionHeading}>Personas para conocer</Text>
      {suggestions.map(person => {
        const contact = textValue(person.payload.contact)
        const name = textValue(person.payload.displayName) || person.title || 'Asistente'
        return <View key={person.id} style={styles.personCard}><View style={styles.personAvatar}><Text style={styles.personAvatarText}>{name.charAt(0).toLocaleUpperCase()}</Text></View><View style={styles.personCopy}><Text style={styles.personName}>{name}</Text>{textValue(person.payload.organization) ? <Text style={styles.personOrganization}>{textValue(person.payload.organization)}</Text> : null}{textValue(person.payload.bio) ? <Text style={styles.personBio}>{textValue(person.payload.bio)}</Text> : null}{Array.isArray(person.payload.interests) ? <Text style={styles.personInterests}>{(person.payload.interests as string[]).slice(0, 4).join(' · ')}</Text> : null}{contact ? <Pressable onPress={() => void Share.share({ message: `Conecta con ${name} en ${event.name}: ${contact}` })} style={styles.shareContact}><Feather name="share-2" size={13} color={PURPLE} /><Text style={styles.shareContactText}>Compartir contacto</Text></Pressable> : null}</View></View>
      })}
      {!suggestions.length ? <View style={styles.networkEmpty}><Feather name="users" size={22} color={PURPLE} /><Text style={styles.emptyTitle}>Aún no hay perfiles visibles</Text><Text style={styles.emptyText}>Cuando otras personas den su consentimiento, aparecerán sugerencias aquí.</Text></View> : null}
      <Text style={styles.privacyNote}>Solo se comparten los campos que escribes. No mostramos tu correo de cuenta.</Text>
    </>
  }

  function renderGallery() {
    const canManage = !!permissions && (permissions.owner || permissions.permissions.includes('ALL') || permissions.permissions.includes('FILES'))
    const canUpload = !DEMO_MODE && (canManage || module.configuration?.allowGuestUploads === true)
    const pending = eventFiles.filter(file => file.moderationStatus === 'PENDING')
    const photos = eventFiles.filter(file => file.moderationStatus === 'ACTIVE' && (galleryFilter === 'ALL' || file.official))
    return <>
      <View style={styles.galleryHero}><View style={styles.galleryHeroIcon}><Feather name="image" size={20} color={PURPLE} /></View><View style={styles.featureBannerCopy}><Text style={styles.featureBannerTitle}>Recuerdos compartidos</Text><Text style={styles.featureBannerText}>Comparte los mejores momentos del evento con otros asistentes.</Text></View></View>
      {canManage && !DEMO_MODE ? <Pressable onPress={() => setUploadOfficial(value => !value)} style={styles.officialToggle}><View style={[styles.consentCheck, uploadOfficial && styles.consentCheckActive]}>{uploadOfficial ? <Feather name="check" size={13} color={WHITE} /> : null}</View><Feather name="award" size={14} color={PURPLE} /><Text style={styles.officialToggleText}>Publicar como foto oficial del evento</Text></Pressable> : null}
      {canUpload ? <View style={styles.uploadActions}><Pressable disabled={!!busyId} onPress={() => void choosePhoto(false)} style={[styles.uploadButton, busyId === 'photo' && styles.disabledButton]}>{busyId === 'photo' ? <ActivityIndicator color={WHITE} /> : <><Feather name="image" size={16} color={WHITE} /><Text style={styles.uploadButtonText}>Elegir foto</Text></>}</Pressable><Pressable disabled={!!busyId} onPress={() => void choosePhoto(true)} style={styles.cameraButton}><Feather name="camera" size={16} color={PURPLE} /><Text style={styles.cameraButtonText}>Tomar foto</Text></Pressable></View> : <Text style={styles.galleryUploadHint}>{DEMO_MODE ? 'Conecta la app con la API para compartir fotos.' : 'El organizador todavía no habilita aportes de fotos para asistentes.'}</Text>}
      {pending.length ? <View style={styles.pendingNotice}><Feather name="clock" size={15} color="#A66E12" /><Text style={styles.pendingText}>{canManage ? `${pending.length} foto(s) esperan moderación.` : `${pending.length} foto(s) tuyas esperan revisión.`}</Text></View> : null}
      <View style={styles.galleryFilterRow}><Text style={styles.sectionHeading}>Galería del evento</Text><View style={styles.galleryFilters}><Pressable onPress={() => setGalleryFilter('ALL')} style={[styles.galleryFilter, galleryFilter === 'ALL' && styles.galleryFilterActive]}><Text style={[styles.galleryFilterText, galleryFilter === 'ALL' && styles.galleryFilterTextActive]}>Todas</Text></Pressable><Pressable onPress={() => setGalleryFilter('OFFICIAL')} style={[styles.galleryFilter, galleryFilter === 'OFFICIAL' && styles.galleryFilterActive]}><Text style={[styles.galleryFilterText, galleryFilter === 'OFFICIAL' && styles.galleryFilterTextActive]}>Oficiales</Text></Pressable></View></View>
      {photos.length ? <View style={styles.photoGrid}>{photos.map(file => <View key={file.id} style={styles.photoCard}><Image source={fileSources[file.id]} style={styles.photoImage} resizeMode="cover" /><View style={styles.photoFooter}><Text style={styles.photoName} numberOfLines={1}>{file.official ? 'Foto oficial' : 'Momento del evento'}</Text>{canManage && file.official ? <Feather name="award" size={13} color={PURPLE} /> : null}</View></View>)}</View> : <View style={styles.galleryEmpty}><View style={styles.mapEmptyIcon}><Feather name="camera" size={22} color={PURPLE} /></View><Text style={styles.emptyTitle}>{galleryFilter === 'OFFICIAL' ? 'Aún no hay fotos oficiales' : 'La galería empieza contigo'}</Text><Text style={styles.emptyText}>{galleryFilter === 'OFFICIAL' ? 'El organizador publicará la selección oficial al finalizar el evento.' : 'Comparte una foto para crear recuerdos con las demás personas.'}</Text></View>}
      {canManage && pending.length ? <View style={styles.moderationSection}><Text style={styles.sectionHeading}>En revisión</Text>{pending.map(file => <View key={file.id} style={styles.moderationCard}><Image source={fileSources[file.id]} style={styles.moderationImage} resizeMode="cover" /><View style={styles.moderationInfo}><Text style={styles.photoName} numberOfLines={1}>{file.originalName}</Text><Text style={styles.pendingLabel}>Pendiente de aprobación</Text><View style={styles.moderationActions}><Pressable disabled={!!busyId} onPress={() => void moderatePhoto(file, 'ACTIVE')} style={styles.approveButton}>{busyId === file.id ? <ActivityIndicator color={GREEN} /> : <><Feather name="check" size={14} color={GREEN} /><Text style={styles.approveText}>Aprobar</Text></>}</Pressable><Pressable disabled={!!busyId} onPress={() => void moderatePhoto(file, 'REJECTED')} style={styles.rejectButton}><Feather name="x" size={14} color={RED} /><Text style={styles.rejectText}>Rechazar</Text></Pressable></View></View></View>)}</View> : null}
      <Text style={styles.privacyNote}>Las fotos de asistentes pueden requerir aprobación antes de publicarse.</Text>
    </>
  }

  function renderMenu() {
    return (
      <>
        {menuCategories.map(category => {
          const items = menuItems.filter(item => item.parentRecordId === category.id)
          if (!items.length) return null
          return (
            <View key={category.id} style={styles.menuSection}>
              <Text style={styles.menuCategory}>{category.title}</Text>
              {items.map(item => {
                const quantity = cart[item.id] ?? 0
                const unavailable = item.payload.available === false || remainingCapacity(item) === 0
                return (
                  <View key={item.id} style={styles.menuItem}>
                    <View style={styles.menuItemCopy}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      {textValue(item.payload.description) ? <Text style={styles.menuDescription}>{textValue(item.payload.description)}</Text> : null}
                      <Text style={styles.menuPrice}>{priceLabel(item.payload.price)}</Text>
                    </View>
                    <View style={styles.quantityControl}>
                      <Pressable disabled={!quantity} onPress={() => updateCart(item, -1)} style={[styles.quantityButton, !quantity && styles.quantityDisabled]}><Feather name="minus" size={15} color={NAVY} /></Pressable>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <Pressable disabled={unavailable} onPress={() => updateCart(item, 1)} style={[styles.quantityButton, unavailable && styles.quantityDisabled]}><Feather name="plus" size={15} color={NAVY} /></Pressable>
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}

        {orders.length ? (
          <View style={styles.ordersCard}>
            <Text style={styles.ordersTitle}>Tus pedidos</Text>
            {orders.map(order => (
              <View key={order.id} style={styles.orderRow}>
                <View style={styles.orderCopy}><Text style={styles.orderName}>{order.title || 'Pedido'}</Text><Text style={styles.orderStatus}>{orderStatusLabel(order.status)}</Text></View>
                <View style={styles.orderActions}>
                  <Text style={styles.orderTotal}>{priceLabel(order.payload.total)}</Text>
                  {order.status === 'PENDING' ? <Pressable disabled={!!busyId} onPress={() => void cancelOrder(order)} style={styles.cancelOrderButton}><Text style={styles.cancelOrderText}>{busyId === order.id ? 'Cancelando…' : 'Cancelar'}</Text></Pressable> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

      </>
    )
  }

  const title = module.name || code
  const icon = ICONS[code] ?? 'grid'

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={NAVY} />
        </Pressable>
        <View style={styles.headerIcon}><Feather name={icon} size={20} color={PURPLE} /></View>
        <View style={styles.headerCopy}><Text style={styles.headerTitle} numberOfLines={1}>{title}</Text><Text style={styles.headerSubtitle}>{event.name}</Text></View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={PURPLE} />}
        contentContainerStyle={[styles.content, { paddingBottom: code === 'ORD' && cartCount ? 140 + insets.bottom : 36 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageDescription}>{module.description || 'Información y herramientas disponibles para este evento.'}</Text>

        {error ? (
          <View style={styles.errorCard}><Feather name="alert-circle" size={18} color={RED} /><Text style={styles.errorText}>{error}</Text></View>
        ) : null}

        {loading ? (
          <View style={styles.loadingState}><ActivityIndicator color={PURPLE} /><Text style={styles.loadingText}>Cargando información…</Text></View>
        ) : code === 'AGENDA' ? renderAgenda()
        : code === 'MAP' ? renderMap()
        : code === 'AST' ? renderAssistance()
        : code === 'GAL' ? renderGallery()
        : code === 'NET' ? renderNetworking()
        : code === 'ORD' ? (
          <>
            {renderMenu()}
            {!menuItems.length && !orders.length ? <EmptyState message="El menú aún no está disponible." /> : null}
          </>
        ) : records.length ? (
          records
            .filter(record => record.status !== 'ARCHIVED' && record.recordType !== 'MENU_ITEM' && record.recordType !== 'MENU_CATEGORY' && record.recordType !== 'ORDER')
            .map(renderRecord)
        ) : !error ? (
          <EmptyState message={code === 'NET' ? 'Aún no hay perfiles compatibles para conectar.' : 'Todavía no hay contenido publicado en este módulo.'} />
        ) : null}
      </ScrollView>
      {code === 'ORD' && cartCount ? (
        <View style={[styles.cartBar, { bottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View><Text style={styles.cartTitle}>{cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}</Text><Text style={styles.cartTotal}>Estimado {priceLabel(cartTotal)}</Text></View>
          <Pressable disabled={busyId === 'order'} onPress={() => void placeOrder()} style={[styles.cartButton, busyId === 'order' && styles.disabledButton]}>
            {busyId === 'order' ? <ActivityIndicator color={WHITE} /> : <><Text style={styles.primaryButtonText}>Enviar pedido</Text><Feather name="arrow-right" size={16} color={WHITE} /></>}
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Feather name="inbox" size={23} color={PURPLE} /></View>
      <Text style={styles.emptyTitle}>Aún no hay novedades</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE },
  header: { minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12, borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: WHITE },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#F3F4F8' },
  headerIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE_SOFT },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: { color: NAVY, fontSize: 14, fontWeight: '800' },
  headerSubtitle: { color: MUTED, fontSize: 11, marginTop: 3 },
  content: { padding: 20, gap: 13 },
  pageTitle: { marginTop: 3, color: NAVY, fontSize: 27, fontWeight: '800', letterSpacing: -0.5 },
  pageDescription: { color: MUTED, fontSize: 13, lineHeight: 19, marginTop: -7, marginBottom: 3 },
  card: { padding: 16, borderRadius: 19, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  recordIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE_SOFT },
  recordHeading: { flex: 1, minWidth: 0 },
  recordTitle: { color: NAVY, fontSize: 15, fontWeight: '800', lineHeight: 20 },
  recordType: { color: MUTED, fontSize: 10, letterSpacing: 0.45, textTransform: 'uppercase', marginTop: 3 },
  liveBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: '#EAF8F1' },
  liveBadgeText: { color: GREEN, fontSize: 9, fontWeight: '800' },
  closedBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F0F1F4' },
  closedBadgeText: { color: MUTED, fontSize: 9, fontWeight: '800' },
  description: { color: '#586276', fontSize: 12, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { flex: 1, color: MUTED, fontSize: 11 },
  capacityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 7, borderTopWidth: 1, borderTopColor: '#EEF0F4' },
  capacityLabel: { color: MUTED, fontSize: 10, fontWeight: '700' },
  positionBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 13, backgroundColor: PURPLE_SOFT },
  positionText: { flex: 1, color: NAVY, fontSize: 12, fontWeight: '700' },
  primaryButton: { minHeight: 44, paddingHorizontal: 15, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PURPLE },
  primaryButtonText: { color: WHITE, fontSize: 12, fontWeight: '800' },
  disabledButton: { opacity: 0.52 },
  pressed: { opacity: 0.78 },
  optionsList: { gap: 8 },
  option: { minHeight: 47, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionSelected: { borderColor: PURPLE, backgroundColor: '#FAF9FF' },
  optionVoted: { borderColor: '#B7E6CE', backgroundColor: '#F1FBF5' },
  optionLabel: { flex: 1, color: NAVY, fontSize: 12, fontWeight: '600' },
  radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: '#A8AFBC', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: PURPLE },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: PURPLE },
  checkbox: { borderRadius: 6 },
  checkboxDot: { width: 9, height: 9, borderRadius: 2 },
  questionComposer: { gap: 9 },
  questionInput: { minHeight: 74, maxHeight: 120, padding: 12, borderWidth: 1, borderColor: BORDER, borderRadius: 13, color: NAVY, fontSize: 12, textAlignVertical: 'top', backgroundColor: '#FCFCFE' },
  genericInfo: { gap: 8 },
  genericMeta: { color: MUTED, fontSize: 11 },
  menuSection: { padding: 15, borderRadius: 19, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE, gap: 5 },
  menuCategory: { marginBottom: 4, color: NAVY, fontSize: 17, fontWeight: '800' },
  menuItem: { minHeight: 76, paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#EFF0F4', flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuItemCopy: { flex: 1, gap: 3 },
  menuItemTitle: { color: NAVY, fontSize: 13, fontWeight: '700' },
  menuDescription: { color: MUTED, fontSize: 10, lineHeight: 14 },
  menuPrice: { color: PURPLE, fontSize: 12, fontWeight: '800', marginTop: 2 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  quantityButton: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE_SOFT },
  quantityDisabled: { opacity: 0.35 },
  quantityText: { minWidth: 14, color: NAVY, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  ordersCard: { padding: 15, borderRadius: 17, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE, gap: 10 },
  ordersTitle: { color: NAVY, fontSize: 15, fontWeight: '800' },
  orderRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EFF0F4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  orderCopy: { flex: 1, gap: 3 },
  orderActions: { alignItems: 'flex-end', gap: 6 },
  orderName: { color: NAVY, fontSize: 12, fontWeight: '700' },
  orderStatus: { color: MUTED, fontSize: 10, marginTop: 3 },
  orderTotal: { color: PURPLE, fontSize: 12, fontWeight: '800' },
  cancelOrderButton: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, backgroundColor: '#FFF0F1' },
  cancelOrderText: { color: RED, fontSize: 9, fontWeight: '800' },
  cartBar: { position: 'absolute', left: 14, right: 14, padding: 12, minHeight: 67, borderRadius: 17, backgroundColor: NAVY, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  cartTitle: { color: WHITE, fontSize: 12, fontWeight: '800' },
  cartTotal: { color: '#D2D8E5', fontSize: 10, marginTop: 4 },
  cartButton: { minHeight: 42, paddingHorizontal: 13, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: PURPLE },
  loadingState: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: MUTED, fontSize: 12 },
  emptyState: { minHeight: 190, padding: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 19, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE },
  emptyIcon: { width: 48, height: 48, marginBottom: 11, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE_SOFT },
  emptyTitle: { color: NAVY, fontSize: 14, fontWeight: '800' },
  emptyText: { maxWidth: 270, marginTop: 6, color: MUTED, fontSize: 11, lineHeight: 17, textAlign: 'center' },
  featureBanner: { minHeight: 76, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DDD7FA', borderRadius: 17, backgroundColor: '#FCFBFF' },
  assignmentBanner: { minHeight: 66, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DDD7FA', borderRadius: 16, backgroundColor: '#FCFBFF' },
  featureBannerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: PURPLE_SOFT },
  featureBannerCopy: { flex: 1, gap: 4 },
  featureBannerTitle: { color: NAVY, fontSize: 12, fontWeight: '800' },
  featureBannerText: { color: MUTED, fontSize: 10, lineHeight: 15 },
  agendaTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: '#F0F1F4' },
  agendaTagNow: { backgroundColor: '#EAF8F1' },
  agendaTagText: { color: MUTED, fontSize: 8, fontWeight: '800' },
  agendaTagTextNow: { color: GREEN },
  agendaActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  agendaAction: { minHeight: 38, flexGrow: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#DDD7FA', borderRadius: 11, backgroundColor: '#FFFFFF' },
  agendaActionActive: { borderColor: PURPLE, backgroundColor: PURPLE },
  agendaActionText: { color: PURPLE, fontSize: 9, fontWeight: '800' },
  agendaActionTextActive: { color: WHITE },
  calendarAction: { minHeight: 38, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 11, backgroundColor: '#F1F3F7' },
  calendarActionText: { color: NAVY, fontSize: 9, fontWeight: '800' },
  mapSearchBox: { minHeight: 51, padding: 6, paddingLeft: 13, alignItems: 'center', flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 15, backgroundColor: WHITE },
  mapSearchInput: { flex: 1, minWidth: 0, color: NAVY, fontSize: 12 },
  mapSearchButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: PURPLE },
  mapHint: { marginTop: -5, color: MUTED, fontSize: 10, lineHeight: 15 },
  mapResultCard: { minHeight: 66, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: BORDER, borderRadius: 15, backgroundColor: WHITE },
  mapResultIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: PURPLE_SOFT },
  mapResultCopy: { flex: 1, gap: 4 },
  mapResultTitle: { color: NAVY, fontSize: 11, fontWeight: '800' },
  mapResultDescription: { color: MUTED, fontSize: 9, lineHeight: 13 },
  coords: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9, backgroundColor: '#F1F3F7' },
  coordsText: { color: MUTED, fontSize: 8, fontWeight: '700' },
  mapEmpty: { minHeight: 152, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 17, backgroundColor: WHITE },
  mapEmptyIcon: { width: 45, height: 45, marginBottom: 3, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: PURPLE_SOFT },
  helpBanner: { minHeight: 84, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 17, backgroundColor: '#FCFBFF', borderWidth: 1, borderColor: '#DDD7FA' },
  helpBannerIcon: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: PURPLE_SOFT },
  fieldLabel: { marginTop: 3, color: NAVY, fontSize: 11, fontWeight: '800' },
  optional: { color: MUTED, fontWeight: '500' },
  helpCategories: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  helpCategory: { minHeight: 37, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#DDD7FA', borderRadius: 11, backgroundColor: WHITE },
  helpCategoryActive: { borderColor: PURPLE, backgroundColor: PURPLE },
  helpCategoryText: { color: PURPLE, fontSize: 9, fontWeight: '800', textTransform: 'capitalize' },
  helpCategoryTextActive: { color: WHITE },
  formInput: { minHeight: 45, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER, borderRadius: 12, color: NAVY, fontSize: 11, backgroundColor: WHITE },
  formTextArea: { minHeight: 92, paddingTop: 11 },
  shortTextArea: { minHeight: 74, paddingTop: 11 },
  privacyNote: { color: MUTED, fontSize: 9, lineHeight: 14, textAlign: 'center' },
  networkBanner: { minHeight: 76, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 17, backgroundColor: '#FCFBFF', borderWidth: 1, borderColor: '#DDD7FA' },
  networkForm: { padding: 15, gap: 9, borderWidth: 1, borderColor: BORDER, borderRadius: 17, backgroundColor: WHITE },
  formTitle: { color: NAVY, fontSize: 15, fontWeight: '800' },
  networkFormHint: { marginTop: -5, marginBottom: 3, color: MUTED, fontSize: 10 },
  consentRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 9 },
  consentCheck: { width: 19, height: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#A8AFBC', borderRadius: 6 },
  consentCheckActive: { borderColor: PURPLE, backgroundColor: PURPLE },
  consentText: { flex: 1, color: '#586276', fontSize: 9, lineHeight: 14 },
  networkProfileCard: { padding: 14, gap: 11, borderWidth: 1, borderColor: BORDER, borderRadius: 17, backgroundColor: WHITE },
  networkProfileHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  networkAvatar: { width: 41, height: 41, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: PURPLE_SOFT },
  networkProfileCopy: { flex: 1, gap: 3 },
  networkProfileName: { color: NAVY, fontSize: 13, fontWeight: '800' },
  networkProfileStatus: { color: GREEN, fontSize: 9, fontWeight: '700' },
  networkVisibility: { width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#EAF8F1' },
  networkHidden: { backgroundColor: '#F0F1F4' },
  networkProfileDescription: { color: '#586276', fontSize: 10, lineHeight: 15 },
  networkToggle: { minHeight: 38, paddingHorizontal: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 11, backgroundColor: PURPLE_SOFT },
  networkToggleText: { color: PURPLE, fontSize: 9, fontWeight: '800' },
  sectionHeading: { color: NAVY, fontSize: 13, fontWeight: '800' },
  personCard: { padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 15, backgroundColor: WHITE },
  personAvatar: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: PURPLE_SOFT },
  personAvatarText: { color: PURPLE, fontSize: 13, fontWeight: '800' },
  personCopy: { flex: 1, gap: 3 },
  personName: { color: NAVY, fontSize: 11, fontWeight: '800' },
  personOrganization: { color: PURPLE, fontSize: 9, fontWeight: '700' },
  personBio: { color: '#586276', fontSize: 9, lineHeight: 14 },
  personInterests: { color: MUTED, fontSize: 8, lineHeight: 13 },
  shareContact: { minHeight: 28, marginTop: 3, paddingHorizontal: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, backgroundColor: PURPLE_SOFT },
  shareContactText: { color: PURPLE, fontSize: 8, fontWeight: '800' },
  networkEmpty: { minHeight: 136, padding: 18, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 16, backgroundColor: WHITE },
  galleryHero: { minHeight: 74, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DDD7FA', borderRadius: 17, backgroundColor: '#FCFBFF' },
  galleryHeroIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: PURPLE_SOFT },
  uploadActions: { flexDirection: 'row', gap: 8 },
  officialToggle: { minHeight: 36, paddingHorizontal: 9, alignItems: 'center', flexDirection: 'row', gap: 7, borderRadius: 10, backgroundColor: '#F8F7FF' },
  officialToggleText: { color: PURPLE, fontSize: 9, fontWeight: '700' },
  uploadButton: { flex: 1, minHeight: 43, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, backgroundColor: PURPLE },
  uploadButtonText: { color: WHITE, fontSize: 10, fontWeight: '800' },
  cameraButton: { minHeight: 43, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#DDD7FA', borderRadius: 12, backgroundColor: WHITE },
  cameraButtonText: { color: PURPLE, fontSize: 10, fontWeight: '800' },
  galleryUploadHint: { color: MUTED, fontSize: 9, lineHeight: 14, textAlign: 'center' },
  pendingNotice: { minHeight: 36, paddingHorizontal: 10, alignItems: 'center', flexDirection: 'row', gap: 7, borderRadius: 11, backgroundColor: '#FFF7E8' },
  pendingText: { flex: 1, color: '#8A5C11', fontSize: 9, fontWeight: '700' },
  galleryFilterRow: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  galleryFilters: { flexDirection: 'row', gap: 4 },
  galleryFilter: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: '#F0F1F4' },
  galleryFilterActive: { backgroundColor: PURPLE_SOFT },
  galleryFilterText: { color: MUTED, fontSize: 8, fontWeight: '700' },
  galleryFilterTextActive: { color: PURPLE },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 9 },
  photoCard: { width: '48.5%', overflow: 'hidden', borderWidth: 1, borderColor: BORDER, borderRadius: 14, backgroundColor: WHITE },
  photoImage: { width: '100%', aspectRatio: 1, backgroundColor: '#ECEEF4' },
  photoFooter: { minHeight: 33, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  photoName: { flex: 1, color: NAVY, fontSize: 8, fontWeight: '700' },
  galleryEmpty: { minHeight: 172, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 17, backgroundColor: WHITE },
  moderationSection: { gap: 9 },
  moderationCard: { padding: 9, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 14, backgroundColor: WHITE },
  moderationImage: { width: 82, height: 82, borderRadius: 10, backgroundColor: '#ECEEF4' },
  moderationInfo: { flex: 1, justifyContent: 'center', gap: 6 },
  pendingLabel: { color: '#A66E12', fontSize: 8 },
  moderationActions: { flexDirection: 'row', gap: 6 },
  approveButton: { minHeight: 30, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9, backgroundColor: '#EAF8F1' },
  approveText: { color: GREEN, fontSize: 8, fontWeight: '800' },
  rejectButton: { minHeight: 30, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9, backgroundColor: '#FFF0F1' },
  rejectText: { color: RED, fontSize: 8, fontWeight: '800' },
  errorCard: { padding: 13, borderRadius: 13, backgroundColor: '#FFF0F1', flexDirection: 'row', gap: 9 },
  errorText: { flex: 1, color: RED, fontSize: 11, lineHeight: 16 },
})
