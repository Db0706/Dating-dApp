# Dating dApp - Web3 Dating on Avalanche

A decentralized dating application built on Avalanche Fuji testnet featuring:
- 🔥 Tinder-style swiping
- 💎 ERC-20 HEART token rewards
- 🎨 On-chain Match NFTs
- 🚀 Paid visibility boosts
- 📊 Leaderboard & gamification

---

## 🎯 Core Features

### Swipe to Match
- Browse profiles in a Tinder-style swipe deck
- Like or Superlike other users
- Get matched when both users like each other

### On-Chain Match NFTs
- Every match is minted as an ERC-721 NFT
- Both users receive a unique Match NFT
- NFT metadata stored on IPFS
- Permanent proof of your match on-chain

### HEART Token Rewards
- Earn 10 HEART per successful match
- Earn 1 HEART per like/superlike
- Trade or hold tokens for clout
- Leaderboard based on token balance

### Visibility Boosts
- Pay 0.01 AVAX for 30 minutes of 10x visibility
- Appear first in swipe decks
- Boost status tracked on-chain
- Stack boosts for extended visibility

---

## 🏗️ Architecture

### Smart Contracts

```
contracts/
├── HeartToken.sol          # ERC-20 reward token
├── MatchNFT.sol            # ERC-721 match receipts
└── DatingController.sol    # Main logic contract
```

**HeartToken.sol**
- ERC-20 token with 18 decimals
- Controlled minting (only DatingController can mint)
- Rewards for engagement and matches

**MatchNFT.sol**
- ERC-721 NFT for each match
- Stores match metadata (both wallets, timestamp)
- Metadata on IPFS

**DatingController.sol**
- Confirms matches and mints NFTs
- Distributes HEART rewards
- Handles boost purchases (payable in AVAX)
- Tracks boost status on-chain

### Frontend

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Swipe deck (home)
│   ├── boost/             # Boost purchase
│   ├── leaderboard/       # Top users
│   └── profile/           # User profile & NFTs
├── components/            # React components
│   ├── WalletConnectButton.tsx
│   ├── SwipeDeck.tsx
│   ├── BoostPanel.tsx
│   ├── MatchModal.tsx
│   ├── Leaderboard.tsx
│   └── Profile.tsx
└── lib/                   # Utilities
    ├── contracts.ts       # Web3 interactions
    ├── firebase.ts        # Database operations
    ├── ipfs.ts           # IPFS metadata
    └── store.ts          # State management
```

### Off-Chain Database

Firebase/Firestore stores:
- **users**: Profiles, photos, bio
- **likes**: Like/superlike records
- **matches**: Match records with NFT IDs
- **messages**: Chat messages (MVP: off-chain)

See `DATABASE_SCHEMA.md` for detailed schema.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ and npm
- MetaMask or Core Wallet
- AVAX on Fuji testnet (get from [Avalanche Faucet](https://faucet.avax.network/))

### 1. Clone & Install

```bash
git clone <your-repo>
cd Dating-dApp

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

**Root `.env` (for contracts):**
```bash
cp .env.example .env
# Edit .env and add:
# - Your private key
# - Avalanche Fuji RPC URL
```

**Frontend `.env` (for app):**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and add:
# - Firebase credentials
# - Contract addresses (after deployment)
# - Pinata API keys (for IPFS)
```

### 3. Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Fuji testnet
npx hardhat run scripts/deploy.js --network fuji

# Contracts will be deployed and addresses saved to deployments/
```

**Copy contract addresses** from the deployment output and add them to `frontend/.env.local`:
```
NEXT_PUBLIC_HEART_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_MATCH_NFT_ADDRESS=0x...
NEXT_PUBLIC_DATING_CONTROLLER_ADDRESS=0x...
```

### 4. Set Up Firebase

1. Create a Firebase project at https://firebase.google.com
2. Enable Firestore Database
3. Enable Firebase Storage
4. Copy your Firebase config to `frontend/.env.local`

**Firestore Collections** (will be auto-created):
- `users`
- `likes`
- `matches`
- `messages`

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

### 6. Connect Wallet & Test

1. Connect MetaMask/Core Wallet
2. Switch to Avalanche Fuji (app will prompt)
3. Create your profile
4. Start swiping!

---

## 📖 End-to-End User Flow

### Step 1: Connect Wallet

