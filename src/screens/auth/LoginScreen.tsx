import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { AuthScreenShell } from '../../components/AuthScreenShell'
import { Brand } from '../../components/Brand'
import { DEMO_MODE, login } from '../../services/api'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../services/demo'
import { colors, styles } from '../../theme/styles'

export function LoginScreen({ navigation }: { navigation: any }) {
  const [identifier, setIdentifier] = useState(DEMO_MODE ? DEMO_EMAIL : '')
  const [password, setPassword] = useState(DEMO_MODE ? DEMO_PASSWORD : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!identifier.trim() || !password) return setError('Completa tu correo o teléfono y contraseña.')
    setError(''); setLoading(true)
    try { await login(identifier, password); navigation.replace('Eventos') }
    catch (reason) { setError((reason as Error).message) }
    finally { setLoading(false) }
  }

  return <AuthScreenShell>
    <Brand />
    <Text style={styles.kicker}>TU EVENTO, BAJO CONTROL</Text>
    <Text style={styles.title}>Entra al ritmo de la operación.</Text>
    <Text style={styles.muted}>Agenda, accesos y novedades en un mismo lugar.</Text>
    <TextInput style={styles.input} placeholder="Correo o teléfono" placeholderTextColor="#89909b" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" autoComplete="email" />
    <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#89909b" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" onSubmitEditing={submit} />
    {DEMO_MODE && <Text style={styles.demoNote}>Modo demo · datos locales</Text>}
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={submit}>
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Entrar a EventFlow →</Text>}
    </Pressable>
    <View style={styles.loginLinks}>
      <Pressable onPress={() => navigation.navigate('Registro')}><Text style={styles.centerLink}>Crear cuenta</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Recuperación')}><Text style={styles.centerLink}>Recuperar acceso</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Verificar cuenta')}><Text style={styles.centerLink}>Verificar cuenta</Text></Pressable>
    </View>
  </AuthScreenShell>
}
