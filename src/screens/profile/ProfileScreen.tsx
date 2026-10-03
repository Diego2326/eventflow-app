import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'

import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
  api,
  logout,
} from '../../services/api'

import {
  DEMO_EMAIL,
} from '../../services/demo'

import type {
  EventItem,
} from '../../types/events'

const NAVY = '#0B1D3A'

const PURPLE = '#6848E7'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#E2E5EC'
const MUTED = '#737D91'
const DANGER = '#F04452'

type MenuRowProps = {
  icon:
    | 'user'
    | 'credit-card'
    | 'bell'
    | 'shield'
    | 'moon'
    | 'help-circle'
    | 'file-text'

  title: string
  value?: string
  onPress?: () => void
  rightElement?: ReactNode
}

function nameFromEmail(
  email: string,
) {
  const localPart =
    email.split('@')[0] || ''

  const parts =
    localPart
      .split(/[._-]/)
      .filter(Boolean)

  if (!parts.length) {
    return 'Usuario EventFlow'
  }

  return parts
    .map(
      part =>
        part
          .charAt(0)
          .toUpperCase() +
        part
          .slice(1)
          .toLowerCase(),
    )
    .join(' ')
}

function MenuRow({
  icon,
  title,
  value,
  onPress,
  rightElement,
}: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.menuRow,
        pressed &&
          onPress &&
          styles.menuRowPressed,
      ]}
    >
      <View style={styles.menuLeft}>
        <Feather
          name={icon}
          size={22}
          color={NAVY}
        />

        <Text style={styles.menuTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.menuRight}>
        {value ? (
          <Text style={styles.menuValue}>
            {value}
          </Text>
        ) : null}

        {rightElement ?? (
          <Feather
            name="chevron-right"
            size={22}
            color="#7D8596"
          />
        )}
      </View>
    </Pressable>
  )
}

