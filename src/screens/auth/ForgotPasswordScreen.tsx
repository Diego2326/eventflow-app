import { useState } from 'react'
import { Pressable, Text, TextInput } from 'react-native'
import { AuthScreenShell } from '../../components/AuthScreenShell'
import { request } from '../../services/api'
import { styles } from '../../theme/styles'
export function ForgotPasswordScreen(){const[email,setEmail]=useState(''),[message,setMessage]=useState('');async function submit(){try{await request('/auth/forgot-password','POST',{email});setMessage('Si la cuenta existe, recibirás instrucciones.')}catch(error){setMessage((error as Error).message)}}return <AuthScreenShell><Text style={styles.title}>Recupera tu acceso</Text><TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none"/><Pressable style={styles.button} onPress={submit}><Text style={styles.buttonText}>Enviar instrucciones</Text></Pressable>{!!message&&<Text style={styles.notice}>{message}</Text>}</AuthScreenShell>}
