import { useMemo, useState } from 'react'
import {
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

import { DEMO_EMAIL } from '../../services/demo'

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

function nameFromEmail(email: string) {
  const localPart = email.split('@')[0] || ''

  const words = localPart
    .split(/[._-]/)
    .filter(Boolean)

  if (!words.length) {
    return ''
  }

  return words
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    )
    .join(' ')
}

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
          editable={editable}
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

  const defaultName = useMemo(
    () => nameFromEmail(DEMO_EMAIL),
    [],
  )

  const [name, setName] =
    useState(defaultName)

  const [email, setEmail] =
    useState(DEMO_EMAIL)

  /*
   * Estos datos NO existen todavía en nuestra
   * información real, así que empiezan vacíos.
   */
  const [phone, setPhone] =
    useState('')

  const [birthDate, setBirthDate] =
    useState('')

  const [country, setCountry] =
    useState('')

  const [changed, setChanged] =
    useState(false)

  function updateName(value: string) {
    setName(value)
    setChanged(true)
  }

  function updateEmail(value: string) {
    setEmail(value)
    setChanged(true)
  }

  function updatePhone(value: string) {
    setPhone(
      value.replace(
        /[^0-9+\s]/g,
        '',
      ),
    )
    setChanged(true)
  }

  function updateBirthDate(
    value: string,
  ) {
    setBirthDate(
      value.replace(
        /[^0-9/]/g,
        '',
      ),
    )
    setChanged(true)
  }

  function updateCountry(value: string) {
    setCountry(value)
    setChanged(true)
  }

  function changePhoto() {
    Alert.alert(
      'Cambiar foto',
      'La selección de fotografía se conectará cuando agreguemos el selector de imágenes.',
    )
  }

  function changePassword() {
    Alert.alert(
      'Cambiar contraseña',
      'Conectaremos esta opción con el flujo de seguridad de EventFlow.',
    )
  }

  function save() {
    if (!name.trim()) {
      Alert.alert(
        'Nombre requerido',
        'Ingresa tu nombre para continuar.',
      )
      return
    }

    if (!email.trim()) {
      Alert.alert(
        'Correo requerido',
        'Ingresa tu correo electrónico.',
      )
      return
    }

    /*
     * No inventamos un endpoint de actualización
     * porque todavía no tenemos uno confirmado.
     */
    Alert.alert(
      'Perfil preparado',
      'Los datos son válidos. Falta conectar esta pantalla al endpoint de actualización del perfil para guardarlos permanentemente.',
    )

    setChanged(false)
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

            <Pressable
              style={({ pressed }) => [
                styles.photoButton,
                pressed &&
                  styles.pressed,
              ]}
              onPress={changePhoto}
            >
              <Feather
                name="camera"
                size={18}
                color={PURPLE}
              />

              <Text
                style={
                  styles.photoButtonText
                }
              >
                Cambiar foto
              </Text>
            </Pressable>
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
            />

            <Field
              label="Correo electrónico"
              placeholder="Agregar correo"
              value={email}
              onChangeText={updateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Field
              label="Teléfono"
              placeholder="Agregar teléfono"
              value={phone}
              onChangeText={updatePhone}
              keyboardType="phone-pad"
            />

            <Field
              label="Fecha de nacimiento"
              placeholder="DD/MM/AAAA"
              value={birthDate}
              onChangeText={
                updateBirthDate
              }
              keyboardType="numeric"
              rightIcon="calendar"
            />

            <Field
              label="País / región"
              placeholder="Agregar país / región"
              value={country}
              onChangeText={
                updateCountry
              }
              autoCapitalize="words"
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
                  styles.verifiedBadge
                }
              >
                <View
                  style={
                    styles.verifiedIcon
                  }
                >
                  <Feather
                    name="check"
                    size={12}
                    color={WHITE}
                  />
                </View>

                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  Verificado
                </Text>
              </View>
            </View>
          </View>

          {/* GUARDAR */}
          <Pressable
            onPress={save}
            style={({ pressed }) => [
              styles.saveWrapper,
              pressed &&
                styles.pressed,
              !changed &&
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
              <Text
                style={
                  styles.saveButtonText
                }
              >
                Guardar cambios
              </Text>
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
              Alert.alert(
                'Notificaciones',
                'Esta sección estará disponible próximamente.',
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

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 7,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 16,

    backgroundColor: GREEN_SOFT,
  },

  verifiedIcon: {
    width: 20,
    height: 20,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: GREEN,
  },

  verifiedText: {
    color: GREEN,

    fontSize: 11,

    fontWeight: '700',
  },

  /* BOTONES */

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