export function ProfileScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets =
    useSafeAreaInsets()

  const [events, setEvents] =
    useState<EventItem[] | null>(
      null,
    )

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true)

  /*
   * El correo sí existe en el proyecto.
   * No inventamos teléfono.
   */
  const profileEmail =
    DEMO_EMAIL || ''

  const profilePhone = ''

  const profileName =
    useMemo(
      () =>
        nameFromEmail(
          profileEmail,
        ),
      [profileEmail],
    )

  useEffect(() => {
    api<EventItem[]>('/events')
      .then(setEvents)
      .catch(() =>
        setEvents([]),
      )
  }, [])

  const stats = useMemo(() => {
    const now = Date.now()

    const upcoming =
      events?.filter(
        event =>
          new Date(
            event.startsAt,
          ).getTime() >= now,
      ).length ?? 0

    const past =
      events?.filter(
        event =>
          new Date(
            event.startsAt,
          ).getTime() < now,
      ).length ?? 0

    return {
      upcoming,
      past,
      passes: upcoming,
    }
  }, [events])

  function openPersonalInfo() {
    navigation.navigate(
      'Información personal',
    )
  }

  function comingSoon(
    name: string,
  ) {
    Alert.alert(
      name,
      'Esta sección estará disponible próximamente.',
    )
  }

  function confirmLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar tu sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',

          onPress: async () => {
            await logout()

            navigation.replace(
              'Login',
            )
          },
        },
      ],
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
            style={
              styles.brandAccent
            }
          >
            Flow
          </Text>
        </Text>

        <View
          style={
            styles.headerActions
          }
        >
          <Pressable
            style={
              styles.notificationButton
            }
            onPress={() =>
              comingSoon(
                'Notificaciones',
              )
            }
          >
            <Feather
              name="bell"
              size={23}
              color={NAVY}
            />

            <View
              style={
                styles.notificationDot
              }
            />
          </Pressable>

          <View
            style={
              styles.miniAvatar
            }
          >
            <Feather
              name="user"
              size={21}
              color={WHITE}
            />
          </View>
        </View>
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
              105 +
              Math.max(
                insets.bottom,
                10,
              ),
          },
        ]}
      >
        {/* TÍTULO */}

        <View
          style={
            styles.headingArea
          }
        >
          <Text style={styles.heading}>
            Perfil
          </Text>

          <Text
            style={
              styles.subheading
            }
          >
            Tu cuenta y preferencias
          </Text>
        </View>

        {/* TARJETA PERFIL */}

        <View
          style={
            styles.profileCard
          }
        >
          <View
            style={
              styles.profileMain
            }
          >
            <View
              style={
                styles.avatarRing
              }
            >
              <View
                style={
                  styles.avatar
                }
              >
                <Feather
                  name="user"
                  size={47}
                  color="#6D7484"
                />
              </View>
            </View>

            <View
              style={
                styles.profileInfo
              }
            >
              <Text
                style={
                  styles.profileName
                }
                numberOfLines={1}
              >
                {profileName}
              </Text>

              {/* CORREO */}

              {profileEmail ? (
                <View
                  style={
                    styles.profileDataRow
                  }
                >
                  <Feather
                    name="mail"
                    size={17}
                    color={MUTED}
                  />

                  <Text
                    style={
                      styles.profileData
                    }
                    numberOfLines={1}
                  >
                    {profileEmail}
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={
                    styles.addDataRow
                  }
                  onPress={
                    openPersonalInfo
                  }
                >
                  <Feather
                    name="plus-circle"
                    size={17}
                    color={PURPLE}
                  />

                  <Text
                    style={
                      styles.addDataLink
                    }
                  >
                    Agregar correo
                  </Text>
                </Pressable>
              )}

              {/* TELÉFONO */}

              {profilePhone ? (
                <View
                  style={
                    styles.profileDataRow
                  }
                >
                  <Feather
                    name="phone"
                    size={17}
                    color={MUTED}
                  />

                  <Text
                    style={
                      styles.profileData
                    }
                  >
                    {profilePhone}
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={
                    styles.addDataRow
                  }
                  onPress={
                    openPersonalInfo
                  }
                >
                  <Feather
                    name="plus-circle"
                    size={17}
                    color={PURPLE}
                  />

                  <Text
                    style={
                      styles.addDataLink
                    }
                  >
                    Agregar teléfono
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* EDITAR */}

          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed &&
                styles.buttonPressed,
            ]}
            onPress={
              openPersonalInfo
            }
          >
            <Feather
              name="edit-2"
              size={17}
              color={PURPLE}
            />

            <Text
              style={
                styles.editButtonText
              }
            >
              Editar perfil
            </Text>
          </Pressable>
        </View>

        {/* ESTADÍSTICAS */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={
                styles.statIcon
              }
            >
              <Feather
                name="calendar"
                size={23}
                color={PURPLE}
              />
            </View>

            <View
              style={
                styles.statCopy
              }
            >
              {!events ? (
                <ActivityIndicator
                  size="small"
                  color={PURPLE}
                />
              ) : (
                <Text
                  style={
                    styles.statNumber
                  }
                >
                  {stats.upcoming}
                </Text>
              )}

              <Text
                style={
                  styles.statLabel
                }
              >
                próximos{'\n'}eventos
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={
                styles.statIcon
              }
            >
              <Feather
                name="users"
                size={23}
                color={PURPLE}
              />
            </View>

            <View
              style={
                styles.statCopy
              }
            >
              {!events ? (
                <ActivityIndicator
                  size="small"
                  color={PURPLE}
                />
              ) : (
                <Text
                  style={
                    styles.statNumber
                  }
                >
                  {stats.past}
                </Text>
              )}

              <Text
                style={
                  styles.statLabel
                }
              >
                eventos{'\n'}asistidos
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={
                styles.statIcon
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
                styles.statCopy
              }
            >
              {!events ? (
                <ActivityIndicator
                  size="small"
                  color={PURPLE}
                />
              ) : (
                <Text
                  style={
                    styles.statNumber
                  }
                >
                  {stats.passes}
                </Text>
              )}

              <Text
                style={
                  styles.statLabel
                }
              >
                pases{'\n'}activos
              </Text>
            </View>
          </View>
        </View>

        {/* CUENTA */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Cuenta
        </Text>

        <View style={styles.menuCard}>
          <MenuRow
            icon="user"
            title="Información personal"
            onPress={
              openPersonalInfo
            }
          />

          <MenuRow
            icon="credit-card"
            title="Mis pases"
            onPress={() =>
              comingSoon(
                'Mis pases',
              )
            }
          />

          <MenuRow
            icon="bell"
            title="Notificaciones"
            onPress={() =>
              comingSoon(
                'Notificaciones',
              )
            }
          />

          <MenuRow
            icon="shield"
            title="Privacidad y seguridad"
            onPress={() =>
              navigation.navigate(
                'Privacidad y seguridad',
              )
            }
          />
        </View>

        {/* PREFERENCIAS */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Preferencias
        </Text>

        <View style={styles.menuCard}>
          <MenuRow
            icon="moon"
            title="Tema"
            value="Claro"
            onPress={() =>
              comingSoon('Tema')
            }
          />

          <MenuRow
            icon="bell"
            title="Recibir notificaciones"
            rightElement={
              <Switch
                value={
                  notificationsEnabled
                }
                onValueChange={
                  setNotificationsEnabled
                }
                trackColor={{
                  false:
                    '#D7DAE2',
                  true:
                    '#B9A9FF',
                }}
                thumbColor={
                  notificationsEnabled
                    ? PURPLE
                    : WHITE
                }
              />
            }
          />
        </View>

        {/* AYUDA */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Ayuda
        </Text>

        <View style={styles.menuCard}>
          <MenuRow
            icon="help-circle"
            title="Centro de ayuda"
            onPress={() =>
              comingSoon(
                'Centro de ayuda',
              )
            }
          />

          <MenuRow
            icon="file-text"
            title="Términos y condiciones"
            onPress={() =>
              comingSoon(
                'Términos y condiciones',
              )
            }
          />
        </View>

        {/* LOGOUT */}

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed &&
              styles.logoutPressed,
          ]}
          onPress={
            confirmLogout
          }
        >
          <Feather
            name="log-out"
            size={22}
            color={DANGER}
          />

          <Text
            style={
              styles.logoutText
            }
          >
            Cerrar sesión
          </Text>

          <Feather
            name="chevron-right"
            size={22}
            color={DANGER}
            style={{
              marginLeft: 'auto',
            }}
          />
        </Pressable>
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

          <Text style={styles.navText}>
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

          <Text style={styles.navText}>
            Eventos
          </Text>
        </Pressable>

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

        <View style={styles.navItem}>
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
        </View>
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

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    notificationButton: {
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

      backgroundColor:
        PURPLE,

      borderWidth: 2,
      borderColor:
        BACKGROUND,
    },

    miniAvatar: {
      width: 43,
      height: 43,

      borderRadius: 22,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: NAVY,
    },

    scroll: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 22,
    },

    headingArea: {
      marginTop: 17,
      marginBottom: 18,
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

    profileCard: {
      padding: 18,

      borderRadius: 22,

      backgroundColor:
        PURPLE_SOFT,
    },

    profileMain: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatarRing: {
      width: 88,
      height: 88,

      borderRadius: 44,

      borderWidth: 2,
      borderColor: PURPLE,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: WHITE,
    },

    avatar: {
      width: 78,
      height: 78,

      borderRadius: 39,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#EEEFF3',
    },

    profileInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 15,
    },

    profileName: {
      color: NAVY,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 8,
    },

    profileDataRow: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 8,

      marginTop: 7,
    },

    profileData: {
      flex: 1,
      color: MUTED,
      fontSize: 11.5,
    },

    addDataRow: {
      alignSelf:
        'flex-start',

      flexDirection: 'row',
      alignItems: 'center',

      gap: 7,

      marginTop: 8,

      paddingVertical: 2,
    },

    addDataLink: {
      color: PURPLE,
      fontSize: 12,
      fontWeight: '700',

      textDecorationLine:
        'underline',
    },

    editButton: {
      alignSelf: 'flex-end',

      flexDirection: 'row',
      alignItems: 'center',

      gap: 8,

      marginTop: 16,

      paddingHorizontal: 14,
      paddingVertical: 10,

      borderRadius: 13,

      backgroundColor:
        'rgba(255,255,255,0.72)',
    },

    editButtonText: {
      color: PURPLE,
      fontSize: 12,
      fontWeight: '700',
    },

    buttonPressed: {
      opacity: 0.72,
    },

    statsRow: {
      flexDirection: 'row',
      gap: 9,
      marginTop: 12,
    },

    statCard: {
      flex: 1,

      minHeight: 82,

      flexDirection: 'row',
      alignItems: 'center',

      gap: 9,

      paddingHorizontal: 10,

      borderWidth: 1,
      borderColor: BORDER,

      borderRadius: 15,

      backgroundColor: WHITE,
    },

    statIcon: {
      width: 39,
      height: 39,

      borderRadius: 12,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        PURPLE_SOFT,
    },

    statCopy: {
      flex: 1,
    },

    statNumber: {
      color: NAVY,
      fontSize: 16,
      fontWeight: '800',
    },

    statLabel: {
      color: MUTED,
      fontSize: 9.5,
      lineHeight: 13,
    },

    sectionTitle: {
      color: NAVY,

      fontSize: 18,

      fontWeight: '800',

      marginTop: 22,
      marginBottom: 9,
    },

    menuCard: {
      borderWidth: 1,
      borderColor: BORDER,

      borderRadius: 17,

      overflow: 'hidden',

      backgroundColor: WHITE,
    },

    menuRow: {
      minHeight: 58,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      paddingHorizontal: 16,

      borderBottomWidth: 1,
      borderBottomColor:
        BORDER,
    },

    menuRowPressed: {
      backgroundColor:
        '#F7F7FA',
    },

    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },

    menuTitle: {
      color: NAVY,
      fontSize: 12.5,
      fontWeight: '500',
    },

    menuRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    menuValue: {
      color: MUTED,
      fontSize: 11.5,
    },

    logoutButton: {
      minHeight: 57,

      flexDirection: 'row',
      alignItems: 'center',

      gap: 15,

      marginTop: 12,

      paddingHorizontal: 16,

      borderWidth: 1,
      borderColor: DANGER,

      borderRadius: 16,

      backgroundColor: WHITE,
    },

    logoutPressed: {
      backgroundColor:
        '#FFF4F5',
    },

    logoutText: {
      color: DANGER,
      fontSize: 13,
      fontWeight: '700',
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

      backgroundColor:
        PURPLE,
    },
  })