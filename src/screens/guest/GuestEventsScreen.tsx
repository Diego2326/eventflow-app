import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import { getGuestTokens, loadGuestExperience, removeGuestToken, selectGuestToken } from '../../services/guest'
import type { GuestExperience } from '../../types/guest'
import { colors, styles } from '../../theme/styles'
import { formatDate, formatTime } from './shared'

type Props = NativeStackScreenProps<RootStackParamList, 'Eventos'>
type StoredEvent = { token: string; experience?: GuestExperience; error?: string }

export function GuestEventsScreen({ navigation }: Props) {
  const [events, setEvents] = useState<StoredEvent[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const tokens = await getGuestTokens()
    const loaded = await Promise.all(tokens.map(async token => {
      try { return { token, experience: await loadGuestExperience(token) } }
      catch (reason) { return { token, error: reason instanceof Error ? reason.message : 'No pudimos abrir esta invitación.' } }
    }))
    setEvents(loaded)
    setLoading(false)
  }, [])

  useFocusEffect(useCallback(() => { void reload() }, [reload]))

  const open = async (token: string) => {
    await selectGuestToken(token)
    navigation.navigate('Inicio')
  }

  const remove = async (token: string) => {
    await removeGuestToken(token)
    await reload()
  }

  return <ScrollView contentContainerStyle={styles.eventsScreen}>
    <View style={styles.eventsHeader}>
      <View><Text style={styles.kicker}>TUS INVITACIONES</Text><Text style={styles.heading}>Mis eventos</Text></View>
      <Pressable style={styles.addEventButton} onPress={() => navigation.navigate('Invitación')}><Text style={styles.addEventText}>＋</Text></Pressable>
    </View>
    <Text style={styles.muted}>Guarda todos tus eventos en un solo lugar. Cada invitación mantiene su propio pase y configuración.</Text>
    {loading ? <ActivityIndicator color={colors.coral} style={{ marginTop: 40 }} /> : null}
    <View style={styles.eventCards}>
      {events.map(item => item.experience ? <Pressable key={item.token} style={styles.eventCard} onPress={() => void open(item.token)}>
        <Text style={styles.eventCardType}>{item.experience.event.type}</Text>
        <Text style={styles.eventCardTitle}>{item.experience.event.name}</Text>
        <Text style={styles.eventCardDate}>{formatDate(item.experience.event.startsAt)} · {formatTime(item.experience.event.startsAt)}</Text>
        {item.experience.event.location ? <Text style={styles.muted}>{item.experience.event.location}</Text> : null}
        <View style={styles.eventCardFooter}>
          <Text style={styles.eventCardGuest}>{item.experience.invitation.guestName}</Text>
          <Pressable hitSlop={12} onPress={event => { event.stopPropagation(); void remove(item.token) }}><Text style={styles.removeEventText}>Eliminar</Text></Pressable>
        </View>
      </Pressable> : <View key={item.token} style={styles.card}>
        <Text style={styles.error}>{item.error}</Text>
        <Pressable onPress={() => void remove(item.token)}><Text style={styles.removeEventText}>Eliminar invitación</Text></Pressable>
      </View>)}
    </View>
    {!loading && events.length === 0 ? <View style={styles.emptyEvents}><Text style={styles.cardTitle}>Aún no tienes eventos</Text><Text style={styles.muted}>Agrega el código o enlace que recibiste del anfitrión.</Text><Pressable style={styles.button} onPress={() => navigation.navigate('Invitación')}><Text style={styles.buttonText}>Agregar invitación</Text></Pressable></View> : null}
  </ScrollView>
}
