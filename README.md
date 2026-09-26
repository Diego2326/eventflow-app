# EventFlow App

Aplicación móvil para invitados de EventFlow, construida con Expo SDK 55 y React Native. Está conectada por defecto al backend desplegado en Cloud Run y conserva un modo demo opcional.

## Funcionalidad disponible

- Acceso sin cuenta mediante código o enlace de invitación y deep link `eventflow://invite/:token`.
- Inicio personalizado con datos del evento y módulos habilitados por el anfitrión.
- Confirmación de asistencia y registro de acompañantes según el cupo autorizado.
- Event Pass con QR, estado de RSVP, mesa, asiento, sector e ingresos registrados.
- Agenda con “ahora/siguiente”, avisos segmentados, mapa y solicitud de asistencia.
- Barra inferior nativa (`UITabBarController` en iOS) para Inicio, Pase, Agenda y Ayuda.

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

Para trabajar sin API, cambia `EXPO_PUBLIC_DEMO_MODE=true`; cualquier código abre la experiencia demo. En el backend desplegado, el token del evento sembrado es `demo-sofia-2026`.

## iOS

El proyecto nativo está generado en `ios/`, usa el bundle identifier `com.eventflow-supabase.app` e incluye `Podfile.lock`.

```bash
npm install
cd ios && pod install && cd ..
xcodebuild -workspace ios/EventFlow.xcworkspace -scheme EventFlow -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

Si cambias iconos, plugins o propiedades nativas de `app.json`, sincroniza de nuevo con `npx expo prebuild --platform ios`.

Expo SDK 55 es compatible con Xcode 26.3. El proyecto y los Pods se verifican con una compilación para dispositivo físico en modo build-only; la validación no abre ni ejecuta el simulador.

## Verificaciones

```bash
npm run typecheck
npx expo-doctor
npx expo export --platform web
```

En web, el backend debe permitir por CORS el origen desde el que se sirva la aplicación. iOS y Android no dependen de CORS del navegador.
