import { useEffect, useState } from 'react'
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
  getCurrentUser,
  updateProfile,
} from '../../services/api'

const NAVY = '#0B1D3A'

const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#DDE2EA'
const MUTED = '#737D91'
const GREEN = '#26945A'
const GREEN_SOFT = '#E9F8EF'

type FieldProps = {
  label: string
  value: string
  placeholder: string
  onChangeText: (value: string) => void
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'phone-pad'
    | 'numeric'
  autoCapitalize?:
    | 'none'
    | 'sentences'
    | 'words'
  rightIcon?: 'calendar'
  editable?: boolean
}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  rightIcon,
  editable = true,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.fieldInputContainer,
          !editable &&
            styles.fieldInputDisabled,
        ]}
      >
        <TextInput
          style={styles.fieldInput}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#9AA2B1"
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={editable}
          accessibilityLabel={label}
        />

        {rightIcon ? (
          <Feather
            name={rightIcon}
            size={21}
            color={MUTED}
          />
        ) : null}
      </View>
    </View>
  )
}

export function PersonalInfoScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets = useSafeAreaInsets()

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [changed, setChanged] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const currentUser =
          await getCurrentUser()

        if (
          !mounted ||
          !currentUser
        ) {
          return
        }

        const normalizedPhone =
          currentUser.phone
            .replace(/\D/g, '')
            .replace(/^502/, '')
            .slice(-8)

        setName(
          currentUser.name ?? '',
        )
        setEmail(
          currentUser.email ?? '',
        )
        setPhone(
          normalizedPhone,
        )
      } catch (error) {
        if (!mounted) return

        Alert.alert(
          'No fue posible cargar el perfil',
          (error as Error).message,
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  function updateName(value: string) {
    setName(value)
    setChanged(true)
  }

  function updatePhone(value: string) {
    setPhone(
      value
        .replace(/\D/g, '')
        .slice(0, 8),
    )
    setChanged(true)
  }

  function changePassword() {
    navigation.navigate(
      'Privacidad y seguridad',
    )
  }

  async function save() {
    if (saving) return

    const cleanName =
      name.trim()

    const cleanPhone =
      phone.replace(/\D/g, '')

    if (!cleanName) {
      Alert.alert(
        'Nombre requerido',
        'Ingresa tu nombre para continuar.',
      )
      return
    }

    if (
      cleanPhone &&
      cleanPhone.length !== 8
    ) {
      Alert.alert(
        'Teléfono inválido',
        'El número de teléfono debe tener 8 dígitos.',
      )
      return
    }

    if (!changed) {
      Alert.alert(
        'Sin cambios',
        'No has modificado tu información personal.',
      )
      return
    }

    setSaving(true)

    try {
      const updated =
        await updateProfile({
          name: cleanName,
          phone: cleanPhone
            ? `+502${cleanPhone}`
            : '',
        })

      setName(
        updated.name ??
          cleanName,
      )

      setEmail(
        updated.email ??
          email,
      )

      setPhone(
        (
          updated.phone ??
          cleanPhone
        )
          .replace(/\D/g, '')
          .replace(/^502/, '')
          .slice(-8),
      )

      setChanged(false)

      Alert.alert(
        'Perfil actualizado',
        'Tu información personal fue guardada correctamente.',
      )
    } catch (error) {
      Alert.alert(
        'No fue posible guardar',
        (error as Error).message,
      )
    } finally {
      setSaving(false)
    }
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
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                105 +
                Math.max(
                  insets.bottom,
                  10,
                ),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* TITULO */}
          <Text style={styles.title}>
            Información personal
          </Text>

          <Text style={styles.subtitle}>
            Administra tus datos de cuenta
          </Text>

          {loading ? (
            <View
              style={
                styles.loadingBox
              }
            >
              <ActivityIndicator
                size="small"
                color={PURPLE}
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Cargando información…
              </Text>
            </View>
          ) : null}

          {/* PERFIL */}
          <View style={styles.profileCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Feather
                  name="user"
                  size={48}
                  color="#737B8C"
                />
              </View>
            </View>

            <View style={styles.profileCopy}>
              <Text
                style={styles.profileName}
                numberOfLines={1}
              >
                {name ||
                  'Tu nombre'}
              </Text>

              <Text
                style={styles.profileRole}
              >
                Cuenta EventFlow
              </Text>
            </View>


          </View>

          {/* DATOS */}
          <Text style={styles.sectionTitle}>
            Datos de cuenta
          </Text>

          <View style={styles.formCard}>
            <Field
              label="Nombre completo"
              placeholder="Agregar nombre"
              value={name}
              onChangeText={updateName}
              autoCapitalize="words"
              editable={
                !loading && !saving
              }
            />

            <Field
              label="Correo electrónico"
              placeholder="Correo principal"
              value={email}
              onChangeText={() => {}}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />

            <Text style={styles.emailHelp}>
              Para cambiar el correo principal se requiere verificar la nueva dirección antes de sustituir la actual.
            </Text>

            <Field
              label="Teléfono"
              placeholder="Agregar teléfono"
              value={phone}
              onChangeText={updatePhone}
              keyboardType="phone-pad"
              editable={
                !loading && !saving
              }
            />

          </View>

          {/* SEGURIDAD */}
          <Text style={styles.sectionTitle}>
            Seguridad
          </Text>

          <View style={styles.securityCard}>
            <Pressable
              style={({ pressed }) => [
                styles.securityRow,
                pressed &&
                  styles.rowPressed,
              ]}
              onPress={changePassword}
              accessibilityRole="button"
              accessibilityLabel="Cambiar contraseña"
            >
              <View
                style={
                  styles.securityLeft
                }
              >
                <Feather
                  name="lock"
                  size={23}
                  color={NAVY}
                />

                <Text
                  style={
                    styles.securityText
                  }
                >
                  Cambiar contraseña
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={22}
                color="#7B8494"
              />
            </Pressable>

            <View
              style={
                styles.securityRow
              }
            >
              <View
                style={
                  styles.securityLeft
                }
              >
                <Feather
                  name="shield"
                  size={23}
                  color={NAVY}
                />

                <Text
                  style={
                    styles.securityText
                  }
                >
                  Verificación de cuenta
                </Text>
              </View>

              <View
                style={
                  styles.pendingBadge
                }
              >
                <Feather
                  name="info"
                  size={14}
                  color={PURPLE}
                />

                <Text
                  style={
                    styles.pendingText
                  }
                >
                  Sin confirmar
                </Text>
              </View>
            </View>
          </View>

          {/* GUARDAR */}
          <Pressable
            onPress={save}
            disabled={
              loading ||
              saving ||
              !changed
            }
            accessibilityRole="button"
            accessibilityLabel="Guardar cambios de información personal"
            accessibilityState={{
              disabled:
                loading ||
                saving ||
                !changed,
              busy: saving,
            }}
            style={({ pressed }) => [
              styles.saveWrapper,
              pressed &&
                !saving &&
                styles.pressed,
              (
                loading ||
                saving ||
                !changed
              ) &&
                styles.saveUnchanged,
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
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={WHITE}
                />
              ) : (
                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Guardar cambios
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={
                styles.cancelText
              }
            >
              Cancelar
            </Text>
          </Pressable>
        </ScrollView>

        {/* BOTTOM NAV */}
        <View
          style={[
            styles.bottomNavigation,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  10,
                ),
            },
          ]}
        >
          <Pressable
            style={styles.navItem}
            onPress={() =>
              navigation.navigate(
                'Inicio',
              )
            }
          >
            <Feather
              name="home"
              size={24}
              color="#747C8E"
            />

            <Text
              style={styles.navText}
            >
              Inicio
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              navigation.navigate(
                'Eventos',
              )
            }
          >
            <Feather
              name="calendar"
              size={24}
              color="#747C8E"
            />

            <Text
              style={styles.navText}
            >
              Eventos
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              navigation.navigate(
                'Notificaciones',
              )
            }
          >
            <Feather
              name="bell"
              size={24}
              color="#747C8E"
            />

            <Text
              style={styles.navText}
            >
              Notificaciones
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              navigation.navigate(
                'Perfil',
              )
            }
          >
            <Feather
              name="user"
              size={24}
              color={PURPLE}
            />

            <Text
              style={[
                styles.navText,
                styles.navTextActive,
              ]}
            >
              Perfil
            </Text>

            <View
              style={
                styles.navIndicator
              }
            />
          </Pressable>
        </View>
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

  header: {
    height: 68,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 22,

    gap: 20,

    backgroundColor: BACKGROUND,
  },

  backButton: {
    width: 38,
    height: 42,

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

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
  },

  title: {
    color: NAVY,

    fontSize: 31,
    lineHeight: 37,

    fontWeight: '800',

    letterSpacing: -0.9,

    marginTop: 12,
  },

  subtitle: {
    color: MUTED,

    fontSize: 15,

    marginTop: 3,
    marginBottom: 18,
  },

  /* PERFIL */

  loadingBox: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 12,
    borderRadius: 13,
    backgroundColor: PURPLE_SOFT,
  },

  loadingText: {
    color: MUTED,
    fontSize: 11.5,
    fontWeight: '600',
  },

  profileCard: {
    minHeight: 132,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 17,

    borderRadius: 20,

    backgroundColor: PURPLE_SOFT,
  },

  avatarRing: {
    width: 86,
    height: 86,

    borderRadius: 43,

    borderWidth: 2,
    borderColor: PURPLE,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: WHITE,
  },

  avatar: {
    width: 76,
    height: 76,

    borderRadius: 38,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#EEEFF3',
  },

  profileCopy: {
    flex: 1,

    minWidth: 0,

    marginLeft: 15,
  },

  profileName: {
    color: NAVY,

    fontSize: 17,

    fontWeight: '800',
  },

  profileRole: {
    color: MUTED,

    fontSize: 12,

    marginTop: 5,
  },

  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 7,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 13,

    backgroundColor:
      'rgba(255,255,255,0.65)',
  },

  photoButtonText: {
    color: PURPLE,

    fontSize: 11,

    fontWeight: '700',
  },

  /* FORM */

  sectionTitle: {
    color: NAVY,

    fontSize: 19,

    fontWeight: '800',

    marginTop: 20,
    marginBottom: 10,
  },

  formCard: {
    paddingHorizontal: 14,
    paddingVertical: 13,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 18,

    backgroundColor: WHITE,
  },

  field: {
    marginBottom: 11,
  },

  fieldLabel: {
    color: MUTED,

    fontSize: 11.5,

    marginBottom: 5,
  },

  fieldInputContainer: {
    minHeight: 52,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 13,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 11,

    backgroundColor: WHITE,
  },

  fieldInputDisabled: {
    backgroundColor: '#F4F5F7',
  },

  fieldInput: {
    flex: 1,

    height: 50,

    paddingVertical: 0,

    color: NAVY,

    fontSize: 13.5,
  },

  emailHelp: {
    color: MUTED,
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: -2,
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  /* SEGURIDAD */

  securityCard: {
    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 17,

    overflow: 'hidden',

    backgroundColor: WHITE,
  },

  securityRow: {
    minHeight: 59,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',

    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 16,
  },

  securityText: {
    color: NAVY,

    fontSize: 12.5,

    fontWeight: '500',
  },

  rowPressed: {
    backgroundColor: '#F7F7FA',
  },

  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: PURPLE_SOFT,
  },

  pendingText: {
    color: PURPLE,
    fontSize: 10.5,
    fontWeight: '700',
  },

  saveWrapper: {
    marginTop: 22,

    borderRadius: 15,

    overflow: 'hidden',

    shadowColor: PURPLE,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.14,

    shadowRadius: 12,

    elevation: 3,
  },

  saveButton: {
    height: 58,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 15,
  },

  saveButtonText: {
    color: WHITE,

    fontSize: 15,

    fontWeight: '700',
  },

  saveUnchanged: {
    opacity: 0.92,
  },

  cancelButton: {
    alignSelf: 'center',

    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  cancelText: {
    color: PURPLE,

    fontSize: 13,

    fontWeight: '700',
  },

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  /* NAV */

  bottomNavigation: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 80,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',

    paddingTop: 7,
    paddingHorizontal: 12,

    backgroundColor:
      'rgba(255,255,255,0.98)',

    borderTopWidth: 1,
    borderTopColor: BORDER,

    elevation: 10,
  },

  navItem: {
    flex: 1,

    minHeight: 55,

    alignItems: 'center',
    justifyContent: 'center',

    gap: 4,
  },

  navText: {
    color: '#747C8E',

    fontSize: 9.5,
  },

  navTextActive: {
    color: PURPLE,

    fontWeight: '700',
  },

  navIndicator: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: PURPLE,
  },
})