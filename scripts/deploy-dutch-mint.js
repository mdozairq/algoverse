/**
 * Script to deploy Dutch Mint Contract for a marketplace
 * 
 * This script uses the API endpoint instead of direct imports to avoid TypeScript issues
 * 
 * Usage:
 *   node scripts/deploy-dutch-mint.js <marketplaceId> <creatorMnemonic> [options]
 * 
 * Example:
 *   node scripts/deploy-dutch-mint.js marketplace123 "word1 word2 ... word25"
 * 
 * Environment Variables Required:
 *   - NEXT_PUBLIC_ALGORAND_NETWORK (default: testnet)
 *   - ALGOD_TOKEN
 *   - ALGOD_SERVER
 *   - ALGOD_PORT
 *   - PLATFORM_FEE_ADDRESS
 *   - PLATFORM_ESCROW_ADDRESS
 */

require('dotenv').config({ path: '.env.local' })
const admin = require('firebase-admin')
const algosdk = require('algosdk')
const fs = require('fs').promises
const path = require('path')

// Initialize Firebase Admin
let db
async function initFirebase() {
  if (!admin.apps.length) {
    try {
      // Try to use environment variables first
      if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        })
      } else {
        // Try to load from service account file
        const serviceAccountPath = path.join(__dirname, '../service-account-key.json')
        const serviceAccount = require(serviceAccountPath)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        })
      }
      db = admin.firestore()
      console.log('✅ Firebase initialized')
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error.message)
      console.error('Please set FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, and FIREBASE_CLIENT_EMAIL in .env.local')
      process.exit(1)
    }
  } else {
    db = admin.firestore()
  }
}

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443') || 443

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

// Utility functions
function algosToMicroAlgos(algos) {
  return Math.round(algos * 1000000)
}

async function compileProgram(programSource) {
  const compileResponse = await algodClient.compile(programSource).do()
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"))
}

async function getApprovalProgram() {
  const programPath = path.join(__dirname, '../contracts/dutch-mint/approval.teal')
  return await fs.readFile(programPath, 'utf-8')
}

async function getClearProgram() {
  const programPath = path.join(__dirname, '../contracts/dutch-mint/clear.teal')
  return await fs.readFile(programPath, 'utf-8')
}

