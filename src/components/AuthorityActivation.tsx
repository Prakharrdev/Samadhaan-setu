import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import PasswordValidation, { validatePassword, isPasswordValid } from './PasswordValidation'
import Footer from './Footer'

interface AuthorityActivationProps {
  inviteCode: string
  onActivationSuccess: () => void
}

interface InvitationDetails {
  officerName: string
  email: string
  department: string
  inviteCode: string
  status: 'valid' | 'expired' | 'used' | 'invalid'
  expiresAt: string
}

export default function AuthorityActivation({ inviteCode, onActivationSuccess }: AuthorityActivationProps) {
  const [step, setStep] = useState<'loading' | 'invalid' | 'form' | 'success'>('loading')
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    validateInviteCode()
  }, [inviteCode])

  const validateInviteCode = async () => {
    try {
      // TODO: Replace with actual API call to validate invite code
      // const response = await api.validateInviteCode(inviteCode)
      
      // Mock validation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockInvitations = {
        'inv-2024-001': {
          officerName: 'Rajesh Kumar',
          email: 'rajesh.kumar@municipality.gov.in',
          department: 'Road Maintenance',
          inviteCode: 'INV-2024-001',
          status: 'valid' as const,
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        'inv-2024-002': {
          officerName: 'Priya Sharma',
          email: 'priya.sharma@waterboard.gov.in',
          department: 'Water Supply',
          inviteCode: 'INV-2024-002',
          status: 'valid' as const,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        'inv-2024-expired': {
          officerName: 'Expired User',
          email: 'expired@example.com',
          department: 'Test Department',
          inviteCode: 'INV-2024-EXPIRED',
          status: 'expired' as const,
          expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      const normalizedCode = inviteCode.toLowerCase()
      const invitation = mockInvitations[normalizedCode as keyof typeof mockInvitations]

      if (!invitation) {
        setStep('invalid')
        return
      }

      setInvitationDetails(invitation)

      if (invitation.status === 'valid') {
        setStep('form')
      } else {
        setStep('invalid')
      }

    } catch (err: any) {
      console.error('Error validating invite code:', err)
      setStep('invalid')
    }
  }

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all password fields')
      }

      const passwordCriteria = validatePassword(formData.password)
      if (!isPasswordValid(passwordCriteria)) {
        throw new Error('Password does not meet all security requirements')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (!formData.acceptTerms) {
        throw new Error('Please accept the terms and conditions')
      }

      // TODO: Replace with actual API call to activate account
      // await authAPI.activateAuthority({
      //   inviteCode,
      //   password: formData.password,
      //   acceptTerms: formData.acceptTerms
      // })

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStep('success')

      // Auto-redirect after success
      setTimeout(() => {
        onActivationSuccess()
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Activation failed')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl mb-2">Validating Invitation</h2>
              <p className="text-muted-foreground">Please wait while we verify your invitation code...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive-foreground" />
              </div>
              <CardTitle className="text-xl">Invalid Invitation</CardTitle>
              <CardDescription>
                {invitationDetails?.status === 'expired' 
                  ? 'This invitation has expired' 
                  : 'This invitation link is invalid or has already been used'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {invitationDetails?.status === 'expired' && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Expired on:</strong> {formatDate(invitationDetails.expiresAt)}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Please contact your system administrator to request a new invitation.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-success rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success-foreground" />
              </div>
              <CardTitle className="text-xl">Account Activated!</CardTitle>
              <CardDescription>
                Your authority account has been successfully activated
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {invitationDetails && (
                <div className="bg-muted p-4 rounded-lg text-left">
                  <p className="text-sm"><strong>Name:</strong> {invitationDetails.officerName}</p>
                  <p className="text-sm"><strong>Department:</strong> {invitationDetails.department}</p>
                  <p className="text-sm"><strong>Email:</strong> {invitationDetails.email}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                You will be redirected to the login page in a few seconds...
              </p>
              <Button 
                onClick={onActivationSuccess}
                className="w-full"
              >
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Activate Your Account</CardTitle>
            <CardDescription>
              Complete your authority account setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitationDetails && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Account Details</h3>
                <p className="text-sm"><strong>Name:</strong> {invitationDetails.officerName}</p>
                <p className="text-sm"><strong>Department:</strong> {invitationDetails.department}</p>
                <p className="text-sm"><strong>Email:</strong> {invitationDetails.email}</p>
                <p className="text-sm">
                  <strong>Expires:</strong> {formatDate(invitationDetails.expiresAt)}
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleActivation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
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

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-1"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  required
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-5">
                  I accept the{' '}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Terms and Conditions
                  </Button>
                  {' '}and{' '}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Privacy Policy
                  </Button>
                  {' '}for official use of the Samadhaan Setu platform
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={
                  loading || 
                  !isPasswordValid(validatePassword(formData.password)) || 
                  formData.password !== formData.confirmPassword ||
                  !formData.acceptTerms
                }
              >
                {loading ? 'Activating Account...' : 'Activate Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}