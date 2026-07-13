import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the service worker.
// When a new version of the app is deployed, autoUpdate (set in vite.config.ts)
// will silently refresh the SW. If you ever want to prompt the user instead,
// swap registerType to 'prompt' and show updateSW() on a button click.
registerSW({
  onNeedRefresh() {
    // New content available — the SW will update automatically on next reload
    // because registerType is 'autoUpdate'. This callback is a no-op in that mode.
  },
  onOfflineReady() {
    console.info('[HealthyHerd] App is ready to work offline.')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
