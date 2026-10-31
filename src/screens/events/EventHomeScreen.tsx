import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
  getEventAgenda,
  getEventCapacity,
  getEventModules,
  getEventPermissions,
  getEventRsvp,
  getPasses,
  updateEventRsvp,
} from '../../services/api'
import type {
  EventAgenda,
  EventCapacity,
  EventItem,
  EventModule,
  EventPass,
  EventRSVP,
  RSVPStatus,
} from '../../types/events'
import type { EventPermissions } from '../../services/api'

const NAVY = '#0B1D3A'

const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const SOFT = '#F7F8FA'
const BORDER = '#E9EBEF'
const MUTED = '#747C8E'
const DANGER = '#D64550'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('es-GT', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getSubtitle(event: EventItem) {
  if (
    event.name
      .toLowerCase()
      .includes('cumbre creativa')
  ) {
    return 'Ideas que transforman'
  }

  if (
    event.name
      .toLowerCase()
      .includes('noche de sabores')
  ) {
    return 'Una experiencia gastronómica única'
  }

  return 'Una experiencia creada para ti'
}

export function EventHomeScreen({
  route,
  navigation,
}: {
  route: any
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const event: EventItem =
    route.params.event

  const [modules, setModules] =
    useState<EventModule[] | null>(null)

  const [staffPermissions, setStaffPermissions] = useState<EventPermissions | null>(null)

  const [showAllModules, setShowAllModules] =
    useState(false)

  const [error, setError] =
    useState('')

  const [passes, setPasses] =
    useState<EventPass[] | null>(null)

  const [rsvp, setRsvp] =
    useState<EventRSVP | null>(null)

  const [capacity, setCapacity] =
    useState<EventCapacity | null>(null)

  const [agenda, setAgenda] =
    useState<EventAgenda | null>(null)

  const [
    agendaLoading,
    setAgendaLoading,
  ] = useState(true)

  const [
    agendaError,
    setAgendaError,
  ] = useState('')

  const [rsvpLoading, setRsvpLoading] =
    useState(true)

  const [rsvpSaving, setRsvpSaving] =
    useState(false)

  const eventPass =
    passes?.find(
      pass =>
        pass.eventId === event.id,
    ) ?? null

  const staffAccess = staffPermissions && (
    staffPermissions.owner ||
    staffPermissions.permissions.includes('ALL') ||
    staffPermissions.permissions.some(permission =>
      ['CHECK_IN', 'GUESTS', 'ASSISTANCE', 'FILES'].includes(permission) || permission.startsWith('ASSISTANCE:'),
    )
  )

  const visibleModules = modules
    ? showAllModules
      ? modules
      : (modules.filter(module => module.featured).length
          ? modules.filter(module => module.featured)
          : modules
        ).slice(0, 4)
    : []

  useEffect(() => {
    setError('')
    setModules(null)
    setShowAllModules(false)

    getEventModules(event.id)
      .then(setModules)
      .catch(error => {
        setModules([])
        setError(
          (error as Error).message,
        )
      })
  }, [event.id])

  useEffect(() => {
    let mounted = true
    getEventPermissions(event.id)
      .then(value => { if (mounted) setStaffPermissions(value) })
      .catch(() => { if (mounted) setStaffPermissions(null) })
    return () => { mounted = false }
  }, [event.id])

  useEffect(() => {
    setPasses(null)

    getPasses()
      .then(setPasses)
      .catch(() => {
        setPasses([])
      })
  }, [event.id])

  useEffect(() => {
    setRsvpLoading(true)

    Promise.all([
      getEventRsvp(event.id),
      getEventCapacity(event.id),
    ])
      .then(
        ([
          rsvpData,
          capacityData,
        ]) => {
          setRsvp(rsvpData)
          setCapacity(capacityData)
        },
      )
      .catch(() => {
        setRsvp(null)
        setCapacity(null)
      })
      .finally(() => {
        setRsvpLoading(false)
      })
  }, [event.id])

  useEffect(() => {
    let mounted = true

    setAgenda(null)
    setAgendaError('')
    setAgendaLoading(true)

    getEventAgenda(event.id)
      .then(data => {
        if (!mounted) return
        setAgenda(data)
      })
      .catch(error => {
        if (!mounted) return

        setAgenda(null)
        setAgendaError(
          (error as Error).message,
        )
      })
      .finally(() => {
        if (mounted) {
          setAgendaLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [event.id])

  function openEventPass() {
    if (passes === null) {
      Alert.alert(
        'Tu pase',
        'Estamos cargando la información de tu pase.',
      )

      return
    }

    if (!eventPass) {
      Alert.alert(
        'Tu pase',
        'Todavía no hay un pase asociado a este evento.',
      )

      return
    }

    navigation.navigate('Mis pases')
  }

  async function updateRsvp(
    status: RSVPStatus,
    companions =
      rsvp?.companions ?? 0,
  ) {
    if (!rsvp) {
      Alert.alert(
        'RSVP no disponible',
        'No pudimos cargar la información de tu invitación.',
      )

      return
    }

    const nextCompanions =
      status === 'DECLINED'
        ? 0
        : companions

    setRsvpSaving(true)

    try {
      const updated =
        await updateEventRsvp(
          event.id,
          {
            status,
            companions:
              nextCompanions,
          },
        )

      setRsvp(updated)

      Alert.alert(
        status === 'CONFIRMED'
          ? 'Asistencia confirmada'
          : status === 'DECLINED'
            ? 'Respuesta actualizada'
            : 'RSVP actualizado',
        status === 'CONFIRMED'
          ? 'Tu asistencia quedó confirmada.'
          : status === 'DECLINED'
            ? 'Marcaste que no podrás asistir.'
            : 'Tu respuesta fue actualizada.',
      )
    } catch (error) {
      Alert.alert(
        'No se pudo actualizar',
        (error as Error).message,
      )
    } finally {
      setRsvpSaving(false)
    }
  }

  function changeCompanions(
    delta: number,
  ) {
    if (!rsvp) {
      return
    }

    const max =
      rsvp.maxCompanions ?? 0

    const next = Math.max(
      0,
      Math.min(
        max,
        rsvp.companions + delta,
      ),
    )

    if (
      next === rsvp.companions
    ) {
      return
    }

    updateRsvp(
      rsvp.status,
      next,
    )
  }

  function openModule(module: EventModule) {
    const code = module.code.toUpperCase()
    if (code === 'ACCESS') {
      navigation.navigate('Mis pases')
      return
    }
    if (code === 'NEWS') {
      navigation.navigate('Notificaciones')
      return
    }
    navigation.navigate('Módulo del evento', { event, module })
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Feather
            name="arrow-left"
            size={26}
            color={NAVY}
          />
        </Pressable>

        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notificaciones')}
        >
          <Feather name="bell" size={21} color={NAVY} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              104 +
              Math.max(
                insets.bottom,
                10,
              ),
          },
        ]}
      >
        {/* NOMBRE */}
        <Text style={styles.title}>
          {event.name}
        </Text>

        <Text style={styles.subtitle}>
          {getSubtitle(event)}
        </Text>

        {/* INFORMACIÓN */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Feather
              name="calendar"
              size={26}
              color={NAVY}
            />

            <View style={styles.infoCopy}>
              <Text style={styles.infoMain}>
                {formatDate(
                  event.startsAt,
                )}
              </Text>

              <Text style={styles.infoSecondary}>
                {formatTime(
                  event.startsAt,
                )}
              </Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <Feather
              name="map-pin"
              size={28}
              color={NAVY}
            />

            <View style={styles.infoCopy}>
              <Text
                style={styles.infoMain}
                numberOfLines={2}
              >
                {event.location}
              </Text>

              <Text style={styles.infoSecondary}>
                Ubicación del evento
              </Text>
            </View>
          </View>
        </View>

        {/* CONFIRMACIÓN DE ASISTENCIA */}
        <View style={styles.rsvpCard}>
          <View style={styles.rsvpHeader}>
            <View style={styles.rsvpIcon}>
              <Feather
                name="check-circle"
                size={24}
                color={PURPLE}
              />
            </View>

            <View style={styles.rsvpCopy}>
              <Text style={styles.rsvpTitle}>
                Confirma tu asistencia
              </Text>

              <Text style={styles.rsvpDescription}>
                Indica si asistirás a este evento.
              </Text>
            </View>

            {rsvpLoading ? (
              <ActivityIndicator
                size="small"
                color={PURPLE}
              />
            ) : (
              <View
                style={[
                  styles.rsvpStatusBadge,
                  rsvp?.status === 'CONFIRMED'
                    ? styles.rsvpStatusConfirmed
                    : rsvp?.status === 'DECLINED'
                      ? styles.rsvpStatusDeclined
                      : styles.rsvpStatusPending,
                ]}
              >
                <Text
                  style={[
                    styles.rsvpStatusText,
                    rsvp?.status === 'CONFIRMED'
                      ? styles.rsvpStatusTextConfirmed
                      : rsvp?.status === 'DECLINED'
                        ? styles.rsvpStatusTextDeclined
                        : styles.rsvpStatusTextPending,
                  ]}
                >
                  {rsvp?.status === 'CONFIRMED'
                    ? 'Confirmado'
                    : rsvp?.status === 'DECLINED'
                      ? 'No asistiré'
                      : 'Pendiente'}
                </Text>
              </View>
            )}
          </View>

          {rsvp ? (
            <>
              <View style={styles.rsvpActions}>
                <Pressable
                  disabled={rsvpSaving}
                  style={({ pressed }) => [
                    styles.rsvpButton,
                    styles.rsvpButtonPrimary,
                    rsvp.status === 'CONFIRMED' &&
                      styles.rsvpButtonPrimarySelected,
                    rsvpSaving &&
                      styles.rsvpButtonDisabled,
                    pressed &&
                      !rsvpSaving &&
                      styles.pressed,
                  ]}
                  onPress={() =>
                    updateRsvp(
                      'CONFIRMED',
                    )
                  }
                >
                  <Feather
                    name="check"
                    size={18}
                    color={WHITE}
                  />

                  <Text style={styles.rsvpButtonPrimaryText}>
                    Sí, asistiré
                  </Text>
                </Pressable>

                <Pressable
                  disabled={rsvpSaving}
                  style={({ pressed }) => [
                    styles.rsvpButton,
                    styles.rsvpButtonSecondary,
                    rsvp.status === 'DECLINED' &&
                      styles.rsvpButtonSecondarySelected,
                    rsvpSaving &&
                      styles.rsvpButtonDisabled,
                    pressed &&
                      !rsvpSaving &&
                      styles.pressed,
                  ]}
                  onPress={() =>
                    updateRsvp(
                      'DECLINED',
                    )
                  }
                >
                  <Feather
                    name="x"
                    size={18}
                    color={
                      rsvp.status === 'DECLINED'
                        ? DANGER
                        : MUTED
                    }
                  />

                  <Text
                    style={[
                      styles.rsvpButtonSecondaryText,
                      rsvp.status === 'DECLINED' &&
                        styles.rsvpButtonSecondaryTextSelected,
                    ]}
                  >
                    No podré asistir
                  </Text>
                </Pressable>
              </View>

              {rsvp.maxCompanions !==
                undefined &&
              rsvp.maxCompanions > 0 ? (
                <View style={styles.companionsRow}>
                  <View style={styles.companionsCopy}>
                    <Text style={styles.companionsTitle}>
                      Acompañantes
                    </Text>

                    <Text style={styles.companionsText}>
                      Máximo permitido: {rsvp.maxCompanions}
                    </Text>
                  </View>

                  <View style={styles.companionsControl}>
                    <Pressable
                      disabled={
                        rsvpSaving ||
                        rsvp.companions <= 0
                      }
                      style={[
                        styles.companionButton,
                        (
                          rsvpSaving ||
                          rsvp.companions <= 0
                        ) &&
                          styles.companionButtonDisabled,
                      ]}
                      onPress={() =>
                        changeCompanions(-1)
                      }
                    >
                      <Feather
                        name="minus"
                        size={17}
                        color={NAVY}
                      />
                    </Pressable>

                    <Text style={styles.companionsValue}>
                      {rsvp.companions}
                    </Text>

                    <Pressable
                      disabled={
                        rsvpSaving ||
                        rsvp.companions >=
                          rsvp.maxCompanions
                      }
                      style={[
                        styles.companionButton,
                        (
                          rsvpSaving ||
                          rsvp.companions >=
                            rsvp.maxCompanions
                        ) &&
                          styles.companionButtonDisabled,
                      ]}
                      onPress={() =>
                        changeCompanions(1)
                      }
                    >
                      <Feather
                        name="plus"
                        size={17}
                        color={NAVY}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </>
          ) : !rsvpLoading ? (
            <View style={styles.rsvpUnavailable}>
              <Feather
                name="alert-circle"
                size={17}
                color={DANGER}
              />

              <Text style={styles.rsvpUnavailableText}>
                No fue posible cargar el RSVP de este evento.
              </Text>
            </View>
          ) : null}

          {capacity?.availableSpots !==
            undefined ||
          capacity?.capacity !==
            undefined ? (
            <View style={styles.capacityInfo}>
              <Feather
                name="users"
                size={16}
                color={MUTED}
              />

              <Text style={styles.capacityInfoText}>
                {capacity.availableSpots !==
                undefined
                  ? `Cupos disponibles: ${capacity.availableSpots}`
                  : `Capacidad del evento: ${capacity.capacity}`}
              </Text>
            </View>
          ) : null}

          <Text style={styles.rsvpNote}>
            En modo demo, los cambios se conservan durante la sesión actual.
          </Text>
        </View>

        {/* IMAGEN DEL EVENTO */}
        <ImageBackground
          source={require('../../../assets/event-login-background.png')}
          resizeMode="cover"
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={[
              'rgba(5,16,34,0.08)',
              'rgba(5,16,34,0.24)',
              'rgba(5,16,34,0.68)',
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroWords}>
            <Text style={styles.heroWord}>
              CREATIVIDAD
            </Text>

            <Text style={styles.heroWord}>
              INNOVACIÓN
            </Text>

            <Text style={styles.heroWord}>
              PERSONAS
            </Text>

            <View style={styles.heroLine} />
          </View>
        </ImageBackground>

        {/* TU PASE */}
        <Pressable
          style={({ pressed }) => [
            styles.passCard,
            pressed && styles.pressed,
          ]}
          onPress={openEventPass}
        >
          <View style={styles.ticketArea}>
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={35}
              color={NAVY}
            />
          </View>

          <View style={styles.passInfo}>
            <Text style={styles.passTitle}>
              Tu pase
            </Text>

            <Text style={styles.passPerson}>
              {passes === null
                ? 'Cargando pase...'
                : eventPass
                  ? eventPass.passType
                  : 'Sin pase asignado'}
            </Text>

            <Text style={styles.passRole}>
              {passes === null
                ? 'Consultando información'
                : eventPass
                  ? eventPass.offlineCopy
                    ? 'Copia guardada · valida el pase en línea'
                    : eventPass.qrValue
                      ? 'Pase digital disponible'
                      : 'Pase registrado · QR pendiente'
                  : 'No hay un pase asociado a este evento'}
            </Text>
          </View>

          <View style={styles.qrContainer}>
            {eventPass?.qrValue ? (
              <MaterialCommunityIcons
                name="qrcode"
                size={55}
                color={NAVY}
              />
            ) : (
              <Feather
                name={
                  passes === null
                    ? 'clock'
                    : 'info'
                }
                size={31}
                color={MUTED}
              />
            )}
          </View>

          <Feather
            name="chevron-right"
            size={24}
            color="#7D8493"
          />
        </Pressable>

        <View style={styles.exploreHeader}>
          <View>
            <Text style={styles.activitiesTitle}>Explora el evento</Text>
            <Text style={styles.liveNote}>Herramientas y servicios disponibles</Text>
          </View>
          {modules?.length ? <Text style={styles.moduleCount}>{modules.length} módulos</Text> : null}
        </View>

        {staffAccess ? (
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Centro del personal', { event })} style={({ pressed }) => [styles.staffEntry, pressed && styles.pressed]}>
            <View style={styles.staffEntryIcon}><Feather name="briefcase" size={17} color={PURPLE} /></View>
            <View style={styles.staffEntryCopy}><Text style={styles.staffEntryTitle}>Centro del personal</Text><Text style={styles.staffEntryDescription}>Acceso, invitados, ayuda y moderación</Text></View>
            <Feather name="chevron-right" size={18} color={MUTED} />
          </Pressable>
        ) : null}

        {!modules ? (
          <View style={styles.moduleLoading}>
            <ActivityIndicator size="small" color={PURPLE} />
            <Text style={styles.loadingText}>Cargando módulos…</Text>
          </View>
        ) : modules.length ? (
          <View style={styles.moduleGrid}>
            {visibleModules.map(module => {
              const code = module.code.toUpperCase()
              const icon = code === 'AGENDA' ? 'calendar' : code === 'ACCESS' ? 'credit-card' : code === 'NEWS' ? 'bell' : code === 'MAP' ? 'map' : code === 'QUE' ? 'users' : code === 'BKG' ? 'clock' : code === 'INT' ? 'message-circle' : code === 'ORD' ? 'shopping-bag' : code === 'GAL' ? 'image' : code === 'NET' ? 'user-plus' : code === 'AST' ? 'life-buoy' : 'grid'
              return (
                <Pressable
                  key={module.code}
                  accessibilityRole="button"
                  onPress={() => openModule(module)}
                  style={({ pressed }) => [styles.moduleCard, pressed && styles.pressed]}
                >
                  <View style={styles.moduleIcon}>
                    <Feather name={icon} size={19} color={PURPLE} />
                  </View>
                  <View style={styles.moduleCopy}>
                    <Text style={styles.moduleName} numberOfLines={1}>{module.name}</Text>
                    <Text style={styles.moduleDescription} numberOfLines={2}>{module.description || module.category || 'Explora este módulo'}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={MUTED} />
                </Pressable>
              )
            })}
          </View>
        ) : (
          <View style={styles.moduleEmpty}>
            <Feather name="grid" size={20} color={MUTED} />
            <Text style={styles.moduleEmptyText}>Este evento todavía no tiene módulos publicados.</Text>
          </View>
        )}

        {modules && modules.length > visibleModules.length ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowAllModules(value => !value)}
            style={styles.showAllModules}
          >
            <Text style={styles.showAllModulesText}>{showAllModules ? 'Mostrar menos' : `Ver los ${modules.length} módulos`}</Text>
            <Feather name={showAllModules ? 'chevron-up' : 'chevron-down'} size={16} color={PURPLE} />
          </Pressable>
        ) : null}

        {/* AHORA / SIGUIENTE */}
        <View style={styles.liveHeader}>
          <View>
            <Text style={styles.activitiesTitle}>
              Ahora / Siguiente
            </Text>

            <Text style={styles.liveNote}>
              Agenda operativa del evento
            </Text>
          </View>
        </View>

        <View style={styles.liveCard}>
          {agendaLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                size="small"
                color={PURPLE}
              />

              <Text style={styles.loadingText}>
                Cargando agenda...
              </Text>
            </View>
          ) : agendaError ? (
            <View style={styles.liveEmptyState}>
              <Feather
                name="calendar"
                size={22}
                color={MUTED}
              />

              <Text style={styles.liveEmptyText}>
                La agenda no está disponible en este momento.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.liveRow}>
                <View style={styles.nowBadge}>
                  <Text style={styles.nowBadgeText}>
                    Ahora
                  </Text>
                </View>

                <View style={styles.liveContent}>
                  <Text style={styles.liveTitle}>
                    {agenda?.current?.title ??
                      'Sin actividad en curso'}
                  </Text>

                  {agenda?.current ? (
                    <>
                      <View style={styles.liveMetaRow}>
                        <Feather
                          name="clock"
                          size={13}
                          color={MUTED}
                        />

                        <Text style={styles.liveMetaText}>
                          {formatTime(
                            agenda.current.startsAt,
                          )}
                        </Text>
                      </View>

                      <View style={styles.liveMetaRow}>
                        <Feather
                          name="map-pin"
                          size={13}
                          color={MUTED}
                        />

                        <Text
                          style={styles.liveMetaText}
                          numberOfLines={1}
                        >
                          {agenda.current.location ??
                            event.location}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.liveEmptyText}>
                      No hay una actividad marcada como actual.
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.liveDivider} />

              <View style={styles.liveRow}>
                <View style={styles.nextBadge}>
                  <Text style={styles.nextBadgeText}>
                    Siguiente
                  </Text>
                </View>

                <View style={styles.liveContent}>
                  <Text style={styles.liveTitle}>
                    {agenda?.next?.title ??
                      'Sin actividad siguiente'}
                  </Text>

                  {agenda?.next ? (
                    <>
                      <View style={styles.liveMetaRow}>
                        <Feather
                          name="clock"
                          size={13}
                          color={MUTED}
                        />

                        <Text style={styles.liveMetaText}>
                          {formatTime(
                            agenda.next.startsAt,
                          )}
                        </Text>
                      </View>

                      <View style={styles.liveMetaRow}>
                        <Feather
                          name="map-pin"
                          size={13}
                          color={MUTED}
                        />

                        <Text
                          style={styles.liveMetaText}
                          numberOfLines={1}
                        >
                          {agenda.next.location ??
                            event.location}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.liveEmptyText}>
                      No hay otra actividad programada.
                    </Text>
                  )}
                </View>
              </View>
            </>
          )}
        </View>

        {/* PRÓXIMAS ACTIVIDADES */}
        <View style={styles.activitiesHeader}>
          <Text style={styles.activitiesTitle}>
            Próximas actividades
          </Text>
        </View>

        <View style={styles.activities}>
          {!agendaLoading &&
          !agendaError &&
          agenda?.activities.length ? (
            agenda.activities
              .filter(
                activity =>
                  activity.status !==
                  'FINISHED',
              )
              .map(activity => (
                <View
                  key={activity.id}
                  style={styles.activityRow}
                >
                  <Text style={styles.activityTime}>
                    {formatTime(
                      activity.startsAt,
                    )}
                  </Text>

                  <View
                    style={
                      styles.activityContent
                    }
                  >
                    <Text
                      style={
                        styles.activityTitle
                      }
                    >
                      {activity.title}
                    </Text>

                    <Text
                      style={
                        styles.activityDetail
                      }
                    >
                      {activity.detail ||
                        activity.location ||
                        event.location}
                    </Text>
                  </View>

                  <Feather
                    name="calendar"
                    size={20}
                    color="#798190"
                  />
                </View>
              ))
          ) : !agendaLoading &&
            !agendaError ? (
            <View style={styles.agendaEmptyCard}>
              <Feather
                name="calendar"
                size={22}
                color={MUTED}
              />

              <Text style={styles.agendaEmptyText}>
                No hay próximas actividades publicadas.
              </Text>
            </View>
          ) : null}
        </View>

        {/* ESTADO API */}
        {error ? (
          <View style={styles.errorBox}>
            <Feather
              name="alert-circle"
              size={18}
              color="#B74C43"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : !modules ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator
              size="small"
              color={PURPLE}
            />

            <Text style={styles.loadingText}>
              Cargando información del evento...
            </Text>
          </View>
        ) : null}

        {/* VER MI PASE */}
        <Pressable
          style={({ pressed }) => [
            styles.passButtonWrapper,
            pressed && styles.pressed,
          ]}
          onPress={openEventPass}
        >
          <LinearGradient
            colors={[
              PURPLE,
              PURPLE_DARK,
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.passButton}
          >
            <Text style={styles.passButtonText}>
              Ver mi pase
            </Text>

            <MaterialCommunityIcons
              name="qrcode"
              size={25}
              color={WHITE}
            />
          </LinearGradient>
        </Pressable>
      </ScrollView>

      {/* BARRA INFERIOR */}
      <View
        style={[
          styles.bottomNavigation,
          {
            paddingBottom:
              Math.max(
                insets.bottom,
                10,
              ),
          },
        ]}
      >
        {/* INICIO GENERAL */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('Inicio')
          }
        >
          <Feather
            name="home"
            size={24}
            color="#737B8C"
          />

          <Text style={styles.navText}>
            Inicio
          </Text>
        </Pressable>

        {/* EVENTOS ACTIVO */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('Eventos')
          }
        >
          <Feather
            name="calendar"
            size={24}
            color={PURPLE}
          />

          <Text
            style={[
              styles.navText,
              styles.navTextActive,
            ]}
          >
            Eventos
          </Text>

          <View style={styles.navIndicator} />
        </Pressable>

        {/* NOTIFICACIONES */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'Notificaciones',
            )
          }
        >
          <Feather
            name="bell"
            size={24}
            color="#737B8C"
          />

          <Text style={styles.navText}>
            Notificaciones
          </Text>
        </Pressable>

        {/* PERFIL */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('Perfil')
          }
        >
          <Feather
            name="user"
            size={24}
            color="#737B8C"
          />

          <Text style={styles.navText}>
            Perfil
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },

  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  title: {
    color: NAVY,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: MUTED,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 3,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 25,
    marginBottom: 20,
  },

  infoBlock: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },

  infoCopy: {
    flex: 1,
  },

  infoMain: {
    color: NAVY,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '700',
  },

  infoSecondary: {
    color: MUTED,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 2,
  },

  rsvpCard: {
    marginTop: 4,
    marginBottom: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    backgroundColor: WHITE,
  },

  rsvpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rsvpIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  rsvpCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },

  rsvpTitle: {
    color: NAVY,
    fontSize: 14.5,
    fontWeight: '800',
  },

  rsvpDescription: {
    color: MUTED,
    fontSize: 10.5,
    marginTop: 3,
  },

  rsvpStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  rsvpStatusPending: {
    backgroundColor: PURPLE_SOFT,
  },

  rsvpStatusConfirmed: {
    backgroundColor: '#EAF8F1',
  },

  rsvpStatusDeclined: {
    backgroundColor: '#FFF0F1',
  },

  rsvpStatusText: {
    fontSize: 9.5,
    fontWeight: '700',
  },

  rsvpStatusTextPending: {
    color: PURPLE,
  },

  rsvpStatusTextConfirmed: {
    color: '#249B68',
  },

  rsvpStatusTextDeclined: {
    color: DANGER,
  },

  rsvpActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },

  rsvpButton: {
    flex: 1,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
  },

  rsvpButtonPrimary: {
    backgroundColor: PURPLE,
  },

  rsvpButtonPrimarySelected: {
    backgroundColor: PURPLE_DARK,
  },

  rsvpButtonSecondary: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SOFT,
  },

  rsvpButtonSecondarySelected: {
    borderColor: '#F0B8BE',
    backgroundColor: '#FFF4F5',
  },

  rsvpButtonPrimaryText: {
    color: WHITE,
    fontSize: 11.5,
    fontWeight: '700',
  },

  rsvpButtonSecondaryText: {
    color: MUTED,
    fontSize: 11.5,
    fontWeight: '700',
  },

  rsvpButtonSecondaryTextSelected: {
    color: DANGER,
  },

  rsvpButtonDisabled: {
    opacity: 0.55,
  },

  companionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 12,
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  companionsCopy: {
    flex: 1,
  },

  companionsTitle: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
  },

  companionsText: {
    color: MUTED,
    fontSize: 10,
    marginTop: 3,
  },

  companionsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  companionButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SOFT,
  },

  companionButtonDisabled: {
    opacity: 0.35,
  },

  companionsValue: {
    minWidth: 18,
    color: NAVY,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 13,
  },

  capacityInfoText: {
    flex: 1,
    color: MUTED,
    fontSize: 10.5,
  },

  rsvpUnavailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF0F1',
  },

  rsvpUnavailableText: {
    flex: 1,
    color: DANGER,
    fontSize: 10.5,
    lineHeight: 15,
  },

  rsvpNote: {
    color: MUTED,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 11,
  },

  hero: {
    height: 190,
    padding: 22,
    justifyContent: 'center',
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: NAVY,
  },

  heroImage: {
    borderRadius: 19,
  },

  heroWords: {
    alignSelf: 'flex-start',
  },

  heroWord: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 9,
    lineHeight: 19,
    letterSpacing: 3.1,
  },

  heroLine: {
    width: 27,
    height: 2,
    marginTop: 10,
    backgroundColor: PURPLE,
  },

  passCard: {
    minHeight: 106,
    marginTop: 17,
    paddingHorizontal: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  ticketArea: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  passInfo: {
    flex: 1,
    marginLeft: 10,
  },

  passTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '800',
  },

  passPerson: {
    color: '#4E5668',
    fontSize: 12,
    marginTop: 3,
  },

  passRole: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  qrContainer: {
    width: 70,
    height: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    marginRight: 5,
  },

  exploreHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  moduleCount: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
  },

  staffEntry: {
    minHeight: 60,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#DDD7FA',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FCFBFF',
  },

  staffEntryIcon: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: PURPLE_SOFT,
  },

  staffEntryCopy: { flex: 1, gap: 3 },
  staffEntryTitle: { color: NAVY, fontSize: 11, fontWeight: '800' },
  staffEntryDescription: { color: MUTED, fontSize: 9 },

  moduleGrid: {
    gap: 9,
  },

  moduleCard: {
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: WHITE,
  },

  moduleIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  moduleCopy: {
    flex: 1,
    minWidth: 0,
  },

  moduleName: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
  },

  moduleDescription: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },

  moduleLoading: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  moduleEmpty: {
    minHeight: 74,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: SOFT,
  },

  moduleEmptyText: {
    color: MUTED,
    fontSize: 11,
    textAlign: 'center',
  },

  showAllModules: {
    minHeight: 40,
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  showAllModulesText: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: '800',
  },

  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 17,
  },

  quickButton: {
    flex: 1,
    height: 91,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: SOFT,
  },

  quickText: {
    color: NAVY,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 10,
  },

  liveNote: {
    color: MUTED,
    fontSize: 10.5,
    marginTop: 3,
  },

  liveDemoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PURPLE_SOFT,
  },

  liveDemoBadgeText: {
    color: PURPLE,
    fontSize: 9.5,
    fontWeight: '800',
  },

  liveEmptyState: {
    minHeight: 94,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },

  liveEmptyText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
  },

  agendaEmptyCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: WHITE,
  },

  agendaEmptyText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
  },

  liveCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    backgroundColor: WHITE,
  },

  liveRow: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  liveDivider: {
    height: 1,
    backgroundColor: BORDER,
  },

  nowBadge: {
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#EAF8F1',
  },

  nowBadgeText: {
    color: '#249B68',
    fontSize: 10,
    fontWeight: '800',
  },

  nextBadge: {
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  nextBadgeText: {
    color: PURPLE,
    fontSize: 10,
    fontWeight: '800',
  },

  liveContent: {
    flex: 1,
    minWidth: 0,
  },

  liveTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },

  liveMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },

  liveMetaText: {
    flex: 1,
    color: MUTED,
    fontSize: 10.5,
  },

  activitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 7,
  },

  activitiesTitle: {
    color: NAVY,
    fontSize: 18,
    fontWeight: '800',
  },

  agendaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  agendaLinkText: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: '600',
  },

  activities: {
    marginTop: 2,
  },

  activityRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  activityPressed: {
    opacity: 0.7,
  },

  activityTime: {
    width: 82,
    color: '#555E70',
    fontSize: 11,
  },

  activityContent: {
    flex: 1,
    paddingRight: 8,
  },

  activityTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '600',
  },

  activityDetail: {
    color: MUTED,
    fontSize: 10.5,
    marginTop: 3,
  },

  passButtonWrapper: {
    marginTop: 22,
    borderRadius: 16,
    overflow: 'hidden',
  },

  passButton: {
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },

  passButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF0EE',
  },

  errorText: {
    flex: 1,
    color: '#B74C43',
    fontSize: 11,
  },

  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 13,
  },

  loadingText: {
    color: MUTED,
    fontSize: 10.5,
  },

  pressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 78,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    paddingTop: 7,
    paddingHorizontal: 12,

    backgroundColor: 'rgba(255,255,255,0.98)',

    borderTopWidth: 1,
    borderTopColor: BORDER,

    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 10,
  },

  navItem: {
    flex: 1,
    minHeight: 53,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  navText: {
    color: '#737B8C',
    fontSize: 9.5,
  },

  navTextActive: {
    color: PURPLE,
    fontWeight: '800',
  },

  navIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PURPLE,
  },
})
