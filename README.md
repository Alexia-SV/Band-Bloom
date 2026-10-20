# Band & Bloom 💜

App web progresiva (PWA) para entrenar fuerza en casa con dos ligas: rosa (Light) y morada (X-Heavy).
Te dice qué toca hoy, sin presión, sin cuentas y sin enviar tus datos a ningún lado.

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

## Ilustraciones de ejercicios

Las imágenes son **dibujos originales en SVG** generados por código, sin fotos externas ni licencias de terceros:

- `src/lib/figure.ts` calcula la figura a partir de ángulos (cinemática directa), así todas tienen las mismas proporciones.
- `src/data/illustrations.ts` describe cada ejercicio con dos posturas (inicio y movimiento) y sus accesorios (liga, pared, silla, tapete).
- `src/components/exercise/ExerciseFigure.tsx` las dibuja. Funcionan sin internet y respetan "reducir movimiento".
- En desarrollo puedes ver todas juntas en `http://localhost:5173/#/dev/ilustraciones` (no existe en la versión publicada).

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
| vite-plugin-pwa | Manifest y service worker (se configura en la Etapa 6) |
| Vitest | Pruebas de la lógica |

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
│   ├── storage.ts          # Lectura/escritura segura en localStorage
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
- **localStorage con validación**: si los datos guardados están dañados, la app no se rompe. Guarda un respaldo y empieza de cero avisándote.
- **La recomendación es una función pura** (`buildDashboard`): recibe datos y fecha, y devuelve qué mostrar. Por eso se puede probar sin navegador.
- **Fechas locales**: los días se guardan como `YYYY-MM-DD` según tu zona horaria, no en UTC, para que un entrenamiento a las 11 p. m. no aparezca en el día siguiente.

## Estado por etapas

- [x] Etapa 1: proyecto, arquitectura y pantalla Inicio funcional
- [x] Etapa 2: sistema de diseño completo y pantallas Rutinas, Progreso y Más
- [x] Etapa 3: base de ejercicios con instrucciones, ilustraciones originales y calentamiento por rutina
- [ ] Etapa 4: entrenamiento guiado (series, descansos, pausa)
- [ ] Etapa 5: guardar sesiones de entrenamiento (la pantalla de progreso y la exportación JSON ya existen)
- [ ] Etapa 6: PWA instalable y offline
- [x] Etapa 7: recordatorios (aviso dentro de la app, evento de calendario .ics, guía de Atajos) y onboarding
- [ ] Etapa 8: verificación final y guía de instalación
