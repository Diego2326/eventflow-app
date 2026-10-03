import {
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'

import { StatusBar } from 'expo-status-bar'

import {
  Feather,
  FontAwesome,
} from '@expo/vector-icons'

import { LinearGradient } from 'expo-linear-gradient'

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
    | 'camera'
    | 'bell'
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
    hasChanges,
    setHasChanges,
  ] = useState(false)

  /*
   * Todavía no tenemos un endpoint
   * que confirme estos estados.
   *
   * Por eso NO mostramos como real:
   *
   * "Cuenta verificada"
   * "Google conectado"
   *
   * hasta que el backend lo confirme.
   */
  const accountVerified = false
  const googleConnected = false

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

  function comingSoon(
    title: string,
    message: string,
  ) {
    Alert.alert(
      title,
      message,
    )
  }

  function openVerification() {
    Alert.alert(
      'Verificación de cuenta',
      `El siguiente paso será crear el flujo de verificación para ${DEMO_EMAIL}. Aquí enviaremos un código al correo y, si agregas teléfono, otro código por SMS.`,
    )
  }

  function changePassword() {
    comingSoon(
      'Cambiar contraseña',
      'Conectaremos esta opción con el flujo seguro para cambiar tu contraseña.',
    )
  }

  function linkedDevices() {
    comingSoon(
      'Dispositivos vinculados',
      'Aquí podrás consultar los teléfonos y dispositivos que tienen acceso a tu cuenta.',
    )
  }

  function activeSessions() {
    comingSoon(
      'Sesiones activas',
      'Aquí podrás revisar tus sesiones iniciadas y cerrar aquellas que no reconozcas.',
    )
  }

  function googleLogin() {
    comingSoon(
      'Inicio de sesión con Google',
      googleConnected
        ? 'Aquí podrás administrar la cuenta de Google vinculada.'
        : 'Aquí podrás vincular una cuenta de Google con EventFlow.',
    )
  }

  function profileVisibility() {
    comingSoon(
      'Visibilidad del perfil',
      'Aquí podrás elegir quién puede ver tu perfil dentro de los eventos.',
    )
  }

  function cameraPermissions() {
    comingSoon(
      'Permisos de cámara',
      'Aquí conectaremos los permisos reales de cámara del dispositivo.',
    )
  }

  function notificationPermissions() {
    comingSoon(
      'Permisos de notificaciones',
      'Aquí conectaremos los permisos reales de notificaciones del dispositivo.',
    )
  }

  function downloadData() {
    comingSoon(
      'Descargar mis datos',
      'Cuando el backend lo soporte, podrás solicitar una copia de la información asociada a tu cuenta.',
    )
  }

  function deleteAccount() {
    Alert.alert(
      'Solicitar eliminación de cuenta',
      'Esta acción deberá confirmar tu identidad antes de enviar una solicitud de eliminación.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Pendiente de backend',
              'Todavía no existe un endpoint confirmado para eliminar la cuenta.',
            )
          },
        },
      ],
    )
  }

  function privacyPolicy() {
    comingSoon(
      'Política de privacidad',
      'Aquí mostraremos la política de privacidad oficial de EventFlow.',
    )
  }

  function terms() {
    comingSoon(
      'Términos y condiciones',
      'Aquí mostraremos los términos y condiciones oficiales de EventFlow.',
    )
  }

  function saveChanges() {
    if (!hasChanges) {
      Alert.alert(
        'Sin cambios',
        'No has modificado ninguna preferencia.',
      )

      return
    }

    /*
     * No fingimos persistencia:
     * todavía necesitamos endpoint.
     */
    Alert.alert(
      'Cambios preparados',
      'Las preferencias están actualizadas en esta pantalla. Cuando conectemos el perfil con el backend podrán guardarse permanentemente.',
    )

    setHasChanges(false)
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
            icon="monitor"
            title="Dispositivos vinculados"
            onPress={
              linkedDevices
            }
          />

          <SecurityRow
            icon="clock"
            title="Sesiones activas"
            onPress={
              activeSessions
            }
          />

          <Pressable
            style={({ pressed }) => [
              styles.row,
              pressed &&
                styles.rowPressed,
            ]}
            onPress={
              googleLogin
            }
          >
            <View
              style={
                styles.rowIconArea
              }
            >
              <FontAwesome
                name="google"
                size={24}
                color="#4285F4"
              />
            </View>

            <Text
              style={
                styles.rowTitle
              }
            >
              Inicio de sesión con Google
            </Text>

            <View
              style={[
                styles.valueBadge,
                googleConnected
                  ? styles.successBadge
                  : styles.mutedBadge,
              ]}
            >
              <Text
                style={[
                  styles.valueBadgeText,
                  googleConnected
                    ? styles.successText
                    : styles.mutedValueText,
                ]}
              >
                {googleConnected
                  ? 'Conectado'
                  : 'No conectado'}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={22}
              color="#7C8494"
            />
          </Pressable>
        </View>

        {/* PRIVACIDAD */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Privacidad
        </Text>

        <View
          style={
            styles.sectionCard
          }
        >
          <PrivacyRow
            icon="eye"
            title="Visibilidad del perfil"
            value="Solo asistentes"
            onPress={
              profileVisibility
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

          <PrivacyRow
            icon="camera"
            title="Administrar permisos de cámara"
            onPress={
              cameraPermissions
            }
          />

          <PrivacyRow
            icon="bell"
            title="Administrar permisos de notificaciones"
            onPress={
              notificationPermissions
            }
          />
        </View>

        {/* DATOS */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Datos y acceso
        </Text>

        <View
          style={
            styles.sectionCard
          }
        >
          <AccessRow
            icon="download"
            title="Descargar mis datos"
            onPress={
              downloadData
            }
          />

          <AccessRow
            icon="trash-2"
            title="Solicitar eliminación de cuenta"
            danger
            onPress={
              deleteAccount
            }
          />

          <AccessRow
            icon="file-text"
            title="Política de privacidad"
            onPress={
              privacyPolicy
            }
          />

          <AccessRow
            icon="clipboard"
            title="Términos y condiciones"
            onPress={terms}
          />
        </View>

        {/* GUARDAR */}

        <Pressable
          onPress={saveChanges}
          style={({ pressed }) => [
            styles.saveWrapper,
            pressed &&
              styles.pressed,
            !hasChanges &&
              styles.saveInactive,
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
            style={
              styles.saveButton
            }
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