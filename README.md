# AlgoVerse - NFT Marketplace Platform

A comprehensive, decentralized NFT marketplace platform for event tickets, digital collectibles, and experiences, built on the Algorand blockchain. AlgoVerse provides white-label marketplace solutions, atomic swaps, launchpad functionality, and a complete ecosystem for NFT creation, trading, and management.

## 🌟 Core Features

### 1. **Blockchain-Powered NFT System**
- **Algorand Standard Assets (ASAs)**: All NFTs are created as ASAs on Algorand blockchain
- **Instant Minting**: Fast NFT creation and minting with minimal fees (fractions of a cent)
- **Metadata Management**: Rich NFT metadata stored on IPFS for decentralized storage
- **Dynamic NFTs**: Update metadata post-mint for evolving ticket information
- **Royalty Support**: Automatic royalty distribution on secondary sales

### 2. **Event Ticketing System**
- **Secure Ticket NFTs**: Each event ticket is a unique, verifiable NFT on the blockchain
- **QR Code Verification**: Generate and scan QR codes for event entry verification
- **Seat Management**: Assign and update seat numbers, sections, and ticket types
- **Bundle Tickets**: Create bundled ticket packages with multiple NFTs
- **Ticket Transfer**: Easy transfer of tickets between users
- **Purchase Flow**: Complete purchase-to-mint workflow with payment verification

### 3. **White-Label Marketplace Platform**
- **Template-Based System**: Pre-built marketplace templates for different industries
- **Custom Branding**: Fully customizable colors, logos, banners, and styling
- **Dynamic Theming**: Theme engine that applies merchant branding across all pages
- **Collection Management**: Create and manage NFT collections within marketplaces
- **Product Listings**: List and sell NFTs as products with pricing and inventory
- **Multi-Merchant Support**: Each merchant can have multiple branded marketplaces

### 4. **Atomic Swaps**
- **Peer-to-Peer Trading**: Trustless NFT swaps between users without intermediaries
- **Atomic Execution**: All-or-nothing transaction execution ensures security
- **Expiry Support**: Time-limited swap offers with automatic cancellation
- **On-Chain Security**: All swaps recorded immutably on blockchain
- **Swap History**: Track all swap transactions and status

### 5. **Tinyman Integration**
- **Asset Swapping**: Swap any Algorand Standard Asset (ASA) for ALGO using Tinyman AMM
- **Liquidity Pools**: Automatic discovery and interaction with Tinyman liquidity pools
- **Real-Time Quotes**: Live price quotes with slippage tolerance
- **Price Impact Warnings**: Alerts for high price impact trades
- **Transaction Status**: Complete transaction flow tracking

### 6. **Launchpad System**
- **NFT Project Launch**: Create and launch NFT projects with phased minting
- **Minting Phases**: Configure multiple minting phases with different prices and eligibility
- **Whitelist Management**: Manage project whitelists and presale eligibility
- **Roadmap Tracking**: Project roadmap and milestones
- **Team Management**: Display project team and advisors
- **FAQ Management**: Project-specific FAQs and support
- **Real-Time Stats**: Live minting statistics and progress tracking

### 7. **Wallet Management**
- **Multi-Wallet Support**: Connect Pera Wallet or create/import local wallets
- **Pera Wallet Integration**: Seamless connection to Pera Wallet mobile app
- **Local Wallet Creation**: Generate new wallets with mnemonic phrase backup
- **Wallet Import**: Import existing wallets using mnemonic phrases
- **Transaction History**: Complete transaction log with filtering
- **Balance Tracking**: Real-time balance updates for ALGO and ASAs
- **Asset Management**: View and manage all assets in wallet
- **Send/Receive**: Send ALGO and ASAs to other addresses

### 8. **IPFS Integration**
- **Decentralized Storage**: Store NFT metadata and images on IPFS
- **Pinata Integration**: Reliable pinning service for IPFS content
- **Metadata Upload**: Upload and manage NFT metadata JSON files
- **Image Storage**: Store NFT images with IPFS hash references
- **Content Addressing**: Immutable content addressing via IPFS hashes

