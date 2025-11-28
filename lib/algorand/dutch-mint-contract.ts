import algosdk from 'algosdk'

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443') || 443

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

// Utility functions
const algosToMicroAlgos = (algos: number): number => {
  return Math.round(algos * 1000000)
}

const microAlgosToAlgos = (microAlgos: number): number => {
  return microAlgos / 1000000
}

// Compile TEAL program
const compileProgram = async (programSource: string): Promise<Uint8Array> => {
  const compileResponse = await algodClient.compile(programSource).do()
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"))
}

export interface DutchMintConfig {
  threshold: number // Minimum number of assets required
  baseCost: number // Base cost per asset in ALGO
  effectiveCost: number // Effective cost per asset in ALGO (when threshold met)
  platformAddress: string // Platform wallet address
  escrowAddress: string // Escrow account address
  timeWindow: number // Time window in seconds (e.g., 86400 for 24 hours)
}

export interface QueueStatus {
  queueCount: number
  threshold: number
  totalEscrowed: number
  queueStartTime: number
  timeRemaining?: number
  thresholdMet: boolean
  canTrigger: boolean
  canRefund: boolean
  effectiveCost?: number
  baseCost?: number
}

export interface JoinQueueParams {
  userAddress: string
  requestCount: number
  appId: number
  effectiveCost?: number // Optional: if provided, use this instead of reading from contract
  escrowAddress?: string // Optional: if provided, use this instead of reading from contract
}

export interface TriggerMintParams {
  callerAddress: string
  appId: number
  escrowPrivateKey: string // Private key for escrow account to send payment
}

export interface RefundParams {
  userAddress: string
  appId: number
  escrowPrivateKey: string // Private key for escrow account to send refund
}

