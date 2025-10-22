import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/launchpad/projects/[id] - Get a single launchpad project by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const project = await FirebaseService.getLaunchpadProjectById(id)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Convert date fields to strings
    const projectWithStringDates = {
      ...project,
      createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
      updatedAt: project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt
    }

    return NextResponse.json({ project: projectWithStringDates })
  } catch (error: any) {
    console.error(`Error fetching launchpad project ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

// PUT /api/launchpad/projects/[id] - Update a launchpad project (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    // TODO: Add admin authentication check
    // const auth = await getAuth(request)
    // if (!auth || auth.role !== 'admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    // }

    await FirebaseService.updateLaunchpadProject(id, updates)

    return NextResponse.json({ success: true, message: "Project updated successfully" })
  } catch (error: any) {
    console.error(`Error updating launchpad project ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

// DELETE /api/launchpad/projects/[id] - Delete a launchpad project (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // TODO: Add admin authentication check
    // const auth = await getAuth(request)
    // if (!auth || auth.role !== 'admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    // }

    await FirebaseService.deleteLaunchpadProject(id)

    return NextResponse.json({ success: true, message: "Project deleted successfully" })
  } catch (error: any) {
    console.error(`Error deleting launchpad project ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
