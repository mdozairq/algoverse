/**
 * Helper script to generate a new Algorand account with mnemonic
 * 
 * Usage:
 *   node scripts/generate-algorand-account.js
 * 
 * This will generate a new Algorand account and display:
 *   - Address
 *   - Mnemonic (25 words)
 *   - Private key (base64)
 * 
 * ⚠️  SECURITY WARNING: Keep the mnemonic safe! Anyone with it can control the account.
 */

const algosdk = require('algosdk')

function generateAlgorandAccount() {
  try {
    console.log('🔐 Generating new Algorand account...\n')
    
    // Generate new account
    const account = algosdk.generateAccount()
    
    // Get mnemonic
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk)
    
    console.log('✅ Account generated successfully!\n')
    console.log('=' .repeat(60))
    console.log('📋 ACCOUNT DETAILS')
    console.log('=' .repeat(60))
    console.log(`\n📍 Address:`)
    console.log(`   ${account.addr}\n`)
    
    console.log(`🔑 Mnemonic (25 words):`)
    console.log(`   ${mnemonic}\n`)
    
    console.log(`🔐 Private Key (base64):`)
    console.log(`   ${Buffer.from(account.sk).toString('base64')}\n`)
    
    console.log('=' .repeat(60))
    console.log('⚠️  SECURITY WARNING')
    console.log('=' .repeat(60))
    console.log('   - Keep this mnemonic SECRET and SAFE!')
    console.log('   - Anyone with the mnemonic can control this account')
    console.log('   - Never share it or commit it to version control')
    console.log('   - Store it in a secure password manager or hardware wallet\n')
    
    console.log('💡 To use this account:')
    console.log(`   1. Fund it with ALGO (use testnet dispenser: https://testnet.algoexplorer.io/dispenser)`)
    console.log(`   2. Use the mnemonic in deployment scripts\n`)
    
    return {
      address: account.addr,
      mnemonic: mnemonic,
      privateKey: Buffer.from(account.sk).toString('base64')
    }
  } catch (error) {
    console.error('❌ Error generating account:', error.message)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  try {
    generateAlgorandAccount()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Failed to generate account')
    process.exit(1)
  }
}

module.exports = { generateAlgorandAccount }

