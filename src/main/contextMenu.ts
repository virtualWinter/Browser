import { Menu, MenuItem, ipcMain, WebContents, BrowserWindow } from 'electron'

/**
 * Sets up the context menu for web contents.
 * This function listens for the 'show-context-menu' IPC event from the renderer process
 * and displays a context menu with options like 'Inspect Element', 'Reload', 'Back', and 'Forward'.
 */
export function setupContextMenu(): void {
  ipcMain.on('show-context-menu', (event, x: number, y: number) => {
    const webContents = event.sender as WebContents
    const menu = new Menu()
    menu.append(
      new MenuItem({
        label: 'Inspect Element',
        click: () => {
          webContents.inspectElement(x, y)
        }
      })
    )
    menu.append(new MenuItem({ type: 'separator' }))
    menu.append(
      new MenuItem({
        label: 'Reload',
        click: () => {
          webContents.reload()
        }
      })
    )
    menu.append(
      new MenuItem({
        label: 'Back',
        click: () => {
          // Note: webContents.goBack() is the correct method,
          // navigationHistory is for managing history, not direct navigation.
          if (webContents.canGoBack()) {
            webContents.goBack()
          }
        }
      })
    )
    menu.append(
      new MenuItem({
        label: 'Forward',
        click: () => {
          if (webContents.canGoForward()) {
            webContents.goForward()
          }
        }
      })
    )
    // Ensure that a valid window is passed to menu.popup
    const window = BrowserWindow.fromWebContents(webContents)
    if (window) {
      menu.popup({ window })
    } else {
      console.warn('[Main] Could not find BrowserWindow for webContents to show context menu.')
    }
  })
}
