import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    const { name, email, subject, category, message, priority } = body

    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create support ticket
    const ticketData = {
      projectId: id,
      subject,
      description: message,
      category,
      priority: priority || 'medium',
      userEmail: email,
      userName: name,
      status: 'open'
    }

    const ticketId = await FirebaseService.createSupportTicket(ticketData)

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Support ticket created successfully'
    })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}
