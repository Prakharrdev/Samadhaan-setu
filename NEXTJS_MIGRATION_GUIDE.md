# Next.js Migration Guide for Samadhaan Setu

A comprehensive guide for migrating the Samadhaan Setu application from Vite + React to Next.js.

## Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Step-by-Step Migration](#step-by-step-migration)
3. [Key Architectural Changes](#key-architectural-changes)
4. [Super Admin Configuration](#super-admin-configuration)
5. [Authentication System](#authentication-system)
6. [API Routes Migration](#api-routes-migration)
7. [Environment Setup](#environment-setup)
8. [Testing & Deployment](#testing--deployment)
9. [Troubleshooting](#troubleshooting)

---

## Project Structure Overview

### Current (Vite) Structure

```
src/
├── components/          # React components
│   ├── ui/             # UI component library
│   ├── Auth*.tsx       # Authentication components
│   ├── Dashboard.tsx    # Dashboard components
│   └── ...
├── utils/
│   ├── api.tsx         # API calls (monolithic)
│   ├── auth/           # NEW: Auth utilities (modular)
│   │   ├── types.ts
│   │   ├── handler.ts
│   │   ├── superAdminAuth.ts
│   │   └── index.ts
│   ├── supabase/       # Supabase client configuration
│   └── darkMode.ts     # Theme system
├── config/
│   └── superAdmin.ts   # NEW: Super admin hardcoded credentials
├── styles/
│   └── globals.css     # Global styles
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

### Target (Next.js) Structure

```
samadhaan-setu-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home page
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # Dashboard layout
│   │   │   ├── page.tsx                 # Dashboard root
│   │   │   ├── citizen/page.tsx         # Citizen dashboard
│   │   │   └── authority/page.tsx       # Authority dashboard
│   │   ├── api/                         # API routes
│   │   │   ├── auth/
│   │   │   │   ├── signin/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── tickets/route.ts
│   │   │   └── ...
│   │   └── globals.css                  # Global styles
│   ├── components/                      # React components (same as current)
│   │   ├── ui/
│   │   ├── Auth*.tsx
│   │   └── ...
│   ├── lib/                            # Utilities & helpers
│   │   ├── auth/                       # Auth module (copied from src/utils/auth)
│   │   │   ├── types.ts
│   │   │   ├── handler.ts
│   │   │   ├── superAdminAuth.ts
│   │   │   └── index.ts
│   │   ├── api/                        # API utilities
│   │   │   ├── tickets.ts
│   │   │   ├── profile.ts
│   │   │   ├── notifications.ts
│   │   │   └── client.ts              # Shared fetch client
│   │   ├── supabase/                  # Supabase client
│   │   │   ├── client.ts
│   │   │   └── server.ts              # NEW: Server-side Supabase client
│   │   ├── darkMode.ts                # Theme system
│   │   ├── constants.ts               # App constants & config
│   │   └── utils.ts                   # Helper functions
│   ├── config/                        # Configuration
│   │   └── superAdmin.ts              # Super admin credentials
│   ├── middleware.ts                  # Next.js middleware
│   └── providers.tsx                  # Context providers
├── public/                            # Static assets
├── .env.local                         # Environment variables
├── next.config.ts                     # Next.js configuration
├── tsconfig.json                      # TypeScript config
└── package.json
```

---

## Step-by-Step Migration

### Phase 1: Project Setup

#### 1.1 Create Next.js Project

```bash
# Create a new Next.js project
npx create-next-app@latest samadhaan-setu-nextjs \
  --typescript \
  --tailwind \
  --app \
  --no-git

cd samadhaan-setu-nextjs
```

#### 1.2 Install Dependencies

```bash
npm install @supabase/supabase-js lucide-react recharts zustand
npm install -D tailwindcss postcss autoprefixer
```

#### 1.3 Copy Assets

```bash
# Copy these directories from the current project:
cp -r ../src/components src/
cp -r ../public/* public/
cp src/styles/globals.css src/app/globals.css
```

### Phase 2: Core Utilities Migration

#### 2.1 Copy Auth Module

```bash
# Copy the entire auth module
cp -r ../src/utils/auth src/lib/auth
```

**Files to copy:**
- `src/utils/auth/types.ts` → `src/lib/auth/types.ts`
- `src/utils/auth/handler.ts` → `src/lib/auth/handler.ts`
- `src/utils/auth/superAdminAuth.ts` → `src/lib/auth/superAdminAuth.ts`
- `src/utils/auth/index.ts` → `src/lib/auth/index.ts`

#### 2.2 Copy Super Admin Config

```bash
# Copy super admin configuration
cp ../src/config/superAdmin.ts src/config/superAdmin.ts
```

#### 2.3 Copy Other Utilities

```bash
# Copy dark mode
cp ../src/utils/darkMode.ts src/lib/darkMode.ts

# Copy Supabase client
cp ../src/utils/supabase/client.tsx src/lib/supabase/client.ts
cp ../src/utils/supabase/info.tsx src/lib/supabase/info.ts
```

### Phase 3: API Routes Migration

#### 3.1 Create API Client Utilities

**File: `src/lib/api/client.ts`**

```typescript
/**
 * Shared API client for making authenticated requests
 * Works with both Supabase and Super Admin authentication
 */

import { getAuthHeaders } from '../auth'

const API_BASE = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID
  ? `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-a75d69fe`
  : 'http://localhost:3000/api'

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders()
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  put: <T = any>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' })
}
```

#### 3.2 Create Feature-Specific API Modules

**File: `src/lib/api/tickets.ts`**

```typescript
/**
 * Tickets API - All ticket-related API calls
 * REUSABLE: Can be used in client and server components
 */

import { api } from './client'

export const ticketsAPI = {
  submit: (data: any) => api.post('/tickets', data),
  getMyTickets: () => api.get('/tickets/my'),
  getNearbyTickets: (lat: number, lng: number, radius?: number) =>
    api.get(`/tickets/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5}`),
  updateStatus: (id: string, status: string, resolution?: string, proofImageUrl?: string) =>
    api.put(`/tickets/${id}/status`, { status, resolution, proofImageUrl }),
  upvote: (id: string) => api.post(`/tickets/${id}/upvote`, {}),
  getHeatmapData: (timeFilter: string, wardFilter: string) =>
    api.get(`/tickets/heatmap?timeFilter=${timeFilter}&wardFilter=${wardFilter}`),
  getAllTickets: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/tickets/all?${query}`)
  },
  submitFeedback: (id: string, approved: boolean, comments?: string) =>
    api.post(`/tickets/${id}/feedback`, { approved, comments }),
  getSLAStats: () => api.get('/tickets/sla-stats'),
  getPerformanceMetrics: (timeRange: string, ward: string) =>
    api.get(`/tickets/performance-metrics?timeRange=${timeRange}&ward=${ward}`),
  getTrendAnalytics: (timeRange: string, ward: string) =>
    api.get(`/tickets/trend-analytics?timeRange=${timeRange}&ward=${ward}`),
  getPredictiveInsights: (ward: string) =>
    api.get(`/tickets/predictive-insights?ward=${ward}`)
}
```

**File: `src/lib/api/profile.ts`**

```typescript
/**
 * Profile API - User profile related calls
 */

import { api } from './client'

export const profileAPI = {
  updateProfile: (data: any) => api.put('/profile', data),
  getProfile: () => api.get('/profile'),
  sendProfileUpdateOTP: (email: string) => api.post('/profile/send-otp', { email }),
  verifyProfileUpdateOTP: (otp: string, profileData: any) =>
    api.post('/profile/verify-otp', { otp, profileData })
}
```

**File: `src/lib/api/notifications.ts`**

```typescript
/**
 * Notifications API
 */

import { api } from './client'

export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.put('/notifications/mark-all-read', {})
}
```

**File: `src/lib/api/index.ts`**

```typescript
/**
 * API Module Exports
 * Central export point for all API utilities
 */

export * from './client'
export { api, ticketsAPI } from './tickets'
export { profileAPI } from './profile'
export { notificationsAPI } from './notifications'
```

### Phase 4: Create Next.js Pages

#### 4.1 Root Layout

**File: `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { ThemeProvider } from '../components/ThemeProvider'
import { Toaster } from '../components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Samadhaan Setu',
  description: 'Report Civic Issues, Build Better Communities'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="samadhaan-setu-theme">
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

#### 4.2 Home Page (Landing)

**File: `src/app/page.tsx`**

```typescript
'use client'

import LandingPage from '@/components/LandingPage'

export default function Home() {
  return <LandingPage />
}
```

#### 4.3 Login Page

**File: `src/app/login/page.tsx`**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import AuthLogin from '@/components/AuthLogin'

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = () => {
    router.push('/dashboard')
  }

  const handleSwitchToSignup = () => {
    router.push('/signup')
  }

  return (
    <AuthLogin
      onLoginSuccess={handleLoginSuccess}
      onSwitchToSignup={handleSwitchToSignup}
    />
  )
}
```

### Phase 5: Middleware Setup

**File: `src/middleware.ts`**

```typescript
/**
 * Next.js Middleware
 * Handles authentication checks and route protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './lib/auth'

const protectedRoutes = ['/dashboard', '/profile', '/tickets']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    try {
      const session = await getSession()

      if (!session) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## Key Architectural Changes

### Authentication Flow

#### Before (Vite + React)
```
Client Component
    ↓
authAPI.signIn() (direct Supabase call)
    ↓
Supabase Auth
    ↓
Session stored in localStorage
```

#### After (Next.js)
```
Client Component
    ↓
signIn() (checks super admin first, then Supabase)
    ↓
┌─────────────────────────┬─────────────────────┐
│                         │                     │
Super Admin Config    Supabase Auth
│                         │                     │
└─────────────────────────┴─────────────────────┘
    ↓
Session (localStorage for super admin, HTTP-only cookie for Supabase)
    ↓
Next.js Middleware validates session
```

### API Requests

#### Before
```
Component
    ↓
fetch() with manual headers
    ↓
Backend Supabase Function
```

#### After
```
Client Component / Server Component
    ↓
api.post/get/put/delete()
    ↓
getAuthHeaders() (handles both auth types)
    ↓
Backend (can be Supabase Function or Next.js API Route)
```

---

## Super Admin Configuration

### Adding Super Admins

**File: `src/config/superAdmin.ts`**

```typescript
export const SUPER_ADMINS = [
  {
    id: 'super-admin-001',
    email: 'admin@samadhaansetu.gov',
    password: 'Imtheadminofdb',
    name: 'System Administrator',
    role: 'authority' as const,
    permissions: ['all'] as const,
    department: 'System Administration',
    designation: 'Super Admin'
  },
  // Add more super admins here
  {
    id: 'super-admin-002',
    email: 'developer@samadhaansetu.gov',
    password: 'DevPassword123',
    name: 'Developer Account',
    role: 'authority' as const,
    permissions: ['all'] as const,
    department: 'Development',
    designation: 'Developer'
  }
]
```

### Disabling Super Admin in Production

**File: `.env.production`**

```bash
# Set to false to disable super admin access
NEXT_PUBLIC_SUPER_ADMIN_ENABLED=false
```

**File: `src/config/superAdmin.ts`**

```typescript
export const SUPER_ADMIN_ENABLED = process.env.NODE_ENV === 'development' && 
  process.env.NEXT_PUBLIC_SUPER_ADMIN_ENABLED !== 'false'
```

---

## Authentication System

### Using Auth in Components

**Client Component:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getSession, isCurrentUserSuperAdmin } from '@/lib/auth'

export function MyComponent() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const isAdmin = await isCurrentUserSuperAdmin()
      setIsSuperAdmin(isAdmin)
    }

    checkAdmin()
  }, [])

  return (
    <div>
      {isSuperAdmin && <p>You are a super admin</p>}
    </div>
  )
}
```

**Server Component (Next.js 13+):**

```typescript
import { getSession } from '@/lib/auth'

export async function ServerComponent() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      {/* Protected content */}
    </div>
  )
}
```

---

## API Routes Migration

### Converting Supabase Functions to Next.js API Routes

**Old (Supabase Function):**

```typescript
// supabase/functions/tickets/index.ts
export async function POST(req: Request) {
  // Create ticket logic
}
```

**New (Next.js API Route):**

```typescript
// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Create ticket logic
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

---

## Environment Setup

### Copy Environment Variables

**File: `.env.local`**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Super Admin
NEXT_PUBLIC_SUPER_ADMIN_ENABLED=true

# API (if using separate backend)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Other configs...
```

---

## Testing & Deployment

### Local Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000

# Test super admin login:
# Email: admin@samadhaansetu.gov
# Password: Imtheadminofdb
```

### Build for Production

```bash
# Build the app
npm run build

# Test production build locally
npm run start
```

### Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then redeploy
vercel --prod
```

---

## Troubleshooting

### Common Issues

**Issue: Super admin login not working**

Solution:
```typescript
// Check if super admin is enabled
import { SUPER_ADMIN_ENABLED } from '@/config/superAdmin'

console.log('Super admin enabled:', SUPER_ADMIN_ENABLED)

// Verify credentials in src/config/superAdmin.ts
```

**Issue: Session not persisting**

Solution:
```typescript
// Check localStorage in browser console
console.log(localStorage.getItem('super-admin-session'))

// Clear cache and try again
localStorage.clear()
```

**Issue: API requests failing**

Solution:
```typescript
// Check auth headers
import { getAuthHeaders } from '@/lib/auth'

const headers = await getAuthHeaders()
console.log('Auth headers:', headers)
```

---

## File Checklist

### Must Copy

- [ ] `src/utils/auth/*` → `src/lib/auth/`
- [ ] `src/config/superAdmin.ts` → `src/config/superAdmin.ts`
- [ ] `src/utils/darkMode.ts` → `src/lib/darkMode.ts`
- [ ] `src/components/*` → `src/components/`
- [ ] `src/styles/globals.css` → `src/app/globals.css`

### Must Create

- [ ] `src/app/layout.tsx`
- [ ] `src/app/page.tsx`
- [ ] `src/app/login/page.tsx`
- [ ] `src/lib/api/client.ts`
- [ ] `src/lib/api/tickets.ts`
- [ ] `src/lib/api/profile.ts`
- [ ] `src/lib/api/notifications.ts`
- [ ] `src/lib/api/index.ts`
- [ ] `src/middleware.ts`
- [ ] `next.config.ts`
- [ ] `tsconfig.json`

### Environment Setup

- [ ] Copy `.env.example` to `.env.local`
- [ ] Update Supabase credentials
- [ ] Set `NEXT_PUBLIC_SUPER_ADMIN_ENABLED=true` for development

---

## Quick Reference

### Imports Mapping

```typescript
// Old
import { authAPI } from '../utils/api'
import { ThemeProvider } from '../components/ThemeProvider'

// New
import { signIn, getSession } from '@/lib/auth'
import { ThemeProvider } from '@/components/ThemeProvider'
```

### API Calls Mapping

```typescript
// Old
const result = await authAPI.signIn(email, password)

// New
const result = await signIn(email, password)
```

---

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Next.js Migration from Create React App](https://nextjs.org/docs/app/building-your-application/upgrading/from-create-react-app)

---

**Last Updated:** 2024
**Version:** 1.0