### 9. **Collections & Products**
- **Collection Creation**: Merchants can create NFT collections for their marketplaces
- **Product Management**: List NFTs as products with pricing, inventory, and details
- **Supply Management**: Track current and available supply of NFTs
- **Minting Sessions**: Create scheduled minting sessions for products
- **Collection Filtering**: Filter and search collections by various attributes

### 10. **Trading & Secondary Market**
- **Buy/Sell NFTs**: List NFTs for sale and purchase from other users
- **Auction System**: Place NFTs in auctions with bidding functionality
- **Order Management**: Manage buy and sell orders
- **Trading History**: Complete trading history across all marketplaces
- **Price Tracking**: Track NFT prices and market statistics

### 11. **Analytics & Reporting**
- **Platform Analytics**: Platform-wide statistics and metrics
- **Merchant Analytics**: Detailed analytics for merchant marketplaces
- **Marketplace Analytics**: Individual marketplace performance metrics
- **User Activity**: Track user activity and engagement
- **Revenue Tracking**: Monitor revenue, fees, and commissions
- **NFT Statistics**: NFT ownership, trading, and market data

### 12. **Role-Based Access Control**
- **Three User Roles**: Admin, Merchant, and User with distinct permissions
- **Admin Dashboard**: Platform management, merchant approval, template management
- **Merchant Dashboard**: Marketplace creation, event management, analytics
- **User Dashboard**: NFT collection, wallet, activity tracking
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Persistent sessions with cookie-based storage

### 13. **Security Features**
- **Blockchain Verification**: All transactions verified on-chain
- **Immutable Records**: Permanent transaction history on blockchain
- **Private Key Security**: Secure handling of wallet private keys
- **Password Hashing**: bcrypt password hashing for user accounts
- **Role-Based Authorization**: Middleware-based route protection
- **Transaction Signing**: Secure transaction signing process

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework with custom theme system
- **Framer Motion**: Smooth animations and transitions
- **shadcn/ui**: High-quality, accessible UI components
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation

### Backend Stack
- **Firebase Firestore**: NoSQL database for application data
- **Firebase Admin SDK**: Server-side Firebase operations
- **Algorand SDK (algosdk)**: Blockchain interaction and transaction management
- **IPFS/Pinata**: Decentralized storage for NFT metadata
- **JWT (jose)**: Token-based authentication
- **bcryptjs**: Password hashing

### Blockchain Integration
- **Algorand Network**: Supports both Testnet and Mainnet
- **Algorand Indexer**: Querying blockchain data and transaction history
- **Algod Client**: Submitting transactions and querying network status
- **ASA Operations**: Creating, minting, and transferring NFTs
- **Atomic Transfers**: Grouped transactions for swaps and complex operations

### Key Libraries
- **@tinymanorg/tinyman-js-sdk**: Tinyman AMM protocol integration
- **@txnlab/use-wallet-react**: React hooks for Algorand wallet management
- **@perawallet/connect**: Pera Wallet browser integration
- **algosdk**: Official Algorand JavaScript SDK

## 📱 User Roles & Use Cases

### For Event Organizers (Merchants)

#### Marketplace Creation
1. **Register as Merchant**: Submit merchant application with business details
2. **Create Marketplace**: Choose template, configure branding, set up payment methods
3. **Customize Theme**: Apply custom colors, logos, banners, and styling
4. **Configure Settings**: Set up collections, enable features (minting, trading, swaps)
5. **Publish Marketplace**: Launch white-label marketplace with custom domain

#### Event Management
1. **Create Events**: Set up events with details, dates, locations, pricing
2. **Create Collections**: Organize NFTs into collections (e.g., "VIP Tickets", "General Admission")
3. **Mint Tickets**: Mint NFT tickets for events with metadata (seat, section, type)
4. **Manage Inventory**: Track available supply, sold tickets, revenue
5. **View Analytics**: Monitor sales, revenue, and user engagement

#### NFT Operations
1. **Bulk Minting**: Mint multiple NFTs in batch operations
2. **Metadata Updates**: Update ticket metadata post-mint (seat changes, date updates)
3. **Price Management**: Set and update NFT prices
4. **Royalty Configuration**: Configure royalty percentages for secondary sales

### For Event Attendees (Users)

