# Dark Mode System - Portable Implementation Guide

A complete, reusable dark mode solution that can be copied to any React + Tailwind CSS project.

## Quick Start

### 1. Copy These Files to Your Project

Copy to `src/utils/`:
- `darkMode.ts` - The core theme system

Copy to `src/components/`:
- `DarkModeToggle.tsx` - The toggle button component

Copy to `src/styles/`:
- Update your `globals.css` with the dark mode color variables (see below)

### 2. Update Your Root App Component

Replace your `ThemeProvider` import:

```tsx
// OLD
import { ThemeProvider } from './components/ThemeProvider'

// NEW
import { ThemeProvider } from './utils/darkMode'
```

That's it! The `ThemeProvider` is a drop-in replacement.

### 3. Add Dark Mode Toggle to Your Header/Navigation

```tsx
import DarkModeToggle from './components/DarkModeToggle'

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1>My App</h1>
      <DarkModeToggle />
    </header>
  )
}
```

## Features

✅ **Click Toggle** - Click the sun/moon icon to switch themes
✅ **Keyboard Shortcut** - Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows/Linux)
✅ **System Preference Detection** - Respects OS dark mode setting
✅ **Persistent Storage** - Remembers user's theme choice
✅ **Tailwind Integration** - Works with `dark:` class utilities
✅ **Zero Configuration** - Works out of the box
✅ **Type Safe** - Full TypeScript support
✅ **Accessible** - ARIA labels and proper semantics

## Using Dark Mode in Components

### Method 1: Using Tailwind `dark:` Classes (Recommended)

```tsx
export function MyComponent() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <h1 className="text-black dark:text-white">Title</h1>
      <p className="text-gray-600 dark:text-gray-300">Content</p>
    </div>
  )
}
```

### Method 2: Using the useTheme Hook

```tsx
import { useTheme } from '../utils/darkMode'

export function MyComponent() {
  const { isDarkMode } = useTheme()

  return (
    <div className={isDarkMode ? 'bg-black' : 'bg-white'}>
      Content
    </div>
  )
}
```

### Method 3: Using Theme Colors Helper

```tsx
import { useTheme, getThemeColor } from '../utils/darkMode'

export function MyComponent() {
  const { isDarkMode } = useTheme()
  const bgColor = getThemeColor('background', isDarkMode)

  return <div style={{ backgroundColor: bgColor }}>Content</div>
}
```

## CSS Color Variables

The system uses CSS variables for theming. Add these to your `globals.css`:

### Light Mode (`:root`)
```css
:root {
  --background: #ffffff;
  --foreground: #0f0f0f;
  --card: #ffffff;
  --card-foreground: #0f0f0f;
  --primary: #1e3a8a;
  --secondary: #f97316;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
}
```

### Dark Mode (`.dark`)
```css
.dark {
  --background: #0f0f0f;
  --foreground: #f5f5f5;
  --card: #1a1a1a;
  --card-foreground: #f5f5f5;
  --primary: #60a5fa;
  --secondary: #fb923c;
  --muted: #404040;
  --muted-foreground: #a0a0a0;
  --border: #2a2a2a;
  --input: #2a2a2a;
}
```

## Customization

### Change Default Theme

```tsx
<ThemeProvider defaultTheme="light" storageKey="my-app-theme">
  <App />
</ThemeProvider>
```

Options: `'light' | 'dark' | 'system'`

### Customize Colors

Edit the `DARK_MODE_CONFIG` object in `src/utils/darkMode.ts`:

```tsx
export const DARK_MODE_CONFIG = {
  light: {
    background: '#ffffff',
    primary: '#1e3a8a',
    // ... customize as needed
  },
  dark: {
    background: '#0f0f0f',
    primary: '#60a5fa',
    // ... customize as needed
  },
}
```

### Change Keyboard Shortcut

Edit the keyboard handler in `src/utils/darkMode.ts`:

```tsx
const isToggleShortcut =
  (event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyD'
```

Change `KeyD` to any other key code you prefer.

## File Structure

```
src/
├── utils/
│   └── darkMode.ts           # Core theme system (REUSABLE)
├── components/
│   └── DarkModeToggle.tsx     # Toggle button (REUSABLE)
├── styles/
│   └── globals.css           # Color variables
└── App.tsx                    # Use ThemeProvider here
```

## API Reference

### ThemeProvider Props

```tsx
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'  // default: 'system'
  storageKey?: string                          // default: 'theme'
}
```

### useTheme Hook

```tsx
interface ThemeContextValue {
  theme: 'dark' | 'light' | 'system'
  isDarkMode: boolean
  setTheme: (theme: Theme) => void
  toggleDarkMode: () => void
}
```

### Helper Functions

```tsx
// Get theme color based on mode
getThemeColor(colorName: string, isDarkMode: boolean): string

// Get contrast text color
getContrastColor(isDarkMode: boolean): string

// Merge Tailwind classes for dark mode
mergeDarkClasses(...classes: string[]): string
```

## Best Practices

1. **Use Tailwind's `dark:` variant** - It's the most efficient and requires no JavaScript
   ```tsx
   ✅ <div className="bg-white dark:bg-black">
   ❌ <div style={{ background: isDarkMode ? 'black' : 'white' }}>
   ```

2. **Test in both themes** - Always preview your components in dark mode

3. **Ensure sufficient contrast** - Use color tools to verify WCAG compliance

4. **Use CSS variables for consistency** - Reference `--primary`, `--background`, etc.

5. **Group dark mode styles** - Keep related light/dark utilities together

## Troubleshooting

### Dark mode not working?
- Ensure `ThemeProvider` wraps your entire app in `App.tsx`
- Check that HTML element has the `.dark` class
- Verify CSS variables are defined in `globals.css`

### Colors not changing?
- Make sure you're using the Tailwind `dark:` prefix
- Check browser DevTools - should see `<html class="dark">` when dark mode is on
- Verify `globals.css` has both light and dark CSS variables

### Keyboard shortcut not working?
- Ensure event listener is attached (check console for errors)
- Try the keyboard shortcut: `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows)
- Verify `useTheme` hook is available in the component

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ⚠️ Requires polyfills

## Performance

- Minimal JavaScript overhead
- Uses CSS custom properties for fast theme switching
- No re-renders unless theme changes
- Keyboard shortcut handled with event delegation

## License

This dark mode system is provided as-is and can be freely used in your projects.

---

**Questions?** Check the inline comments in `darkMode.ts` for detailed explanations.
