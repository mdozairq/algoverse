"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Music, Video, File as FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

export type MediaCategory = "image" | "audio" | "video" | "file" | "any"

interface MultimediaUploadProps {
  onFileUpload: (ipfsHash: string, fileUrl: string, fileType: string) => void
  onFileRemove?: () => void
  currentFile?: string
  className?: string
  maxSize?: number // in MB
  category?: MediaCategory
  disabled?: boolean
}

const getAcceptedTypes = (category: MediaCategory): string[] => {
  switch (category) {
    case "image":
      return ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    case "audio":
      return ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/wave", "audio/x-wav", "audio/webm"]
    case "video":
      return ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"]
    case "file":
      return ["application/pdf", "application/zip", "application/json", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    case "any":
      return [
        // Images
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
        // Audio
        "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/wave", "audio/x-wav", "audio/webm",
        // Video
        "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo",
        // Files
        "application/pdf", "application/zip", "application/json", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    default:
      return ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }
}

const getCategoryIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return ImageIcon
  if (fileType.startsWith("audio/")) return Music
  if (fileType.startsWith("video/")) return Video
  return FileIcon
}

const getCategoryLabel = (category: MediaCategory): string => {
  switch (category) {
    case "image":
      return "Image"
    case "audio":
      return "Audio"
    case "video":
      return "Video"
    case "file":
      return "File"
    case "any":
      return "Any Media"
    default:
      return "File"
  }
}

export default function MultimediaUpload({
  onFileUpload,
  onFileRemove,
  currentFile,
  className,
  maxSize = 50, // Default 50MB for multimedia
  category = "any",
  disabled = false
}: MultimediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentFile || null)
  const [fileType, setFileType] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = getAcceptedTypes(category)

  const uploadToIPFS = async (file: File): Promise<{ ipfsHash: string; ipfsUrl: string }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload to IPFS')
      }

      const data = await response.json()
      return { ipfsHash: data.ipfsHash, ipfsUrl: data.ipfsUrl || data.gatewayUrl }
    } catch (error) {
      console.error('IPFS upload error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to upload file to IPFS')
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (disabled) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)
    setFileType(file.type)

    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`)
      }

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported for ${getCategoryLabel(category)} category`)
      }

      // Create preview based on file type
      let previewUrl: string | null = null
      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file)
      } else if (file.type.startsWith("video/")) {
        previewUrl = URL.createObjectURL(file)
      } else if (file.type.startsWith("audio/")) {
        previewUrl = URL.createObjectURL(file)
      }
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
      const { ipfsHash, ipfsUrl } = await uploadToIPFS(file)

      setUploadProgress(100)
      
      // Call the callback with the IPFS hash and URL
      onFileUpload(ipfsHash, ipfsUrl, file.type)
      
      // Clean up preview URL if it was a blob
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreview(ipfsUrl)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      setPreview(null)
      setFileType("")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onFileUpload, maxSize, acceptedTypes, category, disabled])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0])
    }
  }, [handleFileUpload])

  const acceptObject: Record<string, string[]> = {}
  if (category === "any") {
    acceptObject["image/*"] = acceptedTypes.filter(t => t.startsWith("image/"))
    acceptObject["audio/*"] = acceptedTypes.filter(t => t.startsWith("audio/"))
    acceptObject["video/*"] = acceptedTypes.filter(t => t.startsWith("video/"))
    acceptObject["application/*"] = acceptedTypes.filter(t => t.startsWith("application/"))
    acceptObject["text/*"] = acceptedTypes.filter(t => t.startsWith("text/"))
  } else {
    const mainType = category === "file" ? "application/*" : `${category}/*`
    acceptObject[mainType] = acceptedTypes
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptObject,
    maxFiles: 1,
    disabled: disabled || uploading
  })

  const handleRemove = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setError(null)
    setFileType("")
    onFileRemove?.()
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const Icon = fileType ? getCategoryIcon(fileType) : Upload

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
                {fileType.startsWith("image/") ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={preview}
                      alt="Uploaded file"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : fileType.startsWith("video/") ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <video
                      src={preview}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : fileType.startsWith("audio/") ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Music className="w-16 h-16 mx-auto text-gray-400" />
                      <audio src={preview} controls className="w-full max-w-md" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <FileIcon className="w-16 h-16 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">File uploaded</p>
                      <p className="text-xs text-gray-500">{fileType}</p>
                    </div>
                  </div>
                )}
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
                <span>File uploaded to IPFS</span>
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
              <Icon className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isDragActive ? `Drop the ${getCategoryLabel(category).toLowerCase()} here` : `Drag & drop ${getCategoryLabel(category).toLowerCase()} here`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or click to select a file
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Category: {getCategoryLabel(category)} • Max {maxSize}MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

