import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    let activities = await FirebaseService.getActivityByProject(id)

    // Filter by type if specified
    if (type) {
      activities = activities.filter(activity => activity.type === type)
    }

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit)

    // Convert date fields to strings
    const activitiesWithStringDates = paginatedActivities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp instanceof Date ? activity.timestamp.toISOString() : activity.timestamp,
      createdAt: activity.createdAt instanceof Date ? activity.createdAt.toISOString() : activity.createdAt,
      updatedAt: activity.updatedAt instanceof Date ? activity.updatedAt.toISOString() : activity.updatedAt
    }))

    return NextResponse.json({
      success: true,
      activities: activitiesWithStringDates,
      total: activities.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

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
    const { type, fromAddress, tokenId, nftName, nftImage, transactionHash, blockNumber } = body

    if (!type || !fromAddress || !tokenId || !nftName || !nftImage || !transactionHash || !blockNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create activity item
    const activityData = {
      projectId: id,
      type,
      timestamp: new Date(),
      fromAddress: fromAddress.toLowerCase(),
      toAddress: body.toAddress?.toLowerCase(),
      tokenId,
      nftName,
      nftImage,
      price: body.price,
      currency: body.currency,
      transactionHash,
      blockNumber: parseInt(blockNumber),
      gasUsed: body.gasUsed,
      gasPrice: body.gasPrice,
      status: body.status || 'confirmed'
    }

    const activityId = await FirebaseService.createActivity(activityData)

    return NextResponse.json({
      success: true,
      activityId,
      message: 'Activity created successfully'
    })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
