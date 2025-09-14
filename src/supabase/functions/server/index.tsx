import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Initialize storage buckets
async function initializeBuckets() {
  const bucketName = 'make-a75d69fe-civic-uploads'
  
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
      allowedMimeTypes: ['image/*', 'video/*']
    })
    if (error) {
      console.error('Error creating bucket:', error)
    } else {
      console.log('Bucket created successfully')
    }
  }
}

// Initialize buckets on startup
initializeBuckets()

// Authentication middleware
async function requireAuth(request: Request, next: () => Promise<Response>) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No authorization token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  
  if (!user?.id || error) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Add user to context for next handlers
  request.userId = user.id
  request.userEmail = user.email
  return await next()
}

// User signup
app.post('/make-server-a75d69fe/signup', async (c) => {
  try {
    const { email, password, name, aadhaar, role } = await c.req.json()
    
    if (!email || !password || !name || !aadhaar) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaar)) {
      return c.json({ error: 'Invalid Aadhaar number format' }, 400)
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        aadhaar,
        role: role || 'citizen'
      },
      email_confirm: true
    })
    
    if (error) {
      console.error('Error creating user during signup:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Store user profile in KV store
    await kv.set(`user_profile_${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      aadhaar,
      role: role || 'citizen',
      createdAt: new Date().toISOString()
    })
    
    return c.json({ user: data.user, message: 'User created successfully' })
  } catch (error) {
    console.error('Error during signup process:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Submit a ticket
app.post('/make-server-a75d69fe/tickets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const body = await c.req.json()
    const { category, description, location, imageUrl } = body
    
    if (!category || !location) {
      return c.json({ error: 'Category and location are required' }, 400)
    }
    
    // Determine criticality based on category and description keywords
    const criticalKeywords = ['emergency', 'urgent', 'danger', 'critical', 'immediate', 'burst', 'overflow', 'accident']
    const highKeywords = ['major', 'serious', 'important', 'significant', 'blockage', 'leakage']
    const description_lower = (description || '').toLowerCase()
    
    let criticality = 'low'
    if (criticalKeywords.some(keyword => description_lower.includes(keyword))) {
      criticality = 'critical'
    } else if (highKeywords.some(keyword => description_lower.includes(keyword))) {
      criticality = 'high'
    } else if (['water-supply', 'electricity', 'sewage'].includes(category)) {
      criticality = 'medium'
    }

    // Calculate SLA deadline based on criticality
    const now = new Date()
    let slaDeadline = new Date(now)
    switch (criticality) {
      case 'critical':
        slaDeadline.setHours(now.getHours() + 6) // 6 hours
        break
      case 'high':
        slaDeadline.setHours(now.getHours() + 24) // 24 hours
        break
      case 'medium':
        slaDeadline.setDate(now.getDate() + 3) // 3 days
        break
      case 'low':
        slaDeadline.setDate(now.getDate() + 7) // 7 days
        break
    }

    const ticketId = `TKT${Date.now()}`
    const ticket = {
      id: ticketId,
      userId: user.id,
      category,
      description: description || '',
      location,
      imageUrl: imageUrl || null,
      status: 'submitted',
      criticality,
      slaDeadline: slaDeadline.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: null,
      resolution: null,
      upvotes: 0,
      feedbackStatus: null, // null, 'pending', 'approved', 'rejected'
      userFeedback: null
    }
    
    await kv.set(`ticket_${ticketId}`, ticket)
    
    // Add to user's tickets
    const userTickets = await kv.get(`user_tickets_${user.id}`) || []
    userTickets.push(ticketId)
    await kv.set(`user_tickets_${user.id}`, userTickets)
    
    // Create notification for authorities about new ticket
    const allProfiles = await kv.getByPrefix('user_profile_')
    const authorities = allProfiles.filter(profile => profile.role === 'authority')
    
    for (const authority of authorities) {
      await createNotification(
        authority.id,
        'new_ticket',
        'New Issue Reported',
        `A new ${category.replace('-', ' ')} issue has been reported in ${location.ward || 'your area'}`,
        ticketId
      )
    }
    
    return c.json({ ticket, message: 'Ticket submitted successfully' })
  } catch (error) {
    console.error('Error submitting ticket:', error)
    return c.json({ error: 'Internal server error while submitting ticket' }, 500)
  }
})

// Get user's tickets
app.get('/make-server-a75d69fe/tickets/my', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userTickets = await kv.get(`user_tickets_${user.id}`) || []
    const tickets = []
    
    for (const ticketId of userTickets) {
      const ticket = await kv.get(`ticket_${ticketId}`)
      if (ticket) {
        tickets.push(ticket)
      }
    }
    
    // Sort by creation date, newest first
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return c.json({ tickets })
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return c.json({ error: 'Internal server error while fetching tickets' }, 500)
  }
})

// Get nearby tickets
app.get('/make-server-a75d69fe/tickets/nearby', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '0')
    const lng = parseFloat(c.req.query('lng') || '0')
    const radius = parseFloat(c.req.query('radius') || '5') // 5km default
    
    // Get all tickets (in a real app, you'd use spatial queries)
    const allTickets = await kv.getByPrefix('ticket_')
    const nearbyTickets = []
    
    for (const ticket of allTickets) {
      if (ticket.location?.lat && ticket.location?.lng) {
        const distance = calculateDistance(lat, lng, ticket.location.lat, ticket.location.lng)
        if (distance <= radius) {
          nearbyTickets.push({ ...ticket, distance })
        }
      }
    }
    
    // Sort by distance
    nearbyTickets.sort((a, b) => a.distance - b.distance)
    
    return c.json({ tickets: nearbyTickets })
  } catch (error) {
    console.error('Error fetching nearby tickets:', error)
    return c.json({ error: 'Internal server error while fetching nearby tickets' }, 500)
  }
})

// Update ticket status (for authorities)
app.put('/make-server-a75d69fe/tickets/:ticketId/status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Check if user has authority role
    const userProfile = await kv.get(`user_profile_${user.id}`)
    if (!userProfile || userProfile.role !== 'authority') {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    const ticketId = c.req.param('ticketId')
    const { status, resolution, proofImageUrl } = await c.req.json()
    
    const ticket = await kv.get(`ticket_${ticketId}`)
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404)
    }
    
    // Handle status transitions for feedback system
    if (status === 'completed') {
      // When admin marks as completed, it goes to pending feedback
      ticket.status = 'pending_feedback'
      ticket.feedbackStatus = 'pending'
    } else {
      ticket.status = status
    }
    
    ticket.updatedAt = new Date().toISOString()
    ticket.assignedTo = user.id
    
    if (resolution) {
      ticket.resolution = {
        notes: resolution,
        proofImageUrl: proofImageUrl || null,
        resolvedBy: user.id,
        resolvedAt: new Date().toISOString()
      }
    }
    
    await kv.set(`ticket_${ticketId}`, ticket)
    
    // Create notification for ticket owner about status update
    const ticketOwnerProfile = await kv.get(`user_profile_${ticket.userId}`)
    if (ticketOwnerProfile) {
      const statusMessage = status === 'completed' ? 'resolved' : status.replace('-', ' ')
      await createNotification(
        ticket.userId,
        'ticket_update',
        'Ticket Status Updated',
        `Your ticket #${ticketId} has been ${statusMessage}`,
        ticketId
      )
      
      // If completed with proof, send feedback request notification
      if (status === 'completed' && proofImageUrl) {
        await createNotification(
          ticket.userId,
          'feedback_request',
          'Please Verify Resolution',
          `Your ticket #${ticketId} has been marked as resolved. Please review and confirm if the issue is actually fixed.`,
          ticketId
        )
      }
    }
    
    return c.json({ ticket, message: 'Ticket updated successfully' })
  } catch (error) {
    console.error('Error updating ticket status:', error)
    return c.json({ error: 'Internal server error while updating ticket' }, 500)
  }
})

