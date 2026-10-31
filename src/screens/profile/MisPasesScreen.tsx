import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { DigitalPassQr } from '../../components/ui/DigitalPassQr'

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
  getCapacities,
  getPasses,
  getRsvps,
} from '../../services/api'

import type {
  EventCapacity,
  EventPass,
  EventPassStatus,
  EventRSVP,
} from '../../types/events'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_SOFT = '#F0EDFF'
const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#E2E5EC'
const MUTED = '#737D91'
const SUCCESS = '#249B68'
const WARNING = '#C68418'
const DANGER = '#D64550'

function statusInfo(
  status: EventPassStatus,
) {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Activo',
        color: SUCCESS,
        background: '#EAF8F1',
      }

    case 'PENDING':
      return {
        label: 'Pendiente',
        color: WARNING,
        background: '#FFF6E5',
      }

    case 'DECLINED':
      return {
        label: 'No asistiré',
        color: DANGER,
        background: '#FFF0F1',
      }

    case 'USED':
      return {
        label: 'Utilizado',
        color: MUTED,
        background: '#F0F1F4',
      }

    case 'REVOKED':
      return {
        label: 'Revocado',
        color: DANGER,
        background: '#FFF0F1',
      }
  }
}

function rsvpLabel(
  rsvp?: EventRSVP,
) {
  if (!rsvp) {
    return 'Sin información'
  }

  switch (rsvp.status) {
    case 'CONFIRMED':
      return 'Confirmado'
    case 'DECLINED':
      return 'No asistiré'
    case 'PENDING':
    default:
      return 'Pendiente'
  }
}

function accessLabel(
  pass: EventPass,
) {
  if (pass.status === 'REVOKED') {
    return 'Acceso revocado'
  }

  if (pass.status === 'DECLINED') {
    return 'Invitación declinada'
  }

  switch (pass.accessStatus) {
    case 'CHECKED_IN':
      return 'Dentro del evento'
    case 'CHECKED_OUT':
      return pass.reentryAllowed
        ? 'Fuera · reingreso permitido'
        : 'Salida registrada'
    case 'OUTSIDE':
    default:
      return 'Aún no ha ingresado'
  }
}

function formatOptionalDateTime(
  value?: string,
) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return `${date.toLocaleDateString(
    'es-GT',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  )} · ${date.toLocaleTimeString(
    'es-GT',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )}`
}

