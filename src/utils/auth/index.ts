/**
 * Authentication Module Exports
 * Central export point for all authentication utilities
 */

// Types
export type { AuthRole, AuthUser, AuthSession, AuthError, LoginCredentials, SignupData, PasswordResetData, OTPVerification } from './types'

// Auth handler (main entry point)
export {
  signIn,
  signUp,
  signOut,
  getSession,
  getAuthHeaders,
  isCurrentUserSuperAdmin,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword
} from './handler'

// Super admin utilities
export {
  checkSuperAdminCredentials,
  isUserSuperAdmin,
  storeSuperAdminSession,
  getSuperAdminSession,
  clearSuperAdminSession,
  getSuperAdminToken,
  SUPER_ADMIN_ENABLED
} from './superAdminAuth'