// Upvote a ticket
app.post('/make-server-a75d69fe/tickets/:ticketId/upvote', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const ticketId = c.req.param('ticketId')
    const ticket = await kv.get(`ticket_${ticketId}`)
    
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404)
    }
    
    // Check if user already upvoted
    const upvoteKey = `upvote_${ticketId}_${user.id}`
    const existingUpvote = await kv.get(upvoteKey)
    
    if (existingUpvote) {
      return c.json({ error: 'Already upvoted' }, 400)
    }
    
    // Add upvote
    await kv.set(upvoteKey, { userId: user.id, ticketId, createdAt: new Date().toISOString() })
    ticket.upvotes = (ticket.upvotes || 0) + 1
    await kv.set(`ticket_${ticketId}`, ticket)
    
    // Create notification for ticket owner about upvote
    if (ticket.userId !== user.id) {
      await createNotification(
        ticket.userId,
        'ticket_upvote',
        'Your Issue Got Support',
        `Someone upvoted your ticket #${ticketId}. Total votes: ${ticket.upvotes}`,
        ticketId
      )
    }
    
    return c.json({ ticket, message: 'Upvoted successfully' })
  } catch (error) {
    console.error('Error upvoting ticket:', error)
    return c.json({ error: 'Internal server error while upvoting' }, 500)
  }
})

