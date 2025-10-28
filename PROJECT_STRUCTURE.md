# Project Structure

Complete file structure for the Dating dApp project.

```
Dating-dApp/
│
├── contracts/                          # Solidity Smart Contracts
│   ├── HeartToken.sol                 # ERC-20 reward token ($HEART)
│   ├── MatchNFT.sol                   # ERC-721 match NFTs
│   └── DatingController.sol           # Main logic contract
│
├── scripts/                            # Deployment & utility scripts
│   ├── deploy.js                      # Deploy all contracts to Fuji
│   └── interact.js                    # Interact with deployed contracts
│
├── deployments/                        # Contract deployment artifacts
│   └── fuji-latest.json               # Latest deployment addresses
│
├── frontend/                           # Next.js Frontend Application
│   │
│   ├── app/                           # Next.js 14 App Router
│   │   ├── layout.tsx                # Root layout with navigation
│   │   ├── globals.css               # Global styles
│   │   ├── page.tsx                  # Home page (Swipe deck)
│   │   ├── boost/
│   │   │   └── page.tsx              # Boost purchase page
│   │   ├── leaderboard/
│   │   │   └── page.tsx              # Leaderboard page
│   │   └── profile/
│   │       └── page.tsx              # User profile page
│   │
│   ├── components/                    # React Components
│   │   ├── WalletConnectButton.tsx   # Wallet connection
│   │   ├── SwipeDeck.tsx             # Swipe interface
│   │   ├── BoostPanel.tsx            # Boost UI
│   │   ├── MatchModal.tsx            # Match popup
│   │   ├── Leaderboard.tsx           # Leaderboard component
│   │   └── Profile.tsx               # Profile display
│   │
│   ├── lib/                           # Utilities & Libraries
│   │   ├── contracts.ts              # Web3/ethers.js interactions
│   │   ├── firebase.ts               # Firestore operations
│   │   ├── ipfs.ts                   # IPFS/Pinata uploads
│   │   └── store.ts                  # Zustand state management
│   │
│   ├── public/                        # Static assets
│   │   └── images/                   # Images, icons, etc.
│   │
│   ├── package.json                   # Frontend dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── tailwind.config.ts            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── next.config.js                # Next.js config
│   └── .env.example                  # Frontend environment template
│
├── test/                              # Smart contract tests (optional)
│   └── DatingController.test.js      # Contract unit tests
│
├── hardhat.config.js                  # Hardhat configuration
├── package.json                       # Root dependencies
├── .env.example                       # Contract environment template
├── .gitignore                         # Git ignore rules
│
├── README.md                          # Main documentation
├── DEPLOYMENT_GUIDE.md               # Step-by-step deployment
├── DATABASE_SCHEMA.md                # Firestore schema
├── END_TO_END_EXAMPLE.md             # Complete user flow
└── PROJECT_STRUCTURE.md              # This file
```

---

## File Descriptions

### Smart Contracts

**HeartToken.sol** (162 lines)
- ERC-20 token implementation
- Controlled minting (only DatingController)
- Burn functionality
- Initial supply: 1B tokens

**MatchNFT.sol** (148 lines)
- ERC-721 NFT implementation
- Stores match metadata on-chain
- IPFS tokenURI for off-chain metadata
- Auto-incrementing token IDs

**DatingController.sol** (289 lines)
- Main business logic
- Match confirmation & NFT minting
- Reward distribution
- Boost purchase & tracking
- Owner-configurable parameters

### Deployment Scripts

**deploy.js** (178 lines)
- Deploys all 3 contracts in order
- Sets up permissions
- Saves addresses to JSON
- Pretty terminal output

**interact.js** (125 lines)
- Check balances
- Update settings
- Withdraw funds
- Query boost status

### Frontend Application

**app/layout.tsx** (142 lines)
- Root layout component
- Navigation bar
- Mobile navigation
- Footer
- Toast notifications

**app/page.tsx** (21 lines)
- Home page
- Renders SwipeDeck component

**app/boost/page.tsx** (48 lines)
- Boost purchase page
- How Boost Works info

**app/leaderboard/page.tsx** (42 lines)
- Leaderboard page
- Earning info

**app/profile/page.tsx** (18 lines)
- Profile page
- Renders Profile component

### Components

**WalletConnectButton.tsx** (158 lines)
- Connect/disconnect wallet
- Network switching
- Balance display
- Auto-refresh balances

**SwipeDeck.tsx** (187 lines)
- Profile carousel
- Like/Superlike buttons
- Match detection
- On-chain match processing

**BoostPanel.tsx** (145 lines)
- Boost purchase UI
- Timer countdown
- Status display
- Boost extension

**MatchModal.tsx** (98 lines)
- Match celebration popup
- Partner info
- Chat/continue buttons
- Animated entrance

