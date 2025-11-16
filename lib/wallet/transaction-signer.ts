import { getPeraWalletInstance } from './pera-wallet'
import { walletService } from './wallet-service'

export interface SignerTransaction {
  txn: Uint8Array
  signers?: string[]
}

export class TransactionSigner {
  private static instance: TransactionSigner
  private peraWallet: any
  private useWalletHook: any

  private constructor() {
    this.peraWallet = getPeraWalletInstance()
  }

  public static getInstance(): TransactionSigner {
    if (!TransactionSigner.instance) {
      TransactionSigner.instance = new TransactionSigner()
    }
    return TransactionSigner.instance
  }

  public setUseWalletHook(useWalletHook: any) {
    this.useWalletHook = useWalletHook
  }

  public async signTransaction(transaction: string, signerAddress?: string): Promise<string> {
    try {
      console.log('Using wallet service signTransactions method:', {
        transactionLength: transaction.length,
        signerAddress
      })
      
      // Pass the base64 string directly to wallet service
      const signedTxns = await walletService.signTransactions([transaction])
      
      // Return the signed transaction (already base64)
      return signedTxns[0]
    } catch (error: any) {
      console.error('Transaction signing failed:', error)
      
      // Handle Pera Wallet specific errors
      if (error?.message?.includes('4100') || error?.message?.includes('Transaction request pending')) {
        throw new Error(
          'Another transaction is pending in Pera Wallet. Please complete or cancel the pending transaction in your wallet, then try again.'
        )
      }
      
      throw new Error(`Failed to sign transaction: ${error.message || 'Unknown error'}`)
    }
  }

  public async signTransactions(transactions: string[], signerAddress?: string): Promise<string[]> {
    try {
      console.log('Using wallet service signTransactions method for multiple transactions:', {
        txnCount: transactions.length,
        signerAddress
      })
      
      // Pass base64 strings directly to wallet service
      const signedTxns = await walletService.signTransactions(transactions)
      
      // Return signed transactions (already base64)
      return signedTxns
    } catch (error: any) {
      console.error('Transaction signing failed for multiple transactions:', error)
      
      // Handle Pera Wallet specific errors
      if (error?.message?.includes('4100') || error?.message?.includes('Transaction request pending')) {
        throw new Error(
          'Another transaction is pending in Pera Wallet. Please complete or cancel the pending transaction in your wallet, then try again.'
        )
      }
      
      throw new Error(`Failed to sign transactions: ${error.message || 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const transactionSigner = TransactionSigner.getInstance()
