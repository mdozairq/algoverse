#!/usr/bin/env node

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

console.log('🌱 NFT Marketplace - Data Seeding Script');
console.log('========================================\n');

// Initialize Firebase Admin
let app;
let db;

try {
  if (getApps().length === 0) {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    };
    app = initializeApp(firebaseAdminConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// Sample data
const sampleUsers = [
  {
    email: "admin@eventnft.app",
    displayName: "Admin User",
    role: "admin",
    walletAddress: "ADMIN_WALLET_ADDRESS",
    isVerified: true,
    createdAt: new Date(),
  },
  {
    email: "merchant@eventnft.app",
    displayName: "Event Organizer",
    role: "merchant",
    walletAddress: "MERCHANT_WALLET_ADDRESS",
    isVerified: true,
    createdAt: new Date(),
  },
  {
    email: "user@eventnft.app",
    displayName: "Regular User",
    role: "user",
    walletAddress: "USER_WALLET_ADDRESS",
    isVerified: true,
    createdAt: new Date(),
  },
];

const sampleMerchants = [
  {
    businessName: "Music Festival Co.",
    email: "merchant@eventnft.app",
    category: "Entertainment",
    description: "Leading music festival organizer",
    walletAddress: "MERCHANT_WALLET_ADDRESS",
    isApproved: true,
    uid: "merchant-uid-1",
    createdAt: new Date(),
  },
  {
    businessName: "Tech Conference Inc.",
    email: "tech@eventnft.app",
    category: "Technology",
    description: "Premium tech conferences and workshops",
    walletAddress: "TECH_MERCHANT_WALLET",
    isApproved: true,
    uid: "merchant-uid-2",
    createdAt: new Date(),
  },
];

const sampleEvents = [
  {
    title: "Summer Music Festival 2024",
    description: "The biggest music festival of the year featuring top artists from around the world.",
    price: "2.5 ALGO",
    merchantId: "merchant-1",
    category: "Music",
    date: "2024-07-15T18:00:00Z",
    location: "Central Park, New York",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    totalSupply: 1000,
    availableSupply: 750,
    featured: true,
    trending: true,
    status: "approved",
    createdAt: new Date(),
  },
  {
    title: "Blockchain Developer Conference",
    description: "Learn about the latest in blockchain technology and Web3 development.",
    price: "5.0 ALGO",
    merchantId: "merchant-2",
    category: "Technology",
    date: "2024-08-20T09:00:00Z",
    location: "San Francisco Convention Center",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    totalSupply: 500,
    availableSupply: 300,
    featured: true,
    trending: false,
    status: "approved",
    createdAt: new Date(),
  },
  {
    title: "Art Gallery Opening",
    description: "Exclusive opening of the new digital art gallery featuring NFT collections.",
    price: "1.0 ALGO",
    merchantId: "merchant-1",
    category: "Art",
    date: "2024-06-10T19:00:00Z",
    location: "Modern Art Museum, Los Angeles",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    totalSupply: 200,
    availableSupply: 150,
    featured: false,
    trending: true,
    status: "approved",
    createdAt: new Date(),
  },
];

const sampleNFTs = [
  {
    eventId: "event-1",
    ownerId: "user-1",
    tokenId: "nft-token-1",
    metadata: {
      name: "VIP Festival Pass",
      description: "Exclusive VIP access to Summer Music Festival 2024",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400",
      attributes: [
        { trait_type: "Type", value: "VIP Pass" },
        { trait_type: "Event", value: "Summer Music Festival" },
        { trait_type: "Rarity", value: "Rare" },
      ],
    },
    isUsed: false,
    createdAt: new Date(),
  },
  {
    eventId: "event-2",
    ownerId: "user-2",
    tokenId: "nft-token-2",
    metadata: {
      name: "Conference Badge",
      description: "Official attendee badge for Blockchain Developer Conference",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      attributes: [
        { trait_type: "Type", value: "Conference Badge" },
        { trait_type: "Event", value: "Blockchain Conference" },
        { trait_type: "Rarity", value: "Common" },
      ],
    },
    isUsed: false,
    createdAt: new Date(),
  },
];

// Seeding functions
async function seedUsers() {
  console.log('👥 Seeding users...');
  for (const user of sampleUsers) {
    try {
      await db.collection('users').add(user);
      console.log(`  ✅ Added user: ${user.email}`);
    } catch (error) {
      console.error(`  ❌ Failed to add user ${user.email}:`, error.message);
    }
  }
}

async function seedMerchants() {
  console.log('🏪 Seeding merchants...');
  for (const merchant of sampleMerchants) {
    try {
      await db.collection('merchants').add(merchant);
      console.log(`  ✅ Added merchant: ${merchant.businessName}`);
    } catch (error) {
      console.error(`  ❌ Failed to add merchant ${merchant.businessName}:`, error.message);
    }
  }
}

async function seedEvents() {
  console.log('🎫 Seeding events...');
  for (const event of sampleEvents) {
    try {
      await db.collection('events').add(event);
      console.log(`  ✅ Added event: ${event.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to add event ${event.title}:`, error.message);
    }
  }
}

async function seedNFTs() {
  console.log('🎨 Seeding NFTs...');
  for (const nft of sampleNFTs) {
    try {
      await db.collection('nfts').add(nft);
      console.log(`  ✅ Added NFT: ${nft.metadata.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to add NFT ${nft.metadata.name}:`, error.message);
    }
  }
}

async function checkExistingData() {
  console.log('🔍 Checking existing data...');
  
  const collections = ['users', 'merchants', 'events', 'nfts'];
  
  for (const collection of collections) {
    try {
      const snapshot = await db.collection(collection).limit(1).get();
      console.log(`  📊 ${collection}: ${snapshot.size > 0 ? 'Has data' : 'Empty'}`);
    } catch (error) {
      console.error(`  ❌ Error checking ${collection}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  try {
    await checkExistingData();
    
    console.log('\n🌱 Starting data seeding...\n');
    
    await seedUsers();
    await seedMerchants();
    await seedEvents();
    await seedNFTs();
    
    console.log('\n✅ Data seeding completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your Firestore console to verify the data');
    console.log('2. Test your application to see the seeded data');
    console.log('3. The mock data should now be replaced with real Firestore data');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the script
main();
