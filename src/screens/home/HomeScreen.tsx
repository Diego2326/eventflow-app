import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

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

const WHITE = '#FFFFFF'
const BACKGROUND = '#F7F7FA'
const BORDER = '#E7E9EF'
const MUTED = '#747C8E'

function getDate(event: EventItem) {
  return new Date(event.startsAt)
}

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

export function HomeScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const [events, setEvents] =
    useState<EventItem[] | null>(null)

  const [error, setError] =
    useState('')

  const [refreshing, setRefreshing] =
    useState(false)

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true)
      }

      setError('')

      try {
        const result =
          await api<EventItem[]>('/events')

        setEvents(result)
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
    load()
  }, [load])

  const summary = useMemo(() => {
    const now = Date.now()

    const sorted = [...(events ?? [])].sort(
      (a, b) =>
        getDate(a).getTime() -
        getDate(b).getTime(),
    )

    const upcoming = sorted.filter(
      event =>
        getDate(event).getTime() >= now,
    )

    const previous = sorted.filter(
      event =>
        getDate(event).getTime() < now,
    )

    return {
      total: sorted.length,
      upcoming,
      previous,
      nextEvent: upcoming[0] ?? null,
    }
  }, [events])

  function openEvent(event: EventItem) {
    navigation.navigate(
      'Inicio del evento',
      {
        event,
      },
    )
  }

  function comingSoon(name: string) {
    Alert.alert(
      name,
      'Estamos preparando esta sección.',
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
            style={styles.headerIcon}
            onPress={() =>
              comingSoon('Notificaciones')
            }
          >
            <Feather
              name="bell"
              size={23}
              color={NAVY}
            />

            <View style={styles.notificationDot} />
          </Pressable>

          <Pressable
            style={styles.avatar}
            onPress={() =>
              navigation.navigate('Perfil')
            }
          >
            <Feather
              name="user"
              size={20}
              color={WHITE}
            />
          </Pressable>
        </View>
      </View>

      {!events && !error ? (
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={PURPLE}
          />

          <Text style={styles.stateText}>
            Preparando tu experiencia...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
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
              onRefresh={() => load(true)}
              colors={[PURPLE]}
              tintColor={PURPLE}
            />
          }
        >
          {/* INTRO */}
          <View style={styles.intro}>
            <View style={styles.introBadge}>
              <View style={styles.introDot} />

              <Text style={styles.introBadgeText}>
                TU EVENTFLOW
              </Text>
            </View>

            <Text style={styles.title}>
              Todo lo importante,{'\n'}
              <Text style={styles.titleAccent}>
                justo cuando lo necesitas.
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Consulta tus próximos eventos y accede
              rápidamente a tu experiencia.
            </Text>
          </View>

          {/* ERROR */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather
                name="alert-circle"
                size={20}
                color="#B74C43"
              />

              <View style={styles.errorCopy}>
                <Text style={styles.errorTitle}>
                  No pudimos actualizar tus eventos
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>

              <Pressable
                onPress={() => load()}
              >
                <Feather
                  name="refresh-cw"
                  size={20}
                  color={PURPLE}
                />
              </Pressable>
            </View>
          ) : null}

          {/* PRÓXIMO EVENTO */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Tu próximo evento
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate('Eventos')
              }
            >
              <Text style={styles.sectionLink}>
                Ver todos
              </Text>
            </Pressable>
          </View>

          {summary.nextEvent ? (
            <Pressable
              style={({ pressed }) => [
                styles.heroCard,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                openEvent(summary.nextEvent!)
              }
            >
              <ImageBackground
                source={require('../../../assets/event-login-background.png')}
                resizeMode="cover"
                style={styles.heroImage}
                imageStyle={styles.heroImageRadius}
              >
                <LinearGradient
                  colors={[
                    'rgba(7,22,48,0.18)',
                    'rgba(7,22,48,0.72)',
                    'rgba(7,22,48,0.98)',
                  ]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.heroTop}>
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>
                      PRÓXIMO
                    </Text>
                  </View>

                  <Feather
                    name="arrow-up-right"
                    size={22}
                    color={WHITE}
                  />
                </View>

                <View style={styles.heroBottom}>
                  <Text
                    style={styles.heroTitle}
                    numberOfLines={2}
                  >
                    {summary.nextEvent.name}
                  </Text>

                  <Text style={styles.heroType}>
                    {summary.nextEvent.type}
                  </Text>

                  <View style={styles.heroMeta}>
                    <View style={styles.heroMetaRow}>
                      <Feather
                        name="calendar"
                        size={17}
                        color={WHITE}
                      />

                      <Text style={styles.heroMetaText}>
                        {formatDate(
                          summary.nextEvent.startsAt,
                        )}
                      </Text>
                    </View>

                    <View style={styles.heroMetaRow}>
                      <Feather
                        name="clock"
                        size={17}
                        color={WHITE}
                      />

                      <Text style={styles.heroMetaText}>
                        {formatTime(
                          summary.nextEvent.startsAt,
                        )}
                      </Text>
                    </View>

                    <View style={styles.heroMetaRow}>
                      <Feather
                        name="map-pin"
                        size={17}
                        color={WHITE}
                      />

                      <Text
                        style={styles.heroMetaText}
                        numberOfLines={1}
                      >
                        {summary.nextEvent.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>
                      Abrir evento
                    </Text>

                    <Feather
                      name="arrow-right"
                      size={18}
                      color={WHITE}
                    />
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
          ) : (
            <View style={styles.noEventCard}>
              <View style={styles.noEventIcon}>
                <Feather
                  name="calendar"
                  size={27}
                  color={PURPLE}
                />
              </View>

              <View style={styles.noEventCopy}>
                <Text style={styles.noEventTitle}>
                  No hay próximos eventos
                </Text>

                <Text style={styles.noEventText}>
                  Cuando tengas una nueva invitación
                  aparecerá aquí.
                </Text>
              </View>
            </View>
          )}

          {/* RESUMEN */}
          <Text style={styles.sectionTitleStandalone}>
            Tu actividad
          </Text>

          <View style={styles.statsRow}>
            <Pressable
              style={styles.statCard}
              onPress={() =>
                navigation.navigate('Eventos')
              }
            >
              <View style={styles.statIcon}>
                <Feather
                  name="calendar"
                  size={23}
                  color={PURPLE}
                />
              </View>

              <Text style={styles.statNumber}>
                {summary.upcoming.length}
              </Text>

              <Text style={styles.statLabel}>
                Próximos
              </Text>
            </Pressable>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather
                  name="check-circle"
                  size={23}
                  color={PURPLE}
                />
              </View>

              <Text style={styles.statNumber}>
                {summary.previous.length}
              </Text>

              <Text style={styles.statLabel}>
                Anteriores
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather
                  name="layers"
                  size={23}
                  color={PURPLE}
                />
              </View>

              <Text style={styles.statNumber}>
                {summary.total}
              </Text>

              <Text style={styles.statLabel}>
                Total
              </Text>
            </View>
          </View>

          {/* ACCESOS */}
          <Text style={styles.sectionTitleStandalone}>
            Accesos rápidos
          </Text>

          <View style={styles.quickGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                navigation.navigate('Eventos')
              }
            >
              <View style={styles.quickIcon}>
                <Feather
                  name="calendar"
                  size={25}
                  color={PURPLE}
                />
              </View>

              <View style={styles.quickCopy}>
                <Text style={styles.quickTitle}>
                  Mis eventos
                </Text>

                <Text style={styles.quickDescription}>
                  Consulta todas tus experiencias.
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={22}
                color="#858C9B"
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                comingSoon('Notificaciones')
              }
            >
              <View style={styles.quickIcon}>
                <Feather
                  name="bell"
                  size={25}
                  color={PURPLE}
                />
              </View>

              <View style={styles.quickCopy}>
                <Text style={styles.quickTitle}>
                  Notificaciones
                </Text>

                <Text style={styles.quickDescription}>
                  Mantente al día con cada novedad.
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={22}
                color="#858C9B"
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                navigation.navigate('Perfil')
              }
            >
              <View style={styles.quickIcon}>
                <Feather
                  name="user"
                  size={25}
                  color={PURPLE}
                />
              </View>

              <View style={styles.quickCopy}>
                <Text style={styles.quickTitle}>
                  Mi perfil
                </Text>

                <Text style={styles.quickDescription}>
                  Administra tu cuenta y preferencias.
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={22}
                color="#858C9B"
              />
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* NAV */}
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
        <View style={styles.navItem}>
          <Feather
            name="home"
            size={24}
            color={PURPLE}
          />

          <Text
            style={[
              styles.navText,
              styles.navTextActive,
            ]}
          >
            Inicio
          </Text>

          <View style={styles.navIndicator} />
        </View>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('Eventos')
          }
        >
          <Feather
            name="calendar"
            size={24}
            color="#747C8E"
          />

          <Text style={styles.navText}>
            Eventos
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            comingSoon('Notificaciones')
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

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('Perfil')
          }
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
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PURPLE,
    borderWidth: 2,
    borderColor: BACKGROUND,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY_SOFT,
  },

  content: {
    paddingHorizontal: 22,
  },

  intro: {
    marginTop: 22,
    marginBottom: 28,
  },

  introBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: PURPLE_SOFT,
  },

  introDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PURPLE,
  },

  introBadgeText: {
    color: PURPLE,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  title: {
    color: NAVY,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 17,
  },

  titleAccent: {
    color: PURPLE,
  },

  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 360,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: NAVY,
    fontSize: 19,
    fontWeight: '800',
  },

  sectionLink: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '700',
  },

  sectionTitleStandalone: {
    color: NAVY,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 12,
  },

  heroCard: {
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: NAVY,
    elevation: 6,
  },

  heroImage: {
    flex: 1,
    padding: 18,
  },

  heroImageRadius: {
    borderRadius: 24,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  nextBadge: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: PURPLE,
  },

  nextBadgeText: {
    color: WHITE,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.9,
  },

  heroBottom: {
    marginTop: 'auto',
  },

  heroTitle: {
    color: WHITE,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
  },

  heroType: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 3,
  },

  heroMeta: {
    gap: 7,
    marginTop: 13,
  },

  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  heroMetaText: {
    flex: 1,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
  },

  heroButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: PURPLE,
    marginTop: 14,
  },

  heroButtonText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },

  noEventCard: {
    minHeight: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    backgroundColor: WHITE,
  },

  noEventIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  noEventCopy: {
    flex: 1,
  },

  noEventTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '800',
  },

  noEventText: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 115,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    backgroundColor: WHITE,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  statNumber: {
    color: NAVY,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },

  statLabel: {
    color: MUTED,
    fontSize: 10.5,
    marginTop: 2,
  },

  quickGrid: {
    gap: 10,
  },

  quickCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    backgroundColor: WHITE,
  },

  quickIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE_SOFT,
  },

  quickCopy: {
    flex: 1,
  },

  quickTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '700',
  },

  quickDescription: {
    color: MUTED,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 2,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#FFF0EE',
    marginBottom: 20,
  },

  errorCopy: {
    flex: 1,
  },

  errorTitle: {
    color: '#A33D35',
    fontSize: 12,
    fontWeight: '800',
  },

  errorText: {
    color: '#B3534B',
    fontSize: 10.5,
    marginTop: 2,
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  stateText: {
    color: MUTED,
    fontSize: 12,
  },

  pressed: {
    opacity: 0.9,
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

    minHeight: 80,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    paddingTop: 7,
    paddingHorizontal: 12,

    backgroundColor: 'rgba(255,255,255,0.98)',

    borderTopWidth: 1,
    borderTopColor: BORDER,

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
  },
})