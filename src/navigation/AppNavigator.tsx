import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'

import { MainTabs } from './MainTabs'
import { TabNavigationContext, withTabNavigation } from './TabNavigationContext'
import type { RootTabKey, TabNavigationState } from './types'
import type { NativeSyntheticEvent } from 'react-native'
import type {
  TabSelectedEvent,
  TabsHostNavStateRequest,
} from 'react-native-screens'

import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'
import { CompleteGoogleRegistrationScreen } from '../screens/auth/CompleteGoogleRegistrationScreen'
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen'
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen'

import { EventHomeScreen } from '../screens/events/EventHomeScreen'
import { EventModuleScreen } from '../screens/events/EventModuleScreen'
import { PublicInvitationScreen } from '../screens/events/PublicInvitationScreen'
import { EventStaffScreen } from '../screens/events/EventStaffScreen'
import { StaffScannerScreen } from '../screens/events/StaffScannerScreen'
import { AssistanceQueueScreen, StaffGuestsScreen } from '../screens/events/StaffOperationsScreens'

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

const LoginRoute = withTabNavigation(LoginScreen)
const RegisterRoute = withTabNavigation(RegisterScreen)
const ForgotPasswordRoute = withTabNavigation(ForgotPasswordScreen)
const CompleteGoogleRegistrationRoute = withTabNavigation(CompleteGoogleRegistrationScreen)
const VerifyEmailRoute = withTabNavigation(VerifyEmailScreen)
const ResetPasswordRoute = withTabNavigation(ResetPasswordScreen)
const EventHomeRoute = withTabNavigation(EventHomeScreen)
const EventModuleRoute = withTabNavigation(EventModuleScreen)
const EventStaffRoute = withTabNavigation(EventStaffScreen)
const StaffScannerRoute = withTabNavigation(StaffScannerScreen)
const StaffGuestsRoute = withTabNavigation(StaffGuestsScreen)
const AssistanceQueueRoute = withTabNavigation(AssistanceQueueScreen)
const PublicInvitationRoute = withTabNavigation(PublicInvitationScreen)
const PersonalInfoRoute = withTabNavigation(PersonalInfoScreen)
const PrivacySecurityRoute = withTabNavigation(PrivacySecurityScreen)
const MisPasesRoute = withTabNavigation(MisPasesScreen)

export function AppNavigator({
  signedIn,
}: {
  signedIn: boolean
}) {
  const [navStateRequest, setNavStateRequest] = useState<TabsHostNavStateRequest>({
    selectedScreenKey: 'home',
    baseProvenance: 0,
  })

  const onTabSelected = useCallback((
    event: NativeSyntheticEvent<TabSelectedEvent>,
  ) => {
    const { selectedScreenKey, provenance } = event.nativeEvent
    setNavStateRequest({
      selectedScreenKey,
      baseProvenance: provenance,
    })
  }, [])

  const selectTab = useCallback((tabKey: RootTabKey) => {
    setNavStateRequest(current => ({
      selectedScreenKey: tabKey,
      baseProvenance: current.baseProvenance,
    }))
  }, [])

  const tabNavigation: TabNavigationState = {
    navStateRequest,
    onTabSelected,
    selectTab,
  }

  return (
    <TabNavigationContext.Provider value={tabNavigation}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName={signedIn ? 'Inicio' : 'Login'}
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
          component={LoginRoute}
        />

        <Stack.Screen
          name="Registro"
          component={RegisterRoute}
        />

        <Stack.Screen
          name="Recuperación"
          component={ForgotPasswordRoute}
        />

        <Stack.Screen
          name="Completar registro Google"
          component={CompleteGoogleRegistrationRoute}
        />

        <Stack.Screen
          name="Verificar correo"
          component={VerifyEmailRoute}
        />

        <Stack.Screen
          name="Restablecer contraseña"
          component={ResetPasswordRoute}
        />

        <Stack.Screen
          name="Inicio"
          component={MainTabs}
        />

        <Stack.Screen
          name="Inicio del evento"
          component={EventHomeRoute}
        />

        <Stack.Screen
          name="Módulo del evento"
          component={EventModuleRoute}
        />

        <Stack.Screen name="Centro del personal" component={EventStaffRoute} />
        <Stack.Screen name="Escáner de acceso" component={StaffScannerRoute} />
        <Stack.Screen name="Lista de invitados" component={StaffGuestsRoute} />
        <Stack.Screen name="Cola de ayuda" component={AssistanceQueueRoute} />

        <Stack.Screen
          name="Invitación"
          component={PublicInvitationRoute}
          initialParams={{ signedIn }}
        />

        <Stack.Screen
          name="Información personal"
          component={PersonalInfoRoute}
        />

        <Stack.Screen
          name="Privacidad y seguridad"
          component={PrivacySecurityRoute}
        />

        <Stack.Screen
          name="Mis pases"
          component={MisPasesRoute}
        />
        </Stack.Navigator>
      </NavigationContainer>
    </TabNavigationContext.Provider>
  )
}
