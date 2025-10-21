"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Settings, 
  Save, 
  Plus,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  Clock,
  Users,
  MapPin,
  Bell,
  Star,
  Filter,
  Eye
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface EventsPageContent {
  title: string
  description: string
  featuredImage?: string
  layout: 'grid' | 'list' | 'timeline' | 'calendar'
  showFeatured: boolean
  showCategories: boolean
  showFilters: boolean
  itemsPerPage: number
  eventSettings: {
    allowEventCreation: boolean
    requireApproval: boolean
    allowRSVP: boolean
    maxAttendees: number
    showAttendeeList: boolean
    allowWaitlist: boolean
    requirePayment: boolean
    allowRefunds: boolean
  }
  displaySettings: {
    showUpcoming: boolean
    showPast: boolean
    showFeatured: boolean
    showCategories: boolean
    showLocation: boolean
    showAttendeeCount: boolean
    showPrice: boolean
    defaultView: 'upcoming' | 'all' | 'featured'
  }
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
    reminderNotifications: boolean
    reminderTime: number
    eventUpdates: boolean
    newEvents: boolean
  }
  filteringSettings: {
    enableDateFilter: boolean
    enableCategoryFilter: boolean
    enablePriceFilter: boolean
    enableLocationFilter: boolean
    enableStatusFilter: boolean
    defaultSort: 'date' | 'popularity' | 'price' | 'name'
  }
  styling: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    borderRadius: string
  }
}

