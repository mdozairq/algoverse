"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CalendarIcon,
  Upload,
  Plus,
  Minus,
  Ticket,
  DollarSign,
  Info,
  ImageIcon,
  LinkIcon,
  TrendingUp,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface TicketTier {
  id: number
  name: string
  price: string
  quantity: number
  description: string
}

export default function CreateEventPage() {
  const [step, setStep] = useState(1)
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventCategory, setEventCategory] = useState("")
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [eventTime, setEventTime] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventVenue, setEventVenue] = useState("")
  const [eventImage, setEventImage] = useState<File | null>(null)
  const [eventWebsite, setEventWebsite] = useState("")
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    { id: 1, name: "Standard", price: "", quantity: 0, description: "" },
  ])
  const [enableResale, setEnableResale] = useState(true)
  const [royaltyFee, setRoyaltyFee] = useState("5")
  const router = useRouter()
  const categories = [
    "Concert",
    "Conference",
    "Sports",
    "Theater",
    "Art Exhibition",
    "Food & Wine",
    "Festival",
    "Other",
  ]

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, { id: ticketTiers.length + 1, name: "", price: "", quantity: 0, description: "" }])
  }

  const removeTicketTier = (id: number) => {
    setTicketTiers(ticketTiers.filter((tier) => tier.id !== id))
  }

  const handleTicketTierChange = (id: number, field: keyof TicketTier, value: string | number) => {
    setTicketTiers(ticketTiers.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier)))
  }

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      const totalSupply = ticketTiers.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0)
      const price = `${ticketTiers[0]?.price || "0"} ALGO`
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventName,
          description: eventDescription,
          category: eventCategory,
          date: eventDate ? format(eventDate, "PPP") : "",
          location: eventLocation,
          imageUrl: "/placeholder.svg",
          totalSupply,
          price,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create event")
      toast({ title: "Event created", description: "Your event has been created successfully." })
      router.push(`/dashboard/merchant/event/${data.event.id}`)
    } catch (error: any) {
      toast({ title: "Creation failed", description: error.message, variant: "destructive" })
    }
  }

  return (
    <AuthGuard requiredRole="merchant">
    <DashboardLayout role="merchant">
      <div className="space-y-8 bg-gray-50 dark:bg-gray-900 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create New Event</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Design and launch your event, minting unique NFTs for tickets
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: step >= stepNumber ? 1 : 0.8,
                  opacity: step >= stepNumber ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNumber
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {stepNumber}
              </motion.div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Event Details</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Provide basic information about your event
                  </CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventName" className="text-gray-900 dark:text-gray-300">
                      Event Name *
                    </Label>
                    <Input
                      id="eventName"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g., Summer Music Festival 2024"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDescription" className="text-gray-900 dark:text-gray-300">
                      Event Description *
                    </Label>
                    <Textarea
                      id="eventDescription"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Describe your event in detail"
                      className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventCategory" className="text-gray-900 dark:text-gray-300">
                      Category *
                    </Label>
                    <Select value={eventCategory} onValueChange={setEventCategory}>
                      <SelectTrigger className="h-12 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select event category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventDate" className="text-gray-900 dark:text-gray-300">
                        Date *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 ${
                              !eventDate && "text-gray-400"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <Calendar mode="single" selected={eventDate} onSelect={setEventDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="eventTime" className="text-gray-900 dark:text-gray-300">
                        Time *
                      </Label>
                      <Input
                        id="eventTime"
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="eventLocation" className="text-gray-900 dark:text-gray-300">
                      Location *
                    </Label>
                    <Input
                      id="eventLocation"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="e.g., Central Park, New York"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventVenue" className="text-gray-900 dark:text-gray-300">
                      Venue (Optional)
                    </Label>
                    <Input
                      id="eventVenue"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      placeholder="e.g., Great Lawn Stage"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full py-3 text-sm font-medium"
                  size="lg"
                >
                  NEXT: MEDIA & TICKETS
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Media & Tickets</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Upload event visuals and define ticket tiers
                  </CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventImage" className="text-gray-900 dark:text-gray-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Event Image *
                    </Label>
                    <div className="mt-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Drag & drop your event poster here, or click to upload
                      </p>
                      <Input
                        id="eventImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEventImage(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                      />
                      <Label htmlFor="eventImage">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Choose File
                        </Button>
                      </Label>
                      {eventImage && <p className="text-sm text-gray-500 mt-2">{eventImage.name}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="eventWebsite" className="text-gray-900 dark:text-gray-300 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Event Website (Optional)
                    </Label>
                    <Input
                      id="eventWebsite"
                      type="url"
                      value={eventWebsite}
                      onChange={(e) => setEventWebsite(e.target.value)}
                      placeholder="e.g., https://www.yourevent.com"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Ticket Tiers *
                  </h3>
                  <div className="space-y-6">
                    {ticketTiers.map((tier) => (
                      <Card
                        key={tier.id}
                        className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`tier-name-${tier.id}`} className="text-gray-900 dark:text-gray-300">
                              Tier Name *
                            </Label>
                            <Input
                              id={`tier-name-${tier.id}`}
                              value={tier.name}
                              onChange={(e) => handleTicketTierChange(tier.id, "name", e.target.value)}
                              placeholder="e.g., VIP, General Admission"
                              className="rounded-full h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`tier-price-${tier.id}`} className="text-gray-900 dark:text-gray-300">
                              Price (ALGO) *
                            </Label>
                            <Input
                              id={`tier-price-${tier.id}`}
                              type="number"
                              value={tier.price}
                              onChange={(e) => handleTicketTierChange(tier.id, "price", e.target.value)}
                              placeholder="e.g., 0.5"
                              step="0.01"
                              className="rounded-full h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="col-span-full">
                            <Label htmlFor={`tier-quantity-${tier.id}`} className="text-gray-900 dark:text-gray-300">
                              Quantity *
                            </Label>
                            <Input
                              id={`tier-quantity-${tier.id}`}
                              type="number"
                              value={tier.quantity}
                              onChange={(e) => handleTicketTierChange(tier.id, "quantity", Number(e.target.value))}
                              placeholder="e.g., 100"
                              className="rounded-full h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="col-span-full">
                            <Label htmlFor={`tier-description-${tier.id}`} className="text-gray-900 dark:text-gray-300">
                              Description (Optional)
                            </Label>
                            <Textarea
                              id={`tier-description-${tier.id}`}
                              value={tier.description}
                              onChange={(e) => handleTicketTierChange(tier.id, "description", e.target.value)}
                              placeholder="Benefits included in this tier"
                              className="rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              rows={2}
                            />
                          </div>
                        </div>
                        {ticketTiers.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTicketTier(tier.id)}
                            className="mt-4 w-full rounded-full"
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            Remove Tier
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addTicketTier}
                      className="w-full rounded-full border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Ticket Tier
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 rounded-full py-3 text-sm font-medium bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    BACK
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full py-3 text-sm font-medium"
                  >
                    NEXT: ADVANCED SETTINGS
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Configure additional options for your event NFTs
                  </CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resale" className="text-gray-900 dark:text-gray-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Enable Secondary Market Resale
                    </Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="resale"
                        checked={enableResale}
                        onCheckedChange={(checked) => setEnableResale(checked as boolean)}
                        className="border-gray-200 dark:border-gray-600 data-[state=checked]:bg-black data-[state=checked]:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                      />
                      <label
                        htmlFor="resale"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-300"
                      >
                        Allow attendees to resell their NFTs on the secondary market.
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      This increases liquidity and value for your attendees.
                    </p>
                  </div>

                  {enableResale && (
                    <div>
                      <Label htmlFor="royaltyFee" className="text-gray-900 dark:text-gray-300 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Royalty Fee (%)
                        <Info className="w-3 h-3 text-gray-400" />
                      </Label>
                      <Input
                        id="royaltyFee"
                        type="number"
                        value={royaltyFee}
                        onChange={(e) => setRoyaltyFee(e.target.value)}
                        placeholder="e.g., 5"
                        min="0"
                        max="10"
                        step="1"
                        className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Percentage of each secondary sale that goes back to you. Max 10%.
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-100/20 border border-blue-700 rounded-lg p-4">
                    <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2">Important Information</h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Event NFTs will be minted on the Algorand blockchain.</li>
                      <li>• Ensure all details are accurate before submission.</li>
                      <li>• Once minted, event details cannot be changed.</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 rounded-full py-3 text-sm font-medium bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    BACK
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full py-3 text-sm font-medium"
                  >
                    CREATE EVENT & MINT NFTS
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </AuthGuard>
  )
}
