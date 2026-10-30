import { Image, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/tokens'

type BrandProps = {
  variant?: 'dark' | 'light'
}

export function Brand({
  variant = 'dark',
}: BrandProps) {
  const light = variant === 'light'

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/eventflow-mark.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text
        style={[
          styles.name,
          light
            ? styles.nameLight
            : styles.nameDark,
        ]}
      >
        EventFlow
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  logo: {
    width: 42,
    height: 42,
  },

  name: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.9,
  },

  nameDark: {
    color: colors.navy900,
  },

  nameLight: {
    color: colors.white,
  },
})