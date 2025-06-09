'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type React from 'react'
import { Plus, Settings, Download, Globe, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { WindowDecorations } from './window-decorations'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'

/**
 * Interface representing a browser tab.
 */
interface Tab {
  /** Unique identifier for the tab. */
  id: string
  /** The title of the webpage loaded in the tab. */
  title: string
  /** The URL of the webpage loaded in the tab. */
  url: string
  /** Optional URL of the favicon for the webpage. */
  favicon?: string
}

// Constants for window decoration style and position.
// These could be made configurable in the future.
const DECORATION_TYPE: 'macos' | 'windows' | 'windows11' = 'macos'
const DECORATION_POSITION: 'left' | 'right' = 'left'

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /** Optional CSS class name to apply to the sidebar container. */
  className?: string
}

/**
 * Sidebar component for the browser application.
 * It displays window decorations, navigation controls (back, forward, reload),
 * an address bar, a list of open tabs, and controls for creating new tabs and accessing settings.
 *
 * @param {SidebarProps} props - The props for the Sidebar component.
 * @returns {React.JSX.Element} The rendered Sidebar component.
 */
export function Sidebar({ className }: SidebarProps): React.JSX.Element {
  // State for managing the list of tabs
  const [tabs, setTabs] = useState<Tab[]>([])
  // State for the ID of the currently active tab
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  // State for the URL displayed in the address bar
  const [url, setUrl] = useState('')
  // State to enable/disable the back navigation button
  const [canGoBack, setCanGoBack] = useState(false)
  // State to enable/disable the forward navigation button
  const [canGoForward, setCanGoForward] = useState(false)

  /**
   * useEffect hook to initialize and manage tab-related data and event listeners.
   * - Fetches initial tab data and active tab ID.
   * - Sets up listeners for tab updates, active tab changes, and tab info updates from the main process.
   * - Updates URL, back/forward status when the active tab changes or its info is updated.
   */
  useEffect(() => {
    /**
     * Updates the URL input and navigation button states based on the current active tab.
     * @param {string | null} tabId - The ID of the currently active tab, or null if no tab is active.
     */
    const updateTabInfo = async (tabId: string | null): Promise<void> => {
      if (tabId) {
        setUrl(await window.api.getUrl())
        setCanGoBack(await window.api.canGoBack())
        setCanGoForward(await window.api.canGoForward())
      } else {
        // Reset if no tab is active
        setUrl('')
        setCanGoBack(false)
        setCanGoForward(false)
      }
    }

    /**
     * Fetches the list of all tabs and the ID of the currently active tab from the main process,
     * then updates the component's state.
     */
    const fetchTabsAndActive = async (): Promise<void> => {
      const fetchedTabs = await window.api.getTabs()
      setTabs(fetchedTabs)
      const activeId = await window.api.getActiveTabId()
      setActiveTabId(activeId)
      await updateTabInfo(activeId) // Update info for the initially active tab
    }

    // Initial fetch of tab data
    fetchTabsAndActive()

    // Define listener callbacks
    const handleTabsUpdated = (): void => {
      fetchTabsAndActive()
    }

    const handleActiveTabChanged = async (tabId: string | null): Promise<void> => {
      setActiveTabId(tabId)
      await updateTabInfo(tabId)
    }

    const handleTabInfoUpdated = async (tabId: string): Promise<void> => {
      if (tabId === activeTabId) {
        await updateTabInfo(tabId)
      }
      const fetchedTabs = await window.api.getTabs()
      setTabs(fetchedTabs)
    }

    // Set up listeners for events from the main process
    window.api.onTabsUpdated(handleTabsUpdated)
    window.api.onActiveTabChanged(handleActiveTabChanged)
    window.api.onTabInfoUpdated(handleTabInfoUpdated)

    // Cleanup function to remove listeners when the component unmounts.
    return () => {
      // Access ipcRenderer through window.electron as defined in preload and contextBridge
      window.electron.ipcRenderer.removeListener('tabs-updated', handleTabsUpdated)
      window.electron.ipcRenderer.removeListener('active-tab-changed', handleActiveTabChanged)
      window.electron.ipcRenderer.removeListener('tab-info-updated', handleTabInfoUpdated)
    }
  }, [activeTabId]) // Re-run effect if activeTabId changes to ensure info is up-to-date.

  /**
   * Handles the submission of the URL input form to navigate the current tab.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleNavigate = (e: React.FormEvent): void => {
    e.preventDefault() // Prevent default form submission
    if (url) {
      window.api.navigate(url)
    }
  }

  /**
   * Handles the creation of a new tab with a default URL and a hardcoded user agent.
   */
  const handleNewTab = (): void => {
    // Example: Using a specific user agent for new tabs. This could be configurable.
    const hardcodedUserAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    window.api.createTab('about:blank', hardcodedUserAgent) // 'about:blank' or a custom new tab page
  }

  /**
   * Handles clicking on a tab to switch to it.
   * @param {string} tabId - The ID of the tab to switch to.
   */
  const handleTabClick = (tabId: string): void => {
    window.api.switchTab(tabId)
  }

  /**
   * Handles closing a tab. Prevents closing if it's the last tab.
   * @param {string} tabId - The ID of the tab to close.
   * @param {React.MouseEvent} e - The mouse event, used to stop propagation.
   */
  const handleCloseTab = (tabId: string, e: React.MouseEvent): void => {
    e.stopPropagation() // Prevent the click from also triggering tab selection
    if (tabs.length === 1) return // Don't close the last tab

    window.api.closeTab(tabId)
  }

  /**
   * Handles errors when loading a tab's favicon (e.g., if the image fails to load).
   * It updates the tab's state to remove the broken favicon link.
   * @param {string} tabId - The ID of the tab whose favicon failed to load.
   */
  const handleFaviconError = (tabId: string): void => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === tabId ? { ...tab, favicon: undefined } : tab))
    )
  }

  return (
    // Main sidebar container
    <div className={`w-64 h-screen bg-sidebar flex flex-col ${className}`}>
      {/* Top section: Window decorations, navigation, and address bar. Draggable area. */}
      <div className="p-3 space-y-3 draggable">
        {/* Window decorations and navigation controls. Non-draggable area within draggable parent. */}
        <div className="flex items-center">
          {DECORATION_POSITION === 'left' ? (
            <>
              <WindowDecorations type={DECORATION_TYPE} position={DECORATION_POSITION} />
              <div className="flex-grow draggable"></div> {/* Draggable spacer */}
              <div className="flex items-center gap-1 no-drag">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => window.api.goBack()}
                  disabled={!canGoBack}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-3 w-3 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => window.api.goForward()}
                  disabled={!canGoForward}
                  aria-label="Go forward"
                >
                  <ArrowRight className="h-3 w-3 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => window.api.reload()}
                  aria-label="Reload page"
                >
                  <RotateCcw className="h-3 w-3 text-white" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 no-drag">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 no-drag"
                  onClick={() => window.api.goBack()}
                  disabled={!canGoBack}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-3 w-3 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 no-drag"
                  onClick={() => window.api.goForward()}
                  disabled={!canGoForward}
                  aria-label="Go forward"
                >
                  <ArrowRight className="h-3 w-3 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 no-drag"
                  onClick={() => window.api.reload()}
                  aria-label="Reload page"
                >
                  <RotateCcw className="h-3 w-3 text-white" />
                </Button>
              </div>
              <div className="flex-grow draggable"></div> {/* Draggable spacer */}
              <WindowDecorations type={DECORATION_TYPE} position={DECORATION_POSITION} />
            </>
          )}
        </div>

        {/* Address bar input field. Non-draggable area. */}
        <div className="no-drag">
          <form onSubmit={handleNavigate}>
            <Input
              type="url"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-sm font-semibold border-[0.5px] border-sidebar-border bg-sidebar-accent/50 px-2 py-1 rounded-md focus-visible:ring-1 focus-visible:ring-sidebar-ring text-sidebar-foreground placeholder:text-sidebar-foreground/50 no-drag"
              aria-label="Address bar"
            />
          </form>
        </div>
      </div>

      {/* Middle section: List of tabs. Draggable area for reordering (if implemented). */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-1">
          {/* Render each tab */}
          {tabs.map((tab) => (
            <div key={tab.id}>
              <button
                className={`w-full h-10 px-3 text-sm text-left rounded-md transition-colors group flex items-center justify-between ${
                  tab.id === activeTabId
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' // Active tab style
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground' // Inactive tab style
                }`}
                onClick={() => handleTabClick(tab.id)}
                title={tab.title}
              >
                {/* Tab content: favicon and title. Non-draggable. */}
                <div className="flex items-center flex-1 min-w-0 no-drag">
                  {/* Favicon or placeholder */}
                  <div className="flex-shrink-0 w-4 h-4 mr-2 flex items-center justify-center">
                    {tab.favicon ? (
                      <img
                        src={tab.favicon} // Removed placeholder fallback here, error handles it
                        alt="" // Decorative, title attribute on button provides info
                        className="w-4 h-4"
                        onError={() => handleFaviconError(tab.id)}
                      />
                    ) : (
                      <Globe className="w-3 h-3 text-sidebar-foreground/50" />
                    )}
                  </div>
                  {/* Tab title (truncated if too long) */}
                  <span className="flex-1 truncate">{tab.title || 'New Tab'}</span>
                </div>
                {/* Close button for tab (visible on hover, if more than one tab exists). Non-draggable. */}
                {tabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sidebar-accent flex-shrink-0 no-drag"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    aria-label={`Close tab: ${tab.title || 'New Tab'}`}
                  >
                    <X className="h-2.5 w-2.5" /> {/* Changed from Plus to X for clarity */}
                  </Button>
                )}
              </button>
            </div>
          ))}

          {/* "New Tab" button. Non-draggable. */}
          <div>
            <button
              className="w-full h-10 px-3 text-sm text-left rounded-md transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 flex items-center no-drag"
              onClick={handleNewTab}
            >
              <Plus className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
              New Tab
            </button>
          </div>
        </div>
      </div>

      {/* Bottom section: Settings and other controls. Draggable area. */}
      <div className="p-3">
        {/* Settings and Download buttons. Non-draggable. */}
        <div className="flex items-center justify-between no-drag">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-accent no-drag"
            onClick={() => window.electron.ipcRenderer.send('open-settings-window')}
            aria-label="Open settings"
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-accent no-drag"
            aria-label="Downloads" // Assuming this is a downloads button
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
