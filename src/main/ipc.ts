import { ipcMain, BrowserWindow, app } from 'electron'
import { execSync } from 'child_process'
import { Browser } from '@main/browser'

/**
 * Sets up IPC (Inter-Process Communication) handlers for communication between the main process and renderer processes.
 * This function registers listeners for various events such as window manipulation (minimize, maximize, close),
 * webview bounds updates, navigation controls (navigate, go back, go forward, reload, stop),
 * developer tools, and tab management (create, switch, close, get info).
 * It also forwards events from the Browser class to the renderer process.
 *
 * @param mainWindow The main Electron BrowserWindow instance.
 * @param browser The Browser instance managing tabs and webviews.
 * @param openSettingsWindowCallback A function to call to open or focus the settings window.
 */
export function setupIpcHandlers(
  mainWindow: BrowserWindow,
  browser: Browser,
  openSettingsWindowCallback: () => BrowserWindow | null
): void {
  /**
   * Minimizes the main window.
   */
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize()
  })

  /**
   * Maximizes or unmaximizes the main window.
   */
  ipcMain.on('maximize-unmaximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  /**
   * Closes the main window.
   */
  ipcMain.on('close-window', () => {
    mainWindow.close()
  })

  /**
   * Updates the bounds of the current tab's webview.
   * Also updates the last known bounds in the Browser instance.
   */
  ipcMain.on(
    'update-webview-bounds',
    (_event, bounds: { x: number; y: number; width: number; height: number }) => {
      if (browser.currentTab) {
        browser.currentTab.setBounds(bounds.x, bounds.y, bounds.width, bounds.height)
        browser.setLastKnownBounds(bounds) // Store for new tabs
      }
    }
  )

  /**
   * Navigates the current tab to the specified URL.
   */
  ipcMain.on('navigate', (_event, url: string) => {
    if (browser.currentTab) {
      browser.currentTab.view.webContents.loadURL(url)
    }
  })

  /**
   * Navigates the current tab back in its history.
   */
  ipcMain.on('go-back', () => {
    if (browser.currentTab && browser.currentTab.view.webContents.navigationHistory.canGoBack()) {
      // Corrected to use webContents.goBack() directly
      browser.currentTab.view.webContents.navigationHistory.goBack()
    }
  })

  /**
   * Navigates the current tab forward in its history.
   */
  ipcMain.on('go-forward', () => {
    if (
      browser.currentTab &&
      browser.currentTab.view.webContents.navigationHistory.canGoForward()
    ) {
      // Corrected to use webContents.goForward() directly
      browser.currentTab.view.webContents.navigationHistory.goForward()
    }
  })

  /**
   * Reloads the current tab.
   */
  ipcMain.on('reload', () => {
    if (browser.currentTab) {
      browser.currentTab.view.webContents.reload()
    }
  })

  /**
   * Stops loading in the current tab.
   */
  ipcMain.on('stop', () => {
    if (browser.currentTab) {
      browser.currentTab.view.webContents.stop()
    }
  })

  /**
   * Opens developer tools for the current tab's webview.
   */
  ipcMain.on('open-dev-tools', () => {
    if (browser.currentTab) {
      browser.currentTab.view.webContents.openDevTools()
    }
  })

  /**
   * Handles a request to get all open tabs.
   * @returns A promise that resolves to an array of tab information.
   */
  ipcMain.handle('get-tabs', () => {
    return browser.getTabs()
  })

  /**
   * Handles a request to get the ID of the active tab.
   * @returns A promise that resolves to the active tab ID or null.
   */
  ipcMain.handle('get-active-tab-id', () => {
    return browser.getActiveTabId()
  })

  /**
   * Creates a new tab.
   * If no URL is provided or it's 'about:blank', a default URL will be used.
   */
  ipcMain.on('create-tab', async (_event, url: string, userAgent?: string) => {
    if (url && url !== 'about:blank') {
      await browser.createTab(url, true, userAgent)
    } else {
      // Create tab with default URL if none provided or 'about:blank'
      await browser.createTab(undefined, true, userAgent)
    }
  })

  /**
   * Switches to the specified tab.
   */
  ipcMain.on('switch-tab', async (_event, tabId: string) => {
    await browser.switchTab(tabId)
  })

  /**
   * Closes the specified tab.
   */
  ipcMain.on('close-tab', async (_event, tabId: string) => {
    await browser.closeTab(tabId)
  })

  /**
   * Handles a request to get the URL of the current tab.
   * @returns A promise that resolves to the current tab's URL or an empty string.
   */
  ipcMain.handle('get-url', () => {
    return browser.currentTab ? browser.currentTab.view.webContents.getURL() : ''
  })

  /**
   * Handles a request to get the title of the current tab.
   * @returns A promise that resolves to the current tab's title or an empty string.
   */
  ipcMain.handle('get-title', () => {
    return browser.currentTab ? browser.currentTab.view.webContents.getTitle() : ''
  })

  /**
   * Handles a request to check if the current tab can go back in history.
   * @returns A promise that resolves to true if the tab can go back, false otherwise.
   */
  ipcMain.handle('can-go-back', () => {
    return browser.currentTab
      ? browser.currentTab.view.webContents.navigationHistory.canGoBack()
      : false
  })

  /**
   * Handles a request to check if the current tab can go forward in history.
   * @returns A promise that resolves to true if the tab can go forward, false otherwise.
   */
  ipcMain.handle('can-go-forward', () => {
    return browser.currentTab
      ? browser.currentTab.view.webContents.navigationHistory.canGoForward()
      : false
  })

  /**
   * Handles a request to check if the current tab is currently loading.
   * @returns A promise that resolves to true if the tab is loading, false otherwise.
   */
  ipcMain.handle('is-loading', () => {
    return browser.currentTab ? browser.currentTab.view.webContents.isLoading() : false
  })

  /**
   * Handles a request to check if the current tab is waiting for a response.
   * @returns A promise that resolves to true if the tab is waiting for a response, false otherwise.
   */
  ipcMain.handle('is-waiting-for-response', () => {
    return browser.currentTab ? browser.currentTab.view.webContents.isWaitingForResponse() : false
  })

  /**
   * Forwards the 'tabs-updated' event from the Browser instance to the renderer process.
   */
  browser.events.on('tabs-updated', () => {
    mainWindow.webContents.send('tabs-updated')
  })

  /**
   * Forwards the 'active-tab-changed' event from the Browser instance to the renderer process.
   * @param tabId The ID of the newly active tab, or null if no tab is active.
   */
  browser.events.on('active-tab-changed', (tabId: string | null) => {
    mainWindow.webContents.send('active-tab-changed', tabId)
  })

  /**
   * Forwards the 'tab-info-updated' event from the Browser instance to the renderer process.
   * This event signifies that information like title, URL, or favicon of a tab has changed.
   * @param tabId The ID of the tab whose information was updated.
   */
  browser.events.on('tab-info-updated', (tabId: string) => {
    mainWindow.webContents.send('tab-info-updated', tabId)
  })

  /**
   * Opens or focuses the settings window.
   */
  ipcMain.on('open-settings-window', () => {
    openSettingsWindowCallback()
  })

  /**
   * Minimizes the settings window.
   */
  ipcMain.on('minimize-settings-window', () => {
    const settingsWin = openSettingsWindowCallback()
    if (settingsWin && !settingsWin.isDestroyed()) {
      settingsWin.minimize()
    }
  })

  /**
   * Maximizes or unmaximizes the settings window.
   */
  ipcMain.on('maximize-unmaximize-settings-window', () => {
    const settingsWin = openSettingsWindowCallback()
    if (settingsWin && !settingsWin.isDestroyed()) {
      if (settingsWin.isMaximized()) {
        settingsWin.unmaximize()
      } else {
        settingsWin.maximize()
      }
    }
  })

  /**
   * Closes the settings window.
   */
  ipcMain.on('close-settings-window', () => {
    const settingsWin = openSettingsWindowCallback()
    if (settingsWin && !settingsWin.isDestroyed()) {
      settingsWin.close()
    }
  })

  /**
   * Handles a request to get application and system version information.
   * @returns A promise that resolves to an object containing version details.
   */
  ipcMain.handle('get-app-version-info', async () => {
    let gitBranch: string | undefined
    try {
      // Ensure git is installed and the command is run in the project root if necessary
      // For simplicity, assuming .git is in the app's root or accessible.
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8'
        // If your .git directory is not in app.getAppPath(), you might need to adjust cwd
        // cwd: app.getAppPath() // Or specific project root
      }).trim()
    } catch (error) {
      console.error('Failed to get git branch:', error)
      gitBranch = 'N/A' // Or undefined, or some other placeholder
    }

    return {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      v8: process.versions.v8,
      gitBranch,
      appName: app.getName(),
      appVersion: app.getVersion()
    }
  })
}
