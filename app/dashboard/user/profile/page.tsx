"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Mail, 
  Wallet, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Save,
  Edit,
  Camera,
  Link as LinkIcon
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/settings')
        ])

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserProfile(profileData.user)
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSettings(settingsData.settings)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [isAuthenticated, authLoading])

  const handleProfileUpdate = async () => {
    setProfileLoading(true)
    try {
      const name = (document.getElementById('userName') as HTMLInputElement)?.value
      const email = (document.getElementById('userEmail') as HTMLInputElement)?.value
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSettingsUpdate = async () => {
    setSettingsLoading(true)
    try {
      const notifications = {
        email: (document.getElementById('emailNotifications') as HTMLInputElement)?.checked,
        push: (document.getElementById('pushNotifications') as HTMLInputElement)?.checked,
        sms: (document.getElementById('smsNotifications') as HTMLInputElement)?.checked,
      }
      
      const privacy = {
        profileVisible: (document.getElementById('profileVisible') as HTMLInputElement)?.checked,
        activityVisible: (document.getElementById('activityVisible') as HTMLInputElement)?.checked,
      }
      
      const preferences = {
        theme: (document.getElementById('theme') as HTMLSelectElement)?.value,
        language: (document.getElementById('language') as HTMLSelectElement)?.value,
        currency: (document.getElementById('currency') as HTMLSelectElement)?.value,
      }
      
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications, privacy, preferences }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        alert('Settings updated successfully!')
      } else {
        alert('Failed to update settings')
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert('Failed to update settings')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    try {
      const response = await fetch('/api/auth/wallet-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: '0x1234...abcd' }), // Mock wallet address
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserProfile({ ...userProfile, walletAddress: data.walletAddress })
        alert('Wallet connected successfully!')
      } else {
        alert('Failed to connect wallet')
      }
    } catch (error) {
      console.error('Wallet connect error:', error)
      alert('Failed to connect wallet')
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="user">
        <DashboardLayout role="user">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <Palette className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Update your personal details and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 border-2 border-gray-200 dark:border-gray-700">
                      <AvatarImage src={userProfile?.avatar || "/placeholder.svg?height=80&width=80&text=Avatar"} alt="User Avatar" />
                      <AvatarFallback>{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Avatar
                      </Button>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="userName" className="text-gray-900 dark:text-white">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="userName"
                        defaultValue={userProfile?.name || ""}
                        className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail" className="text-gray-900 dark:text-white">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        defaultValue={userProfile?.email || ""}
                        className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="walletAddress" className="text-gray-900 dark:text-white">
                      <Wallet className="w-4 h-4 inline mr-2" />
                      Algorand Wallet Address
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="walletAddress"
                        value={userProfile?.walletAddress || "Not connected"}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                      <Button 
                        onClick={handleWalletConnect}
                        variant="outline"
                        className="border-gray-200 dark:border-gray-600"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your connected Algorand wallet for transactions.</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleProfileUpdate}
                      disabled={profileLoading}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Choose how you want to be notified about updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications" className="text-gray-900 dark:text-white">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch 
                        id="emailNotifications" 
                        defaultChecked={settings?.notifications?.email || true}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications" className="text-gray-900 dark:text-white">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <Switch 
                        id="pushNotifications" 
                        defaultChecked={settings?.notifications?.push || true}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications" className="text-gray-900 dark:text-white">
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive updates via SMS
                        </p>
                      </div>
                      <Switch 
                        id="smsNotifications" 
                        defaultChecked={settings?.notifications?.sms || false}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSettingsUpdate}
                      disabled={settingsLoading}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {settingsLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Privacy Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Control your privacy and data visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profileVisible" className="text-gray-900 dark:text-white">
                          Public Profile
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Make your profile visible to other users
                        </p>
                      </div>
                      <Switch 
                        id="profileVisible" 
                        defaultChecked={settings?.privacy?.profileVisible || true}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="activityVisible" className="text-gray-900 dark:text-white">
                          Activity Visibility
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Show your activity to other users
                        </p>
                      </div>
                      <Switch 
                        id="activityVisible" 
                        defaultChecked={settings?.privacy?.activityVisible || false}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSettingsUpdate}
                      disabled={settingsLoading}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {settingsLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">App Preferences</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Customize your app experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="theme" className="text-gray-900 dark:text-white">
                        <Palette className="w-4 h-4 inline mr-2" />
                        Theme
                      </Label>
                      <Select defaultValue={settings?.preferences?.theme || "system"}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="language" className="text-gray-900 dark:text-white">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Language
                      </Label>
                      <Select defaultValue={settings?.preferences?.language || "en"}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="currency" className="text-gray-900 dark:text-white">
                        <Wallet className="w-4 h-4 inline mr-2" />
                        Currency
                      </Label>
                      <Select defaultValue={settings?.preferences?.currency || "ALGO"}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALGO">ALGO</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSettingsUpdate}
                      disabled={settingsLoading}
                      className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {settingsLoading ? "Saving..." : "Save Settings"}
                    </Button>
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
