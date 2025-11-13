// In-memory storage for development files (images, audio, video, documents)
const devFiles = new Map<string, { buffer: Buffer; contentType: string }>()

// Legacy function for backward compatibility
export function storeDevImage(hash: string, buffer: Buffer, contentType: string) {
  storeDevFile(hash, buffer, contentType)
}

export function getDevImage(hash: string): { buffer: Buffer; contentType: string } | undefined {
  return getDevFile(hash)
}

export function hasDevImage(hash: string): boolean {
  return hasDevFile(hash)
}

// Generic file storage functions
export function storeDevFile(hash: string, buffer: Buffer, contentType: string) {
  devFiles.set(hash, { buffer, contentType })
}

export function getDevFile(hash: string): { buffer: Buffer; contentType: string } | undefined {
  return devFiles.get(hash)
}

export function hasDevFile(hash: string): boolean {
  return devFiles.has(hash)
}
