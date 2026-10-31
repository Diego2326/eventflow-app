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
import { GlassOverlay } from '../../components/ui/GlassOverlay'

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
  getEventAgenda,
  getEvents,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/api'

import type {
  NotificationItem,
} from '../../services/api'

import type {
  EventAgenda,
} from '../../types/events'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#E2E5EC'
const MUTED = '#737D91'

function kindLabel(
  kind: NotificationItem['kind'],
) {
  switch (kind) {
    case 'SEGMENTED':
      return 'Segmentada'
    case 'MODULE':
      return 'Automática'
    case 'GENERAL':
    default:
      return 'General'
  }
}

function formatNotificationTime(
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

  const diffMs =
    Date.now() - date.getTime()

  const minutes =
    Math.floor(
      diffMs / 60000,
    )

  if (minutes < 1) {
    return 'Ahora'
  }

  if (minutes < 60) {
    return `Hace ${minutes} min`
  }

  const hours =
    Math.floor(
      minutes / 60,
    )

  if (hours < 24) {
    return `Hace ${hours} h`
  }

  const days =
    Math.floor(
      hours / 24,
    )

  if (days === 1) {
    return 'Ayer'
  }

  if (days < 7) {
    return `Hace ${days} días`
  }

  return date.toLocaleDateString(
    'es-GT',
    {
      day: 'numeric',
      month: 'short',
    },
  )
}

function formatAgendaTime(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleTimeString(
    'es-GT',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  )
}

