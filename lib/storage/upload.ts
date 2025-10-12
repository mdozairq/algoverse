import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/middleware"

// Simple file upload handler without Firebase dependencies
export const uploadFile = async (file: File, path: string): Promise<string> => {
  // For now, we'll use a simple base64 encoding approach
  // In production, you'd want to use a proper file storage service
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Create a data URL for the file
      const dataUrl = reader.result as string
      resolve(dataUrl)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// API route handler for file uploads
export const POST = requireRole(["user", "merchant"])(async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Upload file using our utility function
    const fileUrl = await uploadFile(file, path)

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      path: path,
      size: file.size,
      type: file.type
    })

  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: "Failed to upload file",
      details: error.message 
    }, { status: 500 })
  }
})
