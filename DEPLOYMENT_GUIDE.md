# Deployment Guide

This guide walks you through deploying the Dating dApp from scratch.

---

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] npm or yarn installed
- [ ] MetaMask or Core Wallet with AVAX on Fuji
- [ ] Firebase project created
- [ ] Pinata account (for IPFS) - optional but recommended
- [ ] Code editor (VS Code recommended)

---

## Part 1: Deploy Smart Contracts

### Step 1: Install Dependencies

```bash
cd Dating-dApp
npm install
```

This installs:
- Hardhat
- OpenZeppelin contracts
- ethers.js
- Other dev dependencies

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Your wallet private key (DO NOT COMMIT!)
# Export from MetaMask: Account Details > Export Private Key
PRIVATE_KEY=your_private_key_without_0x_prefix

# Avalanche Fuji RPC
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Optional: Snowtrace API key for verification
SNOWTRACE_API_KEY=your_api_key

# Initial HEART supply (1 billion tokens)
INITIAL_HEART_SUPPLY=1000000000
```

⚠️ **Security Warning**: Never commit your `.env` file! It's in `.gitignore` by default.

### Step 3: Get Test AVAX

Visit https://faucet.avax.network/
- Select "Fuji (C-Chain)"
- Enter your wallet address
- Request AVAX
- Wait for confirmation (~30 seconds)

Verify you have AVAX:
```bash
npx hardhat run scripts/checkBalance.js --network fuji
```

### Step 4: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 10 Solidity files successfully
```

### Step 5: Deploy to Fuji

```bash
npx hardhat run scripts/deploy.js --network fuji
```

This will:
1. Deploy HeartToken with initial supply
2. Deploy MatchNFT
3. Deploy DatingController
4. Set DatingController as minter for both tokens
5. Save addresses to `deployments/fuji-latest.json`

**Save these addresses!** You'll need them for the frontend.

Example output:
```
🚀 Starting deployment to fuji
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Deploying with account: 0x742d35Cc...
💰 Account balance: 10.0 AVAX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Deploying HeartToken...
✅ HeartToken deployed to: 0x1234567890abcdef...

2️⃣  Deploying MatchNFT...
✅ MatchNFT deployed to: 0xabcdef1234567890...

3️⃣  Deploying DatingController...
✅ DatingController deployed to: 0xfedcba0987654321...

🎉 DEPLOYMENT COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 6: Verify Contracts (Optional but Recommended)

```bash
# Verify HeartToken
npx hardhat verify --network fuji \
  0xYourHeartTokenAddress \
  "1000000000000000000000000000"

# Verify MatchNFT
npx hardhat verify --network fuji \
  0xYourMatchNFTAddress

# Verify DatingController
npx hardhat verify --network fuji \
  0xYourDatingControllerAddress \
  "0xHeartTokenAddress" \
  "0xMatchNFTAddress"
```

Verified contracts can be viewed on https://testnet.snowtrace.io/

---

## Part 2: Set Up Firebase

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "dating-dapp")
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

### Step 2: Enable Firestore

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (we'll add rules later)
4. Choose a location (e.g., us-central)
5. Click "Enable"

### Step 3: Enable Storage

1. Click "Storage" in sidebar
2. Click "Get started"
3. Start in test mode
4. Click "Done"

### Step 4: Get Firebase Config

1. Click "Project Settings" (gear icon)
2. Scroll to "Your apps"
3. Click "</> Web"
4. Register app (name: "dating-dapp-web")
5. Copy the config object

Example config:
```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "dating-dapp.firebaseapp.com",
  projectId: "dating-dapp",
  storageBucket: "dating-dapp.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
}
```

### Step 5: Set Firestore Security Rules

In Firestore Console, go to "Rules" tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{wallet} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == wallet;
    }

    // Likes collection
    match /likes/{likeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }

    // Matches collection
    match /matches/{matchId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }

    // Messages collection
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

Click "Publish"

---

## Part 3: Set Up Pinata (IPFS)

### Step 1: Create Pinata Account

1. Go to https://pinata.cloud/
2. Sign up for free account
3. Verify email

### Step 2: Get API Keys

1. Go to https://app.pinata.cloud/keys
2. Click "New Key"
3. Enable "pinFileToIPFS" and "pinJSONToIPFS"
4. Name it "dating-dapp"
5. Click "Create Key"
6. **Copy and save** API Key and API Secret

### Step 3: Get JWT (Recommended)

1. In Pinata dashboard, go to "API Keys"
2. Click "Generate JWT"
3. Copy the JWT token

---

## Part 4: Deploy Frontend

### Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```bash
# Avalanche Fuji
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_CHAIN_ID=43113

# Contract Addresses (from Part 1 deployment)
NEXT_PUBLIC_HEART_TOKEN_ADDRESS=0xYourHeartTokenAddress
NEXT_PUBLIC_MATCH_NFT_ADDRESS=0xYourMatchNFTAddress
NEXT_PUBLIC_DATING_CONTROLLER_ADDRESS=0xYourDatingControllerAddress

