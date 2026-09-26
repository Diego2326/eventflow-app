import { useCallback } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable'
import type { GuestTabParamList, RootStackParamList } from '../../navigation/AppNavigator'
import { useGuestExperience } from '../../hooks/useGuestExperience'
import { clearGuestToken } from '../../services/guest'
import { styles } from '../../theme/styles'
import { ErrorView, formatDate, formatTime, LoadingView } from './shared'

type Props = NativeBottomTabScreenProps<GuestTabParamList, 'Resumen'>
const tabRoutes: Partial<Record<string, keyof GuestTabParamList>> = { GST: 'Pase', CAL: 'Programa', AST: 'Ayuda' }
const detailRoutes: Partial<Record<string, keyof RootStackParamList>> = { INV: 'Confirmar asistencia', NOT: 'Avisos', MAP: 'Mapa' }

export function GuestHomeScreen({ navigation }: Props) {
  const { experience, loading, error, reload } = useGuestExperience()
  useFocusEffect(useCallback(() => { void reload() }, [reload]))
  if (loading && !experience) return <LoadingView />
  if (!experience) return <ErrorView message={error} />
  const { invitation, event, modules } = experience
  const status = invitation.status === 'ACCEPTED' ? 'ASISTENCIA CONFIRMADA' : invitation.status === 'DECLINED' ? 'NO ASISTIRÁS' : 'CONFIRMACIÓN PENDIENTE'

  const changeInvitation = async () => {
    await clearGuestToken()
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Invitación' }] })
  }

  const openModule = (code: string) => {
    const tab = tabRoutes[code]
    if (tab) return navigation.navigate(tab)
    const detail = detailRoutes[code]
    if (detail) navigation.getParent()?.navigate(detail)
  }

  return <ScrollView contentContainerStyle={styles.guestHome}>
    <View style={styles.hero}>
      <Text style={styles.heroKicker}>HOLA, {invitation.guestName.toUpperCase()}</Text>
      <Text style={styles.heroTitle}>{event.name}</Text>
      <Text style={styles.heroDate}>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</Text>
      {event.location ? <Text style={styles.heroLocation}>{event.location}</Text> : null}
      <Text style={styles.heroPill}>{status}</Text>
    </View>

    {(experience.now || experience.next) ? <View style={styles.liveCard}>
      <Text style={styles.kicker}>{experience.now ? 'OCURRIENDO AHORA' : 'LO SIGUIENTE'}</Text>
      <Text style={styles.cardTitle}>{(experience.now ?? experience.next)?.title}</Text>
      <Text style={styles.muted}>{formatTime((experience.now ?? experience.next)!.startsAt)}{(experience.now ?? experience.next)?.zone ? ` · ${(experience.now ?? experience.next)?.zone}` : ''}</Text>
    </View> : null}

    <Text style={styles.section}>Todo lo que necesitas</Text>
    <View style={styles.guestGrid}>
      {modules.filter(module => tabRoutes[module.code] || detailRoutes[module.code]).map(module => <Pressable key={module.code} style={[styles.guestModule, module.featured && styles.guestModuleFeatured]} onPress={() => openModule(module.code)}>
        <Text style={[styles.moduleCode, module.featured && styles.guestModuleCodeFeatured]}>{module.code}</Text>
        <Text style={[styles.moduleTitle, module.featured && styles.guestModuleTextFeatured]}>{module.name}</Text>
        <Text style={[styles.moduleDescription, module.featured && styles.guestModuleDescriptionFeatured]}>{module.description}</Text>
      </Pressable>)}
    </View>
    <Pressable onPress={() => void changeInvitation()}><Text style={styles.centerLink}>Usar otra invitación</Text></Pressable>
  </ScrollView>
}
