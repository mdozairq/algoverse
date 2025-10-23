import { useWallet } from '@txnlab/use-wallet-react'

export interface UseWalletSignerOptions {
  signerAddress?: string
}

export class UseWalletSigner {
  private static instance: UseWalletSigner
  private useWalletHook: any

  private constructor() {
    // We'll need to get the useWallet hook from the component context
    // This is a workaround since we can't use hooks in a class
  }

  public static getInstance(): UseWalletSigner {
    if (!UseWalletSigner.instance) {
      UseWalletSigner.instance = new UseWalletSigner()
    }
    return UseWalletSigner.instance
  }

  public setUseWalletHook(useWalletHook: any) {
    this.useWalletHook = useWalletHook
  }

  public async signTransaction(transaction: string, signerAddress?: string): Promise<string> {
    try {
      if (!this.useWalletHook) {
        throw new Error('UseWallet hook not available')
      }

      const { signTransactions } = this.useWalletHook()
      
      if (!signTransactions) {
        throw new Error('signTransactions not available from useWallet hook')
      }

      // Convert base64 transaction to Uint8Array
      const txnBytes = new Uint8Array(Buffer.from(transaction, 'base64'))
      
      console.log('Signing transaction with useWallet:', {
        txnLength: txnBytes.length,
        signerAddress
      })

      // Use the useWallet signTransactions method
      const signedTxns = await signTransactions([txnBytes])
      
      // Convert signed transaction back to base64
      return Buffer.from(signedTxns[0]).toString('base64')
    } catch (error: any) {
      console.error('Transaction signing failed with useWallet:', error)
      throw new Error(`Failed to sign transaction: ${error.message || 'Unknown error'}`)
    }
  }

  public async signTransactions(transactions: string[], signerAddress?: string): Promise<string[]> {
    try {
      if (!this.useWalletHook) {
        throw new Error('UseWallet hook not available')
      }

      const { signTransactions } = this.useWalletHook()
      
      if (!signTransactions) {
        throw new Error('signTransactions not available from useWallet hook')
      }

      // Convert base64 transactions to Uint8Array
      const txnBytes = transactions.map(txn => new Uint8Array(Buffer.from(txn, 'base64')))
      
      console.log('Signing transactions with useWallet:', {
        txnCount: txnBytes.length,
        signerAddress
      })

      // Use the useWallet signTransactions method
      const signedTxns = await signTransactions(txnBytes)
      
      // Convert signed transactions back to base64
      return signedTxns.map((signedTxn: Uint8Array) => Buffer.from(signedTxn).toString('base64'))
    } catch (error: any) {
      console.error('Transaction signing failed with useWallet:', error)
      throw new Error(`Failed to sign transactions: ${error.message || 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const useWalletSigner = UseWalletSigner.getInstance()
