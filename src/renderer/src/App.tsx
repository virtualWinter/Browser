import { Sidebar } from './components/sidebar'
import WCVBounds from './components/wcv-bounds'
import { useEffect } from 'react'

/**
 * The main application component for the renderer process.
 * This component sets up the overall layout, including the Sidebar and the main content area
 * managed by WCVBounds (Web Content View Bounds).
 * It also handles the global context menu trigger.
 *
 * @returns {React.JSX.Element} The rendered App component.
 */
function App(): React.JSX.Element {
  /**
   * Effect hook to set up and tear down a global context menu listener.
   * When a context menu event (right-click) occurs anywhere in the window,
   * it prevents the default browser context menu and sends an IPC message
   * to the main process to show a custom context menu at the click coordinates.
   */
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent): void => {
      event.preventDefault() // Prevent the default browser context menu
      // Send an IPC message to the main process to show the custom context menu
      window.electron.ipcRenderer.send('show-context-menu', event.clientX, event.clientY)
    }

    // Add the event listener when the component mounts
    window.addEventListener('contextmenu', handleContextMenu)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, []) // Empty dependency array ensures this effect runs only once on mount and cleanup on unmount

  return (
    // Main application container using flexbox for layout and applying a dark theme.
    <div className="flex flex-1 dark">
      <Sidebar />
      {/* Container for the main content area */}
      <div className="flex flex-col flex-1">
        {/*
          WCVBounds is responsible for defining the area where the BrowserView
          (web content) will be displayed. It communicates its bounds to the main process.
          The empty curly braces `{}` as children are a common pattern if the component
          manages its content internally or doesn't require explicit children here.
        */}
        <WCVBounds>{}</WCVBounds>
      </div>
    </div>
  )
}

export default App