```typescript
// User clicks "Connect Wallet"
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

// Check network is Avalanche Fuji (chainId 43113)
// If not, prompt to switch
await switchToFuji();
```

### Step 2: Create Profile

```typescript
// User fills out profile form
const profile = {
  wallet: address,
  displayName: "Alice",
  age: 25,
  bio: "Love hiking and crypto",
  gender: "female",
  lookingFor: "male",
  photos: ["url1", "url2"],
  interests: ["hiking", "crypto"]
};

// Save to Firestore
await createUserProfile(profile);
```

### Step 3: Swipe & Like

```typescript
// User swipes through profiles
const profiles = await getSwipeProfiles(currentWallet);

// User likes someone
await recordLike(currentWallet, targetWallet, "like");

// Check if it's a mutual match
const isMutual = await checkMutualLike(currentWallet, targetWallet);
```

### Step 4: Match!

```typescript
// If mutual like detected...

// 1. Create IPFS metadata
const tokenURI = await createMatchMetadata(
  userA,
  userB,
  Math.floor(Date.now() / 1000)
);
// Returns: ipfs://QmXxx...

// 2. Call smart contract
const controller = await getDatingControllerContract(true);
const tx = await controller.confirmMatch(userA, userB, tokenURI);
const receipt = await tx.wait();

// 3. Extract NFT token IDs from MatchCreated event
// Event: MatchCreated(userA, userB, tokenIdA, tokenIdB)

// 4. Save match to database
await createMatch(userA, userB, tokenIdA, tokenIdB);

// 5. Show "It's a Match!" modal
setMatchModal(true, matchedUser);
```

**On-Chain State After Match:**
- ✅ User A receives Match NFT (token ID X)
- ✅ User B receives Match NFT (token ID Y)
- ✅ User A receives 10 HEART tokens
- ✅ User B receives 10 HEART tokens
- ✅ Match recorded in `matchExists` mapping

### Step 5: Purchase Boost

```typescript
// User clicks "Boost Me"
const boostPrice = await controller.boostPrice(); // 0.01 AVAX

// Send transaction
const tx = await controller.purchaseBoost({
  value: boostPrice
});
await tx.wait();

// On-chain: boostedUntil[user] = now + 30 minutes
// Frontend: User's profile appears first in swipe decks
```

**On-Chain State After Boost:**
- ✅ User paid 0.01 AVAX (stored in contract)
- ✅ `boostedUntil[user]` = current time + 1800 seconds
- ✅ `BoostPurchased` event emitted

### Step 6: View Profile & NFTs

```typescript
// Load user's Match NFTs
const nfts = await getUserMatchNFTs(userAddress);

// Returns array:
[
  {
    tokenId: 42,
    partner: "0xabc...",
    timestamp: 1704067200,
    tokenURI: "ipfs://QmXxx..."
  }
]

// Display in profile grid
```

---

## 🔧 Smart Contract Functions

### DatingController

```solidity
// Confirm a match and mint NFTs
function confirmMatch(
    address userA,
    address userB,
    string memory tokenURI
) external onlyOwner;

// Reward a user for sending a like
function rewardLike(address liker) external onlyOwner;

// Purchase a visibility boost
function purchaseBoost() external payable;

// Check boost status
function checkBoostStatus(address user)
    external view
    returns (bool isBoosted, uint256 timeRemaining);

// Update reward rates
function updateRewardRates(
    uint256 newMatchReward,
    uint256 newLikeReward
) external onlyOwner;

// Update boost settings
function updateBoostSettings(
    uint256 newBoostPrice,
    uint256 newBoostDuration
) external onlyOwner;
```

### Contract Addresses (Fuji)

After deployment, your contract addresses will be in `deployments/fuji-latest.json`.

Example:
```json
{
  "HeartToken": "0x123...",
  "MatchNFT": "0x456...",
  "DatingController": "0x789..."
}
```

---

## 🧪 Testing

### Test Contracts Locally

```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Run tests
npx hardhat test
```

### Test Frontend

```bash
cd frontend
npm run dev

# In another terminal
npm run test  # (if tests are configured)
```

---

## 📊 Tokenomics

### HEART Token ($HEART)

- **Total Supply**: 1,000,000,000 HEART
- **Decimals**: 18
- **Distribution**:
  - Initial supply minted to deployer
  - Ongoing rewards minted by DatingController