export function NotificationsScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationItem[] | null
  >(null)

  const [agenda, setAgenda] =
    useState<EventAgenda | null>(
      null,
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [
          notificationData,
          eventData,
        ] = await Promise.all([
          getNotifications(),
          getEvents(),
        ])

        if (!mounted) return

        setNotifications(
          notificationData,
        )

        const now = Date.now()

        const nextEvent =
          [...eventData]
            .filter(
              event =>
                new Date(
                  event.startsAt,
                ).getTime() >= now,
            )
            .sort(
              (a, b) =>
                new Date(
                  a.startsAt,
                ).getTime() -
                new Date(
                  b.startsAt,
                ).getTime(),
            )[0]

        if (!nextEvent) {
          setAgenda(null)
          return
        }

        try {
          const agendaData =
            await getEventAgenda(
              nextEvent.id,
            )

          if (mounted) {
            setAgenda(
              agendaData,
            )
          }
        } catch {
          if (mounted) {
            setAgenda(null)
          }
        }
      } catch (error) {
        if (!mounted) return

        setNotifications([])
        setAgenda(null)
        setError(
          (error as Error).message,
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const unreadCount =
    useMemo(
      () =>
        (
          notifications ?? []
        ).filter(
          item => item.unread,
        ).length,
      [notifications],
    )

  const agendaMoments =
    useMemo(() => {
      if (!agenda) {
        return []
      }

      return [
        agenda.current
          ? {
              label:
                'Ahora' as const,
              activity:
                agenda.current,
            }
          : null,
        agenda.next
          ? {
              label:
                'Siguiente' as const,
              activity:
                agenda.next,
            }
          : null,
      ].filter(
        (
          item,
        ): item is {
          label:
            | 'Ahora'
            | 'Siguiente'
          activity:
            NonNullable<
              EventAgenda[
                'current'
              ]
            >
        } => item !== null,
      )
    }, [agenda])

  async function markAllAsRead() {
    const current =
      notifications ?? []

    if (
      !current.some(
        item => item.unread,
      )
    ) {
      return
    }

    setNotifications(
      current.map(item => ({
        ...item,
        unread: false,
      })),
    )

    try {
      await markAllNotificationsRead()
    } catch (error) {
      setNotifications(current)
      setError(
        (error as Error).message,
      )
    }
  }

  async function openNotification(
    id: string,
  ) {
    const current =
      notifications ?? []

    const target =
      current.find(
        item => item.id === id,
      )

    if (
      !target ||
      !target.unread
    ) {
      return
    }

    setNotifications(
      current.map(item =>
        item.id === id
          ? {
              ...item,
              unread: false,
            }
          : item,
      ),
    )

    try {
      await markNotificationRead(
        id,
        target.eventId,
        target.source,
      )
    } catch (error) {
      setNotifications(current)
      setError(
        (error as Error).message,
      )
    }
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
          <Text
            style={styles.brandAccent}
          >
            Flow
          </Text>
        </Text>

        <Pressable
          style={
            styles.profileButton
          }
          onPress={() =>
            navigation.navigate(
              'Perfil',
            )
          }
        >
          <GlassOverlay style={styles.profileGlass} tintColor="rgba(23,52,86,0.42)" fallbackColor={NAVY} />
          <Feather
            name="user"
            size={20}
            color={WHITE}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + 28,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* CABECERA */}

        <View
          style={
            styles.headingArea
          }
        >
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              <Text style={styles.heading}>
                Notificaciones
              </Text>

              <Text
                style={
                  styles.subheading
                }
              >
                Mantente al día con tus eventos
              </Text>
            </View>

            {unreadCount > 0 ? (
              <View
                style={
                  styles.unreadBadge
                }
              >
                <Text
                  style={
                    styles.unreadBadgeText
                  }
                >
                  {unreadCount}
                </Text>
              </View>
            ) : null}
          </View>

          {unreadCount > 0 ? (
            <Pressable
              style={
                styles.markAllButton
              }
              onPress={
                markAllAsRead
              }
            >
              <Feather
                name="check"
                size={16}
                color={PURPLE}
              />

              <Text
                style={
                  styles.markAllText
                }
              >
                Marcar todas como leídas
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* RESUMEN */}

        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryIcon
            }
          >
            <Feather
              name="bell"
              size={28}
              color={PURPLE}
            />
          </View>

          <View
            style={
              styles.summaryCopy
            }
          >
            <Text
              style={
                styles.summaryTitle
              }
            >
              {unreadCount > 0
                ? `${unreadCount} ${
                    unreadCount === 1
                      ? 'notificación nueva'
                      : 'notificaciones nuevas'
                  }`
                : 'Todo al día'}
            </Text>

            <Text
              style={
                styles.summaryText
              }
            >
              Aquí recibirás cambios, recordatorios y novedades de tus eventos.
            </Text>
          </View>
        </View>

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        {/* AHORA / SIGUIENTE */}

        <View style={styles.liveSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Ahora / Siguiente
            </Text>

            <Text style={styles.liveSectionNote}>
              Agenda operativa del próximo evento
            </Text>
          </View>
        </View>

        <View style={styles.liveAgendaCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="small"
                color={PURPLE}
              />

              <Text style={styles.loadingText}>
                Cargando agenda...
              </Text>
            </View>
          ) : agendaMoments.length ? (
            agendaMoments.map(
              (item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.liveAgendaRow,
                    index !==
                      agendaMoments.length -
                        1 &&
                      styles.liveAgendaBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.liveLabel,
                      item.label === 'Ahora'
                        ? styles.liveLabelNow
                        : styles.liveLabelNext,
                    ]}
                  >
                    <Text
                      style={[
                        styles.liveLabelText,
                        item.label === 'Ahora'
                          ? styles.liveLabelTextNow
                          : styles.liveLabelTextNext,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.liveAgendaContent
                    }
                  >
                    <Text
                      style={
                        styles.liveAgendaTitle
                      }
                    >
                      {item.activity.title}
                    </Text>

                    <View
                      style={
                        styles.liveAgendaMeta
                      }
                    >
                      <Feather
                        name="clock"
                        size={13}
                        color={MUTED}
                      />

                      <Text
                        style={
                          styles.liveAgendaMetaText
                        }
                      >
                        {formatAgendaTime(
                          item.activity
                            .startsAt,
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.liveAgendaMeta
                      }
                    >
                      <Feather
                        name="map-pin"
                        size={13}
                        color={MUTED}
                      />

                      <Text
                        style={
                          styles.liveAgendaMetaText
                        }
                        numberOfLines={1}
                      >
                        {item.activity
                          .location ||
                          'Ubicación por confirmar'}
                      </Text>
                    </View>
                  </View>
                </View>
              ),
            )
          ) : (
            <View style={styles.loadingBox}>
              <Feather
                name="calendar"
                size={21}
                color={MUTED}
              />

              <Text style={styles.loadingText}>
                No hay una actividad actual o siguiente publicada.
              </Text>
            </View>
          )}
        </View>

        {/* LISTADO */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Recientes
          </Text>

          <Text
            style={
              styles.sectionCount
            }
          >
            {notifications?.length ?? 0}
          </Text>
        </View>

        <View
          style={
            styles.notificationsCard
          }
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="small"
                color={PURPLE}
              />

              <Text style={styles.loadingText}>
                Cargando notificaciones...
              </Text>
            </View>
          ) : (
            <>
              {(notifications ?? []).map(
                (
                  notification,
                  index,
                ) => (
                  <Pressable
                    key={
                      notification.id
                    }
                    onPress={() =>
                      openNotification(
                        notification.id,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.notificationRow,

                      index !==
                        (notifications
                          ?.length ??
                          0) -
                          1 &&
                        styles.notificationBorder,

                      notification.unread &&
                        styles.notificationUnread,

                      pressed &&
                        styles.rowPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        notification.unread &&
                          styles.iconBoxUnread,
                      ]}
                    >
                      <Feather
                        name={
                          notification.icon
                        }
                        size={22}
                        color={PURPLE}
                      />
                    </View>

                    <View
                      style={
                        styles.notificationContent
                      }
                    >
                      <View
                        style={
                          styles.notificationTitleRow
                        }
                      >
                        <Text
                          style={[
                            styles.notificationTitle,

                            notification.unread &&
                              styles.notificationTitleUnread,
                          ]}
                          numberOfLines={
                            2
                          }
                        >
                          {
                            notification.title
                          }
                        </Text>

                        {notification.unread ? (
                          <View
                            style={
                              styles.unreadDot
                            }
                          />
                        ) : null}
                      </View>

                      <Text
                        style={
                          styles.notificationMessage
                        }
                        numberOfLines={3}
                      >
                        {
                          notification.message
                        }
                      </Text>

                      <View
                        style={
                          styles.notificationMetaRow
                        }
                      >
                        <View
                          style={
                            styles.kindBadge
                          }
                        >
                          <Text
                            style={
                              styles.kindBadgeText
                            }
                          >
                            {kindLabel(
                              notification.kind,
                            )}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.audienceText
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            notification.audience
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.notificationTime
                        }
                      >
                        {formatNotificationTime(
                          notification.createdAt,
                        )}
                      </Text>
                    </View>

                    <Feather
                      name="chevron-right"
                      size={21}
                      color="#8A91A0"
                    />
                  </Pressable>
                ),
              )}

              {(notifications?.length ??
                0) === 0 ? (
                <View
                  style={
                    styles.loadingBox
                  }
                >
                  <Feather
                    name="bell"
                    size={21}
                    color={MUTED}
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    No tienes notificaciones recientes.
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

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

    brand: {
      color: NAVY,

      fontSize: 24,

      fontWeight: '800',

      letterSpacing: -0.9,
    },

    brandAccent: {
      color: PURPLE,
    },

    profileButton: {
      width: 43,
      height: 43,

      borderRadius: 22,
      overflow: 'hidden',
      position: 'relative',

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor: NAVY,
    },

    profileGlass: {
      borderRadius: 22,
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 22,
    },

    headingArea: {
      marginTop: 17,

      marginBottom: 20,
    },

    headingRow: {
      flexDirection: 'row',

      alignItems:
        'flex-start',

      justifyContent:
        'space-between',
    },

    headingCopy: {
      flex: 1,
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

      marginTop: 4,
    },

    unreadBadge: {
      minWidth: 34,
      height: 34,

      paddingHorizontal: 9,

      borderRadius: 17,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        PURPLE,
    },

    unreadBadgeText: {
      color: WHITE,

      fontSize: 13,

      fontWeight: '800',
    },

    markAllButton: {
      alignSelf:
        'flex-start',

      flexDirection: 'row',

      alignItems: 'center',

      gap: 7,

      marginTop: 16,

      paddingVertical: 4,
    },

    markAllText: {
      color: PURPLE,

      fontSize: 12,

      fontWeight: '700',
    },

    summaryCard: {
      minHeight: 105,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 14,

      padding: 17,

      borderRadius: 20,

      backgroundColor:
        PURPLE_SOFT,
    },

    summaryIcon: {
      width: 55,
      height: 55,

      borderRadius: 17,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor: WHITE,
    },

    summaryCopy: {
      flex: 1,
    },

    summaryTitle: {
      color: NAVY,

      fontSize: 15,

      fontWeight: '800',
    },

    summaryText: {
      color: MUTED,

      fontSize: 11,

      lineHeight: 17,

      marginTop: 4,
    },

    errorText: {
      color: '#B74C43',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 12,
    },

    loadingBox: {
      minHeight: 86,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      paddingHorizontal: 18,
    },

    loadingText: {
      flex: 1,
      color: MUTED,
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
    },

    liveSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginTop: 26,
      marginBottom: 11,
    },

    liveSectionNote: {
      color: MUTED,
      fontSize: 10.5,
      marginTop: 3,
    },

    liveAgendaCard: {
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 18,
      backgroundColor: WHITE,
    },

    liveAgendaRow: {
      minHeight: 94,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },

    liveAgendaBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        BORDER,
    },

    liveLabel: {
      minWidth: 70,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    liveLabelNow: {
      backgroundColor:
        '#EAF8F1',
    },

    liveLabelNext: {
      backgroundColor:
        PURPLE_SOFT,
    },

    liveLabelText: {
      fontSize: 10,
      fontWeight: '800',
    },

    liveLabelTextNow: {
      color: '#249B68',
    },

    liveLabelTextNext: {
      color: PURPLE,
    },

    liveAgendaContent: {
      flex: 1,
      minWidth: 0,
    },

    liveAgendaTitle: {
      color: NAVY,
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 6,
    },

    liveAgendaMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 3,
    },

    liveAgendaMetaText: {
      flex: 1,
      color: MUTED,
      fontSize: 10.5,
    },

    sectionHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      marginTop: 26,

      marginBottom: 11,
    },

    sectionTitle: {
      color: NAVY,

      fontSize: 19,

      fontWeight: '800',
    },

    sectionCount: {
      color: PURPLE,

      fontSize: 12,

      fontWeight: '700',
    },

    notificationsCard: {
      overflow: 'hidden',

      borderWidth: 1,
      borderColor: BORDER,

      borderRadius: 18,

      backgroundColor: WHITE,
    },

    notificationRow: {
      minHeight: 112,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 12,

      paddingHorizontal: 14,
      paddingVertical: 14,
    },

    notificationBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        BORDER,
    },

    notificationUnread: {
      backgroundColor:
        '#FCFBFF',
    },

    rowPressed: {
      opacity: 0.72,
    },

    iconBox: {
      width: 46,
      height: 46,

      borderRadius: 14,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        '#F4F2FB',
    },

    iconBoxUnread: {
      backgroundColor:
        PURPLE_SOFT,
    },

    notificationContent: {
      flex: 1,
    },

    notificationTitleRow: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 7,
    },

    notificationTitle: {
      flex: 1,

      color: NAVY,

      fontSize: 13,

      fontWeight: '600',
    },

    notificationTitleUnread: {
      fontWeight: '800',
    },

    unreadDot: {
      width: 7,
      height: 7,

      borderRadius: 4,

      backgroundColor:
        PURPLE,
    },

    notificationMessage: {
      color: MUTED,

      fontSize: 10.5,

      lineHeight: 16,

      marginTop: 4,
    },

    notificationMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginTop: 7,
    },

    kindBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor:
        PURPLE_SOFT,
    },

    kindBadgeText: {
      color: PURPLE,
      fontSize: 9,
      fontWeight: '700',
    },

    audienceText: {
      flex: 1,
      color: MUTED,
      fontSize: 9.5,
    },

    notificationTime: {
      color: PURPLE,

      fontSize: 9.5,

      fontWeight: '600',

      marginTop: 6,
    },

  })
