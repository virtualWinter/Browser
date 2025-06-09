import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names or class name objects into a single string,
 * and merges Tailwind CSS classes intelligently to avoid conflicts.
 *
 * This utility function uses `clsx` to handle conditional class names and arrays of class names,
 * and then pipes the result through `tailwind-merge` to resolve conflicting Tailwind utility classes.
 * For example, `twMerge(clsx('p-4', 'p-2'))` would result in `'p-2'`, as `p-2` overrides `p-4`.
 *
 * @param {...ClassValue[]} inputs - An array of class values.
 *   A class value can be a string, an array of strings, or an object where keys are class names
 *   and values are booleans indicating whether the class should be included.
 * @returns {string} A string of combined and merged class names.
 *
 * @example
 * cn('text-red-500', { 'bg-blue-500': true, 'p-4': false }, ['m-2', 'font-bold'])
 * // Might result in: "text-red-500 bg-blue-500 m-2 font-bold" (depending on Tailwind Merge behavior)
 *
 * cn('px-2 py-1 bg-red hover:bg-dark-red', 'p-4')
 * // Results in: "hover:bg-dark-red p-4" (Tailwind Merge resolves conflicts)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
