import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { DigitalPassQr } from '../../components/ui/DigitalPassQr'
import { GlassOverlay } from '../../components/ui/GlassOverlay'

import {
  getPublicInvitationExperience,
  linkPublicInvitation,
  respondToPublicInvitation,
} from '../../services/api'
import type { PublicInvitationExperience } from '../../services/api'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_SOFT = '#F0EDFF'
const MUTED = '#737D91'
const BORDER = '#E5E8EF'
const WHITE = '#FFFFFF'
const GREEN = '#249B68'
const RED = '#D64550'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${date.toLocaleTimeString('es-GT', { hour: 'numeric', minute: '2-digit' })}`
}

function statusText(status: string) {
  if (status === 'ACCEPTED') return 'Asistencia confirmada'
  if (status === 'DECLINED') return 'Marcaste que no asistirás'
  return 'Esperando tu respuesta'
}

export function PublicInvitationScreen({
  route,
  navigation,
}: {
  route: any
  navigation: any
}) {
  const token: string = route.params?.token ?? ''
  const signedIn: boolean = route.params?.signedIn ?? false
  const insets = useSafeAreaInsets()
  const [experience, setExperience] = useState<PublicInvitationExperience | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [companionsInput, setCompanionsInput] = useState('')
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    getPublicInvitationExperience(token)
      .then(result => {
        if (!mounted) return
        setExperience(result)
        setCompanionsInput(result.invitation.companions.join(', '))
      })
      .catch(loadError => {
        if (mounted) setError((loadError as Error).message || 'No se pudo abrir esta invitación.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [token])

  const companions = useMemo(() => companionsInput
    .split(/[\n,]/)
    .map(name => name.trim())
    .filter(Boolean), [companionsInput])

  async function submitRsvp(accepted: boolean) {
    if (!experience) return
    if (accepted && companions.length + 1 > experience.invitation.allowedCapacity) {
      Alert.alert('Se superó el cupo', `Esta invitación permite ${experience.invitation.allowedCapacity} persona(s) en total.`)
      return
    }
    setSaving(true)
    try {
      const invitation = await respondToPublicInvitation(token, accepted, accepted ? companions : [])
      setExperience(current => current ? { ...current, invitation } : current)
      if (!accepted) setCompanionsInput('')
      setShowQr(accepted)
      Alert.alert(
        accepted ? '¡Te esperamos!' : 'Respuesta guardada',
        accepted ? 'Tu asistencia quedó confirmada.' : 'Actualizamos tu invitación. Puedes cambiar la respuesta desde este enlace.',
      )
    } catch (rsvpError) {
      Alert.alert('No se pudo guardar tu respuesta', (rsvpError as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function saveToAccount() {
    setSaving(true)
    try {
      await linkPublicInvitation(token)
      Alert.alert('Invitación vinculada', 'Ya puedes consultar esta invitación desde Mis pases.', [
        { text: 'Ver mis pases', onPress: () => navigation.navigate('Mis pases') },
        { text: 'Seguir aquí', style: 'cancel' },
      ])
    } catch (linkError) {
      Alert.alert('No se pudo vincular', (linkError as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const event = experience?.event
  const invitation = experience?.invitation
  const assistanceModule = experience?.modules.find(module => module.code.toUpperCase() === 'AST')
  const isAccepted = invitation?.status === 'ACCEPTED'
  const isDeclined = invitation?.status === 'DECLINED'

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.backButton}>
          <GlassOverlay style={styles.backGlass} />
          <Feather name="arrow-left" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Tu invitación</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingState}><ActivityIndicator color={PURPLE} /><Text style={styles.mutedText}>Cargando invitación…</Text></View>
        ) : error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}><Feather name="alert-circle" size={24} color={RED} /></View>
            <Text style={styles.title}>No pudimos abrir el enlace</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.mutedText}>El enlace puede haber vencido o haber sido reemplazado por el organizador.</Text>
            <Pressable onPress={() => navigation.goBack()} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Volver</Text></Pressable>
          </View>
        ) : experience && event && invitation ? (
          <>
            <View style={styles.heroIcon}><Feather name="mail" size={25} color={PURPLE} /></View>
            <Text style={styles.eyebrow}>INVITACIÓN PERSONAL</Text>
            <Text style={styles.title}>Hola, {invitation.guestName}</Text>
            <Text style={styles.subtitle}>Te invitamos a acompañarnos. Aquí tienes los detalles del evento.</Text>

            <View style={styles.eventCard}>
              <View style={styles.eventAccent} />
              <Text style={styles.eventName}>{event.name}</Text>
              {event.description ? <Text style={styles.eventDescription}>{event.description}</Text> : null}
              <View style={styles.detailRow}><Feather name="calendar" size={17} color={PURPLE} /><Text style={styles.detailText}>{formatDate(event.startsAt)}</Text></View>
              {event.location ? <View style={styles.detailRow}><Feather name="map-pin" size={17} color={PURPLE} /><Text style={styles.detailText}>{event.location}</Text></View> : null}
              {invitation.table || invitation.seat || invitation.sector ? (
                <View style={styles.assignmentBox}>
                  <Feather name="grid" size={16} color={PURPLE} />
                  <Text style={styles.assignmentText}>{[invitation.table, invitation.seat, invitation.sector].filter(Boolean).join(' · ')}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.rsvpCard}>
              <View style={styles.rsvpTop}>
                <View style={[styles.statusDot, isAccepted ? styles.statusAccepted : isDeclined ? styles.statusDeclined : styles.statusPending]} />
                <Text style={styles.rsvpStatus}>{statusText(invitation.status)}</Text>
              </View>
              <Text style={styles.rsvpPrompt}>¿Podrás acompañarnos?</Text>
              <Text style={styles.rsvpHint}>Confirma o declina desde aquí; no necesitas crear una cuenta.</Text>

              {invitation.allowedCapacity > 1 && !isDeclined ? (
                <View style={styles.companionsBlock}>
                  <Text style={styles.fieldLabel}>Nombres de tus acompañantes</Text>
                  <TextInput
                    value={companionsInput}
                    onChangeText={setCompanionsInput}
                    placeholder="Ej. Luis, Andrea"
                    placeholderTextColor="#9AA1AE"
                    maxLength={500}
                    style={styles.companionsInput}
                  />
                  <Text style={styles.fieldHint}>{companions.length + 1} de {invitation.allowedCapacity} lugares · separa los nombres con coma</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <Pressable disabled={saving} onPress={() => void submitRsvp(true)} style={[styles.primaryButton, saving && styles.disabled]}>
                  {saving ? <ActivityIndicator color={WHITE} /> : <><Feather name="check" size={17} color={WHITE} /><Text style={styles.primaryButtonText}>{isAccepted ? 'Actualizar asistencia' : 'Sí, asistiré'}</Text></>}
                </Pressable>
                <Pressable disabled={saving} onPress={() => void submitRsvp(false)} style={[styles.declineButton, saving && styles.disabled]}>
                  <Feather name="x" size={17} color={isDeclined ? RED : MUTED} />
                  <Text style={[styles.declineButtonText, isDeclined && { color: RED }]}>{isDeclined ? 'Respuesta guardada' : 'No podré asistir'}</Text>
                </Pressable>
              </View>
            </View>

            {isAccepted && invitation.qrPayload ? (
              <View style={styles.qrCard}>
                <Pressable onPress={() => setShowQr(value => !value)} style={styles.qrToggle}>
                  <View style={styles.qrIcon}><Feather name="grid" size={18} color={PURPLE} /></View>
                  <View style={styles.qrCopy}><Text style={styles.qrTitle}>Pase digital</Text><Text style={styles.mutedText}>Muestra tu código al ingresar</Text></View>
                  <Feather name={showQr ? 'chevron-up' : 'chevron-down'} size={18} color={PURPLE} />
                </Pressable>
                {showQr ? <View style={styles.qrContent}><DigitalPassQr value={invitation.qrPayload} size={198} /></View> : null}
              </View>
            ) : null}

            {assistanceModule ? <Pressable onPress={() => navigation.navigate('Módulo del evento', {
              event: { id: event.id, name: event.name, type: event.type, startsAt: event.startsAt, location: event.location || '' },
              module: assistanceModule,
              token,
            })} style={styles.assistanceButton}>
              <View style={styles.assistanceIcon}><Feather name="life-buoy" size={17} color={PURPLE} /></View>
              <View style={styles.assistanceCopy}><Text style={styles.assistanceTitle}>Pedir ayuda al equipo</Text><Text style={styles.mutedText}>No necesitas iniciar sesión</Text></View>
              <Feather name="chevron-right" size={17} color={PURPLE} />
            </Pressable> : null}

            {experience.agenda.length ? (
              <View style={styles.agendaCard}>
                <Text style={styles.sectionTitle}>Agenda</Text>
                {experience.agenda.slice(0, 3).map(item => (
                  <View key={item.id} style={styles.agendaRow}>
                    <View style={styles.agendaTime}><Text style={styles.agendaTimeText}>{new Date(item.startsAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}</Text></View>
                    <View style={styles.agendaCopy}><Text style={styles.agendaName}>{item.title}</Text>{item.location ? <Text style={styles.agendaLocation}>{item.location}</Text> : null}</View>
                  </View>
                ))}
              </View>
            ) : null}

            {signedIn ? (
              <Pressable disabled={saving} onPress={() => void saveToAccount()} style={styles.linkButton}>
                {saving ? <ActivityIndicator color={PURPLE} /> : <><Feather name="user-plus" size={17} color={PURPLE} /><Text style={styles.linkButtonText}>Guardar en mi cuenta</Text></>}
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { minHeight: 62, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  backButton: { width: 38, height: 38, borderRadius: 13, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F8' },
  backGlass: { borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.56)' },
  headerTitle: { color: NAVY, fontSize: 14, fontWeight: '800' },
  headerSpacer: { width: 38 },
  content: { padding: 21, gap: 13 },
  loadingState: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mutedText: { color: MUTED, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  heroIcon: { width: 52, height: 52, marginTop: 3, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE_SOFT },
  eyebrow: { marginTop: 4, color: PURPLE, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: NAVY, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { marginTop: -5, marginBottom: 3, color: MUTED, fontSize: 12, lineHeight: 18 },
  eventCard: { overflow: 'hidden', padding: 17, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE, gap: 12 },
  eventAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: PURPLE },
  eventName: { marginTop: 2, color: NAVY, fontSize: 19, fontWeight: '800', lineHeight: 25 },
  eventDescription: { color: MUTED, fontSize: 11, lineHeight: 17, marginTop: -5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { flex: 1, color: '#515B70', fontSize: 11, lineHeight: 16, textTransform: 'capitalize' },
  assignmentBox: { marginTop: 2, padding: 11, borderRadius: 13, backgroundColor: PURPLE_SOFT, flexDirection: 'row', alignItems: 'center', gap: 9 },
  assignmentText: { flex: 1, color: NAVY, fontSize: 11, fontWeight: '700' },
  rsvpCard: { padding: 16, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE, gap: 11 },
  rsvpTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusAccepted: { backgroundColor: GREEN },
  statusDeclined: { backgroundColor: RED },
  statusPending: { backgroundColor: '#D99A28' },
  rsvpStatus: { color: MUTED, fontSize: 10, fontWeight: '700' },
  rsvpPrompt: { color: NAVY, fontSize: 16, fontWeight: '800' },
  rsvpHint: { color: MUTED, fontSize: 11, lineHeight: 16, marginTop: -7 },
  companionsBlock: { gap: 7, marginTop: 2 },
  fieldLabel: { color: NAVY, fontSize: 10, fontWeight: '800' },
  companionsInput: { minHeight: 43, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: BORDER, color: NAVY, fontSize: 12, backgroundColor: '#FCFCFE' },
  fieldHint: { color: MUTED, fontSize: 9.5 },
  actions: { gap: 8, marginTop: 3 },
  primaryButton: { minHeight: 46, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PURPLE },
  primaryButtonText: { color: WHITE, fontSize: 12, fontWeight: '800' },
  declineButton: { minHeight: 43, borderRadius: 14, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FBFBFD' },
  declineButtonText: { color: MUTED, fontSize: 11, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  agendaCard: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE, gap: 12 },
  sectionTitle: { color: NAVY, fontSize: 15, fontWeight: '800' },
  agendaRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF0F4', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  agendaTime: { minWidth: 53, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 8, alignItems: 'center', backgroundColor: PURPLE_SOFT },
  agendaTimeText: { color: PURPLE, fontSize: 9, fontWeight: '800' },
  agendaCopy: { flex: 1, gap: 3 },
  agendaName: { color: NAVY, fontSize: 11, fontWeight: '700' },
  agendaLocation: { color: MUTED, fontSize: 10 },
  qrCard: { padding: 14, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: WHITE },
  qrToggle: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 10 },
  qrIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE_SOFT },
  qrCopy: { flex: 1, gap: 3 },
  qrTitle: { color: NAVY, fontSize: 12, fontWeight: '800' },
  qrContent: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: BORDER },
  assistanceButton: { minHeight: 63, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, borderColor: '#DDD7FA', backgroundColor: WHITE },
  assistanceIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: PURPLE_SOFT },
  assistanceCopy: { flex: 1, gap: 3 },
  assistanceTitle: { color: NAVY, fontSize: 11, fontWeight: '800' },
  linkButton: { minHeight: 44, borderRadius: 13, borderWidth: 1, borderColor: '#D8D0FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PURPLE_SOFT },
  linkButtonText: { color: PURPLE, fontSize: 11, fontWeight: '800' },
  errorCard: { minHeight: 260, padding: 22, borderRadius: 20, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', gap: 11, backgroundColor: WHITE },
  errorIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F1' },
  errorText: { color: RED, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  secondaryButton: { minHeight: 40, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE_SOFT },
  secondaryButtonText: { color: PURPLE, fontSize: 11, fontWeight: '800' },
})
