// In-memory storage for development images
const devImages = new Map<string, { buffer: Buffer; contentType: string }>()

export function storeDevImage(hash: string, buffer: Buffer, contentType: string) {
  devImages.set(hash, { buffer, contentType })
}

export function getDevImage(hash: string): { buffer: Buffer; contentType: string } | undefined {
  return devImages.get(hash)
}

export function hasDevImage(hash: string): boolean {
  return devImages.has(hash)
}
