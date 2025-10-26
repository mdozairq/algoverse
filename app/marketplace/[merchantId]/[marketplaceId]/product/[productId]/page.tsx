"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Package,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const merchantId = params.merchantId as string
  const marketplaceId = params.marketplaceId as string
  const productId = params.productId as string

  useEffect(() => {
    // Redirect to collection detail page since we've moved from products to collections
    router.replace(`/marketplace/${merchantId}/${marketplaceId}/collection/${productId}`)
  }, [merchantId, marketplaceId, productId, router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl">Redirecting to Collection</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            We've moved from products to collections. You're being redirected to the collection detail page.
          </p>
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">Redirecting...</span>
          </div>
          {/* <div className="pt-4">
            <Button asChild variant="outline">
              <Link href={`/marketplace/${merchantId}/${marketplaceId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}