/**
 * Script to check and verify Dutch mint contract state
 * 
 * Usage:
 *   node scripts/check-dutch-contract-state.js <appId>
 */

require('dotenv').config({ path: '.env.local' })
const algosdk = require('algosdk')

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443') || 443

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

async function checkContractState(appId) {
  try {
    console.log(`\n🔍 Checking contract state for app ID: ${appId}\n`)
    
    const appInfo = await algodClient.getApplicationByID(appId).do()
    const globalState = appInfo.params.globalState || []
    
    console.log('Global State:')
    console.log('=' .repeat(60))
    
    if (globalState.length === 0) {
      console.log('❌ No global state found! Contract was not properly initialized.')
      console.log('\n💡 Solution: The contract needs to be redeployed or reinitialized.')
      return
    }
    
    const stateMap = {}
    globalState.forEach((state) => {
      const key = typeof state.key === 'string'
        ? Buffer.from(state.key, 'base64').toString()
        : Buffer.from(state.key).toString('utf-8')
      
      if (state.value.type === 1) {
        // uint64
        stateMap[key] = state.value.uint
        console.log(`  ${key}: ${state.value.uint}`)
      } else if (state.value.type === 2) {
        // bytes
        const bytes = typeof state.value.bytes === 'string'
          ? Buffer.from(state.value.bytes, 'base64')
          : new Uint8Array(state.value.bytes)
        
        if (bytes.length === 0) {
          console.log(`  ${key}: (empty bytes)`)
          stateMap[key] = null
        } else if (bytes.length === 32) {
          // Try to decode as address
          try {
            const address = algosdk.encodeAddress(bytes)
            stateMap[key] = address
            console.log(`  ${key}: ${address}`)
          } catch (error) {
            console.log(`  ${key}: (invalid address, length: ${bytes.length})`)
            stateMap[key] = null
          }
        } else {
          console.log(`  ${key}: (bytes, length: ${bytes.length})`)
          stateMap[key] = null
        }
      }
    })
    
    console.log('\n' + '=' .repeat(60))
    console.log('\n✅ Required State Values:')
    
    const required = {
      'threshold': stateMap['threshold'],
      'base_cost': stateMap['base_cost'],
      'effective_cost': stateMap['effective_cost'],
      'platform_address': stateMap['platform_address'],
      'escrow_address': stateMap['escrow_address'],
      'time_window': stateMap['time_window'],
      'queue_count': stateMap['queue_count'] || 0,
      'total_escrowed': stateMap['total_escrowed'] || 0,
      'queue_start_time': stateMap['queue_start_time'] || 0,
    }
    
    let allPresent = true
    for (const [key, value] of Object.entries(required)) {
      if (value === undefined || value === null) {
        console.log(`  ❌ ${key}: MISSING`)
        allPresent = false
      } else {
        console.log(`  ✅ ${key}: ${value}`)
      }
    }
    
    if (!allPresent) {
      console.log('\n❌ Contract state is incomplete!')
      console.log('💡 Solution: Redeploy the contract using:')
      console.log('   node scripts/deploy-dutch-mint.js <marketplaceId> "<mnemonic>"')
    } else {
      console.log('\n✅ All required state values are present!')
    }
    
  } catch (error) {
    console.error('❌ Error checking contract state:', error.message)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  const appId = process.argv[2]
  
  if (!appId) {
    console.error('Usage: node scripts/check-dutch-contract-state.js <appId>')
    process.exit(1)
  }
  
  checkContractState(parseInt(appId))
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error.message)
      process.exit(1)
    })
}

module.exports = { checkContractState }

