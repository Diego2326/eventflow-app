import { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { TextInputProps } from 'react-native'
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme/tokens'

type AppTextFieldProps = TextInputProps & {
  label: string
  error?: string
}

export function AppTextField({
  label,
  error,
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}: AppTextFieldProps) {
  const [focused, setFocused] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const isPassword = Boolean(secureTextEntry)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={
            isPassword ? !passwordVisible : false
          }
          onFocus={event => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={event => {
            setFocused(false)
            onBlur?.(event)
          }}
        />

        {isPassword ? (
          <Pressable
            onPress={() =>
              setPasswordVisible(value => !value)
            }
            hitSlop={10}
            style={styles.passwordAction}
          >
            <Text style={styles.passwordActionText}>
              {passwordVisible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  inputContainerFocused: {
    backgroundColor: colors.white,
    borderColor: colors.coral600,
  },

  inputContainerError: {
    borderColor: colors.danger,
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: 15,
  },

  passwordAction: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  passwordActionText: {
    color: colors.coral600,
    fontSize: 12,
    fontWeight: '700',
  },

  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
})