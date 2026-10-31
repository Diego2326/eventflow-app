import { memo, useCallback, useMemo, useState } from 'react'
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

const HomeTabScreen = memo(HomeScreen)
const EventsTabScreen = memo(EventsScreen)
const NotificationsTabScreen = memo(NotificationsScreen)
const ProfileTabScreen = memo(ProfileScreen)

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
  const selectedScreenKey =
    tabNavigation?.navStateRequest.selectedScreenKey ?? 'home'
  const selectTab = tabNavigation?.selectTab
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(
    () => new Set(['home']),
  )

  const markTabLoaded = useCallback((screenKey: string) => {
    setLoadedTabs(current => {
      if (current.has(screenKey)) return current
      const next = new Set(current)
      next.add(screenKey)
      return next
    })
  }, [])

  const screenNavigation = useMemo(() => {
    if (!selectTab) {
      return navigation
    }

    return createTabAwareNavigation(navigation, selectTab)
  }, [navigation, selectTab])

  const showTab = (screenKey: string) =>
    selectedScreenKey === screenKey || loadedTabs.has(screenKey)

  const loadHome = useCallback(() => markTabLoaded('home'), [markTabLoaded])
  const loadEvents = useCallback(() => markTabLoaded('events'), [markTabLoaded])
  const loadNotifications = useCallback(
    () => markTabLoaded('notifications'),
    [markTabLoaded],
  )
  const loadProfile = useCallback(() => markTabLoaded('profile'), [markTabLoaded])

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
        onWillAppear={loadHome}
        ios={{ icon: { type: 'sfSymbol', name: 'house.fill' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        {showTab('home') ? <HomeTabScreen navigation={screenNavigation} /> : null}
      </Tabs.Screen>

      <Tabs.Screen
        screenKey="events"
        title="Eventos"
        accessibilityLabel="Eventos"
        onWillAppear={loadEvents}
        ios={{ icon: { type: 'sfSymbol', name: 'calendar' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        {showTab('events') ? <EventsTabScreen navigation={screenNavigation} /> : null}
      </Tabs.Screen>

      <Tabs.Screen
        screenKey="notifications"
        title="Avisos"
        accessibilityLabel="Notificaciones"
        onWillAppear={loadNotifications}
        ios={{ icon: { type: 'sfSymbol', name: 'bell' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        {showTab('notifications') ? <NotificationsTabScreen navigation={screenNavigation} /> : null}
      </Tabs.Screen>

      <Tabs.Screen
        screenKey="profile"
        title="Perfil"
        accessibilityLabel="Perfil"
        onWillAppear={loadProfile}
        ios={{ icon: { type: 'sfSymbol', name: 'person.crop.circle' } }}
        android={{ standardAppearance: androidAppearance }}
      >
        {showTab('profile') ? <ProfileTabScreen navigation={screenNavigation} /> : null}
      </Tabs.Screen>
    </Tabs.Host>
  )
}
