import { ExerciseFigure } from '../../components/exercise/ExerciseFigure'
import { ILLUSTRATIONS } from '../../data/illustrations'

/** Solo en desarrollo (#/dev/ilustraciones): todas las ilustraciones juntas para revisarlas. */
export function IllustrationGallery() {
  return (
    <main className="grid grid-cols-2 gap-3 p-4">
      {Object.keys(ILLUSTRATIONS).map((id) => (
        <section key={id} className="rounded-2xl bg-white p-2 ring-1 ring-ink-200">
          <h2 className="text-xs font-semibold">{id}</h2>
          <div className="grid grid-cols-2">
            <ExerciseFigure exerciseId={id} frame={0} className="w-full bg-bloom-50" />
            <ExerciseFigure exerciseId={id} frame={1} className="w-full bg-peach-50" />
          </div>
        </section>
      ))}
    </main>
  )
}
