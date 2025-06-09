import { Minimize2, Square, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Defines the possible styles for window decorations (e.g., macOS, Windows).
 */
type WindowDecorationType = 'macos' | 'windows' | 'windows11'

/**
 * Defines the possible horizontal positions for window decorations (left or right).
 */
type WindowDecorationPosition = 'left' | 'right'

/**
 * Props for the WindowDecorations component.
 */
interface WindowDecorationsProps {
  /** The style type of the window decorations to render. */
  type: WindowDecorationType
  /** The horizontal position of the decorations. */
  position: WindowDecorationPosition
  /** Optional CSS class name to apply to the container element. */
  className?: string
  /** Specifies which window's controls to use ('main' or 'settings'). Defaults to 'main'. */
  targetWindow?: 'main' | 'settings'
}

/**
 * WindowDecorations component.
 * Renders platform-specific window control buttons (minimize, maximize, close)
 * for a frameless Electron window.
 *
 * The appearance and order of buttons are determined by the `type` (macos, windows, windows11)
 * and `position` (left, right) props.
 *
 * @param {WindowDecorationsProps} props - The props for the component.
 * @returns {React.JSX.Element | null} The rendered window decoration buttons, or null if the type is unrecognized.
 */
export function WindowDecorations({
  type,
  position,
  className,
  targetWindow = 'main' // Default to 'main' if not provided
}: WindowDecorationsProps): React.JSX.Element | null {
  // Base CSS classes for the container, combined with any custom className.
  const baseClasses = cn('flex items-center', className)
  // Additional class to reverse the order of buttons if position is 'left' (for Windows-style).
  const orderedClasses = position === 'left' ? 'flex-row-reverse' : ''

  // Render macOS-style "traffic light" buttons.
  if (type === 'macos') {
    // macOS buttons are typically on the left.
    // The order is Close (red), Minimize (yellow), Maximize (green).
    if (position === 'left') {
      return (
        <div className={cn(baseClasses, 'gap-2')}>
          <button
            aria-label="Close window"
            className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-700"
            onClick={() =>
              targetWindow === 'settings'
                ? window.api.closeSettingsWindow()
                : window.api.closeWindow()
            }
          ></button>
          <button
            aria-label="Minimize window"
            className="w-4 h-4 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-700"
            onClick={() =>
              targetWindow === 'settings'
                ? window.api.minimizeSettingsWindow()
                : window.api.minimizeWindow()
            }
          ></button>
          <button
            aria-label="Maximize or unmaximize window"
            className="w-4 h-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-700"
            onClick={() =>
              targetWindow === 'settings'
                ? window.api.maximizeUnmaximizeSettingsWindow()
                : window.api.maximizeUnmaximizeWindow()
            }
          ></button>
        </div>
      )
    } else {
      // If macOS buttons are on the right (unconventional, but supported).
      // Order: Maximize (green), Minimize (yellow), Close (red).
      return (
        <div className={cn(baseClasses, 'gap-2')}>
          <button
            aria-label="Maximize or unmaximize window"
            className="w-4 h-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-700"
            onClick={() =>
              targetWindow === 'settings'
                ? window.api.maximizeUnmaximizeSettingsWindow()
                : window.api.maximizeUnmaximizeWindow()
            }
          ></button>
          <button
            aria-label="Minimize window"
            className="w-4 h-4 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-700"
            onClick={() =>
              targetWindow === 'settings'
                ? window.api.minimizeSettingsWindow()
                : window.api.minimizeWindow()
            }
          ></button>
          <button
            aria-label="Close window"
            className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-700"
            onClick={() =>
              targetWindow === 'settings'
                ? window.api.closeSettingsWindow()
                : window.api.closeWindow()
            }
          ></button>
        </div>
      )
    }
  }

  // Render Windows-style buttons (classic).
  // Order: Minimize, Maximize, Close. Reversed if position is 'left'.
  if (type === 'windows') {
    return (
      <div className={cn(baseClasses, orderedClasses)}>
        <button
          aria-label="Minimize window"
          className="w-8 h-6 flex items-center justify-center hover:bg-muted/80 transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          onClick={() =>
            targetWindow === 'settings'
              ? window.api.minimizeSettingsWindow()
              : window.api.minimizeWindow()
          }
        >
          <Minimize2 className="h-2.5 w-2.5 text-white" />
        </button>
        <button
          aria-label="Maximize or unmaximize window"
          className="w-8 h-6 flex items-center justify-center hover:bg-muted/80 transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          onClick={() =>
            targetWindow === 'settings'
              ? window.api.maximizeUnmaximizeSettingsWindow()
              : window.api.maximizeUnmaximizeWindow()
          }
        >
          <Square className="h-2.5 w-2.5 text-white" />
        </button>
        <button
          aria-label="Close window"
          className="w-8 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-red-600"
          onClick={() =>
            targetWindow === 'settings'
              ? window.api.closeSettingsWindow()
              : window.api.closeWindow()
          }
        >
          <X className="h-2.5 w-2.5 text-white" />
        </button>
      </div>
    )
  }

  // Render Windows 11-style buttons (rounded corners).
  // Order: Minimize, Maximize, Close. Reversed if position is 'left'.
  if (type === 'windows11') {
    return (
      <div className={cn(baseClasses, orderedClasses)}>
        <button
          aria-label="Minimize window"
          className="w-8 h-6 flex items-center justify-center hover:bg-muted/80 rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          onClick={() =>
            targetWindow === 'settings'
              ? window.api.minimizeSettingsWindow()
              : window.api.minimizeWindow()
          }
        >
          <Minimize2 className="h-2.5 w-2.5 text-white" />
        </button>
        <button
          aria-label="Maximize or unmaximize window"
          className="w-8 h-6 flex items-center justify-center hover:bg-muted/80 rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          onClick={() =>
            targetWindow === 'settings'
              ? window.api.maximizeUnmaximizeSettingsWindow()
              : window.api.maximizeUnmaximizeWindow()
          }
        >
          <Square className="h-2.5 w-2.5 text-white" />
        </button>
        <button
          aria-label="Close window"
          className="w-8 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-red-600"
          onClick={() =>
            targetWindow === 'settings'
              ? window.api.closeSettingsWindow()
              : window.api.closeWindow()
          }
        >
          <X className="h-2.5 w-2.5 text-white" />
        </button>
      </div>
    )
  }

  // Return null if the decoration type is not recognized.
  return null
}
