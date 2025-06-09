import React, { useRef, useEffect } from 'react'

/**
 * Props for the WCVBounds component.
 */
interface WCVBoundsProps {
  /** Optional children to render within the bounds component. */
  children?: React.ReactNode
}

/**
 * WCVBounds (Web Content View Bounds) component.
 * This component is responsible for tracking its own dimensions and position
 * and communicating these bounds to the main Electron process via IPC.
 * The main process uses these bounds to position and size the BrowserView
 * that displays web content.
 *
 * It uses a `ResizeObserver` and a window `resize` event listener to detect
 * changes in its size or position and sends updates accordingly.
 *
 * @param {WCVBoundsProps} props - The props for the component.
 * @returns {React.JSX.Element} The rendered WCVBounds component.
 */
const WCVBounds: React.FC<WCVBoundsProps> = ({ children }) => {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const divElement = divRef.current
    if (!divElement) return

    /**
     * Calculates the current bounding rectangle of the div element
     * and sends it to the main process via IPC.
     */
    const updateBounds = (): void => {
      const rect = divElement.getBoundingClientRect()
      window.electron.ipcRenderer.send('update-webview-bounds', {
        x: Math.floor(rect.x),
        y: Math.floor(rect.y),
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      })
      // Expose a function to the window object for the main process to call directly
      // This is an alternative way for the main process to request current bounds.
      window.api.exposeFunctionToWindow('getWCVCurrentBounds', () => ({
        x: Math.floor(rect.x),
        y: Math.floor(rect.y),
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      }))
    }

    // Initial update of bounds when the component mounts
    updateBounds()

    // Observe the div element for resize changes
    const resizeObserver = new ResizeObserver(updateBounds)
    resizeObserver.observe(divElement)

    // Listen for window resize events as well, as this can also affect element position
    window.addEventListener('resize', updateBounds)

    // Cleanup function to remove observers and event listeners when the component unmounts
    return () => {
      resizeObserver.unobserve(divElement)
      window.removeEventListener('resize', updateBounds)
      // Optionally, remove the exposed function if no longer needed, though less critical
      // delete (window as any).getWCVCurrentBounds;
    }
  }, []) // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount

  return (
    // The div element whose bounds are being tracked.
    // It's styled to take up full width and height of its container and has a relative position.
    // The `bg-sidebar` class is likely a placeholder or for visual debugging during development.
    <div ref={divRef} className="relative w-full h-full bg-sidebar">
      {children}
    </div>
  )
}

export default WCVBounds
