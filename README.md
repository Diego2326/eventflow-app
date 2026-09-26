# EventFlow App

Aplicación móvil de EventFlow construida con Expo SDK 55 y React Native. Está conectada por defecto al backend desplegado en Cloud Run y conserva un modo demo opcional.

## Funcionalidad disponible

- Registro, inicio de sesión, verificación de cuenta y recuperación/restablecimiento de contraseña.
- Persistencia segura de access y refresh tokens, restauración de sesión y renovación automática.
- Lista, creación, detalle y cambio de estado de eventos.
- Navegación dinámica y administración de módulos por evento.
- Consulta y edición del perfil, preferencias, contraseña y desactivación de cuenta.

## Ejecutar el proyecto

```bash
cp .env.example .env
npm install
npm start
```

La configuración incluida usa:

```text
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_API_URL=https://eventflow-backend-990072178406.us-east4.run.app/api
```

Para trabajar sin API, cambia `EXPO_PUBLIC_DEMO_MODE=true`. Las credenciales del modo demo son `ana.organizadora@eventflow.demo` / `EventFlowDemo1!`.

## iOS

El proyecto nativo está generado en `ios/`, usa el bundle identifier `com.eventflow.app` e incluye `Podfile.lock`.

```bash
npm install
cd ios && pod install && cd ..
npm run ios
```

Si cambias iconos, plugins o propiedades nativas de `app.json`, sincroniza de nuevo con `npx expo prebuild --platform ios`.

Expo SDK 55 es compatible con Xcode 26.3. El proyecto y los Pods fueron verificados con una compilación completa para iOS Simulator en modo build-only; la validación no abre ni ejecuta el simulador.

## Verificaciones

```bash
npm run typecheck
npx expo-doctor
npx expo export --platform web
```

En web, el backend debe permitir por CORS el origen desde el que se sirva la aplicación. iOS y Android no dependen de CORS del navegador.
