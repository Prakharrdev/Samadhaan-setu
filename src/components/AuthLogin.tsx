import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { authAPI } from '../utils/api'
import { Shield, Phone, KeyRound, RefreshCw } from 'lucide-react'
import Footer from './Footer'
import PasswordValidation, { validatePassword, isPasswordValid } from './PasswordValidation'

interface AuthLoginProps {
  onLoginSuccess: () => void
  onSwitchToSignup: () => void
}

export default function AuthLogin({ onLoginSuccess, onSwitchToSignup }: AuthLoginProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    captcha: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2 | 3>(1)
  const [forgotPasswordData, setForgotPasswordData] = useState({
    aadhaar: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Generated OTP for testing - displayed in console
  const [generatedOtp, setGeneratedOtp] = useState('')
  // Temporary session data after credential validation
  const [tempSession, setTempSession] = useState<any>(null)

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10)
    const num2 = Math.floor(Math.random() * 10)
    return {
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2
    }
  }

  const [captcha, setCaptcha] = useState(generateCaptcha())

  // Step 1: Validate email and password credentials
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Email and Password are required')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Verify credentials without logging in
      const result = await authAPI.signIn(formData.email, formData.password)
      
      if (result.session) {
        // Credentials are correct - store session temporarily and proceed to OTP verification
        setTempSession(result.session)
        
        // Generate OTP for verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        setGeneratedOtp(otp)
        console.log(`🔐 Login OTP: ${otp}`) // Display OTP in console for testing
        console.log(`💡 You can also use the master OTP: 123456`) // Master OTP info
        
        // Sign out temporarily - we'll sign in again after OTP verification
        await authAPI.signOut()
        
        // Move to step 2
        setStep(2)
        setCaptcha(generateCaptcha()) // Generate new captcha for step 2
      } else {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      }
    } catch (err: any) {
      console.error('Step 1 login error:', err)
      setError('Invalid email or password. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and CAPTCHA, then complete login
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
      // Example: await otpService.verifyOTP(formData.email, formData.otp, 'login')
      // When integrating with real OTP service:
      // 1. Remove the console.log OTP generation in handleStep1Submit
      // 2. Call your OTP service API to send OTP to user's phone/email
      // 3. Replace the below validation with API call to verify OTP
      // 4. Remove the hardcoded '123456' fallback for production
      if (formData.otp !== generatedOtp && formData.otp !== '123456') {
        throw new Error('Invalid OTP. Please check the browser console or use master OTP: 123456')
      }

      // 3. Complete login after successful verification
      const result = await authAPI.signIn(formData.email, formData.password)
      if (result.session) {
        onLoginSuccess()
      } else {
        throw new Error('Login failed. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
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
    console.log(`🔐 Resent Login OTP: ${otp}`)
    console.log(`💡 You can also use the master OTP: 123456`)
  }

  // Forgot Password Step 1: Enter Aadhaar
  const handleForgotPasswordStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotPasswordData.aadhaar || forgotPasswordData.aadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Call the API to initiate password reset
      await authAPI.forgotPassword(forgotPasswordData.aadhaar)
      
      // For testing - display OTP in console
      console.log(`🔐 Forgot Password OTP: 123456`) // Using master OTP for demo
      console.log(`💡 Master OTP 123456 can be used to bypass OTP verification`)
      
      setForgotPasswordStep(2)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Step 2: Verify OTP
  const handleForgotPasswordStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!forgotPasswordData.otp || forgotPasswordData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    
    setLoading(true)
    
    try {
      // TODO: Replace with real OTP verification service
      // Example: await otpService.verifyOTP(forgotPasswordData.aadhaar, forgotPasswordData.otp, 'forgot_password')
      // When integrating with real OTP service:
      // 1. Remove the console.log OTP in handleForgotPasswordStep1
      // 2. Call your OTP service API to send OTP to user's phone/email
      // 3. Replace the below validation with API call to verify OTP
      // 4. Remove the hardcoded '123456' fallback for production
      if (forgotPasswordData.otp === '123456') {
        await authAPI.verifyForgotPasswordOTP(forgotPasswordData.aadhaar, '123456')
        setForgotPasswordStep(3)
        setError('')
      } else {
        throw new Error('Invalid OTP. Please use master OTP: 123456 or check console for generated OTP')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please use master OTP: 123456')
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Step 3: Set new password
  const handleForgotPasswordStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const passwordCriteria = validatePassword(forgotPasswordData.newPassword)
    if (!isPasswordValid(passwordCriteria)) {
      setError('Password does not meet all security requirements')
      return
    }
    
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      await authAPI.resetPassword(forgotPasswordData.aadhaar, forgotPasswordData.newPassword)
      setError('')
      setShowForgotPassword(false)
      setForgotPasswordStep(1)
      setForgotPasswordData({ aadhaar: '', otp: '', newPassword: '', confirmPassword: '' })
      alert('Password reset successfully! Please login with your new password.')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl break-words">Samadhaan Setu</CardTitle>
            <CardDescription className="break-words">
              {step === 1 
                ? 'Enter your credentials to continue' 
                : 'Complete verification to access your account'
              }
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="break-words">{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying Credentials...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
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
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center space-y-2">
            <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm p-0 h-auto">
                  Forgot Password?
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center flex-wrap gap-2">
                    <KeyRound className="h-5 w-5 flex-shrink-0" />
                    <span className="break-words">Reset Password</span>
                  </DialogTitle>
                  <DialogDescription className="break-words">
                    Reset your password using your Aadhaar number. We'll send an OTP to your registered mobile and email.
                  </DialogDescription>
                </DialogHeader>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="break-words">{error}</AlertDescription>
                  </Alert>
                )}

                {forgotPasswordStep === 1 && (
                  <form onSubmit={handleForgotPasswordStep1} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="aadhaar">Aadhaar Number</Label>
                      <Input
                        id="aadhaar"
                        type="text"
                        placeholder="Enter your 12-digit Aadhaar number"
                        value={forgotPasswordData.aadhaar}
                        onChange={(e) => setForgotPasswordData({
                          ...forgotPasswordData,
                          aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12)
                        })}
                        maxLength={12}
                        required
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground break-words">
                        We'll send an OTP to your registered mobile number and email
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </form>
                )}

                {forgotPasswordStep === 2 && (
                  <form onSubmit={handleForgotPasswordStep2} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-otp">Enter OTP</Label>
                      <Input
                        id="forgot-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={forgotPasswordData.otp}
                        onChange={(e) => setForgotPasswordData({
                          ...forgotPasswordData,
                          otp: e.target.value.replace(/\D/g, '').slice(0, 6)
                        })}
                        maxLength={6}
                        className="text-center text-lg tracking-widest w-full"
                        required
                      />
                      <p className="text-xs text-muted-foreground break-words">
                        Use master OTP: 123456 or check console for generated OTP
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setForgotPasswordStep(1)
                          setError('')
                        }} 
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                    </div>
                  </form>
                )}

                {forgotPasswordStep === 3 && (
                  <form onSubmit={handleForgotPasswordStep3} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Create a secure password"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData({
                          ...forgotPasswordData,
                          newPassword: e.target.value
                        })}
                        required
                        className="w-full"
                      />
                      {forgotPasswordData.newPassword && (
                        <PasswordValidation password={forgotPasswordData.newPassword} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={forgotPasswordData.confirmPassword}
                        onChange={(e) => setForgotPasswordData({
                          ...forgotPasswordData,
                          confirmPassword: e.target.value
                        })}
                        required
                        className="w-full"
                      />
                      {forgotPasswordData.confirmPassword && forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword && (
                        <p className="text-sm text-destructive">Passwords do not match</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setForgotPasswordStep(2)
                          setError('')
                        }} 
                        className="flex-1"
                      >
                        Back to OTP
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={loading || !isPasswordValid(validatePassword(forgotPasswordData.newPassword)) || forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword}
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
            
            <div>
              <Button variant="link" onClick={onSwitchToSignup} className="text-sm break-words">
                Don't have an account? Sign up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      <Footer />
    </div>
  )
}