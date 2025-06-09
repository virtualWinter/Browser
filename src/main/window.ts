import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

/**
 * Creates and configures the main application window.
 *
 * This function initializes a new BrowserWindow with specific properties:
 * - It's initially hidden (`show: false`) and shown only when 'ready-to-show'.
 * - The menu bar is hidden (`autoHideMenuBar: true`).
 * - It's a frameless window (`frame: false`) for custom window decorations.
 * - Sets the window icon, especially for Linux.
 * - Configures webPreferences:
 *   - Specifies the preload script (`preload: join(__dirname, '../preload/index.js')`).
 *   - Disables the sandbox (`sandbox: false`) if necessary for certain Node.js integrations
 *     in the preload script, though enabling it is generally recommended for security.
 *
 * In development mode, it loads the URL from `ELECTRON_RENDERER_URL` (typically for HMR).
 * In production, it loads the `index.html` file from the renderer build.
 *
 * @returns {BrowserWindow} The created main BrowserWindow instance.
 */
export function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    show: false, // Initially hide the window until it's ready to show
    autoHideMenuBar: true, // Hide the default menu bar
    frame: false, // Create a frameless window for custom title bar/decorations
    ...(process.platform === 'linux' ? { icon } : {}), // Set window icon for Linux
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // Path to the preload script
      sandbox: false // Consider implications: true is more secure but limits preload script capabilities.
      // contextIsolation: true, // Recommended for security, ensure preload script is compatible.
      // nodeIntegration: false, // Recommended for security.
    }
  })

  // Show the window gracefully when it's ready
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Load the renderer content
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // In development, load from the Vite/Webpack dev server URL
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // In production, load the bundled HTML file
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
