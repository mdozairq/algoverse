// Common upload utility functions

export interface UploadResult {
  success: boolean
  url?: string
  fileName?: string
  path?: string
  size?: number
  type?: string
  error?: string
}

export const uploadImageToServer = async (file: File, path: string): Promise<UploadResult> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload image')
    }
    
    const data = await response.json()
    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      path: data.path,
      size: data.size,
      type: data.type
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    }
  }
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only images are allowed.' }
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      resolve(result)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
