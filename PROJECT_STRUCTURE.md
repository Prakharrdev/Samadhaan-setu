# Samadhaan Setu - Project Structure Documentation

Complete guide to the project file organization and where to find specific functionality.

## Directory Structure

```
src/
├── App.tsx                          # Main application root component
├── main.tsx                         # Vite entry point
├── index.css                        # Global styles (imports Tailwind)
│
├── components/                      # React Components
│   ├── ui/                         # UI component library (50+ files)
│   │   ├── button.tsx              # Button component
│   │   ├── card.tsx                # Card component
│   │   ├── dialog.tsx              # Dialog/Modal component
│   │   ├── input.tsx               # Input component
│   │   ├── label.tsx               # Label component
│   │   ├── badge.tsx               # Badge component
│   │   ├── alert.tsx               # Alert component
│   │   ├── tabs.tsx                # Tabs component
│   │   ├── sidebar.tsx             # Sidebar component
│   │   ├── sonner.tsx              # Toast notifications
│   │   └── ... (40+ more UI components)
│   │
│   ├── figma/                      # Figma integration
│   │   └── ImageWithFallback.tsx   # Image component with fallback
│   │
│   ├── auth/
│   │   ├── AuthLogin.tsx           # Login page with 2-step verification
│   │   ├── AuthSignup.tsx          # User registration
│   │   ├── AuthorityActivation.tsx # Authority account activation
│   │   ├── RoleSelection.tsx       # Role selection after signup
│   │   ├── PasswordValidation.tsx  # Password strength indicator
│   │   └── FeedbackDialog.tsx      # Feedback modal
│   │
│   ├── dashboards/
│   │   ├── CitizenDashboard.tsx    # Citizen main dashboard
│   │   │   ├── Issue creation form
│   │   │   ├── My tickets list
│   │   │   ├── Nearby issues map
│   │   │   ���── Issue heatmap
│   │   │
│   │   ├── AuthorityDashboard.tsx  # Authority/officer dashboard
│   │   │   ├── Metrics overview
│   │   │   ├── Officer management
│   │   │   ├── Performance analytics
│   │   │   └── SLA tracking
│   │   │
│   │   └── AdvancedAnalyticsDashboard.tsx
│   │
│   ├── features/
│   │   ├── RaiseTicketFlow.tsx     # Complete ticket creation workflow
│   │   ├── TicketsList.tsx         # Tickets list with filtering
│   │   ├── NearbyIssues.tsx        # Nearby issues with map
│   │   ├── IssueHeatmap.tsx        # Heatmap visualization
│   │   ├── InteractiveIssueMap.tsx # Interactive map component
│   │   ├── SLADashboard.tsx        # SLA metrics display
│   │   ├── SLATimer.tsx            # Individual SLA countdown
│   │   ├── NotificationCenter.tsx  # Notifications panel
│   │   ├── OfficerManagement.tsx   # Officer CRUD operations
│   │   ├── AuthorityInvitationManagement.tsx # Invitation system
│   │   ├── EditableProfile.tsx     # User profile editor
│   │   └── LocationPermissionGate.tsx # Location permission handler
│   │
│   ├── pages/
│   ��   ├── LandingPage.tsx         # Home/landing page
│   │   └── Footer.tsx              # Footer component
│   │
│   ├── theme/
│   │   ├── DarkModeToggle.tsx      # Dark mode toggle button
│   │   └── ThemeProvider.tsx       # DEPRECATED (use utils/auth instead)
│   │
│   └── utilities/
│       ├── ErrorBoundary.tsx       # React error boundary
│       ├── InvitationEmailTemplate.tsx # Email template
│       └── Attributions.md         # Third-party attributions
│
├── utils/                           # Utility functions & API client
│   ├── auth/                       # NEW: Authentication module (modular)
│   │   ├── index.ts               # Export barrel file
│   │   ├── types.ts               # Type definitions
│   │   ├── handler.ts             # Main auth logic (super admin → Supabase)
│   │   └── superAdminAuth.ts      # Super admin handlers
│   │
│   ├── api.tsx                     # API client & all API endpoints
│   │   ├── getAuthHeaders()        # Get auth headers
│   │   ├── authAPI                 # Auth endpoints
│   │   ├── ticketsAPI              # Ticket endpoints
│   │   ├── profileAPI              # Profile endpoints
│   │   ├── uploadAPI               # File upload
│   │   └── notificationsAPI        # Notifications endpoints
│   │
│   ├── supabase/
│   │   ├── client.tsx             # Supabase client singleton
│   │   └── info.tsx               # Project ID & anon key
│   │
│   ├── darkMode.ts                # Dark mode system (reusable)
│   │   ├── ThemeProvider          # Context provider
│   │   ├── useTheme               # Hook
│   │   ├── Keyboard shortcut      # Cmd/Ctrl+Shift+D
│   │   └── Helper functions       # Color utilities
│   │
│   └── profileStorage.ts          # LocalStorage profile caching
│
├── config/                         # Configuration & constants
│   └── superAdmin.ts             # NEW: Hardcoded super admin accounts
│       ├── SUPER_ADMINS[]         # Super admin list
│       ├── verifySuperAdminCredentials()
│       └── isSuperAdmin()
│
├── styles/
│   └── globals.css               # Global CSS variables & Tailwind
│       ├── :root (light mode)    # Light theme colors
│       └── .dark (dark mode)     # Dark theme colors
│
├── guidelines/
│   └── Guidelines.md             # Development guidelines
│
├── supabase/functions/server/    # Supabase Edge Functions
│   ├── index.tsx                 # Main function handler
│   └── kv_store.tsx              # Key-value store (Redis-like)
│
├── DARK_MODE_SETUP.md            # Dark mode documentation
├── Attributions.md               # Third-party credits
└── README.md                     # Project README
```