// Upload file
app.post('/make-server-a75d69fe/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${user.id}_${timestamp}.${extension}`
    
    const bucketName = 'make-a75d69fe-civic-uploads'
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file, {
        contentType: file.type,
        upsert: false
      })
    
    if (error) {
      console.error('Error uploading file:', error)
      return c.json({ error: 'Failed to upload file' }, 500)
    }
    
    // Create signed URL for access
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filename, 60 * 60 * 24 * 7) // 1 week expiry
    
    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError)
      return c.json({ error: 'Failed to create file access URL' }, 500)
    }
    
    return c.json({ 
      filename: data.path, 
      url: signedUrl.signedUrl,
      message: 'File uploaded successfully' 
    })
  } catch (error) {
    console.error('Error during file upload process:', error)
    return c.json({ error: 'Internal server error during file upload' }, 500)
  }
})

// Forgot password - send OTP
app.post('/make-server-a75d69fe/forgot-password', async (c) => {
  try {
    const { aadhaar } = await c.req.json()
    
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return c.json({ error: 'Invalid Aadhaar number format' }, 400)
    }
    
    // Find user by Aadhaar
    const allProfiles = await kv.getByPrefix('user_profile_')
    const userProfile = allProfiles.find(profile => profile.aadhaar === aadhaar)
    
    if (!userProfile) {
      return c.json({ error: 'User not found with this Aadhaar number' }, 404)
    }
    
    // Generate and store OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpData = {
      aadhaar,
      otp,
      email: userProfile.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    }
    
    await kv.set(`forgot_password_otp_${aadhaar}`, otpData)
    
    // In a real app, you'd send SMS/email with the OTP
    console.log(`🔐 Forgot Password OTP for ${aadhaar}: ${otp} (or use demo OTP: 123456)`)
    
    return c.json({ message: 'OTP sent to registered mobile and email', tempOtp: otp })
  } catch (error) {
    console.error('Error sending forgot password OTP:', error)
    return c.json({ error: 'Failed to send OTP' }, 500)
  }
})

// Verify forgot password OTP
app.post('/make-server-a75d69fe/verify-forgot-password-otp', async (c) => {
  try {
    const { aadhaar, otp } = await c.req.json()
    console.log(`OTP verification attempt for Aadhaar: ${aadhaar}, OTP: ${otp}`)
    
    const otpData = await kv.get(`forgot_password_otp_${aadhaar}`)
    if (!otpData) {
      console.log(`No OTP data found for Aadhaar: ${aadhaar}`)
      return c.json({ error: 'OTP not found or expired' }, 400)
    }
    
    console.log(`Stored OTP: ${otpData.otp}, Provided OTP: ${otp}, Expires at: ${otpData.expiresAt}`)
    
    if (new Date() > new Date(otpData.expiresAt)) {
      console.log(`OTP expired for Aadhaar: ${aadhaar}`)
      await kv.del(`forgot_password_otp_${aadhaar}`)
      return c.json({ error: 'OTP has expired' }, 400)
    }
    
    // Accept either the generated OTP or demo OTP "123456"
    if (otpData.otp !== otp && otp !== '123456') {
      console.log(`Invalid OTP for Aadhaar: ${aadhaar}. Expected: ${otpData.otp} or 123456, Got: ${otp}`)
      return c.json({ error: 'Invalid OTP' }, 400)
    }
    
    console.log(`OTP verified successfully for Aadhaar: ${aadhaar}`)
    
    // Mark OTP as verified
    otpData.verified = true
    await kv.set(`forgot_password_otp_${aadhaar}`, otpData)
    
    return c.json({ message: 'OTP verified successfully' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return c.json({ error: 'Failed to verify OTP' }, 500)
  }
})

// Reset password
app.post('/make-server-a75d69fe/reset-password', async (c) => {
  try {
    const { aadhaar, newPassword } = await c.req.json()
    
    const otpData = await kv.get(`forgot_password_otp_${aadhaar}`)
    if (!otpData || !otpData.verified) {
      return c.json({ error: 'OTP not verified' }, 400)
    }
    
    // Find user profile
    const allProfiles = await kv.getByPrefix('user_profile_')
    const userProfile = allProfiles.find(profile => profile.aadhaar === aadhaar)
    
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(userProfile.id, {
      password: newPassword
    })
    
    if (error) {
      console.error('Error updating password:', error)
      return c.json({ error: 'Failed to update password' }, 500)
    }
    
    // Clean up OTP data
    await kv.del(`forgot_password_otp_${aadhaar}`)
    
    return c.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return c.json({ error: 'Failed to reset password' }, 500)
  }
})

// Update user profile
app.put('/make-server-a75d69fe/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const profileData = await c.req.json()
    const { name, phone, address, department, designation, employeeId, profileImage } = profileData
    
    if (!name?.trim()) {
      return c.json({ error: 'Name is required' }, 400)
    }
    
    // Update user metadata in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        name: name.trim(),
        phone: phone || '',
        address: address || '',
        department: department || '',
        designation: designation || '',
        employeeId: employeeId || '',
        profileImage: profileImage || '',
        lastProfileUpdate: new Date().toISOString()
      }
    })
    
    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      return c.json({ error: 'Failed to update profile' }, 500)
    }
    
    // Also update in KV store for consistency
    const userProfile = await kv.get(`user_profile_${user.id}`) || {}
    const updatedProfile = {
      ...userProfile,
      name: name.trim(),
      phone: phone || '',
      address: address || '',
      department: department || '',
      designation: designation || '',
      employeeId: employeeId || '',
      profileImage: profileImage || '',
      lastProfileUpdate: new Date().toISOString()
    }
    await kv.set(`user_profile_${user.id}`, updatedProfile)
    
    return c.json({ 
      profile: updatedProfile, 
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return c.json({ error: 'Internal server error while updating profile' }, 500)
  }
})

