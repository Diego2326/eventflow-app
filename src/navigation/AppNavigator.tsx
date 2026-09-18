import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'
import { EventsScreen } from '../screens/events/EventsScreen'
import { EventHomeScreen } from '../screens/events/EventHomeScreen'
const Stack=createNativeStackNavigator()
export function AppNavigator({signedIn}:{signedIn:boolean}){return <NavigationContainer><Stack.Navigator initialRouteName={signedIn?'Eventos':'Login'} screenOptions={{headerShadowVisible:false,headerStyle:{backgroundColor:'#f5f1e9'},headerTitleStyle:{fontWeight:'700'}}}><Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/><Stack.Screen name="Registro" component={RegisterScreen}/><Stack.Screen name="Recuperación" component={ForgotPasswordScreen}/><Stack.Screen name="Eventos" component={EventsScreen} options={{headerShown:false}}/><Stack.Screen name="Inicio del evento" component={EventHomeScreen}/></Stack.Navigator></NavigationContainer>}
