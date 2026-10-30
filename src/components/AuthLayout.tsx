import type { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Brand } from './Brand'
import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme/tokens'

type AuthLayoutProps = {
  children: ReactNode
  eyebrow?: string
  title: string
  description?: string
}

export function AuthLayout({
  children,
  eyebrow = 'EVENTFLOW',
  title,
  description,
}: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroInner}>
              <Brand variant="light" />

              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>
                  {eyebrow}
                </Text>

                <Text style={styles.title}>
                  {title}
                </Text>

                {description ? (
                  <Text style={styles.description}>
                    {description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.capabilities}>
                <View style={styles.capability}>
                  <View style={styles.dot} />
                  <Text style={styles.capabilityText}>
                    Agenda
                  </Text>
                </View>

                <View style={styles.capability}>
                  <View style={styles.dot} />
                  <Text style={styles.capabilityText}>
                    Accesos
                  </Text>
                </View>

                <View style={styles.capability}>
                  <View style={styles.dot} />
                  <Text style={styles.capabilityText}>
                    Experiencias
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sheet}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.navy950,
  },

  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },

  hero: {
    backgroundColor: colors.navy950,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 44,
  },

  heroInner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  heroCopy: {
    marginTop: 30,
  },

  eyebrow: {
    ...typography.eyebrow,
    color: colors.coral500,
    marginBottom: 10,
  },

  title: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -1,
    maxWidth: 330,
  },

  description: {
    color: '#AEB9C8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
    maxWidth: 340,
  },

  capabilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 22,
  },

  capability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.coral500,
  },

  capabilityText: {
    color: '#D8DEE7',
    fontSize: 11,
    fontWeight: '600',
  },

  sheet: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',

    marginTop: -20,

    backgroundColor: colors.background,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
})