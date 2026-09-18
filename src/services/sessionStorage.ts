import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const WEB_PREFIX = 'eventflow.'

function webStorage(): Storage | null {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage
}

export const sessionStorage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return webStorage()?.getItem(WEB_PREFIX + key) ?? null
    return SecureStore.getItemAsync(key)
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage()?.setItem(WEB_PREFIX + key, value)
      return
    }
    await SecureStore.setItemAsync(key, value)
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage()?.removeItem(WEB_PREFIX + key)
      return
    }
    await SecureStore.deleteItemAsync(key)
  },
}