### Reward Rates (Configurable)

- **Match Reward**: 10 HEART per user
- **Like Reward**: 1 HEART per like

### Boost Pricing

- **Price**: 0.01 AVAX (configurable)
- **Duration**: 30 minutes (configurable)
- **Stacking**: Yes, can extend existing boost

---

## 🔐 Security Considerations

### MVP Limitations

⚠️ **This is an MVP for demonstration purposes. DO NOT use in production without:**

1. **Admin Key Management**
   - `confirmMatch` and `rewardLike` are `onlyOwner`
   - In production, use a backend service with secure key storage
   - Consider multi-sig for ownership

2. **Anti-Spam**
   - No rate limiting on likes (can farm HEART)
   - Solution: Backend service validates likes before rewarding
   - Implement cooldowns and daily limits

3. **Match Verification**
   - Frontend directly calls `confirmMatch` (trusts user)
   - Solution: Backend verifies mutual likes before on-chain call

4. **Privacy**
   - Profile photos stored off-chain (good!)
   - Messages are plain text (consider encryption)

5. **Access Control**
   - Firestore rules needed to prevent unauthorized writes
   - Example:
     ```javascript
     match /users/{wallet} {
       allow read: if true;
       allow write: if request.auth.uid == wallet;
     }
     ```

### Production Improvements

- [ ] Backend service with secure private key
- [ ] Rate limiting and spam detection
- [ ] Encrypted messaging (XMTP, Lit Protocol)
- [ ] Multi-sig contract ownership
- [ ] The Graph for event indexing
- [ ] Chainlink VRF for randomness (if needed)

---

## 🎨 Customization

### Update Reward Rates

```bash
# Using interact script
node scripts/interact.js update-rewards 15 2

# This sets:
# - Match reward: 15 HEART
# - Like reward: 2 HEART
```

### Update Boost Settings

```bash
node scripts/interact.js update-boost 0.02 60

# This sets:
# - Boost price: 0.02 AVAX
# - Boost duration: 60 minutes
```

### Withdraw Boost Payments

```bash
node scripts/interact.js withdraw 0xYourAddress

# Sends accumulated AVAX to specified address
```

---

## 📁 Project Structure

```
Dating-dApp/
├── contracts/              # Solidity smart contracts
│   ├── HeartToken.sol
│   ├── MatchNFT.sol
│   └── DatingController.sol
├── scripts/               # Deployment & utility scripts
│   ├── deploy.js
│   └── interact.js
├── deployments/          # Deployment artifacts
├── frontend/             # Next.js frontend
│   ├── app/             # Pages
│   ├── components/      # React components
│   ├── lib/            # Utilities
│   └── public/         # Static assets
├── hardhat.config.js    # Hardhat configuration
├── package.json
├── .env.example
├── README.md
└── DATABASE_SCHEMA.md   # Database documentation
```

---

## 🐛 Troubleshooting

### "Failed to connect wallet"
- Ensure MetaMask/Core Wallet is installed
- Check that you're on Avalanche Fuji network
- Try refreshing the page

### "Transaction failed"
- Check you have enough AVAX for gas
- Get test AVAX from https://faucet.avax.network/
- Verify contract addresses in .env.local

### "No profiles to swipe"
- Create your profile first
- Ensure your profile has `gender` and `lookingFor` set
- Check Firebase connection

### "Boost not working"
- Verify boost payment transaction succeeded
- Check `boostedUntil` value on-chain
- Wait a few seconds for status to sync

---

## 📜 License

MIT License - See LICENSE file

---

## 🙏 Acknowledgments

- Avalanche for the fast, low-cost blockchain
- OpenZeppelin for secure contract libraries
- Pinata for IPFS hosting
- Firebase for off-chain storage

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check DATABASE_SCHEMA.md for database questions
- Review contract comments for on-chain logic

---

## 🚧 Roadmap

### V2 Features
- [ ] Encrypted messaging (XMTP integration)
- [ ] Video profiles
- [ ] Advanced filters (age, location, interests)
- [ ] Multi-chain support (Polygon, BSC)
- [ ] Mobile app (React Native)
- [ ] DAO governance for parameters
- [ ] NFT profile pictures
- [ ] Token staking for premium features

---

**Built with ❤️ on Avalanche**
