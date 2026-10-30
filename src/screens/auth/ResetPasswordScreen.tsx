import {
  useState,
} from 'react'

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
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
  resetPassword,
} from '../../services/api'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#E2E5EC'
const MUTED = '#737D91'

const SUCCESS = '#249B68'
const DANGER = '#B74C43'

type RouteParams = {
  token?: string
}

function validatePassword(
  value: string,
) {
  if (value.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!/\d/.test(value)) {
    return 'La contraseña debe incluir al menos un número.'
  }

  return ''
}

export function ResetPasswordScreen({
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
    newPassword,
    setNewPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [
    closeAllSessions,
    setCloseAllSessions,
  ] = useState(true)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    completed,
    setCompleted,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    message,
    setMessage,
  ] = useState('')

  async function submit() {
    if (loading) return

    setError('')
    setMessage('')

    if (!token) {
      setError(
        'El enlace de recuperación no contiene un token válido.',
      )
      return
    }

    const passwordValidation =
      validatePassword(
        newPassword,
      )

    if (passwordValidation) {
      setError(
        passwordValidation,
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        'La nueva contraseña y su confirmación deben coincidir.',
      )
      return
    }

    setLoading(true)

    try {
      await resetPassword({
        token,
        newPassword,
        closeAllSessions,
      })

      setCompleted(true)
      setMessage(
        closeAllSessions
          ? 'Tu contraseña fue actualizada y se cerraron las sesiones anteriores.'
          : 'Tu contraseña fue actualizada correctamente.',
      )

      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError(
        (error as Error).message ||
          'El enlace no es válido, ya fue utilizado o expiró.',
      )
    } finally {
      setLoading(false)
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
              completed &&
                styles.iconCircleSuccess,
            ]}
          >
            <Feather
              name={
                completed
                  ? 'check-circle'
                  : 'key'
              }
              size={40}
              color={
                completed
                  ? SUCCESS
                  : PURPLE
              }
            />
          </View>

          <Text style={styles.title}>
            {completed
              ? 'Contraseña actualizada'
              : 'Nueva contraseña'}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {completed
              ? 'Ya puedes volver a iniciar sesión con tu nueva contraseña.'
              : 'Crea una contraseña nueva para recuperar el acceso a tu cuenta.'}
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

          {!completed ? (
            <>
              <Text
                style={
                  styles.label
                }
              >
                Nueva contraseña
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Feather
                  name="lock"
                  size={20}
                  color={MUTED}
                />

                <TextInput
                  style={
                    styles.input
                  }
                  value={
                    newPassword
                  }
                  onChangeText={value => {
                    setNewPassword(
                      value,
                    )
                    setError('')
                    setMessage('')
                  }}
                  placeholder="Nueva contraseña"
                  placeholderTextColor={
                    MUTED
                  }
                  secureTextEntry={
                    !showNewPassword
                  }
                  editable={!loading}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  accessibilityLabel="Nueva contraseña"
                />

                <Pressable
                  onPress={() =>
                    setShowNewPassword(
                      current =>
                        !current,
                    )
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showNewPassword
                      ? 'Ocultar nueva contraseña'
                      : 'Mostrar nueva contraseña'
                  }
                >
                  <Feather
                    name={
                      showNewPassword
                        ? 'eye-off'
                        : 'eye'
                    }
                    size={19}
                    color={MUTED}
                  />
                </Pressable>
              </View>

              <Text
                style={
                  styles.passwordHint
                }
              >
                Mínimo 8 caracteres e incluye al menos un número.
              </Text>

              <Text
                style={[
                  styles.label,
                  styles.confirmLabel,
                ]}
              >
                Confirmar contraseña
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Feather
                  name="check-circle"
                  size={20}
                  color={MUTED}
                />

                <TextInput
                  style={
                    styles.input
                  }
                  value={
                    confirmPassword
                  }
                  onChangeText={value => {
                    setConfirmPassword(
                      value,
                    )
                    setError('')
                    setMessage('')
                  }}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor={
                    MUTED
                  }
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  editable={!loading}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  accessibilityLabel="Confirmar nueva contraseña"
                />

                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(
                      current =>
                        !current,
                    )
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? 'Ocultar confirmación'
                      : 'Mostrar confirmación'
                  }
                >
                  <Feather
                    name={
                      showConfirmPassword
                        ? 'eye-off'
                        : 'eye'
                    }
                    size={19}
                    color={MUTED}
                  />
                </Pressable>
              </View>

              <View
                style={
                  styles.sessionRow
                }
              >
                <View
                  style={
                    styles.sessionCopy
                  }
                >
                  <Text
                    style={
                      styles.sessionTitle
                    }
                  >
                    Cerrar todas las sesiones
                  </Text>

                  <Text
                    style={
                      styles.sessionDescription
                    }
                  >
                    Recomendado si crees que otra persona pudo acceder a tu cuenta.
                  </Text>
                </View>

                <Switch
                  value={
                    closeAllSessions
                  }
                  onValueChange={
                    setCloseAllSessions
                  }
                  disabled={loading}
                  trackColor={{
                    false:
                      '#D7DAE2',
                    true:
                      '#B9A9FF',
                  }}
                  thumbColor={
                    closeAllSessions
                      ? PURPLE
                      : WHITE
                  }
                />
              </View>

              <Pressable
                onPress={submit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed &&
                    !loading &&
                    styles.pressed,
                  loading &&
                    styles.disabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Guardar nueva contraseña"
                accessibilityState={{
                  disabled: loading,
                  busy: loading,
                }}
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
                      Guardar contraseña
                    </Text>

                    <Feather
                      name="arrow-right"
                      size={19}
                      color={WHITE}
                    />
                  </>
                )}
              </Pressable>
            </>
          ) : (
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
          )}
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
      paddingBottom: 44,
    },

    iconCircle: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor:
        PURPLE_SOFT,
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

    confirmLabel: {
      marginTop: 17,
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

    passwordHint: {
      color: MUTED,
      fontSize: 10.5,
      lineHeight: 16,
      marginTop: 7,
    },

    sessionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 20,
      padding: 15,
      borderRadius: 15,
      backgroundColor: WHITE,
      borderWidth: 1,
      borderColor: BORDER,
    },

    sessionCopy: {
      flex: 1,
    },

    sessionTitle: {
      color: NAVY,
      fontSize: 12,
      fontWeight: '800',
    },

    sessionDescription: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 3,
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
      marginTop: 20,
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
