"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  QrCode, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NFTLifecycleProps {
  assetId: number
  eventId: string
  userAddress: string
  metadata?: any
}

interface LifecycleStage {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  icon: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

export function NFTLifecycleTimeline({ assetId, eventId, userAddress, metadata }: NFTLifecycleProps) {
  const { toast } = useToast()
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    verifyTicket()
  }, [assetId, userAddress, eventId])

  const verifyTicket = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/nft/verify?assetId=${assetId}&address=${userAddress}&eventId=${eventId}`)
      const data = await response.json()
      setVerification(data)
    } catch (error) {
      console.error('Error verifying ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = () => {
    const qrData = {
      assetId,
      address: userAddress,
      eventId,
      timestamp: Date.now(),
      type: 'nft_ticket_verification'
    }
    
    // In a real implementation, you would generate a QR code here
    const qrString = JSON.stringify(qrData)
    navigator.clipboard.writeText(qrString)
    
    toast({
      title: "QR Code Data Copied",
      description: "QR code data has been copied to clipboard for verification",
    })
  }

  const getLifecycleStages = (): LifecycleStage[] => {
    const now = new Date()
    const eventDate = metadata ? new Date(metadata.event_date) : new Date()
    const isEventPassed = now > eventDate
    const isEventToday = now.toDateString() === eventDate.toDateString()

    return [
      {
        id: 'purchased',
        title: 'Ticket Purchased',
        description: 'NFT ticket has been minted and added to your wallet',
        status: 'completed',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      },
      {
        id: 'verified',
        title: 'Ticket Verified',
        description: verification?.isValid ? 'Ticket is valid and ready for use' : 'Verifying ticket authenticity',
        status: verification?.isValid ? 'completed' : 'current',
        icon: verification?.isValid ? 
          <CheckCircle className="h-5 w-5 text-green-600" /> : 
          <Clock className="h-5 w-5 text-yellow-600" />
      },
      {
        id: 'qr_generated',
        title: 'QR Code Generated',
        description: 'QR code created for event entry verification',
        status: verification?.isValid ? 'current' : 'upcoming',
        icon: <QrCode className="h-5 w-5 text-blue-600" />,
        action: {
          label: 'Generate QR Code',
          onClick: generateQRCode,
          disabled: !verification?.isValid
        }
      },
      {
        id: 'event_entry',
        title: 'Event Entry',
        description: isEventPassed ? 'Event has ended' : isEventToday ? 'Event is today!' : 'Ready for event entry',
        status: isEventPassed ? 'completed' : isEventToday ? 'current' : 'upcoming',
        icon: isEventPassed ? 
          <CheckCircle className="h-5 w-5 text-green-600" /> : 
          isEventToday ? 
            <AlertCircle className="h-5 w-5 text-orange-600" /> : 
            <Clock className="h-5 w-5 text-gray-400" />
      }
    ]
  }

  const stages = getLifecycleStages()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          NFT Ticket Lifecycle
        </CardTitle>
        <CardDescription>
          Track your NFT ticket from purchase to event entry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Details */}
        {metadata && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-lg">{metadata.event_title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(metadata.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{metadata.event_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{metadata.price} {metadata.currency}</span>
              </div>
            </div>
            {metadata.seat_number && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-500" />
                <span>Seat: {metadata.seat_number}</span>
                {metadata.section && <span>• Section: {metadata.section}</span>}
              </div>
            )}
          </div>
        )}

        {/* Lifecycle Timeline */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {stage.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{stage.title}</h4>
                  <Badge 
                    variant={stage.status === 'completed' ? 'default' : 
                            stage.status === 'current' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {stage.status === 'completed' ? 'Completed' :
                     stage.status === 'current' ? 'Current' : 'Upcoming'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stage.description}
                </p>
                {stage.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stage.action.onClick}
                    disabled={stage.action.disabled}
                    className="mt-2"
                  >
                    {stage.action.label}
                  </Button>
                )}
              </div>
              {index < stages.length - 1 && (
                <div className="flex-shrink-0 ml-4">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Verification Status */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification Status</span>
            <Button
              size="sm"
              variant="outline"
              onClick={verifyTicket}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Refresh'}
            </Button>
          </div>
          <div className="mt-2">
            {verification?.isValid ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Ticket is valid and ready for use</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Ticket verification failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Asset Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Asset Information</h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>Asset ID: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{assetId}</code></div>
            <div>Owner: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{userAddress.slice(0, 8)}...{userAddress.slice(-8)}</code></div>
            <div>Event ID: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{eventId}</code></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}