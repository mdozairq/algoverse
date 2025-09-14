#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔧 NFT Marketplace V18 - Environment Setup');
console.log('==========================================\n');

// Generate secure random strings
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('base64');
}

// Create .env.local file
function createEnvFile() {
  const envContent = `# =============================================================================
# NFT MARKETPLACE V18 - ENVIRONMENT VARIABLES
# Generated on: ${new Date().toISOString()}
# =============================================================================

# =============================================================================
# FIREBASE CONFIGURATION (Client-side - NEXT_PUBLIC_)
# =============================================================================
# Get these from your Firebase project settings > General > Your apps > Web app
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# =============================================================================
# FIREBASE ADMIN SDK (Server-side only)
# =============================================================================
# Get these from Firebase project settings > Service accounts > Generate new private key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour private key here\\n-----END PRIVATE KEY-----\\n"
FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com

# =============================================================================
# ALGORAND BLOCKCHAIN CONFIGURATION
# =============================================================================
# Network: "mainnet" or "testnet"
NEXT_PUBLIC_ALGORAND_NETWORK=testnet

# Your Algorand Application ID (if you have a custom marketplace app)
NEXT_PUBLIC_MARKETPLACE_APP_ID=0

# Platform wallet addresses (for fee collection and escrow)
PLATFORM_FEE_ADDRESS=your_platform_fee_wallet_address
PLATFORM_ESCROW_ADDRESS=your_platform_escrow_wallet_address
PLATFORM_WALLET_ADDRESS=your_platform_wallet_address

# =============================================================================
# ADMINISTRATION
# =============================================================================
# Master key for admin access (change this to a secure value)
ADMIN_MASTER_KEY=${generateSecureString(16)}

# =============================================================================
# SECURITY & SESSION MANAGEMENT
# =============================================================================
# JWT Secret for session management (generate a secure random string)
JWT_SECRET=${generateJWTSecret()}

# Session cookie settings
SESSION_SECRET=${generateSecureString(32)}
COOKIE_SECRET=${generateSecureString(32)}

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================
NODE_ENV=development

# =============================================================================
# OPTIONAL SERVICES (uncomment and configure as needed)
# =============================================================================

# Email Service (SendGrid)
# SENDGRID_API_KEY=your_sendgrid_api_key
# SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# File Storage (AWS S3)
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your_nft_bucket_name

# Analytics
# NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# =============================================================================
# NOTES:
# =============================================================================
# 1. Replace "your_*" values with your actual configuration
# 2. Never commit .env.local to version control
# 3. Use different values for development and production
# 4. Keep your secrets secure and rotate them regularly
# =============================================================================
`;

  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, envPath + '.backup');
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with secure defaults');
  console.log('📝 Please update the Firebase and Algorand configuration values');
}

// Main execution
try {
  createEnvFile();
  
  console.log('\n📋 Next Steps:');
  console.log('1. Create a Firebase project at https://console.firebase.google.com/');
  console.log('2. Add a web app to your Firebase project');
  console.log('3. Copy the Firebase config values to .env.local');
  console.log('4. Generate a service account key for Firebase Admin SDK');
  console.log('5. Create Algorand testnet wallets for platform addresses');
  console.log('6. Update the wallet addresses in .env.local');
  console.log('7. Run "npm run dev" to start the development server');
  
  console.log('\n🔐 Security Notes:');
  console.log('- Admin master key has been generated automatically');
  console.log('- JWT and session secrets have been generated automatically');
  console.log('- Keep these values secure and never share them');
  console.log('- Use different values for production environments');
  
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  process.exit(1);
}
