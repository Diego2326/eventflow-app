import {
  loginWithGoogleToken,
} from './api'

export type GoogleLoginOutcome =
  | {
      status: 'AUTHENTICATED'
    }
  | {
      status:
        'PROFILE_REQUIRED'
      registrationToken: string
      email: string
      name?: string
    }
  | {
      status: 'CANCELLED'
    }

function getGoogleWebClientId() {
  return (
    process.env
      .EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    ''
  ).trim()
}

export function isGoogleConfigured() {
  return Boolean(
    getGoogleWebClientId(),
  )
}

export async function signInWithGoogle(): Promise<
  GoogleLoginOutcome
> {
  const webClientId =
    getGoogleWebClientId()

  if (!webClientId) {
    throw new Error(
      'Google Sign-In todavía no está configurado. Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    )
  }

  /*
   * Importación dinámica:
   * evita cargar el módulo nativo de Google mientras
   * la integración todavía no esté configurada.
   *
   * Cuando se configure Google, esta función deberá
   * ejecutarse desde una Development Build, no Expo Go.
   */
  const google =
    await import(
      '@react-native-google-signin/google-signin'
    )

  const {
    GoogleSignin,
    isSuccessResponse,
  } = google

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  })

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  })

  const response =
    await GoogleSignin.signIn()

  if (
    !isSuccessResponse(response)
  ) {
    return {
      status: 'CANCELLED',
    }
  }

  const idToken =
    response.data.idToken

  if (!idToken) {
    throw new Error(
      'Google no devolvió un ID token. Verifica que EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID sea un Client ID de tipo Web.',
    )
  }

  /*
   * Nunca usamos el access token de Google como sesión
   * de EventFlow. El backend recibe el ID token, lo
   * verifica con Google y devuelve los JWT de EventFlow.
   */
  const result =
    await loginWithGoogleToken(
      idToken,
    )

  if (
    result.status ===
    'PROFILE_REQUIRED'
  ) {
    return {
      status:
        'PROFILE_REQUIRED',
      registrationToken:
        result.registrationToken,
      email: result.email,
      name: result.name,
    }
  }

  return {
    status: 'AUTHENTICATED',
  }
}
