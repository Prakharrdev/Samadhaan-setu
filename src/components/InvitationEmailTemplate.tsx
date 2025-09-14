import React from 'react'

interface InvitationEmailTemplateProps {
  officerName: string
  department: string
  inviteCode: string
  activationLink: string
  senderName?: string
  senderTitle?: string
}

export default function InvitationEmailTemplate({
  officerName,
  department,
  inviteCode,
  activationLink,
  senderName = "System Administrator",
  senderTitle = "Samadhaan Setu Platform"
}: InvitationEmailTemplateProps) {
  // This component serves as a template reference
  // In actual implementation, this would be used to generate HTML emails
  
  const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to Samadhaan Setu Platform</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-text {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1e293b;
        }
        .subtitle {
            color: #64748b;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .info-card {
            background-color: #f1f5f9;
            border-left: 4px solid #1e40af;
            padding: 20px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
            margin-bottom: 5px;
        }
        .info-value {
            color: #1e293b;
            font-size: 16px;
        }
        .activate-button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
            transition: transform 0.2s ease;
        }
        .activate-button:hover {
            transform: translateY(-2px);
        }
        .security-note {
            background-color: #fef3cd;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .security-note-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .security-note-text {
            color: #a16207;
            font-size: 14px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .platform-name {
            font-weight: 600;
            color: #1e40af;
        }
        .steps {
            margin: 30px 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .step-number {
            background-color: #1e40af;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .step-text {
            flex: 1;
            padding-top: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏛️</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Samadhaan Setu</h1>
            <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Civic Issue Reporting Platform</p>
        </div>
        
        <div class="content">
            <h2 class="welcome-text">Welcome to Samadhaan Setu!</h2>
            <p class="subtitle">You've been invited to join as a government authority</p>
            
            <p style="margin-bottom: 25px;">
                Dear <strong>${officerName}</strong>,
            </p>
            
            <p style="margin-bottom: 25px;">
                You have been invited to join the Samadhaan Setu platform as an authorized government official. 
                This platform enables efficient management and resolution of civic issues reported by citizens.
            </p>
            
            <div class="info-card">
                <div class="info-label">Officer Name:</div>
                <div class="info-value">${officerName}</div>
                <br>
                <div class="info-label">Department:</div>
                <div class="info-value">${department}</div>
                <br>
                <div class="info-label">Invitation Code:</div>
                <div class="info-value" style="font-family: monospace; font-weight: bold; font-size: 18px; color: #1e40af;">${inviteCode}</div>
            </div>
            
            <div class="steps">
                <h3 style="color: #1e293b; margin-bottom: 20px;">Next Steps:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-text">Click the "Activate Your Account" button below</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-text">Create a secure password following our security requirements</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-text">Complete your profile setup with official details</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-text">Start managing civic issues in your jurisdiction</div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${activationLink}" class="activate-button">
                    🔐 Activate Your Account
                </a>
            </div>
            
            <div class="security-note">
                <div class="security-note-title">🛡️ Security Notice</div>
                <div class="security-note-text">
                    This invitation link is valid for 7 days and can only be used once. 
                    If you did not expect this invitation, please contact your system administrator immediately.
                </div>
            </div>
            
            <p style="margin-top: 30px; color: #64748b;">
                If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
                ${activationLink}
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                This invitation was sent by <strong>${senderName}</strong><br>
                <span class="platform-name">${senderTitle}</span>
            </p>
            <p class="footer-text">
                Need help? Contact your system administrator or visit our support portal.
            </p>
        </div>
    </div>
</body>
</html>
  `

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-medium mb-2">Authority Invitation Email Template</h2>
        <p className="text-muted-foreground">
          This template is used to send secure invitation emails to government officials.
        </p>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-3 border-b">
          <h3 className="font-medium">Email Preview</h3>
        </div>
        <div 
          className="p-4 bg-white overflow-auto max-h-96"
          dangerouslySetInnerHTML={{ __html: emailHTML }}
        />
      </div>
      
      <div className="mt-6 space-y-4">
        <h3 className="font-medium">Template Variables:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Officer Name:</strong> {officerName}
          </div>
          <div>
            <strong>Department:</strong> {department}
          </div>
          <div>
            <strong>Invite Code:</strong> {inviteCode}
          </div>
          <div>
            <strong>Activation Link:</strong> {activationLink}
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility function to generate the email HTML for server-side use
export const generateInvitationEmailHTML = (props: InvitationEmailTemplateProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to Samadhaan Setu Platform</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-text {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1e293b;
        }
        .subtitle {
            color: #64748b;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .info-card {
            background-color: #f1f5f9;
            border-left: 4px solid #1e40af;
            padding: 20px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
            margin-bottom: 5px;
        }
        .info-value {
            color: #1e293b;
            font-size: 16px;
        }
        .activate-button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
            transition: transform 0.2s ease;
        }
        .activate-button:hover {
            transform: translateY(-2px);
        }
        .security-note {
            background-color: #fef3cd;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .security-note-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .security-note-text {
            color: #a16207;
            font-size: 14px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .platform-name {
            font-weight: 600;
            color: #1e40af;
        }
        .steps {
            margin: 30px 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .step-number {
            background-color: #1e40af;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .step-text {
            flex: 1;
            padding-top: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏛️</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Samadhaan Setu</h1>
            <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Civic Issue Reporting Platform</p>
        </div>
        
        <div class="content">
            <h2 class="welcome-text">Welcome to Samadhaan Setu!</h2>
            <p class="subtitle">You've been invited to join as a government authority</p>
            
            <p style="margin-bottom: 25px;">
                Dear <strong>${props.officerName}</strong>,
            </p>
            
            <p style="margin-bottom: 25px;">
                You have been invited to join the Samadhaan Setu platform as an authorized government official. 
                This platform enables efficient management and resolution of civic issues reported by citizens.
            </p>
            
            <div class="info-card">
                <div class="info-label">Officer Name:</div>
                <div class="info-value">${props.officerName}</div>
                <br>
                <div class="info-label">Department:</div>
                <div class="info-value">${props.department}</div>
                <br>
                <div class="info-label">Invitation Code:</div>
                <div class="info-value" style="font-family: monospace; font-weight: bold; font-size: 18px; color: #1e40af;">${props.inviteCode}</div>
            </div>
            
            <div class="steps">
                <h3 style="color: #1e293b; margin-bottom: 20px;">Next Steps:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-text">Click the "Activate Your Account" button below</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-text">Create a secure password following our security requirements</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-text">Complete your profile setup with official details</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-text">Start managing civic issues in your jurisdiction</div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${props.activationLink}" class="activate-button">
                    🔐 Activate Your Account
                </a>
            </div>
            
            <div class="security-note">
                <div class="security-note-title">🛡️ Security Notice</div>
                <div class="security-note-text">
                    This invitation link is valid for 7 days and can only be used once. 
                    If you did not expect this invitation, please contact your system administrator immediately.
                </div>
            </div>
            
            <p style="margin-top: 30px; color: #64748b;">
                If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
                ${props.activationLink}
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                This invitation was sent by <strong>${props.senderName || 'System Administrator'}</strong><br>
                <span class="platform-name">${props.senderTitle || 'Samadhaan Setu Platform'}</span>
            </p>
            <p class="footer-text">
                Need help? Contact your system administrator or visit our support portal.
            </p>
        </div>
    </div>
</body>
</html>
  `
}