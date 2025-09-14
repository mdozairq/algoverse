#!/usr/bin/env node

// Load environment variables from .env file
const fs = require('fs');
const path = require('path');

// Simple .env parser
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
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

console.log('🔧 Testing Firebase Connection');
console.log('==============================\n');

console.log('Environment variables loaded:');
console.log('- FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
console.log('- FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
console.log('- FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);

if (process.env.FIREBASE_PRIVATE_KEY) {
  console.log('- Private key length:', process.env.FIREBASE_PRIVATE_KEY.length);
  console.log('- Private key starts with:', process.env.FIREBASE_PRIVATE_KEY.substring(0, 30));
}

try {
  const { initializeApp, getApps, cert } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");

  console.log('\n🔥 Initializing Firebase Admin...');
  
  let app;
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
  
  const db = getFirestore(app);
  console.log('✅ Firebase Admin initialized successfully');
  
  // Test Firestore connection
  console.log('\n📊 Testing Firestore connection...');
  const testCollection = db.collection('test');
  await testCollection.add({ test: true, timestamp: new Date() });
  console.log('✅ Successfully wrote to Firestore');
  
  // Check existing data
  console.log('\n🔍 Checking existing data...');
  const collections = ['users', 'merchants', 'events', 'nfts'];
  
  for (const collection of collections) {
    try {
      const snapshot = await db.collection(collection).limit(1).get();
      console.log(`  📊 ${collection}: ${snapshot.size > 0 ? 'Has data' : 'Empty'}`);
    } catch (error) {
      console.error(`  ❌ Error checking ${collection}:`, error.message);
    }
  }
  
  console.log('\n✅ Firebase connection test completed successfully!');
  
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
