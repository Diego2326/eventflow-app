import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'
import { CompleteGoogleRegistrationScreen } from '../screens/auth/CompleteGoogleRegistrationScreen'
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen'
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen'

import { HomeScreen } from '../screens/home/HomeScreen'

import { EventsScreen } from '../screens/events/EventsScreen'
import { EventHomeScreen } from '../screens/events/EventHomeScreen'
import { EventModuleScreen } from '../screens/events/EventModuleScreen'
import { PublicInvitationScreen } from '../screens/events/PublicInvitationScreen'
import { EventStaffScreen } from '../screens/events/EventStaffScreen'
import { StaffScannerScreen } from '../screens/events/StaffScannerScreen'
import { AssistanceQueueScreen, StaffGuestsScreen } from '../screens/events/StaffOperationsScreens'

import { NotificationsScreen } from '../screens/notifications/NotificationsScreen'

import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { PersonalInfoScreen } from '../screens/profile/PersonalInfoScreen'
import { PrivacySecurityScreen } from '../screens/profile/PrivacySecurityScreen'
import { MisPasesScreen } from '../screens/profile/MisPasesScreen'

const linking = {
  prefixes: [
    'eventflow://',
  ],

  config: {
    screens: {
      'Verificar correo': {
        path: 'verify-email',
      },

      'Restablecer contraseña': {
        path: 'reset-password',
      },

      Invitación: {
        path: 'invite/:token',
      },
    },
  },
}

const Stack = createNativeStackNavigator()

export function AppNavigator({
  signedIn,
}: {
  signedIn: boolean
}) {
  return (
    <NavigationContainer
      linking={linking}
    >
      <Stack.Navigator
        initialRouteName={
          signedIn
            ? 'Inicio'
            : 'Login'
        }
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F7F7FA',
          },
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#F7F7FA',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Registro"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="Recuperación"
          component={ForgotPasswordScreen}
        />

        <Stack.Screen
          name="Completar registro Google"
          component={CompleteGoogleRegistrationScreen}
        />

        <Stack.Screen
          name="Verificar correo"
          component={VerifyEmailScreen}
        />

        <Stack.Screen
          name="Restablecer contraseña"
          component={ResetPasswordScreen}
        />

        <Stack.Screen
          name="Inicio"
          component={HomeScreen}
        />

        <Stack.Screen
          name="Eventos"
          component={EventsScreen}
        />

        <Stack.Screen
          name="Inicio del evento"
          component={EventHomeScreen}
        />

        <Stack.Screen
          name="Módulo del evento"
          component={EventModuleScreen}
        />

        <Stack.Screen name="Centro del personal" component={EventStaffScreen} />
        <Stack.Screen name="Escáner de acceso" component={StaffScannerScreen} />
        <Stack.Screen name="Lista de invitados" component={StaffGuestsScreen} />
        <Stack.Screen name="Cola de ayuda" component={AssistanceQueueScreen} />

        <Stack.Screen
          name="Invitación"
          component={PublicInvitationScreen}
          initialParams={{ signedIn }}
        />

        <Stack.Screen
          name="Notificaciones"
          component={NotificationsScreen}
        />

        <Stack.Screen
          name="Perfil"
          component={ProfileScreen}
        />

        <Stack.Screen
          name="Información personal"
          component={PersonalInfoScreen}
        />

        <Stack.Screen
          name="Privacidad y seguridad"
          component={PrivacySecurityScreen}
        />

        <Stack.Screen
          name="Mis pases"
          component={MisPasesScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
