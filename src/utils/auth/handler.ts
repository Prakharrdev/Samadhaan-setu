/**
 * Unified Authentication Handler
 * Routes authentication through super admin first, then falls back to Supabase
 */

import { supabase } from '../supabase/client'
import { LoginCredentials, AuthUser, AuthSession, SignupData } from './types'
import {
  checkSuperAdminCredentials,
  authenticateSuperAdmin,
  isUserSuperAdmin,
  storeSuperAdminSession,
  getSuperAdminSession,
  clearSuperAdminSession,
  getSuperAdminToken,
  SUPER_ADMIN_ENABLED
} from './superAdminAuth'

/**
 * Sign in with email and password
 * Checks super admin credentials first, then falls back to Supabase
 */
export async function signIn(email: string, password: string): Promise<any> {
  // Step 1: Check if credentials match a super admin account
  const superAdminUser = checkSuperAdminCredentials({ email, password })

  if (superAdminUser) {
    console.log('🔑 Super admin credentials verified, creating session...')
    const session = authenticateSuperAdmin({ email, password })

    if (session) {
      // Store super admin session in localStorage
      storeSuperAdminSession(session)
      return session
    }
  }

  // Step 2: If not super admin, authenticate with Supabase
  console.log('🔄 Checking Supabase credentials...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign up for new account (Supabase only - super admin accounts are hardcoded)
 */
export async function signUp(data: SignupData): Promise<any> {
  const response = await fetch(
    `https://${process.env.REACT_APP_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/signup`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(data)
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Signup failed')
  }

  return response.json()
}

/**
 * Sign out user (handles both super admin and Supabase)
 */
export async function signOut(): Promise<void> {
  // Check if user is logged in as super admin
  const superAdminSession = getSuperAdminSession()
  if (superAdminSession) {
    clearSuperAdminSession()
    console.log('🚪 Super admin session cleared')
    return
  }

  // Otherwise sign out from Supabase
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }

  console.log('🚪 Supabase session cleared')
}

/**
 * Get current session (checks super admin first, then Supabase)
 */
export async function getSession(): Promise<AuthSession | null> {
  // Check if user is logged in as super admin
  const superAdminSession = getSuperAdminSession()
  if (superAdminSession) {
    return superAdminSession
  }

  // Otherwise get Supabase session
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}

/**
 * Get authentication headers for API requests
 * Handles both super admin and Supabase tokens
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  // Check if user is authenticated as super admin
  const superAdminToken = getSuperAdminToken()
  if (superAdminToken) {
    headers['Authorization'] = `Bearer ${superAdminToken}`
    headers['X-Super-Admin'] = 'true'
    return headers
  }

  // Otherwise use Supabase session token
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
    return headers
  }

  // Fallback to anon key if no session
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  if (anonKey) {
    headers['Authorization'] = `Bearer ${anonKey}`
  }

  return headers
}

/**
 * Check if current user is a super admin
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  const session = await getSession()
  return isUserSuperAdmin(session?.user)
}

/**
 * Forgot password (Supabase only - not applicable to super admin)
 */
export async function forgotPassword(aadhaar: string): Promise<any> {
  const response = await fetch(
    `https://${process.env.REACT_APP_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ aadhaar })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send OTP')
  }

  return response.json()
}

/**
 * Verify forgot password OTP (Supabase only)
 */
export async function verifyForgotPasswordOTP(aadhaar: string, otp: string): Promise<any> {
  const response = await fetch(
    `https://${process.env.REACT_APP_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/verify-forgot-password-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ aadhaar, otp })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Invalid OTP')
  }

  return response.json()
}

/**
 * Reset password (Supabase only)
 */
export async function resetPassword(aadhaar: string, newPassword: string): Promise<any> {
  const response = await fetch(
    `https://${process.env.REACT_APP_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ aadhaar, newPassword })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to reset password')
  }

  return response.json()
}
