import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/middleware"
import { adminDb } from "@/lib/firebase/admin"

const CONFIG_COLLECTION = "config"
const PLATFORM_DOC_ID = "platform"

// GET /api/admin/settings - fetch platform configuration
export const GET = requireRole(["admin"])(async (_request: NextRequest) => {
  try {
    const docRef = adminDb.collection(CONFIG_COLLECTION).doc(PLATFORM_DOC_ID)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      // default config
      const defaultConfig = {
        platformFeePercentage: 2.5,
        creatorRoyaltyPercentage: 5.0,
        networkFeeAlgo: 0.001,
        requireManualMerchantApproval: true,
        autoApproveVerifiedMerchants: true,
        updatedAt: new Date(),
      }
      await docRef.set(defaultConfig)
      return NextResponse.json({ config: defaultConfig })
    }

    const data = docSnap.data() || {}
    return NextResponse.json({ config: data })
  } catch (error: any) {
    console.error("Error fetching platform settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
})

// POST /api/admin/settings - update platform configuration
export const POST = requireRole(["admin"])(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const updates: Record<string, any> = {}

    if (typeof body.platformFeePercentage === "number") {
      updates.platformFeePercentage = body.platformFeePercentage
    }
    if (typeof body.creatorRoyaltyPercentage === "number") {
      updates.creatorRoyaltyPercentage = body.creatorRoyaltyPercentage
    }
    if (typeof body.networkFeeAlgo === "number") {
      updates.networkFeeAlgo = body.networkFeeAlgo
    }
    if (typeof body.requireManualMerchantApproval === "boolean") {
      updates.requireManualMerchantApproval = body.requireManualMerchantApproval
    }
    if (typeof body.autoApproveVerifiedMerchants === "boolean") {
      updates.autoApproveVerifiedMerchants = body.autoApproveVerifiedMerchants
    }

    updates.updatedAt = new Date()

    const docRef = adminDb.collection(CONFIG_COLLECTION).doc(PLATFORM_DOC_ID)
    await docRef.set(updates, { merge: true })

    const updated = await docRef.get()
    return NextResponse.json({ success: true, config: updated.data() })
  } catch (error: any) {
    console.error("Error updating platform settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
})


