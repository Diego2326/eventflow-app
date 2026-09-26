import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native'
import { AuthScreenShell } from '../../components/AuthScreenShell'
import { request } from '../../services/api'
import { colors, styles } from '../../theme/styles'

export function RegisterScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('')
  const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) return setError('Todos los campos son obligatorios.')
    setError(''); setMessage(''); setLoading(true)
    try { await request('/auth/register', 'POST', { name: name.trim(), email: email.trim(), phone: phone.trim(), password }); setMessage('Cuenta creada. Revisa tu correo para obtener el token de activación.') }
    catch (reason) { setError((reason as Error).message) }
    finally { setLoading(false) }
  }
  return <AuthScreenShell>
    <Text style={styles.kicker}>EMPIEZA EN EVENTFLOW</Text><Text style={styles.title}>Crea tu cuenta</Text>
    <TextInput style={styles.input} placeholder="Nombre completo" value={name} onChangeText={setName} autoComplete="name" />
    <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
    <TextInput style={styles.input} placeholder="Teléfono con código de país" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
    <TextInput style={styles.input} placeholder="Contraseña segura" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
    <Text style={styles.muted}>Usa al menos 8 caracteres, mayúscula, minúscula, número y símbolo.</Text>
    {!!error && <Text style={styles.error}>{error}</Text>}{!!message && <Text style={styles.notice}>{message}</Text>}
    <Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={submit}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Registrarme</Text>}</Pressable>
    {!!message && <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Verificar cuenta')}><Text style={styles.secondaryButtonText}>Ingresar token de activación</Text></Pressable>}
  </AuthScreenShell>
}
