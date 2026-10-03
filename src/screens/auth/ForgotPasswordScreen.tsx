import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { request } from '../../services/api'

const NAVY = '#0B1D3A'

const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const BACKGROUND = '#FFFFFF'
const INPUT_BACKGROUND = '#FBFCFE'
const BORDER = '#DDE2EA'
const MUTED = '#737D91'
const ERROR = '#B74C43'
const SUCCESS = '#287846'

export function ForgotPasswordScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const [identifier, setIdentifier] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  async function submit() {
    if (loading) return

    const value = identifier.trim()

    setError('')
    setMessage('')

    if (!value) {
      setError(
        'Ingresa tu correo electrónico para continuar.',
      )
      return
    }

    /*
     * El endpoint actual de EventFlow recibe email.
     * Dejamos el diseño preparado para correo/teléfono,
     * pero evitamos enviar un teléfono como si fuera email.
     */
    if (!value.includes('@')) {
      setError(
        'Por ahora la recuperación está disponible mediante correo electrónico.',
      )
      return
    }

    setLoading(true)

    try {
      await request(
        '/auth/forgot-password',
        'POST',
        {
          email: value,
        },
      )

      setMessage(
        'Si existe una cuenta asociada, recibirás instrucciones para recuperar tu acceso.',
      )
    } catch (error) {
      setError(
        (error as Error).message,
      )
    } finally {
      setLoading(false)
    }
  }

  async function resend() {
    if (!identifier.trim()) {
      setError(
        'Ingresa tu correo electrónico primero.',
      )
      return
    }

    await submit()
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                Math.max(
                  insets.bottom + 30,
                  42,
                ),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }
              hitSlop={10}
            >
              <Feather
                name="arrow-left"
                size={28}
                color={NAVY}
              />
            </Pressable>

            <Text style={styles.brand}>
              Event
              <Text style={styles.brandAccent}>
                Flow
              </Text>
            </Text>
          </View>

          {/* TITULO */}
          <View style={styles.intro}>
            <Text style={styles.title}>
              ¿Olvidaste tu{'\n'}
              contraseña?
            </Text>

            <Text style={styles.subtitle}>
              Ingresa tu correo o teléfono y te enviaremos
              un código para recuperar tu cuenta.
            </Text>
          </View>

          {/* ICONO */}
          <View style={styles.illustrationArea}>
            <View style={styles.lockCircle}>
              <Feather
                name="lock"
                size={48}
                color={PURPLE_DARK}
              />

              <View style={styles.sparkOne} />

              <View style={styles.sparkTwo} />

              <View style={styles.sparkThree} />
            </View>
          </View>

          {/* CAMPO */}
          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={24}
              color={NAVY}
            />

            <TextInput
              style={styles.input}
              placeholder="Correo electrónico o teléfono"
              placeholderTextColor={MUTED}
              value={identifier}
              onChangeText={value => {
                setIdentifier(value)
                setError('')
                setMessage('')
              }}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={submit}
            />
          </View>

          {/* ERROR */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather
                name="alert-circle"
                size={18}
                color={ERROR}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* SUCCESS */}
          {message ? (
            <View style={styles.successBox}>
              <Feather
                name="check-circle"
                size={18}
                color={SUCCESS}
              />

              <Text style={styles.successText}>
                {message}
              </Text>
            </View>
          ) : null}

          {/* BOTON ENVIAR */}
          <Pressable
            onPress={submit}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButtonWrapper,
              pressed &&
                !loading &&
                styles.pressed,
              loading &&
                styles.disabled,
            ]}
          >
            <LinearGradient
              colors={[
                PURPLE,
                PURPLE_DARK,
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={styles.primaryButton}
            >
              {loading ? (
                <ActivityIndicator
                  color={WHITE}
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Enviar código
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={24}
                    color={WHITE}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* NO RECIBÍ CÓDIGO */}
          <Pressable
            style={styles.resendButton}
            onPress={resend}
            disabled={loading}
          >
            <Text style={styles.resendText}>
              No recibí el código
            </Text>
          </Pressable>

          {/* DIVISOR */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />

            <Text style={styles.dividerText}>
              o
            </Text>

            <View style={styles.dividerLine} />
          </View>

          {/* VOLVER LOGIN */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed &&
                styles.loginButtonPressed,
            ]}
            onPress={() =>
              navigation.replace('Login')
            }
            disabled={loading}
          >
            <Feather
              name="user"
              size={25}
              color={NAVY}
            />

            <Text style={styles.loginButtonText}>
              Volver a iniciar sesión
            </Text>
          </Pressable>

          {/* FOOTER */}
          <Text style={styles.footer}>
            Recuerda revisar tu carpeta de spam{'\n'}
            si usas correo electrónico.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 28,
  },

  /* HEADER */

  header: {
    height: 68,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 22,
  },

  backButton: {
    width: 38,
    height: 42,

    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  brand: {
    color: NAVY,

    fontSize: 25,

    fontWeight: '800',

    letterSpacing: -0.9,
  },

  brandAccent: {
    color: PURPLE,
  },

  /* INTRO */

  intro: {
    marginTop: 28,
  },

  title: {
    color: NAVY,

    fontSize: 40,
    lineHeight: 44,

    fontWeight: '800',

    letterSpacing: -1.3,
  },

  subtitle: {
    color: MUTED,

    fontSize: 17,
    lineHeight: 25,

    marginTop: 14,

    maxWidth: 380,
  },

  /* ICONO CENTRAL */

  illustrationArea: {
    alignItems: 'center',

    marginTop: 25,
    marginBottom: 22,
  },

  lockCircle: {
    width: 118,
    height: 118,

    borderRadius: 59,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: PURPLE_SOFT,
  },

  sparkOne: {
    position: 'absolute',

    width: 5,
    height: 20,

    borderRadius: 99,

    right: 27,
    top: 26,

    backgroundColor: PURPLE_DARK,

    transform: [
      {
        rotate: '20deg',
      },
    ],
  },

  sparkTwo: {
    position: 'absolute',

    width: 18,
    height: 5,

    borderRadius: 99,

    right: 13,
    top: 43,

    backgroundColor: PURPLE_DARK,

    transform: [
      {
        rotate: '-10deg',
      },
    ],
  },

  sparkThree: {
    position: 'absolute',

    width: 13,
    height: 5,

    borderRadius: 99,

    right: 20,
    top: 58,

    backgroundColor: PURPLE_DARK,

    transform: [
      {
        rotate: '15deg',
      },
    ],
  },

  /* INPUT */

  inputContainer: {
    height: 60,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 15,

    paddingHorizontal: 17,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 13,

    backgroundColor: INPUT_BACKGROUND,
  },

  input: {
    flex: 1,

    height: '100%',

    paddingVertical: 0,

    color: NAVY,

    fontSize: 15,
  },

  /* ERROR / SUCCESS */

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,

    marginTop: 12,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 11,

    backgroundColor: '#FFF0EE',
  },

  errorText: {
    flex: 1,

    color: ERROR,

    fontSize: 11.5,
    lineHeight: 16,
  },

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,

    marginTop: 12,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 11,

    backgroundColor: '#EAF7EF',
  },

  successText: {
    flex: 1,

    color: SUCCESS,

    fontSize: 11.5,
    lineHeight: 16,
  },

  /* PRINCIPAL */

  primaryButtonWrapper: {
    marginTop: 18,

    borderRadius: 14,

    shadowColor: PURPLE,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.16,
    shadowRadius: 14,

    elevation: 4,
  },

  primaryButton: {
    height: 60,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 17,
  },

  primaryButtonText: {
    color: WHITE,

    fontSize: 17,

    fontWeight: '700',
  },

  pressed: {
    opacity: 0.9,

    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  disabled: {
    opacity: 0.65,
  },

  /* RESEND */

  resendButton: {
    alignSelf: 'center',

    paddingHorizontal: 12,
    paddingVertical: 14,

    marginTop: 4,
  },

  resendText: {
    color: PURPLE,

    fontSize: 14,

    fontWeight: '700',
  },

  /* DIVIDER */

  divider: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 14,

    marginTop: 10,
    marginBottom: 19,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor: BORDER,
  },

  dividerText: {
    color: MUTED,

    fontSize: 12,
  },

  /* LOGIN BUTTON */

  loginButton: {
    height: 60,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 16,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 14,

    backgroundColor: WHITE,
  },

  loginButtonPressed: {
    backgroundColor: '#F8F9FB',
  },

  loginButtonText: {
    color: NAVY,

    fontSize: 15,

    fontWeight: '700',
  },

  /* FOOTER */

  footer: {
    color: MUTED,

    fontSize: 12.5,
    lineHeight: 20,

    textAlign: 'center',

    marginTop: 24,
  },
})