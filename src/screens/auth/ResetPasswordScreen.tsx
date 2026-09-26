import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native'
import { AuthScreenShell } from '../../components/AuthScreenShell'
import { request } from '../../services/api'
import { colors, styles } from '../../theme/styles'

export function ResetPasswordScreen({ navigation }: { navigation: any }) {
  const [token, setToken] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit() { if (!token.trim() || !password) return setError('Completa el token y la contraseña.'); if (password !== confirm) return setError('Las contraseñas no coinciden.'); setLoading(true); setError(''); try { await request('/auth/reset-password', 'POST', { token: token.trim(), newPassword: password }); setMessage('Contraseña actualizada.') } catch (reason) { setError((reason as Error).message) } finally { setLoading(false) } }
  return <AuthScreenShell><Text style={styles.kicker}>NUEVA CREDENCIAL</Text><Text style={styles.title}>Restablece tu contraseña</Text><TextInput style={styles.input} placeholder="Token de recuperación" value={token} onChangeText={setToken} autoCapitalize="none" multiline /><TextInput style={styles.input} placeholder="Nueva contraseña" value={password} onChangeText={setPassword} secureTextEntry /><TextInput style={styles.input} placeholder="Confirmar contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry />{!!error && <Text style={styles.error}>{error}</Text>}{!!message && <Text style={styles.notice}>{message}</Text>}<Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={submit}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Guardar contraseña</Text>}</Pressable>{!!message && <Pressable style={styles.secondaryButton} onPress={() => navigation.replace('Login')}><Text style={styles.secondaryButtonText}>Iniciar sesión</Text></Pressable>}</AuthScreenShell>
}