function formatDate(
  value: string,
) {
  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return date.toLocaleDateString(
    'es-GT',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}

function formatTime(
  value: string,
) {
  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  return date.toLocaleTimeString(
    'es-GT',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )
}

export function MisPasesScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets =
    useSafeAreaInsets()

  const [passes, setPasses] =
    useState<EventPass[] | null>(
      null,
    )

  const [rsvps, setRsvps] =
    useState<EventRSVP[]>([])

  const [capacities, setCapacities] =
    useState<EventCapacity[]>([])

  const [error, setError] =
    useState(false)

  const [expandedPassId, setExpandedPassId] =
    useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    Promise.allSettled([
      getPasses(),
      getRsvps(),
      getCapacities(),
    ])
      .then(([passesResult, rsvpsResult, capacitiesResult]) => {
        if (!mounted) return
        if (passesResult.status === 'fulfilled') {
          setPasses(passesResult.value)
          setError(false)
        } else {
          setPasses([])
          setError(true)
        }
        setRsvps(rsvpsResult.status === 'fulfilled' ? rsvpsResult.value : [])
        setCapacities(capacitiesResult.status === 'fulfilled' ? capacitiesResult.value : [])
      })
    return () => { mounted = false }
  }, [])

  const activePasses =
    useMemo(
      () =>
        passes?.filter(
          pass =>
            pass.status ===
              'ACTIVE' ||
            pass.status ===
              'PENDING',
        ) ?? [],
      [passes],
    )

  const otherPasses =
    useMemo(
      () =>
        passes?.filter(
          pass =>
            pass.status !==
              'ACTIVE' &&
            pass.status !==
              'PENDING',
        ) ?? [],
      [passes],
    )

  function renderPass(
    pass: EventPass,
  ) {
    const status =
      statusInfo(pass.status)

    const rsvp =
      rsvps.find(
        item =>
          item.eventId ===
          pass.eventId,
      )

    const capacity =
      capacities.find(
        item =>
          item.eventId ===
          pass.eventId,
      )

    const checkedIn =
      formatOptionalDateTime(
        pass.checkedInAt,
      )

    const checkedOut =
      formatOptionalDateTime(
        pass.checkedOutAt,
      )

    return (
      <Pressable
        key={pass.id}
        onPress={() => {
          if (pass.qrValue && pass.status === 'ACTIVE') {
            setExpandedPassId(current => current === pass.id ? null : pass.id)
          }
        }}
        style={({ pressed }) => [
          styles.passCard,
          pressed &&
            styles.passCardPressed,
        ]}
      >
        <View
          style={
            styles.passTopRow
          }
        >
          <View
            style={
              styles.passIcon
            }
          >
            <Feather
              name="credit-card"
              size={23}
              color={PURPLE}
            />
          </View>

          <View
            style={
              styles.passHeading
            }
          >
            <Text
              style={
                styles.eventName
              }
              numberOfLines={2}
            >
              {pass.eventName}
            </Text>

            <Text
              style={
                styles.passType
              }
            >
              {pass.passType}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status.background,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    status.color,
                },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {pass.offlineCopy ? <View style={styles.offlineNotice}><Feather name="wifi-off" size={14} color="#946315" /><Text style={styles.offlineNoticeText}>Copia guardada en este dispositivo. El pase puede haberse actualizado o revocado mientras estabas sin conexión.</Text></View> : null}

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.detailRow
          }
        >
          <Feather
            name="calendar"
            size={17}
            color={MUTED}
          />

          <Text
            style={
              styles.detailText
            }
          >
            {formatDate(
              pass.startsAt,
            )}
          </Text>
        </View>

        <View
          style={
            styles.detailRow
          }
        >
          <Feather
            name="clock"
            size={17}
            color={MUTED}
          />

          <Text
            style={
              styles.detailText
            }
          >
            {formatTime(
              pass.startsAt,
            )}
          </Text>
        </View>

        <View
          style={
            styles.detailRow
          }
        >
          <Feather
            name="map-pin"
            size={17}
            color={MUTED}
          />

          <Text
            style={
              styles.detailText
            }
            numberOfLines={2}
          >
            {pass.location}
          </Text>
        </View>

        <View style={styles.passMetaGrid}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>
              RSVP
            </Text>

            <Text style={styles.metaValue}>
              {rsvpLabel(rsvp)}
            </Text>
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>
              Acompañantes
            </Text>

            <Text style={styles.metaValue}>
              {rsvp
                ? `${rsvp.companions}${
                    rsvp.maxCompanions !==
                    undefined
                      ? ` / ${rsvp.maxCompanions}`
                      : ''
                  }`
                : 'Sin información'}
            </Text>
          </View>
        </View>

        <View style={styles.accessCard}>
          <View style={styles.accessHeading}>
            <Feather
              name="log-in"
              size={18}
              color={NAVY}
            />

            <Text style={styles.accessTitle}>
              Estado de acceso
            </Text>
          </View>

          <Text style={styles.accessStatus}>
            {accessLabel(pass)}
          </Text>

          {checkedIn ? (
            <Text style={styles.accessDetail}>
              Check-in: {checkedIn}
            </Text>
          ) : null}

          {checkedOut ? (
            <Text style={styles.accessDetail}>
              Check-out: {checkedOut}
            </Text>
          ) : null}

          <Text style={styles.accessDetail}>
            Reingreso:{' '}
            {pass.reentryAllowed === true
              ? 'Permitido'
              : pass.reentryAllowed === false
                ? 'No permitido'
                : 'No informado'}
          </Text>
        </View>

        {capacity?.capacity !==
          undefined ||
        capacity?.availableSpots !==
          undefined ? (
          <View style={styles.capacityRow}>
            <Feather
              name="users"
              size={16}
              color={MUTED}
            />

            <Text style={styles.capacityText}>
              {capacity.availableSpots !==
              undefined
                ? `Cupos disponibles: ${capacity.availableSpots}`
                : capacity.capacity !==
                    undefined
                  ? `Capacidad del evento: ${capacity.capacity}`
                  : ''}
            </Text>
          </View>
        ) : null}

        <View
          style={
            styles.passFooter
          }
        >
          {pass.qrValue && pass.status === 'ACTIVE' ? (
            <View
              style={
                styles.qrAvailable
              }
            >
              <Feather
                name="check-circle"
                size={17}
                color={SUCCESS}
              />

              <Text
                style={
                  styles.qrAvailableText
                }
              >
                {pass.offlineCopy ? 'Toca para mostrar tu QR guardado' : 'Toca para mostrar tu QR'}
              </Text>
            </View>
          ) : pass.qrValue ? (
            <View style={styles.qrPending}>
              <Feather name="clock" size={17} color={WARNING} />
              <Text style={styles.qrPendingText}>El QR se activará cuando confirmes tu invitación</Text>
            </View>
          ) : (
            <View
              style={
                styles.qrPending
              }
            >
              <Feather
                name="info"
                size={17}
                color={MUTED}
              />

              <Text
                style={
                  styles.qrPendingText
                }
              >
                QR pendiente de sincronización
              </Text>
            </View>
          )}

          {pass.qrValue && pass.status === 'ACTIVE' ? (
            <Feather
              name={expandedPassId === pass.id ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={PURPLE}
            />
          ) : null}
        </View>

        {expandedPassId === pass.id && pass.qrValue ? (
          <View style={styles.qrExpanded}>
            <DigitalPassQr value={pass.qrValue} size={196} />
            <Text style={styles.qrHint}>
              {pass.offlineCopy ? 'Copia guardada. El equipo debe validar el pase con conexión antes de registrar el acceso.' : 'Muestra este código al personal de acceso para registrar tu entrada.'}
            </Text>
          </View>
        ) : null}
      </Pressable>
    )
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar style="dark" />

      {/* HEADER */}

      <View
        style={styles.header}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.buttonPressed,
          ]}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Feather
            name="arrow-left"
            size={23}
            color={NAVY}
          />
        </Pressable>

        <Text
          style={styles.brand}
        >
          Event
          <Text
            style={
              styles.brandAccent
            }
          >
            Flow
          </Text>
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              110 +
              Math.max(
                insets.bottom,
                10,
              ),
          },
        ]}
      >
        <View
          style={
            styles.headingArea
          }
        >
          <Text
            style={styles.heading}
          >
            Mis pases
          </Text>

          <Text
            style={
              styles.subheading
            }
          >
            Consulta tus accesos a
            eventos
          </Text>
        </View>

        {passes === null ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={PURPLE}
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Cargando tus pases...
            </Text>
          </View>
        ) : error ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Feather
                name="wifi-off"
                size={30}
                color={PURPLE}
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No pudimos cargar tus
              pases
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Verifica tu conexión e
              inténtalo nuevamente.
            </Text>
          </View>
        ) : passes.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Feather
                name="credit-card"
                size={30}
                color={PURPLE}
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Aún no tienes pases
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Cuando tengas acceso a
              un evento, tu pase
              aparecerá aquí.
            </Text>
          </View>
        ) : (
          <>
            {activePasses.length >
            0 ? (
              <>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Pases activos
                </Text>

                <View
                  style={
                    styles.passList
                  }
                >
                  {activePasses.map(
                    renderPass,
                  )}
                </View>
              </>
            ) : null}

            {otherPasses.length >
            0 ? (
              <>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Historial
                </Text>

                <View
                  style={
                    styles.passList
                  }
                >
                  {otherPasses.map(
                    renderPass,
                  )}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* BOTTOM NAV */}

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
        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'Inicio',
            )
          }
        >
          <Feather
            name="home"
            size={24}
            color="#747C8E"
          />

          <Text
            style={
              styles.navText
            }
          >
            Inicio
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'Eventos',
            )
          }
        >
          <Feather
            name="calendar"
            size={24}
            color="#747C8E"
          />

          <Text
            style={
              styles.navText
            }
          >
            Eventos
          </Text>
        </Pressable>

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
            color="#747C8E"
          />

          <Text
            style={
              styles.navText
            }
          >
            Notificaciones
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'Perfil',
            )
          }
        >
          <Feather
            name="user"
            size={24}
            color={PURPLE}
          />

          <Text
            style={[
              styles.navText,
              styles.navTextActive,
            ]}
          >
            Perfil
          </Text>

          <View
            style={
              styles.navIndicator
            }
          />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        BACKGROUND,
    },

    header: {
      height: 72,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      paddingHorizontal: 22,
    },

    backButton: {
      width: 42,
      height: 42,

      borderRadius: 21,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor: WHITE,

      borderWidth: 1,
      borderColor: BORDER,
    },

    headerSpacer: {
      width: 42,
      height: 42,
    },

    brand: {
      color: NAVY,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.8,
    },

    brandAccent: {
      color: PURPLE,
    },

    scroll: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 22,
    },

    headingArea: {
      marginTop: 15,
      marginBottom: 22,
    },

    heading: {
      color: NAVY,
      fontSize: 31,
      fontWeight: '800',
      letterSpacing: -0.8,
    },

    subheading: {
      color: MUTED,
      fontSize: 14,
      marginTop: 5,
    },

    sectionTitle: {
      color: NAVY,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 11,
    },

    passList: {
      gap: 12,
      marginBottom: 24,
    },

    passCard: {
      padding: 17,

      borderWidth: 1,
      borderColor: BORDER,

      borderRadius: 20,

      backgroundColor: WHITE,
    },

    passCardPressed: {
      opacity: 0.76,
    },

    passTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    passIcon: {
      width: 48,
      height: 48,

      borderRadius: 15,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        PURPLE_SOFT,
    },

    passHeading: {
      flex: 1,
      minWidth: 0,
      marginLeft: 12,
      marginRight: 8,
    },

    eventName: {
      color: NAVY,
      fontSize: 15,
      fontWeight: '800',
    },

    passType: {
      color: MUTED,
      fontSize: 11.5,
      marginTop: 3,
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },

    statusText: {
      fontSize: 10.5,
      fontWeight: '700',
    },

    offlineNotice: {
      minHeight: 43,
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 11,
      backgroundColor: '#FFF7E8',
    },

    offlineNoticeText: {
      flex: 1,
      color: '#80580F',
      fontSize: 9,
      lineHeight: 14,
    },

    divider: {
      height: 1,
      backgroundColor: BORDER,
      marginVertical: 15,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 10,

      marginBottom: 10,
    },

    detailText: {
      flex: 1,
      color: '#566074',
      fontSize: 12,
      lineHeight: 17,
    },

    passMetaGrid: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
      marginBottom: 12,
    },

    metaBox: {
      flex: 1,
      minHeight: 60,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor:
        '#F7F7FA',
    },

    metaLabel: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '600',
    },

    metaValue: {
      color: NAVY,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 4,
    },

    accessCard: {
      padding: 13,
      borderRadius: 15,
      backgroundColor:
        PURPLE_SOFT,
      marginBottom: 11,
    },

    accessHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    accessTitle: {
      color: NAVY,
      fontSize: 11.5,
      fontWeight: '800',
    },

    accessStatus: {
      color: PURPLE,
      fontSize: 12.5,
      fontWeight: '800',
      marginTop: 8,
    },

    accessDetail: {
      color: MUTED,
      fontSize: 10.5,
      lineHeight: 16,
      marginTop: 4,
    },

    capacityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginBottom: 5,
    },

    capacityText: {
      flex: 1,
      color: MUTED,
      fontSize: 10.5,
    },

    passFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      marginTop: 5,
      paddingTop: 13,

      borderTopWidth: 1,
      borderTopColor: BORDER,
    },

    qrAvailable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    qrAvailableText: {
      color: SUCCESS,
      fontSize: 11.5,
      fontWeight: '700',
    },

    qrExpanded: {
      marginTop: 17,
      paddingTop: 17,
      borderTopWidth: 1,
      borderTopColor: BORDER,
      alignItems: 'center',
      gap: 12,
    },

    qrHint: {
      maxWidth: 260,
      color: MUTED,
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
    },

    qrPending: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    qrPendingText: {
      flex: 1,
      color: MUTED,
      fontSize: 11.5,
    },

    loadingContainer: {
      minHeight: 270,

      alignItems: 'center',
      justifyContent:
        'center',

      gap: 13,
    },

    loadingText: {
      color: MUTED,
      fontSize: 13,
    },

    emptyCard: {
      minHeight: 245,

      alignItems: 'center',
      justifyContent:
        'center',

      paddingHorizontal: 30,

      borderWidth: 1,
      borderColor: BORDER,

      borderRadius: 22,

      backgroundColor: WHITE,
    },

    emptyIcon: {
      width: 66,
      height: 66,

      borderRadius: 21,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        PURPLE_SOFT,

      marginBottom: 15,
    },

    emptyTitle: {
      color: NAVY,
      fontSize: 17,
      fontWeight: '800',
      textAlign: 'center',
    },

    emptyText: {
      color: MUTED,
      fontSize: 12.5,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 7,
    },

    buttonPressed: {
      opacity: 0.7,
    },

    bottomNavigation: {
      position: 'absolute',

      left: 0,
      right: 0,
      bottom: 0,

      minHeight: 80,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-around',

      paddingTop: 7,
      paddingHorizontal: 12,

      backgroundColor:
        'rgba(255,255,255,0.98)',

      borderTopWidth: 1,
      borderTopColor: BORDER,

      elevation: 10,
    },

    navItem: {
      flex: 1,

      minHeight: 55,

      alignItems: 'center',
      justifyContent:
        'center',

      gap: 4,
    },

    navText: {
      color: '#747C8E',
      fontSize: 9.5,
    },

    navTextActive: {
      color: PURPLE,
      fontWeight: '700',
    },

    navIndicator: {
      width: 5,
      height: 5,

      borderRadius: 3,

      backgroundColor:
        PURPLE,
    },
  })
