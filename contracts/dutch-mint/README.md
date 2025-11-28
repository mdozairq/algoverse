# Dutch Payment Mechanism Smart Contract

This smart contract implements a Dutch-style payment system for NFT minting, where a predefined threshold of asset minting triggers payment and mint execution.

## Overview

The contract manages a queue of mint requests and ensures cost efficiency by:
- Requiring a minimum threshold (T) of assets before minting
- Locking funds in escrow until threshold is met
- Providing discounted bulk minting rates (C_effective vs C_base)
- Automatically triggering batch minting when threshold is reached
- Handling refunds if threshold isn't met within time window

## Contract Structure

### Global State
- `threshold` (uint64): Minimum number of assets required to trigger minting
- `queue_count` (uint64): Current number of assets in queue
- `base_cost` (uint64): Base minting cost per asset (in microAlgos)
- `effective_cost` (uint64): Effective cost per asset when threshold is met (in microAlgos)
- `platform_address` (bytes): Platform wallet address for receiving payments
- `escrow_address` (bytes): Escrow account address for holding locked funds
- `time_window` (uint64): Time window in seconds for threshold to be met
- `queue_start_time` (uint64): Timestamp when current queue started
- `total_escrowed` (uint64): Total amount escrowed in microAlgos

### Local State (per user)
- `request_count` (uint64): Number of assets requested by this user
- `escrowed_amount` (uint64): Amount escrowed by this user (in microAlgos)

## Methods

### 1. `init` - Initialize Contract
Initializes the contract with configuration parameters.

**Arguments:**
- `threshold`: Minimum number of assets (e.g., 100)
- `base_cost`: Base cost per asset in microAlgos (e.g., 10000 = 0.01 ALGO)
- `effective_cost`: Effective cost per asset in microAlgos (e.g., 7000 = 0.007 ALGO)
- `platform_address`: Platform wallet address (32 bytes)
- `escrow_address`: Escrow account address (32 bytes)
- `time_window`: Time window in seconds (e.g., 86400 = 24 hours)

### 2. `join_queue` - Join Minting Queue
Adds user's mint request to the queue and locks payment in escrow.

**Arguments:**
- `request_count`: Number of assets requested

**Transaction Group:**
- Transaction 0: Application call
- Transaction 1: Payment to escrow address (amount = request_count × effective_cost)

### 3. `trigger_mint` - Trigger Batch Minting
Triggers batch minting when threshold is met. Can only be called when queue_count >= threshold.

**Transaction Group (optional):**
- Transaction 0: Application call
- Transaction 1: Payment from escrow to platform (amount = queue_count × effective_cost)

### 4. `refund` - Request Refund
Allows users to request refund if time window expired and threshold not met.

**Transaction Group:**
- Transaction 0: Application call
- Transaction 1: Payment from escrow to user (amount = user's escrowed_amount)

### 5. `get_status` - Get Queue Status
Read-only method that returns queue status via logs.

**Returns (via logs):**
- queue_count
- threshold
- total_escrowed
- queue_start_time

## Deployment

### Option 1: Using API Endpoint (Recommended)

Deploy via API endpoint (requires admin/merchant role):

```bash
POST /api/marketplaces/{marketplaceId}/mint/dutch-queue/deploy
Content-Type: application/json

{
  "creatorPrivateKey": "your mnemonic phrase here",
  "threshold": 100,
  "baseCost": 0.01,
  "effectiveCost": 0.007,
  "platformAddress": "PLATFORM_WALLET_ADDRESS",
  "escrowAddress": "ESCROW_WALLET_ADDRESS",
  "timeWindow": 86400
}
```

### Option 2: Using Deployment Script

```bash
node scripts/deploy-dutch-mint.js <marketplaceId> "<creator mnemonic>"
```

Example:
```bash
node scripts/deploy-dutch-mint.js marketplace123 "word1 word2 word3 ... word25"
```

### Option 3: Manual Deployment (Using goal CLI)

1. Compile the TEAL programs:
```bash
goal app create --approval-prog approval.teal --clear-prog clear.teal \
  --global-byteslices 2 --global-ints 7 \
  --local-byteslices 0 --local-ints 2 \
  --app-arg int:100 \
  --app-arg int:10000 \
  --app-arg int:7000 \
  --app-arg addr:PLATFORM_ADDRESS \
  --app-arg addr:ESCROW_ADDRESS \
  --app-arg int:86400 \
  --from CREATOR_ADDRESS
```

2. Fund the escrow account with minimum balance (0.1 ALGO recommended)

3. Update marketplace in Firestore:
```javascript
await db.collection('marketplaces').doc(marketplaceId).update({
  dutchMintAppId: <appId>,
  dutchMintConfig: {
    threshold: 100,
    baseCost: 0.01,
    effectiveCost: 0.007,
    platformAddress: "...",
    escrowAddress: "...",
    timeWindow: 86400
  }
})
```

### Required Environment Variables

Add to your `.env.local`:
```bash
# Escrow account private key (mnemonic) for signing refund/trigger transactions
DUTCH_MINT_ESCROW_PRIVATE_KEY="your escrow mnemonic here"

# Platform addresses (optional, can be passed in deployment)
PLATFORM_FEE_ADDRESS="your platform wallet address"
PLATFORM_ESCROW_ADDRESS="your escrow wallet address"
```

## Usage Flow

1. **User joins queue**: User calls `join_queue` with payment to escrow
2. **Queue builds**: System monitors queue_count
3. **Threshold met**: When queue_count >= threshold, anyone can call `trigger_mint`
4. **Batch minting**: Platform executes batch minting for all queued assets
5. **Payment release**: Escrow releases payment to platform
6. **Refund (if needed)**: If time expires without threshold, users can call `refund`

## Security Considerations

- Escrow account must be properly secured
- Platform address should be a multisig or secure wallet
- Time window prevents indefinite locking of funds
- All state changes are atomic via transaction groups
- Users can only refund their own escrowed amounts

## Cost Efficiency

- **Individual minting**: C_base = 0.01 ALGO per NFT
- **Bulk minting**: C_effective = 0.007 ALGO per NFT (30% discount)
- **Gas savings**: Batch transactions reduce per-transaction fees
- **Trust**: Transparent smart contract logic ensures funds only used when threshold met