// Get user profile
app.get('/make-server-a75d69fe/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    console.log('Profile endpoint - Authorization header:', c.req.header('Authorization'))
    console.log('Profile endpoint - Access token:', accessToken ? 'Present' : 'Missing')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    console.log('Profile endpoint - Auth result:', { 
      hasUser: !!user?.id, 
      userId: user?.id,
      authError: authError?.message 
    })
    
    if (!user?.id || authError) {
      console.log('Profile endpoint - Unauthorized:', { authError: authError?.message })
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Get profile from KV store first
    const profile = await kv.get(`user_profile_${user.id}`)
    
    if (profile) {
      // Return profile data (excluding sensitive fields like aadhaar)
      const { aadhaar, ...publicProfile } = profile
      return c.json(publicProfile)
    } else {
      // If no profile in KV store, return user metadata from auth
      const profileData = {
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        department: user.user_metadata?.department || '',
        designation: user.user_metadata?.designation || '',
        employeeId: user.user_metadata?.employeeId || '',
        profileImage: user.user_metadata?.profileImage || '',
        lastProfileUpdate: user.user_metadata?.lastProfileUpdate || null
      }
      return c.json(profileData)
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return c.json({ error: 'Internal server error while fetching profile' }, 500)
  }
})

// Send profile update OTP
app.post('/make-server-a75d69fe/profile/send-otp', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { email } = await c.req.json()
    
    if (!email || email !== user.email) {
      return c.json({ error: 'Invalid email' }, 400)
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpData = {
      userId: user.id,
      email,
      otp,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    }
    
    await kv.set(`profile_update_otp_${user.id}`, otpData)
    
    // TODO: Send email with OTP
    console.log(`Profile Update OTP for ${email}: ${otp}`)
    
    return c.json({ message: 'OTP sent to email', tempOtp: otp })
  } catch (error) {
    console.error('Error sending profile update OTP:', error)
    return c.json({ error: 'Failed to send OTP' }, 500)
  }
})

// Verify profile update OTP and update profile
app.post('/make-server-a75d69fe/profile/verify-otp', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { otp, profileData } = await c.req.json()
    
    // Verify OTP
    const otpData = await kv.get(`profile_update_otp_${user.id}`)
    if (!otpData) {
      return c.json({ error: 'OTP not found or expired' }, 400)
    }
    
    if (new Date() > new Date(otpData.expiresAt)) {
      await kv.del(`profile_update_otp_${user.id}`)
      return c.json({ error: 'OTP has expired' }, 400)
    }
    
    // Accept either the generated OTP or demo OTP "123456"
    if (otpData.otp !== otp && otp !== '123456') {
      return c.json({ error: 'Invalid OTP' }, 400)
    }
    
    const { name, phone, address, department, designation, employeeId, profileImage } = profileData
    
    if (!name?.trim()) {
      return c.json({ error: 'Name is required' }, 400)
    }
    
    // Update user metadata in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        name: name.trim(),
        phone: phone || '',
        address: address || '',
        department: department || '',
        designation: designation || '',
        employeeId: employeeId || '',
        profileImage: profileImage || '',
        lastProfileUpdate: new Date().toISOString()
      }
    })
    
    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      return c.json({ error: 'Failed to update profile' }, 500)
    }
    
    // Also update in KV store for consistency
    const userProfile = await kv.get(`user_profile_${user.id}`) || {}
    const updatedProfile = {
      ...userProfile,
      name: name.trim(),
      phone: phone || '',
      address: address || '',
      department: department || '',
      designation: designation || '',
      employeeId: employeeId || '',
      profileImage: profileImage || '',
      lastProfileUpdate: new Date().toISOString()
    }
    await kv.set(`user_profile_${user.id}`, updatedProfile)
    
    // Clean up OTP
    await kv.del(`profile_update_otp_${user.id}`)
    
    return c.json({ 
      profile: updatedProfile, 
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error verifying OTP and updating profile:', error)
    return c.json({ error: 'Internal server error while updating profile' }, 500)
  }
})

