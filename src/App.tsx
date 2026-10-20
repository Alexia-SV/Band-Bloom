import { useEffect, type ReactNode } from 'react'
import { AppShell } from './components/layout/AppShell'
import { routeHref, useRoute, type MoreSection } from './lib/router'
import { HomeScreen } from './screens/HomeScreen'
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

  // Al cambiar de pantalla, empezar desde arriba.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [routeKey])

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
  }

  // `key` reinicia el estado local (pestañas, formularios) al cambiar de pantalla.
  return (
    <AppShell route={route}>
      <div key={routeKey}>{screen}</div>
    </AppShell>
  )
}
