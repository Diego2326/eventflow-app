import { ScrollView, Text, View } from 'react-native'
import { useGuestExperience } from '../../hooks/useGuestExperience'
import { styles } from '../../theme/styles'
import { ErrorView, formatTime, LoadingView } from './shared'

export function AgendaScreen() {
  const { experience, loading, error } = useGuestExperience()
  if (loading) return <LoadingView />
  if (!experience) return <ErrorView message={error} />
  return <ScrollView contentContainerStyle={styles.scrollScreen}>
    <Text style={styles.kicker}>PROGRAMA</Text><Text style={styles.heading}>Agenda del evento</Text>
    <Text style={styles.muted}>Horarios y ubicaciones actualizados por el anfitrión.</Text>
    <View style={styles.timeline}>
      {experience.agenda.map(item => {
        const active = item.id === experience.now?.id
        return <View key={item.id} style={[styles.timelineItem, active && styles.timelineItemActive]}>
          <Text style={styles.timelineTime}>{formatTime(item.startsAt)}</Text>
          <View style={styles.timelineBody}>{active ? <Text style={styles.pill}>AHORA</Text> : null}<Text style={styles.moduleTitle}>{item.title}</Text>{item.description ? <Text style={styles.muted}>{item.description}</Text> : null}{item.zone ? <Text style={styles.timelineZone}>⌖ {item.zone}</Text> : null}</View>
        </View>
      })}
      {!experience.agenda.length ? <Text style={styles.muted}>La agenda se publicará próximamente.</Text> : null}
    </View>
  </ScrollView>
}
