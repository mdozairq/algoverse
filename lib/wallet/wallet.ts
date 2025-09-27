// Wallet service for managing wallet state
import { type WalletAccount, type Wallet } from "@txnlab/use-wallet-react"

class WalletService {
  private wallet: Wallet | null = null
  private account: WalletAccount | null = null
  private transactionSigner: any = null

  /**
   * Set wallet instance
   */
  setWallet(wallet: Wallet, account: WalletAccount, transactionSigner: any) {
    this.wallet = wallet
    this.account = account
    this.transactionSigner = transactionSigner
  }

  /**
   * Get current wallet
   */
  getWallet(): Wallet | null {
    return this.wallet
  }

  /**
   * Get current account
   */
  getAccount(): WalletAccount | null {
    return this.account
  }

  /**
   * Get transaction signer
   */
  getTransactionSigner(): any {
    return this.transactionSigner
  }

  /**
   * Clear wallet data
   */
  clear() {
    this.wallet = null
    this.account = null
    this.transactionSigner = null
  }
}

export const wallet = new WalletService()
