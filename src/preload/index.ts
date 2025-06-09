import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI as toolkitElectronAPI } from '@electron-toolkit/preload'

/**
 * @file Preload script for the Electron application.
 * This script runs in a privileged environment with access to Node.js APIs
 * and is used to expose specific functionalities to the renderer process via `contextBridge`.
 * It defines a custom `api` object that allows the renderer to interact with the main process
 * for various browser operations.
 */

/**
 * Custom API object to be exposed to the renderer process.
 * It provides methods for window manipulation, navigation, tab management,
 * and event handling by sending/invoking IPC messages to the main process.
 */
const api = {
  /** Sends a message to minimize the main window. */
  minimizeWindow: (): void => ipcRenderer.send('minimize-window'),
  /** Sends a message to maximize or unmaximize the main window. */
  maximizeUnmaximizeWindow: (): void => ipcRenderer.send('maximize-unmaximize-window'),
  /** Sends a message to close the main window. */
  closeWindow: (): void => ipcRenderer.send('close-window'),
  /** Sends a message to navigate the current tab to the given URL. */
  navigate: (url: string): void => ipcRenderer.send('navigate', url),
  /** Sends a message to navigate the current tab back. */
  goBack: (): void => ipcRenderer.send('go-back'),
  /** Sends a message to navigate the current tab forward. */
  goForward: (): void => ipcRenderer.send('go-forward'),
  /** Sends a message to reload the current tab. */
  reload: (): void => ipcRenderer.send('reload'),
  /** Sends a message to stop loading in the current tab. */
  stop: (): void => ipcRenderer.send('stop'),
  /** Sends a message to open developer tools for the current tab. */
  openDevTools: (): void => ipcRenderer.send('open-dev-tools'),
  /**
   * Sends a message to update the bounds of the webview content area.
   * @param bounds - The new bounds (x, y, width, height).
   */
  updateWebviewBounds: (bounds: { x: number; y: number; width: number; height: number }): void =>
    ipcRenderer.send('update-webview-bounds', bounds),
  /**
   * Invokes a handler in the main process to get all open tabs.
   * @returns A promise resolving to an array of tab objects.
   */
  getTabs: (): Promise<{ id: string; title: string; url: string; favicon?: string }[]> =>
    ipcRenderer.invoke('get-tabs'),
  /**
   * Invokes a handler in the main process to get the ID of the active tab.
   * @returns A promise resolving to the active tab ID or null.
   */
  getActiveTabId: (): Promise<string | null> => ipcRenderer.invoke('get-active-tab-id'),
  /**
   * Sends a message to create a new tab.
   * @param url - The URL for the new tab.
   * @param userAgent - Optional user agent for the new tab.
   */
  createTab: (url: string, userAgent?: string): void =>
    ipcRenderer.send('create-tab', url, userAgent),
  /** Sends a message to switch to the specified tab. */
  switchTab: (tabId: string): void => ipcRenderer.send('switch-tab', tabId),
  /** Sends a message to close the specified tab. */
  closeTab: (tabId: string): void => ipcRenderer.send('close-tab', tabId),
  /** Invokes a handler to get the URL of the current tab. */
  getUrl: (): Promise<string> => ipcRenderer.invoke('get-url'),
  /** Invokes a handler to get the title of the current tab. */
  getTitle: (): Promise<string> => ipcRenderer.invoke('get-title'),
  /** Invokes a handler to check if the current tab can go back. */
  canGoBack: (): Promise<boolean> => ipcRenderer.invoke('can-go-back'),
  /** Invokes a handler to check if the current tab can go forward. */
  canGoForward: (): Promise<boolean> => ipcRenderer.invoke('can-go-forward'),
  /** Invokes a handler to check if the current tab is loading. */
  isLoading: (): Promise<boolean> => ipcRenderer.invoke('is-loading'),
  /** Invokes a handler to check if the current tab is waiting for a response. */
  isWaitingForResponse: (): Promise<boolean> => ipcRenderer.invoke('is-waiting-for-response'),
  /**
   * Registers a callback for the 'tabs-updated' event from the main process.
   * @param callback - The function to execute when tabs are updated.
   * @returns The IpcRenderer instance.
   */
  onTabsUpdated: (callback: () => void): Electron.IpcRenderer =>
    ipcRenderer.on('tabs-updated', callback),
  /**
   * Registers a callback for the 'active-tab-changed' event from the main process.
   * @param callback - The function to execute with the new active tab ID.
   * @returns The IpcRenderer instance.
   */
  onActiveTabChanged: (callback: (tabId: string | null) => void): Electron.IpcRenderer =>
    ipcRenderer.on('active-tab-changed', (_event, tabId) => callback(tabId)),
  /**
   * Registers a callback for the 'tab-info-updated' event from the main process.
   * @param callback - The function to execute with the ID of the updated tab.
   * @returns The IpcRenderer instance.
   */
  onTabInfoUpdated: (callback: (tabId: string) => void): Electron.IpcRenderer =>
    ipcRenderer.on('tab-info-updated', (_event, tabId) => callback(tabId)),

  /**
   * Exposes a given function to the renderer's `window` object.
   * This is a utility to make functions available globally in the renderer,
   * bypassing `contextBridge` if direct window modification is desired (use with caution).
   * @param functionName - The name the function will have on the `window` object.
   * @param func - The function to expose.
   */
  exposeFunctionToWindow: (functionName: string, func: (...args: unknown[]) => unknown): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)[functionName] = func
  }
}

// Use `contextBridge` to securely expose APIs to the renderer process
// if context isolation is enabled. Otherwise, fall back to direct window assignment (less secure).
if (process.contextIsolated) {
  try {
    // Expose the standard electronAPI from @electron-toolkit/preload
    contextBridge.exposeInMainWorld('electron', toolkitElectronAPI)
    // Expose the custom 'api' object
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Error exposing API via contextBridge:', error)
  }
} else {
  // This fallback is for environments where contextIsolation is false.
  // It's generally recommended to keep contextIsolation true for security.
  // @ts-ignore (Type definitions are handled in index.d.ts)
  window.electron = toolkitElectronAPI
  // @ts-ignore (Type definitions are handled in index.d.ts)
  window.api = api
}
