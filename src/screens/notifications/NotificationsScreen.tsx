import {
  useMemo,
  useState,
} from 'react'

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#E2E5EC'
const MUTED = '#737D91'

type NotificationItem = {
  id: string
  title: string
  message: string
  time: string
  icon:
    | 'calendar'
    | 'bell'
    | 'check-circle'
    | 'users'
    | 'map-pin'
  unread: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Tu evento está por comenzar',
    message:
      'Cumbre Creativa 2026 inicia próximamente. Revisa tu agenda antes de entrar.',
    time: 'Hace 10 min',
    icon: 'calendar',
    unread: true,
  },
  {
    id: '2',
    title: 'Tu pase está disponible',
    message:
      'Ya puedes consultar tu pase digital para tu próximo evento.',
    time: 'Hace 1 h',
    icon: 'check-circle',
    unread: true,
  },
  {
    id: '3',
    title: 'Nueva actividad',
    message:
      'Se agregó una actividad a la agenda del evento.',
    time: 'Ayer',
    icon: 'bell',
    unread: false,
  },
  {
    id: '4',
    title: 'Networking disponible',
    message:
      'Conoce a otros asistentes y amplía tus conexiones.',
    time: 'Ayer',
    icon: 'users',
    unread: false,
  },
  {
    id: '5',
    title: 'Ubicación actualizada',
    message:
      'Consulta nuevamente la ubicación de tu próximo evento.',
    time: 'Hace 2 días',
    icon: 'map-pin',
    unread: false,
  },
]

export function NotificationsScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const [
    notifications,
    setNotifications,
  ] = useState(
    INITIAL_NOTIFICATIONS,
  )

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          item => item.unread,
        ).length,
      [notifications],
    )

  function markAllAsRead() {
    setNotifications(
      current =>
        current.map(item => ({
          ...item,
          unread: false,
        })),
    )
  }

  function openNotification(
    id: string,
  ) {
    setNotifications(
      current =>
        current.map(item =>
          item.id === id
            ? {
                ...item,
                unread: false,
              }
            : item,
        ),
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
              105 +
              Math.max(
                insets.bottom,
                10,
              ),
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
            {notifications.length}
          </Text>
        </View>

        <View
          style={
            styles.notificationsCard
          }
        >
          {notifications.map(
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
                    notifications.length -
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

                  <Text
                    style={
                      styles.notificationTime
                    }
                  >
                    {
                      notification.time
                    }
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
        </View>
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

        <View
          style={styles.navItem}
        >
          <Feather
            name="bell"
            size={24}
            color={PURPLE}
          />

          <Text
            style={[
              styles.navText,
              styles.navTextActive,
            ]}
          >
            Notificaciones
          </Text>

          <View
            style={
              styles.navIndicator
            }
          />
        </View>

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
            color="#747C8E"
          />

          <Text
            style={
              styles.navText
            }
          >
            Perfil
          </Text>
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

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor: NAVY,
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

    notificationTime: {
      color: PURPLE,

      fontSize: 9.5,

      fontWeight: '600',

      marginTop: 6,
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