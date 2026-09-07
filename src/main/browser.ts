import { BrowserWindow } from 'electron'
import EventEmitter from 'events'
import { Tab } from '@main/tab'

/**
 * Manages browser tabs and their interactions within the main window.
 */
export class Browser {
  private mainWindow: BrowserWindow
  /**
   * Event emitter for browser-related events.
   */
  public events = new EventEmitter()

  /**
   * Creates an instance of the Browser.
   * @param mainWindow The main Electron BrowserWindow.
   */
  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  private tabs: Tab[] = []
  /**
   * The currently active tab.
   */
  public currentTab: Tab | null = null
  private lastKnownBounds: { x: number; y: number; width: number; height: number } | null = null
  private resolveInitialBounds: (() => void) | null = null

  /**
   * Waits briefly for the renderer to report the initial web-content bounds.
   */
  public async initialize(): Promise<void> {
    if (this.lastKnownBounds) return

    await new Promise<void>((resolve) => {
      const finish = (): void => {
        this.resolveInitialBounds = null
        resolve()
      }
      const timeout = setTimeout(finish, 2_000)
      this.resolveInitialBounds = () => {
        clearTimeout(timeout)
        finish()
      }
    })
  }

  /**
   * Sets the last known bounds of the web content view.
   * @param bounds The bounds to set.
   */
  public setLastKnownBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    this.lastKnownBounds = bounds
    this.resolveInitialBounds?.()
  }

  /**
   * Registers event listeners for a given tab.
   * @param tab The tab to register listeners for.
   */
  private registerTabListeners(tab: Tab): void {
    tab.view.webContents.on('did-navigate', () => {
      this.events.emit('tab-info-updated', tab.id)
    })
    tab.view.webContents.on('did-finish-load', () => {
      this.events.emit('tab-info-updated', tab.id)
    })
    tab.view.webContents.on('page-title-updated', () => {
      this.events.emit('tab-info-updated', tab.id)
    })
  }

  /**
   * Creates a new tab.
   * @param url The URL to load in the new tab. Defaults to 'https://www.google.com'.
   * @param activate Whether to activate the new tab immediately. Defaults to true.
   * @param userAgent Optional user agent string for the new tab.
   * @returns A promise that resolves to the newly created Tab instance.
   */
  public async createTab(
    url: string = 'https://www.google.com',
    activate = true,
    userAgent?: string
  ): Promise<Tab> {
    let initialBounds = this.lastKnownBounds
    // Fallback to main window content bounds if renderer bounds are not available
    if (!initialBounds) {
      const content = this.mainWindow.getContentBounds()
      initialBounds = { x: 0, y: 0, width: content.width, height: content.height }
    } else {
      // No-op, initialBounds is already set
    }

    const newTab = new Tab(
      this,
      url,
      initialBounds.x,
      initialBounds.y,
      initialBounds.width,
      initialBounds.height,
      userAgent
    )
    this.tabs.push(newTab)
    this.registerTabListeners(newTab)

    if (activate) {
      await this.switchTab(newTab.id)
    }

    this.events.emit('tabs-updated')
    return newTab
  }

  /**
   * Switches to the specified tab.
   * @param tabId The ID of the tab to switch to.
   * @returns A promise that resolves when the tab switch is complete.
   */
  public async switchTab(tabId: string): Promise<void> {
    const tabToActivate = this.tabs.find((tab) => tab.id === tabId)
    if (tabToActivate) {
      // Remove the current view if it exists and is different from the new tab
      if (this.currentTab && this.currentTab.id !== tabId) {
        this.mainWindow.removeBrowserView(this.currentTab.view)
      }

      const oldCurrentTabId = this.currentTab?.id
      this.currentTab = tabToActivate

      // Add the new tab's view if it's not already present or if the tab changed
      if (
        oldCurrentTabId !== tabId ||
        !this.mainWindow.getBrowserViews().includes(this.currentTab.view)
      ) {
        this.mainWindow.addBrowserView(this.currentTab.view)
      }

      let boundsToSet = this.lastKnownBounds
      // Fallback to main window content bounds if renderer bounds are not available
      if (!boundsToSet) {
        const content = this.mainWindow.getContentBounds()
        boundsToSet = { x: 0, y: 0, width: content.width, height: content.height }
      } else {
        // No-op, boundsToSet is already set
      }

      this.currentTab.setBounds(boundsToSet.x, boundsToSet.y, boundsToSet.width, boundsToSet.height)
      this.currentTab.view.webContents.setFrameRate(60) // Improve rendering performance
      this.events.emit('active-tab-changed', tabId)
    }
  }

  /**
   * Closes the specified tab.
   * @param tabId The ID of the tab to close.
   * @returns A promise that resolves when the tab is closed.
   */
  public async closeTab(tabId: string): Promise<void> {
    const index = this.tabs.findIndex((tab) => tab.id === tabId)
    if (index !== -1) {
      const tabToClose = this.tabs[index]
      this.mainWindow.removeBrowserView(tabToClose.view) // Remove view from window
      tabToClose.view.webContents.close()

      this.tabs.splice(index, 1) // Remove tab from the list

      // If the closed tab was the current tab, switch to another tab
      if (this.currentTab?.id === tabId) {
        this.currentTab = this.tabs.length > 0 ? this.tabs[0] : null // Activate first tab or null
        if (this.currentTab) {
          this.mainWindow.addBrowserView(this.currentTab.view)
          let boundsToSet = this.lastKnownBounds
          if (!boundsToSet) {
            const content = this.mainWindow.getContentBounds()
            boundsToSet = { x: 0, y: 0, width: content.width, height: content.height }
          }
          this.currentTab.setBounds(
            boundsToSet.x,
            boundsToSet.y,
            boundsToSet.width,
            boundsToSet.height
          )
          this.currentTab.view.webContents.setFrameRate(60)
        }
      }
      this.events.emit('tabs-updated')
      this.events.emit('active-tab-changed', this.currentTab?.id || null)
    }
  }

  /**
   * Gets a list of all open tabs with their basic information.
   * @returns An array of tab information objects.
   */
  public getTabs(): { id: string; title: string; url: string; favicon?: string }[] {
    return this.tabs.map((tab) => ({
      id: tab.id,
      title: tab.view.webContents.getTitle(),
      url: tab.view.webContents.getURL(),
      favicon: tab.favicon
    }))
  }

  /**
   * Gets the ID of the currently active tab.
   * @returns The ID of the active tab, or null if no tab is active.
   */
  public getActiveTabId(): string | null {
    return this.currentTab ? this.currentTab.id : null
  }
}
