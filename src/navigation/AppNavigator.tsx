import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen'
import { VerifyAccountScreen } from '../screens/auth/VerifyAccountScreen'
import { CreateEventScreen } from '../screens/events/CreateEventScreen'
import { EventHomeScreen } from '../screens/events/EventHomeScreen'
import { EventsScreen } from '../screens/events/EventsScreen'
import { ModuleManagementScreen } from '../screens/events/ModuleManagementScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import type { EventItem } from '../types/events'

export type RootStackParamList = {
  Login: undefined
  Registro: undefined
  Recuperación: undefined
  'Verificar cuenta': undefined
  'Restablecer contraseña': undefined
  Eventos: undefined
  Perfil: undefined
  'Crear evento': undefined
  'Inicio del evento': { event: EventItem }
  'Gestionar módulos': { event: EventItem }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function AppNavigator({ signedIn }: { signedIn: boolean }) {
  return <NavigationContainer><Stack.Navigator initialRouteName={signedIn ? 'Eventos' : 'Login'} screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: '#f5f1e9' }, headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: '#f5f1e9' } }}>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Registro" component={RegisterScreen} />
    <Stack.Screen name="Recuperación" component={ForgotPasswordScreen} />
    <Stack.Screen name="Verificar cuenta" component={VerifyAccountScreen} />
    <Stack.Screen name="Restablecer contraseña" component={ResetPasswordScreen} />
    <Stack.Screen name="Eventos" component={EventsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Perfil" component={ProfileScreen} />
    <Stack.Screen name="Crear evento" component={CreateEventScreen} />
    <Stack.Screen name="Inicio del evento" component={EventHomeScreen} />
    <Stack.Screen name="Gestionar módulos" component={ModuleManagementScreen} />
  </Stack.Navigator></NavigationContainer>
}
