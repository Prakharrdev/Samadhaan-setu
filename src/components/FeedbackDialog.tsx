import React, { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ticketsAPI } from '../utils/api'

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  ticket: any
  onFeedbackSubmitted: () => void
}

export default function FeedbackDialog({ isOpen, onClose, ticket, onFeedbackSubmitted }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState<'approved' | 'rejected' | null>(null)
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!feedback) {
      toast.error('Please select whether the issue was resolved or not')
      return
    }

    setIsSubmitting(true)
    try {
      await ticketsAPI.submitFeedback(ticket.id, feedback === 'approved', comments)
      toast.success(feedback === 'approved' ? 'Thank you! Issue marked as resolved.' : 'Feedback submitted. Ticket has been reopened.')
      onFeedbackSubmitted()
      onClose()
      setFeedback(null)
      setComments('')
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      toast.error(error.message || 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Please Verify Resolution</DialogTitle>
          <DialogDescription>
            Review the resolution provided by authorities and confirm whether the issue has been properly fixed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            The authority has marked your ticket <span className="font-medium">#{ticket?.id}</span> as resolved. 
            Please verify if the issue has actually been fixed.
          </div>

          {ticket?.resolution?.proofImageUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Resolution Proof:</p>
              <img 
                src={ticket.resolution.proofImageUrl} 
                alt="Resolution proof" 
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          )}

          {ticket?.resolution?.notes && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Resolution Notes:</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {ticket.resolution.notes}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">Has the issue been resolved?</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={feedback === 'approved' ? 'default' : 'outline'}
                className="h-16 flex flex-col space-y-2"
                onClick={() => setFeedback('approved')}
              >
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>Yes, Resolved</span>
              </Button>
              
              <Button
                variant={feedback === 'rejected' ? 'destructive' : 'outline'}
                className="h-16 flex flex-col space-y-2"
                onClick={() => setFeedback('rejected')}
              >
                <XCircle className="h-6 w-6 text-red-600" />
                <span>No, Not Fixed</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments (Optional)</label>
            <Textarea
              placeholder={feedback === 'approved' 
                ? "Share your satisfaction with the resolution..." 
                : "Explain what's still not working..."
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          {feedback === 'rejected' && (
            <div className="flex items-start space-x-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200">Ticket will be reopened</p>
                <p className="text-orange-700 dark:text-orange-300">
                  The ticket will be sent back to authorities for further action.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!feedback || isSubmitting}
            className={feedback === 'approved' ? 'bg-green-600 hover:bg-green-700' : 
                      feedback === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}