# Firebase Configuration (from Part 2)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dating-dapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dating-dapp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dating-dapp.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123

# Pinata (from Part 3)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token

# App Settings
NEXT_PUBLIC_APP_NAME=DatingDApp
NEXT_PUBLIC_NETWORK_NAME=Avalanche Fuji
```

### Step 3: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### Step 4: Test the App

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve MetaMask connection
   - Switch to Fuji if prompted

2. **Create Profile** (manual for MVP)
   - For MVP, you'll need to manually add profiles to Firestore
   - Or build a profile creation form

3. **Test Swiping**
   - Add 2+ profiles to Firestore
   - Start swiping
   - Like someone

4. **Test Matching**
   - Have two accounts like each other
   - Should see "It's a Match!" modal
   - Check Snowtrace for Match NFT transaction

5. **Test Boost**
   - Go to Boost page
   - Click "Boost Me"
   - Approve transaction
   - Verify boost status updates

### Step 5: Build for Production

```bash
npm run build
npm run start
```

---

## Part 5: Deploy to Production

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
# Add environment variables in Vercel dashboard
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod
```

### Option C: Self-Hosted

```bash
# Build
npm run build

# Copy .next folder to your server
# Run with PM2 or similar
pm2 start npm --name "dating-dapp" -- start
```

---

## Part 6: Post-Deployment

### 1. Test All Features

- [ ] Wallet connection
- [ ] Profile creation
- [ ] Swiping
- [ ] Liking
- [ ] Matching
- [ ] NFT minting
- [ ] HEART rewards
- [ ] Boost purchase
- [ ] Leaderboard
- [ ] Profile view

### 2. Monitor Contracts

```bash
# Check HEART balance
node scripts/interact.js balance 0xYourAddress

# Check boost status
node scripts/interact.js boost-status 0xYourAddress
```

### 3. Add Profiles for Testing

Create test profiles in Firestore:

```json
{
  "wallet": "0x123...",
  "displayName": "Alice",
  "age": 25,
  "bio": "Love crypto",
  "gender": "female",
  "lookingFor": "male",
  "photos": ["https://..."],
  "lastSeen": 1704067200000,
  "boostedUntil": 0,
  "createdAt": 1704000000000,
  "interests": ["crypto", "hiking"]
}
```

### 4. Share with Testers

Give testers:
- Frontend URL
- Instructions to get Fuji AVAX
- Link to create profiles

---

## Troubleshooting

### Contract Deployment Fails

**Error**: `insufficient funds`
- Get more AVAX from faucet
- Wait a few minutes and retry

**Error**: `nonce too high`
- Reset MetaMask account: Settings > Advanced > Reset Account

### Frontend Can't Connect to Contracts

- Verify contract addresses in `.env.local`
- Check network is Fuji (chainId 43113)
- Clear browser cache
- Check browser console for errors

### Firebase Permission Denied

- Check Firestore rules are published
- Verify Firebase config is correct
- Check browser console for specific errors

### IPFS Upload Fails

- Verify Pinata API keys
- Check file size (<10MB for free tier)
- Try using JWT instead of API keys

---

## Maintenance

### Update Reward Rates

```bash
# 15 HEART per match, 2 HEART per like
node scripts/interact.js update-rewards 15 2
```

### Update Boost Settings

```bash
# 0.02 AVAX, 60 minutes
node scripts/interact.js update-boost 0.02 60
```

### Withdraw Boost Revenue

```bash
node scripts/interact.js withdraw 0xYourTreasuryAddress
```

### Monitor Activity

Use Snowtrace to monitor:
- Match creation events
- Boost purchases
- Token transfers

---

## Security Checklist

Before going to mainnet:

- [ ] Audit smart contracts
- [ ] Use multi-sig for owner functions
- [ ] Implement backend service for `confirmMatch`
- [ ] Add rate limiting on likes
- [ ] Enable Firebase App Check
- [ ] Set up monitoring and alerts
- [ ] Test with bug bounty program
- [ ] Purchase insurance (OpenZeppelin Defender)

---

## Next Steps

1. **Add Profile Creation UI**
   - Build a form for users to create profiles
   - Upload photos to Firebase Storage

2. **Add Chat Functionality**
   - Real-time messaging between matches
   - Consider XMTP for decentralized chat

3. **Improve Discovery Algorithm**
   - Location-based matching
   - Interest-based recommendations
   - Machine learning recommendations

4. **Mobile App**
   - Build React Native app
   - Use WalletConnect for mobile wallets

5. **Go to Mainnet**
   - Deploy to Avalanche C-Chain
   - Update all configs to mainnet
   - Announce launch!

---

**Deployment Complete! 🎉**

Your Dating dApp is now live on Avalanche Fuji testnet.
