import {
  ActivityIndicator,
  View,
} from 'react-native'
import {
  useEffect,
  useState,
} from 'react'
import * as Notifications from 'expo-notifications'

import { AppNavigator } from './src/navigation/AppNavigator'
import { restore } from './src/services/api'
import { styles } from './src/theme/styles'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function App() {
  const [ready, setReady] =
    useState(false)

  const [signedIn, setSignedIn] =
    useState(false)

  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      try {
        const value =
          await restore()

        if (mounted) {
          setSignedIn(value)
        }
      } catch {
        if (mounted) {
          setSignedIn(false)
        }
      } finally {
        if (mounted) {
          setReady(true)
        }
      }
    }

    restoreSession()

    return () => {
      mounted = false
    }
  }, [])

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#6848E7"
        />
      </View>
    )
  }

  return (
    <AppNavigator
      signedIn={signedIn}
    />
  )
}
