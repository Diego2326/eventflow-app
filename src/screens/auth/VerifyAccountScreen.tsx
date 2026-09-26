import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native'
import { AuthScreenShell } from '../../components/AuthScreenShell'
import { request } from '../../services/api'
import { colors, styles } from '../../theme/styles'

export function VerifyAccountScreen({ navigation }: { navigation: any }) {
  const [token, setToken] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit() { if (!token.trim()) return setError('Ingresa el token de activación.'); setLoading(true); setError(''); try { await request('/auth/verify', 'POST', { token: token.trim() }); setMessage('Cuenta verificada. Ya puedes iniciar sesión.') } catch (reason) { setError((reason as Error).message) } finally { setLoading(false) } }
  return <AuthScreenShell><Text style={styles.kicker}>ACTIVA TU CUENTA</Text><Text style={styles.title}>Verificación</Text><Text style={styles.muted}>Pega el token incluido en el correo de EventFlow.</Text><TextInput style={styles.input} placeholder="Token de activación" value={token} onChangeText={setToken} autoCapitalize="none" multiline />{!!error && <Text style={styles.error}>{error}</Text>}{!!message && <Text style={styles.notice}>{message}</Text>}<Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={submit}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Verificar cuenta</Text>}</Pressable>{!!message && <Pressable style={styles.secondaryButton} onPress={() => navigation.replace('Login')}><Text style={styles.secondaryButtonText}>Ir al inicio de sesión</Text></Pressable>}</AuthScreenShell>
}
