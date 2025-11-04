import React from 'react'
import { useTheme } from '../utils/darkMode'
import { Sun, Moon } from 'lucide-react'

/**
 * DarkModeToggle Component
 * A polished toggle button for switching between light and dark modes
 * 
 * Features:
 * - Click to toggle dark mode
 * - Keyboard shortcut: Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows/Linux)
 * - Smooth animations
 * - Accessible with proper ARIA labels
 * - Clean, minimal design
 */
interface DarkModeToggleProps {
  className?: string
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        border border-slate-200 dark:border-slate-700
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-slate-950
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode (Cmd+Shift+D)' : 'Switch to dark mode (Cmd+Shift+D)'}
      role="switch"
      aria-checked={isDarkMode}
      title={isDarkMode ? 'Light Mode (Cmd+Shift+D)' : 'Dark Mode (Cmd+Shift+D)'}
    >
      {/* Sun icon for light mode */}
      <Sun
        className={`
          absolute h-5 w-5 transition-all duration-300
          ${isDarkMode 
            ? 'rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
          }
          text-amber-500
        `}
      />

      {/* Moon icon for dark mode */}
      <Moon
        className={`
          absolute h-5 w-5 transition-all duration-300
          ${isDarkMode 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
          }
          text-blue-400
        `}
      />
    </button>
  )
}
