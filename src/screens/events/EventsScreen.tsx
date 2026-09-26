import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api, logout, SessionExpiredError } from '../../services/api'
import type { EventItem } from '../../types/events'
import { colors, styles } from '../../theme/styles'

export function EventsScreen({ navigation }: { navigation: any }) {
  const [items, setItems] = useState<EventItem[] | null>(null); const [error, setError] = useState('')
  const load = useCallback(() => { setError(''); api<EventItem[]>('/events').then(setItems).catch(reason => { if (reason instanceof SessionExpiredError) navigation.replace('Login'); else setError(reason.message) }) }, [navigation])
  useFocusEffect(useCallback(() => { load() }, [load]))
  async function signOut() { await logout(); navigation.replace('Login') }
  return <SafeAreaView style={styles.screen}>
    <View style={styles.row}><View><Text style={styles.kicker}>MIS EXPERIENCIAS</Text><Text style={styles.heading}>Eventos</Text></View><View style={styles.rowWrap}><Pressable onPress={() => navigation.navigate('Perfil')}><Text style={styles.link}>Perfil</Text></Pressable><Pressable onPress={signOut}><Text style={styles.link}>Salir</Text></Pressable></View></View>
    {!!error && <><Text style={styles.error}>{error}</Text><Pressable style={styles.secondaryButton} onPress={load}><Text style={styles.secondaryButtonText}>Reintentar</Text></Pressable></>}
    {!items && !error ? <ActivityIndicator color={colors.coral} /> : <FlatList data={items ?? []} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.card}><Text style={styles.cardTitle}>Tu primer evento empieza aquí</Text><Text style={styles.muted}>Crea un proyecto y aplica una plantilla modular.</Text></View>} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => navigation.navigate('Inicio del evento', { event: item })}><View style={styles.rowWrap}><Text style={styles.pill}>{item.type}</Text>{item.status && <Text style={styles.statusPill}>{item.status}</Text>}</View><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{new Date(item.startsAt).toLocaleString()} · {item.location || 'Ubicación por definir'}</Text></Pressable>} />}
    <Pressable accessibilityLabel="Crear evento" style={styles.fab} onPress={() => navigation.navigate('Crear evento')}><Text style={styles.fabText}>＋</Text></Pressable>
  </SafeAreaView>
}
