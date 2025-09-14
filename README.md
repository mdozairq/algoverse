# AlgoVerse - Powered by Algorand

A decentralized NFT marketplace for event tickets and experiences, built on the Algorand blockchain.

## 🌟 Features

- **Blockchain Security**: Built on Algorand for instant, secure, and eco-friendly transactions
- **Atomic Swaps**: Trade NFTs instantly with atomic swap technology
- **Smart Check-in**: QR codes and NFC integration for seamless event entry
- **Loyalty Rewards**: Earn loyalty NFTs and points for purchases and event attendance
- **White-Label Solutions**: Custom-branded marketplaces for merchants
- **Dynamic NFTs**: Update seat assignments, dates, and bundles with metadata that evolves

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Firebase project
- Algorand testnet/mainnet access

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/algoverse-marketplace.git
cd algoverse-marketplace
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# Algorand Configuration
ALGORAND_NETWORK=testnet
ALGORAND_INDEXER_URL=your-indexer-url
ALGORAND_NODE_URL=your-node-url

# JWT Secret
JWT_SECRET=your-jwt-secret
```

5. Run the development server
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **shadcn/ui** for UI components

### Backend
- **Firebase Firestore** for data storage
- **Firebase Auth** for authentication
- **Algorand SDK** for blockchain operations
- **JWT** for session management

### Key Features
- **Role-based Access Control** (Admin, Merchant, User)
- **Real-time Data** with Firebase
- **Responsive Design** for all devices
- **Dark/Light Theme** support

## 📱 User Roles

### For Event Organizers (Merchants)
- Create and manage custom marketplaces
- Mint and list NFTs
- Real-time analytics dashboard
- Automated royalty collection
- White-label branding options

### For Event Attendees (Users)
- Secure NFT wallet integration
- Instant atomic swaps
- Loyalty rewards program
- Mobile check-in system
- Secondary market trading

### For Platform Admins
- Merchant approval system
- Fee and commission management
- Platform-wide analytics
- Marketplace oversight
- Security and compliance tools

## 🔧 Development

### Project Structure
```
algoverse-marketplace/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── firebase/         # Firebase configuration
│   └── algorand/         # Algorand integration
└── public/               # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Algorand](https://algorand.org/) for the blockchain infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📞 Support

For support, email support@algoverse.com or join our Discord community.

---

**AlgoVerse** - Where blockchain meets events. Made reality by AlgoVerse®
