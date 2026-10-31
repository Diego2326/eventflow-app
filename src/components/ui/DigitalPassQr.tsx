import QRCode from 'react-native-qrcode-svg'
import { StyleSheet, View } from 'react-native'

export function DigitalPassQr({
  value,
  size = 188,
}: {
  value: string
  size?: number
}) {
  return (
    <View style={styles.frame}>
      <QRCode
        value={value}
        size={size}
        color="#0B1D3A"
        backgroundColor="#FFFFFF"
        quietZone={8}
        ecl="H"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5EC',
  },
})
