import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api, request, SessionExpiredError } from '../../services/api'
import type { EventItem, EventModule } from '../../types/events'
import { colors, styles } from '../../theme/styles'

export function EventHomeScreen({ route, navigation }: { route: any; navigation: any }) {
  const initial: EventItem = route.params.event; const [event, setEvent] = useState(initial); const [modules, setModules] = useState<EventModule[] | null>(null); const [error, setError] = useState(''); const [changing, setChanging] = useState(false)
  const load = useCallback(async () => { setError(''); try { const [current, navigationModules] = await Promise.all([api<EventItem>(`/events/${initial.id}`), api<EventModule[]>(`/events/${initial.id}/modules/navigation`)]); setEvent(current); setModules(navigationModules) } catch (reason) { if (reason instanceof SessionExpiredError) navigation.replace('Login'); else setError((reason as Error).message) } }, [initial.id, navigation])
  useFocusEffect(useCallback(() => { load() }, [load]))
  async function changeState(status: string) { setChanging(true); setError(''); try { setEvent(await request<EventItem>(`/events/${event.id}/state`, 'PUT', { status })) } catch (reason) { setError((reason as Error).message) } finally { setChanging(false) } }
  const featured = modules?.filter(module => module.featured) ?? []
  return <SafeAreaView style={styles.screen}>
    <View style={styles.row}><View style={styles.moduleBody}><Text style={styles.kicker}>{event.type}</Text><Text style={styles.heading}>{event.name}</Text></View>{event.status && <Text style={styles.statusPill}>{event.status}</Text>}</View>
    <Text style={styles.muted}>{event.location || 'Ubicación por definir'} · {new Date(event.startsAt).toLocaleString()}</Text>
    {event.description && <Text style={[styles.muted, { marginTop: 8 }]}>{event.description}</Text>}
    <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Gestionar módulos', { event })}><Text style={styles.secondaryButtonText}>Gestionar módulos</Text></Pressable>
    {!!event.validTransitions?.length && <><Text style={styles.section}>Cambiar estado</Text><View style={styles.rowWrap}>{event.validTransitions.map(status => <Pressable disabled={changing} key={status} style={styles.choice} onPress={() => changeState(status)}><Text style={styles.choiceText}>{status}</Text></Pressable>)}</View></>}
    {!!featured.length && <><Text style={styles.section}>Destacados</Text><View style={styles.featured}>{featured.map(module => <View style={styles.feature} key={module.code}><Text style={styles.icon}>{module.icon || module.code}</Text><Text style={styles.featureText}>{module.name}</Text></View>)}</View></>}
    <Text style={styles.section}>Explora el evento</Text>
    {!!error && <Text style={styles.error}>{error}</Text>}{!modules && !error ? <ActivityIndicator color={colors.coral} /> : <FlatList data={modules ?? []} keyExtractor={module => module.code} renderItem={({ item }) => <View style={styles.module}><View style={styles.moduleIcon}><Text style={styles.moduleCode}>{item.icon || item.code}</Text></View><View style={styles.moduleBody}><Text style={styles.moduleTitle}>{item.name}</Text><Text style={styles.muted}>{item.category}</Text></View></View>} />}
  </SafeAreaView>
}
