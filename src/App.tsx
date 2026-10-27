import { useEffect, type ReactNode } from 'react'
import { AppShell } from './components/layout/AppShell'
import { routeHref, useRoute, type MoreSection } from './lib/router'
import { ExerciseDetailScreen } from './screens/ExerciseDetailScreen'
import { HomeScreen } from './screens/HomeScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { AboutScreen } from './screens/more/AboutScreen'
import { BandsScreen } from './screens/more/BandsScreen'
import { DataScreen } from './screens/more/DataScreen'
import { FaqScreen } from './screens/more/FaqScreen'
import { MoreScreen } from './screens/more/MoreScreen'
import { NotesScreen } from './screens/more/NotesScreen'
import { PreferencesScreen } from './screens/more/PreferencesScreen'
import { RemindersScreen } from './screens/more/RemindersScreen'
import { ScheduleScreen } from './screens/more/ScheduleScreen'
import { TipsScreen } from './screens/more/TipsScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { RoutinePreviewScreen } from './screens/RoutinePreviewScreen'
import { RoutinesScreen } from './screens/RoutinesScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'
import { IllustrationGallery } from './screens/dev/IllustrationGallery'
import { useAppData } from './state/useAppData'

const MORE_SCREENS: Record<MoreSection, () => ReactNode> = {
  ligas: () => <BandsScreen />,
  horario: () => <ScheduleScreen />,
  preferencias: () => <PreferencesScreen />,
  recordatorios: () => <RemindersScreen />,
  notas: () => <NotesScreen />,
  consejos: () => <TipsScreen />,
  preguntas: () => <FaqScreen />,
  datos: () => <DataScreen />,
  acerca: () => <AboutScreen />,
}

export default function App() {
  const route = useRoute()
  const routeKey = routeHref(route)
  const { data } = useAppData()

  // Al cambiar de pantalla, empezar desde arriba.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [routeKey])

  // Herramienta de desarrollo: no existe en la versión publicada.
  if (import.meta.env.DEV && window.location.hash === '#/dev/ilustraciones') return <IllustrationGallery />

  // Primer uso (o "Repetir configuración inicial"): mostramos el onboarding en lugar de la app.
  if (!data.preferences.onboardingCompleted) return <OnboardingScreen />

  // El entrenamiento guiado ocupa toda la pantalla, sin barra de navegación, para no distraerte.
  if (route.name === 'workout') return <WorkoutScreen key={routeKey} routineId={route.routineId} />

  let screen: ReactNode
  switch (route.name) {
    case 'home':
      screen = <HomeScreen />
      break
    case 'routines':
      screen = <RoutinesScreen />
      break
    case 'routine':
      screen = <RoutinePreviewScreen routineId={route.id} />
      break
    case 'progress':
      screen = <ProgressScreen />
      break
    case 'more':
      screen = <MoreScreen />
      break
    case 'more-section':
      screen = MORE_SCREENS[route.section]()
      break
    case 'exercise':
      screen = <ExerciseDetailScreen routineId={route.routineId} part={route.part} index={route.index} />
      break
  }

  // `key` reinicia el estado local (pestañas, formularios) al cambiar de pantalla.
  return (
    <AppShell route={route}>
      <div key={routeKey}>{screen}</div>
    </AppShell>
  )
}
