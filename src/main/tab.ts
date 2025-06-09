import { BrowserView } from 'electron'
import { Browser } from '@main/browser'

/**
 * Represents a single tab within the browser.
 * Each tab has its own BrowserView and manages its URL, favicon, and user agent.
 */
export class Tab {
  /**
   * Unique identifier for the tab.
   */
  public id: string
  /**
   * The Electron BrowserView associated with this tab.
   */
  public view: BrowserView
  /**
   * The current URL loaded in the tab.
   */
  public url: string
  /**
   * The URL of the favicon for the current page, if available.
   */
  public favicon: string | undefined
  /**
   * Optional user agent string for this tab.
   */
  public userAgent?: string
  private browser: Browser

  /**
   * Creates an instance of a Tab.
   * @param browser The parent Browser instance.
   * @param url The initial URL to load.
   * @param x The initial x-coordinate for the BrowserView.
   * @param y The initial y-coordinate for the BrowserView.
   * @param width The initial width for the BrowserView.
   * @param height The initial height for the BrowserView.
   * @param userAgent Optional user agent string.
   */
  constructor(
    browser: Browser,
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
    userAgent?: string
  ) {
    this.browser = browser
    this.id =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    this.url = url
    this.userAgent = userAgent
    this.view = new BrowserView({
      webPreferences: {
        nodeIntegration: false, // Recommended for security
        contextIsolation: true, // Recommended for security
        ...(userAgent && { userAgent }) // Apply user agent if provided
      }
    })
    // Configure auto-resizing to fill the available space
    this.view.setAutoResize({
      width: true,
      height: true,
      horizontal: true,
      vertical: true
    })
    this.view.setBounds({ x, y, width, height })
    // Inject CSS to hide scrollbars and apply border-radius if needed by design
    this.view.webContents.insertCSS(`
      body {
        border-radius: 8px; /* Example: if the view itself should have rounded corners */
        overflow: hidden; /* Hides scrollbars if content fits, use auto for scrollbars */
      }
    `)
    this.view.webContents.loadURL(url)

    // Listen for favicon updates
    this.view.webContents.on('page-favicon-updated', (_event, favicons) => {
      if (favicons && favicons.length > 0) {
        this.favicon = favicons[0]
        // Potentially emit an event here if the main process needs to know about favicon changes
        // e.g., this.browser.events.emit('tab-info-updated', this.id);
      }
    })

    // Handle new window requests (e.g., window.open, links with target="_blank")
    // Opens new URLs in a new tab within this application instead of a new Electron window.
    this.view.webContents.setWindowOpenHandler((details) => {
      this.browser.createTab(details.url, true, undefined) // Create a new tab in the current browser instance
      return { action: 'deny' } // Deny opening a new Electron window
    })
  }

  /**
   * Sets the bounds (position and size) of the tab's BrowserView.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @param width The width.
   * @param height The height.
   */
  public setBounds(x: number, y: number, width: number, height: number): void {
    this.view.setBounds({ x, y, width, height })
  }

  /**
   * Loads a new URL in the tab.
   * @param url The URL to load.
   */
  public loadURL(url: string): void {
    this.url = url
    this.view.webContents.loadURL(url)
  }
}
