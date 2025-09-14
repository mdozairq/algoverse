"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Star, 
  Gift, 
  Users, 
  Target, 
  Award,
  Crown,
  Zap,
  Heart,
  Shield
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"

export default function UserRewardsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [rewards, setRewards] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    const loadRewards = async () => {
      try {
        const response = await fetch('/api/analytics')
        if (response.ok) {
          const data = await response.json()
          setRewards(data.analytics)
        }
        
        // Mock achievements data
        setAchievements([
          {
            id: 1,
            name: "First Event",
            description: "Attended your first event",
            icon: Star,
            points: 25,
            unlocked: true,
            progress: 100,
            color: "text-yellow-500"
          },
          {
            id: 2,
            name: "Social Butterfly",
            description: "Attended 5+ events",
            icon: Users,
            points: 100,
            unlocked: true,
            progress: 100,
            color: "text-blue-500"
          },
          {
            id: 3,
            name: "VIP Member",
            description: "Attend 10+ events",
            icon: Crown,
            points: 250,
            unlocked: false,
            progress: 30,
            color: "text-purple-500"
          },
          {
            id: 4,
            name: "NFT Collector",
            description: "Own 10+ NFTs",
            icon: Trophy,
            points: 150,
            unlocked: false,
            progress: 60,
            color: "text-green-500"
          },
          {
            id: 5,
            name: "Early Bird",
            description: "Check in to 3 events early",
            icon: Zap,
            points: 75,
            unlocked: false,
            progress: 0,
            color: "text-orange-500"
          },
          {
            id: 6,
            name: "Loyalty Champion",
            description: "Earn 500+ loyalty points",
            icon: Heart,
            points: 200,
            unlocked: false,
            progress: 78,
            color: "text-red-500"
          }
        ])
      } catch (error) {
        console.error('Error loading rewards:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRewards()
  }, [isAuthenticated, authLoading])

  const totalPoints = rewards?.loyaltyPoints || 156
  const nextMilestone = 200
  const progressToNext = (totalPoints / nextMilestone) * 100

  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Rewards & Achievements</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your progress and unlock rewards</p>
            </div>
            <Button className="bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-600">
              <Gift className="w-4 h-4 mr-2" />
              Redeem Rewards
            </Button>
          </div>

          {/* Points Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                <Star className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalPoints}</div>
                <p className="text-sm opacity-90">Total Points Earned</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Next milestone: {nextMilestone}</span>
                    <span>{Math.round(progressToNext)}%</span>
                  </div>
                  <Progress value={progressToNext} className="h-2 bg-white/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {achievements.filter(a => a.unlocked).length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Unlocked badges</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Rank</CardTitle>
                <Award className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">Silver</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Current tier</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Grid */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Achievements</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Unlock badges and special rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 ${
                      achievement.unlocked ? 'ring-2 ring-yellow-500' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                        }`}>
                          <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {achievement.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                          {achievement.points} pts
                        </Badge>
                      </div>
                      
                      {!achievement.unlocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}
                      
                      {achievement.unlocked && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                          <Shield className="w-4 h-4" />
                          <span>Unlocked!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rewards History */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Recent Rewards</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Your latest point earnings and redemptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Event Check-in", points: "+25", date: "2 days ago", type: "earned" },
                  { action: "NFT Purchase", points: "+10", date: "1 week ago", type: "earned" },
                  { action: "First Event", points: "+50", date: "2 weeks ago", type: "achievement" },
                  { action: "Reward Redemption", points: "-100", date: "3 weeks ago", type: "redeemed" },
                ].map((reward, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        reward.type === 'earned' ? 'bg-green-500/10 text-green-500' :
                        reward.type === 'achievement' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {reward.type === 'earned' ? <Star className="w-4 h-4" /> :
                         reward.type === 'achievement' ? <Trophy className="w-4 h-4" /> :
                         <Gift className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{reward.action}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reward.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        reward.type === 'redeemed' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {reward.points}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
