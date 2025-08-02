"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Store,
  DollarSign,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  FileText,
  Settings,
} from "lucide-react"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { FloatingCard } from "@/components/animations/card-hover"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import Header from "@/components/header"

interface MerchantApplication {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  category: string
  description: string
  address: string
  documents: string[]
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export default function AdminDashboard() {
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject"
    merchant: MerchantApplication
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const stats = [
    { title: "Total Merchants", value: "156", change: "+12%", icon: Store, color: "bg-blue-500" },
    { title: "Pending Applications", value: "23", change: "+5", icon: Users, color: "bg-yellow-500" },
    { title: "Monthly Revenue", value: "$45,231", change: "+18%", icon: DollarSign, color: "bg-green-500" },
    { title: "Platform Growth", value: "34%", change: "+5%", icon: TrendingUp, color: "bg-purple-500" },
  ]

  const merchantApplications: MerchantApplication[] = [
    {
      id: "1",
      businessName: "Concert Hall NYC",
      ownerName: "John Smith",
      email: "john@concerthall.com",
      phone: "+1 (555) 123-4567",
      category: "Concerts",
      description: "Premier concert venue in Manhattan hosting world-class performances",
      address: "123 Broadway, New York, NY 10001",
      documents: ["business_license.pdf", "tax_certificate.pdf", "venue_photos.zip"],
      status: "pending",
      submittedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      businessName: "Movie Palace",
      ownerName: "Sarah Johnson",
      email: "sarah@moviepalace.com",
      phone: "+1 (555) 987-6543",
      category: "Movies",
      description: "Historic movie theater featuring latest blockbusters and indie films",
      address: "456 Cinema Ave, Los Angeles, CA 90210",
      documents: ["business_license.pdf", "insurance_docs.pdf"],
      status: "pending",
      submittedAt: "2024-01-14T14:20:00Z",
    },
    {
      id: "3",
      businessName: "Resort Paradise",
      ownerName: "Mike Wilson",
      email: "mike@resortparadise.com",
      phone: "+1 (555) 456-7890",
      category: "Hotels",
      description: "Luxury beachfront resort with premium amenities and spa services",
      address: "789 Ocean Drive, Miami, FL 33139",
      documents: ["business_license.pdf", "hotel_permits.pdf", "safety_certificates.pdf"],
      status: "approved",
      submittedAt: "2024-01-10T09:15:00Z",
      reviewedAt: "2024-01-12T16:45:00Z",
      reviewedBy: "Admin User",
    },
  ]

  const filteredMerchants = merchantApplications.filter((merchant) => {
    const matchesStatus = statusFilter === "all" || merchant.status === statusFilter
    const matchesSearch =
      merchant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleApprove = async (merchant: MerchantApplication) => {
    // API call to approve merchant
    console.log("Approving merchant:", merchant.id)
    setConfirmAction(null)
  }

  const handleReject = async (merchant: MerchantApplication) => {
    // API call to reject merchant
    console.log("Rejecting merchant:", merchant.id, "Reason:", rejectionReason)
    setConfirmAction(null)
    setRejectionReason("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header showSearch={false} showAuthButtons={false} />

        <div className="container mx-auto px-6 py-8">
          {/* Stats Cards */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <FloatingCard>
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </CardTitle>
                      <div className={`w-8 h-8 ${stat.color} rounded-full flex items-center justify-center`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="text-green-600 font-medium">{stat.change}</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                </FloatingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Tabs defaultValue="merchants" className="space-y-4">
              <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger value="merchants" className="font-medium">
                  Merchant Applications
                </TabsTrigger>
                <TabsTrigger value="fees" className="font-medium">
                  Fee Management
                </TabsTrigger>
                <TabsTrigger value="marketplaces" className="font-medium">
                  Marketplace Management
                </TabsTrigger>
              </TabsList>

              {/* Merchant Applications Tab */}
              <TabsContent value="merchants" className="space-y-4">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                          Merchant Applications
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Review and approve new merchant applications
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search merchants..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          <Filter className="w-4 h-4 mr-2 text-gray-500" />
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Applications Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold">Business Name</TableHead>
                            <TableHead className="font-bold">Owner</TableHead>
                            <TableHead className="font-bold">Category</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Submitted</TableHead>
                            <TableHead className="font-bold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMerchants.map((merchant, index) => (
                            <motion.tr
                              key={merchant.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <TableCell className="font-medium text-gray-900 dark:text-white">
                                {merchant.businessName}
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                <div>
                                  <div className="font-medium">{merchant.ownerName}</div>
                                  <div className="text-sm text-gray-500">{merchant.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-full">
                                  {merchant.category}
                                </Badge>
                              </TableCell>
                              <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                {new Date(merchant.submittedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full bg-transparent"
                                        onClick={() => setSelectedMerchant(merchant)}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Review
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                                      <DialogHeader>
                                        <DialogTitle>Merchant Application Review</DialogTitle>
                                        <DialogDescription>
                                          Review merchant details and documents before approval
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedMerchant && (
                                        <div className="space-y-6">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm font-medium">Business Name</Label>
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {selectedMerchant.businessName}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Owner Name</Label>
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {selectedMerchant.ownerName}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Email</Label>
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {selectedMerchant.email}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Phone</Label>
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {selectedMerchant.phone}
                                              </p>
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">Address</Label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {selectedMerchant.address}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">Description</Label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                              {selectedMerchant.description}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">Documents</Label>
                                            <div className="mt-2 space-y-2">
                                              {selectedMerchant.documents.map((doc, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                  <FileText className="w-4 h-4 text-blue-500" />
                                                  <span className="text-blue-600 hover:underline cursor-pointer">
                                                    {doc}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>

                                  {merchant.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 rounded-full"
                                        onClick={() => setConfirmAction({ type: "approve", merchant })}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="rounded-full"
                                        onClick={() => setConfirmAction({ type: "reject", merchant })}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fee Management Tab */}
              <TabsContent value="fees" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                        Platform Fees
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Configure global platform fees and commissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium">Transaction Fee (%)</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <Input
                            type="number"
                            defaultValue="2.5"
                            className="rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                          <span className="text-sm text-gray-500">Per transaction</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Listing Fee (ALGO)</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <Input
                            type="number"
                            defaultValue="1.0"
                            className="rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                          <span className="text-sm text-gray-500">Per NFT listing</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Royalty Cap (%)</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <Input
                            type="number"
                            defaultValue="10"
                            className="rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                          <span className="text-sm text-gray-500">Maximum royalty</span>
                        </div>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700 rounded-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Update Platform Fees
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                        Merchant Fees
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Set merchant-specific fee structures
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium">Premium Merchants (%)</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <Input
                            type="number"
                            defaultValue="1.5"
                            className="rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                          <span className="text-sm text-gray-500">Reduced rate</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Standard Merchants (%)</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <Input
                            type="number"
                            defaultValue="2.5"
                            className="rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                          <span className="text-sm text-gray-500">Standard rate</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">New Merchants (%)</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <Input
                            type="number"
                            defaultValue="3.0"
                            className="rounded-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                          <span className="text-sm text-gray-500">Higher rate</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full rounded-full bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Merchant Tiers
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Fee Preview */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                      Fee Calculator Preview
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Preview how fees will be calculated for different scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white">$100 NFT Sale</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>Sale Price:</span>
                            <span>$100.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee (2.5%):</span>
                            <span>$2.50</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Merchant Receives:</span>
                            <span className="font-medium">$97.50</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white">$500 NFT Sale</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>Sale Price:</span>
                            <span>$500.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee (2.5%):</span>
                            <span>$12.50</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Merchant Receives:</span>
                            <span className="font-medium">$487.50</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white">$1000 NFT Sale</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>Sale Price:</span>
                            <span>$1000.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee (2.5%):</span>
                            <span>$25.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Merchant Receives:</span>
                            <span className="font-medium">$975.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Marketplace Management Tab */}
              <TabsContent value="marketplaces" className="space-y-4">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                      Active Marketplaces
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Manage merchant marketplaces and their configurations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          name: "Concert Hall NYC",
                          status: "active",
                          theme: "dark",
                          merchants: "John Smith",
                          revenue: "$12,450",
                        },
                        {
                          name: "Movie Palace",
                          status: "active",
                          theme: "light",
                          merchants: "Sarah Johnson",
                          revenue: "$8,230",
                        },
                        {
                          name: "Resort Paradise",
                          status: "inactive",
                          theme: "tropical",
                          merchants: "Mike Wilson",
                          revenue: "$15,670",
                        },
                        {
                          name: "Sports Arena",
                          status: "active",
                          theme: "sports",
                          merchants: "David Brown",
                          revenue: "$22,100",
                        },
                        {
                          name: "Art Gallery",
                          status: "pending",
                          theme: "minimal",
                          merchants: "Emma Davis",
                          revenue: "$5,890",
                        },
                        {
                          name: "Music Festival",
                          status: "active",
                          theme: "vibrant",
                          merchants: "Alex Wilson",
                          revenue: "$18,340",
                        },
                      ].map((marketplace, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                  {marketplace.name}
                                </CardTitle>
                                <Badge
                                  variant={
                                    marketplace.status === "active"
                                      ? "default"
                                      : marketplace.status === "pending"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className={`rounded-full ${
                                    marketplace.status === "active"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : marketplace.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  }`}
                                >
                                  {marketplace.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Owner: {marketplace.merchants}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                                <Badge variant="outline" className="rounded-full capitalize">
                                  {marketplace.theme}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{marketplace.revenue}</span>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="flex-1 rounded-full bg-transparent">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Preview
                                </Button>
                                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 rounded-full">
                                  <Settings className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Confirmation Dialogs */}
        <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>{confirmAction?.type === "approve" ? "Approve Merchant" : "Reject Merchant"}</DialogTitle>
              <DialogDescription>
                {confirmAction?.type === "approve"
                  ? `Are you sure you want to approve ${confirmAction.merchant.businessName}? This will grant them access to create their marketplace.`
                  : `Are you sure you want to reject ${confirmAction?.merchant.businessName}? Please provide a reason for rejection.`}
              </DialogDescription>
            </DialogHeader>
            {confirmAction?.type === "reject" && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a detailed reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                className={
                  confirmAction?.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
                onClick={() => {
                  if (confirmAction?.type === "approve") {
                    handleApprove(confirmAction.merchant)
                  } else if (confirmAction?.type === "reject") {
                    handleReject(confirmAction.merchant)
                  }
                }}
              >
                {confirmAction?.type === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