// Get all tickets (for authorities)
app.get('/make-server-a75d69fe/tickets/all', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Get query parameters for filtering
    const ward = c.req.query('ward')
    const status = c.req.query('status')
    const dateFrom = c.req.query('dateFrom')
    const dateTo = c.req.query('dateTo')
    const sortBy = c.req.query('sortBy') || 'date'
    
    // Get all tickets
    let allTickets = await kv.getByPrefix('ticket_')
    
    // Apply filters
    if (ward && ward !== 'all') {
      allTickets = allTickets.filter(ticket => ticket.location?.ward === ward)
    }
    
    if (status && status !== 'all') {
      allTickets = allTickets.filter(ticket => ticket.status === status)
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      allTickets = allTickets.filter(ticket => new Date(ticket.createdAt) >= fromDate)
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo)
      allTickets = allTickets.filter(ticket => new Date(ticket.createdAt) <= toDate)
    }
    
    // Calculate SLA status for sorting
    const now = new Date()
    allTickets.forEach(ticket => {
      if (ticket.slaDeadline && ['submitted', 'in-progress', 'pending_feedback'].includes(ticket.status)) {
        const deadline = new Date(ticket.slaDeadline)
        const timeLeft = deadline.getTime() - now.getTime()
        const hoursLeft = timeLeft / (1000 * 60 * 60)
        
        if (timeLeft <= 0) {
          ticket.slaStatus = 'overdue'
          ticket.urgencyScore = 1000 // Highest priority
        } else if (hoursLeft <= 2) {
          ticket.slaStatus = 'critical'
          ticket.urgencyScore = 100 + Math.max(0, 100 - hoursLeft)
        } else if (hoursLeft <= 24) {
          ticket.slaStatus = 'warning'
          ticket.urgencyScore = 50 + Math.max(0, 50 - hoursLeft/2)
        } else {
          ticket.slaStatus = 'normal'
          ticket.urgencyScore = Math.max(0, 25 - hoursLeft/24)
        }
      } else {
        ticket.slaStatus = 'normal'
        ticket.urgencyScore = 0
      }
    })

    // Sort tickets
    allTickets.sort((a, b) => {
      switch (sortBy) {
        case 'upvotes':
          return (b.upvotes || 0) - (a.upvotes || 0)
        case 'criticality':
          const criticalityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
          return (criticalityOrder[b.criticality] || 0) - (criticalityOrder[a.criticality] || 0)
        case 'sla':
          return (b.urgencyScore || 0) - (a.urgencyScore || 0)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'ward':
          return (a.location?.ward || '').localeCompare(b.location?.ward || '')
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    
    return c.json({ tickets: allTickets })
  } catch (error) {
    console.error('Error fetching all tickets:', error)
    return c.json({ error: 'Internal server error while fetching tickets' }, 500)
  }
})

// Get heatmap data
app.get('/make-server-a75d69fe/tickets/heatmap', async (c) => {
  try {
    const timeFilter = c.req.query('timeFilter') || 'week'
    const wardFilter = c.req.query('wardFilter') || 'all'
    
    // Get all tickets
    let allTickets = await kv.getByPrefix('ticket_')
    
    // Apply time filter
    const now = new Date()
    let dateThreshold = new Date()
    
    switch (timeFilter) {
      case 'day':
        dateThreshold.setDate(now.getDate() - 1)
        break
      case 'week':
        dateThreshold.setDate(now.getDate() - 7)
        break
      case 'month':
        dateThreshold.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        dateThreshold.setMonth(now.getMonth() - 3)
        break
    }
    
    if (timeFilter !== 'all') {
      allTickets = allTickets.filter(ticket => new Date(ticket.createdAt) >= dateThreshold)
    }
    
    // Apply ward filter
    if (wardFilter !== 'all') {
      allTickets = allTickets.filter(ticket => ticket.location?.ward === wardFilter)
    }
    
    // Group by ward and create heatmap data
    const wardData = {}
    
    allTickets.forEach(ticket => {
      const ward = ticket.location?.ward || 'Unknown'
      if (!wardData[ward]) {
        wardData[ward] = {
          ward,
          issueCount: 0,
          criticalCount: 0,
          totalUpvotes: 0,
          categories: {}
        }
      }
      
      wardData[ward].issueCount++
      if ((ticket.upvotes || 0) >= 15) {
        wardData[ward].criticalCount++
      }
      wardData[ward].totalUpvotes += ticket.upvotes || 0
      
      const category = ticket.category
      wardData[ward].categories[category] = (wardData[ward].categories[category] || 0) + 1
    })
    
    // Convert to array and add computed fields
    const heatmapData = Object.values(wardData).map((ward: any) => ({
      ...ward,
      averageUpvotes: ward.issueCount > 0 ? Math.round(ward.totalUpvotes / ward.issueCount) : 0,
      density: ward.issueCount > 40 ? 'critical' : 
               ward.issueCount > 25 ? 'high' : 
               ward.issueCount > 15 ? 'medium' : 'low'
    }))
    
    return c.json({ heatmapData })
  } catch (error) {
    console.error('Error generating heatmap data:', error)
    return c.json({ error: 'Internal server error while generating heatmap' }, 500)
  }
})