**Leaderboard.tsx** (154 lines)
- Top users display
- Trophy icons
- HEART balance
- Refresh functionality

**Profile.tsx** (178 lines)
- User info display
- Match NFT grid
- Wallet details
- HEART balance

### Libraries

**lib/contracts.ts** (389 lines)
- Contract ABIs
- Contract instances
- Web3 helper functions
- Network utilities

**lib/firebase.ts** (312 lines)
- Firestore initialization
- CRUD operations
- Type definitions
- Match detection logic

**lib/ipfs.ts** (78 lines)
- Pinata API integration
- Metadata upload
- Match NFT metadata creation

**lib/store.ts** (62 lines)
- Zustand stores
- Wallet state
- Match modal state

### Configuration Files

**hardhat.config.js**
- Solidity version: 0.8.20
- Networks: hardhat, fuji
- Optimizer enabled

**next.config.js**
- Image domains
- Webpack config
- React strict mode

**tailwind.config.ts**
- Custom colors (primary, secondary, accent)
- Custom animations
- Custom keyframes

**tsconfig.json**
- TypeScript strict mode
- Path aliases (@/*)

---

## Technology Stack

### Blockchain
- **Smart Contracts**: Solidity ^0.8.20
- **Development**: Hardhat
- **Libraries**: OpenZeppelin Contracts v5.0.1
- **Network**: Avalanche Fuji Testnet
- **Chain ID**: 43113

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: ethers.js v6
- **State**: Zustand
- **Animations**: Framer Motion
- **Notifications**: react-hot-toast
- **Icons**: react-icons

### Backend / Storage
- **Database**: Firebase Firestore
- **File Storage**: Firebase Storage
- **Metadata**: IPFS via Pinata
- **Auth**: Wallet-based (no traditional auth)

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier (optional)
- **Testing**: Hardhat (for contracts)

---

## Environment Variables

### Root `.env` (Contracts)
```bash
PRIVATE_KEY=                    # Deployer private key
AVALANCHE_FUJI_RPC_URL=        # RPC endpoint
SNOWTRACE_API_KEY=             # For verification
INITIAL_HEART_SUPPLY=          # Token initial supply
```

### Frontend `.env.local`
```bash
# Network
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_CHAIN_ID=

# Contracts
NEXT_PUBLIC_HEART_TOKEN_ADDRESS=
NEXT_PUBLIC_MATCH_NFT_ADDRESS=
NEXT_PUBLIC_DATING_CONTROLLER_ADDRESS=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Pinata (IPFS)
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_KEY=
PINATA_JWT=

# App
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_NETWORK_NAME=
```

---

## Dependencies

### Root (Contracts)
```json
{
  "hardhat": "^2.19.4",
  "@nomicfoundation/hardhat-toolbox": "^4.0.0",
  "@openzeppelin/contracts": "^5.0.1",
  "dotenv": "^16.3.1"
}
```

### Frontend
```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "ethers": "^6.9.2",
  "firebase": "^10.7.1",
  "zustand": "^4.4.7",
  "framer-motion": "^10.16.16",
  "react-hot-toast": "^2.4.1",
  "react-icons": "^4.12.0",
  "tailwindcss": "^3.4.0"
}
```

---

## Code Statistics

### Smart Contracts
- Total Lines: ~600
- Contracts: 3
- Functions: 25+
- Events: 5
- Tests: (to be added)

### Frontend
- Total Lines: ~2,500
- Components: 6
- Pages: 4
- Utilities: 4 files
- Type Definitions: 5+ interfaces

### Total Project
- **Files**: 30+
- **Lines of Code**: ~3,100
- **Languages**: Solidity, TypeScript, CSS
- **Documentation**: 5 MD files, 2,000+ lines

---

## Build Commands

### Contracts
```bash
npm install              # Install dependencies
npx hardhat compile     # Compile contracts
npx hardhat test        # Run tests
npx hardhat run scripts/deploy.js --network fuji  # Deploy
```

### Frontend
```bash
cd frontend
npm install             # Install dependencies
npm run dev            # Development server
npm run build          # Production build
npm run start          # Start production server
```

---

## Maintenance

### Update Dependencies
```bash
# Root
npm update

# Frontend
cd frontend
npm update
```

### Check for Vulnerabilities
```bash
npm audit
npm audit fix
```

### Clean Build
```bash
# Contracts
npx hardhat clean
rm -rf artifacts cache

# Frontend
rm -rf frontend/.next
rm -rf frontend/node_modules
cd frontend && npm install
```

---

## Git Workflow

```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit: Dating dApp MVP"

# Create repo on GitHub
gh repo create dating-dapp --public

# Push
git branch -M main
git remote add origin https://github.com/username/dating-dapp.git
git push -u origin main
```

---

This structure is designed for:
- **Modularity**: Each component has a single responsibility
- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns
- **Developer Experience**: Well-organized and documented