#### Ticket Purchase
1. **Browse Events**: Discover events on marketplace homepage
2. **Select Tickets**: Choose event, ticket type, quantity
3. **Connect Wallet**: Connect Pera Wallet or use local wallet
4. **Complete Purchase**: Sign payment transaction, receive NFT tickets
5. **Claim Tickets**: Claim minted tickets to wallet

#### Ticket Management
1. **View Collection**: See all owned NFT tickets in wallet
2. **Transfer Tickets**: Send tickets to other wallet addresses
3. **QR Verification**: Generate QR codes for event entry
4. **Check-in**: Use QR codes at event venues for entry

#### Trading & Swaps
1. **Atomic Swaps**: Trade NFTs directly with other users
2. **List for Sale**: List NFTs on secondary market
3. **Buy NFTs**: Purchase NFTs from other users
4. **Swap Assets**: Use Tinyman to swap any ASA for ALGO
5. **View History**: Track all trades, swaps, and transactions

#### Wallet Operations
1. **Wallet Management**: Create, import, or connect wallets
2. **Send/Receive**: Transfer ALGO and ASAs
3. **View Balance**: Check ALGO and asset balances
4. **Transaction History**: Review all wallet transactions

### For Platform Admins

#### Platform Management
1. **Merchant Approval**: Review and approve/reject merchant applications
2. **Template Management**: Create and manage marketplace templates
3. **Fee Configuration**: Set platform fees and commission rates
4. **Settings Management**: Configure platform-wide settings
5. **Analytics**: View platform-wide statistics and metrics

#### Monitoring & Oversight
1. **Marketplace Oversight**: Monitor all merchant marketplaces
2. **Event Management**: Review and manage platform events
3. **User Management**: View and manage user accounts
4. **Security Tools**: Monitor security events and transactions
5. **Compliance**: Ensure compliance with regulations

## 🔧 How It Works

### NFT Creation & Minting Flow

1. **Collection Creation**: Merchant creates a collection for an event or product
2. **NFT Configuration**: Define NFT metadata, supply, pricing, and attributes
3. **ASA Creation**: System creates Algorand Standard Asset with metadata
4. **IPFS Upload**: NFT image and metadata JSON uploaded to IPFS
5. **Asset Creation Transaction**: Transaction submitted to Algorand network
6. **Confirmation**: Wait for transaction confirmation (typically < 5 seconds)
7. **Storage**: NFT data stored in Firestore with asset ID and IPFS hash

### Purchase & Minting Flow

1. **User Selects NFT**: User browses marketplace and selects NFT to purchase
2. **Payment Transaction**: System creates payment transaction from user to merchant
3. **Wallet Signing**: User signs transaction in connected wallet
4. **Transaction Submission**: Signed transaction submitted to Algorand
5. **Confirmation**: Wait for payment confirmation
6. **Minting**: System mints NFT to user's wallet address
7. **Opt-in Check**: System ensures user has opted into asset (auto-opt-in if needed)
8. **NFT Transfer**: NFT transferred to user's wallet
9. **Record Update**: Purchase and mint records updated in Firestore

### Atomic Swap Flow

1. **Swap Creation**: User A creates swap proposal (NFT X for NFT Y)
2. **Proposal Submission**: Swap proposal stored in Firestore with expiry
3. **User B Notification**: User B sees swap proposal in swap interface
4. **Acceptance**: User B accepts swap proposal
5. **Transaction Group**: System creates atomic transfer group:
   - User A sends NFT X to User B
   - User B sends NFT Y to User A
6. **Dual Signing**: Both users sign their respective transactions
7. **Atomic Execution**: All transactions execute together or all fail
8. **Confirmation**: Swap completion recorded on blockchain and in Firestore

### Tinyman Swap Flow

1. **Asset Selection**: User selects asset to swap and amount
2. **Quote Request**: System requests quote from Tinyman AMM
3. **Quote Display**: Shows receive amount, price impact, fees, minimum received
4. **Slippage Configuration**: User sets slippage tolerance (0.5%, 1%, 3%)
5. **Transaction Preparation**: Tinyman SDK prepares swap transaction group
6. **Wallet Signing**: User signs transactions in wallet
7. **Swap Execution**: Transactions submitted to Tinyman and Algorand
8. **Confirmation**: Wait for blockchain confirmation
9. **Balance Update**: User's balance refreshed with new amounts

### Marketplace Rendering Flow

