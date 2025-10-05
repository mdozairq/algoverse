import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// POST /api/launchpad/projects/[id]/mint - Mint NFTs for a launchpad project
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projectId } = params
    const { walletAddress, quantity, phaseId } = await request.json()

    // Validate required fields
    if (!walletAddress || !quantity || !phaseId) {
      return NextResponse.json({ 
        error: "Missing required fields: walletAddress, quantity, phaseId" 
      }, { status: 400 })
    }

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ 
        error: "Quantity must be between 1 and 10" 
      }, { status: 400 })
    }

    // Get project details
    const project = await FirebaseService.getLaunchpadProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get mint phase details
    const phase = await FirebaseService.getMintPhaseById(phaseId)
    if (!phase) {
      return NextResponse.json({ error: "Mint phase not found" }, { status: 404 })
    }

    // Check if phase is active
    if (!phase.isActive) {
      return NextResponse.json({ error: "Mint phase is not active" }, { status: 400 })
    }

    // Check if user is eligible for this phase
    if (phase.isWhitelist) {
      const isEligible = await FirebaseService.checkWhitelistEligibility(walletAddress, phaseId)
      if (!isEligible) {
        return NextResponse.json({ error: "Wallet not whitelisted for this phase" }, { status: 403 })
      }
    }

    // Check if user has already minted the maximum allowed
    const userMintCount = await FirebaseService.getUserMintCount(walletAddress, phaseId)
    if (userMintCount + quantity > phase.maxPerWallet) {
      return NextResponse.json({ 
        error: `Cannot mint ${quantity} NFTs. Maximum ${phase.maxPerWallet} per wallet, already minted ${userMintCount}` 
      }, { status: 400 })
    }

    // Check if there are enough NFTs available
    if (phase.minted + quantity > phase.total) {
      return NextResponse.json({ 
        error: `Not enough NFTs available. Requested: ${quantity}, Available: ${phase.total - phase.minted}` 
      }, { status: 400 })
    }

    // Calculate total cost
    const totalCost = phase.price * quantity

    // TODO: Integrate with blockchain for actual minting
    // For now, we'll simulate the minting process
    const mintedNFTs = []
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    for (let i = 0; i < quantity; i++) {
      const tokenId = `${projectId}_${phase.minted + i + 1}`
      
      // Create NFT record
      const nftData = {
        id: `nft_${Date.now()}_${i}`,
        tokenId,
        projectId,
        ownerAddress: walletAddress,
        phaseId,
        mintPrice: phase.price,
        currency: project.keyMetrics.currency,
        mintedAt: new Date(),
        transactionHash: transactionId,
        metadata: {
          name: `${project.name} #${phase.minted + i + 1}`,
          description: project.description,
          image: `${project.banner}?token=${tokenId}`,
          attributes: [
            {
              trait_type: "Project",
              value: project.name
            },
            {
              trait_type: "Phase",
              value: phase.name
            },
            {
              trait_type: "Token ID",
              value: tokenId
            }
          ]
        }
      }

      await FirebaseService.createNFT(nftData)
      mintedNFTs.push(nftData)
    }

    // Update phase minted count
    await FirebaseService.updateMintPhase(phaseId, {
      minted: phase.minted + quantity
    })

    // Update project minted count
    await FirebaseService.updateLaunchpadProject(projectId, {
      keyMetrics: {
        ...project.keyMetrics,
        minted: project.keyMetrics.minted + quantity,
        remaining: project.keyMetrics.remaining - quantity
      }
    })

    // Record minting activity
    await FirebaseService.createActivity({
      id: `activity_${Date.now()}`,
      projectId,
      type: 'mint',
      timestamp: new Date(),
      fromAddress: walletAddress,
      tokenId: mintedNFTs[0].tokenId,
      nftName: mintedNFTs[0].metadata.name,
      nftImage: mintedNFTs[0].metadata.image,
      price: totalCost,
      currency: project.keyMetrics.currency,
      transactionHash: transactionId,
      blockNumber: Math.floor(Math.random() * 1000000), // Simulated
      status: 'confirmed'
    })

    return NextResponse.json({
      success: true,
      transactionId,
      mintedNFTs: mintedNFTs.map(nft => ({
        tokenId: nft.tokenId,
        name: nft.metadata.name,
        image: nft.metadata.image
      })),
      totalCost,
      currency: project.keyMetrics.currency
    })

  } catch (error: any) {
    console.error(`Error minting NFTs for project ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to mint NFTs" }, { status: 500 })
  }
}
