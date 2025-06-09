/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Props for the Input component, extending standard HTML input attributes.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component - a styled text input field.
 * It applies base styling for appearance, focus states, invalid states, and disabled states.
 *
 * @param {InputProps} props - The props for the Input component.
 * @param {React.Ref<HTMLInputElement>} ref - Forwarded ref to the underlying input element.
 * @returns {React.JSX.Element} The rendered Input component.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input" // Useful for styling or querying
        className={cn(
          // Base styles for the input field
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          // Styles for focus state
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          // Styles for invalid state (e.g., when aria-invalid is true)
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className // Allows for additional custom classes
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input' // Set display name for better debugging

export { Input }
