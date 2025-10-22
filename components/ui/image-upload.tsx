"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  onImageUpload: (ipfsHash: string, imageUrl: string) => void
  onImageRemove?: () => void
  currentImage?: string
  className?: string
  maxSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
}

export default function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  className,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS')
      }

      const data = await response.json()
      return data.ipfsHash
    } catch (error) {
      console.error('IPFS upload error:', error)
      throw new Error('Failed to upload image to IPFS')
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (disabled) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`)
      }

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        throw new Error(`File type must be one of: ${acceptedTypes.join(', ')}`)
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(file)
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`

      setUploadProgress(100)
      
      // Call the callback with the IPFS hash and URL
      onImageUpload(ipfsHash, ipfsUrl)
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
      setPreview(ipfsUrl)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onImageUpload, maxSize, acceptedTypes, disabled])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0])
    }
  }, [handleFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes
    },
    maxFiles: 1,
    disabled: disabled || uploading
  })

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onImageRemove?.()
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
          isDragActive && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
          uploading && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
          error && "border-red-500 bg-red-50 dark:bg-red-900/20",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragActive && !uploading && !error && "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Uploading to IPFS...
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Upload Failed
                </p>
                <p className="text-xs text-red-500 mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setError(null)
                }}
                className="text-xs"
              >
                Try Again
              </Button>
            </motion.div>
          ) : preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={preview}
                    alt="Uploaded image"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Image uploaded to IPFS</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isDragActive ? "Drop the image here" : "Drag & drop an image here"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or click to select a file
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} • Max {maxSize}MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
