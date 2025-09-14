import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react'
import { Badge } from './ui/badge'

interface SLATimerProps {
  ticket: any
  compact?: boolean
}

export default function SLATimer({ ticket, compact = false }: SLATimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    status: 'overdue' | 'critical' | 'warning' | 'normal'
    display: string
    percentage: number
  } | null>(null)

  useEffect(() => {
    if (!ticket.slaDeadline || !['submitted', 'in-progress', 'pending_feedback'].includes(ticket.status)) {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date()
      const deadline = new Date(ticket.slaDeadline)
      const created = new Date(ticket.createdAt)
      
      const totalTime = deadline.getTime() - created.getTime()
      const remainingTime = deadline.getTime() - now.getTime()
      const percentage = Math.max(0, (remainingTime / totalTime) * 100)

      let status: 'overdue' | 'critical' | 'warning' | 'normal' = 'normal'
      let display = ''

      if (remainingTime <= 0) {
        status = 'overdue'
        const overdue = Math.abs(remainingTime)
        const hours = Math.floor(overdue / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)
        
        if (days > 0) {
          display = `${days}d ${hours % 24}h overdue`
        } else {
          display = `${hours}h overdue`
        }
      } else {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))

        if (hours <= 2) {
          status = 'critical'
          display = `${hours}h ${minutes}m left`
        } else if (hours <= 24) {
          status = 'warning'
          display = `${hours}h left`
        } else {
          status = 'normal'
          if (days > 0) {
            display = `${days}d ${hours % 24}h left`
          } else {
            display = `${hours}h left`
          }
        }
      }

      setTimeLeft({ status, display, percentage })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [ticket.slaDeadline, ticket.status, ticket.createdAt])

  if (!timeLeft) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'destructive'
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'normal':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="h-3 w-3" />
      case 'critical':
        return <AlertCircle className="h-3 w-3" />
      case 'warning':
        return <Clock className="h-3 w-3" />
      case 'normal':
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  if (compact) {
    return (
      <Badge variant={getStatusColor(timeLeft.status)} className="text-xs">
        {getStatusIcon(timeLeft.status)}
        <span className="ml-1">{timeLeft.display}</span>
      </Badge>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center space-x-1">
          {getStatusIcon(timeLeft.status)}
          <span>SLA Timeline</span>
        </span>
        <Badge variant={getStatusColor(timeLeft.status)} className="text-xs">
          {timeLeft.display}
        </Badge>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            timeLeft.status === 'overdue' ? 'bg-red-600' :
            timeLeft.status === 'critical' ? 'bg-red-500' :
            timeLeft.status === 'warning' ? 'bg-orange-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, timeLeft.percentage))}%` }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground">
        Priority: <span className="capitalize font-medium">{ticket.criticality || 'Low'}</span>
      </div>
    </div>
  )
}