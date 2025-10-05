"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  ExternalLink,
  Twitter,
  Linkedin,
  Github,
  Globe,
  MessageCircle,
  Mail,
  MapPin,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkles,
  Rocket,
  Flame,
  Sun,
  Moon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  MessageSquare as MessageSquareIcon,
  Share as ShareIcon,
  Bookmark,
  BookmarkCheck,
  BookmarkX,
  BookmarkPlus,
  BookmarkMinus,
  BookmarkHeart,
  BookmarkStar,
  BookmarkUser,
  BookmarkSettings,
  BookmarkEdit,
  BookmarkTrash,
  BookmarkCopy,
  BookmarkSave,
  BookmarkUpload,
  BookmarkDownload,
  BookmarkSend,
  BookmarkPaperclip,
  BookmarkImage,
  BookmarkVideo,
  BookmarkFile,
  BookmarkFolder,
  BookmarkArchive,
  BookmarkDatabase,
  BookmarkServer,
  BookmarkCloud,
  BookmarkCloudOff,
  BookmarkWrench,
  BookmarkHammer,
  BookmarkCog,
  BookmarkSliders,
  BookmarkToggleLeft,
  BookmarkToggleRight,
  BookmarkPower,
  BookmarkPowerOff,
  BookmarkPlay,
  BookmarkPause,
  BookmarkStop,
  BookmarkSkipBack,
  BookmarkSkipForward,
  BookmarkRepeat,
  BookmarkShuffle,
  BookmarkVolume1,
  BookmarkVolume2,
  BookmarkVolumeX,
  BookmarkMic,
  BookmarkMicOff,
  BookmarkCamera,
  BookmarkCameraOff,
  BookmarkMonitor,
  BookmarkSmartphone,
  BookmarkTablet,
  BookmarkLaptop,
  BookmarkHeadphones,
  BookmarkSpeaker,
  BookmarkRadio,
  BookmarkTv,
  BookmarkGamepad2,
  BookmarkJoystick,
  BookmarkKeyboard,
  BookmarkMouse,
  BookmarkPrinter,
  BookmarkPhoneCall,
  BookmarkPhoneIncoming,
  BookmarkPhoneOutgoing,
  BookmarkPhoneMissed,
  BookmarkVoicemail,
  BookmarkMessageSquare,
  BookmarkMessageSquareText,
  BookmarkMessageSquareReply,
  BookmarkMessageSquareMore,
  BookmarkMessageSquareX,
  BookmarkMessageSquareWarning,
  BookmarkMessageSquarePlus,
  BookmarkMessageSquareShare,
  BookmarkMessageSquareHeart,
  BookmarkMessageSquareLock,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Zap,
  Shield,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Bell,
  LogOut,
  Home,
  Package,
  HelpCircle,
  Activity,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  MousePointer,
  Hand,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  Trash2,
  Copy,
  Save,
  Upload,
  Download,
  Send,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Folder,
  Archive,
  Database,
  Server,
  Cloud,
  CloudOff,
  Wrench,
  Hammer,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Power,
  PowerOff,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume1,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Gamepad2,
  Joystick,
  Keyboard,
  Mouse,
  Printer,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  MessageSquare,
  MessageSquareText,
  MessageSquareReply,
  MessageSquareMore,
  MessageSquareX,
  MessageSquareWarning,
  MessageSquarePlus,
  MessageSquareShare,
  MessageSquareHeart,
  MessageSquareLock,
  Wallet,
  RefreshCw,
  Minus,
  Plus,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  Receipt,
  FileCheck,
  Timer,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  Gift
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { useParams } from "next/navigation"
import Image from "next/image"

interface LaunchpadProject {
  id: string
  name: string
  description: string
  logo: string
  banner: string
  keyMetrics: {
    totalSupply: number
    mintPrice: number
    currency: string
    chain: string
    salePhase: 'upcoming' | 'live' | 'ended'
    minted: number
    remaining: number
  }
  primaryColor: string
  secondaryColor: string
  isVerified: boolean
}

interface RoadmapMilestone {
  id: string
  phase: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'upcoming'
  date: string
  completedDate?: string
  features: string[]
  image?: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  socialLinks: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
  skills: string[]
  experience: string
}

