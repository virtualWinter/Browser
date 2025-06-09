import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

/**
 * Creates and returns the main application window with custom configuration.
 *
 * The window is initially hidden, frameless, and has its menu bar hidden. It uses a preload script and disables the sandbox for compatibility with certain Node.js integrations. In development, it loads content from the dev server; in production, it loads the bundled HTML file.
 *
 * @returns The configured main {@link BrowserWindow} instance.
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

/**
 * Creates and returns a configured Electron BrowserWindow for the application settings UI.
 *
 * The settings window is initially hidden, frameless, and has its menu bar hidden. On macOS, it uses a hidden title bar style to allow custom content while retaining native window controls. The window loads `settings.html` from the development server in development mode, or from the bundled renderer build in production.
 *
 * @returns The created settings BrowserWindow instance.
 */
export function createSettingsWindow(): BrowserWindow {
  const settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Initially hide the window until it's ready to show
    autoHideMenuBar: true, // Hide the default menu bar
    frame: false, // Create a frameless window
    titleBarStyle: 'hidden', // For macOS: hides title bar, keeps traffic lights
    ...(process.platform === 'linux' ? { icon } : {}), // Set window icon for Linux
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // Path to the preload script
      sandbox: false // Consider implications: true is more secure but limits preload script capabilities.
      // contextIsolation: true, // Recommended for security, ensure preload script is compatible.
      // nodeIntegration: false, // Recommended for security.
    }
  })

  // Show the window gracefully when it's ready
  settingsWindow.on('ready-to-show', () => {
    settingsWindow.show()
  })

  // Load the renderer content for settings
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // In development, load settings.html from the Vite/Webpack dev server URL
    settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/settings.html`)
  } else {
    // In production, load the bundled settings.html file
    settingsWindow.loadFile(join(__dirname, '../renderer/settings.html'))
  }

  return settingsWindow
}
