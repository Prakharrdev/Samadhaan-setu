import React, { useState, useEffect } from 'react'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/ThemeProvider'
import LandingPage from './components/LandingPage'
import AuthLogin from './components/AuthLogin'
import AuthSignup from './components/AuthSignup'
import RoleSelection from './components/RoleSelection'
import CitizenDashboard from './components/CitizenDashboard'
import AuthorityDashboard from './components/AuthorityDashboard'
import { authAPI, profileAPI, testAPI } from './utils/api'
import { profileStorage } from './utils/profileStorage'

type AppState = 'loading' | 'landing' | 'login' | 'signup' | 'role-selection' | 'citizen-dashboard' | 'authority-dashboard'

function AppContent() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useState(null as any)

  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      // Add timeout to prevent hanging
      const sessionPromise = authAPI.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000)
      )
      
      const session = await Promise.race([sessionPromise, timeoutPromise])
      console.log('Session check:', { hasSession: !!session, hasUser: !!session?.user, hasAccessToken: !!session?.access_token })
      
      if (session?.user && session?.access_token) {
        let userWithProfile = session.user

        // Try to fetch updated profile data from backend to validate session
        try {
          // First test basic auth
          console.log('Testing authentication...')
          await testAPI.testAuth()
          console.log('Auth test passed, fetching profile...')
          
          const profileData = await profileAPI.getProfile()
          if (profileData) {
            // Merge profile data with user metadata
            userWithProfile = {
              ...session.user,
              user_metadata: {
                ...session.user.user_metadata,
                ...profileData
              }
            }
          }
        } catch (profileError) {
          console.warn('Could not fetch profile data from backend, session might be invalid:', profileError)
          
          // If we can't fetch profile data and it's an auth error, the session is likely invalid
          if (profileError.message === 'Unauthorized') {
            console.log('Session appears invalid, redirecting to login')
            await authAPI.signOut() // Clear invalid session
            setAppState('landing')
            return
          }
          
          // Fallback to localStorage for other errors
          const localProfileData = profileStorage.getProfile(session.user.id)
          if (localProfileData) {
            userWithProfile = {
              ...session.user,
              user_metadata: {
                ...session.user.user_metadata,
                ...localProfileData
              }
            }
          }
        }

        setUser(userWithProfile)
        
        // Check if user has dual roles or determine portal
        const userRole = userWithProfile.user_metadata?.role
        if (userRole === 'authority') {
          setAppState('authority-dashboard')
        } else if (userRole === 'citizen') {
          setAppState('citizen-dashboard')
        } else {
          // If no specific role or dual role, show role selection
          setAppState('role-selection')
        }
      } else {
        console.log('No valid session found')
        setAppState('landing')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setAppState('landing')
    }
  }

  const handleLoginSuccess = async () => {
    try {
      // Add timeout to prevent hanging
      const sessionPromise = authAPI.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login session check timeout')), 3000)
      )
      
      const session = await Promise.race([sessionPromise, timeoutPromise])
      console.log('Login success - session check:', { hasSession: !!session, hasUser: !!session?.user, hasAccessToken: !!session?.access_token })
      
      if (session?.user && session?.access_token) {
        let userWithProfile = session.user

        // Try to fetch updated profile data from backend
        try {
          const profileData = await profileAPI.getProfile()
          if (profileData) {
            // Merge profile data with user metadata
            userWithProfile = {
              ...session.user,
              user_metadata: {
                ...session.user.user_metadata,
                ...profileData
              }
            }
          }
        } catch (profileError) {
          console.warn('Could not fetch profile data from backend after login:', profileError)
          
          // For login success, we'll be more lenient and still allow progression
          const localProfileData = profileStorage.getProfile(session.user.id)
          if (localProfileData) {
            userWithProfile = {
              ...session.user,
              user_metadata: {
                ...session.user.user_metadata,
                ...localProfileData
              }
            }
          }
        }

        setUser(userWithProfile)
        
        const userRole = userWithProfile.user_metadata?.role
        if (userRole === 'authority') {
          setAppState('authority-dashboard')
        } else if (userRole === 'citizen') {
          setAppState('citizen-dashboard')
        } else {
          setAppState('role-selection')
        }
      } else {
        console.error('No valid session after login')
        setAppState('role-selection')
      }
    } catch (error) {
      console.error('Error after login:', error)
      setAppState('role-selection')
    }
  }

  const handleSignupSuccess = () => {
    handleLoginSuccess()
  }

  const handleRoleSelect = (role: 'citizen' | 'authority') => {
    if (role === 'citizen') {
      setAppState('citizen-dashboard')
    } else {
      setAppState('authority-dashboard')
    }
  }

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await authAPI.signOut()
      
      // Clear localStorage profile data (optional - you might want to keep it)
      // profileStorage.clearAllProfiles()
      
      setUser(null)
      setAppState('landing')
    } catch (error) {
      console.error('Error during logout:', error)
      // Still clear local state even if API call fails
      setUser(null)
      setAppState('landing')
    }
  }

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl mb-2">Samadhaan Setu</h2>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Landing Page */}
      {appState === 'landing' && (
        <LandingPage 
          onGetStarted={() => setAppState('login')}
        />
      )}

      {/* Authentication Views */}
      {appState === 'login' && (
        <AuthLogin 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setAppState('signup')}
        />
      )}

      {appState === 'signup' && (
        <AuthSignup 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setAppState('login')}
        />
      )}

      {/* Role Selection */}
      {appState === 'role-selection' && (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      )}

      {/* Citizen Dashboard */}
      {appState === 'citizen-dashboard' && (
        <CitizenDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Authority Dashboard */}
      {appState === 'authority-dashboard' && (
        <AuthorityDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="samadhaan-setu-theme">
      <AppContent />
    </ThemeProvider>
  )
}