export default function EventsPageManagement({
  params
}: {
  params: { id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageContent, setPageContent] = useState<EventsPageContent>({
    title: "Upcoming Events",
    description: "Discover and join exciting NFT events",
    layout: 'grid',
    showFeatured: true,
    showCategories: true,
    showFilters: true,
    itemsPerPage: 12,
    eventSettings: {
      allowEventCreation: true,
      requireApproval: false,
      allowRSVP: true,
      maxAttendees: 100,
      showAttendeeList: true,
      allowWaitlist: true,
      requirePayment: false,
      allowRefunds: true
    },
    displaySettings: {
      showUpcoming: true,
      showPast: false,
      showFeatured: true,
      showCategories: true,
      showLocation: true,
      showAttendeeCount: true,
      showPrice: true,
      defaultView: 'upcoming'
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      reminderNotifications: true,
      reminderTime: 24,
      eventUpdates: true,
      newEvents: true
    },
    filteringSettings: {
      enableDateFilter: true,
      enableCategoryFilter: true,
      enablePriceFilter: true,
      enableLocationFilter: true,
      enableStatusFilter: true,
      defaultSort: 'date'
    },
    styling: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      borderRadius: '0.5rem'
    }
  })
  
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchEventsPage()
  }, [params.id])

  const fetchEventsPage = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages?type=events`)
      if (response.ok) {
        const data = await response.json()
        if (data.pages && data.pages.length > 0) {
          setPageContent(data.pages[0].content)
        }
      }
    } catch (error) {
      console.error("Error fetching events page:", error)
      toast({
        title: "Error",
        description: "Failed to load events page configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEventsPage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'events',
          title: pageContent.title,
          description: pageContent.description,
          content: pageContent,
          isActive: true,
          order: 5,
          slug: 'events'
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Events page configuration saved successfully!",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save events page")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save events page",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="merchant">
        <DashboardLayout role="merchant">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events Page Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure your marketplace events and event management features
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEventsPage}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSaveEventsPage} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Configuration
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="display">
                <Eye className="w-4 h-4 mr-2" />
                Display
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="filtering">
                <Filter className="w-4 h-4 mr-2" />
                Filtering
              </TabsTrigger>
              <TabsTrigger value="styling">
                <Settings className="w-4 h-4 mr-2" />
                Styling
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic page information and display options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="page-title">Page Title</Label>
                        <Input
                          id="page-title"
                          value={pageContent.title}
                          onChange={(e) => setPageContent(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Upcoming Events"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="page-description">Page Description</Label>
                        <Textarea
                          id="page-description"
                          value={pageContent.description}
                          onChange={(e) => setPageContent(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Discover and join exciting NFT events"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="featured-image">Featured Image URL</Label>
                        <Input
                          id="featured-image"
                          value={pageContent.featuredImage || ''}
                          onChange={(e) => setPageContent(prev => ({ ...prev, featuredImage: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-featured">Show Featured Section</Label>
                        <Switch
                          id="show-featured"
                          checked={pageContent.showFeatured}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showFeatured: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-categories">Show Categories</Label>
                        <Switch
                          id="show-categories"
                          checked={pageContent.showCategories}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showCategories: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-filters">Show Filters</Label>
                        <Switch
                          id="show-filters"
                          checked={pageContent.showFilters}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showFilters: checked }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="items-per-page">Items Per Page</Label>
                        <Input
                          id="items-per-page"
                          type="number"
                          value={pageContent.itemsPerPage}
                          onChange={(e) => setPageContent(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
                          placeholder="12"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Event Settings */}
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Event Settings
                  </CardTitle>
                  <CardDescription>
                    Configure event creation and management features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-event-creation">Allow Event Creation</Label>
                        <Switch
                          id="allow-event-creation"
                          checked={pageContent.eventSettings.allowEventCreation}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, allowEventCreation: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-approval">Require Approval</Label>
                        <Switch
                          id="require-approval"
                          checked={pageContent.eventSettings.requireApproval}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, requireApproval: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-rsvp">Allow RSVP</Label>
                        <Switch
                          id="allow-rsvp"
                          checked={pageContent.eventSettings.allowRSVP}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, allowRSVP: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-attendee-list">Show Attendee List</Label>
                        <Switch
                          id="show-attendee-list"
                          checked={pageContent.eventSettings.showAttendeeList}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, showAttendeeList: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-waitlist">Allow Waitlist</Label>
                        <Switch
                          id="allow-waitlist"
                          checked={pageContent.eventSettings.allowWaitlist}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, allowWaitlist: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-payment">Require Payment</Label>
                        <Switch
                          id="require-payment"
                          checked={pageContent.eventSettings.requirePayment}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, requirePayment: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-refunds">Allow Refunds</Label>
                        <Switch
                          id="allow-refunds"
                          checked={pageContent.eventSettings.allowRefunds}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, allowRefunds: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-attendees">Maximum Attendees</Label>
                        <Input
                          id="max-attendees"
                          type="number"
                          value={pageContent.eventSettings.maxAttendees}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              eventSettings: { ...prev.eventSettings, maxAttendees: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Display Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how events are displayed to users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-upcoming">Show Upcoming Events</Label>
                        <Switch
                          id="show-upcoming"
                          checked={pageContent.displaySettings.showUpcoming}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, showUpcoming: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-past">Show Past Events</Label>
                        <Switch
                          id="show-past"
                          checked={pageContent.displaySettings.showPast}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, showPast: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-featured-events">Show Featured Events</Label>
                        <Switch
                          id="show-featured-events"
                          checked={pageContent.displaySettings.showFeatured}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, showFeatured: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-categories-display">Show Categories</Label>
                        <Switch
                          id="show-categories-display"
                          checked={pageContent.displaySettings.showCategories}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, showCategories: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-location">Show Location</Label>
                        <Switch
                          id="show-location"
                          checked={pageContent.displaySettings.showLocation}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, showLocation: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-attendee-count">Show Attendee Count</Label>
                        <Switch
                          id="show-attendee-count"
                          checked={pageContent.displaySettings.showAttendeeCount}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, showAttendeeCount: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-price">Show Price</Label>
                        <Switch
                          id="show-price"
                          checked={pageContent.displaySettings.showPrice}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, showPrice: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="default-view">Default View</Label>
                        <Select
                          value={pageContent.displaySettings.defaultView}
                          onValueChange={(value: 'upcoming' | 'all' | 'featured') => 
                            setPageContent(prev => ({
                              ...prev,
                              displaySettings: { ...prev.displaySettings, defaultView: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming Events</SelectItem>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="featured">Featured Events</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="layout-type">Layout Type</Label>
                        <Select
                          value={pageContent.layout}
                          onValueChange={(value: 'grid' | 'list' | 'timeline' | 'calendar') => 
                            setPageContent(prev => ({ ...prev, layout: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid Layout</SelectItem>
                            <SelectItem value="list">List Layout</SelectItem>
                            <SelectItem value="timeline">Timeline Layout</SelectItem>
                            <SelectItem value="calendar">Calendar Layout</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure event-related notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch
                          id="email-notifications"
                          checked={pageContent.notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, emailNotifications: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <Switch
                          id="push-notifications"
                          checked={pageContent.notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, pushNotifications: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reminder-notifications">Reminder Notifications</Label>
                        <Switch
                          id="reminder-notifications"
                          checked={pageContent.notificationSettings.reminderNotifications}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, reminderNotifications: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="event-updates">Event Updates</Label>
                        <Switch
                          id="event-updates"
                          checked={pageContent.notificationSettings.eventUpdates}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, eventUpdates: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="new-events">New Events</Label>
                        <Switch
                          id="new-events"
                          checked={pageContent.notificationSettings.newEvents}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, newEvents: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reminder-time">Reminder Time (hours before)</Label>
                        <Input
                          id="reminder-time"
                          type="number"
                          value={pageContent.notificationSettings.reminderTime}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, reminderTime: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="24"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Filtering Settings */}
            <TabsContent value="filtering">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filtering Settings
                  </CardTitle>
                  <CardDescription>
                    Configure available filters and sorting options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-date-filter">Enable Date Filter</Label>
                        <Switch
                          id="enable-date-filter"
                          checked={pageContent.filteringSettings.enableDateFilter}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              filteringSettings: { ...prev.filteringSettings, enableDateFilter: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-category-filter">Enable Category Filter</Label>
                        <Switch
                          id="enable-category-filter"
                          checked={pageContent.filteringSettings.enableCategoryFilter}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              filteringSettings: { ...prev.filteringSettings, enableCategoryFilter: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-price-filter">Enable Price Filter</Label>
                        <Switch
                          id="enable-price-filter"
                          checked={pageContent.filteringSettings.enablePriceFilter}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              filteringSettings: { ...prev.filteringSettings, enablePriceFilter: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-location-filter">Enable Location Filter</Label>
                        <Switch
                          id="enable-location-filter"
                          checked={pageContent.filteringSettings.enableLocationFilter}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              filteringSettings: { ...prev.filteringSettings, enableLocationFilter: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-status-filter">Enable Status Filter</Label>
                        <Switch
                          id="enable-status-filter"
                          checked={pageContent.filteringSettings.enableStatusFilter}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              filteringSettings: { ...prev.filteringSettings, enableStatusFilter: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="default-sort">Default Sort</Label>
                        <Select
                          value={pageContent.filteringSettings.defaultSort}
                          onValueChange={(value: 'date' | 'popularity' | 'price' | 'name') => 
                            setPageContent(prev => ({
                              ...prev,
                              filteringSettings: { ...prev.filteringSettings, defaultSort: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="popularity">Popularity</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Styling Settings */}
            <TabsContent value="styling">
              <Card>
                <CardHeader>
                  <CardTitle>Styling Settings</CardTitle>
                  <CardDescription>
                    Customize the appearance of your events page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={pageContent.styling.primaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, primaryColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.primaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, primaryColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={pageContent.styling.secondaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, secondaryColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.secondaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, secondaryColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="accent-color"
                            type="color"
                            value={pageContent.styling.accentColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, accentColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.accentColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, accentColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="font-family">Font Family</Label>
                        <Select
                          value={pageContent.styling.fontFamily}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              styling: { ...prev.styling, fontFamily: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="border-radius">Border Radius</Label>
                        <Select
                          value={pageContent.styling.borderRadius}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              styling: { ...prev.styling, borderRadius: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0rem">None</SelectItem>
                            <SelectItem value="0.25rem">Small</SelectItem>
                            <SelectItem value="0.5rem">Medium</SelectItem>
                            <SelectItem value="0.75rem">Large</SelectItem>
                            <SelectItem value="1rem">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
