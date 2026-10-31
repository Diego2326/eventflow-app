# EventFlow App

Aplicación móvil construida con Expo y React Native. Renderiza la navegación del evento dinámicamente según los módulos habilitados.

```bash
cp .env.example .env
npm install
npm start
```

La app inicia en modo demo sin depender de la API. Usa las credenciales `ana.organizadora@eventflow.demo` / `EventFlowDemo1!`.

Para integrar la API real, crea `.env` desde `.env.example`, define `EXPO_PUBLIC_DEMO_MODE=false` y configura `EXPO_PUBLIC_API_URL` con una URL accesible desde el dispositivo o emulador.

## Funciones para asistentes y personal

- Agenda personal con favoritos, avisos locales y guardado en el calendario del teléfono.
- Búsqueda en el mapa, networking con consentimiento, solicitudes de ayuda y galería compartida.
- Aportes de fotos sujetos a permisos del módulo y moderación; la galería oficial puede publicarse después del evento.
- Centro de personal con lector QR, búsqueda de invitados y seguimiento de solicitudes según los permisos del evento.

Las funciones de cámara, selección de fotos y calendario requieren compilar un nuevo build nativo después de cambiar `app.json`; no funcionan dentro de Expo Go como build de producción. El recordatorio de agenda es local al dispositivo. El token push remoto de Expo todavía no se registra desde la app.

Para guardar fotos, el backend de Cloud Run necesita `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` y `SUPABASE_BUCKET`. El valor predeterminado del bucket es `eventflow`; crea ese bucket privado en Supabase o configura el nombre real en Cloud Run. La app sube las imágenes por la API, no directamente al bucket.
