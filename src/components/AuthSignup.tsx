import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { authAPI } from '../utils/api'
import { UserPlus, Phone, RefreshCw } from 'lucide-react'
import Footer from './Footer'
import PasswordValidation, { validatePassword, isPasswordValid } from './PasswordValidation'

interface AuthSignupProps {
  onSignupSuccess: () => void
  onSwitchToLogin: () => void
}

export default function AuthSignup({ onSignupSuccess, onSwitchToLogin }: AuthSignupProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    aadhaar: '',
    otp: '',
    captcha: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Generated OTP for testing - displayed in console
  const [generatedOtp, setGeneratedOtp] = useState('')

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10)
    const num2 = Math.floor(Math.random() * 10)
    return {
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2
    }
  }

  const [captcha, setCaptcha] = useState(generateCaptcha())

  const validateAadhaar = (aadhaar: string) => {
    // Aadhaar validation: 12 digits
    return /^\d{12}$/.test(aadhaar)
  }

  // Step 1: Collect user details and validate
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Client-side validation
      if (!formData.name || !formData.email || !formData.password || !formData.aadhaar) {
        throw new Error('All fields are required')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const passwordCriteria = validatePassword(formData.password)
      if (!isPasswordValid(passwordCriteria)) {
        throw new Error('Password does not meet all security requirements')
      }

      if (!validateAadhaar(formData.aadhaar)) {
        throw new Error('Invalid Aadhaar number format (must be 12 digits)')
      }

      // Check if email already exists
      try {
        await authAPI.signIn(formData.email, 'dummy_password')
        // If this doesn't throw an error, email might already exist
        throw new Error('Email already exists. Please use a different email or try signing in.')
      } catch (authError: any) {
        // We expect this to fail for new emails - if it's a "user not found" type error, proceed
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('email not confirmed') ||
            authError.message.includes('Invalid email or password')) {
          // This is expected for new users - proceed to OTP verification
          
          // Generate OTP for verification
          const otp = Math.floor(100000 + Math.random() * 900000).toString()
          setGeneratedOtp(otp)
          console.log(`🔐 Signup OTP: ${otp}`) // Display OTP in console for testing
          console.log(`💡 You can also use the master OTP: 123456`) // Master OTP info
          
          // Move to step 2
          setStep(2)
          setCaptcha(generateCaptcha()) // Generate captcha for step 2
        } else {
          // Some other error occurred
          throw authError
        }
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and CAPTCHA, then complete signup
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. CAPTCHA Validation
      if (parseInt(formData.captcha, 10) !== captcha.answer) {
        throw new Error('Invalid CAPTCHA answer. Please try again.')
      }
      
      // 2. OTP Validation
      // TODO: Replace with real OTP verification service
      // Example: await otpService.verifyOTP(formData.email, formData.otp, 'signup')
      // When integrating with real OTP service:
      // 1. Remove the console.log OTP generation in handleStep1Submit
      // 2. Call your OTP service API to send OTP to user's phone/email
      // 3. Replace the below validation with API call to verify OTP
      // 4. Remove the hardcoded '123456' fallback for production
      if (formData.otp !== generatedOtp && formData.otp !== '123456') {
        throw new Error('Invalid OTP. Please check the browser console or use master OTP: 123456')
      }

      // 3. Complete signup after successful verification
      await authAPI.signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.aadhaar,
        'citizen' // Only citizens can self-register
      )

      // Auto sign in after successful signup
      await authAPI.signIn(formData.email, formData.password)
      onSignupSuccess()
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      // Regenerate captcha on failed attempt
      setCaptcha(generateCaptcha())
    } finally {
      setLoading(false)
    }
  }

  // Generate new OTP (resend functionality)
  const handleResendOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(otp)
    console.log(`🔐 Resent Signup OTP: ${otp}`)
    console.log(`💡 You can also use the master OTP: 123456`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Join as a citizen to report civic issues' 
                : 'Complete verification to create your account'
              }
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={formData.aadhaar}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12)
                    setFormData({ ...formData, aadhaar: value })
                  }}
                  maxLength={12}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  * For demo purposes only. Do not enter real Aadhaar numbers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                {formData.password && (
                  <PasswordValidation password={formData.password} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !isPasswordValid(validatePassword(formData.password)) || formData.password !== formData.confirmPassword}
              >
                {loading ? 'Validating...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-readonly">Full Name</Label>
                <Input
                  id="name-readonly"
                  type="text"
                  value={formData.name}
                  disabled
                  className="bg-muted w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-readonly">Email Address</Label>
                <Input
                  id="email-readonly"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha">Security Check: {captcha.question}</Label>
                <Input
                  id="captcha"
                  type="text"
                  placeholder="Enter the answer"
                  value={formData.captcha}
                  onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    maxLength={6}
                    className="text-center text-lg tracking-widest flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground break-words">
                  Check browser console for OTP or use master OTP: 123456
                </p>
                <Button 
                  type="button"
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={handleResendOtp}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Resend OTP
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1)
                    setError('')
                    setFormData({ ...formData, otp: '', captcha: '' })
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center">
            <Button variant="link" onClick={onSwitchToLogin} className="text-sm">
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      <Footer />
    </div>
  )
}