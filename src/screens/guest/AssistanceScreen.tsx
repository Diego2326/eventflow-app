import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useGuestExperience } from '../../hooks/useGuestExperience'
import { requestAssistance } from '../../services/guest'
import { colors, styles } from '../../theme/styles'
import { ErrorView, LoadingView } from './shared'

const categories = [['GENERAL', 'Ayuda general'], ['UBICACION', 'No encuentro un lugar'], ['ACCESIBILIDAD', 'Accesibilidad'], ['PRIMEROS_AUXILIOS', 'Primeros auxilios']] as const

export function AssistanceScreen() {
  const { token, experience, loading, error } = useGuestExperience()
  const [category, setCategory] = useState('GENERAL')
  const [details, setDetails] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState('')
  if (loading) return <LoadingView />
  if (!experience || !token) return <ErrorView message={error} />

  const send = async () => {
    setSaving(true); setSubmitError('')
    try { await requestAssistance(token, category, details.trim(), location.trim()); setSent(true) }
    catch (reason) { setSubmitError(reason instanceof Error ? reason.message : 'No pudimos enviar tu solicitud.') }
    finally { setSaving(false) }
  }
  if (sent) return <View style={styles.successScreen}><Text style={styles.successMark}>✓</Text><Text style={styles.heading}>Ya avisamos al equipo</Text><Text style={styles.muted}>Tu solicitud fue recibida. Mantente en la ubicación indicada para que puedan encontrarte.</Text></View>

  return <ScrollView contentContainerStyle={styles.scrollScreen}>
    <Text style={styles.kicker}>ESTAMOS PARA AYUDARTE</Text><Text style={styles.heading}>Solicitar asistencia</Text>
    <Text style={styles.section}>¿Qué necesitas?</Text>
    <View style={styles.categoryList}>{categories.map(([value, label]) => <Pressable key={value} onPress={() => setCategory(value)} style={[styles.choice, category === value && styles.choiceSelected]}><Text style={styles.choiceText}>{label}</Text></Pressable>)}</View>
    <TextInput style={[styles.input, styles.textArea]} value={details} onChangeText={setDetails} multiline placeholder="Cuéntanos un poco más" />
    <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="¿Dónde te encuentras?" />
    {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
    <Pressable style={[styles.button, saving && styles.buttonDisabled]} disabled={saving} onPress={() => void send()}>{saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Enviar solicitud</Text>}</Pressable>
  </ScrollView>
}
