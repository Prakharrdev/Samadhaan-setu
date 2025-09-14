import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { 
  Map, 
  MapPin, 
  Filter, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  X,
  ChevronRight
} from 'lucide-react'
import { ticketsAPI } from '../utils/api'

interface TicketLocation {
  id: string
  title: string
  category: string
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  latitude: number
  longitude: number
  upvotes: number
  dateRaised: string
  ward: string
  description: string
  assignedTo?: string
  estimatedResolution?: string
}

interface MapCluster {
  id: string
  latitude: number
  longitude: number
  count: number
  tickets: TicketLocation[]
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
}

interface MapFilters {
  status: string[]
  category: string[]
  priority: string[]
  dateRange: { start: string; end: string }
  minUpvotes: number
  wards: string[]
}

interface InteractiveIssueMapProps {
  userRole?: 'citizen' | 'authority'
  selectedTicketId?: string
  onTicketSelect?: (ticket: TicketLocation) => void
  className?: string
}

export default function InteractiveIssueMap({ 
  userRole = 'citizen', 
  selectedTicketId,
  onTicketSelect,
  className = '' 
}: InteractiveIssueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [tickets, setTickets] = useState<TicketLocation[]>([])
  const [clusters, setClusters] = useState<MapCluster[]>([])
  const [loading, setLoading] = useState(true)
  const [mapView, setMapView] = useState<'pins' | 'heatmap'>('pins')
  const [zoomLevel, setZoomLevel] = useState(12)
  const [center, setCenter] = useState({ lat: 26.9124, lng: 75.7873 }) // Jaipur coordinates
  const [selectedTicket, setSelectedTicket] = useState<TicketLocation | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showTicketDetails, setShowTicketDetails] = useState(false)

  const [filters, setFilters] = useState<MapFilters>({
    status: [],
    category: [],
    priority: [],
    dateRange: { start: '', end: '' },
    minUpvotes: 0,
    wards: []
  })

  const categories = [
    'Road Repair', 'Garbage Collection', 'Street Lights', 'Water Supply',
    'Drainage', 'Traffic', 'Parks & Gardens', 'Noise Pollution',
    'Building Violations', 'Animal Control'
  ]

  const statuses = ['pending', 'in-progress', 'resolved', 'closed']
  const priorities = ['low', 'medium', 'high', 'critical']

  useEffect(() => {
    loadMapData()
  }, [filters])

  useEffect(() => {
    if (selectedTicketId) {
      const ticket = tickets.find(t => t.id === selectedTicketId)
      if (ticket) {
        setSelectedTicket(ticket)
        setCenter({ lat: ticket.latitude, lng: ticket.longitude })
        setZoomLevel(16)
        setShowTicketDetails(true)
      }
    }
  }, [selectedTicketId, tickets])

  const loadMapData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await ticketsAPI.getTicketLocations(filters)
      
      // Simulate async loading with a short delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Mock data generation
      const mockTickets = generateMockTickets()
      setTickets(mockTickets)
      
      // Generate clusters based on zoom level
      const generatedClusters = generateClusters(mockTickets, zoomLevel)
      setClusters(generatedClusters)
    } catch (error) {
      console.error('Error loading map data:', error)
      // Set empty data on error
      setTickets([])
      setClusters([])
    } finally {
      setLoading(false)
    }
  }

  const generateMockTickets = (): TicketLocation[] => {
    const mockTickets: TicketLocation[] = []
    const baseCoords = [
      { lat: 26.9124, lng: 75.7873, ward: 'C-Scheme' },
      { lat: 26.9200, lng: 75.8000, ward: 'Malviya Nagar' },
      { lat: 26.8950, lng: 75.8150, ward: 'Vaishali Nagar' },
      { lat: 26.9300, lng: 75.7700, ward: 'Civil Lines' },
      { lat: 26.8800, lng: 75.7950, ward: 'Mansarovar' },
      { lat: 26.9050, lng: 75.7650, ward: 'Bajaj Nagar' },
    ]

    for (let i = 0; i < 150; i++) {
      const baseCoord = baseCoords[Math.floor(Math.random() * baseCoords.length)]
      const ticket: TicketLocation = {
        id: `TKT${String(i + 1).padStart(5, '0')}`,
        title: `${categories[Math.floor(Math.random() * categories.length)]} Issue`,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        priority: priorities[Math.floor(Math.random() * priorities.length)] as any,
        latitude: baseCoord.lat + (Math.random() - 0.5) * 0.02,
        longitude: baseCoord.lng + (Math.random() - 0.5) * 0.02,
        upvotes: Math.floor(Math.random() * 200),
        dateRaised: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        ward: baseCoord.ward,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        assignedTo: Math.random() > 0.5 ? 'Officer Name' : undefined,
        estimatedResolution: Math.random() > 0.5 ? '2-3 days' : undefined
      }
      mockTickets.push(ticket)
    }

    return mockTickets
  }

  const generateClusters = (tickets: TicketLocation[], zoom: number): MapCluster[] => {
    if (zoom >= 15) {
      // At high zoom, show individual pins
      return []
    }

    const clusterRadius = zoom < 10 ? 0.05 : zoom < 13 ? 0.02 : 0.01
    const clusters: MapCluster[] = []
    const processed = new Set<string>()

    tickets.forEach(ticket => {
      if (processed.has(ticket.id)) return

      const clusterTickets = tickets.filter(t => {
        if (processed.has(t.id)) return false
        const distance = Math.sqrt(
          Math.pow(t.latitude - ticket.latitude, 2) + 
          Math.pow(t.longitude - ticket.longitude, 2)
        )
        return distance <= clusterRadius
      })

      if (clusterTickets.length > 1) {
        const centerLat = clusterTickets.reduce((sum, t) => sum + t.latitude, 0) / clusterTickets.length
        const centerLng = clusterTickets.reduce((sum, t) => sum + t.longitude, 0) / clusterTickets.length

        clusters.push({
          id: `cluster-${clusters.length}`,
          latitude: centerLat,
          longitude: centerLng,
          count: clusterTickets.length,
          tickets: clusterTickets,
          bounds: {
            north: Math.max(...clusterTickets.map(t => t.latitude)),
            south: Math.min(...clusterTickets.map(t => t.latitude)),
            east: Math.max(...clusterTickets.map(t => t.longitude)),
            west: Math.min(...clusterTickets.map(t => t.longitude))
          }
        })

        clusterTickets.forEach(t => processed.add(t.id))
      }
    })

    return clusters
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (filters.status.length > 0 && !filters.status.includes(ticket.status)) return false
      if (filters.category.length > 0 && !filters.category.includes(ticket.category)) return false
      if (filters.priority.length > 0 && !filters.priority.includes(ticket.priority)) return false
      if (filters.minUpvotes > 0 && ticket.upvotes < filters.minUpvotes) return false
      if (filters.wards.length > 0 && !filters.wards.includes(ticket.ward)) return false
      
      if (filters.dateRange.start) {
        const ticketDate = new Date(ticket.dateRaised)
        const startDate = new Date(filters.dateRange.start)
        if (ticketDate < startDate) return false
      }
      
      if (filters.dateRange.end) {
        const ticketDate = new Date(ticket.dateRaised)
        const endDate = new Date(filters.dateRange.end)
        if (ticketDate > endDate) return false
      }

      return true
    })
  }, [tickets, filters])

  const handleTicketClick = (ticket: TicketLocation) => {
    setSelectedTicket(ticket)
    setShowTicketDetails(true)
    onTicketSelect?.(ticket)
  }

  const handleClusterClick = (cluster: MapCluster) => {
    // Zoom in to cluster bounds
    setZoomLevel(Math.min(zoomLevel + 2, 18))
    setCenter({
      lat: cluster.latitude,
      lng: cluster.longitude
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-500'
      case 'in-progress': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-green-500 bg-green-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const clearAllFilters = () => {
    setFilters({
      status: [],
      category: [],
      priority: [],
      dateRange: { start: '', end: '' },
      minUpvotes: 0,
      wards: []
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Map className="h-5 w-5 mr-2" />
            Interactive Issue Map
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                size="sm"
                variant={mapView === 'pins' ? 'default' : 'ghost'}
                onClick={() => setMapView('pins')}
                className="px-3 py-1"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Pins
              </Button>
              <Button
                size="sm"
                variant={mapView === 'heatmap' ? 'default' : 'ghost'}
                onClick={() => setMapView('heatmap')}
                className="px-3 py-1"
              >
                <Layers className="h-4 w-4 mr-1" />
                Heatmap
              </Button>
            </div>

            {/* Filters */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                  {(filters.status.length + filters.category.length + filters.priority.length) > 0 && (
                    <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                      {filters.status.length + filters.category.length + filters.priority.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80 sm:w-96" side="right">
                <SheetHeader>
                  <SheetTitle>Map Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {statuses.map(status => (
                        <Button
                          key={status}
                          size="sm"
                          variant={filters.status.includes(status) ? "default" : "outline"}
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              status: prev.status.includes(status)
                                ? prev.status.filter(s => s !== status)
                                : [...prev.status, status]
                            }))
                          }}
                          className="justify-start capitalize"
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`} />
                          {status.replace('-', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <Label className="text-sm font-medium">Issue Category</Label>
                    <div className="grid grid-cols-1 gap-1 mt-2 max-h-32 overflow-y-auto">
                      {categories.map(category => (
                        <Button
                          key={category}
                          size="sm"
                          variant={filters.category.includes(category) ? "default" : "outline"}
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              category: prev.category.includes(category)
                                ? prev.category.filter(c => c !== category)
                                : [...prev.category, category]
                            }))
                          }}
                          className="justify-start text-xs"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {priorities.map(priority => (
                        <Button
                          key={priority}
                          size="sm"
                          variant={filters.priority.includes(priority) ? "default" : "outline"}
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              priority: prev.priority.includes(priority)
                                ? prev.priority.filter(p => p !== priority)
                                : [...prev.priority, priority]
                            }))
                          }}
                          className="justify-start capitalize"
                        >
                          {priority}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <Label className="text-sm font-medium">Date Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">From</Label>
                        <Input
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, start: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">To</Label>
                        <Input
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upvotes Slider */}
                  <div>
                    <Label className="text-sm font-medium">
                      Minimum Upvotes: {filters.minUpvotes}
                    </Label>
                    <Slider
                      value={[filters.minUpvotes]}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, minUpvotes: value[0] }))}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  {/* Clear Filters */}
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef}
            className="h-96 bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden rounded-b-lg"
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-orange-50">
                  {/* Grid lines to simulate map */}
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="absolute border-t border-gray-300" style={{ 
                        top: `${i * 5}%`, 
                        width: '100%' 
                      }} />
                    ))}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="absolute border-l border-gray-300" style={{ 
                        left: `${i * 5}%`, 
                        height: '100%' 
                      }} />
                    ))}
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 18))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 8))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>

                {/* Zoom Level Indicator */}
                <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded text-xs font-mono">
                  Zoom: {zoomLevel}
                </div>

                {/* Render Clusters or Individual Pins */}
                {mapView === 'pins' && (
                  <>
                    {/* Clusters */}
                    {clusters.map(cluster => (
                      <div
                        key={cluster.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                        style={{
                          left: `${((cluster.longitude - 75.7) / 0.2) * 100}%`,
                          top: `${((26.95 - cluster.latitude) / 0.1) * 100}%`
                        }}
                        onClick={() => handleClusterClick(cluster)}
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm border-4 border-white shadow-lg hover:scale-110 transition-transform">
                          {cluster.count}+
                        </div>
                      </div>
                    ))}

                    {/* Individual Pins */}
                    {zoomLevel >= 15 && filteredTickets.map(ticket => (
                      <Popover key={ticket.id}>
                        <PopoverTrigger asChild>
                          <div
                            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10 group"
                            style={{
                              left: `${((ticket.longitude - 75.7) / 0.2) * 100}%`,
                              top: `${((26.95 - ticket.latitude) / 0.1) * 100}%`
                            }}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform ${getStatusColor(ticket.status)}`}>
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="top">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-sm">{ticket.title}</h4>
                                <p className="text-xs text-muted-foreground">{ticket.id}</p>
                              </div>
                              <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <p className="font-medium">{ticket.category}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <div className="flex items-center mt-1">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(ticket.status)}`} />
                                  <span className="capitalize">{ticket.status.replace('-', ' ')}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Upvotes:</span>
                                <p className="font-medium flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {ticket.upvotes}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <p className="font-medium">{formatDate(ticket.dateRaised)}</p>
                              </div>
                            </div>

                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleTicketClick(ticket)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Details
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </>
                )}

                {/* Heatmap View */}
                {mapView === 'heatmap' && (
                  <div className="absolute inset-0">
                    {/* Heatmap overlay */}
                    <div className="absolute inset-0 bg-gradient-radial from-red-500/30 via-orange-500/20 to-transparent opacity-60"></div>
                    <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-gradient-radial from-red-600/40 to-transparent rounded-full"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-gradient-radial from-orange-500/40 to-transparent rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-radial from-red-500/50 to-transparent rounded-full"></div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map Stats */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="font-medium">{filteredTickets.length}</span>
              <span className="text-muted-foreground ml-1">issues shown</span>
            </div>
            {zoomLevel < 15 && clusters.length > 0 && (
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="font-medium">{clusters.length}</span>
                <span className="text-muted-foreground ml-1">clusters</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details Dialog */}
        <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Issue Details</span>
                {selectedTicket && (
                  <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority} priority
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                View comprehensive details about this civic issue including location, status, and resolution progress.
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Ticket ID</Label>
                    <p className="text-sm font-mono">{selectedTicket.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(selectedTicket.status)}`} />
                      <span className="text-sm capitalize">{selectedTicket.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Ward</Label>
                    <p className="text-sm">{selectedTicket.ward}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date Raised</Label>
                    <p className="text-sm">{formatDate(selectedTicket.dateRaised)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Community Support</Label>
                    <p className="text-sm flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {selectedTicket.upvotes} upvotes
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
                </div>

                {selectedTicket.assignedTo && (
                  <div>
                    <Label className="text-sm font-medium">Assigned To</Label>
                    <p className="text-sm">{selectedTicket.assignedTo}</p>
                  </div>
                )}

                {selectedTicket.estimatedResolution && (
                  <div>
                    <Label className="text-sm font-medium">Estimated Resolution</Label>
                    <p className="text-sm">{selectedTicket.estimatedResolution}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    View Full Ticket
                  </Button>
                  {userRole === 'authority' && (
                    <Button className="flex-1">
                      Update Status
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}