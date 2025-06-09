/**
 * @file Entry point for the React application in the renderer process.
 * This file imports global styles, React, ReactDOM, and the main App component.
 * It then uses ReactDOM's `createRoot` API to render the App component
 * into the DOM element with the ID 'root'.
 * The application is wrapped in `<StrictMode>` to highlight potential problems.
 */
import '@/globals.css' // Import global styles, including Tailwind CSS

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' // Import createRoot for React 18+
import App from './App' // Import the main application component

// Get the root DOM element where the React app will be mounted.
// The non-null assertion operator (!) is used because 'root' is expected to always exist in index.html.
const rootElement = document.getElementById('root')!

// Create a root for the React application and render the App component.
// StrictMode is a wrapper that helps identify potential problems in an application.
// It activates additional checks and warnings for its descendants.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
