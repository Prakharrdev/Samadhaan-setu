import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import DarkModeToggle from './DarkModeToggle'
import { 
  MapPin, 
  Camera, 
  Bell, 
  Shield, 
  Users, 
  Smartphone, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const featuresRef = useRef<HTMLDivElement>(null)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-primary">Samadhaan Setu</h1>
                <p className="text-xs text-muted-foreground">Government Service Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DarkModeToggle />
              <Button onClick={onGetStarted} variant="outline" size="sm">
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              🏛️ Official Government Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-6">
              Report Civic Issues
              <span className="block text-secondary">Build Better Communities</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Connect directly with local authorities to report and track civic issues in your community. 
              From potholes to streetlights, your voice matters in building a better tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted} 
                size="lg" 
                className="h-12 px-8"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-primary mb-4">
              Powerful Features for Citizens & Authorities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform streamlines civic issue reporting with modern technology and government-grade security.
            </p>
          </div>

          {/* Scrolling container for features */}
          <div 
            ref={featuresRef}
            className="overflow-hidden"
          >
            <div className="scrolling-features flex space-x-6 pb-6" style={{ width: 'calc(200% + 24px)' }}>
                {/* Feature Cards - First Set */}
                <Card className="border-l-4 border-l-primary flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg text-primary">Mobile First</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Report issues on-the-go with our mobile-optimized interface designed for quick submissions.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Instant photo capture
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        GPS location detection
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-secondary flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                        <Bell className="w-6 h-6 text-secondary" />
                      </div>
                      <h3 className="text-lg text-primary">Real-time Tracking</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Track your reported issues from submission to resolution with live status updates.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Status notifications
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Resolution timeline
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-success" />
                      </div>
                      <h3 className="text-lg text-primary">Community Driven</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Support community issues by upvoting nearby problems and tracking collective concerns.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Upvote nearby issues
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Community heatmap
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg text-primary">Secure Authentication</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Government-grade security with Aadhaar-based authentication and OTP verification.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Aadhaar integration
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        OTP verification
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-secondary flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                        <Camera className="w-6 h-6 text-secondary" />
                      </div>
                      <h3 className="text-lg text-primary">Rich Media Support</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Capture photos and videos to provide clear evidence of civic issues for faster resolution.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Photo & video capture
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Resolution proof upload
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                        <Zap className="w-6 h-6 text-success" />
                      </div>
                      <h3 className="text-lg text-primary">Authority Dashboard</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Comprehensive tools for government authorities to manage, assign, and resolve civic issues efficiently.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Officer management
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Analytics dashboard
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Duplicate cards for seamless loop */}
                <Card className="border-l-4 border-l-primary flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg text-primary">Mobile First</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Report issues on-the-go with our mobile-optimized interface designed for quick submissions.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Instant photo capture
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        GPS location detection
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-secondary flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                        <Bell className="w-6 h-6 text-secondary" />
                      </div>
                      <h3 className="text-lg text-primary">Real-time Tracking</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Track your reported issues from submission to resolution with live status updates.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Status notifications
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Resolution timeline
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success flex-shrink-0 w-80">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-success" />
                      </div>
                      <h3 className="text-lg text-primary">Community Driven</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Support community issues by upvoting nearby problems and tracking collective concerns.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Upvote nearby issues
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Community heatmap
                      </li>
                    </ul>
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to report and resolve civic issues in your community
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">1</span>
              </div>
              <h3 className="text-lg text-primary mb-2">Spot an Issue</h3>
              <p className="text-muted-foreground">
                Notice a civic problem like a pothole, broken streetlight, or garbage accumulation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">2</span>
              </div>
              <h3 className="text-lg text-primary mb-2">Report & Document</h3>
              <p className="text-muted-foreground">
                Take photos, add location details, and submit your report through our secure platform
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">3</span>
              </div>
              <h3 className="text-lg text-primary mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your issue status as it gets assigned to authorities and moves toward resolution
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">4</span>
              </div>
              <h3 className="text-lg text-primary mb-2">See Results</h3>
              <p className="text-muted-foreground">
                Receive confirmation when the issue is resolved with photo proof from authorities
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-primary/90 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg">Samadhaan Setu</span>
              </div>
              <p className="text-white/80 text-sm">
                Empowering citizens to build better communities through technology and civic engagement.
              </p>
            </div>
            <div>
              <h4 className="mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Issue Reporting</li>
                <li>Real-time Tracking</li>
                <li>Community Engagement</li>
                <li>Authority Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>User Guide</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Government</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Accessibility</li>
                <li>Data Protection</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2025 Samadhaan Setu. A Government of India Initiative. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}