/**
 * @file Main process entry point for the Electron application.
 * This file handles the application lifecycle, creates the main window,
 * sets up IPC handlers, context menus, and initializes the browser functionality.
 */
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow, createSettingsWindow } from '@main/window'
import { setupIpcHandlers } from '@main/ipc'
import { setupContextMenu } from '@main/contextMenu'
import { Browser } from '@main/browser'

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */

let settingsWindow: BrowserWindow | null = null

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('moe.vwinter.browser')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = createWindow()
  const browser = new Browser(mainWindow)
  // Pass settingsWindow and its creator function to IPC handlers
  setupIpcHandlers(mainWindow, browser, () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.focus()
    } else {
      settingsWindow = createSettingsWindow()
      settingsWindow.on('closed', () => {
        settingsWindow = null
      })
    }
    return settingsWindow
  })
  setupContextMenu()
  await browser.initialize() // Initialize browser components, like fetching initial bounds

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    // Settings window is not re-created on activate, only via IPC
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
