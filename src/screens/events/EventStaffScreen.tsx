import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { getEventPermissions } from '../../services/api'
import type { EventItem, EventModule } from '../../types/events'
import type { EventPermissions } from '../../services/api'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const SOFT = '#F0EDFF'
const MUTED = '#737D91'
const BORDER = '#E5E8EF'

function has(permissions: EventPermissions, ...required: string[]) {
  return permissions.owner || permissions.permissions.includes('ALL') || required.some(value => permissions.permissions.includes(value))
}

export function EventStaffScreen({ route, navigation }: { route: any; navigation: any }) {
  const event: EventItem = route.params.event
  const insets = useSafeAreaInsets()
  const [permissions, setPermissions] = useState<EventPermissions | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getEventPermissions(event.id)
      .then(value => { if (mounted) setPermissions(value) })
      .catch(loadError => { if (mounted) setError((loadError as Error).message || 'No se pudieron consultar los permisos.') })
    return () => { mounted = false }
  }, [event.id])

  const options: Array<{
    title: string
    description: string
    icon: ComponentProps<typeof Feather>['name']
    permission: string[]
    route: string
  }> = [
    { title: 'Escáner de acceso', description: 'Valida pases de invitados y entradas QR.', icon: 'maximize', permission: ['CHECK_IN'], route: 'Escáner de acceso' },
    { title: 'Invitados', description: 'Busca, revisa asignaciones y registra entradas manuales.', icon: 'users', permission: ['GUESTS'], route: 'Lista de invitados' },
    { title: 'Solicitudes de ayuda', description: 'Asigna y actualiza solicitudes recibidas.', icon: 'life-buoy', permission: ['ASSISTANCE'], route: 'Cola de ayuda' },
  ]
  const visible = options.filter(option => permissions && (has(permissions, ...option.permission) || option.route === 'Cola de ayuda' && permissions.permissions.some(value => value.startsWith('ASSISTANCE:'))))
  const galleryModule: EventModule = {
    code: 'GAL', name: 'Galería de fotos', category: 'Comunidad', featured: true, order: 0,
    description: 'Revisa y modera las fotos compartidas por los asistentes.',
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={21} color={NAVY} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.headerTitle}>Centro del personal</Text><Text style={styles.headerSubtitle} numberOfLines={1}>{event.name}</Text></View>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}><View style={styles.heroIcon}><Feather name="briefcase" size={23} color={PURPLE} /></View><Text style={styles.eyebrow}>OPERACIONES</Text><Text style={styles.title}>¿Qué necesitas atender?</Text><Text style={styles.subtitle}>Las herramientas disponibles dependen de los permisos asignados a tu cuenta.</Text></View>
        {!permissions ? <View style={styles.loading}><ActivityIndicator color={PURPLE} /><Text style={styles.muted}>{error || 'Cargando tus permisos…'}</Text></View> : visible.length || has(permissions, 'FILES') ? (
          <View style={styles.options}>
            {visible.map(option => <Pressable key={option.route} onPress={() => navigation.navigate(option.route, { event })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View style={styles.cardIcon}><Feather name={option.icon} size={19} color={PURPLE} /></View><View style={styles.cardCopy}><Text style={styles.cardTitle}>{option.title}</Text><Text style={styles.cardDescription}>{option.description}</Text></View><Feather name="chevron-right" size={19} color={MUTED} />
            </Pressable>)}
            {has(permissions, 'FILES') ? <Pressable onPress={() => navigation.navigate('Módulo del evento', { event, module: galleryModule })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View style={styles.cardIcon}><Feather name="image" size={19} color={PURPLE} /></View><View style={styles.cardCopy}><Text style={styles.cardTitle}>Moderación de fotos</Text><Text style={styles.cardDescription}>Aprueba o rechaza fotos compartidas por los asistentes.</Text></View><Feather name="chevron-right" size={19} color={MUTED} />
            </Pressable> : null}
          </View>
        ) : <View style={styles.noAccess}><Feather name="lock" size={22} color={PURPLE} /><Text style={styles.noAccessTitle}>No hay herramientas asignadas</Text><Text style={styles.muted}>Pide al organizador que habilite los permisos de acceso, invitados o ayuda para tu cuenta.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: BORDER },
  back: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#F3F4F8' },
  headerCopy: { flex: 1 }, headerTitle: { color: NAVY, fontSize: 15, fontWeight: '800' }, headerSubtitle: { color: MUTED, fontSize: 11, marginTop: 3 },
  content: { padding: 20, gap: 18 },
  hero: { paddingTop: 8, gap: 8 }, heroIcon: { width: 48, height: 48, marginBottom: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: SOFT },
  eyebrow: { color: PURPLE, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 }, title: { color: NAVY, fontSize: 25, fontWeight: '800', letterSpacing: -0.45 }, subtitle: { color: MUTED, fontSize: 12, lineHeight: 18 },
  options: { gap: 10 }, card: { minHeight: 83, padding: 14, borderWidth: 1, borderColor: BORDER, borderRadius: 18, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 12 }, cardIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: SOFT }, cardCopy: { flex: 1, gap: 4 }, cardTitle: { color: NAVY, fontSize: 13, fontWeight: '800' }, cardDescription: { color: MUTED, fontSize: 10, lineHeight: 15 },
  loading: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10 }, muted: { color: MUTED, fontSize: 11, lineHeight: 17, textAlign: 'center' }, noAccess: { padding: 24, minHeight: 185, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 18, backgroundColor: '#FFFFFF' }, noAccessTitle: { color: NAVY, fontSize: 14, fontWeight: '800' }, pressed: { opacity: 0.78 },
})