interface ProjectStats {
  totalMilestones: number
  completedMilestones: number
  teamSize: number
  yearsExperience: number
  partnerships: number
}

export default function RoadmapPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<LaunchpadProject | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("roadmap")

  useEffect(() => {
    fetchRoadmapData()
  }, [projectId])

  const fetchRoadmapData = async () => {
    setLoading(true)
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/launchpad/projects/${projectId}`)
      const projectData = await projectRes.json()
      
      if (projectRes.ok) {
        setProject(projectData.project)
        
        // Fetch roadmap
        const roadmapRes = await fetch(`/api/launchpad/projects/${projectId}/roadmap`)
        const roadmapData = await roadmapRes.json()
        
        if (roadmapRes.ok) {
          setRoadmap(roadmapData.roadmap || [])
        }
        
        // Fetch team
        const teamRes = await fetch(`/api/launchpad/projects/${projectId}/team`)
        const teamData = await teamRes.json()
        
        if (teamRes.ok) {
          setTeam(teamData.team || [])
        }
        
        // Fetch stats
        const statsRes = await fetch(`/api/launchpad/projects/${projectId}/roadmap/stats`)
        const statsData = await statsRes.json()
        
        if (statsRes.ok) {
          setStats(statsData.stats)
        }
      }
    } catch (error) {
      console.error("Failed to fetch roadmap data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />
      case 'upcoming': return <AlertCircle className="w-5 h-5 text-gray-500" />
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'upcoming': return 'bg-gray-300'
      default: return 'bg-gray-300'
    }
  }

  const getProgressPercentage = () => {
    if (!stats) return 0
    return (stats.completedMilestones / stats.totalMilestones) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading roadmap...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={project.logo}
                  alt={project.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold">{project.name}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Roadmap & Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-8">
          {/* Project Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalMilestones}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Milestones</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completedMilestones}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.teamSize}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.yearsExperience}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.partnerships}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Partnerships</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats?.completedMilestones} / {stats?.totalMilestones} milestones
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getProgressPercentage().toFixed(1)}% complete
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Project Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {roadmap.map((milestone, index) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative"
                      >
                        {/* Timeline Line */}
                        {index < roadmap.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                        )}
                        
                        <div className="flex items-start gap-6">
                          {/* Status Icon */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            milestone.status === 'completed' ? 'bg-green-500' :
                            milestone.status === 'in-progress' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`}>
                            {getStatusIcon(milestone.status)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{milestone.title}</h3>
                              <Badge 
                                variant={milestone.status === 'completed' ? 'default' : 
                                       milestone.status === 'in-progress' ? 'secondary' : 'outline'}
                              >
                                {milestone.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{milestone.date}</span>
                              </div>
                              {milestone.completedDate && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Completed: {milestone.completedDate}</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {milestone.description}
                            </p>
                            
                            {/* Features */}
                            {milestone.features.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Key Features:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {milestone.features.map((feature, featureIndex) => (
                                    <li key={featureIndex}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Meet the Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="relative">
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                              <p className="text-white/80 text-sm">{member.role}</p>
                            </div>
                          </div>
                          
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {member.bio}
                            </p>
                            
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-2">Experience</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {member.experience}
                              </p>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2">Skills</h4>
                              <div className="flex flex-wrap gap-1">
                                {member.skills.map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {member.socialLinks.twitter && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={member.socialLinks.twitter} target="_blank">
                                    <Twitter className="w-4 h-4" />
                                  </Link>
                                </Button>
                              )}
                              {member.socialLinks.linkedin && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={member.socialLinks.linkedin} target="_blank">
                                    <Linkedin className="w-4 h-4" />
                                  </Link>
                                </Button>
                              )}
                              {member.socialLinks.github && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={member.socialLinks.github} target="_blank">
                                    <Github className="w-4 h-4" />
                                  </Link>
                                </Button>
                              )}
                              {member.socialLinks.website && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={member.socialLinks.website} target="_blank">
                                    <Globe className="w-4 h-4" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{team.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {team.reduce((acc, member) => acc + member.skills.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Skills</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {stats?.yearsExperience}+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  )
}