---

## Key Files & Their Purpose

### Authentication System

| File | Purpose |
|------|---------|
| `src/utils/auth/index.ts` | **START HERE** - Main auth exports |
| `src/utils/auth/handler.ts` | Core auth logic (super admin → Supabase fallback) |
| `src/utils/auth/types.ts` | TypeScript interfaces for auth |
| `src/utils/auth/superAdminAuth.ts` | Super admin credential verification |
| `src/config/superAdmin.ts` | Hardcoded super admin accounts (DEV ONLY) |
| `src/components/AuthLogin.tsx` | Login UI component |
| `src/components/AuthSignup.tsx` | Registration UI component |

### API & Backend

| File | Purpose |
|------|---------|
| `src/utils/api.tsx` | **API ENDPOINTS** - All API calls defined here |
| `src/utils/supabase/client.tsx` | Supabase client initialization |
| `src/supabase/functions/server/` | Supabase Edge Functions |

### User Dashboards

| File | Purpose |
|------|---------|
| `src/components/CitizenDashboard.tsx` | Citizen portal (raise issues, view tickets) |
| `src/components/AuthorityDashboard.tsx` | Authority portal (manage issues, metrics) |
| `src/components/AdvancedAnalyticsDashboard.tsx` | Advanced analytics for officers |

### Feature Components

| File | Purpose |
|------|---------|
| `src/components/RaiseTicketFlow.tsx` | Create ticket workflow |
| `src/components/IssueHeatmap.tsx` | Heatmap visualization |
| `src/components/NotificationCenter.tsx` | Real-time notifications |
| `src/components/OfficerManagement.tsx` | Manage officers |

### Theme & Styling

| File | Purpose |
|------|---------|
| `src/utils/darkMode.ts` | Dark mode system (reusable, documented) |
| `src/components/DarkModeToggle.tsx` | Dark mode toggle button |
| `src/styles/globals.css` | CSS variables & Tailwind config |

---

## Common Tasks & Where to Find Code

### Adding a New Feature

1. **Create API endpoint** → `src/utils/api.tsx` (add new API function)
2. **Create component** → `src/components/` (create new TSX file)
3. **Add to route** → `src/App.tsx` (add route)
4. **Style** → Use Tailwind classes or `src/styles/globals.css`

### Modifying Authentication

1. **Change login flow** → `src/components/AuthLogin.tsx`
2. **Update auth logic** → `src/utils/auth/handler.ts`
3. **Add super admin** → Edit `src/config/superAdmin.ts`

### Adding API Endpoints

All API calls are in `src/utils/api.tsx`. Structure:

```typescript
export const featureAPI = {
  endpoint1: async (params) => { /* implementation */ },
  endpoint2: async (params) => { /* implementation */ }
}
```

### Changing Colors/Theme

1. **Global colors** → `src/styles/globals.css` (:root and .dark sections)
2. **Component styles** → Modify Tailwind classes in component
3. **Dark mode support** → Use `dark:` prefix in Tailwind classes

### Adding Dark Mode Support to Component

