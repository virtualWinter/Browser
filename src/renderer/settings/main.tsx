import '../src/globals.css' // Adjusted path for global styles
import React from 'react'
import ReactDOM from 'react-dom/client'
import SettingsApp from './Settings' // Adjusted path for SettingsApp

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
