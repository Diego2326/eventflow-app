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
import {
  Feather,
  FontAwesome,
} from '@expo/vector-icons'
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

export function RegisterScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [acceptedTerms, setAcceptedTerms] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  async function submit() {
    if (loading) return

    setError('')

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        'Completa todos los campos para continuar.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'Las contraseñas no coinciden.',
      )
      return
    }

    if (password.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres.',
      )
      return
    }

    if (!acceptedTerms) {
      setError(
        'Debes aceptar los términos y condiciones.',
      )
      return
    }

    setLoading(true)

    try {
      await request(
        '/auth/register',
        'POST',
        {
          name: name.trim(),
          email: email.trim(),
          phone: `+502${phone.trim()}`,
          password,
        },
      )

      Alert.alert(
        'Cuenta creada',
        'Tu cuenta fue creada correctamente. Revisa el enlace de activación si es necesario.',
        [
          {
            text: 'Iniciar sesión',
            onPress: () =>
              navigation.replace('Login'),
          },
        ],
      )
    } catch (error) {
      setError(
        (error as Error).message,
      )
    } finally {
      setLoading(false)
    }
  }

  function googleRegister() {
    Alert.alert(
      'Continuar con Google',
      'La integración con Google todavía no está conectada.',
    )
  }

  function addPhoto() {
    Alert.alert(
      'Foto de perfil',
      'La selección de foto se conectará posteriormente.',
    )
  }

  function openTerms() {
    Alert.alert(
      'Términos y condiciones',
      'Esta sección se conectará con los términos de EventFlow.',
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
            styles.scrollContent,
            {
              paddingBottom:
                Math.max(
                  insets.bottom + 30,
                  40,
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
              Crear cuenta
            </Text>

            <Text style={styles.subtitle}>
              Completa tus datos para acceder a tus
              eventos, pases y notificaciones.
            </Text>
          </View>

          {/* FOTO */}
          <Pressable
            style={styles.avatarSection}
            onPress={addPhoto}
          >
            <View style={styles.avatar}>
              <Feather
                name="user"
                size={48}
                color="#747D8E"
              />

              <LinearGradient
                colors={[
                  PURPLE,
                  PURPLE_DARK,
                ]}
                style={styles.cameraButton}
              >
                <Feather
                  name="camera"
                  size={20}
                  color={WHITE}
                />
              </LinearGradient>
            </View>

            <Text style={styles.addPhotoText}>
              Agregar foto
            </Text>
          </Pressable>

          {/* FORMULARIO */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Feather
                name="user"
                size={22}
                color={NAVY}
              />

              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={MUTED}
                value={name}
                onChangeText={value => {
                  setName(value)
                  setError('')
                }}
                editable={!loading}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather
                name="mail"
                size={22}
                color={NAVY}
              />

              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={MUTED}
                value={email}
                onChangeText={value => {
                  setEmail(value)
                  setError('')
                }}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* TELEFONO */}
            <View style={styles.phoneContainer}>
              <View style={styles.countryBox}>
                <Text style={styles.flag}>
                  🇬🇹
                </Text>

                <Text style={styles.countryCode}>
                  +502
                </Text>

                <Feather
                  name="chevron-down"
                  size={17}
                  color={MUTED}
                />
              </View>

              <View style={styles.phoneSeparator} />

              <Feather
                name="phone"
                size={22}
                color={NAVY}
              />

              <TextInput
                style={styles.phoneInput}
                placeholder="Teléfono"
                placeholderTextColor={MUTED}
                value={phone}
                onChangeText={value => {
                  setPhone(
                    value.replace(
                      /[^0-9]/g,
                      '',
                    ),
                  )
                  setError('')
                }}
                editable={!loading}
                keyboardType="phone-pad"
                maxLength={8}
                returnKeyType="next"
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={22}
                color={NAVY}
              />

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={MUTED}
                value={password}
                onChangeText={value => {
                  setPassword(value)
                  setError('')
                }}
                editable={!loading}
                secureTextEntry={!showPassword}
                returnKeyType="next"
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(
                    current => !current,
                  )
                }
                hitSlop={10}
              >
                <Feather
                  name={
                    showPassword
                      ? 'eye'
                      : 'eye-off'
                  }
                  size={22}
                  color={MUTED}
                />
              </Pressable>
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={22}
                color={NAVY}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={MUTED}
                value={confirmPassword}
                onChangeText={value => {
                  setConfirmPassword(value)
                  setError('')
                }}
                editable={!loading}
                secureTextEntry={
                  !showConfirmPassword
                }
                returnKeyType="done"
                onSubmitEditing={submit}
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() =>
                  setShowConfirmPassword(
                    current => !current,
                  )
                }
                hitSlop={10}
              >
                <Feather
                  name={
                    showConfirmPassword
                      ? 'eye'
                      : 'eye-off'
                  }
                  size={22}
                  color={MUTED}
                />
              </Pressable>
            </View>

            {/* TERMINOS */}
            <View style={styles.termsRow}>
              <Pressable
                style={[
                  styles.checkbox,
                  acceptedTerms &&
                    styles.checkboxSelected,
                ]}
                onPress={() => {
                  setAcceptedTerms(
                    current => !current,
                  )
                  setError('')
                }}
              >
                {acceptedTerms ? (
                  <Feather
                    name="check"
                    size={17}
                    color={WHITE}
                  />
                ) : null}
              </Pressable>

              <Text style={styles.termsText}>
                Acepto los{' '}
              </Text>

              <Pressable
                onPress={openTerms}
              >
                <Text style={styles.termsLink}>
                  términos y condiciones
                </Text>
              </Pressable>
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

            {/* CREAR CUENTA */}
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
                      Crear cuenta
                    </Text>

                    <Feather
                      name="arrow-right"
                      size={23}
                      color={WHITE}
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* DIVISOR */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />

              <Text style={styles.dividerText}>
                o continúa con
              </Text>

              <View style={styles.dividerLine} />
            </View>

            {/* GOOGLE */}
            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed &&
                  styles.googlePressed,
              ]}
              onPress={googleRegister}
              disabled={loading}
            >
              <FontAwesome
                name="google"
                size={25}
                color="#4285F4"
              />

              <Text style={styles.googleText}>
                Continuar con Google
              </Text>
            </Pressable>

            {/* LOGIN */}
            <View style={styles.loginRow}>
              <Text style={styles.loginQuestion}>
                ¿Ya tienes cuenta?
              </Text>

              <Pressable
                onPress={() =>
                  navigation.replace('Login')
                }
                disabled={loading}
              >
                <Text style={styles.loginLink}>
                  Iniciar sesión
                </Text>
              </Pressable>
            </View>
          </View>
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
    paddingHorizontal: 26,
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
    marginTop: 17,
  },

  title: {
    color: NAVY,

    fontSize: 39,
    lineHeight: 45,

    fontWeight: '800',

    letterSpacing: -1.2,
  },

  subtitle: {
    color: MUTED,

    fontSize: 16,
    lineHeight: 23,

    marginTop: 6,

    maxWidth: 355,
  },

  /* AVATAR */

  avatarSection: {
    alignItems: 'center',

    marginTop: 21,
    marginBottom: 18,
  },

  avatar: {
    width: 94,
    height: 94,

    borderRadius: 47,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: PURPLE_SOFT,
  },

  cameraButton: {
    position: 'absolute',

    right: -6,
    bottom: -1,

    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 3,
    borderColor: WHITE,
  },

  addPhotoText: {
    color: PURPLE,

    fontSize: 12,

    fontWeight: '700',

    marginTop: 8,
  },

  /* FORM */

  form: {
    width: '100%',
  },

  inputContainer: {
    height: 57,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 13,

    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 12,

    backgroundColor: INPUT_BACKGROUND,

    marginBottom: 10,
  },

  input: {
    flex: 1,

    height: '100%',

    paddingVertical: 0,

    color: NAVY,

    fontSize: 14,
  },

  eyeButton: {
    width: 34,
    height: 52,

    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  /* PHONE */

  phoneContainer: {
    height: 57,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 12,

    backgroundColor: INPUT_BACKGROUND,

    marginBottom: 10,

    overflow: 'hidden',
  },

  countryBox: {
    height: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    paddingHorizontal: 14,

    backgroundColor: PURPLE_SOFT,
  },

  flag: {
    fontSize: 20,
  },

  countryCode: {
    color: NAVY,

    fontSize: 14,

    fontWeight: '700',
  },

  phoneSeparator: {
    width: 1,
    height: 31,

    backgroundColor: BORDER,

    marginRight: 14,
  },

  phoneInput: {
    flex: 1,

    height: '100%',

    paddingVertical: 0,
    paddingHorizontal: 12,

    color: NAVY,

    fontSize: 14,
  },

  /* TERMS */

  termsRow: {
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',

    marginTop: 2,
  },

  checkbox: {
    width: 23,
    height: 23,

    borderWidth: 2,
    borderColor: '#7A8292',

    borderRadius: 4,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  checkboxSelected: {
    borderColor: PURPLE,
    backgroundColor: PURPLE,
  },

  termsText: {
    color: MUTED,

    fontSize: 12.5,
  },

  termsLink: {
    color: PURPLE,

    fontSize: 12.5,

    fontWeight: '700',
  },

  /* ERROR */

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,

    marginTop: 4,
    marginBottom: 10,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 10,

    backgroundColor: '#FFF0EE',
  },

  errorText: {
    flex: 1,

    color: ERROR,

    fontSize: 11.5,
    lineHeight: 16,
  },

  /* PRIMARY */

  primaryButtonWrapper: {
    marginTop: 8,

    borderRadius: 14,

    shadowColor: PURPLE,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,

    elevation: 4,
  },

  primaryButton: {
    height: 58,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 15,
  },

  primaryButtonText: {
    color: WHITE,

    fontSize: 16,

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

  /* DIVIDER */

  divider: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    marginVertical: 18,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor: BORDER,
  },

  dividerText: {
    color: MUTED,

    fontSize: 11.5,
  },

  /* GOOGLE */

  googleButton: {
    height: 56,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 14,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 14,

    backgroundColor: WHITE,
  },

  googlePressed: {
    backgroundColor: '#F8F9FB',
  },

  googleText: {
    color: NAVY,

    fontSize: 14,

    fontWeight: '700',
  },

  /* LOGIN */

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',

    gap: 4,

    marginTop: 20,
  },

  loginQuestion: {
    color: MUTED,

    fontSize: 12.5,
  },

  loginLink: {
    color: PURPLE,

    fontSize: 12.5,

    fontWeight: '700',
  },
})