// Get notifications
app.get('/make-server-a75d69fe/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    console.log('Notifications endpoint - Authorization header:', c.req.header('Authorization'))
    console.log('Notifications endpoint - Access token:', accessToken ? 'Present' : 'Missing')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    console.log('Notifications endpoint - Auth result:', { 
      hasUser: !!user?.id, 
      userId: user?.id,
      authError: authError?.message 
    })
    
    if (!user?.id || authError) {
      console.log('Notifications endpoint - Unauthorized:', { authError: authError?.message })
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Get user notifications
    const notifications = await kv.get(`notifications_${user.id}`) || []
    
    // Sort by creation date, newest first
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return c.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return c.json({ error: 'Internal server error while fetching notifications' }, 500)
  }
})

// Mark notification as read
app.put('/make-server-a75d69fe/notifications/:notificationId/read', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const notificationId = c.req.param('notificationId')
    const notifications = await kv.get(`notifications_${user.id}`) || []
    
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    
    await kv.set(`notifications_${user.id}`, updatedNotifications)
    
    return c.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Mark all notifications as read
app.put('/make-server-a75d69fe/notifications/mark-all-read', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const notifications = await kv.get(`notifications_${user.id}`) || []
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }))
    
    await kv.set(`notifications_${user.id}`, updatedNotifications)
    
    return c.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Submit user feedback on completed ticket
app.post('/make-server-a75d69fe/tickets/:ticketId/feedback', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const ticketId = c.req.param('ticketId')
    const { approved, comments } = await c.req.json()
    
    const ticket = await kv.get(`ticket_${ticketId}`)
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404)
    }
    
    // Verify user owns this ticket
    if (ticket.userId !== user.id) {
      return c.json({ error: 'You can only provide feedback on your own tickets' }, 403)
    }
    
    // Verify ticket is in pending feedback state
    if (ticket.feedbackStatus !== 'pending') {
      return c.json({ error: 'This ticket is not awaiting feedback' }, 400)
    }
    
    // Update ticket with feedback
    ticket.feedbackStatus = approved ? 'approved' : 'rejected'
    ticket.userFeedback = {
      approved,
      comments: comments || '',
      submittedAt: new Date().toISOString()
    }
    
    if (approved) {
      ticket.status = 'completed'
    } else {
      ticket.status = 'reopened'
    }
    
    ticket.updatedAt = new Date().toISOString()
    await kv.set(`ticket_${ticketId}`, ticket)
    
    // Notify authority about the feedback
    if (ticket.assignedTo) {
      const feedbackType = approved ? 'approved' : 'rejected'
      await createNotification(
        ticket.assignedTo,
        'user_feedback',
        `User ${feedbackType} resolution`,
        `User has ${feedbackType} the resolution for ticket #${ticketId}${comments ? ': ' + comments : ''}`,
        ticketId
      )
    }
    
    return c.json({ ticket, message: 'Feedback submitted successfully' })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return c.json({ error: 'Internal server error while submitting feedback' }, 500)
  }
})

// Get SLA statistics
app.get('/make-server-a75d69fe/tickets/sla-stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Check if user has authority role
    const userProfile = await kv.get(`user_profile_${user.id}`)
    if (!userProfile || userProfile.role !== 'authority') {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    const allTickets = await kv.getByPrefix('ticket_')
    const now = new Date()
    
    const stats = {
      total: allTickets.length,
      overdue: 0,
      critical: 0,
      warning: 0,
      onTime: 0,
      byCriticality: {
        critical: { total: 0, overdue: 0 },
        high: { total: 0, overdue: 0 },
        medium: { total: 0, overdue: 0 },
        low: { total: 0, overdue: 0 }
      }
    }
    
    allTickets.forEach(ticket => {
      const criticality = ticket.criticality || 'low'
      stats.byCriticality[criticality].total++
      
      if (ticket.slaDeadline && ['submitted', 'in-progress', 'pending_feedback'].includes(ticket.status)) {
        const deadline = new Date(ticket.slaDeadline)
        const timeLeft = deadline.getTime() - now.getTime()
        const hoursLeft = timeLeft / (1000 * 60 * 60)
        
        if (timeLeft <= 0) {
          stats.overdue++
          stats.byCriticality[criticality].overdue++
        } else if (hoursLeft <= 2) {
          stats.critical++
        } else if (hoursLeft <= 24) {
          stats.warning++
        } else {
          stats.onTime++
        }
      } else {
        stats.onTime++
      }
    })
    
    return c.json({ stats })
  } catch (error) {
    console.error('Error fetching SLA stats:', error)
    return c.json({ error: 'Internal server error while fetching SLA stats' }, 500)
  }
})

