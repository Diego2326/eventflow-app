import {
  createContext,
  useContext,
  useMemo,
} from 'react'

import type { ComponentType } from 'react'

import type {
  RootTabKey,
  TabNavigationState,
} from './types'

const tabRouteKeys: Record<string, RootTabKey> = {
  Inicio: 'home',
  Eventos: 'events',
  Notificaciones: 'notifications',
  Perfil: 'profile',
}

export const TabNavigationContext =
  createContext<TabNavigationState | null>(null)

export function useTabNavigation() {
  return useContext(TabNavigationContext)
}

export function createTabAwareNavigation(
  navigation: any,
  selectTab: (tabKey: RootTabKey) => void,
) {
  return {
    ...navigation,
    navigate: (routeName: string, ...args: any[]) => {
      const tabKey = tabRouteKeys[routeName]

      if (tabKey) {
        if (typeof navigation.popTo === 'function') {
          navigation.popTo('Inicio')
        } else {
          navigation.navigate('Inicio')
        }

        selectTab(tabKey)
        return
      }

      return navigation.navigate(routeName, ...args)
    },
  }
}

export function withTabNavigation<P extends { navigation: any }>(
  Screen: ComponentType<P>,
) {
  function TabAwareScreen(props: P) {
    const tabNavigation = useTabNavigation()

    const navigation = useMemo(() => {
      if (!tabNavigation) {
        return props.navigation
      }

      return createTabAwareNavigation(
        props.navigation,
        tabNavigation.selectTab,
      )
    }, [props.navigation, tabNavigation])

    return <Screen {...props} navigation={navigation} />
  }

  TabAwareScreen.displayName = 'TabAwareScreen'

  return TabAwareScreen
}