async function deployContract(creatorMnemonic, config) {
  try {
    // Validate mnemonic format
    if (!creatorMnemonic || typeof creatorMnemonic !== 'string') {
      throw new Error('Mnemonic must be a string')
    }

    const words = creatorMnemonic.trim().split(/\s+/)
    if (words.length !== 25) {
      throw new Error(`Invalid mnemonic length: expected 25 words, got ${words.length}. Make sure the mnemonic is space-separated and quoted.`)
    }

    console.log(`🔐 Validating mnemonic (${words.length} words)...`)
    
    // Try to convert mnemonic to secret key
    let creatorAccount
    try {
      creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic.trim())
      console.log(`✅ Mnemonic validated. Address: ${creatorAccount.addr}`)
    } catch (error) {
      console.error('\n❌ Invalid Algorand mnemonic!')
      console.error('   The mnemonic must be a valid Algorand mnemonic (25 words from BIP39 word list).')
      console.error('   Common issues:')
      console.error('   - Mnemonic is from a different blockchain (Ethereum, Bitcoin, etc.)')
      console.error('   - Words are misspelled or not from BIP39 word list')
      console.error('   - Checksum is invalid')
      console.error('\n   To generate a valid Algorand mnemonic:')
      console.error('   1. Use Algorand wallet (Pera, MyAlgo, etc.)')
      console.error('   2. Or use: algosdk.generateAccount()')
      console.error('\n   Error details:', error.message)
      throw new Error(`Invalid Algorand mnemonic: ${error.message}`)
    }

    // Check account balance
    console.log(`💰 Checking account balance...`)
    try {
      const accountInfo = await algodClient.accountInformation(creatorAccount.addr).do()
      const balance = Number(accountInfo.amount)
      const balanceAlgos = balance / 1000000
      
      console.log(`   Current balance: ${balanceAlgos.toFixed(6)} ALGO (${balance} microAlgos)`)
      
      // Estimate required balance for deployment
      // Application creation: ~0.1 ALGO (100,000 microAlgos) minimum balance
      // Transaction fees: ~0.001 ALGO (1,000 microAlgos)
      // Total: ~0.101 ALGO
      const minRequiredBalance = 101000 // 0.101 ALGO in microAlgos
      
      if (balance < minRequiredBalance) {
        const network = process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'testnet'
        const dispenserUrl = network === 'testnet' 
          ? 'https://testnet.algoexplorer.io/dispenser'
          : 'https://bank.testnet.algorand.network/'
        
        console.error(`\n❌ Insufficient balance!`)
        console.error(`   Required: ${(minRequiredBalance / 1000000).toFixed(6)} ALGO`)
        console.error(`   Current: ${balanceAlgos.toFixed(6)} ALGO`)
        console.error(`   Needed: ${((minRequiredBalance - balance) / 1000000).toFixed(6)} ALGO`)
        console.error(`\n💡 To fund your account:`)
        console.error(`   1. Go to: ${dispenserUrl}`)
        console.error(`   2. Enter address: ${creatorAccount.addr}`)
        console.error(`   3. Request at least 0.2 ALGO (recommended: 1 ALGO)`)
        console.error(`   4. Wait for confirmation, then run this script again\n`)
        throw new Error(`Insufficient balance. Account needs at least ${(minRequiredBalance / 1000000).toFixed(6)} ALGO`)
      }
      
      console.log(`✅ Account has sufficient balance`)
    } catch (error) {
      if (error.message.includes('Insufficient balance')) {
        throw error
      }
      console.warn(`⚠️  Could not check balance: ${error.message}`)
      console.warn(`   Proceeding anyway, but deployment may fail if balance is insufficient`)
    }

    // Read and compile TEAL programs
    console.log('📄 Reading TEAL programs...')
    const approvalProgram = await getApprovalProgram()
    const clearProgram = await getClearProgram()

    console.log('🔨 Compiling TEAL programs...')
    const approvalCompiled = await compileProgram(approvalProgram)
    const clearCompiled = await compileProgram(clearProgram)

    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create application creation transaction
    const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
      sender: creatorAccount.addr,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: approvalCompiled,
      clearProgram: clearCompiled,
      numGlobalByteSlices: 2,
      numGlobalInts: 7,
      numLocalByteSlices: 0,
      numLocalInts: 2,
      appArgs: [
        new Uint8Array([0x69, 0x6e, 0x69, 0x74]), // "init"
        algosdk.encodeUint64(config.threshold),
        algosdk.encodeUint64(algosToMicroAlgos(config.baseCost)),
        algosdk.encodeUint64(algosToMicroAlgos(config.effectiveCost)),
        algosdk.decodeAddress(config.platformAddress).publicKey,
        algosdk.decodeAddress(config.escrowAddress).publicKey,
        algosdk.encodeUint64(config.timeWindow),
      ],
    })

    // Sign and submit
    console.log('📝 Signing and submitting transaction...')
    const signedTxn = appCreateTxn.signTxn(creatorAccount.sk)
    const result = await algodClient.sendRawTransaction(signedTxn).do()
    const txId = result.txid

    console.log(`⏳ Waiting for confirmation (tx: ${txId})...`)
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
    const appId = Number(confirmedTxn.applicationIndex)

    // Initialize the queue
    console.log('🔧 Initializing queue...')
    const initParams = await algodClient.getTransactionParams().do()
    const initTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: creatorAccount.addr,
      suggestedParams: initParams,
      appIndex: appId,
      appArgs: [new Uint8Array([0x69, 0x6e, 0x69, 0x74])],
    })
    const initTxId = initTxn.txID()
    const signedInitTxn = initTxn.signTxn(creatorAccount.sk)
    await algodClient.sendRawTransaction(signedInitTxn).do()
    await algosdk.waitForConfirmation(algodClient, initTxId, 4)

    return {
      appId,
      transactionId: txId,
    }
  } catch (error) {
    console.error('Error deploying contract:', error)
    throw error
  }
}

