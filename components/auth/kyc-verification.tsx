"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, Upload, AlertTriangle } from "lucide-react"

export function KYCVerification() {
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">("pending") // Mock state
  const [uploading, setUploading] = useState(false)

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true)
    // Simulate upload process
    setTimeout(() => {
      setVerificationStatus("pending")
      setUploading(false)
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">KYC Verification</CardTitle>
        <CardDescription>Verify your identity to unlock full access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationStatus === "pending" && (
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <AlertTriangle className="w-6 h-6 mx-auto text-yellow-500 dark:text-yellow-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your documents are under review. Please allow 1-2 business days for verification.
            </p>
          </div>
        )}

        {verificationStatus === "verified" && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <CheckCircle className="w-6 h-6 mx-auto text-green-500 dark:text-green-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your identity is verified! You now have full access to the platform.
            </p>
          </div>
        )}

        {verificationStatus === "rejected" && (
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
            <AlertTriangle className="w-6 h-6 mx-auto text-red-500 dark:text-red-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your verification was rejected. Please check your documents and try again.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="documentUpload" className="text-sm font-medium">
            Upload Documents
          </Label>
          <Input type="file" id="documentUpload" className="hidden" onChange={handleDocumentUpload} />
          <Label
            htmlFor="documentUpload"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:shadow-sm disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-secondary/80 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-4 py-2 w-full cursor-pointer"
          >
            {uploading ? "Uploading..." : "Select File"}
            <Upload className="ml-2 h-4 w-4" />
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">Accepted formats: JPG, PNG, PDF. Max size: 5MB</p>
        </div>
      </CardContent>
    </Card>
  )
}
