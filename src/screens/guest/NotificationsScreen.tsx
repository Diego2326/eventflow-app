import { ScrollView, Text, View } from 'react-native'
import { useGuestExperience } from '../../hooks/useGuestExperience'
import { styles } from '../../theme/styles'
import { ErrorView, formatDate, formatTime, LoadingView } from './shared'

export function NotificationsScreen() {
  const { experience, loading, error } = useGuestExperience()
  if (loading) return <LoadingView />
  if (!experience) return <ErrorView message={error} />
  return <ScrollView contentContainerStyle={styles.scrollScreen}>
    <Text style={styles.kicker}>ACTUALIZACIONES</Text><Text style={styles.heading}>Avisos</Text>
    <View style={styles.noticeList}>{experience.notifications.map(note => <View key={note.id} style={styles.card}><Text style={styles.noticeDate}>{formatDate(note.createdAt)} · {formatTime(note.createdAt)}</Text><Text style={styles.cardTitle}>{note.title}</Text><Text style={styles.muted}>{note.body}</Text></View>)}</View>
    {!experience.notifications.length ? <Text style={styles.muted}>No hay avisos por el momento.</Text> : null}
  </ScrollView>
}
