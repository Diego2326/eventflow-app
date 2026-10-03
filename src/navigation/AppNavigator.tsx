import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'

import { HomeScreen } from '../screens/home/HomeScreen'

import { EventsScreen } from '../screens/events/EventsScreen'
import { EventHomeScreen } from '../screens/events/EventHomeScreen'

import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { PersonalInfoScreen } from '../screens/profile/PersonalInfoScreen'
import { PrivacySecurityScreen } from '../screens/profile/PrivacySecurityScreen'

const Stack = createNativeStackNavigator()

export function AppNavigator({
  signedIn,
}: {
  signedIn: boolean
}) {
  return (
    <NavigationContainer>
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
        {/* AUTENTICACIÓN */}

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

        {/* INICIO */}

        <Stack.Screen
          name="Inicio"
          component={HomeScreen}
        />

        {/* EVENTOS */}

        <Stack.Screen
          name="Eventos"
          component={EventsScreen}
        />

        <Stack.Screen
          name="Inicio del evento"
          component={EventHomeScreen}
        />

        {/* PERFIL */}

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
      </Stack.Navigator>
    </NavigationContainer>
  )
}