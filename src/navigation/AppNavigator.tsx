import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable'
import { Platform } from 'react-native'
import { GuestAccessScreen } from '../screens/guest/GuestAccessScreen'
import { GuestHomeScreen } from '../screens/guest/GuestHomeScreen'
import { RsvpScreen } from '../screens/guest/RsvpScreen'
import { EventPassScreen } from '../screens/guest/EventPassScreen'
import { AgendaScreen } from '../screens/guest/AgendaScreen'
import { NotificationsScreen } from '../screens/guest/NotificationsScreen'
import { AssistanceScreen } from '../screens/guest/AssistanceScreen'
import { MapScreen } from '../screens/guest/MapScreen'
import { GuestEventsScreen } from '../screens/guest/GuestEventsScreen'

export type RootStackParamList = {
  Invitación: { token?: string } | undefined
  Eventos: undefined
  Inicio: undefined
  'Confirmar asistencia': undefined
  'Event Pass': undefined
  Agenda: undefined
  Avisos: undefined
  Asistencia: undefined
  Mapa: undefined
}

export type GuestTabParamList = {
  Resumen: undefined
  Pase: undefined
  Programa: undefined
  Ayuda: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createNativeBottomTabNavigator<GuestTabParamList>()

const tabIcon = (name: 'house.fill' | 'qrcode' | 'calendar' | 'hand.raised.fill') => Platform.OS === 'ios'
  ? { type: 'sfSymbol' as const, name }
  : { type: 'image' as const, source: require('../../assets/eventflow-mark.png') }

function GuestTabs() {
  return <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#f56642' }}>
    <Tab.Screen name="Resumen" component={GuestHomeScreen} options={{ tabBarLabel: 'Inicio', tabBarIcon: tabIcon('house.fill') }} />
    <Tab.Screen name="Pase" component={EventPassScreen} options={{ tabBarLabel: 'Pase', tabBarIcon: tabIcon('qrcode') }} />
    <Tab.Screen name="Programa" component={AgendaScreen} options={{ tabBarLabel: 'Agenda', tabBarIcon: tabIcon('calendar') }} />
    <Tab.Screen name="Ayuda" component={AssistanceScreen} options={{ tabBarLabel: 'Ayuda', tabBarIcon: tabIcon('hand.raised.fill') }} />
  </Tab.Navigator>
}

export function AppNavigator({ hasInvitations }: { hasInvitations: boolean }) {
  const linking = { prefixes: ['eventflow://'], config: { screens: { Invitación: 'invite/:token' } } }
  return <NavigationContainer linking={linking}><Stack.Navigator initialRouteName={hasInvitations ? 'Eventos' : 'Invitación'} screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: '#f5f1e9' }, headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: '#f5f1e9' } }}>
    <Stack.Screen name="Invitación" component={GuestAccessScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Eventos" component={GuestEventsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Inicio" component={GuestTabs} options={{ headerShown: false }} />
    <Stack.Screen name="Confirmar asistencia" component={RsvpScreen} />
    <Stack.Screen name="Event Pass" component={EventPassScreen} />
    <Stack.Screen name="Agenda" component={AgendaScreen} />
    <Stack.Screen name="Avisos" component={NotificationsScreen} />
    <Stack.Screen name="Asistencia" component={AssistanceScreen} />
    <Stack.Screen name="Mapa" component={MapScreen} />
  </Stack.Navigator></NavigationContainer>
}
