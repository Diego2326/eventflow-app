import { useState } from 'react'

import {
  ActivityIndicator,
  Alert,
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

import {
  completeGoogleRegistration,
} from '../../services/api'

const NAVY = '#0B1D3A'
const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const PURPLE_SOFT = '#F0EDFF'
const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#DDE2EA'
const MUTED = '#737D91'
const DANGER = '#B74C43'

type RouteParams = {
  registrationToken: string
  email: string
  name?: string
}

export function CompleteGoogleRegistrationScreen({
  navigation,
  route,
}: any) {
  const insets =
    useSafeAreaInsets()

  const params =
    route?.params as
      | RouteParams
      | undefined

  const registrationToken =
    params?.registrationToken ?? ''

  const email =
    params?.email ?? ''

  const [name, setName] =
    useState(params?.name ?? '')

  const [phone, setPhone] =
    useState('')

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false)

  const [
    acceptedPrivacy,
    setAcceptedPrivacy,
  ] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  function updatePhone(
    value: string,
  ) {
    setPhone(
      value
        .replace(/\D/g, '')
        .slice(0, 8),
    )

    setError('')
  }

  async function submit() {
    if (loading) return

    const cleanName =
      name.trim()

    const cleanPhone =
      phone.replace(/\D/g, '')

    setError('')

    if (!registrationToken) {
      setError(
        'No se recibió el token temporal de Google. Regresa al inicio de sesión e inténtalo nuevamente.',
      )
      return
    }

    if (!email) {
      setError(
        'No se recibió el correo validado por Google.',
      )
      return
    }

    if (!cleanName) {
      setError(
        'Ingresa tu nombre completo.',
      )
      return
    }

    if (
      cleanPhone.length !== 8
    ) {
      setError(
        'Ingresa un número de teléfono válido de 8 dígitos.',
      )
      return
    }

    if (!acceptedTerms) {
      setError(
        'Debes aceptar los términos y condiciones.',
      )
      return
    }

    if (!acceptedPrivacy) {
      setError(
        'Debes aceptar el aviso de privacidad.',
      )
      return
    }

    setLoading(true)

    try {
      await completeGoogleRegistration(
        {
          registrationToken,
          name: cleanName,
          phone:
            `+502${cleanPhone}`,
          acceptedTerms,
          acceptedPrivacy,
        },
      )

      navigation.replace(
        'Inicio',
      )
    } catch (error) {
      setError(
        (error as Error).message,
      )
    } finally {
      setLoading(false)
    }
  }

  function openTerms() {
    Alert.alert(
      'Términos y condiciones',
      'Esta opción debe mostrar los términos oficiales de EventFlow cuando el documento o la URL estén definidos.',
    )
  }

  function openPrivacy() {
    Alert.alert(
      'Aviso de privacidad',
      'Esta opción debe mostrar el aviso de privacidad oficial de EventFlow cuando el documento o la URL estén definidos.',
    )
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
            styles.content,
            {
              paddingBottom:
                Math.max(
                  insets.bottom + 36,
                  48,
                ),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View style={styles.header}>
            <Pressable
              style={
                styles.backButton
              }
              onPress={() =>
                navigation.goBack()
              }
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={10}
            >
              <Feather
                name="arrow-left"
                size={27}
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

          <View
            style={
              styles.googleIcon
            }
          >
            <Feather
              name="user-check"
              size={31}
              color={PURPLE}
            />
          </View>

          <Text style={styles.title}>
            Completa tu cuenta
          </Text>

          <Text
            style={styles.subtitle}
          >
            Google ya validó tu correo. Solo necesitamos algunos datos para crear tu cuenta de EventFlow.
          </Text>

          <View
            style={styles.formCard}
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              Correo validado por Google
            </Text>

            <View
              style={[
                styles.inputContainer,
                styles.readOnlyInput,
              ]}
            >
              <Feather
                name="mail"
                size={19}
                color={MUTED}
              />

              <Text
                style={
                  styles.readOnlyText
                }
                numberOfLines={1}
              >
                {email ||
                  'Correo no disponible'}
              </Text>

              <Feather
                name="check-circle"
                size={18}
                color="#26945A"
              />
            </View>

            <Text
              style={
                styles.fieldLabel
              }
            >
              Nombre completo
            </Text>

            <View
              style={
                styles.inputContainer
              }
            >
              <Feather
                name="user"
                size={19}
                color={MUTED}
              />

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={value => {
                  setName(value)
                  setError('')
                }}
                placeholder="Tu nombre completo"
                placeholderTextColor={
                  '#9AA2B1'
                }
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                textContentType="name"
                editable={!loading}
                accessibilityLabel="Nombre completo"
              />
            </View>

            <Text
              style={
                styles.fieldLabel
              }
            >
              Teléfono
            </Text>

            <View
              style={
                styles.phoneRow
              }
            >
              <View
                style={
                  styles.countryCode
                }
              >
                <Text
                  style={
                    styles.countryCodeText
                  }
                >
                  +502
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  styles.phoneInputContainer,
                ]}
              >
                <Feather
                  name="phone"
                  size={19}
                  color={MUTED}
                />

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={
                    updatePhone
                  }
                  placeholder="00000000"
                  placeholderTextColor={
                    '#9AA2B1'
                  }
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  editable={!loading}
                  maxLength={8}
                  accessibilityLabel="Teléfono"
                />
              </View>
            </View>

            <View
              style={
                styles.acceptanceBlock
              }
            >
              <Pressable
                style={
                  styles.checkRow
                }
                onPress={() => {
                  setAcceptedTerms(
                    current =>
                      !current,
                  )
                  setError('')
                }}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked:
                    acceptedTerms,
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedTerms &&
                      styles.checkboxChecked,
                  ]}
                >
                  {acceptedTerms ? (
                    <Feather
                      name="check"
                      size={14}
                      color={WHITE}
                    />
                  ) : null}
                </View>

                <Text
                  style={
                    styles.checkText
                  }
                >
                  Acepto los{' '}
                  <Text
                    style={
                      styles.linkText
                    }
                    onPress={
                      openTerms
                    }
                  >
                    términos y condiciones
                  </Text>
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.checkRow
                }
                onPress={() => {
                  setAcceptedPrivacy(
                    current =>
                      !current,
                  )
                  setError('')
                }}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked:
                    acceptedPrivacy,
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedPrivacy &&
                      styles.checkboxChecked,
                  ]}
                >
                  {acceptedPrivacy ? (
                    <Feather
                      name="check"
                      size={14}
                      color={WHITE}
                    />
                  ) : null}
                </View>

                <Text
                  style={
                    styles.checkText
                  }
                >
                  Acepto el{' '}
                  <Text
                    style={
                      styles.linkText
                    }
                    onPress={
                      openPrivacy
                    }
                  >
                    aviso de privacidad
                  </Text>
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View
                style={
                  styles.errorBox
                }
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <Feather
                  name="alert-circle"
                  size={17}
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

            <Pressable
              disabled={loading}
              onPress={submit}
              style={({ pressed }) => [
                styles.submitWrapper,
                pressed &&
                  !loading &&
                  styles.pressed,
                loading &&
                  styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Crear cuenta EventFlow"
              accessibilityState={{
                disabled: loading,
                busy: loading,
              }}
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
                style={
                  styles.submitButton
                }
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={WHITE}
                  />
                ) : (
                  <Feather
                    name="arrow-right"
                    size={19}
                    color={WHITE}
                  />
                )}

                <Text
                  style={
                    styles.submitText
                  }
                >
                  Crear cuenta y continuar
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Text
            style={styles.footerNote}
          >
            Tu correo no necesita una segunda verificación porque ya fue validado por Google.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor:
        BACKGROUND,
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 22,
    },

    header: {
      height: 68,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },

    backButton: {
      width: 38,
      height: 42,
      alignItems:
        'flex-start',
      justifyContent:
        'center',
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

    googleIcon: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        PURPLE_SOFT,
      marginTop: 18,
    },

    title: {
      color: NAVY,
      fontSize: 31,
      lineHeight: 37,
      fontWeight: '800',
      letterSpacing: -0.9,
      marginTop: 18,
    },

    subtitle: {
      color: MUTED,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 7,
      marginBottom: 22,
    },

    formCard: {
      padding: 18,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: WHITE,
    },

    fieldLabel: {
      color: NAVY,
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 7,
      marginTop: 12,
    },

    inputContainer: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 13,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor:
        '#FBFCFE',
    },

    input: {
      flex: 1,
      minHeight: 50,
      paddingVertical: 0,
      color: NAVY,
      fontSize: 14,
    },

    readOnlyInput: {
      backgroundColor:
        '#F3F5F8',
    },

    readOnlyText: {
      flex: 1,
      color: NAVY,
      fontSize: 13,
    },

    phoneRow: {
      flexDirection: 'row',
      gap: 9,
    },

    countryCode: {
      minWidth: 69,
      minHeight: 52,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 13,
      backgroundColor:
        '#F3F5F8',
    },

    countryCodeText: {
      color: NAVY,
      fontSize: 14,
      fontWeight: '700',
    },

    phoneInputContainer: {
      flex: 1,
    },

    acceptanceBlock: {
      gap: 13,
      marginTop: 20,
    },

    checkRow: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 10,
    },

    checkbox: {
      width: 21,
      height: 21,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor:
        '#A9B0BE',
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 1,
      backgroundColor: WHITE,
    },

    checkboxChecked: {
      borderColor: PURPLE,
      backgroundColor: PURPLE,
    },

    checkText: {
      flex: 1,
      color: MUTED,
      fontSize: 12,
      lineHeight: 18,
    },

    linkText: {
      color: PURPLE,
      fontWeight: '700',
    },

    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 11,
      marginTop: 18,
      borderRadius: 12,
      backgroundColor:
        '#FFF0F1',
    },

    errorText: {
      flex: 1,
      color: DANGER,
      fontSize: 11,
      lineHeight: 16,
    },

    submitWrapper: {
      marginTop: 20,
      borderRadius: 14,
      overflow: 'hidden',
    },

    submitButton: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
      paddingHorizontal: 16,
    },

    submitText: {
      color: WHITE,
      fontSize: 14,
      fontWeight: '800',
    },

    pressed: {
      opacity: 0.9,
    },

    disabled: {
      opacity: 0.58,
    },

    footerNote: {
      color: MUTED,
      textAlign: 'center',
      fontSize: 10.5,
      lineHeight: 16,
      marginTop: 16,
      paddingHorizontal: 16,
    },
  })
