"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { QrCode, CheckCircle, XCircle, RefreshCw, Copy, ExternalLink } from "lucide-react"

interface QRVerificationProps {
  eventId: string
  onVerificationComplete?: (result: any) => void
}

export function QRVerification({ eventId, onVerificationComplete }: QRVerificationProps) {
  const { toast } = useToast()
  const [qrData, setQrData] = useState("")
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [manualInput, setManualInput] = useState({
    assetId: "",
    address: ""
  })

  const generateQRData = () => {
    const data = {
      eventId,
      timestamp: Date.now(),
      type: 'nft_ticket_verification',
      action: 'scan_for_verification'
    }
    setQrData(JSON.stringify(data))
  }

  const verifyTicket = async (assetId: number, address: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/nft/verify?assetId=${assetId}&address=${address}&eventId=${eventId}`)
      const data = await response.json()
      
      setVerificationResult(data)
      onVerificationComplete?.(data)
      
      if (data.isValid) {
        toast({
          title: "Verification Successful",
          description: "Ticket is valid and verified",
        })
      } else {
        toast({
          title: "Verification Failed",
          description: "Ticket is invalid or not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      toast({
        title: "Verification Error",
        description: "Failed to verify ticket",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualVerification = () => {
    if (!manualInput.assetId || !manualInput.address) {
      toast({
        title: "Validation Error",
        description: "Please enter both Asset ID and Address",
        variant: "destructive",
      })
      return
    }
    
    verifyTicket(parseInt(manualInput.assetId), manualInput.address)
  }

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData)
    toast({
      title: "Copied",
      description: "QR code data copied to clipboard",
    })
  }

  const resetVerification = () => {
    setVerificationResult(null)
    setManualInput({ assetId: "", address: "" })
  }

  return (
    <div className="space-y-6">
      {/* QR Code Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Verification
          </CardTitle>
          <CardDescription>
            Generate QR code for event entry verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateQRData} className="w-full">
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
          
          {qrData && (
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm font-mono break-all">
                  {qrData}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyQRData}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy QR Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Verification</CardTitle>
          <CardDescription>
            Enter ticket details manually for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assetId">Asset ID</Label>
              <Input
                id="assetId"
                type="number"
                value={manualInput.assetId}
                onChange={(e) => setManualInput({ ...manualInput, assetId: e.target.value })}
                placeholder="Enter NFT Asset ID"
              />
            </div>
            <div>
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                value={manualInput.address}
                onChange={(e) => setManualInput({ ...manualInput, address: e.target.value })}
                placeholder="Enter wallet address"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleManualVerification}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Ticket
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetVerification}
              disabled={loading}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={verificationResult.isValid ? "default" : "destructive"}>
                {verificationResult.isValid ? "Valid" : "Invalid"}
              </Badge>
            </div>
            
            {verificationResult.isValid && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Owner:</span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {verificationResult.owner.slice(0, 8)}...{verificationResult.owner.slice(-8)}
                  </code>
                </div>
                
                {verificationResult.metadata && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Ticket Details:</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Event:</span> {verificationResult.metadata.event_title}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Date:</span> {new Date(verificationResult.metadata.event_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Location:</span> {verificationResult.metadata.event_location}
                      </div>
                      {verificationResult.metadata.seat_number && (
                        <div className="text-sm">
                          <span className="font-medium">Seat:</span> {verificationResult.metadata.seat_number}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-medium">Type:</span> {verificationResult.metadata.ticket_type}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {!verificationResult.isValid && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  This ticket is invalid. Please check the Asset ID and wallet address, or contact support if you believe this is an error.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