// Helper function to create notification
async function createNotification(userId: string, type: string, title: string, message: string, ticketId?: string) {
  try {
    const notifications = await kv.get(`notifications_${userId}`) || []
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      ticketId,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    notifications.unshift(notification) // Add to beginning
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50)
    }
    
    await kv.set(`notifications_${userId}`, notifications)
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Performance metrics endpoint
app.get('/make-server-a75d69fe/tickets/performance-metrics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Mock performance metrics data for demo
    const performanceMetrics = {
      avgResolutionTime: {
        overall: 48.5,
        byCategory: [
          { category: 'Water Supply', avgTime: 24.5, trend: -12.3 },
          { category: 'Road Maintenance', avgTime: 72.0, trend: 8.5 },
          { category: 'Waste Management', avgTime: 18.2, trend: -5.7 },
          { category: 'Electricity', avgTime: 36.8, trend: -8.2 }
        ],
        byWard: [
          { ward: 'C-Scheme', avgTime: 42.3, trend: -15.2 },
          { ward: 'Malviya Nagar', avgTime: 54.7, trend: 7.8 },
          { ward: 'Vaishali Nagar', avgTime: 39.1, trend: -9.4 }
        ],
        bySupervisor: [
          { supervisor: 'Rajesh Kumar', avgTime: 32.5, ticketCount: 45, trend: -18.7 },
          { supervisor: 'Priya Sharma', avgTime: 41.2, ticketCount: 38, trend: -12.3 },
          { supervisor: 'Amit Singh', avgTime: 58.9, ticketCount: 42, trend: 5.2 }
        ]
      },
      slaCompliance: {
        overall: 87.3,
        byPriority: [
          { priority: 'critical', compliance: 95.5, total: 22 },
          { priority: 'high', compliance: 89.2, total: 56 },
          { priority: 'medium', compliance: 85.7, total: 134 },
          { priority: 'low', compliance: 82.1, total: 89 }
        ],
        trend: [
          { date: '2024-01', compliance: 82.5 },
          { date: '2024-02', compliance: 85.1 },
          { date: '2024-03', compliance: 87.3 },
          { date: '2024-04', compliance: 89.7 }
        ]
      },
      firstTimeFixRate: {
        overall: 76.8,
        byCategory: [
          { category: 'Water Supply', rate: 82.3, total: 67 },
          { category: 'Road Maintenance', rate: 68.9, total: 45 },
          { category: 'Waste Management', rate: 89.1, total: 78 },
          { category: 'Electricity', rate: 74.5, total: 53 }
        ],
        byWard: [
          { ward: 'C-Scheme', rate: 81.2, total: 73 },
          { ward: 'Malviya Nagar', rate: 72.8, total: 85 },
          { ward: 'Vaishali Nagar', rate: 79.3, total: 61 }
        ],
        trend: [
          { date: '2024-01', rate: 72.3 },
          { date: '2024-02', rate: 74.8 },
          { date: '2024-03', rate: 76.8 },
          { date: '2024-04', rate: 78.2 }
        ]
      }
    }

    return c.json(performanceMetrics)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return c.json({ error: 'Internal server error while fetching performance metrics' }, 500)
  }
})

// Trend analytics endpoint
app.get('/make-server-a75d69fe/tickets/trend-analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Mock trend analytics data for demo
    const trendAnalytics = {
      seasonalTrends: [
        {
          category: 'Water Supply',
          months: [
            { month: 'Jan', count: 45, avgLast3Years: 52 },
            { month: 'Feb', count: 38, avgLast3Years: 48 },
            { month: 'Mar', count: 62, avgLast3Years: 58 },
            { month: 'Apr', count: 89, avgLast3Years: 78 },
            { month: 'May', count: 124, avgLast3Years: 98 },
            { month: 'Jun', count: 156, avgLast3Years: 142 }
          ]
        }
      ],
      hotspots: [
        {
          location: 'MI Road Junction',
          lat: 26.9124,
          lng: 75.7873,
          issueCount: 47,
          recurringIssues: 23,
          lastIssueDate: '2024-03-15',
          categories: [
            { category: 'Traffic', count: 18 },
            { category: 'Roads', count: 15 },
            { category: 'Lighting', count: 14 }
          ]
        },
        {
          location: 'Malviya Nagar Market',
          lat: 26.8467,
          lng: 75.8648,
          issueCount: 35,
          recurringIssues: 19,
          lastIssueDate: '2024-03-12',
          categories: [
            { category: 'Waste', count: 21 },
            { category: 'Drainage', count: 8 },
            { category: 'Parking', count: 6 }
          ]
        }
      ],
      categoryCorrelations: [
        {
          primaryCategory: 'Drainage',
          correlatedCategory: 'Water Supply',
          correlation: 0.73,
          timeLag: 2,
          confidence: 0.89
        },
        {
          primaryCategory: 'Road Maintenance',
          correlatedCategory: 'Traffic Issues',
          correlation: 0.68,
          timeLag: 7,
          confidence: 0.82
        }
      ]
    }

    return c.json(trendAnalytics)
  } catch (error) {
    console.error('Error fetching trend analytics:', error)
    return c.json({ error: 'Internal server error while fetching trend analytics' }, 500)
  }
})

