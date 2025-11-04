/**
 * SUPER ADMIN CONFIGURATION
 * 
 * This file contains hardcoded super admin credentials for development purposes.
 * These credentials bypass the database authentication and are stored locally.
 * 
 * ⚠️  WARNING: This is for development only. Do NOT use in production.
 * Remove this file or set SUPER_ADMIN_ENABLED=false in production.
 * 
 * To add more super admins, simply add them to the SUPER_ADMINS array below.
 */

// Feature flag to enable/disable super admin access
export const SUPER_ADMIN_ENABLED = process.env.NODE_ENV === 'development'

// List of super admin accounts - add more here as needed
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
  // Add more super admins here in the same format
  // {
  //   id: 'super-admin-002',
  //   email: 'developer@samadhaansetu.gov',
  //   password: 'your-password-here',
  //   name: 'Developer Account',
  //   role: 'authority',
  //   permissions: ['all'],
  //   department: 'Development',
  //   designation: 'Developer'
  // }
]

/**
 * Verify super admin credentials
 * Returns the super admin user object if credentials match, null otherwise
 */
export function verifySuperAdminCredentials(email: string, password: string) {
  if (!SUPER_ADMIN_ENABLED) {
    return null
  }

  const superAdmin = SUPER_ADMINS.find(
    (admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
  )

  if (superAdmin) {
    // Return super admin user object without the password
    const { password: _, ...userWithoutPassword } = superAdmin
    return {
      ...userWithoutPassword,
      user_metadata: {
        name: superAdmin.name,
        role: superAdmin.role,
        department: superAdmin.department,
        designation: superAdmin.designation,
        is_super_admin: true,
        isSuperAdmin: true // Both formats for compatibility
      }
    }
  }

  return null
}

/**
 * Create a mock session for super admin
 * This simulates a Supabase session without database authentication
 */
export function createSuperAdminSession(superAdmin: ReturnType<typeof verifySuperAdminCredentials>) {
  if (!superAdmin) {
    return null
  }

  return {
    user: {
      id: superAdmin.id,
      email: superAdmin.email,
      user_metadata: superAdmin.user_metadata,
      app_metadata: {
        provider: 'super-admin',
        providers: ['super-admin']
      },
      aud: 'authenticated',
      confirmation_sent_at: new Date().toISOString(),
      recovery_sent_at: null,
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: 'super-admin'
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    session: {
      access_token: `super-admin-${superAdmin.id}-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `super-admin-refresh-${superAdmin.id}-${Date.now()}`,
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        user_metadata: superAdmin.user_metadata
      }
    }
  }
}

/**
 * Check if a user is a super admin
 */
export function isSuperAdmin(user: any): boolean {
  return user?.user_metadata?.is_super_admin === true || user?.user_metadata?.isSuperAdmin === true
}
