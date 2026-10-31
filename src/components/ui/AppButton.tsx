import type { ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { colors, radius, spacing, typography } from '../../theme/tokens'

type AppButtonProps = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  rightContent?: ReactNode
}

export function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  rightContent,
}: AppButtonProps) {
  const isDisabled = disabled || loading
  const isPrimary = variant === 'primary'

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.white : colors.navy900}
        />
      ) : (
        <>
          <Text
            style={[
              styles.label,
              isPrimary
                ? styles.primaryLabel
                : styles.secondaryLabel,
            ]}
          >
            {label}
          </Text>

          {rightContent ? (
            <View style={styles.rightContent}>
              {rightContent}
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  primary: {
    backgroundColor: colors.navy900,
  },

  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },

  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },

  disabled: {
    opacity: 0.55,
  },

  label: {
    ...typography.bodyStrong,
    textAlign: 'center',
  },

  primaryLabel: {
    color: colors.white,
  },

  secondaryLabel: {
    color: colors.navy900,
  },

  rightContent: {
    position: 'absolute',
    right: spacing.sm,
  },
})