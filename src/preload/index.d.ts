import { ElectronAPI } from '@electron-toolkit/preload'

/**
 * @file Type definitions for the API exposed by the preload script to the renderer process.
 * This file extends the global `Window` interface to include the `electron` and `api` objects,
 * providing type safety for interactions between the renderer and main processes.
 */
declare global {
  interface Window {
    /**
     * Electron API exposed by `@electron-toolkit/preload`.
     * Provides access to common Electron functionalities.
     */
    electron: ElectronAPI
    /**
     * Custom API exposed by the application's preload script.
     * This object contains methods for interacting with the main process
     * for browser-specific functionalities.
     */
    api: {
      /** Minimizes the main application window. */
      minimizeWindow: () => void
      /** Maximizes or unmaximizes the main application window. */
      maximizeUnmaximizeWindow: () => void
      /** Closes the main application window. */
      closeWindow: () => void
      /** Navigates the current tab to the specified URL. */
      navigate: (url: string) => void
      /** Navigates the current tab back in its history. */
      goBack: () => void
      /** Navigates the current tab forward in its history. */
      goForward: () => void
      /** Reloads the current tab. */
      reload: () => void
      /** Stops loading in the current tab. */
      stop: () => void
      /** Opens developer tools for the current tab's webview. */
      openDevTools: () => void
      /**
       * Updates the bounds (position and size) of the webview content area.
       * @param bounds - An object containing x, y, width, and height of the webview.
       */
      updateWebviewBounds: (bounds: { x: number; y: number; width: number; height: number }) => void
      /**
       * Retrieves a list of all open tabs with their ID, title, and URL.
       * @returns A promise that resolves to an array of tab information objects.
       */
      getTabs: () => Promise<{ id: string; title: string; url: string; favicon?: string }[]>
      /**
       * Retrieves the ID of the currently active tab.
       * @returns A promise that resolves to the active tab's ID, or null if no tab is active.
       */
      getActiveTabId: () => Promise<string | null>
      /**
       * Creates a new tab.
       * @param url - The URL to load in the new tab.
       * @param userAgent - Optional user agent string for the new tab.
       */
      createTab: (url: string, userAgent?: string) => void
      /**
       * Switches to the tab with the specified ID.
       * @param tabId - The ID of the tab to activate.
       */
      switchTab: (tabId: string) => void
      /**
       * Closes the tab with the specified ID.
       * @param tabId - The ID of the tab to close.
       */
      closeTab: (tabId: string) => void
      /**
       * Retrieves the URL of the currently active tab.
       * @returns A promise that resolves to the URL string.
       */
      getUrl: () => Promise<string>
      /**
       * Retrieves the title of the currently active tab.
       * @returns A promise that resolves to the title string.
       */
      getTitle: () => Promise<string>
      /**
       * Checks if the current tab can navigate backward in its history.
       * @returns A promise that resolves to true if navigation back is possible, false otherwise.
       */
      canGoBack: () => Promise<boolean>
      /**
       * Checks if the current tab can navigate forward in its history.
       * @returns A promise that resolves to true if navigation forward is possible, false otherwise.
       */
      canGoForward: () => Promise<boolean>
      /**
       * Checks if the current tab is currently loading a page.
       * @returns A promise that resolves to true if the tab is loading, false otherwise.
       */
      isLoading: () => Promise<boolean>
      /**
       * Checks if the current tab is waiting for a response from the server.
       * @returns A promise that resolves to true if the tab is waiting for a response, false otherwise.
       */
      isWaitingForResponse: () => Promise<boolean>
      /**
       * Registers a callback to be invoked when the list of tabs is updated.
       * @param callback - The function to call when tabs are updated.
       * @returns An Electron.IpcRenderer instance to allow for removing the listener.
       */
      onTabsUpdated: (callback: () => void) => Electron.IpcRenderer
      /**
       * Registers a callback to be invoked when the active tab changes.
       * @param callback - The function to call with the ID of the new active tab (or null).
       * @returns An Electron.IpcRenderer instance to allow for removing the listener.
       */
      onActiveTabChanged: (callback: (tabId: string | null) => void) => Electron.IpcRenderer
      /**
       * Registers a callback to be invoked when information (like title or URL) of a tab is updated.
       * @param callback - The function to call with the ID of the updated tab.
       * @returns An Electron.IpcRenderer instance to allow for removing the listener.
       */
      onTabInfoUpdated: (callback: (tabId: string) => void) => Electron.IpcRenderer
      /**
       * Exposes a function from the preload script to the global window object of the renderer.
       * This is useful for making utility functions available directly in the renderer's scope.
       * @param functionName - The name under which the function will be available on `window`.
       * @param func - The function to expose.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exposeFunctionToWindow: (functionName: string, func: (...args: any[]) => any) => void
    }
  }
}
