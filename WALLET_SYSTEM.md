# Global Wallet Management System

A comprehensive, global wallet management system for the NFT marketplace that provides wallet connection, transaction management, and state management across the entire application.

## 🚀 Features

- **Global State Management**: Single source of truth for wallet state across the app
- **Multiple Wallet Support**: Currently supports Pera Wallet with extensible architecture
- **Transaction Management**: Send, receive, and track transactions
- **Message Signing**: Sign messages for authentication and verification
- **Real-time Updates**: Automatic state synchronization across components
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **TypeScript Support**: Full type safety throughout the system
- **React Hooks**: Easy-to-use hooks for wallet operations
- **UI Components**: Pre-built components for common wallet operations

## 📁 File Structure

```
lib/wallet/
├── wallet-service.ts          # Core wallet service (singleton)
├── pera-wallet.ts            # Pera Wallet integration
└── wallet-context.tsx        # Legacy wallet context

hooks/
└── use-wallet.ts             # React hook for wallet operations

components/wallet/
├── wallet-provider.tsx       # Wallet context provider
├── wallet-connect-button.tsx # Wallet connection buttons
├── wallet-status.tsx         # Wallet status components
└── wallet-transactions.tsx   # Transaction history component
```

## 🔧 Core Components

### 1. WalletService (Singleton)

The core service that manages all wallet operations:

```typescript
import { walletService } from '@/lib/wallet/wallet-service'

// Connect wallet
const account = await walletService.connect()

// Disconnect wallet
await walletService.disconnect()

// Send transaction
const tx = await walletService.sendTransaction(to, amount, currency)

// Sign message
const signature = await walletService.signMessage(message)

// Get balance
const balance = await walletService.getBalance(address)
```

### 2. useWallet Hook

React hook for easy wallet integration:

```typescript
import { useWallet } from '@/hooks/use-wallet'

function MyComponent() {
  const {
    isConnected,
    isConnecting,
    account,
    balance,
    error,
    connect,
    disconnect,
    sendTransaction,
    signMessage
  } = useWallet()

  // Use wallet state and methods
}
```

### 3. WalletProvider

Context provider for global wallet state:

```typescript
import { WalletProvider } from '@/components/wallet/wallet-provider'

function App() {
  return (
    <WalletProvider>
      {/* Your app components */}
    </WalletProvider>
  )
}
```

## 🎨 UI Components

### WalletConnectButton

Pre-built wallet connection buttons with multiple variants:

```typescript
import { 
  WalletConnectButton, 
  WalletConnectButtonCompact, 
  WalletConnectButtonFull 
} from '@/components/wallet/wallet-connect-button'

// Basic button
<WalletConnectButton />

// Compact version for headers
<WalletConnectButtonCompact />

// Full version with all features
<WalletConnectButtonFull />
```

### WalletStatus

Display wallet connection status and information:

```typescript
import { 
  WalletStatus, 
  WalletStatusCompact, 
  WalletStatusLoading 
} from '@/components/wallet/wallet-status'

// Full status card
<WalletStatus />

// Compact status for headers
<WalletStatusCompact />

// Loading state
<WalletStatusLoading />
```

### WalletTransactions

Transaction history with filtering and management:

```typescript
import { WalletTransactions } from '@/components/wallet/wallet-transactions'

<WalletTransactions />
```

## 🔄 State Management

The wallet system uses a singleton pattern with observer pattern for state updates:

```typescript
// Subscribe to state changes
const unsubscribe = walletService.subscribe((state) => {
  console.log('Wallet state changed:', state)
})

// Get current state
const currentState = walletService.getState()

// Unsubscribe
unsubscribe()
```

## 📱 Usage Examples

### Basic Wallet Connection

```typescript
import { useWallet } from '@/hooks/use-wallet'

function WalletButton() {
  const { isConnected, connect, disconnect } = useWallet()

  if (isConnected) {
    return <button onClick={disconnect}>Disconnect</button>
  }

  return <button onClick={connect}>Connect Wallet</button>
}
```

### Transaction Sending

