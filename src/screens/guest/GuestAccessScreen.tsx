import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import { loadGuestExperience, saveGuestToken } from '../../services/guest'
import { colors, styles } from '../../theme/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'Invitación'>

function invitationToken(value: string) {
  const clean = value.trim()
  const match = clean.match(/(?:invite|access)\/([^/?#]+)/i)
  return decodeURIComponent(match?.[1] ?? clean)
}

export function GuestAccessScreen({ navigation, route }: Props) {
  const [token, setToken] = useState(route.params?.token ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openInvitation = async (raw = token) => {
    const clean = invitationToken(raw)
    if (!clean) return setError('Ingresa el código o enlace de tu invitación.')
    setLoading(true)
    setError('')
    try {
      await loadGuestExperience(clean)
      await saveGuestToken(clean)
      navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'La invitación no es válida.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (route.params?.token) void openInvitation(route.params.token)
  // The deep-link token is intentionally handled only when it changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.token])

  return <KeyboardAvoidingView style={styles.authScreen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.guestAccess}>
      <View style={styles.logoRow}>
        <Image source={require('../../../assets/eventflow-mark.png')} style={styles.logo} />
        <Text style={styles.brand}>EventFlow</Text>
      </View>
      <Text style={styles.kicker}>TU INVITACIÓN</Text>
      <Text style={styles.title}>Tu evento empieza aquí</Text>
      <Text style={styles.muted}>Abre el enlace que recibiste o pega el código de invitación para ver tu pase y todos los detalles.</Text>
      <TextInput value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} placeholder="Código o enlace de invitación" style={styles.input} editable={!loading} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={() => void openInvitation()}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Abrir mi invitación</Text>}
      </Pressable>
    </View>
  </KeyboardAvoidingView>
}
