import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native'
import { styles } from '../theme/styles'

export function AuthScreenShell({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.authScreen}>
      <KeyboardAvoidingView style={styles.authScreen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.authScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authContent}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
