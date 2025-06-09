import '@/globals.css' // Import global styles, including Tailwind CSS
import React from 'react'
import ReactDOM from 'react-dom/client'
import SettingsApp from './settings'

const rootElement = document.getElementById('settings-root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <SettingsApp />
    </React.StrictMode>
  )
} else {
  console.error("Failed to find the root element with ID 'settings-root'.")
}
