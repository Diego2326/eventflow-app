import { ActivityIndicator, View } from 'react-native'
import { useEffect, useState } from 'react'
import { AppNavigator } from './src/navigation/AppNavigator'
import { getGuestToken } from './src/services/guest'
import { styles } from './src/theme/styles'
export default function App() {
  const [ready, setReady] = useState(false)
  const [hasInvitation, setHasInvitation] = useState(false)

  useEffect(() => {
    getGuestToken()
      .then(token => setHasInvitation(Boolean(token)))
      .catch(() => setHasInvitation(false))
      .finally(() => setReady(true))
  }, [])

  if (!ready) return <View style={styles.loading}><ActivityIndicator color="#f56642" /></View>
  return <AppNavigator hasInvitation={hasInvitation} />
}
