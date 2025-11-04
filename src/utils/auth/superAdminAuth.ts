/**
 * Super Admin Authentication Handler
 * Handles super admin credential verification and session creation
 * This bypasses database authentication for development purposes
 */

import { verifySuperAdminCredentials, createSuperAdminSession, isSuperAdmin, SUPER_ADMIN_ENABLED } from '../../config/superAdmin'
import { LoginCredentials, AuthUser, AuthSession } from './types'

/**
 * Check if credentials match a super admin account
 * Returns super admin user data if credentials are correct
 */
export function checkSuperAdminCredentials(credentials: LoginCredentials): AuthUser | null {
  if (!SUPER_ADMIN_ENABLED) {
    return null
  }

  const superAdmin = verifySuperAdminCredentials(credentials.email, credentials.password)
  return superAdmin as AuthUser | null
}

/**
 * Authenticate as super admin
 * Creates a mock session that bypasses database authentication
 */
export function authenticateSuperAdmin(credentials: LoginCredentials): AuthSession | null {
  if (!SUPER_ADMIN_ENABLED) {
    return null
  }

  const superAdmin = verifySuperAdminCredentials(credentials.email, credentials.password)
  if (!superAdmin) {
    return null
  }

  const sessionData = createSuperAdminSession(superAdmin)
  return sessionData as AuthSession | null
}

/**
 * Check if a user object is a super admin
 */
export function isUserSuperAdmin(user: any): boolean {
  return isSuperAdmin(user)
}

/**
 * Store super admin session in localStorage
 * (since super admin doesn't use Supabase)
 */
export function storeSuperAdminSession(session: AuthSession): void {
  localStorage.setItem('super-admin-session', JSON.stringify(session))
  localStorage.setItem('super-admin-token', session.session?.access_token || '')
}

/**
 * Retrieve super admin session from localStorage
 */
export function getSuperAdminSession(): AuthSession | null {
  const sessionData = localStorage.getItem('super-admin-session')
  if (!sessionData) {
    return null
  }

  try {
    return JSON.parse(sessionData) as AuthSession
  } catch {
    return null
  }
}

/**
 * Clear super admin session
 */
export function clearSuperAdminSession(): void {
  localStorage.removeItem('super-admin-session')
  localStorage.removeItem('super-admin-token')
}

/**
 * Get super admin token for API requests
 */
export function getSuperAdminToken(): string | null {
  return localStorage.getItem('super-admin-token')
}
