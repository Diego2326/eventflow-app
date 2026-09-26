import { ActivityIndicator, View } from 'react-native'
import { useEffect, useState } from 'react'
import { AppNavigator } from './src/navigation/AppNavigator'
import { getGuestTokens } from './src/services/guest'
import { styles } from './src/theme/styles'
export default function App() {
  const [ready, setReady] = useState(false)
  const [hasInvitations, setHasInvitations] = useState(false)

  useEffect(() => {
    getGuestTokens()
      .then(tokens => setHasInvitations(tokens.length > 0))
      .catch(() => setHasInvitations(false))
      .finally(() => setReady(true))
  }, [])

  if (!ready) return <View style={styles.loading}><ActivityIndicator color="#f56642" /></View>
  return <AppNavigator hasInvitations={hasInvitations} />
}
