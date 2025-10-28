# End-to-End Example: Complete User Journey

This document walks through an exact scenario showing how every piece of the system works together.

---

## Scenario

**Alice** and **Bob** are two users who will match on the Dating dApp.

- Alice's wallet: `0xAlice123...`
- Bob's wallet: `0xBob456...`

---

## Step 1: Alice Connects Wallet

### Frontend Code
```typescript
// components/WalletConnectButton.tsx
async function connectWallet() {
  // Request MetaMask connection
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  const address = accounts[0]; // 0xAlice123...

  // Check network
  const isCorrectNetwork = await checkNetwork();
  if (!isCorrectNetwork) {
    await switchToFuji(); // Switch to Fuji (chainId 43113)
  }

  // Store in global state
  setAddress(address);
}
```

### What Happens
1. MetaMask popup appears
2. Alice approves connection
3. If not on Fuji, prompted to switch networks
4. Wallet address stored: `0xAlice123...`

### On-Chain State
- No on-chain interaction yet

### Off-Chain State
- `useWalletStore.address = "0xAlice123..."`
- `useWalletStore.isConnected = true`

---

## Step 2: Alice Creates Profile

### Frontend Code
```typescript
// Alice fills out profile form
const profile = {
  wallet: "0xAlice123...",
  displayName: "Alice",
  age: 25,
  bio: "Love hiking and crypto",
  gender: "female",
  lookingFor: "male",
  photos: ["https://storage.firebase.com/alice1.jpg"],
  interests: ["hiking", "crypto", "travel"]
};

// lib/firebase.ts
await createUserProfile(profile);
```

### What Happens
1. Photos uploaded to Firebase Storage
2. Profile document created in Firestore

### On-Chain State
- No on-chain interaction

### Off-Chain State (Firestore)
```json
// Collection: users
// Document ID: 0xalice123... (lowercase)
{
  "wallet": "0xalice123...",
  "displayName": "Alice",
  "age": 25,
  "bio": "Love hiking and crypto",
  "gender": "female",
  "lookingFor": "male",
  "photos": ["https://storage.firebase.com/alice1.jpg"],
  "lastSeen": 1704067200000,
  "boostedUntil": 0,
  "createdAt": 1704067200000,
  "interests": ["hiking", "crypto", "travel"]
}
```

---

## Step 3: Bob Does the Same

Bob connects wallet `0xBob456...` and creates his profile:

```json
// Collection: users
// Document ID: 0xbob456...
{
  "wallet": "0xbob456...",
  "displayName": "Bob",
  "age": 28,
  "bio": "Developer and adventurer",
  "gender": "male",
  "lookingFor": "female",
  "photos": ["https://storage.firebase.com/bob1.jpg"],
  "lastSeen": 1704067300000,
  "boostedUntil": 0,
  "createdAt": 1704067300000,
  "interests": ["coding", "travel", "hiking"]
}
```

---

## Step 4: Alice Browses & Likes Bob

### Frontend Code
```typescript
// components/SwipeDeck.tsx

// Load profiles for Alice
const profiles = await getSwipeProfiles("0xAlice123...");
// Returns: [Bob's profile, ...other male profiles]

// Alice sees Bob's profile and clicks "Like"
async function handleLike(type: 'like') {
  // Record the like
  await recordLike("0xAlice123...", "0xBob456...", "like");

  // Check if mutual
  const isMutual = await checkMutualLike("0xAlice123...", "0xBob456...");
  // Returns: false (Bob hasn't liked Alice yet)

  // Not a match yet, just move to next profile
  nextProfile();

  toast.success("You liked Bob!");
}
```

