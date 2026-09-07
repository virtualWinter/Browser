export interface TabInfo {
  id: string
  title: string
  url: string
  favicon?: string
}

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
  openSettingsWindow: () => void
  showContextMenu: (x: number, y: number) => void
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
  onTabsUpdated: (callback: () => void) => () => void
  onActiveTabChanged: (callback: (tabId: string | null) => void) => () => void
  onTabInfoUpdated: (callback: (tabId: string) => void) => () => void

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
    api: WindowApi
  }
}
