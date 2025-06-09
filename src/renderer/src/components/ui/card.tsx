/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Card component - a container for grouping related information.
 * It applies base styling for background, text color, padding, border, and shadow.
 *
 * @param {React.ComponentProps<'div'>} props - Standard div props including className.
 * @returns {React.JSX.Element} The rendered Card component.
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

/**
 * CardHeader component - a section for the header content of a Card.
 * It provides specific padding and layout for header elements, supporting an optional action slot.
 *
 * @param {React.ComponentProps<'div'>} props - Standard div props including className.
 * @returns {React.JSX.Element} The rendered CardHeader component.
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        // Uses CSS container queries (@container) for responsive adjustments within the header.
        // Defines a grid layout, adjusting columns if a 'card-action' slot is present.
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

/**
 * CardTitle component - for displaying the main title within a CardHeader.
 *
 * @param {React.ComponentProps<'div'>} props - Standard div props including className.
 * Should be `React.HTMLAttributes<HTMLHeadingElement>` if it were an `h` tag.
 * @returns {React.JSX.Element} The rendered CardTitle component.
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 // Changed to h3 for semantic correctness, adjust as needed (e.g., h2, h4)
      ref={ref}
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

/**
 * CardDescription component - for displaying a description or subtitle within a CardHeader.
 *
 * @param {React.ComponentProps<'div'>} props - Standard div props including className.
 * Should be `React.HTMLAttributes<HTMLParagraphElement>` if it were a `p` tag.
 * @returns {React.JSX.Element} The rendered CardDescription component.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p // Changed to p for semantic correctness
    ref={ref}
    data-slot="card-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * CardAction component - a slot typically within CardHeader for actions like buttons or menus.
 * It's positioned to the right side of the header.
 *
 * @param {React.ComponentProps<'div'>} props - Standard div props including className.
 * @returns {React.JSX.Element} The rendered CardAction component.
 */
const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      // Positions the action in the grid layout of CardHeader
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
)
CardAction.displayName = 'CardAction'

/**
 * CardContent component - the main content area of a Card.
 *
 * @param {React.ComponentProps<'div'>} props - Standard div props including className.
 * @returns {React.JSX.Element} The rendered CardContent component.
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-content" className={cn('px-6', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

/**
 * CardFooter component - a section for footer content or actions at the bottom of a Card.
 *
 * @param {React.ComponentProps<'div'>} props - Standard div props including className.
 * @returns {React.JSX.Element} The rendered CardFooter component.
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      // Adds top padding if the preceding element has a bottom border (e.g., CardContent with a separator)
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
