import { useState } from 'react'
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { login } from '../../services/api'
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from '../../services/demo'

export function LoginScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const [identifier, setIdentifier] =
    useState(DEMO_EMAIL)

  const [password, setPassword] =
    useState(DEMO_PASSWORD)

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  /*
   * Altura adaptable.
   * Evita que la fotografía ocupe media pantalla
   * en teléfonos pequeños.
   */
  const heroHeight = Math.max(
    350,
    Math.min(390, height * 0.43),
  )

  async function submit() {
    if (loading) return

    if (!identifier.trim() || !password) {
      setError(
        'Ingresa tu correo o teléfono y contraseña.',
      )
      return
    }

    setError('')
    setLoading(true)

    try {
      await login(
        identifier.trim(),
        password,
      )

      navigation.replace('Eventos')
    } catch (error) {
      setError(
        (error as Error).message,
      )
    } finally {
      setLoading(false)
    }
  }

  function googleLogin() {
    Alert.alert(
      'Continuar con Google',
      'La integración con Google se conectará posteriormente.',
    )
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* =========================
              HERO / FOTO DEL EVENTO
          ========================== */}

          <ImageBackground
            source={require('../../../assets/event-login-background.png')}
            resizeMode="cover"
            style={[
              styles.hero,
              {
                height: heroHeight,
                paddingTop: insets.top + 10,
              },
            ]}
          >
            {/* Capa azul sobre la fotografía */}
            <LinearGradient
              colors={[
                'rgba(4,20,43,0.83)',
                'rgba(5,26,55,0.55)',
                'rgba(5,24,51,0.22)',
                'rgba(3,17,38,0.82)',
              ]}
              locations={[
                0,
                0.34,
                0.64,
                1,
              ]}
              style={StyleSheet.absoluteFill}
            />

            {/* Marca principal */}

            <View style={styles.brandBlock}>
              <Image
                source={require('../../../assets/eventflow-mark.png')}
                resizeMode="contain"
                style={styles.logo}
              />

              <Text style={styles.brandName}>
                Event
                <Text style={styles.brandAccent}>
                  Flow
                </Text>
              </Text>

              <Text style={styles.brandSubtitle}>
                Tu experiencia del evento{'\n'}
                en un solo lugar
              </Text>
            </View>

            {/* Copy inferior sobre la fotografía */}

            <View style={styles.heroFooter}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroStatement}>
                  Grandes eventos crean{'\n'}
                  mejores personas.
                </Text>

                <View style={styles.orangeLine} />
              </View>

              <View style={styles.heroRight}>
                <Text style={styles.heroWord}>
                  EVENTOS
                </Text>

                <Text style={styles.heroWord}>
                  PERSONAS
                </Text>

                <Text style={styles.heroWord}>
                  HISTORIAS
                </Text>

                <Text style={styles.heroWord}>
                  QUE CONECTAN
                </Text>

                <View style={styles.orangeLineSmall} />
              </View>
            </View>
          </ImageBackground>

          {/* =========================
                  LOGIN
          ========================== */}

          <View
            style={[
              styles.sheet,
              {
                paddingBottom:
                  Math.max(
                    insets.bottom + 30,
                    44,
                  ),
              },
            ]}
          >
            {/* Icono superior */}

            <View style={styles.lockCircle}>
              <Feather
                name="lock"
                size={25}
                color="#314B70"
              />
            </View>

            <Text style={styles.title}>
              Iniciar sesión
            </Text>

            <Text style={styles.subtitle}>
              Accede a tus eventos, invitaciones y pases.
            </Text>

            {/* CORREO */}

            <View style={styles.inputContainer}>
              <Feather
                name="mail"
                size={21}
                color="#64738D"
              />

              <TextInput
                style={styles.input}
                value={identifier}
                onChangeText={value => {
                  setIdentifier(value)
                  setError('')
                }}
                placeholder="Correo o teléfono"
                placeholderTextColor="#75839A"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            {/* CONTRASEÑA */}

            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={21}
                color="#64738D"
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={value => {
                  setPassword(value)
                  setError('')
                }}
                placeholder="Contraseña"
                placeholderTextColor="#75839A"
                secureTextEntry={!showPassword}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={submit}
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(
                    current => !current,
                  )
                }
                hitSlop={12}
              >
                <Feather
                  name={
                    showPassword
                      ? 'eye-off'
                      : 'eye'
                  }
                  size={23}
                  color="#64738D"
                />
              </Pressable>
            </View>

            {/* RECUPERAR */}

            <Pressable
              style={styles.forgotButton}
              onPress={() =>
                navigation.navigate(
                  'Recuperación',
                )
              }
              disabled={loading}
            >
              <Text style={styles.forgotText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>

            {/* ERROR */}

            {error ? (
              <View style={styles.errorContainer}>
                <Feather
                  name="alert-circle"
                  size={17}
                  color="#B74C43"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* CONTINUAR */}

            <Pressable
              disabled={loading}
              onPress={submit}
              style={({ pressed }) => [
                styles.primaryButtonShadow,

                pressed &&
                  !loading &&
                  styles.pressed,

                loading &&
                  styles.disabled,
              ]}
            >
              <LinearGradient
                colors={[
                  '#FF5C3E',
                  '#FF7257',
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
                <Text style={styles.primaryButtonText}>
                  {loading
                    ? 'Ingresando...'
                    : 'Continuar'}
                </Text>

                {!loading ? (
                  <Feather
                    name="arrow-right"
                    size={21}
                    color="#FFFFFF"
                  />
                ) : null}
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
              onPress={googleLogin}
            >
              <FontAwesome
                name="google"
                size={21}
                color="#4285F4"
              />

              <Text style={styles.googleText}>
                Continuar con Google
              </Text>
            </Pressable>

            {/* CREAR CUENTA */}

            <View style={styles.registerContainer}>
              <Text style={styles.registerQuestion}>
                ¿No tienes una cuenta?
              </Text>

              <Pressable
                hitSlop={10}
                onPress={() =>
                  navigation.navigate(
                    'Registro',
                  )
                }
              >
                <Text style={styles.registerLink}>
                  Crear cuenta
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },

  /* =========================
              HERO
  ========================== */

  hero: {
    width: '100%',
    backgroundColor: '#071B39',
    paddingHorizontal: 28,
  },

  brandBlock: {
    alignItems: 'center',
    marginTop: 10,
  },

  logo: {
    width: 55,
    height: 55,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 2,
  },

  brandAccent: {
    color: '#FF684C',
  },

  brandSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 3,
  },

  heroFooter: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 43,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  heroLeft: {
    flex: 1,
  },

  heroStatement: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },

  orangeLine: {
    width: 30,
    height: 3,
    borderRadius: 99,
    backgroundColor: '#FF674B',
    marginTop: 12,
  },

  heroRight: {
    width: 120,
  },

  heroWord: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 8.5,
    lineHeight: 17,
    letterSpacing: 2.8,
  },

  orangeLineSmall: {
    width: 24,
    height: 3,
    borderRadius: 99,
    backgroundColor: '#FF674B',
    marginTop: 8,
  },

  /* =========================
              SHEET
  ========================== */

  sheet: {
    minHeight: 500,

    marginTop: -26,

    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,

    paddingHorizontal: 26,
    paddingTop: 48,

    shadowColor: '#0B1D3A',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,

    elevation: 6,
  },

  lockCircle: {
    position: 'absolute',

    top: -27,

    alignSelf: 'center',

    width: 58,
    height: 58,

    borderRadius: 29,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F1F4F8',

    shadowColor: '#173052',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 5,
  },

  title: {
    color: '#0C2241',

    fontSize: 27,
    lineHeight: 33,

    fontWeight: '800',

    textAlign: 'center',
  },

  subtitle: {
    color: '#71819A',

    fontSize: 13,
    lineHeight: 19,

    textAlign: 'center',

    marginTop: 4,
    marginBottom: 23,
  },

  /* =========================
            INPUTS
  ========================== */

  inputContainer: {
    minHeight: 56,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 13,

    borderWidth: 1,
    borderColor: '#D7DFEA',

    borderRadius: 13,

    paddingHorizontal: 15,

    backgroundColor: '#FCFDFE',

    marginBottom: 13,
  },

  input: {
    flex: 1,

    minHeight: 54,

    paddingVertical: 0,

    color: '#152B4A',

    fontSize: 14,
  },

  eyeButton: {
    minHeight: 52,

    justifyContent: 'center',

    paddingLeft: 7,
  },

  forgotButton: {
    alignSelf: 'flex-end',

    paddingVertical: 3,

    marginBottom: 18,
  },

  forgotText: {
    color: '#1769D2',

    fontSize: 12.5,

    fontWeight: '600',
  },

  /* =========================
              ERROR
  ========================== */

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    padding: 10,

    marginBottom: 13,

    backgroundColor: '#FFF1EF',

    borderRadius: 10,
  },

  errorText: {
    flex: 1,

    color: '#B74C43',

    fontSize: 11.5,
    lineHeight: 16,
  },

  /* =========================
            CONTINUAR
  ========================== */

  primaryButtonShadow: {
    borderRadius: 15,

    shadowColor: '#FF654A',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 13,

    elevation: 4,
  },

  primaryButton: {
    height: 56,

    borderRadius: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: '700',
  },

  pressed: {
    opacity: 0.9,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  disabled: {
    opacity: 0.65,
  },

  /* =========================
            DIVISOR
  ========================== */

  divider: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    marginVertical: 21,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor: '#D8DEE7',
  },

  dividerText: {
    color: '#77849A',

    fontSize: 11.5,
  },

  /* =========================
              GOOGLE
  ========================== */

  googleButton: {
    height: 54,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 12,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D5DDE8',

    borderRadius: 15,
  },

  googlePressed: {
    backgroundColor: '#F7F9FC',
  },

  googleText: {
    color: '#132847',

    fontSize: 14.5,

    fontWeight: '600',
  },

  /* =========================
            REGISTRO
  ========================== */

  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    flexWrap: 'wrap',

    gap: 5,

    marginTop: 24,
  },

  registerQuestion: {
    color: '#6F7E95',

    fontSize: 12.5,
  },

  registerLink: {
    color: '#FF6549',

    fontSize: 12.5,

    fontWeight: '700',
  },
})