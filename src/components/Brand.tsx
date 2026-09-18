import { Image, Text, View } from 'react-native'
import { styles } from '../theme/styles'
export function Brand(){return <View style={styles.logoRow}><Image source={require('../../assets/eventflow-mark.png')} style={styles.logo}/><Text style={styles.brand}>EventFlow</Text></View>}
