import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'

import { StatusBar } from 'expo-status-bar'

import {
  Feather,
} from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
  changePassword as changeAccountPassword,
  getCurrentUser,
  getProfilePreferences,
  logoutAllSessions,
  updateProfilePreferences,
} from '../../services/api'

import type {
  ProfileVisibility,
} from '../../services/api'

const NAVY = '#0B1D3A'

const PURPLE = '#6848E7'
const PURPLE_DARK = '#5735D2'
const PURPLE_SOFT = '#F0EDFF'

const WHITE = '#FFFFFF'
const BACKGROUND = '#F8F8FC'
const BORDER = '#E2E5EC'
const MUTED = '#737D91'

const GREEN = '#26945A'
const GREEN_SOFT = '#E2F8EA'

const DANGER = '#E74755'

type SecurityRowProps = {
  icon:
    | 'lock'
    | 'shield'
    | 'monitor'
    | 'clock'
  title: string
  value?: string
  valueType?:
    | 'success'
    | 'muted'
  onPress: () => void
}

type PrivacyRowProps = {
  icon:
    | 'eye'
    | 'bar-chart-2'
    | 'mail'
  title: string
  value?: string
  onPress?: () => void
  switchValue?: boolean
  onSwitchChange?: (
    value: boolean,
  ) => void
}

type AccessRowProps = {
  icon:
    | 'download'
    | 'trash-2'
    | 'file-text'
    | 'clipboard'
  title: string
  danger?: boolean
  onPress: () => void
}

function SecurityRow({
  icon,
  title,
  value,
  valueType = 'muted',
  onPress,
}: SecurityRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.rowIconArea}>
        <Feather
          name={icon}
          size={23}
          color={NAVY}
        />
      </View>

      <Text style={styles.rowTitle}>
        {title}
      </Text>

      {value ? (
        <View
          style={[
            styles.valueBadge,
            valueType ===
              'success'
              ? styles.successBadge
              : styles.mutedBadge,
          ]}
        >
          <Text
            style={[
              styles.valueBadgeText,
              valueType ===
                'success'
                ? styles.successText
                : styles.mutedValueText,
            ]}
          >
            {value}
          </Text>
        </View>
      ) : null}

      <Feather
        name="chevron-right"
        size={22}
        color="#7C8494"
      />
    </Pressable>
  )
}

function PrivacyRow({
  icon,
  title,
  value,
  onPress,
  switchValue,
  onSwitchChange,
}: PrivacyRowProps) {
  const hasSwitch =
    typeof switchValue ===
      'boolean' &&
    !!onSwitchChange

  if (hasSwitch) {
    return (
      <View style={styles.row}>
        <View
          style={styles.rowIconArea}
        >
          <Feather
            name={icon}
            size={23}
            color={NAVY}
          />
        </View>

        <Text
          style={styles.rowTitle}
        >
          {title}
        </Text>

        <Switch
          value={switchValue}
          onValueChange={
            onSwitchChange
          }
          trackColor={{
            false: '#AAB1C0',
            true: '#8E76F3',
          }}
          thumbColor={WHITE}
        />
      </View>
    )
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.rowIconArea}>
        <Feather
          name={icon}
          size={23}
          color={NAVY}
        />
      </View>

      <Text style={styles.rowTitle}>
        {title}
      </Text>

      {value ? (
        <Text style={styles.rowValue}>
          {value}
        </Text>
      ) : null}

      <Feather
        name="chevron-right"
        size={22}
        color="#7C8494"
      />
    </Pressable>
  )
}

function AccessRow({
  icon,
  title,
  danger = false,
  onPress,
}: AccessRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.rowIconArea}>
        <Feather
          name={icon}
          size={23}
          color={
            danger
              ? DANGER
              : NAVY
          }
        />
      </View>

      <Text
        style={[
          styles.rowTitle,
          danger &&
            styles.dangerText,
        ]}
      >
        {title}
      </Text>

      <Feather
        name="chevron-right"
        size={22}
        color={
          danger
            ? DANGER
            : '#7C8494'
        }
      />
    </Pressable>
  )
}

