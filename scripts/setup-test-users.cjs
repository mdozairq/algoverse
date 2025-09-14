#!/usr/bin/env node

// Load environment variables from .env file first
function loadEnvFile() {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !key.startsWith('#')) {
        envVars[key.trim()] = value;
      }
    }
  });
  
  return envVars;
}

// Load environment variables
const env = loadEnvFile();
Object.assign(process.env, env);

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

console.log('👥 NFT Marketplace - Test Users Setup');
console.log('=====================================\n');

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

// Test users data
const testUsers = [
  {
    email: "admin@eventnft.app",
    password: "Admin123!",
    displayName: "Admin User",
    role: "admin",
    uid: "admin-user-001",
    data: {
      email: "admin@eventnft.app",
      displayName: "Admin User",
      role: "admin",
      walletAddress: "ADMIN_WALLET_ADDRESS",
      isVerified: true,
      createdAt: new Date(),
    }
  },
  {
    email: "merchant@eventnft.app",
    password: "Merchant123!",
    displayName: "Event Organizer",
    role: "merchant",
    uid: "merchant-user-001",
    data: {
      businessName: "Music Festival Co.",
      email: "merchant@eventnft.app",
      category: "Entertainment",
      description: "Leading music festival organizer",
      walletAddress: "MERCHANT_WALLET_ADDRESS",
      isApproved: true,
      uid: "merchant-user-001",

      role: "merchant",
      createdAt: new Date(),
    }
  },
  {
    email: "user@eventnft.app",
    password: "User123!",
    displayName: "Regular User",
    role: "user",
    uid: "regular-user-001",
    data: {
      email: "user@eventnft.app",
      displayName: "Regular User",
      role: "user",
      walletAddress: "USER_WALLET_ADDRESS",
      isVerified: true,
      createdAt: new Date(),
    }
  }
];

async function createTestUsers() {
  console.log('👥 Creating test users...\n');
  
  for (const user of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await db.collection('users').where('email', '==', user.email).get();
      
      if (existingUser.empty) {
        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set(user.data);
        
        // Create merchant document if it's a merchant
        if (user.role === 'merchant') {
          await db.collection('merchants').doc(user.uid).set(user.data);
        }
        
        console.log(`✅ Created ${user.role} user: ${user.email}`);
      } else {
        console.log(`⚠️  User already exists: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create user ${user.email}:`, error.message);
    }
  }
}

async function displayCredentials() {
  console.log('\n🔐 TEST CREDENTIALS');
  console.log('==================\n');
  
  console.log('🔴 ADMIN ACCESS:');
  console.log('   Email: admin@eventnft.app');
  console.log('   Password: Admin123!');
  console.log('   Admin Key: ' + (process.env.ADMIN_MASTER_KEY || 'admin123'));
  console.log('   URL: http://localhost:3000/auth/admin\n');
  
  console.log('🔵 MERCHANT ACCESS:');
  console.log('   Email: merchant@eventnft.app');
  console.log('   Password: Merchant123!');
  console.log('   URL: http://localhost:3000/auth/merchant\n');
  
  console.log('🟢 USER ACCESS:');
  console.log('   Email: user@eventnft.app');
  console.log('   Password: User123!');
  console.log('   URL: http://localhost:3000/auth/user\n');
  
  console.log('📝 NOTES:');
  console.log('- All users are pre-created in Firestore');
  console.log('- Admin and User accounts are verified');
  console.log('- Merchant account is approved');
  console.log('- Use these credentials to test the authentication system');
}

// Main execution
async function main() {
  try {
    await createTestUsers();
    await displayCredentials();
    
    console.log('\n✅ Test users setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your Next.js development server: npm run dev');
    console.log('2. Navigate to the authentication pages using the URLs above');
    console.log('3. Test login with the provided credentials');
    console.log('4. Verify that users can access their respective dashboards');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run the script
main();
