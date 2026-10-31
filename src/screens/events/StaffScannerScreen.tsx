import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { getEventPermissions, scanEventPass } from '../../services/api'
import type { EventItem } from '../../types/events'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const MUTED = '#737D91'
const BORDER = '#E5E8EF'

export function StaffScannerScreen({ route, navigation }: { route: any; navigation: any }) {
  const event: EventItem = route.params.event
  const insets = useSafeAreaInsets()
  const [permission, requestPermission] = useCameraPermissions()
  const [direction, setDirection] = useState<'check-in' | 'check-out'>('check-in')
  const [busy, setBusy] = useState(false)
  const [paused, setPaused] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [permissionBusy, setPermissionBusy] = useState(false)
  const [canSeeGuests, setCanSeeGuests] = useState(false)
  const lastScan = useRef('')

  useEffect(() => {
    let mounted = true
    getEventPermissions(event.id).then(access => {
      if (mounted) setCanSeeGuests(access.owner || access.permissions.includes('ALL') || access.permissions.includes('GUESTS'))
    }).catch(() => undefined)
    return () => { mounted = false }
  }, [event.id])

  const onScan = useCallback(async ({ data }: { data: string }) => {
    if (busy || paused || !data || lastScan.current === data) return
    lastScan.current = data
    setBusy(true)
    setPaused(true)
    try {
      await scanEventPass(event.id, data, direction)
      setResult({ ok: true, message: direction === 'check-in' ? 'Ingreso registrado' : 'Salida registrada' })
    } catch (error) {
      setResult({ ok: false, message: (error as Error).message || 'No se pudo validar el pase.' })
    } finally {
      setBusy(false)
    }
  }, [busy, direction, event.id, paused])

  async function enableCamera() {
    setPermissionBusy(true)
    try { await requestPermission() } finally { setPermissionBusy(false) }
  }

  function resumeScanner() {
    lastScan.current = ''
    setResult(null)
    setPaused(false)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={21} color="#FFFFFF" /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.headerTitle}>Escáner de acceso</Text><Text style={styles.headerSubtitle} numberOfLines={1}>{event.name}</Text></View>
        <View style={styles.headerIcon}><Feather name="shield" size={18} color="#FFFFFF" /></View>
      </View>

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <View style={styles.modeSwitch}>
          {(['check-in', 'check-out'] as const).map(value => <Pressable key={value} onPress={() => { setDirection(value); resumeScanner() }} style={[styles.modeButton, direction === value && styles.modeButtonActive]}>
            <Feather name={value === 'check-in' ? 'log-in' : 'log-out'} size={15} color={direction === value ? NAVY : '#D0D6E2'} /><Text style={[styles.modeText, direction === value && styles.modeTextActive]}>{value === 'check-in' ? 'Ingreso' : 'Salida'}</Text>
          </Pressable>)}
        </View>

        <View style={styles.cameraFrame}>
          {permission?.granted ? <CameraView style={StyleSheet.absoluteFill} facing="back" active={!paused && !busy} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={paused || busy ? undefined : onScan} /> : <View style={styles.cameraPlaceholder}>
            <View style={styles.cameraIcon}><Feather name="camera" size={28} color={PURPLE} /></View><Text style={styles.cameraTitle}>{permission?.canAskAgain === false ? 'Permite la cámara en Configuración' : 'Activa la cámara para escanear'}</Text><Text style={styles.cameraHint}>EventFlow solo usa la cámara mientras esta pantalla está abierta.</Text>
            {permission?.canAskAgain !== false ? <Pressable disabled={permissionBusy} onPress={() => void enableCamera()} style={styles.enableButton}>{permissionBusy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.enableText}>Permitir cámara</Text>}</Pressable> : null}
          </View>}
          {permission?.granted && !paused ? <View pointerEvents="none" style={styles.scanFrame}><View style={styles.cornerTL} /><View style={styles.cornerTR} /><View style={styles.cornerBL} /><View style={styles.cornerBR} /></View> : null}
          {busy ? <View style={styles.busyOverlay}><ActivityIndicator size="large" color="#FFFFFF" /><Text style={styles.busyText}>Validando pase…</Text></View> : null}
        </View>

        {result ? <View style={[styles.resultCard, result.ok ? styles.resultSuccess : styles.resultError]}>
          <View style={[styles.resultIcon, result.ok ? styles.resultIconSuccess : styles.resultIconError]}><Feather name={result.ok ? 'check' : 'alert-circle'} size={20} color={result.ok ? '#198A5C' : '#C33243'} /></View>
          <View style={styles.resultCopy}><Text style={styles.resultTitle}>{result.message}</Text><Text style={styles.resultHint}>{result.ok ? 'El servidor confirmó el cambio de acceso.' : 'Verifica el código y vuelve a intentarlo.'}</Text></View>
          <Pressable onPress={resumeScanner} style={styles.retry}><Feather name="rotate-ccw" size={16} color={PURPLE} /><Text style={styles.retryText}>Otro</Text></Pressable>
        </View> : <View style={styles.instructions}><Feather name="info" size={16} color={PURPLE} /><Text style={styles.instructionsText}>Centra el QR del pase. Cada lectura se valida con la API y registra una sola persona.</Text></View>}

        {canSeeGuests ? <Pressable onPress={() => navigation.navigate('Lista de invitados', { event })} style={styles.guestLink}><Feather name="users" size={16} color={PURPLE} /><Text style={styles.guestLinkText}>Buscar invitado por nombre</Text><Feather name="chevron-right" size={17} color={MUTED} /></Pressable> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101A32' }, header: { minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#27324B' }, headerCopy: { flex: 1 }, headerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' }, headerSubtitle: { marginTop: 3, color: '#B5BDCC', fontSize: 10 }, headerIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#27324B' },
  content: { flex: 1, padding: 18, gap: 14 }, modeSwitch: { padding: 4, borderRadius: 14, backgroundColor: '#202B43', flexDirection: 'row', gap: 4 }, modeButton: { flex: 1, minHeight: 43, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, borderRadius: 11 }, modeButtonActive: { backgroundColor: '#FFFFFF' }, modeText: { color: '#D0D6E2', fontSize: 12, fontWeight: '700' }, modeTextActive: { color: NAVY },
  cameraFrame: { flex: 1, minHeight: 320, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#E9ECF4' }, cameraPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 }, cameraIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#F0EDFF' }, cameraTitle: { color: NAVY, fontSize: 15, fontWeight: '800', textAlign: 'center' }, cameraHint: { maxWidth: 250, color: MUTED, fontSize: 11, lineHeight: 16, textAlign: 'center' }, enableButton: { minHeight: 42, paddingHorizontal: 17, marginTop: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: PURPLE }, enableText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  scanFrame: { position: 'absolute', width: 230, height: 230 }, cornerTL: { position: 'absolute', top: 0, left: 0, width: 36, height: 36, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#FFFFFF', borderTopLeftRadius: 13 }, cornerTR: { position: 'absolute', top: 0, right: 0, width: 36, height: 36, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#FFFFFF', borderTopRightRadius: 13 }, cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 36, height: 36, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#FFFFFF', borderBottomLeftRadius: 13 }, cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#FFFFFF', borderBottomRightRadius: 13 }, busyOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(11,29,58,0.72)' }, busyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  instructions: { minHeight: 54, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', gap: 9, borderRadius: 14, backgroundColor: '#202B43' }, instructionsText: { flex: 1, color: '#D6DBE5', fontSize: 10, lineHeight: 15 }, resultCard: { minHeight: 66, padding: 10, alignItems: 'center', flexDirection: 'row', gap: 10, borderRadius: 15, borderWidth: 1 }, resultSuccess: { backgroundColor: '#EAF8F1', borderColor: '#C9EBDD' }, resultError: { backgroundColor: '#FFF0F1', borderColor: '#F6D0D4' }, resultIcon: { width: 37, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }, resultIconSuccess: { backgroundColor: '#D5F1E3' }, resultIconError: { backgroundColor: '#FFE1E4' }, resultCopy: { flex: 1, gap: 3 }, resultTitle: { color: NAVY, fontSize: 11, fontWeight: '800' }, resultHint: { color: MUTED, fontSize: 9 }, retry: { paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, backgroundColor: '#FFFFFF' }, retryText: { color: PURPLE, fontSize: 10, fontWeight: '800' },
  guestLink: { minHeight: 48, paddingHorizontal: 12, alignItems: 'center', flexDirection: 'row', gap: 9, borderWidth: 1, borderColor: '#364159', borderRadius: 14 }, guestLinkText: { flex: 1, color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
})