export class DutchMintContract {
  /**
   * Deploy the Dutch mint smart contract
   */
  static async deployContract(
    creatorPrivateKey: string,
    config: DutchMintConfig
  ): Promise<{
    appId: number
    transactionId: string
  }> {
    try {
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorPrivateKey)

      // Read and compile TEAL programs
      const approvalProgram = await this.getApprovalProgram()
      const clearProgram = await this.getClearProgram()

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
        numGlobalByteSlices: 2, // platform_address, escrow_address
        numGlobalInts: 7, // threshold, queue_count, base_cost, effective_cost, time_window, queue_start_time, total_escrowed
        numLocalByteSlices: 0,
        numLocalInts: 2, // request_count, escrowed_amount
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
      const signedTxn = appCreateTxn.signTxn(creatorAccount.sk)
      const result = await algodClient.sendRawTransaction(signedTxn).do()
      const txId = result.txid

      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
      const appId = Number(confirmedTxn.applicationIndex)

      // Initialize the queue
      await this.initializeQueue(creatorAccount.addr.toString(), creatorAccount.sk, appId)

      return {
        appId,
        transactionId: txId,
      }
    } catch (error) {
      console.error('Error deploying Dutch mint contract:', error)
      throw new Error('Failed to deploy contract')
    }
  }

  /**
   * Initialize the queue (set start time if not set)
   */
  static async initializeQueue(
    callerAddress: string,
    callerPrivateKey: Uint8Array,
    appId: number
  ): Promise<string> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      const initTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: callerAddress,
        suggestedParams,
        appIndex: appId,
        appArgs: [new Uint8Array(Buffer.from("init"))], // "init" as ASCII bytes
      })

      const signedTxn = initTxn.signTxn(callerPrivateKey)
      const result = await algodClient.sendRawTransaction(signedTxn).do()
      const txId = result.txid

      await algosdk.waitForConfirmation(algodClient, txId, 4)
      return txId
    } catch (error) {
      console.error('Error initializing queue:', error)
      throw new Error('Failed to initialize queue')
    }
  }

  /**
   * Check if account has opted in to the application
   */
  static async isOptedIn(userAddress: string, appId: number): Promise<boolean> {
    try {
      const accountInfo = await algodClient.accountInformation(userAddress).do()
      const apps = accountInfo.appsLocalState || []
      const isOptedIn = apps.some((app: any) => app.id === appId)
      console.log(`Opt-in check for ${userAddress} to app ${appId}: ${isOptedIn}`)
      return isOptedIn
    } catch (error: any) {
      console.error('Error checking opt-in status:', error)
      // If account doesn't exist or other error, assume not opted in
      // But log the error for debugging
      if (error.message && error.message.includes('does not exist')) {
        return false
      }
      // For other errors, throw to surface the issue
      throw new Error(`Failed to check opt-in status: ${error.message || error}`)
    }
  }

  /**
   * Create opt-in transaction for the application
   */
  static async createOptInTransaction(userAddress: string, appId: number): Promise<algosdk.Transaction> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
        sender: userAddress,
        appIndex: appId,
        suggestedParams,
      })
      return optInTxn
    } catch (error) {
      console.error('Error creating opt-in transaction:', error)
      throw new Error('Failed to create opt-in transaction')
    }
  }

  /**
   * Join the minting queue
   */
  static async joinQueue(params: JoinQueueParams): Promise<{
    transactions: algosdk.Transaction[]
    groupId: string
    needsOptIn: boolean
  }> {
    try {
      // Check if account has opted in
      const isOptedIn = await this.isOptedIn(params.userAddress, params.appId)
      
      // Check account balance before creating transactions
      const accountInfo = await algodClient.accountInformation(params.userAddress).do()
      const accountBalance = Number(accountInfo.amount)
      
      // Calculate required balance: payment amount + transaction fees
      // If not opted in, need fees for 3 transactions (opt-in + app call + payment)
      // If opted in, need fees for 2 transactions (app call + payment)
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Get effective cost - use provided value or read from contract
      let effectiveCostMicroAlgos: number
      if (params.effectiveCost !== undefined) {
        effectiveCostMicroAlgos = params.effectiveCost
      } else {
        try {
          effectiveCostMicroAlgos = await this.getEffectiveCost(params.appId)
        } catch (error) {
          console.error("Error getting effective cost from contract:", error)
          throw new Error("Failed to get effective cost from contract. Please provide effectiveCost in params or ensure contract is properly initialized.")
        }
      }

      const paymentAmount = effectiveCostMicroAlgos * params.requestCount
      const transactionFee = isOptedIn ? 2000 : 3000 // 2 or 3 transactions
      const minRequiredBalance = paymentAmount + transactionFee
      
      if (accountBalance < minRequiredBalance) {
        throw new Error(
          `Insufficient balance. Account has ${accountBalance / 1000000} ALGO but needs at least ${minRequiredBalance / 1000000} ALGO ` +
          `(${paymentAmount / 1000000} ALGO for payment + ${transactionFee / 1000000} ALGO for fees). ` +
          `Please fund your account with testnet ALGO from https://testnet.algoexplorer.io/dispenser`
        )
      }

      // Get escrow address - use provided value or read from contract
      let escrowAddress: string
      if (params.escrowAddress) {
        escrowAddress = params.escrowAddress
      } else {
        try {
          escrowAddress = await this.getEscrowAddress(params.appId)
        } catch (error) {
          console.error("Error getting escrow address from contract:", error)
          throw new Error("Failed to get escrow address from contract. Please provide escrowAddress in params or ensure contract is properly initialized.")
        }
      }

      // Create transactions array
      const transactions: algosdk.Transaction[] = []

      // Add opt-in transaction if needed
      if (!isOptedIn) {
        const optInTxn = await this.createOptInTransaction(params.userAddress, params.appId)
        transactions.push(optInTxn)
      }

      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: params.userAddress,
        suggestedParams,
        appIndex: params.appId,
        appArgs: [
          new Uint8Array(Buffer.from("join_queue")), // "join_queue" as ASCII bytes
          algosdk.encodeUint64(params.requestCount),
        ],
      })
      transactions.push(appCallTxn)

      // Create payment transaction to escrow
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: params.userAddress,
        receiver: escrowAddress,
        amount: paymentAmount,
        suggestedParams,
        note: new TextEncoder().encode(`Dutch Mint Queue: ${params.requestCount} assets`),
      })
      transactions.push(paymentTxn)

      // Group all transactions
      algosdk.assignGroupID(transactions)
      const groupId = Buffer.from(transactions[0].group!).toString('base64')

      return {
        transactions,
        groupId,
        needsOptIn: !isOptedIn,
      }
    } catch (error) {
      console.error('Error creating join queue transaction:', error)
      throw new Error('Failed to create join queue transaction')
    }
  }

  /**
   * Trigger batch minting (when threshold is met)
   */
  static async triggerMint(params: TriggerMintParams): Promise<{
    transactions: algosdk.Transaction[]
    groupId: string
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Get queue status
      const status = await this.getQueueStatus(params.appId)
      if (!status.canTrigger) {
        throw new Error('Threshold not met or queue not ready')
      }

      const platformAddress = await this.getPlatformAddress(params.appId)
      const totalCost = status.totalEscrowed

      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: params.callerAddress,
        suggestedParams,
        appIndex: params.appId,
        appArgs: [new Uint8Array(Buffer.from("trigger_mint"))], // "trigger_mint" as ASCII bytes
      })

      // Create payment transaction from escrow to platform
      const escrowAccount = algosdk.mnemonicToSecretKey(params.escrowPrivateKey)
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: escrowAccount.addr,
        receiver: platformAddress,
        amount: totalCost,
        suggestedParams,
        note: new TextEncoder().encode(`Dutch Mint Payment: ${status.queueCount} assets`),
      })

      // Group transactions
      algosdk.assignGroupID([appCallTxn, paymentTxn])
      const groupId = Buffer.from(appCallTxn.group!).toString('base64')

      return {
        transactions: [appCallTxn, paymentTxn],
        groupId,
      }
    } catch (error) {
      console.error('Error creating trigger mint transaction:', error)
      throw new Error('Failed to create trigger mint transaction')
    }
  }

  /**
   * Request refund (if time expired and threshold not met)
   */
  static async requestRefund(params: RefundParams): Promise<{
    transactions: algosdk.Transaction[]
    groupId: string
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Get user's escrowed amount
      const userEscrowed = await this.getUserEscrowedAmount(params.userAddress, params.appId)
      if (userEscrowed === 0) {
        throw new Error('No escrowed amount to refund')
      }

      // Verify refund conditions
      const status = await this.getQueueStatus(params.appId)
      if (!status.canRefund) {
        throw new Error('Refund conditions not met (time not expired or threshold already met)')
      }

      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: params.userAddress,
        suggestedParams,
        appIndex: params.appId,
        appArgs: [new Uint8Array(Buffer.from("refund"))], // "refund" as ASCII bytes
      })

      // Create payment transaction from escrow to user
      const escrowAccount = algosdk.mnemonicToSecretKey(params.escrowPrivateKey)
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: escrowAccount.addr,
        receiver: params.userAddress,
        amount: userEscrowed,
        suggestedParams,
        note: new TextEncoder().encode('Dutch Mint Refund'),
      })

      // Group transactions
      algosdk.assignGroupID([appCallTxn, paymentTxn])
      const groupId = Buffer.from(appCallTxn.group!).toString('base64')

      return {
        transactions: [appCallTxn, paymentTxn],
        groupId,
      }
    } catch (error) {
      console.error('Error creating refund transaction:', error)
      throw new Error('Failed to create refund transaction')
    }
  }

  /**
   * Get queue status
   */
  static async getQueueStatus(appId: number): Promise<QueueStatus> {
    try {
      const appInfo = await algodClient.getApplicationByID(appId).do()
      const globalState = appInfo.params.globalState || []

      // Parse global state
      const stateMap: Record<string, any> = {}
      globalState.forEach((state: any) => {
        const key = typeof state.key === 'string'
          ? Buffer.from(state.key, 'base64').toString()
          : Buffer.from(state.key).toString('utf-8')
        if (state.value.type === 1) {
          // uint64
          stateMap[key] = state.value.uint
        } else if (state.value.type === 2) {
          // bytes
          stateMap[key] = typeof state.value.bytes === 'string'
            ? Buffer.from(state.value.bytes, 'base64')
            : new Uint8Array(state.value.bytes)
        }
      })

      const queueCount = Number(stateMap['queue_count'] || 0)
      const threshold = Number(stateMap['threshold'] || 0)
      const totalEscrowed = Number(stateMap['total_escrowed'] || 0)
      const queueStartTime = Number(stateMap['queue_start_time'] || 0)
      const timeWindow = Number(stateMap['time_window'] || 0)
      const effectiveCost = Number(stateMap['effective_cost'] || 0)
      const baseCost = Number(stateMap['base_cost'] || 0)

      const currentTime = Math.floor(Date.now() / 1000)
      const expiryTime = queueStartTime + timeWindow
      const timeRemaining = expiryTime > currentTime ? expiryTime - currentTime : 0

      const thresholdMet = queueCount >= threshold
      const canTrigger = thresholdMet && queueCount > 0
      const canRefund = !thresholdMet && timeRemaining === 0 && queueStartTime > 0

      return {
        queueCount,
        threshold,
        totalEscrowed,
        queueStartTime,
        timeRemaining,
        thresholdMet,
        canTrigger,
        canRefund,
        effectiveCost,
        baseCost,
      }
    } catch (error) {
      console.error('Error getting queue status:', error)
      throw new Error('Failed to get queue status')
    }
  }

  /**
   * Get user's escrowed amount
   */
  static async getUserEscrowedAmount(userAddress: string, appId: number): Promise<number> {
    try {
      const accountInfo = await algodClient.accountInformation(userAddress).do()
      const localState = accountInfo.appsLocalState || []

      const appState = localState.find((app: any) => app.id === appId)
      if (!appState || !appState.keyValue) {
        return 0
      }

      const stateMap: Record<string, any> = {}
      appState.keyValue.forEach((state: any) => {
        const key = typeof state.key === 'string' 
          ? Buffer.from(state.key, 'base64').toString()
          : Buffer.from(state.key).toString('utf-8')
        if (state.value.type === 1) {
          stateMap[key] = state.value.uint
        }
      })

      return Number(stateMap['escrowed_amount'] || 0)
    } catch (error) {
      console.error('Error getting user escrowed amount:', error)
      return 0
    }
  }

  /**
   * Get effective cost from contract
   */
  static async getEffectiveCost(appId: number): Promise<number> {
    try {
      const appInfo = await algodClient.getApplicationByID(appId).do()
      const globalState = appInfo.params.globalState || []

      for (const state of globalState) {
        const key = typeof state.key === 'string'
          ? Buffer.from(state.key, 'base64').toString()
          : Buffer.from(state.key).toString('utf-8')
        if (key === 'effective_cost' && state.value.type === 1) {
          return Number(state.value.uint)
        }
      }

      throw new Error('Effective cost not found in contract state')
    } catch (error: any) {
      // Don't log error here - let the caller handle it (they may have a fallback)
      if (error.message === 'Effective cost not found in contract state') {
        throw error // Re-throw the original error
      }
      throw new Error('Failed to get effective cost')
    }
  }

  /**
   * Get platform address from contract
   */
  static async getPlatformAddress(appId: number): Promise<string> {
    try {
      const appInfo = await algodClient.getApplicationByID(appId).do()
      const globalState = appInfo.params.globalState || []

      for (const state of globalState) {
        const key = typeof state.key === 'string'
          ? Buffer.from(state.key, 'base64').toString()
          : Buffer.from(state.key).toString('utf-8')
        if (key === 'platform_address' && state.value.type === 2) {
          const publicKey = typeof state.value.bytes === 'string'
            ? Buffer.from(state.value.bytes, 'base64')
            : new Uint8Array(state.value.bytes)
          return algosdk.encodeAddress(publicKey)
        }
      }

      throw new Error('Platform address not found in contract state')
    } catch (error) {
      console.error('Error getting platform address:', error)
      throw new Error('Failed to get platform address')
    }
  }

  /**
   * Get escrow address from contract
   */
  static async getEscrowAddress(appId: number): Promise<string> {
    try {
      const appInfo = await algodClient.getApplicationByID(appId).do()
      const globalState = appInfo.params.globalState || []

      for (const state of globalState) {
        const key = typeof state.key === 'string'
          ? Buffer.from(state.key, 'base64').toString()
          : Buffer.from(state.key).toString('utf-8')
        if (key === 'escrow_address' && state.value.type === 2) {
          const publicKey = typeof state.value.bytes === 'string'
            ? Buffer.from(state.value.bytes, 'base64')
            : new Uint8Array(state.value.bytes)
          return algosdk.encodeAddress(publicKey)
        }
      }

      throw new Error('Escrow address not found in contract state')
    } catch (error: any) {
      // Don't log error here - let the caller handle it (they may have a fallback)
      if (error.message === 'Escrow address not found in contract state') {
        throw error // Re-throw the original error
      }
      throw new Error('Failed to get escrow address')
    }
  }

  /**
   * Get approval program source (TEAL)
   */
  private static async getApprovalProgram(): Promise<string> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const programPath = path.join(process.cwd(), 'contracts', 'dutch-mint', 'approval.teal')
      return await fs.readFile(programPath, 'utf-8')
    } catch (error) {
      console.error('Error reading approval program:', error)
      throw new Error('Failed to read approval program file')
    }
  }

  /**
   * Get clear program source (TEAL)
   */
  private static async getClearProgram(): Promise<string> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const programPath = path.join(process.cwd(), 'contracts', 'dutch-mint', 'clear.teal')
      return await fs.readFile(programPath, 'utf-8')
    } catch (error) {
      console.error('Error reading clear program:', error)
      throw new Error('Failed to read clear program file')
    }
  }
}

