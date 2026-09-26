import { ActivityIndicator, Text, View } from 'react-native'
import { colors, styles } from '../../theme/styles'

export const formatDate = (value: string) => new Intl.DateTimeFormat('es-GT', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(value))

export const formatTime = (value: string) => new Intl.DateTimeFormat('es-GT', {
  hour: 'numeric', minute: '2-digit',
}).format(new Date(value))

export function LoadingView() {
  return <View style={styles.loading}><ActivityIndicator color={colors.coral} /></View>
}

export function ErrorView({ message }: { message: string }) {
  return <View style={styles.screen}><Text style={styles.error}>{message}</Text></View>
}
