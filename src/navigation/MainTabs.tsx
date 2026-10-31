import { useMemo } from 'react'
import {
  Tabs,
} from 'react-native-screens'

import { HomeScreen } from '../screens/home/HomeScreen'
import { EventsScreen } from '../screens/events/EventsScreen'
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import {
  createTabAwareNavigation,
  useTabNavigation,
} from './TabNavigationContext'

const PURPLE = '#6848E7'
const TAB_BACKGROUND = '#F7F7FA'
const MUTED = '#747C8E'

const androidAppearance = {
  tabBarBackgroundColor: TAB_BACKGROUND,
  tabBarItemActiveIndicatorColor: '#F0EDFF',
  tabBarItemLabelVisibilityMode: 'labeled' as const,
  selected: {
    tabBarItemTitleFontColor: PURPLE,
    tabBarItemIconColor: PURPLE,
  },
  normal: {
    tabBarItemTitleFontColor: MUTED,
    tabBarItemIconColor: MUTED,
  },
}

export function MainTabs({ navigation }: { navigation: any }) {
  const tabNavigation = useTabNavigation()

  const screenNavigation = useMemo(() => {
    if (!tabNavigation) {
      return navigation
    }

    return createTabAwareNavigation(navigation, tabNavigation.selectTab)
  }, [navigation, tabNavigation])

  return (
    <Tabs.Host
      navStateRequest={tabNavigation?.navStateRequest ?? {
        selectedScreenKey: 'home',
        baseProvenance: 0,
      }}
      onTabSelected={tabNavigation?.onTabSelected}
      nativeContainerStyle={{ backgroundColor: TAB_BACKGROUND }}
      ios={{
        tabBarTintColor: PURPLE,
        tabBarMinimizeBehavior: 'onScrollDown',
        tabBarControllerMode: 'automatic',
      }}
      android={{
        tabBarRespectsIMEInsets: true,
      }}
    >
      <Tabs.Screen
        screenKey="home"
        title="Inicio"
        accessibilityLabel="Inicio"
        ios={{ icon: { type: 'sfSymbol', name: 'house.fill' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        <HomeScreen navigation={screenNavigation} />
      </Tabs.Screen>

      <Tabs.Screen
        screenKey="events"
        title="Eventos"
        accessibilityLabel="Eventos"
        ios={{ icon: { type: 'sfSymbol', name: 'calendar' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        <EventsScreen navigation={screenNavigation} />
      </Tabs.Screen>

      <Tabs.Screen
        screenKey="notifications"
        title="Avisos"
        accessibilityLabel="Notificaciones"
        ios={{ icon: { type: 'sfSymbol', name: 'bell' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        <NotificationsScreen navigation={screenNavigation} />
      </Tabs.Screen>

      <Tabs.Screen
        screenKey="profile"
        title="Perfil"
        accessibilityLabel="Perfil"
        ios={{ icon: { type: 'sfSymbol', name: 'person.crop.circle' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        <ProfileScreen navigation={screenNavigation} />
      </Tabs.Screen>
    </Tabs.Host>
  )
}
