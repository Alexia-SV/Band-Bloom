# Band & Bloom 💜

App web progresiva (PWA) para entrenar fuerza en casa con dos ligas: rosa (Light) y morada (X-Heavy).
Te dice qué toca hoy, sin presión. Funciona sin cuenta (todo en tu teléfono) o con la cuenta de
[Mi Semana](https://alexia-sv.github.io/mi-semana/) para tener tus datos en la nube y en todos tus dispositivos.

## Requisitos

- Node.js 20.19+ o 22.12+ (probado con Node 22.22)
- npm 10+

## Comandos

```bash
npm install        # instalar dependencias (solo la primera vez)
npm run dev        # servidor de desarrollo en http://localhost:5173
npm test           # pruebas unitarias (Vitest)
npm run lint       # revisión de código (oxlint)
npm run typecheck  # revisión de tipos (TypeScript)
npm run build      # compilación de producción en dist/
npm run preview    # servir la compilación de producción localmente
```

> **Nota para Windows:** la carpeta se llama `Band&Bloom`, y `cmd.exe` interpreta el `&` como separador de
> comandos. Por eso los scripts de `package.json` llaman a Node directamente (`node node_modules/vite/bin/vite.js`)
> en lugar de usar los atajos de `node_modules/.bin`. Usa siempre `npm run …`; `npx vite` o `npx tsc` fallan en esta carpeta.

## Publicación en GitHub Pages

La app se publica en **https://alexia-sv.github.io/Band-Bloom/**.

- El workflow `.github/workflows/deploy.yml` corre en cada push a `main`: instala dependencias, ejecuta pruebas y lint, compila y publica `dist/`.
- Requisito (una sola vez): en GitHub, *Settings → Pages → Source* debe estar en **GitHub Actions**.
- `vite.config.ts` usa la ruta base `/Band-Bloom/` al compilar (`npm run build`) y en `npm run preview`; en `npm run dev` se usa la raíz.
- Para referenciar archivos de `public/` desde el código usa `import.meta.env.BASE_URL` (por ejemplo, `${import.meta.env.BASE_URL}favicon.svg`), nunca una ruta que empiece con `/`.
- Puedes ver el estado de cada despliegue en la pestaña *Actions* del repositorio.

## Cuenta y nube (Supabase, compartida con Mi Semana)

- Usa **la misma base de datos y la misma cuenta** que Mi Semana (proyecto `mi-semana` en Supabase). Se entra en *Más → Mis datos* o desde la bienvenida.
- Sin cuenta todo sigue funcionando como antes, solo en el dispositivo.
- Tablas (crear una vez con `supabase/band-and-bloom.sql` en el SQL Editor):
  - `bb_datos`: un documento por persona con ajustes, plan, recordatorios, notas y días de descanso.
  - `bb_sesiones`: una fila por entrenamiento (la fase 5 las guarda con `addSession`).
- `localStorage` sigue siendo la copia local: la app abre al instante y sin internet; los cambios se suben después (`band-and-bloom:data:pendiente-nube`).
- La primera vez que un dispositivo entra a la cuenta se suman sus descansos, notas y sesiones a los de la nube; después la nube manda.
- **Conexión con Mi Semana:** al guardar una sesión completa o marcar "Hoy descanso", se palomea el pendiente *Casa · Ejercicio* en Mi Semana (`src/lib/miSemana.ts`, con pruebas), igual que si lo marcaras allá: con su racha y el siguiente día que le toca. El día cambia a las 4 a. m., como en Mi Semana.

## Ilustraciones de ejercicios

Las imágenes son **dibujos originales en SVG** generados por código, sin fotos externas ni licencias de terceros:

- `src/lib/figure.ts` calcula la figura a partir de ángulos (cinemática directa), así todas tienen las mismas proporciones.
- `src/data/illustrations.ts` describe cada ejercicio con dos posturas (inicio y movimiento) y sus accesorios (liga, pared, silla, tapete).
- `src/components/exercise/ExerciseFigure.tsx` las dibuja. Funcionan sin internet y respetan "reducir movimiento".
- Cada figura lleva top deportivo, leggings, tenis, cabello y sombra; en las miniaturas se ve una silueta clara de la postura inicial para entender el movimiento.
- En desarrollo puedes ver todas juntas en `http://localhost:5173/#/dev/ilustraciones` (no existe en la versión publicada).

## Íconos y fotos

- **Emoji 3D:** [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (licencia MIT, copia en `src/assets/emoji/LICENSE-fluent-emoji.txt`). Reducidos a 128 px en WebP (~75 KB en total) y declarados en `src/data/emoji.ts`.
- **Fotos de portada:** 5 fotos de [Pexels](https://www.pexels.com/license/) (uso gratuito, sin atribución obligatoria; igual damos crédito en *Sobre la app*). Están en `src/assets/covers/` como WebP (~205 KB en total) y sus autores y enlaces en `src/data/covers.ts`.
- Todo se incluye en la app (no se carga de internet), así funcionará sin conexión cuando la PWA esté lista.

## App instalable y sin internet

- `vite-plugin-pwa` (en `vite.config.ts`) genera el manifest y un service worker que guarda todo lo de la app: código, fuentes, fotos, emoji e ilustraciones (~1 MB). Los datos de Supabase siempre van a la red.
- Instalar en iPhone: Safari → Compartir → *Agregar a pantalla de inicio*. También está en Más → Preguntas frecuentes.
- `registerType: prompt`: cuando hay versión nueva aparece "Hay una versión nueva · Actualizar" (`src/components/layout/UpdatePrompt.tsx`); no se recarga sola a medio entrenamiento.
- Ícono: una flor que crece desde la liga, sobre degradado morado. `public/favicon.svg` es el original; los PNG (`pwa-192`, `pwa-512`, `maskable-512`, `apple-touch-icon`) son el mismo dibujo.
- El service worker solo funciona en la versión compilada (`npm run build` + `npm run preview`) o publicada, no en `npm run dev`.

## Entrenamiento guiado

- Ruta `#/rutinas/<id>/entrenar` (botón *Empezar rutina* y *Comenzar* en Inicio). Ocupa toda la pantalla, sin barra de navegación, y mantiene la pantalla encendida.
- `src/lib/workout.ts` arma el recorrido (con pruebas): calentamiento seguido, luego cada serie con su descanso (el de cada ejercicio, por ejemplo 60–90 s) y sin descanso al final. La movilidad no lleva descansos.
- El descanso arranca solo y, al terminar, pasa a la siguiente serie. Se puede saltar, regresar con *Anterior* o terminar antes.
- El avance se guarda en `band-and-bloom:data:entreno`: si sales de la app (en iPhone pasa seguido) se retoma al volver, hasta 3 horas después.
- Al terminar se guarda la sesión con `addSession` (`completed` o `ended-early` si terminas antes con al menos una serie). Con cuenta se sube a `bb_sesiones` y se palomea *Hacer ejercicio* en Mi Semana. El día de la sesión cambia a las 4 a. m.

## Temporizador de ejercicios

- `src/lib/timer.ts` convierte el objetivo escrito en fases exactas: "30 s por lado" → 2 × 30 s; "15 s por dirección, cada pie" → 4 × 15 s; "20 s atrás + 20 s adelante" → 2 fases.
- Los ejercicios por repeticiones muestran el **descanso entre series** (por ejemplo, 60 o 90 s).
- El conteo se basa en la hora de término, así no se desfasa si el teléfono pausa la pestaña. Incluye 3 s para prepararte, pausa, reiniciar, saltar, sonido opcional y pantalla encendida mientras corre (si el navegador lo permite).

## Recordatorios: qué funciona y qué no

| Tipo | ¿Funciona con la app cerrada? | Cómo |
|---|---|---|
| Aviso dentro de la app | No | Aparece en Inicio si abres la app después de tu hora y hoy no hay actividad |
| Evento de calendario (.ics) | Sí | Más → Recordatorios → «Agregar a mi calendario». Avisa la app Calendario del teléfono |
| Automatización en Atajos (iPhone) | Sí | Instrucciones en Más → Recordatorios |
| Notificaciones push de la app | — | No implementadas: requieren un servidor (posible etapa extra) |

## Stack

| Pieza | Para qué |
|---|---|
| React 19 + TypeScript | Interfaz y tipos |
| Vite 8 | Servidor de desarrollo y compilación |
| Tailwind CSS 4 | Estilos con design tokens (`src/index.css`) |
| Lucide React | Íconos |
| Plus Jakarta Sans (Fontsource) | Tipografía, empaquetada localmente para funcionar sin internet |
| vite-plugin-pwa | Manifest, íconos y service worker (app instalable y sin internet) |
| Vitest | Pruebas de la lógica |
| Supabase (supabase-js) | Cuenta y datos en la nube, compartidos con Mi Semana |

## Estructura

```
src/
├── App.tsx                 # Elige la pantalla según la ruta
├── main.tsx                # Punto de entrada
├── index.css               # Tailwind + design tokens (colores, radios, sombras)
├── types/                  # Tipos de datos: Routine, WorkoutSession, AppData…
├── data/                   # Datos fijos: ejercicios, rutinas, plan semanal, frases
├── lib/
│   ├── dates.ts            # Fechas locales 'YYYY-MM-DD' y semana lunes–domingo
│   ├── recommendation.ts   # Decide qué recomendar hoy (función pura, con pruebas)
│   ├── storage.ts          # Lectura/escritura segura en localStorage (copia local)
│   ├── supabase.ts         # Cliente de Supabase (mismo proyecto que Mi Semana)
│   ├── cloud.ts            # Subir/traer datos de la nube y palomear el ejercicio en Mi Semana
│   ├── sync.ts             # Cómo se juntan la nube y el dispositivo (funciones puras, con pruebas)
│   ├── miSemana.ts         # Reglas de Mi Semana: día a las 4 a. m. y pendientes que se repiten (con pruebas)
│   ├── reminders.ts        # Cuándo mostrar el aviso y archivo .ics del calendario (con pruebas)
│   ├── onboarding.ts       # Días elegidos → plan semanal
│   ├── download.ts         # Descarga de archivos generados en el navegador
│   ├── progress.ts         # Estadísticas, calendario e historial (funciones puras, con pruebas)
│   ├── router.ts           # Router mínimo basado en #hash
│   ├── id.ts               # IDs únicos
│   └── tones.ts            # Clases de color por tono
├── state/                  # Contexto de datos de la app y hooks
├── components/
│   ├── ui/                 # Card, pestañas, encabezado, filas, estado vacío, botones…
│   ├── layout/             # AppShell y barra de navegación
│   ├── home/               # Piezas de la pantalla Inicio
│   ├── routines/           # Tarjeta de rutina
│   └── progress/           # Calendario, gráfica de constancia, historial
└── screens/                # Pantallas completas (more/ = subpantallas de "Más")
```

## Decisiones técnicas

- **Router por hash** (`#/rutinas`): no hace falta una librería ni configurar el servidor, y funciona igual sin conexión.
- **localStorage con validación** (también como copia local cuando hay cuenta): si los datos guardados están dañados, la app no se rompe. Guarda un respaldo y empieza de cero avisándote.
- **La recomendación es una función pura** (`buildDashboard`): recibe datos y fecha, y devuelve qué mostrar. Por eso se puede probar sin navegador.
- **Fechas locales**: los días se guardan como `YYYY-MM-DD` según tu zona horaria, no en UTC, para que un entrenamiento a las 11 p. m. no aparezca en el día siguiente. Además el día cambia a las **4 a. m.** (igual que en Mi Semana, `dayOf` en `dates.ts`): entrenar o marcar descanso a las 12:30 a. m. cuenta para el día anterior.

## Estado por etapas

- [x] Etapa 1: proyecto, arquitectura y pantalla Inicio funcional
- [x] Etapa 2: sistema de diseño completo y pantallas Rutinas, Progreso y Más
- [x] Etapa 3: base de ejercicios con instrucciones, ilustraciones originales y calentamiento por rutina
- [x] Etapa 4: entrenamiento guiado (series, descansos, pausa)
- [x] Etapa 5: guardar sesiones de entrenamiento (en el dispositivo y, con cuenta, en Supabase)
- [x] Etapa 6: PWA instalable y offline
- [x] Etapa 7: recordatorios (aviso dentro de la app, evento de calendario .ics, guía de Atajos) y onboarding
- [ ] Etapa 8: verificación final y guía de instalación
