
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Read environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    envVars[key] = value.join('=');
  }
});

const serviceAccount = {
  projectId: envVars.FIREBASE_PROJECT_ID,
  clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
  privateKey: envVars.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function addDemoData() {
  try {
    console.log('🚀 Adding demo data to Firestore...');
    
    // Demo Events
    const events = [
      {
        id: 'crypto-summit-2024',
        title: 'Crypto Summit 2024',
        description: 'The largest cryptocurrency and blockchain conference of the year',
        date: '2024-06-15',
        venue: 'San Francisco Convention Center',
        price: 299,
        totalTickets: 1000,
        soldTickets: 750,
        category: 'Technology',
        featured: true,
        trending: true,
        organizer: 'CryptoEvents Inc',
        imageUrl: '/placeholder.jpg',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'nft-art-expo',
        title: 'NFT Art Expo',
        description: 'Discover the future of digital art and NFT collections',
        date: '2024-07-20',
        venue: 'Digital Arts Museum',
        price: 150,
        totalTickets: 500,
        soldTickets: 320,
        category: 'Art',
        featured: true,
        trending: false,
        organizer: 'Digital Arts Foundation',
        imageUrl: '/placeholder.jpg',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'defi-workshop',
        title: 'DeFi Workshop 2024',
        description: 'Learn about decentralized finance and yield farming',
        date: '2024-08-10',
        venue: 'Online Event',
        price: 99,
        totalTickets: 200,
        soldTickets: 45,
        category: 'Education',
        featured: false,
        trending: true,
        organizer: 'DeFi Academy',
        imageUrl: '/placeholder.jpg',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'blockchain-music-fest',
        title: 'Blockchain Music Festival',
        description: 'Where music meets blockchain technology',
        date: '2024-09-05',
        venue: 'Austin Music Hall',
        price: 89,
        totalTickets: 800,
        soldTickets: 245,
        category: 'Music',
        featured: false,
        trending: true,
        organizer: 'Web3 Music Collective',
        imageUrl: '/placeholder.jpg',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'metaverse-conference',
        title: 'Metaverse Conference 2024',
        description: 'Exploring virtual worlds and digital economies',
        date: '2024-10-12',
        venue: 'Virtual Reality Center',
        price: 199,
        totalTickets: 600,
        soldTickets: 150,
        category: 'Technology',
        featured: true,
        trending: false,
        organizer: 'Metaverse Institute',
        imageUrl: '/placeholder.jpg',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Demo NFTs
    const nfts = [
      {
        id: 'crypto-summit-vip',
        eventId: 'crypto-summit-2024',
        name: 'Crypto Summit VIP Pass',
        description: 'VIP access to Crypto Summit 2024 with exclusive networking sessions',
        price: 599,
        type: 'VIP',
        metadata: {
          seatNumber: 'VIP-001',
          perks: ['Backstage access', 'Premium lunch', 'Meet & greet']
        },
        ownerId: null,
        isListed: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'nft-expo-general',
        eventId: 'nft-art-expo',
        name: 'NFT Expo General Admission',
        description: 'General admission to NFT Art Expo with gallery access',
        price: 150,
        type: 'General',
        metadata: {
          seatNumber: 'GA-156',
          perks: ['Gallery access', 'Workshop materials']
        },
        ownerId: null,
        isListed: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'music-fest-early-bird',
        eventId: 'blockchain-music-fest',
        name: 'Music Festival Early Bird',
        description: 'Early bird ticket with special perks',
        price: 79,
        type: 'Early Bird',
        metadata: {
          seatNumber: 'EB-098',
          perks: ['Exclusive merch', 'Meet artists', 'Front row access']
        },
        ownerId: null,
        isListed: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'metaverse-premium',
        eventId: 'metaverse-conference',
        name: 'Metaverse Premium Access',
        description: 'Premium access with VR headset included',
        price: 299,
        type: 'Premium',
        metadata: {
          seatNumber: 'PREM-045',
          perks: ['VR headset', 'Premium sessions', 'Networking dinner']
        },
        ownerId: null,
        isListed: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'defi-workshop-student',
        eventId: 'defi-workshop',
        name: 'DeFi Workshop Student Discount',
        description: 'Student discount ticket for DeFi workshop',
        price: 49,
        type: 'Student',
        metadata: {
          seatNumber: 'STU-234',
          perks: ['Student materials', 'Certificate', 'Discord access']
        },
        ownerId: null,
        isListed: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Demo Users (merchants and regular users)
    const users = [
      {
        email: 'merchant1@example.com',
        password: await bcrypt.hash('Merchant123!', 12),
        role: 'merchant',
        name: 'John Smith',
        businessName: 'EventPro Ltd',
        isApproved: true,
        isVerified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        email: 'merchant2@example.com',
        password: await bcrypt.hash('Merchant123!', 12),
        role: 'merchant',
        name: 'Sarah Johnson',
        businessName: 'Digital Events Co',
        isApproved: false,
        isVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        email: 'user1@example.com',
        password: await bcrypt.hash('User123!', 12),
        role: 'user',
        name: 'Alice Wilson',
        isVerified: true,
        walletAddress: 'ALGO1234567890ABCDEFGH',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        email: 'user2@example.com',
        password: await bcrypt.hash('User123!', 12),
        role: 'user',
        name: 'Bob Davis',
        isVerified: true,
        walletAddress: 'ALGO0987654321ZYXWVU',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Add Events
    console.log('📅 Adding demo events...');
    for (const event of events) {
      await db.collection('events').doc(event.id).set(event);
      console.log(`✅ Added event: ${event.title}`);
    }

    // Add NFTs
    console.log('🎨 Adding demo NFTs...');
    for (const nft of nfts) {
      await db.collection('nft').doc(nft.id).set(nft);
      console.log(`✅ Added NFT: ${nft.name}`);
    }

    // Add Users
    console.log('👥 Adding demo users...');
    for (const user of users) {
      await db.collection('users').add(user);
      console.log(`✅ Added user: ${user.email} (${user.role})`);
    }

    // Add some analytics data
    const analyticsData = {
      totalUsers: 1250,
      totalEvents: 67,
      totalNFTs: 1245,
      totalRevenue: 187500,
      monthlyGrowth: 15.5,
      topCategories: ['Technology', 'Art', 'Music', 'Education'],
      recentTransactions: [
        { amount: 599, event: 'Crypto Summit VIP', date: '2024-01-15' },
        { amount: 150, event: 'NFT Art Expo', date: '2024-01-14' },
        { amount: 299, event: 'Metaverse Conference', date: '2024-01-13' }
      ],
      userGrowth: [
        { month: 'Jan', users: 850 },
        { month: 'Feb', users: 920 },
        { month: 'Mar', users: 1050 },
        { month: 'Apr', users: 1180 },
        { month: 'May', users: 1250 }
      ],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('analytics').doc('platform-stats').set(analyticsData);
    console.log('📊 Added analytics data');

    console.log('🎉 Demo data added successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('👨‍💼 Admin: admin@eventnft.app / Admin123! / 5067b24c4f0b32f26b21e6079f2944cf');
    console.log('🏪 Merchant: merchant1@example.com / Merchant123!');
    console.log('👤 User: user1@example.com / User123!');
    
  } catch (error) {
    console.error('❌ Error adding demo data:', error);
  }
}

addDemoData();
