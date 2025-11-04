/**
 * Authentication Types
 * Centralized type definitions for authentication system
 */

export type AuthRole = 'citizen' | 'authority' | 'super-admin'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: AuthRole
  user_metadata?: {
    name?: string
    role?: AuthRole
    department?: string
    designation?: string
    is_super_admin?: boolean
    isSuperAdmin?: boolean
    [key: string]: any
  }
  app_metadata?: {
    provider?: string
    providers?: string[]
    [key: string]: any
  }
}

export interface AuthSession {
  user: AuthUser
  session?: {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token?: string
    user: AuthUser
  }
  access_token?: string
}

export interface AuthError {
  message: string
  status?: number
  code?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
  aadhaar: string
  role?: AuthRole
}

export interface PasswordResetData {
  aadhaar: string
  newPassword: string
  confirmPassword: string
}

export interface OTPVerification {
  otp: string
}
