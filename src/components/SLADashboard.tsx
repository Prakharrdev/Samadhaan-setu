import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { ticketsAPI } from '../utils/api'

export default function SLADashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSLAStats()
  }, [])

  const fetchSLAStats = async () => {
    try {
      const response = await ticketsAPI.getSLAStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Error fetching SLA stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SLA Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading SLA statistics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const getCompliancePercentage = () => {
    if (stats.total === 0) return 100
    return Math.round(((stats.total - stats.overdue) / stats.total) * 100)
  }

  const compliance = getCompliancePercentage()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>SLA Performance Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.overdue}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Past Deadline</div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <Badge variant="default" className="text-xs bg-orange-600">CRITICAL</Badge>
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.critical}</div>
            <div className="text-sm text-orange-600 dark:text-orange-400">≤ 2 Hours Left</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-700">WARNING</Badge>
            </div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.warning}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">≤ 24 Hours Left</div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Badge variant="secondary" className="text-xs bg-green-600 text-white">ON TIME</Badge>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.onTime}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Within SLA</div>
          </div>
        </div>

        {/* Compliance Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">SLA Compliance</h3>
            <Badge 
              variant={compliance >= 90 ? 'secondary' : compliance >= 80 ? 'default' : 'destructive'}
              className={compliance >= 90 ? 'bg-green-600 text-white' : ''}
            >
              {compliance}%
            </Badge>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                compliance >= 90 ? 'bg-green-600' :
                compliance >= 80 ? 'bg-orange-500' :
                'bg-red-600'
              }`}
              style={{ width: `${compliance}%` }}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {compliance >= 90 ? 'Excellent performance! Keep it up.' :
             compliance >= 80 ? 'Good performance, but room for improvement.' :
             'Poor performance. Immediate attention required.'}
          </div>
        </div>

        {/* By Priority Breakdown */}
        <div className="space-y-4">
          <h3 className="font-medium">Performance by Priority</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCriticality).map(([priority, data]: [string, any]) => {
              const priorityCompliance = data.total > 0 ? Math.round(((data.total - data.overdue) / data.total) * 100) : 100
              return (
                <div key={priority} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={priority === 'critical' ? 'destructive' : 
                              priority === 'high' ? 'default' : 
                              priority === 'medium' ? 'outline' : 'secondary'}
                      className="capitalize text-xs"
                    >
                      {priority}
                    </Badge>
                    <span className="text-sm">
                      {data.total} total, {data.overdue} overdue
                    </span>
                  </div>
                  <Badge 
                    variant={priorityCompliance >= 90 ? 'secondary' : priorityCompliance >= 80 ? 'default' : 'destructive'}
                    className={priorityCompliance >= 90 ? 'bg-green-600 text-white' : ''}
                  >
                    {priorityCompliance}%
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}