#!/usr/bin/env node

/**
 * Backfill script to add maxSupply and availableSupply fields to existing collections and NFTs
 * This script will:
 * 1. Update all collections to set availableSupply = maxSupply (if not already set)
 * 2. Update all NFTs to set availableSupply = 1 (if not already set)
 * 3. Update collection availableSupply when NFTs are purchased
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Firebase Admin SDK
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('❌ Firebase environment variables are not set properly');
  console.log('Required environment variables:');
  console.log('- FIREBASE_PROJECT_ID');
  console.log('- FIREBASE_CLIENT_EMAIL');
  console.log('- FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const adminDb = getFirestore();

async function backfillSupplyData() {
  console.log('🚀 Starting supply data backfill...');
  
  try {
    // Step 1: Update collections
    console.log('📦 Updating collections...');
    const collectionsSnapshot = await adminDb.collection('collections').get();
    const collectionUpdates = [];
    
    for (const doc of collectionsSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      
      // Set availableSupply = maxSupply if availableSupply is not set
      if (data.maxSupply !== undefined && data.availableSupply === undefined) {
        updates.availableSupply = data.maxSupply;
        console.log(`Collection ${doc.id}: Setting availableSupply to ${data.maxSupply}`);
      }
      
      if (Object.keys(updates).length > 0) {
        collectionUpdates.push({ id: doc.id, updates });
      }
    }
    
    // Batch update collections
    if (collectionUpdates.length > 0) {
      const batch = adminDb.batch();
      for (const { id, updates } of collectionUpdates) {
        const docRef = adminDb.collection('collections').doc(id);
        batch.update(docRef, updates);
      }
      
      await batch.commit();
      console.log(`✅ Updated ${collectionUpdates.length} collections`);
    } else {
      console.log('ℹ️  No collections needed updating');
    }
    
    // Step 2: Update NFTs
    console.log('🎨 Updating NFTs...');
    const nftsSnapshot = await adminDb.collection('nfts').get();
    const nftUpdates = [];
    
    for (const doc of nftsSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      
      // Set maxSupply = 1 if not set (assuming each NFT is unique)
      if (data.maxSupply === undefined) {
        updates.maxSupply = 1;
        console.log(`NFT ${doc.id}: Setting maxSupply to 1`);
      }
      
      // Set availableSupply based on minting status
      if (data.availableSupply === undefined) {
        if (data.assetId && data.assetId > 0) {
          // NFT is already minted, so availableSupply = 0
          updates.availableSupply = 0;
          console.log(`NFT ${doc.id}: Setting availableSupply to 0 (already minted)`);
        } else {
          // NFT is not minted yet, so availableSupply = 1
          updates.availableSupply = 1;
          console.log(`NFT ${doc.id}: Setting availableSupply to 1`);
        }
      }
      
      // Set forSale = true if not set and NFT is minted
      if (data.forSale === undefined && data.assetId && data.assetId > 0) {
        updates.forSale = true;
        console.log(`NFT ${doc.id}: Setting forSale to true`);
      }
      
      if (Object.keys(updates).length > 0) {
        nftUpdates.push({ id: doc.id, updates });
      }
    }
    
    // Batch update NFTs (in chunks of 500 to avoid Firestore limits)
    if (nftUpdates.length > 0) {
      const chunkSize = 500;
      const totalChunks = Math.ceil(nftUpdates.length / chunkSize);
      
      for (let i = 0; i < nftUpdates.length; i += chunkSize) {
        const chunk = nftUpdates.slice(i, i + chunkSize);
        const batch = adminDb.batch();
        
        for (const { id, updates } of chunk) {
          const docRef = adminDb.collection('nfts').doc(id);
          batch.update(docRef, updates);
        }
        
        try {
          await batch.commit();
          console.log(`✅ Updated NFT batch ${Math.floor(i / chunkSize) + 1}/${totalChunks} (${chunk.length} NFTs)`);
        } catch (error) {
          console.error(`❌ Error updating NFT batch ${Math.floor(i / chunkSize) + 1}:`, error);
          throw error;
        }
      }
    }
    
    if (nftUpdates.length > 0) {
      console.log(`✅ Updated ${nftUpdates.length} NFTs`);
    } else {
      console.log('ℹ️  No NFTs needed updating');
    }
    
    // Step 3: Recalculate collection availableSupply based on actual NFT sales
    console.log('🔄 Recalculating collection availableSupply...');
    const collectionsToRecalculate = [];
    
    for (const doc of collectionsSnapshot.docs) {
      const collectionData = doc.data();
      if (collectionData.maxSupply !== undefined) {
        collectionsToRecalculate.push({ id: doc.id, maxSupply: collectionData.maxSupply });
      }
    }
    
    for (const { id: collectionId, maxSupply } of collectionsToRecalculate) {
      try {
        // Count NFTs in this collection that are minted (have assetId)
        const nftsInCollection = await adminDb.collection('nfts')
          .where('collectionId', '==', collectionId)
          .get();
        
        // Count minted NFTs (those with assetId > 0)
        const mintedCount = nftsInCollection.docs.filter(doc => {
          const nftData = doc.data();
          return nftData.assetId && nftData.assetId > 0;
        }).length;
        
        const newAvailableSupply = Math.max(0, maxSupply - mintedCount);
        
        await adminDb.collection('collections').doc(collectionId).update({
          availableSupply: newAvailableSupply
        });
        
        console.log(`Collection ${collectionId}: Updated availableSupply to ${newAvailableSupply} (maxSupply: ${maxSupply}, minted: ${mintedCount})`);
      } catch (error) {
        console.error(`❌ Error updating collection ${collectionId}:`, error);
        // Continue with other collections
      }
    }
    
    // Summary report
    console.log('\n📊 Backfill Summary:');
    console.log(`- Collections processed: ${collectionsSnapshot.docs.length}`);
    console.log(`- Collections updated: ${collectionUpdates.length}`);
    console.log(`- NFTs processed: ${nftsSnapshot.docs.length}`);
    console.log(`- NFTs updated: ${nftUpdates.length}`);
    console.log(`- Collections recalculated: ${collectionsToRecalculate.length}`);
    
    console.log('\n🎉 Supply data backfill completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  }
}

// Run the backfill
if (require.main === module) {
  backfillSupplyData()
    .then(() => {
      console.log('✅ Backfill script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backfill script failed:', error);
      process.exit(1);
    });
}

module.exports = { backfillSupplyData };