```typescript
import { useWallet } from '@/hooks/use-wallet'

function SendTransaction() {
  const { sendTransaction, isConnected } = useWallet()

  const handleSend = async () => {
    if (!isConnected) return

    try {
      const tx = await sendTransaction(
        '0x1234567890123456789012345678901234567890',
        1.5,
        'ALGO'
      )
      console.log('Transaction sent:', tx)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  return <button onClick={handleSend}>Send 1.5 ALGO</button>
}
```

### Message Signing

```typescript
import { useWallet } from '@/hooks/use-wallet'

function SignMessage() {
  const { signMessage, isConnected } = useWallet()

  const handleSign = async () => {
    if (!isConnected) return

    try {
      const signature = await signMessage('Hello, Algorand!')
      console.log('Message signed:', signature)
    } catch (error) {
      console.error('Signing failed:', error)
    }
  }

  return <button onClick={handleSign}>Sign Message</button>
}
```

## 🔧 Configuration

### Environment Variables

```env
# Wallet configuration
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
NEXT_PUBLIC_ALGORAND_INDEXER_URL=https://testnet-algorand.api.purestake.io/idx2
NEXT_PUBLIC_ALGORAND_ALGOD_URL=https://testnet-algorand.api.purestake.io/ps2
```

### Wallet Provider Setup

The wallet provider is already included in the main layout:

```typescript
// app/layout.tsx
import { WalletProvider } from '@/components/wallet/wallet-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
```

## 🎯 Integration Points

### Dashboard Layout

The dashboard layout now uses the global wallet system:

```typescript
// components/dashboard-layout.tsx
import { WalletConnectButtonCompact } from '@/components/wallet/wallet-connect-button'
import { WalletStatusCompact } from '@/components/wallet/wallet-status'

// In the header
<WalletConnectButtonCompact />

// In the profile dropdown
<WalletStatusCompact />
```

### Merchant Login

The merchant login flow uses the global wallet service:

```typescript
// app/auth/merchant/signin/page.tsx
import { useWallet } from '@/hooks/use-wallet'

const { connect: connectWalletService } = useWallet()

const handleWalletConnect = async () => {
  const walletAccount = await connectWalletService()
  await connectWallet(walletAccount.address)
}
```

## 🧪 Testing

Visit `/wallet-demo` to see all wallet components in action and test the functionality.

## 🔮 Future Enhancements

- **Multi-wallet Support**: Add support for other Algorand wallets
- **Transaction History Persistence**: Store transaction history in database
- **Advanced Transaction Types**: Support for complex transaction types
- **Wallet Analytics**: Track wallet usage and performance
- **Offline Support**: Handle offline scenarios gracefully
- **Wallet Recovery**: Support for wallet recovery flows

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Not Connecting**: Ensure Pera Wallet is installed and updated
2. **State Not Updating**: Check if components are wrapped in WalletProvider
3. **Transaction Failures**: Verify network connection and sufficient balance
4. **TypeScript Errors**: Ensure proper imports from the correct modules

### Debug Mode

Enable debug logging by setting:

```typescript
// In wallet-service.ts
console.log('Wallet state changed:', state)
```

## 📚 API Reference

### WalletService Methods

- `connect()`: Connect to wallet
- `disconnect()`: Disconnect wallet
- `sendTransaction(to, amount, currency)`: Send transaction
- `signMessage(message)`: Sign message
- `getBalance(address)`: Get wallet balance
- `formatAddress(address, length)`: Format address for display
- `copyToClipboard(text)`: Copy text to clipboard
- `subscribe(listener)`: Subscribe to state changes
- `getState()`: Get current state

### useWallet Hook Returns

- `isConnected`: Boolean connection status
- `isConnecting`: Boolean connecting status
- `account`: Wallet account object
- `balance`: Current balance
- `error`: Error message if any
- `connect()`: Connect function
- `disconnect()`: Disconnect function
- `sendTransaction()`: Send transaction function
- `signMessage()`: Sign message function
- `formatAddress()`: Format address function
- `copyToClipboard()`: Copy to clipboard function

This global wallet system provides a robust, scalable foundation for wallet management across the entire NFT marketplace application.
