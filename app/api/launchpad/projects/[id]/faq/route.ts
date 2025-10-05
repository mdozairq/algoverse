import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Fetch project to get FAQ
    const project = await FirebaseService.getLaunchpadProjectById(id)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Return FAQ from project data
    const faqs = project.faq || []

    return NextResponse.json({
      success: true,
      faqs
    })
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQ' },
      { status: 500 }
    )
  }
}
