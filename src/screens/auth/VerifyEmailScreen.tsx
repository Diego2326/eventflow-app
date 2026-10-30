import {
  useEffect,
  useState,
} from 'react'

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
  resendVerification,
  verifyEmail,
} from '../../services/api'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#E2E5EC'
const MUTED = '#737D91'
const SUCCESS = '#249B68'
const DANGER = '#B74C43'

type RouteParams = {
  token?: string
  email?: string
}

function isValidEmail(
  value: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  )
}

export function VerifyEmailScreen({
  navigation,
  route,
}: any) {
  const insets =
    useSafeAreaInsets()

  const params =
    route?.params as
      | RouteParams
      | undefined

  const token =
    params?.token?.trim() ?? ''

  const [
    email,
    setEmail,
  ] = useState(
    params?.email?.trim() ?? '',
  )

  const [
    verifying,
    setVerifying,
  ] = useState(
    Boolean(token),
  )

  const [
    resending,
    setResending,
  ] = useState(false)

  const [
    verified,
    setVerified,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    message,
    setMessage,
  ] = useState('')

  useEffect(() => {
    let mounted = true

    async function validateToken() {
      if (!token) {
        setVerifying(false)
        setError(
          'El enlace de verificación no contiene un token válido.',
        )
        return
      }

      setVerifying(true)
      setError('')
      setMessage('')

      try {
        await verifyEmail(token)

        if (!mounted) return

        setVerified(true)
        setMessage(
          'Tu correo fue verificado correctamente. Ya puedes iniciar sesión.',
        )
      } catch (error) {
        if (!mounted) return

        setVerified(false)
        setError(
          (error as Error).message ||
            'El enlace de verificación no es válido o ya expiró.',
        )
      } finally {
        if (mounted) {
          setVerifying(false)
        }
      }
    }

    void validateToken()

    return () => {
      mounted = false
    }
  }, [token])

  async function resend() {
    if (resending) return

    const cleanEmail =
      email.trim().toLowerCase()

    setError('')
    setMessage('')

    if (
      !isValidEmail(
        cleanEmail,
      )
    ) {
      setError(
        'Ingresa un correo electrónico válido.',
      )
      return
    }

    setResending(true)

    try {
      await resendVerification(
        cleanEmail,
      )

      setMessage(
        'Si la cuenta está pendiente de verificación, se enviará un nuevo enlace al correo indicado.',
      )
    } catch (error) {
      setError(
        (error as Error).message,
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar style="dark" />

      <View
        style={[
          styles.container,
          {
            paddingBottom:
              Math.max(
                insets.bottom,
                22,
              ),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.replace(
                'Login',
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio de sesión"
          >
            <Feather
              name="arrow-left"
              size={26}
              color={NAVY}
            />
          </Pressable>

          <Text style={styles.brand}>
            Event
            <Text
              style={
                styles.brandAccent
              }
            >
              Flow
            </Text>
          </Text>
        </View>

        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              verified &&
                styles.iconCircleSuccess,
            ]}
          >
            {verifying ? (
              <ActivityIndicator
                size="large"
                color={PURPLE}
              />
            ) : (
              <Feather
                name={
                  verified
                    ? 'check-circle'
                    : 'mail'
                }
                size={42}
                color={
                  verified
                    ? SUCCESS
                    : PURPLE
                }
              />
            )}
          </View>

          <Text style={styles.title}>
            {verifying
              ? 'Verificando correo'
              : verified
                ? 'Correo verificado'
                : 'Verifica tu correo'}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {verifying
              ? 'Estamos validando tu enlace de activación.'
              : verified
                ? 'Tu cuenta ya está activa.'
                : 'Si el enlace expiró o no es válido, puedes solicitar uno nuevo.'}
          </Text>

          {message ? (
            <View
              style={
                styles.successBox
              }
            >
              <Feather
                name="check-circle"
                size={18}
                color={SUCCESS}
              />

              <Text
                style={
                  styles.successText
                }
              >
                {message}
              </Text>
            </View>
          ) : null}

          {error ? (
            <View
              style={
                styles.errorBox
              }
              accessibilityRole="alert"
            >
              <Feather
                name="alert-circle"
                size={18}
                color={DANGER}
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          {!verifying &&
          !verified ? (
            <>
              <Text
                style={
                  styles.label
                }
              >
                Correo electrónico
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Feather
                  name="mail"
                  size={20}
                  color={MUTED}
                />

                <TextInput
                  style={
                    styles.input
                  }
                  value={email}
                  onChangeText={value => {
                    setEmail(value)
                    setError('')
                    setMessage('')
                  }}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={
                    MUTED
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={
                    !resending
                  }
                  accessibilityLabel="Correo electrónico"
                />
              </View>

              <Pressable
                onPress={resend}
                disabled={
                  resending
                }
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed &&
                    !resending &&
                    styles.pressed,
                  resending &&
                    styles.disabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Reenviar enlace de verificación"
              >
                {resending ? (
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
                      Reenviar enlace
                    </Text>

                    <Feather
                      name="send"
                      size={18}
                      color={WHITE}
                    />
                  </>
                )}
              </Pressable>
            </>
          ) : null}

          {!verifying &&
          verified ? (
            <Pressable
              onPress={() =>
                navigation.replace(
                  'Login',
                )
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
                  styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ir al inicio de sesión"
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Ir al inicio de sesión
              </Text>

              <Feather
                name="arrow-right"
                size={19}
                color={WHITE}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        BACKGROUND,
    },

    container: {
      flex: 1,
      paddingHorizontal: 24,
    },

    header: {
      minHeight: 68,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
    },

    backButton: {
      width: 40,
      height: 40,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },

    brand: {
      color: NAVY,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.9,
    },

    brandAccent: {
      color: PURPLE,
    },

    content: {
      flex: 1,
      justifyContent: 'center',
      paddingBottom: 68,
    },

    iconCircle: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor:
        '#F0EDFF',
      marginBottom: 22,
    },

    iconCircleSuccess: {
      backgroundColor:
        '#EAF8F1',
    },

    title: {
      color: NAVY,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -0.8,
    },

    subtitle: {
      color: MUTED,
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 24,
    },

    label: {
      color: NAVY,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 8,
    },

    inputContainer: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 15,
      backgroundColor: WHITE,
    },

    input: {
      flex: 1,
      color: NAVY,
      fontSize: 14,
    },

    primaryButton: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      borderRadius: 15,
      backgroundColor:
        PURPLE_DARK,
      marginTop: 18,
    },

    primaryButtonText: {
      color: WHITE,
      fontSize: 14,
      fontWeight: '800',
    },

    pressed: {
      opacity: 0.82,
    },

    disabled: {
      opacity: 0.58,
    },

    successBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 9,
      padding: 13,
      borderRadius: 13,
      backgroundColor:
        '#EAF8F1',
      marginBottom: 16,
    },

    successText: {
      flex: 1,
      color: SUCCESS,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600',
    },

    errorBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 9,
      padding: 13,
      borderRadius: 13,
      backgroundColor:
        '#FFF0F1',
      marginBottom: 16,
    },

    errorText: {
      flex: 1,
      color: DANGER,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600',
    },
  })
