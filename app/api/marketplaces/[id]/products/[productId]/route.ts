import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { id: marketplaceId, productId } = params

    // Fetch the product from Firebase
    const product = await FirebaseService.getProductById(productId)
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Verify the product belongs to this marketplace
    if (product.marketplaceId !== marketplaceId) {
      return NextResponse.json(
        { error: "Product not found in this marketplace" },
        { status: 404 }
      )
    }

    // Add mock mint data for NFT products
    if (product.type === "nft") {
      const mockMintData = {
        phases: [
          {
            id: "og-phase",
            name: "OG",
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            price: product.price,
            limit: 4,
            minted: 41,
            isActive: false,
            isWhitelist: true
          },
          {
            id: "wl-phase",
            name: "WL",
            startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            price: product.price,
            limit: 8,
            minted: 22,
            isActive: false,
            isWhitelist: true
          },
          {
            id: "public-phase",
            name: "PUBLIC",
            startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            price: product.price,
            limit: 10,
            minted: Math.floor(Math.random() * 1000),
            isActive: true,
            isWhitelist: false
          }
        ],
        currentPhase: {
          id: "public-phase",
          name: "PUBLIC",
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          price: product.price,
          limit: 10,
          minted: Math.floor(Math.random() * 1000),
          isActive: true,
          isWhitelist: false
        }
      }

      // Add mock traits for NFT products
      const mockTraits = [
        { trait_type: "Background", value: "Blue", rarity: 15.2 },
        { trait_type: "Eyes", value: "Laser", rarity: 8.5 },
        { trait_type: "Mouth", value: "Smile", rarity: 25.3 },
        { trait_type: "Hat", value: "Crown", rarity: 5.1 },
        { trait_type: "Clothing", value: "Suit", rarity: 12.7 },
        { trait_type: "Accessory", value: "Necklace", rarity: 18.9 }
      ]

      product.mintData = mockMintData
      if (product.nftData) {
        product.nftData.traits = mockTraits
        product.nftData.rarityScore = Math.random() * 100
        product.nftData.rarityRank = Math.floor(Math.random() * 1000) + 1
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString()
      }
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { id: marketplaceId, productId } = params
    const updates = await request.json()

    // Verify the product exists and belongs to this marketplace
    const existingProduct = await FirebaseService.getProductById(productId)
    if (!existingProduct || existingProduct.marketplaceId !== marketplaceId) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Update the product
    await FirebaseService.updateProduct(productId, updates)

    return NextResponse.json({
      success: true,
      message: "Product updated successfully"
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { id: marketplaceId, productId } = params

    // Verify the product exists and belongs to this marketplace
    const existingProduct = await FirebaseService.getProductById(productId)
    if (!existingProduct || existingProduct.marketplaceId !== marketplaceId) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Delete the product
    await FirebaseService.deleteProduct(productId)

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
