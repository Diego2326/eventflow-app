import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native'
import { AuthScreenShell } from '../../components/AuthScreenShell'
import { request } from '../../services/api'
import { colors, styles } from '../../theme/styles'

export function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit() { if (!email.trim()) return setError('Ingresa tu correo.'); setError(''); setLoading(true); try { await request('/auth/forgot-password', 'POST', { email: email.trim() }); setMessage('Si la cuenta existe, recibirás instrucciones.') } catch (reason) { setError((reason as Error).message) } finally { setLoading(false) } }
  return <AuthScreenShell><Text style={styles.kicker}>RECUPERACIÓN SEGURA</Text><Text style={styles.title}>Recupera tu acceso</Text><TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />{!!error && <Text style={styles.error}>{error}</Text>}{!!message && <Text style={styles.notice}>{message}</Text>}<Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={submit}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Enviar instrucciones</Text>}</Pressable>{!!message && <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Restablecer contraseña')}><Text style={styles.secondaryButtonText}>Ya tengo el token</Text></Pressable>}</AuthScreenShell>
}
