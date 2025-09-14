import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Calendar,
  Activity,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  Award,
  Eye
} from 'lucide-react'
import { ticketsAPI } from '../utils/api'

interface PerformanceMetrics {
  avgResolutionTime: {
    overall: number
    byCategory: { category: string; avgTime: number; trend: number }[]
    byWard: { ward: string; avgTime: number; trend: number }[]
    bySupervisor: { supervisor: string; avgTime: number; ticketCount: number; trend: number }[]
  }
  slaCompliance: {
    overall: number
    byPriority: { priority: string; compliance: number; total: number }[]
    trend: { date: string; compliance: number }[]
  }
  firstTimeFixRate: {
    overall: number
    byCategory: { category: string; rate: number; total: number }[]
    byWard: { ward: string; rate: number; total: number }[]
    trend: { date: string; rate: number }[]
  }
}

interface TrendAnalytics {
  seasonalTrends: {
    category: string
    months: { month: string; count: number; avgLast3Years: number }[]
  }[]
  hotspots: {
    location: string
    lat: number
    lng: number
    issueCount: number
    recurringIssues: number
    lastIssueDate: string
    categories: { category: string; count: number }[]
  }[]
  categoryCorrelations: {
    primaryCategory: string
    correlatedCategory: string
    correlation: number
    timeLag: number // days
    confidence: number
  }[]
}

interface PredictiveInsights {
  resourceRequirements: {
    ward: string
    predictedIssues: number
    recommendedStaff: number
    priority: 'low' | 'medium' | 'high' | 'critical'
  }[]
  seasonalPreparation: {
    category: string
    expectedIncrease: number
    prepareBy: string
    recommendations: string[]
  }[]
  riskAreas: {
    ward: string
    riskScore: number
    factors: string[]
    preventiveActions: string[]
  }[]
}

interface AdvancedAnalyticsDashboardProps {
  userRole?: 'citizen' | 'authority'
  className?: string
}