```typescript
<div className="bg-white dark:bg-slate-950 text-black dark:text-white">
  Content
</div>
```

---

## Data Flow

### User Login Flow

```
AuthLogin.tsx
    ↓
signIn(email, password)  [src/utils/auth/handler.ts]
    ↓
    ├─→ checkSuperAdminCredentials()  [src/config/superAdmin.ts]
    │       ↓
    │   MATCH? → Return super admin user + session
    │
    └─→ supabase.auth.signInWithPassword()
            ↓
        MATCH? → Return Supabase session
    ↓
App.tsx → Update app state → Navigate to dashboard
```

### API Request Flow

```
Component (e.g., RaiseTicketFlow.tsx)
    ↓
ticketsAPI.submit(data)  [src/utils/api.tsx]
    ↓
getAuthHeaders()  [returns auth token]
    ↓
fetch(`${API_BASE}/tickets`, { headers, body: JSON.stringify(data) })
    ↓
Supabase Edge Function / Backend
    ↓
Response → Update component state
```

### Dark Mode Toggle

```
DarkModeToggle.tsx (click)
    ↓
useTheme().toggleDarkMode()  [src/utils/darkMode.ts]
    ↓
root.classList.add('dark')  [or 'light']
    ↓
CSS responds to .dark selector
    ↓
All components with dark: classes update
```

---

## Important Notes

### Super Admin (Development Only)

- **File:** `src/config/superAdmin.ts`
- **Enabled in:** Development mode only
- **Default credentials:**
  - Email: `admin@samadhaansetu.gov`
  - Password: `Imtheadminofdb`
- **How it works:** Hardcoded check before Supabase auth
- **Security:** Never use in production - remove this file before deploying

### API Endpoints

All API calls go through `src/utils/api.tsx`. This is the single source of truth for:
- Authentication endpoints
- Ticket management
- Profile management
- Notifications
- Analytics

### Dark Mode System

The dark mode system in `src/utils/darkMode.ts` is **production-ready and reusable**. It can be copied to other projects with minimal changes:
1. Copy `src/utils/darkMode.ts`
2. Import `ThemeProvider` in App
3. Use `dark:` classes in components
4. Add CSS variables to `globals.css`

---

## File Organization Rationale

### Why This Structure?

1. **Components in `src/components/`**
   - All React components grouped together
   - UI library (`ui/`) separate from feature components
   - Easy to find and update components

2. **Utils in `src/utils/`**
   - Auth module has its own directory for clarity
   - API calls all in one file (easy to find endpoints)
   - Supabase client centralized

3. **Config in `src/config/`**
   - Hardcoded values (super admin) separate
   - Easy to find and manage constants
   - Can be easily moved to environment variables

4. **Styles in `src/styles/`**
   - Global CSS organized
   - Theme variables defined once
   - Dark mode variants co-located

### For Next.js Migration

This structure maps cleanly to Next.js:
- `components/` → `src/components/` (same)
- `utils/` → `src/lib/` (Next.js convention)
- `config/` → `src/config/` (same)
- `styles/` → `src/app/` (Next.js app directory)

---

## Dependencies & Versions

Key dependencies used in the project:

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend & auth
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Radix UI** - Accessible UI primitives (via shadcn/ui)
- **Sonner** - Toast notifications

---

## Maintenance Tips

1. **Keep API calls in one file** - Makes it easy to add/modify endpoints
2. **Use component structure** - Group related components together
3. **Centralize styles** - Use `globals.css` for global theme
4. **Comment complex logic** - Especially in utils/auth/
5. **Test dark mode** - Always verify `dark:` classes work

---

## Quick Reference

### Import Paths
```typescript
// Auth
import { signIn, getSession } from '../utils/auth'

// API
import { ticketsAPI, profileAPI } from '../utils/api'

// Theme
import { useTheme } from '../utils/darkMode'

// UI Components
import { Button } from './ui/button'
import { Card } from './ui/card'
```

### Common Patterns

**Using super admin**
```typescript
import { isSuperAdmin } from '../utils/auth'
const isAdmin = isSuperAdmin(user)
```

**Making API calls**
```typescript
import { ticketsAPI } from '../utils/api'
const tickets = await ticketsAPI.getMyTickets()
```

**Dark mode in components**
```typescript
<div className="bg-white dark:bg-slate-950">
  Content here
</div>
```

---

**Last Updated:** 2024
**Maintained By:** Development Team
