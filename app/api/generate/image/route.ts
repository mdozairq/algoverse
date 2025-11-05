import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToIPFS } from '@/lib/ipfs'
import { GoogleGenAI } from '@google/genai'

// --- Configuration Constants ---
// Image generation using Gemini API (gemini-2.5-flash-image model)
// Reference: https://ai.google.dev/gemini-api/docs/image-generation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash-image'

// Free fallback APIs (no API keys required)
// Pollinations.AI - Free Stable Diffusion API
const POLLINATIONS_API_URL = 'https://image.pollinations.ai/prompt'
// Hugging Face Inference API (optional, may require API key for some models)
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY
const HUGGINGFACE_MODEL = 'stabilityai/stable-diffusion-2-1'
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid text prompt is required' },
        { status: 400 }
      )
    }

    // Note: No API key required - free fallback APIs (Pollinations.AI) will be used if Gemini API key is not configured

    let generatedImageData: Buffer | null = null
    let imageGenerated = false
    let modelUsed = 'unknown'
    let lastError: any = null

    // === FALLBACK 1: Generate image using Gemini API SDK ===
    if (GEMINI_API_KEY) {
      try {
        console.log(`Attempting image generation with Gemini API (${GEMINI_MODEL})...`)
        
        // Initialize GoogleGenAI client
        const ai = new GoogleGenAI({
          apiKey: GEMINI_API_KEY
        })

        // Generate image from text prompt
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt
        })

        // Extract image from response
        // Response structure: response.candidates[0].content.parts[].inlineData.data
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          const parts = response.candidates[0].content.parts
          
          if (parts && Array.isArray(parts)) {
            for (const part of parts) {
              if (part.text) {
                console.log('Text response:', part.text)
              } else if (part.inlineData && part.inlineData.data) {
                // Gemini returns base64-encoded image data
                const imageData = part.inlineData.data
                if (imageData) {
                  generatedImageData = Buffer.from(imageData, 'base64')
                  imageGenerated = true
                  modelUsed = GEMINI_MODEL
                  console.log(`Successfully generated image using Gemini API: ${GEMINI_MODEL}`)
                  break
                }
              }
            }
          }
        }
      } catch (geminiError: any) {
        console.error('Gemini API Image generation failed:', geminiError)
        lastError = geminiError
        // Continue to fallback APIs
      }
    }

    // === FALLBACK 2: Pollinations.AI (Free, No API Key Required) ===
    if (!imageGenerated) {
      try {
        console.log('Attempting image generation with Pollinations.AI (Free Stable Diffusion)...')
        
        // Pollinations.AI uses URL-based API with prompt as query parameter
        const encodedPrompt = encodeURIComponent(prompt)
        const pollinationsUrl = `${POLLINATIONS_API_URL}/${encodedPrompt}?width=1024&height=1024&nologo=true`
        
        const response = await fetch(pollinationsUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/png',
          },
          // Set timeout to avoid hanging
          signal: AbortSignal.timeout(60000) // 60 seconds timeout
        })

        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          const imageBuffer = await response.arrayBuffer()
          generatedImageData = Buffer.from(imageBuffer)
          imageGenerated = true
          modelUsed = 'pollinations-ai-stable-diffusion'
          console.log('Successfully generated image using Pollinations.AI')
        } else {
          throw new Error(`Pollinations.AI returned status ${response.status}`)
        }
      } catch (pollinationsError: any) {
        console.error('Pollinations.AI Image generation failed:', pollinationsError)
        lastError = pollinationsError
        // Continue to next fallback
      }
    }

    // === FALLBACK 3: Hugging Face Inference API (Optional, may require API key) ===
    if (!imageGenerated && HUGGINGFACE_API_KEY) {
      try {
        console.log(`Attempting image generation with Hugging Face (${HUGGINGFACE_MODEL})...`)
        
        const response = await fetch(HUGGINGFACE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width: 1024,
              height: 1024,
            }
          }),
          signal: AbortSignal.timeout(60000) // 60 seconds timeout
        })

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer()
          generatedImageData = Buffer.from(imageBuffer)
          imageGenerated = true
          modelUsed = HUGGINGFACE_MODEL
          console.log(`Successfully generated image using Hugging Face: ${HUGGINGFACE_MODEL}`)
        } else {
          const errorText = await response.text()
          throw new Error(`Hugging Face API returned status ${response.status}: ${errorText}`)
        }
      } catch (huggingfaceError: any) {
        console.error('Hugging Face Image generation failed:', huggingfaceError)
        lastError = huggingfaceError
        // Continue to final error handling
      }
    }

    // === Final Error Handling: If all methods failed ===
    if (!imageGenerated) {
      // Check if the original error was a quota error from Gemini
      let isQuotaError = false
      let retryAfter: number | null = null
      
      if (lastError) {
        const errorMessage = String(lastError.message || '')
        const errorString = errorMessage.toLowerCase()
        
        if (errorMessage.includes('429') || 
            errorString.includes('quota') || 
            errorString.includes('rate limit') ||
            errorString.includes('resource_exhausted') ||
            errorString.includes('exceeded')) {
          isQuotaError = true
          
          const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i)
          if (retryMatch) {
            retryAfter = Math.ceil(parseFloat(retryMatch[1]))
          }
        }
      }

      // Build comprehensive error response
      const errorResponse: any = {
        success: false,
        error: isQuotaError ? 'Quota Exceeded' : 'Failed to generate image',
        details: lastError?.message || 'All image generation methods failed. Please try again later.',
        metadata: {
          triedMethods: [
            GEMINI_API_KEY ? 'Gemini API' : null,
            'Pollinations.AI (Free)',
            HUGGINGFACE_API_KEY ? 'Hugging Face' : null
          ].filter(Boolean),
          lastError: lastError?.message
        },
        links: {
          docs: 'https://ai.google.dev/gemini-api/docs/image-generation',
          troubleshooting: 'https://ai.google.dev/gemini-api/docs/api-troubleshooting',
          getApiKey: 'https://ai.google.dev/gemini-api/docs/get-api-key',
          pollinationsDocs: 'https://github.com/pollinations/pollinations',
          huggingFaceDocs: 'https://huggingface.co/docs/api-inference/index'
        }
      }

      // Add quota-specific links if it's a quota error
      if (isQuotaError) {
        errorResponse.links.usageDashboard = 'https://ai.dev/usage?tab=rate-limit'
        errorResponse.links.rateLimitDocs = 'https://ai.google.dev/gemini-api/docs/rate-limits'
        errorResponse.links.pricing = 'https://ai.google.dev/pricing'
        if (retryAfter) {
          errorResponse.retryAfter = retryAfter
          errorResponse.message = `Quota exceeded. Free fallback APIs were attempted but failed. Please retry after ${retryAfter} seconds or upgrade your plan.`
        }
      } else {
        errorResponse.message = 'All image generation methods failed. Please check your API keys or try again later.'
      }

      return NextResponse.json(errorResponse, { status: isQuotaError ? 429 : 500 })
    }

    // === IPFS Upload Section ===
    let ipfsUrl: string
    
    if (!imageGenerated || !generatedImageData) {
      return NextResponse.json(
        { error: 'Internal error: Generated image data is missing after successful API call' },
        { status: 500 }
      )
    }

    try {
      const uint8Array = new Uint8Array(generatedImageData)
      
      // Create a File-like object
      const imageFile = new File(
        [uint8Array], 
        `generated-nft-${Date.now()}.png`, 
        { type: 'image/png' }
      )
      
      // Upload to IPFS using the existing utility
      ipfsUrl = await uploadImageToIPFS(imageFile)
      
    } catch (ipfsError: any) {
      console.error('IPFS upload error:', ipfsError)
      // Return the base64 data if IPFS fails
      return NextResponse.json({
        success: true,
        imageUrl: `data:image/png;base64,${generatedImageData.toString('base64').slice(0, 100)}... (truncated)`,
        prompt,
        generatedAt: new Date().toISOString(),
        warning: 'Image generated but IPFS upload failed. Returning truncated base64 data.',
        metadata: {
          model: modelUsed,
          resolution: '1024x1024',
          fallbackUsed: modelUsed !== GEMINI_MODEL
        }
      })
    }
    
    // Success response
    return NextResponse.json({
      success: true,
      imageUrl: ipfsUrl,
      url: ipfsUrl,
      ipfsHash: ipfsUrl.split('/').pop(),
      prompt,
      generatedAt: new Date().toISOString(),
      metadata: {
        model: modelUsed,
        resolution: '1024x1024',
        uploadedToIPFS: true,
        fallbackUsed: modelUsed !== GEMINI_MODEL
      }
    })

  } catch (error: any) {
    console.error('General POST handler error:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred in the image generation handler',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
