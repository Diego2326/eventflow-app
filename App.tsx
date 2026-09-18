import { ActivityIndicator, View } from 'react-native'
import { useEffect, useState } from 'react'
import { AppNavigator } from './src/navigation/AppNavigator'
import { restore } from './src/services/api'
import { styles } from './src/theme/styles'
export default function App(){const[ready,setReady]=useState(false),[signedIn,setSignedIn]=useState(false);useEffect(()=>{restore().then(value=>{setSignedIn(value);setReady(true)})},[]);if(!ready)return <View style={styles.loading}><ActivityIndicator color="#f56642"/></View>;return <AppNavigator signedIn={signedIn}/>}
