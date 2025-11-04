/**
 * Dark Mode Utility System
 * A portable dark mode solution that can be copied to other projects
 * 
 * Features:
 * - Theme context and hooks for managing dark/light mode
 * - Keyboard shortcut support (Cmd+Shift+D / Ctrl+Shift+D)
 * - localStorage persistence
 * - System preference detection
 * - Easy integration with Tailwind CSS
 */

import React, { createContext, useContext, useEffect, useState } from 'react'

// Type definitions for theme system
export type Theme = 'dark' | 'light' | 'system'

export interface ThemeContextValue {
  theme: Theme
  isDarkMode: boolean
  setTheme: (theme: Theme) => void
  toggleDarkMode: () => void
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

// Color palette configuration for dark mode
// This can be customized based on your design system
export const DARK_MODE_CONFIG = {
  // Light mode colors (these are typically set in CSS variables in :root)
  light: {
    background: '#ffffff',
    foreground: '#0f0f0f',
    card: '#ffffff',
    muted: '#f3f4f6',
    border: 'rgba(0, 0, 0, 0.1)',
    primary: '#1e3a8a',
    secondary: '#f97316',
  },
  // Dark mode colors (applied when .dark class is active)
  dark: {
    background: '#0f0f0f',
    foreground: '#f5f5f5',
    card: '#1a1a1a',
    muted: '#404040',
    border: 'rgba(255, 255, 255, 0.1)',
    primary: '#60a5fa',
    secondary: '#fb923c',
  },
}

// Initial state for the theme context
const initialState: ThemeContextValue = {
  theme: 'system',
  isDarkMode: false,
  setTheme: () => null,
  toggleDarkMode: () => null,
}

// Create the theme context
export const ThemeContext = createContext<ThemeContextValue>(initialState)

/**
 * ThemeProvider Component
 * Wraps your application to provide theme context and manage dark mode
 * 
 * Usage in main App.tsx:
 * <ThemeProvider defaultTheme="system" storageKey="app-theme">
 *   <YourApp />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) {
  // Initialize theme from localStorage or use default
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  // Track whether dark mode is currently active
  const [isDarkMode, setIsDarkMode] = useState(false)

  /**
   * Apply theme changes to the DOM
   * Updates the .dark class on html element and manages CSS variables
   */
  useEffect(() => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    // Determine actual theme to apply
    let activeTheme: 'dark' | 'light' = theme as 'dark' | 'light'

    if (theme === 'system') {
      // Detect system preference
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    // Apply the theme class to enable Tailwind dark: variants
    root.classList.add(activeTheme)
    setIsDarkMode(activeTheme === 'dark')

    // Update the theme attribute for custom CSS targeting
    root.setAttribute('data-theme', activeTheme)
  }, [theme])

  /**
   * Handle keyboard shortcut for toggling dark mode
   * Shortcut: Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows/Linux)
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows/Linux)
      const isToggleShortcut =
        (event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyD'

      if (isToggleShortcut) {
        event.preventDefault()
        toggleDarkMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDarkMode])

  /**
   * Toggle dark mode between light and dark
   * If theme is 'system', switch to explicit dark/light based on current state
   */
  const toggleDarkMode = () => {
    setThemeState((prevTheme) => {
      // If using system preference, switch to explicit theme
      if (prevTheme === 'system') {
        return isDarkMode ? 'light' : 'dark'
      }
      // Otherwise toggle between dark and light
      return prevTheme === 'dark' ? 'light' : 'dark'
    })
  }

  /**
   * Set theme and persist to localStorage
   */
  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  const value: ThemeContextValue = {
    theme,
    isDarkMode,
    setTheme: handleSetTheme,
    toggleDarkMode,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * useTheme Hook
 * Use this hook to access theme context in any component
 * 
 * Example:
 * const { isDarkMode, toggleDarkMode } = useTheme()
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

/**
 * Helper function to get CSS variable based on dark mode
 * Useful for conditional styling in components
 * 
 * Example:
 * const bgColor = getThemeColor('background', isDarkMode)
 */
export function getThemeColor(
  colorName: keyof typeof DARK_MODE_CONFIG.dark,
  isDarkMode: boolean
): string {
  const palette = isDarkMode ? DARK_MODE_CONFIG.dark : DARK_MODE_CONFIG.light
  return palette[colorName] as string
}

/**
 * Get contrast color for text based on background
 * Useful for ensuring text readability in both themes
 */
export function getContrastColor(isDarkMode: boolean): string {
  return isDarkMode ? '#ffffff' : '#000000'
}

/**
 * Utility to merge dark mode classes with regular Tailwind classes
 * This helps organize conditional dark mode styling
 * 
 * Example:
 * className={mergeDarkClasses('bg-white', 'dark:bg-slate-950')}
 */
export function mergeDarkClasses(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}