"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface RequestChangeModalProps {
  isOpen: boolean
  onClose: () => void
  nft: any // NFT object
}

export function RequestChangeModal({ isOpen, onClose, nft }: RequestChangeModalProps) {
  const [changeDetails, setChangeDetails] = useState({
    seatNumber: "",
    newDate: "",
    bundleDetails: "",
    additionalNotes: "",
  })
  const [requestStatus, setRequestStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [requestMessage, setRequestMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setChangeDetails({ ...changeDetails, [field]: e.target.value })
  }

  const handleSubmit = async () => {
    setRequestStatus("pending")
    setRequestMessage("Submitting change request...")

    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.5
      if (success) {
        setRequestStatus("success")
        setRequestMessage("Change request submitted successfully!")
      } else {
        setRequestStatus("error")
        setRequestMessage("Failed to submit change request. Please try again.")
      }
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Request NFT Change</DialogTitle>
          <DialogDescription>
            Request changes to your NFT details, such as seat number, event date, or bundle inclusions.
          </DialogDescription>
        </DialogHeader>

        {requestStatus === "idle" && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="seatNumber">Seat Number (if applicable)</Label>
              <Input
                id="seatNumber"
                value={changeDetails.seatNumber}
                onChange={(e) => handleChange(e, "seatNumber")}
                placeholder="Enter your desired seat number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDate">New Event Date (if applicable)</Label>
              <Input
                id="newDate"
                type="date"
                value={changeDetails.newDate}
                onChange={(e) => handleChange(e, "newDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bundleDetails">Bundle Update (if applicable)</Label>
              <Textarea
                id="bundleDetails"
                placeholder="Specify desired bundle updates"
                value={changeDetails.bundleDetails}
                onChange={(e) => handleChange(e, "bundleDetails")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Add any additional notes or requests"
                value={changeDetails.additionalNotes}
                onChange={(e) => handleChange(e, "additionalNotes")}
              />
            </div>
          </div>
        )}

        {requestStatus === "pending" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-10 w-10 animate-spin text-blue-500" />
            <p className="mt-4 text-lg font-semibold">{requestMessage}</p>
          </div>
        )}

        {requestStatus === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="mt-4 text-lg font-semibold">{requestMessage}</p>
          </div>
        )}

        {requestStatus === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-10 w-10 text-red-500" />
            <p className="mt-4 text-lg font-semibold">Error</p>
            <p className="text-sm text-gray-500">{requestMessage}</p>
          </div>
        )}

        <DialogFooter>
          {requestStatus === "idle" ? (
            <Button
              onClick={handleSubmit}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Submit Request
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
