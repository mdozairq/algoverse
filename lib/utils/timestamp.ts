/**
 * Utility functions for handling Firebase Timestamps and Date objects
 */

/**
 * Converts Firebase Timestamps, Date objects, or strings to ISO strings
 * Handles Firebase Timestamp objects with _seconds and _nanoseconds properties
 */
export function convertFirebaseTimestamp(timestamp: any): string {
  if (!timestamp) return ''
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  
  // If it's a Firebase Timestamp object with _seconds and _nanoseconds
  if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
    const date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000)
    return date.toISOString()
  }
  
  // If it's already a string
  if (typeof timestamp === 'string') {
    return timestamp
  }
  
  // Fallback: try to convert to Date
  try {
    return new Date(timestamp).toISOString()
  } catch {
    return ''
  }
}

/**
 * Converts an object with potential Firebase Timestamps to have string dates
 * Recursively handles nested objects and arrays
 */
export function convertObjectTimestamps(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectTimestamps(item))
  }
  
  if (typeof obj === 'object') {
    const converted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Check if this looks like a timestamp field
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || 
          key === 'createdAt' || key === 'updatedAt' || key === 'mintedAt' || 
          key === 'completedAt' || key === 'expiresAt') {
        converted[key] = convertFirebaseTimestamp(value)
      } else {
        converted[key] = convertObjectTimestamps(value)
      }
    }
    return converted
  }
  
  return obj
}
