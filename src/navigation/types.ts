import type { NativeSyntheticEvent } from 'react-native'
import type {
  TabSelectedEvent,
  TabsHostNavStateRequest,
} from 'react-native-screens'

export type RootTabKey =
  | 'home'
  | 'events'
  | 'notifications'
  | 'profile'

export type TabNavigationState = {
  navStateRequest: TabsHostNavStateRequest
  onTabSelected: (
    event: NativeSyntheticEvent<TabSelectedEvent>,
  ) => void
  selectTab: (tabKey: RootTabKey) => void
}
