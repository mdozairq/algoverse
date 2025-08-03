# NFT Marketplace V18 - Environment Setup Guide

This guide will help you set up all the required environment variables for the NFT Marketplace application.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script to automatically generate a `.env.local` file with secure defaults:

```bash
node scripts/setup-env.js
```

### Option 2: Manual Setup

1. Copy `env.local.example` to `.env.local`
2. Fill in your configuration values
3. Follow the setup instructions below

## 📋 Required Services

### 1. Firebase Configuration

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

#### Step 2: Add Web App
1. In your Firebase project, click the web icon (</>) to add a web app
2. Register your app with a nickname
3. Copy the configuration values

#### Step 3: Enable Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Optionally enable other providers as needed

#### Step 4: Set up Firestore Database
1. Go to Firestore Database
2. Create database in test mode
3. Choose a location close to your users

#### Step 5: Generate Service Account Key
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values for the admin SDK configuration

### 2. Algorand Blockchain Setup

#### Step 1: Create Testnet Wallets
1. Download [Pera Wallet](https://perawallet.app/) or use [MyAlgo](https://wallet.myalgo.com/)
2. Create testnet wallets for:
   - Platform fee collection
   - Platform escrow
   - Platform operations

#### Step 2: Get Testnet ALGO
1. Use the [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)
2. Fund your platform wallets with test ALGO

#### Step 3: Optional: Deploy Custom Marketplace App
If you want to use a custom marketplace application:
1. Use AlgoSDK to deploy your marketplace contract
2. Note the Application ID
3. Update `NEXT_PUBLIC_MARKETPLACE_APP_ID` in your `.env.local`

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `myproject.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `myproject-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `myproject-12345.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abcdef` |
| `FIREBASE_PROJECT_ID` | Firebase project ID (server-side) | `myproject-12345` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-xxx@myproject.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `FIREBASE_DATABASE_URL` | Firebase database URL | `https://myproject-default-rtdb.firebaseio.com` |
| `NEXT_PUBLIC_ALGORAND_NETWORK` | Algorand network | `testnet` or `mainnet` |
| `NEXT_PUBLIC_MARKETPLACE_APP_ID` | Custom marketplace app ID | `0` (default) |
| `PLATFORM_FEE_ADDRESS` | Platform fee wallet address | `ALGO...` |
| `PLATFORM_ESCROW_ADDRESS` | Platform escrow wallet address | `ALGO...` |
| `PLATFORM_WALLET_ADDRESS` | Platform operations wallet | `ALGO...` |
| `ADMIN_MASTER_KEY` | Admin access master key | `your_secure_key_here` |

### Optional Variables

| Variable | Description | When to use |
|----------|-------------|-------------|
| `JWT_SECRET` | JWT signing secret | If using JWT tokens |
| `SESSION_SECRET` | Session encryption secret | If using sessions |
| `COOKIE_SECRET` | Cookie encryption secret | If using encrypted cookies |
| `SENDGRID_API_KEY` | SendGrid API key | For email notifications |
| `AWS_ACCESS_KEY_ID` | AWS access key | For S3 file storage |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | For S3 file storage |
| `NEXT_PUBLIC_GA_TRACKING_ID` | Google Analytics ID | For analytics |

## 🔐 Security Best Practices

### 1. Environment File Security
- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore` file
- Use different values for development and production

### 2. Key Management
- Use strong, unique passwords and keys
- Rotate keys regularly (every 90 days)
- Store production keys in a secure vault (AWS Secrets Manager, Azure Key Vault, etc.)

### 3. Firebase Security Rules
```javascript
// Example Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Merchants can access their own data
    match /merchants/{merchantId} {
      allow read, write: if request.auth != null && request.auth.uid == merchantId;
    }
    
    // Public read access for events
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/merchants/$(request.auth.uid));
    }
  }
}
```

### 4. Algorand Wallet Security
- Use hardware wallets for production
- Keep private keys secure and offline
- Use multi-signature wallets for platform operations
- Regularly audit wallet balances and transactions

## 🧪 Testing Your Setup

### 1. Test Firebase Connection
```bash
npm run dev
```
Navigate to `/auth/admin` and try to log in with admin credentials.

### 2. Test Algorand Connection
Navigate to `/auth/user` and try to connect a wallet.

### 3. Test Merchant Registration
Navigate to `/auth/merchant` and try to submit a merchant application.

## 🚨 Troubleshooting

### Common Issues

#### Firebase Authentication Errors
- Verify all Firebase config values are correct
- Check that Authentication is enabled in Firebase console
- Ensure service account has proper permissions

#### Algorand Connection Issues
- Verify wallet addresses are valid Algorand addresses
- Check that you're using the correct network (testnet/mainnet)
- Ensure wallets have sufficient ALGO for transactions

#### Environment Variable Not Loading
- Restart your development server after changing `.env.local`
- Verify variable names match exactly (case-sensitive)
- Check that `.env.local` is in the project root

### Getting Help

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Check the [Algorand Documentation](https://developer.algorand.org/)
3. Review the application logs for detailed error messages
4. Open an issue in the project repository

## 📚 Additional Resources

- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

## 🔄 Production Deployment

When deploying to production:

1. Use production Firebase project
2. Switch to Algorand mainnet
3. Use production wallet addresses
4. Set `NODE_ENV=production`
5. Use secure key management services
6. Enable monitoring and logging
7. Set up proper CORS origins
8. Configure rate limiting
9. Set up SSL certificates
10. Enable security headers

---

**Need help?** Check the troubleshooting section or open an issue in the repository. 