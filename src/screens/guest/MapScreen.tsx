import { ScrollView, Text, View } from 'react-native'
import { useGuestExperience } from '../../hooks/useGuestExperience'
import { styles } from '../../theme/styles'
import { ErrorView, LoadingView } from './shared'

export function MapScreen() {
  const { experience, loading, error } = useGuestExperience()
  if (loading) return <LoadingView />
  if (!experience) return <ErrorView message={error} />
  const { invitation } = experience
  return <ScrollView contentContainerStyle={styles.scrollScreen}>
    <Text style={styles.kicker}>UBICACIONES</Text><Text style={styles.heading}>Mapa del evento</Text>
    {(invitation.sector || invitation.table || invitation.seat) ? <View style={styles.assignmentCard}><Text style={styles.heroKicker}>TU UBICACIÓN</Text><Text style={styles.assignmentTitle}>{[invitation.sector, invitation.table].filter(Boolean).join(' · ')}</Text>{invitation.seat ? <Text style={styles.heroLocation}>Asiento {invitation.seat}</Text> : null}</View> : null}
    <Text style={styles.section}>Espacios</Text>
    <View style={styles.noticeList}>{experience.mapPoints.map(point => <View key={point.id} style={styles.mapPoint}><View style={styles.mapPin}><Text style={styles.mapPinText}>⌖</Text></View><View style={styles.moduleBody}><Text style={styles.moduleTitle}>{point.title ?? 'Punto de interés'}</Text>{typeof point.payload.description === 'string' ? <Text style={styles.muted}>{point.payload.description}</Text> : null}</View></View>)}</View>
    {!experience.mapPoints.length ? <Text style={styles.muted}>El anfitrión aún no ha publicado ubicaciones.</Text> : null}
  </ScrollView>
}
