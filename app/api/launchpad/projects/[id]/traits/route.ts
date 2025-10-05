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

    // Fetch project to get traits
    const project = await FirebaseService.getLaunchpadProjectById(id)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Return traits from project data
    const traits = project.traits || []

    return NextResponse.json({
      success: true,
      traits
    })
  } catch (error) {
    console.error('Error fetching traits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch traits' },
      { status: 500 }
    )
  }
}