export default function AdvancedAnalyticsDashboard({ 
  userRole = 'authority', 
  className = '' 
}: AdvancedAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('3months')
  const [selectedWard, setSelectedWard] = useState('all')
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [trendAnalytics, setTrendAnalytics] = useState<TrendAnalytics | null>(null)
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange, selectedWard])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const [performance, trends, predictions] = await Promise.all([
        ticketsAPI.getPerformanceMetrics(timeRange, selectedWard),
        ticketsAPI.getTrendAnalytics(timeRange, selectedWard),
        ticketsAPI.getPredictiveInsights(selectedWard)
      ])

      setPerformanceMetrics(performance)
      setTrendAnalytics(trends)
      setPredictiveInsights(predictions)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      // Set empty data on error to prevent crashes
      setPerformanceMetrics(null)
      setTrendAnalytics(null)
      setPredictiveInsights(null)
    } finally {
      setLoading(false)
    }
  }



  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}d ${remainingHours.toFixed(0)}h`
    }
  }

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0
    const isImprovement = trend < 0 // For resolution time, negative trend is improvement
    
    return (
      <div className={`flex items-center ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
        {isImprovement ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
        <span className="text-xs">{Math.abs(trend).toFixed(1)}%</span>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Advanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">Performance insights and predictive analysis</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedWard} onValueChange={setSelectedWard}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              <SelectItem value="c-scheme">C-Scheme</SelectItem>
              <SelectItem value="malviya-nagar">Malviya Nagar</SelectItem>
              <SelectItem value="vaishali-nagar">Vaishali Nagar</SelectItem>
              <SelectItem value="mansarovar">Mansarovar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends & Patterns
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Predictive Insights
          </TabsTrigger>
        </TabsList>

        {/* Performance & Efficiency Analytics */}
        <TabsContent value="performance" className="space-y-6">
          {performanceMetrics && (
            <>
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                        <p className="text-2xl font-bold">{formatTime(performanceMetrics.avgResolutionTime.overall)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">SLA Compliance</p>
                        <p className="text-2xl font-bold">{performanceMetrics.slaCompliance.overall.toFixed(1)}%</p>
                      </div>
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">First-Time Fix Rate</p>
                        <p className="text-2xl font-bold">{performanceMetrics.firstTimeFixRate.overall.toFixed(1)}%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resolution Time by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Resolution Time by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.avgResolutionTime.byCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{item.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">{formatTime(item.avgTime)}</span>
                              {formatTrend(item.trend)}
                            </div>
                          </div>
                          <Progress value={(item.avgTime / 100) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SLA Compliance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>SLA Compliance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceMetrics.slaCompliance.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'SLA Compliance']} />
                      <Line 
                        type="monotone" 
                        dataKey="compliance" 
                        stroke="#1e40af" 
                        strokeWidth={2}
                        dot={{ fill: '#1e40af' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Officer Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Field Supervisor Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.avgResolutionTime.bySupervisor.map((supervisor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{supervisor.supervisor}</p>
                            <p className="text-sm text-muted-foreground">{supervisor.ticketCount} tickets handled</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">{formatTime(supervisor.avgTime)}</p>
                            <p className="text-xs text-muted-foreground">avg resolution</p>
                          </div>
                          {formatTrend(supervisor.trend)}
                          {supervisor.trend < -10 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Award className="h-3 w-3 mr-1" />
                              Top Performer
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Trends & Patterns */}
        <TabsContent value="trends" className="space-y-6">
          {trendAnalytics && (
            <>
              {/* Seasonal Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Issue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trendAnalytics.seasonalTrends[0].months}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stackId="1" 
                        stroke="#1e40af" 
                        fill="#1e40af" 
                        fillOpacity={0.6}
                        name="Current Year"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avgLast3Years" 
                        stackId="2" 
                        stroke="#64748b" 
                        fill="#64748b" 
                        fillOpacity={0.3}
                        name="3-Year Average"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Problem Hotspots */}
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Issue Hotspots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendAnalytics.hotspots.map((hotspot, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5 text-destructive" />
                            <div>
                              <h4 className="font-medium">{hotspot.location}</h4>
                              <p className="text-sm text-muted-foreground">
                                {hotspot.issueCount} total issues • {hotspot.recurringIssues} recurring
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            High Risk
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          {hotspot.categories.map((cat, catIndex) => (
                            <div key={catIndex} className="text-center">
                              <p className="text-sm font-medium">{cat.count}</p>
                              <p className="text-xs text-muted-foreground">{cat.category}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Last issue: {new Date(hotspot.lastIssueDate).toLocaleDateString()}
                          </span>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View on Map
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Correlations */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Category Correlations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendAnalytics.categoryCorrelations.map((correlation, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{correlation.primaryCategory}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{correlation.correlatedCategory}</span>
                          </div>
                          <Badge variant="outline">
                            {(correlation.correlation * 100).toFixed(0)}% correlation
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Typical delay: {correlation.timeLag} days</span>
                          <span>Confidence: {(correlation.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={correlation.correlation * 100} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Predictive Insights */}
        <TabsContent value="predictions" className="space-y-6">
          {predictiveInsights && (
            <>
              {/* Resource Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Predicted Resource Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveInsights.resourceRequirements.map((requirement, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(requirement.priority)}`}></div>
                          <div>
                            <p className="font-medium">{requirement.ward}</p>
                            <p className="text-sm text-muted-foreground">
                              {requirement.predictedIssues} predicted issues
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{requirement.recommendedStaff} staff</p>
                          <p className="text-xs text-muted-foreground">recommended</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Seasonal Preparation */}
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Preparation Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {predictiveInsights.seasonalPreparation.map((prep, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{prep.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              Expected increase: {prep.expectedIncrease}% | Prepare by: {new Date(prep.prepareBy).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Action Required
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recommended Actions:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {prep.recommendations.map((rec, recIndex) => (
                              <li key={recIndex}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Areas */}
              <Card>
                <CardHeader>
                  <CardTitle>High-Risk Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveInsights.riskAreas.map((area, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                              {area.ward}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Risk Score: {area.riskScore.toFixed(1)}/100
                            </p>
                          </div>
                          <Progress value={area.riskScore} className="w-24 h-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Risk Factors:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {area.factors.map((factor, factorIndex) => (
                                <li key={factorIndex}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">Preventive Actions:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {area.preventiveActions.map((action, actionIndex) => (
                                <li key={actionIndex}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}