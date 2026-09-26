import { ScrollView, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useGuestExperience } from '../../hooks/useGuestExperience'
import { colors, styles } from '../../theme/styles'
import { ErrorView, formatDate, LoadingView } from './shared'

export function EventPassScreen() {
  const { token, experience, loading, error } = useGuestExperience()
  if (loading) return <LoadingView />
  if (!experience || !token) return <ErrorView message={error} />
  const { invitation, event } = experience
  return <ScrollView contentContainerStyle={styles.passScreen}>
    <Text style={styles.kicker}>EVENT PASS</Text><Text style={styles.heading}>Tu acceso</Text>
    <View style={styles.passCard}>
      <Text style={styles.passEvent}>{event.name}</Text><Text style={styles.muted}>{formatDate(event.startsAt)}</Text>
      <View style={styles.qrWrap}><QRCode value={`eventflow://invite/${token}`} size={210} color={colors.navy} backgroundColor={colors.white} /></View>
      <Text style={styles.passName}>{invitation.guestName}</Text>
      <Text style={styles.statusPill}>{invitation.status === 'ACCEPTED' ? 'CONFIRMADA' : invitation.status === 'DECLINED' ? 'DECLINADA' : 'PENDIENTE'}</Text>
      <View style={styles.passDetails}>
        <View><Text style={styles.detailLabel}>CUPO</Text><Text style={styles.detailValue}>{invitation.allowedCapacity}</Text></View>
        <View><Text style={styles.detailLabel}>INGRESOS</Text><Text style={styles.detailValue}>{invitation.checkedIn}</Text></View>
        {invitation.table ? <View><Text style={styles.detailLabel}>MESA</Text><Text style={styles.detailValue}>{invitation.table}</Text></View> : null}
      </View>
      {invitation.sector || invitation.seat ? <Text style={styles.passAssignment}>{[invitation.sector, invitation.seat && `Asiento ${invitation.seat}`].filter(Boolean).join(' · ')}</Text> : null}
    </View>
    <Text style={styles.passHint}>Presenta este código al personal al llegar. El pase es personal y está asociado a tu invitación.</Text>
  </ScrollView>
}