1. **Template Loading**: System loads marketplace template configuration
2. **Marketplace Data**: Fetch marketplace data from Firestore
3. **Collection Data**: Load collections and products for marketplace
4. **Theme Application**: Apply merchant branding (colors, logos, styling)
5. **Component Rendering**: Template engine renders components using template rules
6. **Dynamic Routing**: Generate routes for collections, products, swap, mint pages
7. **Client-Side Hydration**: React components hydrate with data

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Firebase project with Firestore enabled
- Algorand testnet/mainnet access
- IPFS/Pinata account (optional, for metadata storage)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/algoverse-marketplace.git
cd algoverse-marketplace
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp env.local.example .env.local
```

4. **Configure environment variables**

See [SETUP.md](./SETUP.md) for detailed environment variable configuration. Key variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# Algorand Configuration
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
ALGOD_TOKEN=your-algod-token
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
INDEXER_TOKEN=your-indexer-token
INDEXER_SERVER=https://testnet-idx.algonode.cloud
INDEXER_PORT=443

# Wallet Configuration
MERCHANT_PRIVATE_KEY=your-merchant-wallet-mnemonic
MINTER_PRIVATE_KEY=your-minter-wallet-mnemonic

# JWT Secret
JWT_SECRET=your-jwt-secret
ADMIN_MASTER_KEY=your-admin-key

# IPFS/Pinata (Optional)
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret
```

5. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Seed Data (Optional)

To populate the database with sample data:

```bash
node scripts/seed-data.js
```

## 📂 Project Structure

```
algoverse-marketplace/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── events/           # Event management APIs
│   │   ├── marketplaces/     # Marketplace CRUD APIs
│   │   ├── nfts/             # NFT operations APIs
│   │   ├── collections/      # Collection management APIs
│   │   ├── launchpad/        # Launchpad project APIs
│   │   ├── wallet/           # Wallet operations APIs
│   │   ├── user/             # User management APIs
│   │   └── admin/            # Admin operations APIs
│   ├── auth/                 # Authentication pages
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── merchant/         # Merchant registration
│   │   └── admin/            # Admin login
│   ├── dashboard/            # Role-based dashboards
│   │   ├── admin/            # Admin dashboard
│   │   ├── merchant/         # Merchant dashboard
│   │   └── user/             # User dashboard
│   ├── marketplace/          # Marketplace pages
│   │   └── [merchantId]/[marketplaceId]/  # Dynamic marketplace routes
│   │       ├── collection/   # Collection pages
│   │       ├── create/       # NFT creation
│   │       ├── swap/         # Atomic swap interface
│   │       └── ...           # Other marketplace pages
│   ├── events/               # Event pages
│   ├── launchpad/            # Launchpad pages
│   └── nft/                  # NFT detail pages
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── marketplace/          # Marketplace components
│   ├── nft/                  # NFT-specific components
│   ├── wallet/               # Wallet components
│   ├── launchpad/            # Launchpad components
│   └── animations/           # Animation components
├── lib/                      # Utility libraries
│   ├── algorand/            # Algorand blockchain integration
│   │   ├── nft-service.ts   # NFT operations
│   │   └── wallet-mint-service.ts  # Wallet minting
│   ├── auth/                # Authentication logic
│   ├── firebase/            # Firebase configuration
│   ├── marketplace/         # Marketplace template engine
│   ├── tinyman/             # Tinyman swap integration
│   ├── wallet/              # Wallet management
│   └── utils/               # Utility functions
├── hooks/                   # React hooks
│   ├── use-wallet.ts       # Wallet hook
│   └── use-tinyman-swap.ts # Tinyman swap hook
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
└── scripts/                 # Utility scripts
    ├── seed-data.js        # Seed database
    └── setup-env.js        # Environment setup
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/wallet-connect` - Connect wallet

### Events
- `GET /api/events` - List all events
- `GET /api/events/[id]` - Get event details
- `POST /api/events/[id]/purchase` - Purchase event tickets
- `POST /api/events/[id]/confirm-purchase` - Confirm purchase and mint
- `POST /api/events/[id]/mint-tickets` - Mint tickets for event

