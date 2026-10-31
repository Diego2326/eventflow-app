# EventFlow App

Aplicación móvil construida con Expo y React Native. Renderiza la navegación del evento dinámicamente según los módulos habilitados.

```bash
cp .env.example .env
npm install
npm start
```

La app inicia en modo demo sin depender de la API. Usa las credenciales `ana.organizadora@eventflow.demo` / `EventFlowDemo1!`.

Para integrar la API real, crea `.env` desde `.env.example`, define `EXPO_PUBLIC_DEMO_MODE=false` y configura `EXPO_PUBLIC_API_URL` con una URL accesible desde el dispositivo o emulador.
