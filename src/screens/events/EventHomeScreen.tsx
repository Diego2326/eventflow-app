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

import { api } from '../../services/api'
import type {
  EventItem,
  EventModule,
} from '../../types/events'

const NAVY = '#0B1D3A'

const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const SOFT = '#F7F8FA'
const BORDER = '#E9EBEF'
const MUTED = '#747C8E'

type Activity = {
  time: string
  title: string
  detail: string
}

const DEMO_ACTIVITIES: Activity[] = [
  {
    time: '10:00 a. m.',
    title: 'El poder de las ideas',
    detail: 'Lucía Torres',
  },
  {
    time: '11:30 a. m.',
    title: 'Creatividad en la era IA',
    detail: 'Diego Ramírez',
  },
  {
    time: '1:00 p. m.',
    title: 'Panel: El futuro creativo',
    detail: 'Ana Martínez, Carlos Vega',
  },
]

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

  const [error, setError] =
    useState('')

  useEffect(() => {
    setError('')

    api<EventModule[]>(
      `/events/${event.id}/modules/navigation`,
    )
      .then(setModules)
      .catch(error => {
        setError(
          (error as Error).message,
        )
      })
  }, [event.id])

  function comingSoon(name: string) {
    Alert.alert(
      name,
      'Esta función estará disponible cuando conectemos el módulo correspondiente.',
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
          onPress={() =>
            comingSoon(
              'Opciones del evento',
            )
          }
        >
          <Feather
            name="more-horizontal"
            size={25}
            color={NAVY}
          />
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
          onPress={() =>
            comingSoon('Tu pase')
          }
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
              Ana Organizadora
            </Text>

            <Text style={styles.passRole}>
              Asistente General
            </Text>
          </View>

          <View style={styles.qrContainer}>
            <MaterialCommunityIcons
              name="qrcode"
              size={55}
              color={NAVY}
            />
          </View>

          <Feather
            name="chevron-right"
            size={24}
            color="#7D8493"
          />
        </Pressable>

        {/* ACCESOS RÁPIDOS */}
        <View style={styles.quickRow}>
          <Pressable
            style={({ pressed }) => [
              styles.quickButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              comingSoon('Agenda')
            }
          >
            <Feather
              name="file-text"
              size={25}
              color={NAVY}
            />

            <Text style={styles.quickText}>
              Agenda
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              comingSoon('Networking')
            }
          >
            <Feather
              name="users"
              size={26}
              color={NAVY}
            />

            <Text style={styles.quickText}>
              Networking
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              comingSoon('Preguntas')
            }
          >
            <Feather
              name="message-circle"
              size={25}
              color={NAVY}
            />

            <Text style={styles.quickText}>
              Preguntas
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              comingSoon('Galería')
            }
          >
            <Feather
              name="image"
              size={25}
              color={NAVY}
            />

            <Text style={styles.quickText}>
              Galería
            </Text>
          </Pressable>
        </View>

        {/* PRÓXIMAS ACTIVIDADES */}
        <View style={styles.activitiesHeader}>
          <Text style={styles.activitiesTitle}>
            Próximas actividades
          </Text>

          <Pressable
            style={styles.agendaLink}
            onPress={() =>
              comingSoon('Agenda')
            }
          >
            <Text style={styles.agendaLinkText}>
              Ver agenda
            </Text>

            <Feather
              name="chevron-right"
              size={18}
              color={PURPLE}
            />
          </Pressable>
        </View>

        <View style={styles.activities}>
          {DEMO_ACTIVITIES.map(
            activity => (
              <Pressable
                key={`${activity.time}-${activity.title}`}
                style={({ pressed }) => [
                  styles.activityRow,
                  pressed &&
                    styles.activityPressed,
                ]}
                onPress={() =>
                  comingSoon(
                    activity.title,
                  )
                }
              >
                <Text style={styles.activityTime}>
                  {activity.time}
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
                    {activity.detail}
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={22}
                  color="#798190"
                />
              </Pressable>
            ),
          )}
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
          onPress={() =>
            comingSoon('Tu pase')
          }
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
            comingSoon(
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