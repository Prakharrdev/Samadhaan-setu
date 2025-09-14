import React from 'react'
import { useTheme } from './ThemeProvider'

interface DarkModeToggleProps {
  className?: string
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme()
  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center justify-between w-16 h-8 p-1
        bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
        dark:from-slate-700 dark:via-slate-600 dark:to-slate-700
        rounded-full shadow-inner border border-slate-300/50 dark:border-slate-500/50
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-blue-400/20
        active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
        focus:ring-offset-background group
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
    >
      {/* Sun Icon */}
      <span 
        className={`
          flex items-center justify-center w-6 h-6 text-xs transition-all duration-300 z-10
          ${isDarkMode 
            ? 'text-slate-400 dark:text-slate-500 opacity-50 scale-90' 
            : 'text-amber-500 opacity-100 drop-shadow-sm scale-100'
          }
        `}
      >
        🌞
      </span>

      {/* Toggle Knob */}
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full
          bg-gradient-to-br from-white via-slate-50 to-slate-100
          dark:from-slate-200 dark:via-slate-100 dark:to-white
          shadow-lg border border-slate-200 dark:border-slate-300
          transition-all duration-300 ease-in-out
          ${isDarkMode 
            ? 'transform translate-x-8 shadow-blue-400/30' 
            : 'transform translate-x-0 shadow-amber-400/30'
          }
          group-hover:shadow-xl group-hover:scale-105
          before:absolute before:inset-0 before:rounded-full
          before:bg-gradient-to-tr before:from-transparent before:via-white/60 before:to-transparent
          before:opacity-60
          after:absolute after:inset-0.5 after:rounded-full
          after:bg-gradient-to-tr after:from-white/20 after:to-transparent
          after:opacity-80
        `}
        style={{
          boxShadow: isDarkMode 
            ? '0 4px 12px rgba(59, 130, 246, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)' 
            : '0 4px 12px rgba(245, 158, 11, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}
      />

      {/* Moon Icon */}
      <span 
        className={`
          flex items-center justify-center w-6 h-6 text-xs transition-all duration-300 z-10
          ${isDarkMode 
            ? 'text-blue-400 opacity-100 drop-shadow-sm scale-100' 
            : 'text-slate-400 opacity-50 scale-90'
          }
        `}
      >
        🌙
      </span>
    </button>
  )
}