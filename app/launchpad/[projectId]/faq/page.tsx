"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Send,
  User,
  MessageSquare,
  FileText,
  BookOpen,
  Lightbulb,
  Shield,
  Zap,
  Wallet,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Home,
  Package,
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
  Paperclip,
  Image as ImageIcon,
  Video,
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
  Volume2,
  VolumeX,
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
  MessageSquareText,
  MessageSquareReply,
  MessageSquareMore,
  MessageSquareX,
  MessageSquareWarning,
  MessageSquarePlus,
  MessageSquareShare,
  MessageSquareHeart,
  MessageSquareLock,
  RefreshCw,
  Minus,
  Plus,
  Lock,
  Unlock,
  Banknote,
  Receipt,
  FileCheck,
  Timer,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  Gift,
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
  BookmarkMessageSquareLock
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

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
  tags: string[]
}

interface SupportTicket {
  id: string
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
}

export default function FAQPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<LaunchpadProject | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    priority: "medium"
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchFAQData()
  }, [projectId])

  useEffect(() => {
    applyFilters()
  }, [faqs, searchTerm, selectedCategory])

  const fetchFAQData = async () => {
    setLoading(true)
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/launchpad/projects/${projectId}`)
      const projectData = await projectRes.json()
      
      if (projectRes.ok) {
        setProject(projectData.project)
        
        // Fetch FAQs
        const faqsRes = await fetch(`/api/launchpad/projects/${projectId}/faq`)
        const faqsData = await faqsRes.json()
        
        if (faqsRes.ok) {
          setFaqs(faqsData.faqs || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch FAQ data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...faqs]

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(faq => faq.category === selectedCategory)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredFaqs(filtered)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/launchpad/projects/${projectId}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setContactForm({
          name: "",
          email: "",
          subject: "",
          category: "",
          message: "",
          priority: "medium"
        })
        setTimeout(() => setSubmitSuccess(false), 5000)
      }
    } catch (error) {
      console.error("Failed to submit support ticket:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getCategories = () => {
    const categories = [...new Set(faqs.map(faq => faq.category))]
    return categories
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading FAQ...</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">FAQ & Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - FAQ */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search FAQ..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getCategories().map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Accordion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Frequently Asked Questions
                    <Badge variant="secondary">{filteredFaqs.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredFaqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFaqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="font-semibold">{faq.question}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {faq.category}
                                  </Badge>
                                  {faq.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-4">
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {faq.answer}
                              </p>
                              
                              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="h-8">
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    {faq.helpful}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8">
                                    <ThumbsDown className="w-4 h-4 mr-1" />
                                    {faq.notHelpful}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-16">
                      <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No FAQs found</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Try adjusting your search or category filter.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Still Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Can't find what you're looking for? Our support team is here to help.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-semibold mb-1">Email Support</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          support@{project.name.toLowerCase().replace(/\s+/g, '')}.com
                        </p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-semibold mb-1">Live Chat</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Available 24/7
                        </p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-semibold mb-1">Response Time</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Within 24 hours
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="w-full"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              {showContactForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {submitSuccess && (
                      <Alert className="mb-4">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your support ticket has been submitted successfully. We'll get back to you within 24 hours.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={contactForm.category} onValueChange={(value) => setContactForm({ ...contactForm, category: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="minting">Minting</SelectItem>
                              <SelectItem value="trading">Trading</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={contactForm.priority} onValueChange={(value) => setContactForm({ ...contactForm, priority: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          rows={5}
                          required
                        />
                      </div>
                      
                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Ticket
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Getting Started</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          New to NFTs? Check out our beginner's guide.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Wallet className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Wallet Setup</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Learn how to connect and use your wallet.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Minting Guide</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Step-by-step instructions for minting NFTs.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Security Tips</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Keep your NFTs and wallet secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Documentation
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Terms of Service
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Policy
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Community Discord
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Support Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">All systems operational</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Minting active</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Trading enabled</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Support available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