// Predictive insights endpoint
app.get('/make-server-a75d69fe/tickets/predictive-insights', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Mock predictive insights data for demo
    const predictiveInsights = {
      resourceRequirements: [
        {
          ward: 'C-Scheme',
          predictedIssues: 68,
          recommendedStaff: 4,
          priority: 'high'
        },
        {
          ward: 'Malviya Nagar',
          predictedIssues: 45,
          recommendedStaff: 3,
          priority: 'medium'
        },
        {
          ward: 'Vaishali Nagar',
          predictedIssues: 92,
          recommendedStaff: 6,
          priority: 'critical'
        }
      ],
      seasonalPreparation: [
        {
          category: 'Water Supply',
          expectedIncrease: 45,
          prepareBy: '2024-04-15',
          recommendations: [
            'Increase maintenance crew by 30%',
            'Stock additional pipeline materials',
            'Set up emergency response teams'
          ]
        },
        {
          category: 'Drainage',
          expectedIncrease: 78,
          prepareBy: '2024-06-01',
          recommendations: [
            'Clear all major drains before monsoon',
            'Deploy additional pumping equipment',
            'Coordinate with meteorology department'
          ]
        }
      ],
      riskAreas: [
        {
          ward: 'Mansarovar',
          riskScore: 87.5,
          factors: [
            'High population density',
            'Aging infrastructure',
            'Limited access roads',
            'History of recurring issues'
          ],
          preventiveActions: [
            'Infrastructure audit and upgrade',
            'Community awareness programs',
            'Increase patrol frequency',
            'Establish local response teams'
          ]
        }
      ]
    }

    return c.json(predictiveInsights)
  } catch (error) {
    console.error('Error fetching predictive insights:', error)
    return c.json({ error: 'Internal server error while fetching predictive insights' }, 500)
  }
})

// Health check endpoint
app.get('/make-server-a75d69fe/health', async (c) => {
  return c.json({ status: 'ok', message: 'Server is running' })
})

// Test auth endpoint
app.get('/make-server-a75d69fe/test-auth', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    console.log('Test auth - Authorization header:', c.req.header('Authorization'))
    console.log('Test auth - Access token present:', !!accessToken)
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided', debug: 'missing_token' }, 401)
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    console.log('Test auth - Supabase getUser result:', { 
      hasUser: !!user?.id, 
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message 
    })
    
    if (!user?.id || authError) {
      return c.json({ 
        error: 'Invalid or expired token', 
        debug: { 
          hasUser: !!user?.id, 
          authError: authError?.message 
        } 
      }, 401)
    }
    
    return c.json({ 
      message: 'Authentication successful', 
      user: { 
        id: user.id, 
        email: user.email 
      } 
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return c.json({ error: 'Internal server error', debug: error.message }, 500)
  }
})

// Debug OTP endpoint for troubleshooting
app.get('/make-server-a75d69fe/debug-otp/:aadhaar', async (c) => {
  try {
    const aadhaar = c.req.param('aadhaar')
    const otpData = await kv.get(`forgot_password_otp_${aadhaar}`)
    
    if (!otpData) {
      return c.json({ 
        message: 'No OTP found for this Aadhaar',
        aadhaar 
      })
    }
    
    const isExpired = new Date() > new Date(otpData.expiresAt)
    
    return c.json({ 
      message: 'OTP found',
      aadhaar,
      otp: otpData.otp,
      email: otpData.email,
      createdAt: otpData.createdAt,
      expiresAt: otpData.expiresAt,
      isExpired,
      verified: otpData.verified || false,
      demoOtp: '123456'
    })
  } catch (error) {
    console.error('Debug OTP error:', error)
    return c.json({ error: 'Internal server error', debug: error.message }, 500)
  }
})

Deno.serve(app.fetch)