export function PrivacySecurityScreen({
  navigation,
}: {
  navigation: any
}) {
  const insets =
    useSafeAreaInsets()

  const [
    personalizationEnabled,
    setPersonalizationEnabled,
  ] = useState(false)

  const [
    eventCommunicationsEnabled,
    setEventCommunicationsEnabled,
  ] = useState(true)

  const [
    profileVisibility,
    setProfileVisibility,
  ] = useState<ProfileVisibility>(
    'EVENT_PARTICIPANTS',
  )

  const [
    preferencesLoading,
    setPreferencesLoading,
  ] = useState(true)

  const [
    preferencesSaving,
    setPreferencesSaving,
  ] = useState(false)

  const [
    hasChanges,
    setHasChanges,
  ] = useState(false)

  const [
    accountEmail,
    setAccountEmail,
  ] = useState('')

  const [
    accountVerified,
    setAccountVerified,
  ] = useState(false)

  const [
    passwordFormOpen,
    setPasswordFormOpen,
  ] = useState(false)

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('')

  const [
    newPassword,
    setNewPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false)

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false)

  const [
    passwordError,
    setPasswordError,
  ] = useState('')

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState('')


  const sessionTime =
    useMemo(() => {
      return new Date().toLocaleTimeString(
        'es-GT',
        {
          hour: 'numeric',
          minute: '2-digit',
        },
      )
    }, [])

  useEffect(() => {
    let mounted = true

    Promise.all([
      getCurrentUser(),
      getProfilePreferences(),
    ])
      .then(
        ([
          currentUser,
          preferences,
        ]) => {
          if (!mounted) return

          if (currentUser) {
            setAccountEmail(
              currentUser.email,
            )
            setAccountVerified(
              currentUser.status ===
                'ACTIVE',
            )
          }

          setPersonalizationEnabled(
            preferences
              .personalizationEnabled,
          )
          setEventCommunicationsEnabled(
            preferences
              .eventCommunicationsEnabled,
          )
          setProfileVisibility(
            preferences
              .profileVisibility,
          )
          setHasChanges(false)
        },
      )
      .catch(() => {
        if (!mounted) return

        setAccountEmail('')
        setAccountVerified(false)
      })
      .finally(() => {
        if (mounted) {
          setPreferencesLoading(
            false,
          )
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  function updatePersonalization(
    value: boolean,
  ) {
    setPersonalizationEnabled(
      value,
    )

    setHasChanges(true)
  }

  function updateCommunications(
    value: boolean,
  ) {
    setEventCommunicationsEnabled(
      value,
    )

    setHasChanges(true)
  }

  function toggleProfileVisibility() {
    setProfileVisibility(
      current =>
        current ===
        'EVENT_PARTICIPANTS'
          ? 'PRIVATE'
          : 'EVENT_PARTICIPANTS',
    )

    setHasChanges(true)
  }

  function openVerification() {
    Alert.alert(
      'Verificación de cuenta',
      accountVerified
        ? `La cuenta ${accountEmail || 'actual'} está activa.`
        : `La cuenta ${accountEmail || 'actual'} está pendiente de verificación. La activación se realiza mediante el enlace enviado al correo.`,
    )
  }

  function changePassword() {
    setPasswordFormOpen(
      current => !current,
    )
    setPasswordError('')
    setPasswordMessage('')
  }

  function clearPasswordForm() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordMessage('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  async function submitPasswordChange() {
    if (passwordLoading) return

    setPasswordError('')
    setPasswordMessage('')

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        'Completa los tres campos de contraseña.',
      )
      return
    }

    if (newPassword.length < 8) {
      setPasswordError(
        'La nueva contraseña debe tener al menos 8 caracteres.',
      )
      return
    }

    if (!/\d/.test(newPassword)) {
      setPasswordError(
        'La nueva contraseña debe incluir al menos un número.',
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        'La nueva contraseña y su confirmación deben coincidir.',
      )
      return
    }

    if (
      newPassword ===
      currentPassword
    ) {
      setPasswordError(
        'La nueva contraseña debe ser diferente de la contraseña actual.',
      )
      return
    }

    setPasswordLoading(true)

    try {
      await changeAccountPassword({
        currentPassword,
        newPassword,
      })

      setPasswordMessage(
        'Tu contraseña fue actualizada correctamente.',
      )

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError(
        (error as Error).message,
      )
    } finally {
      setPasswordLoading(false)
    }
  }


  function activeSessions() {
    Alert.alert(
      'Cerrar todas las sesiones',
      'Esto cerrará tu sesión en todos los dispositivos asociados a tu cuenta.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar todas',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutAllSessions()

              navigation.replace(
                'Login',
              )
            } catch (error) {
              Alert.alert(
                'No fue posible cerrar las sesiones',
                (error as Error).message,
              )
            }
          },
        },
      ],
    )
  }

  async function saveChanges() {
    if (
      !hasChanges ||
      preferencesSaving
    ) {
      return
    }

    setPreferencesSaving(true)

    try {
      const updated =
        await updateProfilePreferences({
          personalizationEnabled,
          eventCommunicationsEnabled,
          profileVisibility,
        })

      setPersonalizationEnabled(
        updated.personalizationEnabled,
      )
      setEventCommunicationsEnabled(
        updated
          .eventCommunicationsEnabled,
      )
      setProfileVisibility(
        updated.profileVisibility,
      )
      setHasChanges(false)

      Alert.alert(
        'Preferencias guardadas',
        'Tus preferencias de privacidad fueron actualizadas correctamente.',
      )
    } catch (error) {
      Alert.alert(
        'No fue posible guardar',
        (error as Error).message,
      )
    } finally {
      setPreferencesSaving(false)
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar style="dark" />

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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              105 +
              Math.max(
                insets.bottom,
                10,
              ),
          },
        ]}
      >
        {/* ENCABEZADO */}

        <Text style={styles.title}>
          Privacidad y seguridad
        </Text>

        <Text style={styles.subtitle}>
          Protege tu cuenta, tus accesos y tu información
        </Text>

        {/* ESTADO */}

        <View style={styles.statusCard}>
          <View
            style={
              styles.shieldCircle
            }
          >
            <Feather
              name="shield"
              size={46}
              color={PURPLE}
            />

            <View
              style={
                styles.shieldCheck
              }
            >
              <Feather
                name="check"
                size={13}
                color={WHITE}
              />
            </View>
          </View>

          <View
            style={
              styles.statusInformation
            }
          >
            <View
              style={
                styles.statusLine
              }
            >
              <Feather
                name="user"
                size={21}
                color={NAVY}
              />

              <View
                style={
                  styles.statusCopy
                }
              >
                <Text
                  style={
                    styles.statusLabel
                  }
                >
                  Estado de cuenta
                </Text>

                <Text
                  style={
                    styles.statusSecondary
                  }
                >
                  {accountVerified
                    ? 'Cuenta verificada'
                    : 'Verificación pendiente'}
                </Text>
              </View>

              <View
                style={[
                  styles.accountBadge,
                  accountVerified
                    ? styles.accountBadgeSuccess
                    : styles.accountBadgePending,
                ]}
              >
                <Feather
                  name={
                    accountVerified
                      ? 'check'
                      : 'clock'
                  }
                  size={15}
                  color={
                    accountVerified
                      ? GREEN
                      : PURPLE
                  }
                />

                <Text
                  style={[
                    styles.accountBadgeText,
                    {
                      color:
                        accountVerified
                          ? GREEN
                          : PURPLE,
                    },
                  ]}
                >
                  {accountVerified
                    ? 'Verificado'
                    : 'Pendiente'}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.statusLine
              }
            >
              <Feather
                name="clock"
                size={21}
                color={NAVY}
              />

              <View
                style={
                  styles.statusCopy
                }
              >
                <Text
                  style={
                    styles.statusLabel
                  }
                >
                  Sesión actual
                </Text>

                <Text
                  style={
                    styles.statusSecondary
                  }
                >
                  Hoy, {sessionTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SEGURIDAD */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Seguridad de la cuenta
        </Text>

        <View
          style={
            styles.sectionCard
          }
        >
          <SecurityRow
            icon="lock"
            title="Cambiar contraseña"
            onPress={
              changePassword
            }
          />

          {passwordFormOpen ? (
            <View
              style={
                styles.passwordPanel
              }
            >
              <Text
                style={
                  styles.passwordPanelTitle
                }
              >
                Actualizar contraseña
              </Text>

              <Text
                style={
                  styles.passwordPanelHelp
                }
              >
                Debe tener al menos 8 caracteres, incluir un número y ser diferente de la actual.
              </Text>

              <View
                style={
                  styles.passwordInputRow
                }
              >
                <Feather
                  name="lock"
                  size={18}
                  color={MUTED}
                />

                <TextInput
                  style={
                    styles.passwordInput
                  }
                  value={
                    currentPassword
                  }
                  onChangeText={value => {
                    setCurrentPassword(
                      value,
                    )
                    setPasswordError('')
                    setPasswordMessage('')
                  }}
                  placeholder="Contraseña actual"
                  placeholderTextColor={
                    MUTED
                  }
                  secureTextEntry={
                    !showCurrentPassword
                  }
                  editable={
                    !passwordLoading
                  }
                  autoComplete="current-password"
                  textContentType="password"
                  accessibilityLabel="Contraseña actual"
                />

                <Pressable
                  onPress={() =>
                    setShowCurrentPassword(
                      current => !current,
                    )
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showCurrentPassword
                      ? 'Ocultar contraseña actual'
                      : 'Mostrar contraseña actual'
                  }
                >
                  <Feather
                    name={
                      showCurrentPassword
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
                  styles.passwordInputRow
                }
              >
                <Feather
                  name="key"
                  size={18}
                  color={MUTED}
                />

                <TextInput
                  style={
                    styles.passwordInput
                  }
                  value={newPassword}
                  onChangeText={value => {
                    setNewPassword(
                      value,
                    )
                    setPasswordError('')
                    setPasswordMessage('')
                  }}
                  placeholder="Nueva contraseña"
                  placeholderTextColor={
                    MUTED
                  }
                  secureTextEntry={
                    !showNewPassword
                  }
                  editable={
                    !passwordLoading
                  }
                  autoComplete="new-password"
                  textContentType="newPassword"
                  accessibilityLabel="Nueva contraseña"
                />

                <Pressable
                  onPress={() =>
                    setShowNewPassword(
                      current => !current,
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

              <View
                style={
                  styles.passwordInputRow
                }
              >
                <Feather
                  name="check-circle"
                  size={18}
                  color={MUTED}
                />

                <TextInput
                  style={
                    styles.passwordInput
                  }
                  value={
                    confirmPassword
                  }
                  onChangeText={value => {
                    setConfirmPassword(
                      value,
                    )
                    setPasswordError('')
                    setPasswordMessage('')
                  }}
                  placeholder="Confirmar nueva contraseña"
                  placeholderTextColor={
                    MUTED
                  }
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  editable={
                    !passwordLoading
                  }
                  autoComplete="new-password"
                  textContentType="newPassword"
                  accessibilityLabel="Confirmar nueva contraseña"
                />

                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(
                      current => !current,
                    )
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? 'Ocultar confirmación de contraseña'
                      : 'Mostrar confirmación de contraseña'
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

              {passwordError ? (
                <View
                  style={
                    styles.passwordErrorBox
                  }
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  <Feather
                    name="alert-circle"
                    size={16}
                    color={DANGER}
                  />

                  <Text
                    style={
                      styles.passwordErrorText
                    }
                  >
                    {passwordError}
                  </Text>
                </View>
              ) : null}

              {passwordMessage ? (
                <View
                  style={
                    styles.passwordSuccessBox
                  }
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  <Feather
                    name="check-circle"
                    size={16}
                    color={GREEN}
                  />

                  <Text
                    style={
                      styles.passwordSuccessText
                    }
                  >
                    {passwordMessage}
                  </Text>
                </View>
              ) : null}

              <View
                style={
                  styles.passwordActions
                }
              >
                <Pressable
                  disabled={
                    passwordLoading
                  }
                  onPress={
                    clearPasswordForm
                  }
                  style={
                    styles.passwordCancelButton
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar formulario de contraseña"
                >
                  <Text
                    style={
                      styles.passwordCancelText
                    }
                  >
                    Limpiar
                  </Text>
                </Pressable>

                <Pressable
                  disabled={
                    passwordLoading
                  }
                  onPress={
                    submitPasswordChange
                  }
                  style={[
                    styles.passwordSaveButton,
                    passwordLoading &&
                      styles.passwordButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Guardar nueva contraseña"
                  accessibilityState={{
                    disabled:
                      passwordLoading,
                    busy:
                      passwordLoading,
                  }}
                >
                  {passwordLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={WHITE}
                    />
                  ) : (
                    <Feather
                      name="save"
                      size={16}
                      color={WHITE}
                    />
                  )}

                  <Text
                    style={
                      styles.passwordSaveText
                    }
                  >
                    Guardar
                  </Text>
                </Pressable>
              </View>

            </View>
          ) : null}

          <SecurityRow
            icon="shield"
            title="Verificación de cuenta"
            value={
              accountVerified
                ? 'Verificado'
                : 'Pendiente'
            }
            valueType={
              accountVerified
                ? 'success'
                : 'muted'
            }
            onPress={
              openVerification
            }
          />

          <SecurityRow
            icon="clock"
            title="Cerrar todas las sesiones"
            onPress={
              activeSessions
            }
          />

        </View>

        {/* PRIVACIDAD */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Privacidad
        </Text>

        {preferencesLoading ? (
          <View
            style={
              styles.preferencesLoadingBox
            }
          >
            <ActivityIndicator
              size="small"
              color={PURPLE}
            />

            <Text
              style={
                styles.preferencesLoadingText
              }
            >
              Cargando preferencias...
            </Text>
          </View>
        ) : null}

        <View
          style={
            styles.sectionCard
          }
        >
          <PrivacyRow
            icon="eye"
            title="Visibilidad del perfil"
            value={
              profileVisibility ===
              'EVENT_PARTICIPANTS'
                ? 'Solo asistentes'
                : 'Privado'
            }
            onPress={
              toggleProfileVisibility
            }
          />

          <PrivacyRow
            icon="bar-chart-2"
            title="Uso de datos para personalización"
            switchValue={
              personalizationEnabled
            }
            onSwitchChange={
              updatePersonalization
            }
          />

          <PrivacyRow
            icon="mail"
            title="Permitir comunicaciones del evento"
            switchValue={
              eventCommunicationsEnabled
            }
            onSwitchChange={
              updateCommunications
            }
          />

        </View>

        {/* GUARDAR */}

        <Pressable
          onPress={saveChanges}
          disabled={
            preferencesLoading ||
            preferencesSaving ||
            !hasChanges
          }
          style={({ pressed }) => [
            styles.saveWrapper,
            pressed &&
              !preferencesSaving &&
              styles.pressed,
            (
              preferencesLoading ||
              preferencesSaving ||
              !hasChanges
            ) &&
              styles.saveInactive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Guardar preferencias"
          accessibilityState={{
            disabled:
              preferencesLoading ||
              preferencesSaving ||
              !hasChanges,
            busy: preferencesSaving,
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
              styles.saveButton
            }
          >
            {preferencesSaving ? (
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
          style={
            styles.cancelButton
          }
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

    header: {
      height: 68,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 22,

      gap: 20,

      backgroundColor:
        BACKGROUND,
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

    scroll: {
      flex: 1,
    },

    content: {
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

      fontSize: 14.5,
      lineHeight: 21,

      marginTop: 3,
      marginBottom: 18,
    },

    statusCard: {
      minHeight: 138,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 20,

      borderRadius: 21,

      backgroundColor:
        PURPLE_SOFT,
    },

    shieldCircle: {
      width: 89,
      height: 89,

      borderRadius: 45,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        'rgba(255,255,255,0.50)',
    },

    shieldCheck: {
      position: 'absolute',

      width: 25,
      height: 25,

      bottom: 17,
      right: 16,

      borderRadius: 13,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        PURPLE,

      borderWidth: 3,
      borderColor:
        PURPLE_SOFT,
    },

    statusInformation: {
      flex: 1,

      marginLeft: 18,

      gap: 16,
    },

    statusLine: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 11,
    },

    statusCopy: {
      flex: 1,
    },

    statusLabel: {
      color: NAVY,

      fontSize: 12,

      fontWeight: '800',
    },

    statusSecondary: {
      color: MUTED,

      fontSize: 10.5,

      marginTop: 2,
    },

    accountBadge: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 5,

      paddingHorizontal: 9,
      paddingVertical: 5,

      borderRadius: 999,
    },

    accountBadgeSuccess: {
      backgroundColor:
        GREEN_SOFT,
    },

    accountBadgePending: {
      backgroundColor:
        '#EAE5FF',
    },

    accountBadgeText: {
      fontSize: 10,

      fontWeight: '700',
    },

    passwordPanel: {
      marginHorizontal: 14,
      marginBottom: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 16,
      backgroundColor:
        '#FBFAFF',
    },

    passwordPanelTitle: {
      color: NAVY,
      fontSize: 13.5,
      fontWeight: '800',
    },

    passwordPanelHelp: {
      color: MUTED,
      fontSize: 10.5,
      lineHeight: 16,
      marginTop: 4,
      marginBottom: 11,
    },

    passwordInputRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      paddingHorizontal: 12,
      marginBottom: 9,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 12,
      backgroundColor: WHITE,
    },

    passwordInput: {
      flex: 1,
      minHeight: 46,
      paddingVertical: 0,
      color: NAVY,
      fontSize: 12,
    },

    passwordErrorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      padding: 10,
      marginTop: 2,
      borderRadius: 11,
      backgroundColor:
        '#FFF0F1',
    },

    passwordErrorText: {
      flex: 1,
      color: DANGER,
      fontSize: 10.5,
      lineHeight: 15,
    },

    passwordSuccessBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      padding: 10,
      marginTop: 2,
      borderRadius: 11,
      backgroundColor:
        GREEN_SOFT,
    },

    passwordSuccessText: {
      flex: 1,
      color: GREEN,
      fontSize: 10.5,
      lineHeight: 15,
    },

    passwordActions: {
      flexDirection: 'row',
      justifyContent:
        'flex-end',
      gap: 9,
      marginTop: 11,
    },

    passwordCancelButton: {
      minHeight: 40,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 11,
      backgroundColor: WHITE,
    },

    passwordCancelText: {
      color: MUTED,
      fontSize: 11,
      fontWeight: '700',
    },

    passwordSaveButton: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      paddingHorizontal: 15,
      borderRadius: 11,
      backgroundColor: PURPLE,
    },

    passwordSaveText: {
      color: WHITE,
      fontSize: 11,
      fontWeight: '800',
    },

    passwordButtonDisabled: {
      opacity: 0.55,
    },

    passwordDemoNote: {
      color: MUTED,
      fontSize: 9.5,
      lineHeight: 14,
      marginTop: 10,
    },

    sectionTitle: {
      color: NAVY,

      fontSize: 19,

      fontWeight: '800',

      marginTop: 23,
      marginBottom: 10,
    },

    sectionCard: {
      borderWidth: 1,
      borderColor: BORDER,

      borderRadius: 17,

      overflow: 'hidden',

      backgroundColor: WHITE,
    },

    row: {
      minHeight: 58,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 15,

      borderBottomWidth: 1,
      borderBottomColor:
        BORDER,
    },

    rowPressed: {
      backgroundColor:
        '#F7F7FA',
    },

    rowIconArea: {
      width: 41,

      alignItems:
        'flex-start',
      justifyContent:
        'center',
    },

    rowTitle: {
      flex: 1,

      color: NAVY,

      fontSize: 12.5,

      fontWeight: '500',
    },

    rowValue: {
      color: MUTED,

      fontSize: 10.5,

      marginRight: 7,
    },

    valueBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,

      marginRight: 8,

      borderRadius: 999,
    },

    successBadge: {
      backgroundColor:
        GREEN_SOFT,
    },

    mutedBadge: {
      backgroundColor:
        '#F0F1F4',
    },

    valueBadgeText: {
      fontSize: 10.5,

      fontWeight: '700',
    },

    successText: {
      color: GREEN,
    },

    mutedValueText: {
      color: MUTED,
    },

    dangerText: {
      color: DANGER,
    },

    preferencesLoadingBox: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 10,
      borderRadius: 14,
      backgroundColor:
        PURPLE_SOFT,
    },

    preferencesLoadingText: {
      color: MUTED,
      fontSize: 11,
      fontWeight: '600',
    },

    saveWrapper: {
      marginTop: 23,

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

    saveInactive: {
      opacity: 0.92,
    },

    saveButton: {
      height: 58,

      alignItems: 'center',
      justifyContent:
        'center',

      borderRadius: 15,
    },

    saveButtonText: {
      color: WHITE,

      fontSize: 15,

      fontWeight: '700',
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
      opacity: 0.84,

      transform: [
        {
          scale: 0.995,
        },
      ],
    },

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
      borderTopColor:
        BORDER,

      elevation: 10,
    },

    navItem: {
      flex: 1,

      minHeight: 55,

      alignItems: 'center',
      justifyContent:
        'center',

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

      backgroundColor:
        PURPLE,
    },
  })