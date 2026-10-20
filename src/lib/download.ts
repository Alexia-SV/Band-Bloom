/**
 * Descarga un archivo generado en el navegador. Lanza un error si el navegador no lo permite,
 * para que la pantalla pueda mostrar un mensaje claro.
 */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Damos tiempo al navegador para iniciar la descarga antes de liberar el archivo.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** URL pública de la app (en GitHub Pages incluye /Band-Bloom/). */
export function appUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString()
}
