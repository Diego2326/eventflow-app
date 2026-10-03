import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { api } from '../../services/api'
import type { EventItem } from '../../types/events'

const NAVY = '#0B1D3A'
const NAVY_SOFT = '#173456'

const PURPLE = '#6848E7'
const PURPLE_SOFT = '#F0EDFF'

const BACKGROUND = '#F7F7FA'
const WHITE = '#FFFFFF'
const MUTED = '#747C8E'
const BORDER = '#E8EAF0'

const MONTHS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
]

function getEventDate(event: EventItem) {
  return new Date(event.startsAt)
}

function isPastEvent(event: EventItem) {
  return getEventDate(event).getTime() < Date.now()
}

function isToday(event: EventItem) {
  const date = getEventDate(event)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function formatLongDate(value: string) {
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

function formatDay(value: string) {
  return new Date(value)
    .getDate()
    .toString()
    .padStart(2, '0')
}

function formatMonth(value: string) {
  return MONTHS[new Date(value).getMonth()]
}

type EventCardProps = {
  event: EventItem
  past?: boolean
  onPress: () => void
}

function EventCard({
  event,
  past = false,
  onPress,
}: EventCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.eventCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.dateBox}>
        <Text style={styles.dateDay}>
          {formatDay(event.startsAt)}
        </Text>

        <Text style={styles.dateMonth}>
          {formatMonth(event.startsAt)}
        </Text>
      </View>

      <View style={styles.eventCardContent}>
        <Text
          style={styles.eventCardTitle}
          numberOfLines={1}
        >
          {event.name}
        </Text>

        <Text
          style={styles.eventCardType}
          numberOfLines={1}
        >
          {event.type}
        </Text>

        <View style={styles.eventMetaRow}>
          <View style={styles.metaItem}>
            <Feather
              name="clock"
              size={14}
              color={MUTED}
            />

            <Text style={styles.metaText}>
              {formatTime(event.startsAt)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Feather
              name="map-pin"
              size={14}
              color={MUTED}
            />

            <Text
              style={styles.metaText}
              numberOfLines={1}
            >
              {event.location}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            past
              ? styles.statusPast
              : styles.statusUpcoming,
          ]}
        >
          <Feather
            name={past ? 'check' : 'calendar'}
            size={12}
            color={
              past
                ? '#60697A'
                : PURPLE
            }
          />

          <Text
            style={[
              styles.statusText,
              {
                color: past
                  ? '#60697A'
                  : PURPLE,
              },
            ]}
          >
            {past ? 'Finalizado' : 'Próximo'}
          </Text>
        </View>
      </View>

      <Feather
        name="chevron-right"
        size={24}
        color="#858C9B"
      />
    </Pressable>
  )
}

