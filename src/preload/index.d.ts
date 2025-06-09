import { IpcRenderer } from 'electron'
// Attempt to use types from @electron-toolkit/preload
import type { ElectronAPI as ToolkitElectronAPI } from '@electron-toolkit/preload'

export interface TabInfo {
  id: string
  title: string
  url: string
  favicon?: string
}

// Use the imported ElectronAPI type from the toolkit
export type ElectronAPI = ToolkitElectronAPI

export interface WindowApi {
  minimizeWindow: () => void
  maximizeUnmaximizeWindow: () => void
  closeWindow: () => void
  navigate: (url: string) => void
  goBack: () => void
  goForward: () => void
  reload: () => void
  stop: () => void
  openDevTools: () => void
  updateWebviewBounds: (bounds: { x: number; y: number; width: number; height: number }) => void
  getTabs: () => Promise<TabInfo[]>
  getActiveTabId: () => Promise<string | null>
  createTab: (url: string, userAgent?: string) => void
  switchTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  getUrl: () => Promise<string>
  getTitle: () => Promise<string>
  canGoBack: () => Promise<boolean>
  canGoForward: () => Promise<boolean>
  isLoading: () => Promise<boolean>
  isWaitingForResponse: () => Promise<boolean>
  onTabsUpdated: (callback: () => void) => IpcRenderer
  onActiveTabChanged: (callback: (tabId: string | null) => void) => IpcRenderer
  onTabInfoUpdated: (callback: (tabId: string) => void) => IpcRenderer
  exposeFunctionToWindow: (functionName: string, func: (...args: unknown[]) => unknown) => void

  // Settings Window specific API
  minimizeSettingsWindow: () => void
  maximizeUnmaximizeSettingsWindow: () => void
  closeSettingsWindow: () => void
  getAppVersionInfo: () => Promise<{
    electron: string | undefined
    chrome: string | undefined
    node: string | undefined
    v8: string | undefined
    gitBranch: string | undefined
    appName: string | undefined
    appVersion: string | undefined
  }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowApi
  }
}
