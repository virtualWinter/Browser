import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Defines the visual variants for the Button component using `class-variance-authority`.
 * This includes different styles (default, destructive, outline, etc.) and sizes (default, sm, lg, icon).
 *
 * Base classes define common styles like flex layout, text properties, transitions, and disabled states.
 * Variant-specific classes override or add to these base styles.
 */
const buttonVariants = cva(
  // Base classes applied to all buttons
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      /**
       * Defines the visual style of the button.
       * - `default`: Primary button style.
       * - `destructive`: Button for actions that delete data or have significant consequences.
       * - `outline`: Button with a border and transparent background.
       * - `secondary`: Secondary button style.
       * - `ghost`: Button with no background or border, often used for less prominent actions.
       * - `link`: Button styled as a hyperlink.
       */
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      /**
       * Defines the size of the button.
       * - `default`: Standard button size.
       * - `sm`: Small button size.
       * - `lg`: Large button size.
       * - `icon`: Button optimized for containing only an icon.
       */
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3', // Adjusts padding if an SVG icon is a direct child
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9' // Square button for icons
      }
    },
    // Default variants applied if not specified by props
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

/**
 * Props for the Button component, extending standard HTML button attributes
 * and variant props defined by `buttonVariants`.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * If `true`, the button will render as a `Slot` component from `@radix-ui/react-slot`.
   * This allows the button to merge its props and behavior with its immediate child element,
   * effectively "passing through" its styling and functionality to a custom component or HTML element.
   * @default false
   */
  asChild?: boolean
}

/**
 * A versatile button component with predefined visual styles and sizes.
 * It leverages `class-variance-authority` for managing variants and `clsx` (via `cn`) for conditional class names.
 * Supports an `asChild` prop to render as a Radix UI Slot, allowing for flexible composition.
 *
 * @param {ButtonProps} props - The props for the Button component.
 * @param {React.Ref<HTMLButtonElement>} ref - Forwarded ref to the underlying button element.
 * @returns {React.JSX.Element} The rendered Button component.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Determine if the component should render as a <button> or a <Slot>
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        data-slot="button" // Useful for styling or querying
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button' // Set display name for better debugging

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