### What Happens
1. Alice's like is recorded in Firestore
2. System checks if Bob already liked Alice (he hasn't)
3. No match yet, move to next profile

### On-Chain State
- No on-chain interaction yet

### Off-Chain State (Firestore)
```json
// Collection: likes
// Auto-generated document ID
{
  "fromWallet": "0xalice123...",
  "toWallet": "0xbob456...",
  "type": "like",
  "timestamp": 1704067400000
}
```

---

## Step 5: Bob Browses & Likes Alice Back

### Frontend Code
```typescript
// Bob is swiping and sees Alice
const profiles = await getSwipeProfiles("0xBob456...");
// Returns: [Alice's profile, ...other female profiles]

// Bob likes Alice
async function handleLike(type: 'like') {
  // Record the like
  await recordLike("0xBob456...", "0xAlice123...", "like");

  // Check if mutual
  const isMutual = await checkMutualLike("0xBob456...", "0xAlice123...");
  // Returns: TRUE! Alice already liked Bob

  // IT'S A MATCH!
  await processMatch(aliceProfile);
}
```

### What Happens
1. Bob's like is recorded
2. System finds Alice's existing like
3. **MUTUAL MATCH DETECTED**
4. Match processing begins

### Off-Chain State (Firestore)
```json
// Collection: likes (new document)
{
  "fromWallet": "0xbob456...",
  "toWallet": "0xalice123...",
  "type": "like",
  "timestamp": 1704067500000
}
```

Now we have TWO like documents (mutual):
- Alice → Bob
- Bob → Alice

---

## Step 6: Process Match (On-Chain)

### Frontend Code
```typescript
async function processMatch(matchedUser: UserProfile) {
  toast.loading('Creating match on-chain...');

  // 1. Create IPFS metadata
  const timestamp = Math.floor(Date.now() / 1000); // 1704067500
  const tokenURI = await createMatchMetadata(
    "0xAlice123...",
    "0xBob456...",
    timestamp
  );
  // Returns: "ipfs://QmXYZ123..."

  // 2. Get contract instance with signer (Bob's wallet)
  const signer = await getSigner(); // Bob's signer
  const contract = await getDatingControllerContract(true);

  // 3. Call confirmMatch on smart contract
  const tx = await contract.confirmMatch(
    "0xAlice123...",
    "0xBob456...",
    tokenURI
  );

  // 4. Wait for transaction
  const receipt = await tx.wait();

  // 5. Parse events from receipt
  const matchEvent = receipt.logs.find(log => {
    const parsed = contract.interface.parseLog(log);
    return parsed?.name === 'MatchCreated';
  });

  const parsed = contract.interface.parseLog(matchEvent);
  const tokenIdA = Number(parsed.args.tokenIdA); // 1
  const tokenIdB = Number(parsed.args.tokenIdB); // 2

  // 6. Save to Firestore
  await createMatch("0xAlice123...", "0xBob456...", tokenIdA, tokenIdB);

  // 7. Show match modal
  setMatchModal(true, matchedUser);

  toast.success('Match created! 🎉');
}
```

### IPFS Metadata Created
```json
// Uploaded to IPFS via Pinata
// ipfs://QmXYZ123...
{
  "name": "Match #1704067500000",
  "description": "On-chain proof that two wallets matched on the Dating dApp",
  "image": "https://gateway.pinata.cloud/ipfs/QmMatchBadge...",
  "attributes": [
    {
      "trait_type": "userA",
      "value": "0xAlice123..."
    },
    {
      "trait_type": "userB",
      "value": "0xBob456..."
    },
    {
      "trait_type": "timestamp",
      "value": 1704067500
    },
    {
      "trait_type": "platform",
      "value": "Dating dApp on Avalanche"
    }
  ]
}
```

### Smart Contract Execution

**Contract Called**: `DatingController.confirmMatch()`

```solidity
function confirmMatch(
    address userA,    // 0xAlice123...
    address userB,    // 0xBob456...
    string memory tokenURI  // ipfs://QmXYZ123...
) external onlyOwner nonReentrant {
    // 1. Create match identifier
    bytes32 matchId = keccak256(abi.encodePacked(userA, userB));

    // 2. Check match doesn't exist
    require(!matchExists[matchId], "Match already exists");
    matchExists[matchId] = true;

    // 3. Mint NFT to Alice
    uint256 tokenIdA = matchNFT.mintMatchNFT(userA, userB, tokenURI);
    // tokenIdA = 1

    // 4. Mint NFT to Bob
    uint256 tokenIdB = matchNFT.mintMatchNFT(userB, userA, tokenURI);
    // tokenIdB = 2

    // 5. Reward Alice with HEART
    heartToken.mint(userA, matchReward); // 10 * 10^18

    // 6. Reward Bob with HEART
    heartToken.mint(userB, matchReward); // 10 * 10^18

    // 7. Emit events
    emit MatchCreated(userA, userB, tokenIdA, tokenIdB);
    emit RewardPaid(userA, matchReward, "match");
    emit RewardPaid(userB, matchReward, "match");
}
```

### On-Chain State After Match

**HeartToken Contract**:
```
balanceOf[0xAlice123...] = 10000000000000000000 (10 HEART)
balanceOf[0xBob456...] = 10000000000000000000 (10 HEART)
totalSupply increased by 20 HEART
```

**MatchNFT Contract**:
```
// Token ID 1 (Alice's NFT)
ownerOf[1] = 0xAlice123...
tokenURI[1] = "ipfs://QmXYZ123..."
matchData[1] = {
  userA: 0xAlice123...,
  userB: 0xBob456...,
  timestamp: 1704067500
}

// Token ID 2 (Bob's NFT)
ownerOf[2] = 0xBob456...
tokenURI[2] = "ipfs://QmXYZ123..."
matchData[2] = {
  userA: 0xBob456...,
  userB: 0xAlice123...,
  timestamp: 1704067500
}

totalSupply = 2
```

**DatingController Contract**:
```
matchExists[keccak256(Alice, Bob)] = true
```

### Events Emitted
```
MatchCreated(
  userA: 0xAlice123...,
  userB: 0xBob456...,
  tokenIdA: 1,
  tokenIdB: 2
)

RewardPaid(to: 0xAlice123..., amount: 10e18, reason: "match")
RewardPaid(to: 0xBob456..., amount: 10e18, reason: "match")
```

### Off-Chain State (Firestore)
```json
// Collection: matches
// Document ID: 0xalice123...0xbob456...1704067500000
{
  "matchId": "0xalice123...0xbob456...1704067500000",
  "userA": "0xalice123...",
  "userB": "0xbob456...",
  "createdAt": 1704067500000,
  "nftTokenIdA": 1,
  "nftTokenIdB": 2
}
```

### What Bob Sees
1. Loading toast: "Creating match on-chain..."
2. MetaMask popup: "Approve transaction"
3. After confirmation: "Match created! 🎉"
4. **Match Modal appears:**
   - "It's a Match!"
   - Alice's profile displayed
   - Buttons: "Start Chatting" / "Keep Swiping"

---

## Step 7: Alice Sees the Match Too

When Alice refreshes or next visits:

```typescript
// Load Alice's matches
const matches = await getUserMatches("0xAlice123...");
// Returns: [{ matchId: "...", userB: "0xBob456...", ... }]

// Load Alice's NFTs
const nfts = await getUserMatchNFTs("0xAlice123...");
// Returns: [{
//   tokenId: 1,
//   partner: "0xBob456...",
//   timestamp: 1704067500,
//   tokenURI: "ipfs://QmXYZ123..."
// }]

// Load HEART balance
const balance = await getHeartBalance("0xAlice123...");
// Returns: "10.0"
```

Alice's profile page shows:
- **HEART Balance**: 10 HEART
- **Matches**: 1
- **Match NFT #1**: With Bob (0xBob456...)

---

## Step 8: Bob Purchases a Boost

Bob wants more matches, so he buys a boost.

### Frontend Code
```typescript
// components/BoostPanel.tsx
async function handlePurchaseBoost() {
  // Get boost price
  const contract = await getDatingControllerContract(true);
  const boostPrice = await contract.boostPrice();
  // Returns: 10000000000000000 (0.01 AVAX in wei)

  // Call purchaseBoost with payment
  const tx = await contract.purchaseBoost({
    value: boostPrice
  });

  await tx.wait();

  // Update Firestore
  const newBoostEnd = Math.floor(Date.now() / 1000) + 1800; // +30 min
  await updateBoostStatus("0xBob456...", newBoostEnd);

  toast.success('Boost activated! 🚀');
}
```

### Smart Contract Execution

**Contract Called**: `DatingController.purchaseBoost()`

```solidity
function purchaseBoost() external payable nonReentrant {
    // 1. Check payment
    require(msg.value >= boostPrice, "Insufficient payment");
    // msg.value = 10000000000000000 (0.01 AVAX)

    // 2. Calculate boost end time
    uint256 currentBoostEnd = boostedUntil[msg.sender]; // 0 (not boosted)
    uint256 newBoostEnd;

    if (currentBoostEnd > block.timestamp) {
        // Extend existing boost
        newBoostEnd = currentBoostEnd + boostDuration;
    } else {
        // New boost
        newBoostEnd = block.timestamp + boostDuration;
        // block.timestamp = 1704067600
        // boostDuration = 1800 (30 minutes)
        // newBoostEnd = 1704069400
    }

    // 3. Update mapping
    boostedUntil[msg.sender] = newBoostEnd;

    // 4. Emit event
    emit BoostPurchased(msg.sender, newBoostEnd, msg.value);

    // 5. Refund excess (none in this case)
}
```

### On-Chain State After Boost

**DatingController Contract**:
```
boostedUntil[0xBob456...] = 1704069400 (timestamp)
balance[DatingController] = 10000000000000000 (0.01 AVAX)
```

### Events Emitted
```
BoostPurchased(
  user: 0xBob456...,
  boostedUntil: 1704069400,
  amountPaid: 10000000000000000
)
```

### Off-Chain State (Firestore)
```json
// Collection: users
// Document ID: 0xbob456...
{
  ...
  "boostedUntil": 1704069400000, // Synced from chain
  ...
}
```

### What Happens Next

When other users swipe:
```typescript
// lib/firebase.ts - getSwipeProfiles()
let profiles = await getProfiles();

// Sort boosted profiles first
profiles.sort((a, b) => {
  const aBoost = a.boostedUntil > Date.now() ? 1 : 0;
  const bBoost = b.boostedUntil > Date.now() ? 1 : 0;
  return bBoost - aBoost; // Bob appears first!
});
```

Bob's profile now appears first in everyone's swipe deck for the next 30 minutes.

---

## Summary: Complete State After All Steps

### On-Chain (Avalanche Fuji)

**HeartToken**:
- Alice: 10 HEART
- Bob: 10 HEART

**MatchNFT**:
- Token #1 owned by Alice (partner: Bob)
- Token #2 owned by Bob (partner: Alice)

**DatingController**:
- Match exists between Alice & Bob
- Bob boosted until 1704069400
- Contract holds 0.01 AVAX from boost payment

### Off-Chain (Firestore)

**users**:
- Alice's profile
- Bob's profile (boostedUntil: 1704069400000)

**likes**:
- Alice → Bob
- Bob → Alice

**matches**:
- Alice ↔ Bob (tokenIdA: 1, tokenIdB: 2)

### IPFS

**ipfs://QmXYZ123...**:
- Match metadata JSON
- Referenced by both NFTs

---

## Transaction History (Snowtrace)

All transactions visible on https://testnet.snowtrace.io:

1. **Deploy HeartToken** - Contract creation
2. **Deploy MatchNFT** - Contract creation
3. **Deploy DatingController** - Contract creation
4. **setMinter (HeartToken)** - Set DatingController as minter
5. **setMinter (MatchNFT)** - Set DatingController as minter
6. **confirmMatch** - Match creation (emits MatchCreated, 2x RewardPaid)
7. **purchaseBoost** - Bob's boost purchase

---

## What Each User Can Do Now

### Alice Can:
- View her Match NFT #1 in Profile
- See 10 HEART balance
- Chat with Bob (if implemented)
- Continue swiping for more matches
- Buy a boost for herself

### Bob Can:
- View his Match NFT #2 in Profile
- See 10 HEART balance
- Chat with Alice
- Continue swiping (boosted for 30 min)
- Extend his boost

---

## Key Takeaways

1. **Wallet = Identity**: No email, no password, just wallet address
2. **Privacy**: Personal data (photos, bio) stays off-chain
3. **Proof**: Match NFTs are permanent on-chain proof
4. **Incentives**: HEART tokens reward engagement
5. **Economics**: Boosts generate revenue in AVAX
6. **Transparency**: All matches and boosts are verifiable on-chain

---

This completes the full end-to-end flow from wallet connection to match creation and boost purchase!
