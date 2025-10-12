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

    // Fetch all activities for the project
    const activities = await FirebaseService.getActivityByProject(id)

    // Calculate stats
    const totalMints = activities.filter(a => a.type === 'mint').length
    const totalSales = activities.filter(a => a.type === 'sale').length
    const totalTransfers = activities.filter(a => a.type === 'transfer').length
    const totalListings = activities.filter(a => a.type === 'list').length

    // Calculate volume from sales
    const sales = activities.filter(a => a.type === 'sale' && a.price)
    const totalVolume = sales.reduce((sum, sale) => sum + (sale.price || 0), 0)
    const averagePrice = sales.length > 0 ? totalVolume / sales.length : 0

    // Get unique buyers and sellers
    const uniqueBuyers = new Set(
      sales.map(sale => sale.toAddress).filter(Boolean)
    ).size

    const uniqueSellers = new Set(
      sales.map(sale => sale.fromAddress)
    ).size

    const stats = {
      totalMints,
      totalSales,
      totalTransfers,
      totalListings,
      totalVolume,
      averagePrice,
      uniqueBuyers,
      uniqueSellers,
      currency: 'ALGO' // Default currency, should be fetched from project
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching activity stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity stats' },
      { status: 500 }
    )
  }
}
