import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UpdatePrompt } from './components/layout/UpdatePrompt.tsx'
import { trackHistoryDepth } from './lib/router.ts'
import { AppDataProvider } from './state/AppDataProvider.tsx'

trackHistoryDepth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <App />
      <UpdatePrompt />
    </AppDataProvider>
  </StrictMode>,
)
