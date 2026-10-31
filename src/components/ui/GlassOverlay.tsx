import type { ColorValue, StyleProp, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'
import { GlassView } from 'expo-glass-effect'

type GlassOverlayProps = {
  style?: StyleProp<ViewStyle>
  tintColor?: ColorValue
  fallbackColor?: ColorValue
  effectStyle?: 'regular' | 'clear'
  interactive?: boolean
}

/** Decorative liquid-glass layer for controls; keeps the control itself tappable. */
export function GlassOverlay({
  style,
  tintColor = 'rgba(255,255,255,0.4)',
  fallbackColor = 'rgba(255,255,255,0.76)',
  effectStyle = 'regular',
  interactive = false,
}: GlassOverlayProps) {
  return (
    <GlassView
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style, { backgroundColor: fallbackColor }]}
      glassEffectStyle={effectStyle}
      tintColor={tintColor}
      isInteractive={interactive}
    />
  )
}