### NFTs
- `POST /api/nfts/create` - Create NFT collection
- `POST /api/nfts/mint` - Mint NFT
- `POST /api/nfts/mint-wallet` - Mint NFT to wallet
- `POST /api/nfts/buy` - Buy NFT
- `POST /api/nfts/sell` - List NFT for sale
- `POST /api/nft/swap` - Create atomic swap
- `GET /api/nft/verify` - Verify NFT ownership

### Marketplaces
- `GET /api/marketplaces` - List marketplaces
- `GET /api/marketplaces/[id]` - Get marketplace details
- `POST /api/marketplaces` - Create marketplace (merchant only)
- `PUT /api/marketplaces/[id]` - Update marketplace
- `GET /api/marketplaces/[id]/collections` - Get marketplace collections
- `GET /api/marketplaces/[id]/products` - Get marketplace products
- `GET /api/marketplaces/[id]/analytics` - Get marketplace analytics

### Collections
- `GET /api/collections/[id]` - Get collection details
- `POST /api/collections/[id]/mint` - Mint NFTs in collection
- `GET /api/collections/[id]/nfts` - Get NFTs in collection

### Launchpad
- `GET /api/launchpad/projects/[id]` - Get launchpad project
- `POST /api/launchpad/projects/[id]/mint` - Mint from launchpad
- `GET /api/launchpad/projects/[id]/stats` - Get project statistics
- `GET /api/launchpad/projects/[id]/phases` - Get minting phases
- `GET /api/launchpad/projects/[id]/eligibility` - Check mint eligibility

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/send` - Send ALGO or ASA
- `GET /api/wallet/transactions` - Get transaction history

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/nfts` - Get user's NFTs
- `GET /api/user/purchases` - Get purchase history
- `GET /api/user/activity` - Get user activity

### Admin
- `GET /api/admin/merchants` - List merchants
- `POST /api/admin/merchants/[id]/approve` - Approve merchant
- `GET /api/admin/marketplaces` - List all marketplaces
- `GET /api/admin/events` - List all events
- `POST /api/admin/settings` - Update platform settings

See individual route files for complete API documentation.

## 🎨 Theming System

The platform includes a comprehensive theming system for white-label marketplaces:

- **Template Engine**: Dynamic template rendering based on merchant configuration
- **CSS Custom Properties**: Theme-aware color system
- **Dark/Light Mode**: Automatic theme switching
- **Component Theming**: All components support theme customization
- **Brand Assets**: Custom logos, banners, and favicons

See [THEME_SYSTEM.md](./THEME_SYSTEM.md) for detailed theming documentation.

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Middleware-protected routes
- **Password Hashing**: bcrypt password encryption
- **Private Key Management**: Secure wallet key handling
- **Transaction Validation**: All blockchain transactions validated
- **Rate Limiting**: API rate limiting (can be configured)
- **CORS Protection**: Configured CORS policies
- **Input Validation**: Zod schema validation for all inputs

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform
- Self-hosted (Docker, etc.)

### Production Checklist

- [ ] Switch to Algorand mainnet
- [ ] Use production Firebase project
- [ ] Set secure JWT secret and admin key
- [ ] Configure production wallet addresses
- [ ] Enable SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backups
- [ ] Test all functionality

## 📚 Documentation

Additional documentation files:

- [NFT_IMPLEMENTATION.md](./NFT_IMPLEMENTATION.md) - NFT creation and management
- [WALLET_IMPLEMENTATION.md](./WALLET_IMPLEMENTATION.md) - Wallet system details
- [TINYMAN_SWAP_IMPLEMENTATION.md](./TINYMAN_SWAP_IMPLEMENTATION.md) - Tinyman integration
- [THEME_SYSTEM.md](./THEME_SYSTEM.md) - Theming system documentation
- [SETUP.md](./SETUP.md) - Detailed setup instructions

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run backfill-supply` - Backfill NFT supply data
- `npm run test-backfill` - Test backfill script

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Algorand](https://algorand.org/) - Blockchain infrastructure
- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tinyman](https://tinyman.org/) - AMM protocol
- [Pinata](https://www.pinata.cloud/) - IPFS pinning service

## 📞 Support

For support, email support@algoverse.com or join our Discord community.

---

**AlgoVerse** - Where blockchain meets events. Made reality by AlgoVerse®

**Powered by Algorand** - Fast, secure, and sustainable blockchain technology.
