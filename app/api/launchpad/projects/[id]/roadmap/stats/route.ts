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

    // Fetch project to get roadmap and team
    const project = await FirebaseService.getLaunchpadProjectById(id)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const roadmap = project.roadmap || []
    const team = project.team || []

    // Calculate stats
    const totalMilestones = roadmap.length
    const completedMilestones = roadmap.filter(m => m.status === 'completed').length
    const teamSize = team.length
    const yearsExperience = team.reduce((sum, member) => {
      // Extract years from experience string (this is a simplified calculation)
      const years = member.experience.match(/(\d+)\+?/)?.[1] || '0'
      return sum + parseInt(years)
    }, 0)
    const partnerships = 5 // This would come from actual partnership data

    const stats = {
      totalMilestones,
      completedMilestones,
      teamSize,
      yearsExperience,
      partnerships
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching roadmap stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmap stats' },
      { status: 500 }
    )
  }
}
