import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Mail, UserPlus, Eye, Clock, CheckCircle, XCircle, Send } from 'lucide-react'
import InvitationEmailTemplate, { generateInvitationEmailHTML } from './InvitationEmailTemplate'

interface InvitationData {
  id: string
  officerName: string
  email: string
  department: string
  inviteCode: string
  activationLink: string
  status: 'pending' | 'activated' | 'expired'
  sentAt: string
  expiresAt: string
  activatedAt?: string
}

export default function AuthorityInvitationManagement() {
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewInvitation, setPreviewInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [inviteForm, setInviteForm] = useState({
    officerName: '',
    email: '',
    department: '',
    designation: ''
  })

  // Mock data for existing invitations
  const [invitations, setInvitations] = useState<InvitationData[]>([
    {
      id: '1',
      officerName: 'Rajesh Kumar',
      email: 'rajesh.kumar@municipality.gov.in',
      department: 'Road Maintenance',
      inviteCode: 'INV-2024-001',
      activationLink: 'https://samadhaan-setu.gov.in/activate/inv-001',
      status: 'activated',
      sentAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-22T10:30:00Z',
      activatedAt: '2024-01-16T14:20:00Z'
    },
    {
      id: '2',
      officerName: 'Priya Sharma',
      email: 'priya.sharma@waterboard.gov.in',
      department: 'Water Supply',
      inviteCode: 'INV-2024-002',
      activationLink: 'https://samadhaan-setu.gov.in/activate/inv-002',
      status: 'pending',
      sentAt: '2024-01-18T09:15:00Z',
      expiresAt: '2024-01-25T09:15:00Z'
    },
    {
      id: '3',
      officerName: 'Amit Verma',
      email: 'amit.verma@electricity.gov.in',
      department: 'Electricity Board',
      inviteCode: 'INV-2024-003',
      activationLink: 'https://samadhaan-setu.gov.in/activate/inv-003',
      status: 'expired',
      sentAt: '2024-01-05T16:45:00Z',
      expiresAt: '2024-01-12T16:45:00Z'
    }
  ])

  const departments = [
    'Road Maintenance',
    'Water Supply',
    'Electricity Board',
    'Waste Management',
    'Street Lighting',
    'Parks & Gardens',
    'Traffic Police',
    'Building Permissions',
    'Health Department',
    'Fire Department'
  ]

  const generateInviteCode = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const sequence = String(invitations.length + 1).padStart(3, '0')
    return `INV-${year}${month}-${sequence}`
  }

  const generateActivationLink = (inviteCode: string) => {
    return `https://samadhaan-setu.gov.in/activate/${inviteCode.toLowerCase()}`
  }

  const handleSendInvitation = async () => {
    if (!inviteForm.officerName || !inviteForm.email || !inviteForm.department) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const inviteCode = generateInviteCode()
      const activationLink = generateActivationLink(inviteCode)
      
      // Create new invitation
      const newInvitation: InvitationData = {
        id: String(invitations.length + 1),
        officerName: inviteForm.officerName,
        email: inviteForm.email,
        department: inviteForm.department,
        inviteCode,
        activationLink,
        status: 'pending',
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }

      // TODO: Replace with actual API call to send email
      // const emailHTML = generateInvitationEmailHTML({
      //   officerName: inviteForm.officerName,
      //   department: inviteForm.department,
      //   inviteCode,
      //   activationLink
      // })
      // await emailService.send({
      //   to: inviteForm.email,
      //   subject: 'Invitation to Samadhaan Setu Platform',
      //   html: emailHTML
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setInvitations([newInvitation, ...invitations])
      setSuccess(`Invitation sent successfully to ${inviteForm.email}`)
      setInviteForm({ officerName: '', email: '', department: '', designation: '' })
      setShowInviteDialog(false)

      console.log('📧 Invitation Email Sent:', {
        to: inviteForm.email,
        inviteCode,
        activationLink
      })

    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewInvitation = (invitation: InvitationData) => {
    setPreviewInvitation(invitation)
    setShowPreviewDialog(true)
  }

  const handleResendInvitation = async (invitation: InvitationData) => {
    setLoading(true)
    try {
      // TODO: Implement resend logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update invitation status and dates
      const updatedInvitations = invitations.map(inv => 
        inv.id === invitation.id 
          ? {
              ...inv,
              status: 'pending' as const,
              sentAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          : inv
      )
      setInvitations(updatedInvitations)
      setSuccess(`Invitation resent to ${invitation.email}`)
    } catch (err: any) {
      setError(err.message || 'Failed to resend invitation')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: InvitationData['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning bg-warning/10 border-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'activated':
        return <Badge variant="outline" className="text-success bg-success/10 border-success"><CheckCircle className="h-3 w-3 mr-1" />Activated</Badge>
      case 'expired':
        return <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Authority Invitations</h2>
          <p className="text-muted-foreground">Manage invitations for government officials</p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Authority Invitation</DialogTitle>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="officerName">Officer Name *</Label>
                <Input
                  id="officerName"
                  value={inviteForm.officerName}
                  onChange={(e) => setInviteForm({ ...inviteForm, officerName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="officer@department.gov.in"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={inviteForm.department} 
                  onValueChange={(value) => setInviteForm({ ...inviteForm, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={inviteForm.designation}
                  onChange={(e) => setInviteForm({ ...inviteForm, designation: e.target.value })}
                  placeholder="e.g., Assistant Engineer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSendInvitation}
                  disabled={loading}
                >
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert variant="default" className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invitation History</CardTitle>
          <CardDescription>Track sent invitations and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer Details</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Invite Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.officerName}</div>
                      <div className="text-sm text-muted-foreground">{invitation.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{invitation.department}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{invitation.inviteCode}</code>
                  </TableCell>
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                  <TableCell>{formatDate(invitation.sentAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewInvitation(invitation)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {(invitation.status === 'pending' || invitation.status === 'expired') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(invitation)}
                          disabled={loading}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invitation Email Preview</DialogTitle>
          </DialogHeader>
          {previewInvitation && (
            <InvitationEmailTemplate
              officerName={previewInvitation.officerName}
              department={previewInvitation.department}
              inviteCode={previewInvitation.inviteCode}
              activationLink={previewInvitation.activationLink}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}