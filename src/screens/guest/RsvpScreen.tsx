import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import { useGuestExperience } from '../../hooks/useGuestExperience'
import { submitRsvp } from '../../services/guest'
import { colors, styles } from '../../theme/styles'
import { ErrorView, LoadingView } from './shared'

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmar asistencia'>

export function RsvpScreen({ navigation }: Props) {
  const { token, experience, loading, error } = useGuestExperience()
  const [accepted, setAccepted] = useState(true)
  const [companions, setCompanions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  useEffect(() => {
    if (!experience) return
    setAccepted(experience.invitation.status !== 'DECLINED')
    setCompanions(experience.invitation.companions)
  }, [experience])
  if (loading) return <LoadingView />
  if (!experience || !token) return <ErrorView message={error} />
  const maxCompanions = Math.max(0, experience.invitation.allowedCapacity - 1)

  const save = async () => {
    setSaving(true); setSubmitError('')
    try {
      await submitRsvp(token, accepted, accepted ? companions.map(name => name.trim()).filter(Boolean) : [])
      navigation.replace('Inicio')
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'No pudimos guardar tu respuesta.')
    } finally { setSaving(false) }
  }

  return <ScrollView contentContainerStyle={styles.scrollScreen}>
    <Text style={styles.kicker}>RSVP</Text><Text style={styles.heading}>¿Nos acompañas?</Text>
    <Text style={styles.muted}>Confirma tu asistencia para que el anfitrión pueda preparar todo para ti.</Text>
    <View style={styles.rsvpRow}>
      <Pressable style={[styles.rsvpChoice, accepted && styles.rsvpChoiceSelected]} onPress={() => setAccepted(true)}><Text style={styles.rsvpChoiceTitle}>Sí, asistiré</Text></Pressable>
      <Pressable style={[styles.rsvpChoice, !accepted && styles.rsvpChoiceSelected]} onPress={() => setAccepted(false)}><Text style={styles.rsvpChoiceTitle}>No podré ir</Text></Pressable>
    </View>
    {accepted && maxCompanions > 0 ? <>
      <Text style={styles.section}>Acompañantes</Text>
      <Text style={styles.muted}>Tu invitación permite {maxCompanions} acompañante{maxCompanions === 1 ? '' : 's'}.</Text>
      {Array.from({ length: maxCompanions }).map((_, index) => <TextInput key={index} style={styles.input} placeholder={`Nombre del acompañante ${index + 1}`} value={companions[index] ?? ''} onChangeText={value => setCompanions(current => { const next = [...current]; next[index] = value; return next })} />)}
    </> : null}
    {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
    <Pressable style={[styles.button, saving && styles.buttonDisabled]} disabled={saving} onPress={() => void save()}>{saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Guardar respuesta</Text>}</Pressable>
  </ScrollView>
}