export function EventsScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const [items, setItems] =
    useState<EventItem[] | null>(null)

  const [error, setError] =
    useState('')

  const [refreshing, setRefreshing] =
    useState(false)

  const loadEvents = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true)
      }

      setError('')

      try {
        const result =
          await api<EventItem[]>('/events')

        setItems(result)
      } catch (error) {
        setError(
          (error as Error).message,
        )
      } finally {
        if (refresh) {
          setRefreshing(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const sortedEvents = useMemo(() => {
    return [...(items ?? [])].sort(
      (a, b) =>
        getEventDate(a).getTime() -
        getEventDate(b).getTime(),
    )
  }, [items])

  const upcomingEvents = useMemo(() => {
    return sortedEvents.filter(
      event => !isPastEvent(event),
    )
  }, [sortedEvents])

  const previousEvents = useMemo(() => {
    return [...sortedEvents]
      .filter(isPastEvent)
      .reverse()
  }, [sortedEvents])

  const featuredEvent =
    upcomingEvents[0]

  const remainingUpcoming =
    upcomingEvents.slice(1)

  function openEvent(event: EventItem) {
    navigation.navigate(
      'Inicio del evento',
      {
        event,
      },
    )
  }

  function openProfile() {
    navigation.navigate('Perfil')
  }

  function comingSoon(name: string) {
    Alert.alert(
      name,
      'Esta sección estará disponible próximamente.',
    )
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.brand}>
          Event
          <Text style={styles.brandAccent}>
            Flow
          </Text>
        </Text>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerIconButton}
            onPress={() =>
              comingSoon('Notificaciones')
            }
          >
            <Feather
              name="bell"
              size={23}
              color={NAVY}
            />

            <View
              style={styles.notificationDot}
            />
          </Pressable>

          <Pressable
            style={styles.profileButton}
            onPress={openProfile}
          >
            <Feather
              name="user"
              size={20}
              color={WHITE}
            />
          </Pressable>
        </View>
      </View>

      {/* CARGANDO */}
      {!items && !error ? (
        <View style={styles.loadingState}>
          <ActivityIndicator
            size="large"
            color={PURPLE}
          />

          <Text style={styles.loadingText}>
            Cargando tus eventos...
          </Text>
        </View>
      ) : error && !items ? (
        /* ERROR */
        <View style={styles.errorState}>
          <View style={styles.errorIcon}>
            <Feather
              name="alert-circle"
              size={28}
              color="#B74C43"
            />
          </View>

          <Text style={styles.errorTitle}>
            No pudimos cargar tus eventos
          </Text>

          <Text style={styles.errorMessage}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => loadEvents()}
          >
            <Text style={styles.retryButtonText}>
              Intentar de nuevo
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                105 +
                Math.max(
                  insets.bottom,
                  10,
                ),
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                loadEvents(true)
              }
              colors={[PURPLE]}
              tintColor={PURPLE}
            />
          }
        >
          {/* TÍTULO */}
          <View style={styles.headingArea}>
            <Text style={styles.heading}>
              Mis eventos
            </Text>

            <Text style={styles.subheading}>
              Tus invitaciones y próximos eventos
            </Text>
          </View>

          {/* EVENTO DESTACADO */}
          {featuredEvent ? (
            <Pressable
              onPress={() =>
                openEvent(featuredEvent)
              }
              style={({ pressed }) => [
                styles.featuredCard,
                pressed && styles.pressed,
              ]}
            >
              <ImageBackground
                source={require('../../../assets/event-login-background.png')}
                resizeMode="cover"
                style={styles.featuredImage}
                imageStyle={
                  styles.featuredImageStyle
                }
              >
                <LinearGradient
                  colors={[
                    'rgba(5,20,43,0.18)',
                    'rgba(5,20,43,0.48)',
                    'rgba(5,16,35,0.95)',
                  ]}
                  locations={[
                    0,
                    0.48,
                    1,
                  ]}
                  style={
                    StyleSheet.absoluteFill
                  }
                />

                <View style={styles.featuredTop}>
                  <View
                    style={
                      styles.featuredBadge
                    }
                  >
                    <Text
                      style={
                        styles.featuredBadgeText
                      }
                    >
                      {isToday(featuredEvent)
                        ? 'Hoy'
                        : 'Próximo'}
                    </Text>
                  </View>

                  <View
                    style={styles.moreButton}
                  >
                    <Feather
                      name="more-horizontal"
                      size={20}
                      color={WHITE}
                    />
                  </View>
                </View>

                <View style={styles.featuredBody}>
                  <Text
                    style={styles.featuredTitle}
                    numberOfLines={2}
                  >
                    {featuredEvent.name}
                  </Text>

                  <Text
                    style={styles.featuredType}
                  >
                    {featuredEvent.type}
                  </Text>

                  <View
                    style={styles.featuredMeta}
                  >
                    <View
                      style={
                        styles.featuredMetaRow
                      }
                    >
                      <Feather
                        name="calendar"
                        size={18}
                        color={WHITE}
                      />

                      <View>
                        <Text
                          style={
                            styles.featuredMetaMain
                          }
                        >
                          {formatLongDate(
                            featuredEvent.startsAt,
                          )}
                        </Text>

                        <Text
                          style={
                            styles.featuredMetaSecondary
                          }
                        >
                          {formatTime(
                            featuredEvent.startsAt,
                          )}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.featuredMetaRow
                      }
                    >
                      <Feather
                        name="map-pin"
                        size={18}
                        color={WHITE}
                      />

                      <Text
                        style={
                          styles.featuredMetaMain
                        }
                        numberOfLines={1}
                      >
                        {featuredEvent.location}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.featuredFooter
                    }
                  >
                    <View
                      style={
                        styles.programmedBadge
                      }
                    >
                      <View
                        style={
                          styles.programmedIcon
                        }
                      >
                        <Feather
                          name="check"
                          size={11}
                          color="#075132"
                        />
                      </View>

                      <Text
                        style={
                          styles.programmedText
                        }
                      >
                        Evento programado
                      </Text>
                    </View>

                    <View
                      style={
                        styles.viewEventButton
                      }
                    >
                      <Text
                        style={
                          styles.viewEventButtonText
                        }
                      >
                        Ver evento
                      </Text>

                      <Feather
                        name="arrow-right"
                        size={18}
                        color={WHITE}
                      />
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
          ) : null}

          {/* PRÓXIMOS */}
          {remainingUpcoming.length > 0 ? (
            <View style={styles.section}>
              <View
                style={styles.sectionHeader}
              >
                <Text
                  style={styles.sectionTitle}
                >
                  Próximos eventos
                </Text>

                <Text
                  style={styles.sectionCount}
                >
                  {remainingUpcoming.length}{' '}
                  {remainingUpcoming.length === 1
                    ? 'evento'
                    : 'eventos'}
                </Text>
              </View>

              <View style={styles.eventList}>
                {remainingUpcoming.map(
                  event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onPress={() =>
                        openEvent(event)
                      }
                    />
                  ),
                )}
              </View>
            </View>
          ) : null}

          {/* ANTERIORES */}
          {previousEvents.length > 0 ? (
            <View style={styles.section}>
              <View
                style={styles.sectionHeader}
              >
                <Text
                  style={styles.sectionTitle}
                >
                  Eventos anteriores
                </Text>

                <Text
                  style={styles.sectionCount}
                >
                  {previousEvents.length}{' '}
                  {previousEvents.length === 1
                    ? 'evento'
                    : 'eventos'}
                </Text>
              </View>

              <View style={styles.eventList}>
                {previousEvents.map(
                  event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      past
                      onPress={() =>
                        openEvent(event)
                      }
                    />
                  ),
                )}
              </View>
            </View>
          ) : null}

          {/* VACÍO */}
          {sortedEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather
                  name="calendar"
                  size={28}
                  color={PURPLE}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Aún no tienes eventos
              </Text>

              <Text style={styles.emptyText}>
                Cuando recibas una invitación aparecerá aquí.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}

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
        {/* INICIO */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('Inicio')
          }
        >
          <Feather
            name="home"
            size={24}
            color="#747C8E"
          />

          <Text style={styles.navText}>
            Inicio
          </Text>
        </Pressable>

        {/* EVENTOS ACTIVO */}
        <View style={styles.navItem}>
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
        </View>

        {/* NOTIFICACIONES */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            comingSoon(
              'Notificaciones',
            )
          }
        >
          <Feather
            name="bell"
            size={24}
            color="#747C8E"
          />

          <Text style={styles.navText}>
            Notificaciones
          </Text>
        </Pressable>

        {/* PERFIL */}
        <Pressable
          style={styles.navItem}
          onPress={openProfile}
        >
          <Feather
            name="user"
            size={24}
            color="#747C8E"
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
    backgroundColor: BACKGROUND,
  },

  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    backgroundColor: BACKGROUND,
  },

  brand: {
    color: NAVY,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  brandAccent: {
    color: PURPLE,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PURPLE,
    borderWidth: 2,
    borderColor: BACKGROUND,
  },

  profileButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY_SOFT,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
  },

  headingArea: {
    marginTop: 18,
    marginBottom: 20,
  },

  heading: {
    color: NAVY,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  subheading: {
    color: MUTED,
    fontSize: 14,
    marginTop: 4,
  },

  featuredCard: {
    height: 270,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: NAVY,

    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,

    elevation: 6,
  },

  featuredImage: {
    flex: 1,
    padding: 18,
  },

  featuredImageStyle: {
    borderRadius: 24,
  },

  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: PURPLE,
  },

  featuredBadgeText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },

  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,15,34,0.58)',
  },

  featuredBody: {
    marginTop: 'auto',
  },

  featuredTitle: {
    color: WHITE,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  featuredType: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    marginTop: 3,
    textTransform: 'capitalize',
  },

  featuredMeta: {
    gap: 8,
    marginTop: 13,
  },

  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  featuredMetaMain: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '600',
  },

  featuredMetaSecondary: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 10.5,
    marginTop: 1,
  },

  featuredFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  programmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(10,90,60,0.72)',
  },

  programmedIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#70E3A8',
  },

  programmedText: {
    color: '#AAF1CE',
    fontSize: 10,
    fontWeight: '600',
  },

  viewEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: PURPLE,
  },

  viewEventButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
  },

  section: {
    marginTop: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    color: NAVY,
    fontSize: 20,
    fontWeight: '800',
  },

  sectionCount: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '700',
  },

  eventList: {
    gap: 12,
  },

  eventCard: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 15,
    borderRadius: 19,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 2,
  },

  dateBox: {
    width: 61,
    height: 79,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  dateDay: {
    color: NAVY,
    fontSize: 26,
    fontWeight: '800',
  },

  dateMonth: {
    color: NAVY,
    fontSize: 10,
    fontWeight: '700',
  },

  eventCardContent: {
    flex: 1,
  },

  eventCardTitle: {
    color: NAVY,
    fontSize: 16,
    fontWeight: '700',
  },

  eventCardType: {
    color: MUTED,
    fontSize: 11.5,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 7,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 170,
  },

  metaText: {
    color: '#687287',
    fontSize: 10.5,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 7,
    borderRadius: 12,
  },

  statusUpcoming: {
    backgroundColor: PURPLE_SOFT,
  },

  statusPast: {
    backgroundColor: '#EFF1F4',
  },

  statusText: {
    fontSize: 9.5,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    color: MUTED,
    fontSize: 13,
  },

  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0EE',
  },

  errorTitle: {
    color: NAVY,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
  },

  errorMessage: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: PURPLE,
  },

  retryButtonText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  emptyTitle: {
    color: NAVY,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },

  emptyText: {
    color: MUTED,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },

  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 80,

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
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 10,
  },

  navItem: {
    flex: 1,
    minHeight: 55,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: PURPLE,
    marginTop: 1,
  },
})