async function deployDutchMint(marketplaceId, creatorMnemonic, config = {}) {
  try {
    await initFirebase()

    console.log(`\n🚀 Deploying Dutch Mint Contract for marketplace: ${marketplaceId}\n`)

    // Get marketplace
    const marketplaceDoc = await db.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      throw new Error(`Marketplace ${marketplaceId} not found`)
    }

    const marketplace = marketplaceDoc.data()
    
    if (marketplace.dutchMintAppId) {
      console.log(`⚠️  Marketplace already has Dutch mint contract: ${marketplace.dutchMintAppId}`)
      console.log(`🗑️  Deleting existing contract...`)
      
      try {
        // Delete the existing contract
        const existingAppId = marketplace.dutchMintAppId
        const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic)
        
        const suggestedParams = await algodClient.getTransactionParams().do()
        const deleteTxn = algosdk.makeApplicationDeleteTxnFromObject({
          sender: creatorAccount.addr,
          suggestedParams,
          appIndex: existingAppId,
        })
        
        const signedDeleteTxn = deleteTxn.signTxn(creatorAccount.sk)
        const deleteResult = await algodClient.sendRawTransaction(signedDeleteTxn).do()
        const deleteTxId = deleteResult.txid
        
        console.log(`⏳ Waiting for deletion confirmation (tx: ${deleteTxId})...`)
        await algosdk.waitForConfirmation(algodClient, deleteTxId, 4)
        console.log(`✅ Existing contract deleted successfully`)
        
        // Clear the appId from marketplace
        await db.collection('marketplaces').doc(marketplaceId).update({
          dutchMintAppId: null,
          updatedAt: new Date(),
        })
      } catch (error) {
        console.error(`❌ Error deleting existing contract:`, error.message)
        console.log(`⚠️  Continuing with deployment anyway...`)
      }
    }

    // Default configuration
    const deployConfig = {
      threshold: config.threshold || 100,
      baseCost: config.baseCost || 0.01,
      effectiveCost: config.effectiveCost || 0.007,
      platformAddress: config.platformAddress || process.env.PLATFORM_FEE_ADDRESS,
      escrowAddress: config.escrowAddress || process.env.PLATFORM_ESCROW_ADDRESS,
      timeWindow: config.timeWindow || 86400,
    }

    // Validate addresses
    if (!deployConfig.platformAddress || !deployConfig.escrowAddress) {
      throw new Error('Platform address and escrow address are required. Set PLATFORM_FEE_ADDRESS and PLATFORM_ESCROW_ADDRESS in .env.local or pass them as config.')
    }
    console.log(deployConfig);
    

    if (!algosdk.isValidAddress(deployConfig.platformAddress)) {
      throw new Error('Invalid platform address')
    }

    if (!algosdk.isValidAddress(deployConfig.escrowAddress)) {
      throw new Error('Invalid escrow address')
    }

    console.log('📋 Configuration:')
    console.log(`   Threshold: ${deployConfig.threshold} NFTs`)
    console.log(`   Base Cost: ${deployConfig.baseCost} ALGO`)
    console.log(`   Effective Cost: ${deployConfig.effectiveCost} ALGO`)
    console.log(`   Platform Address: ${deployConfig.platformAddress}`)
    console.log(`   Escrow Address: ${deployConfig.escrowAddress}`)
    console.log(`   Time Window: ${deployConfig.timeWindow} seconds (${deployConfig.timeWindow / 3600} hours)\n`)

    // Deploy contract
    const result = await deployContract(creatorMnemonic, deployConfig)

    console.log(`\n✅ Contract deployed successfully!`)
    console.log(`   App ID: ${result.appId}`)
    console.log(`   Transaction ID: ${result.transactionId}`)

    // Update marketplace
    await db.collection('marketplaces').doc(marketplaceId).update({
      dutchMintAppId: result.appId,
      dutchMintConfig: {
        ...deployConfig,
        deployedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`✅ Marketplace configured with Dutch mint contract`)
    console.log(`\n🎉 You can now use the Dutch auction feature on the mint page!\n`)

    return result.appId
  } catch (error) {
    console.error('\n❌ Error deploying contract:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  const marketplaceId = process.argv[2]
  let creatorMnemonic = process.argv[3]

  // Try to get from environment variable if not provided
  if (!creatorMnemonic) {
    creatorMnemonic = process.env.CREATOR_MNEMONIC
  }

  if (!marketplaceId || !creatorMnemonic) {
    console.error('❌ Usage: node scripts/deploy-dutch-mint.js <marketplaceId> <creatorMnemonic>')
    console.error('   Example: node scripts/deploy-dutch-mint.js marketplace123 "word1 word2 ... word25"')
    console.error('\n   Or set CREATOR_MNEMONIC environment variable:')
    console.error('   CREATOR_MNEMONIC="word1 word2 ... word25" node scripts/deploy-dutch-mint.js marketplace123')
    console.error('\n   Required environment variables:')
    console.error('   - PLATFORM_FEE_ADDRESS (or pass in config)')
    console.error('   - PLATFORM_ESCROW_ADDRESS (or pass in config)')
    console.error('   - FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL')
    console.error('   - CREATOR_MNEMONIC (optional, can be passed as argument)')
    process.exit(1)
  }

  // Trim and validate mnemonic
  creatorMnemonic = creatorMnemonic.trim()
  const wordCount = creatorMnemonic.split(/\s+/).length
  if (wordCount !== 25) {
    console.error(`❌ Invalid mnemonic: expected 25 words, got ${wordCount}`)
    console.error('   Make sure the mnemonic is properly quoted and has spaces between words')
    console.error('   Example: "word1 word2 word3 ... word25"')
    process.exit(1)
  }

  deployDutchMint(marketplaceId, creatorMnemonic)
    .then((appId) => {
      console.log(`✅ Deployment complete! App ID: ${appId}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error(`\n❌ Deployment failed:`, error.message)
      process.exit(1)
    })
}

module.exports = { deployDutchMint }
