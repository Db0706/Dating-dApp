# Database Schema Documentation

This document describes the off-chain database structure for the Dating dApp using Firestore/Supabase.

## Overview

The off-chain database stores user profiles, likes, matches, and messages. This data is kept off-chain for:
- Privacy (profile photos and personal info)
- Fast querying and filtering
- Reduced blockchain costs

The blockchain is used for:
- Match NFT minting (proof of match)
- HEART token rewards
- Boost payment and tracking

---

## Collections

### 1. **users**

Stores user profile information linked to their wallet address.

```typescript
interface UserProfile {
  wallet: string;              // Primary key (wallet address, lowercase)
  displayName: string;         // Display name
  age: number;                 // User age
  bio: string;                 // Short bio
  gender: string;              // "male" | "female" | "other"
  lookingFor: string;          // "male" | "female" | "other"
  photos: string[];            // Array of image URLs (Firebase Storage)
  lastSeen: number;            // Unix timestamp (milliseconds)
  boostedUntil: number;        // Unix timestamp (milliseconds) - mirror from chain
  createdAt: number;           // Unix timestamp (milliseconds)
  interests?: string[];        // Optional interests/tags
  location?: string;           // Optional location
}
```

**Indexes:**
- `wallet` (primary key)
- `gender` + `lastSeen` (for matchmaking queries)
- `boostedUntil` (for boost filtering)

**Example Document:**
```json
{
  "wallet": "0x1234567890abcdef...",
  "displayName": "Alice",
  "age": 25,
  "bio": "Love hiking and crypto",
  "gender": "female",
  "lookingFor": "male",
  "photos": [
    "https://firebasestorage.googleapis.com/...",
    "https://firebasestorage.googleapis.com/..."
  ],
  "lastSeen": 1704067200000,
  "boostedUntil": 0,
  "createdAt": 1704000000000,
  "interests": ["hiking", "crypto", "travel"],
  "location": "San Francisco"
}
```

---

### 2. **likes**

Records every like/superlike action between users.

```typescript
interface Like {
  fromWallet: string;          // Wallet that sent the like
  toWallet: string;            // Wallet that received the like
  type: 'like' | 'superlike';  // Type of like
  timestamp: number;           // Unix timestamp (milliseconds)
}
```

**Indexes:**
- `fromWallet` + `toWallet` (composite index for mutual like checks)
- `timestamp` (for ordering)

**Example Document:**
```json
{
  "fromWallet": "0x1234567890abcdef...",
  "toWallet": "0xabcdef1234567890...",
  "type": "like",
  "timestamp": 1704067200000
}
```

**Mutual Like Detection Logic:**

```typescript
async function checkMutualLike(userA: string, userB: string): Promise<boolean> {
  // Query 1: Check if userA liked userB
  const q1 = query(
    likesCollection,
    where('fromWallet', '==', userA.toLowerCase()),
    where('toWallet', '==', userB.toLowerCase())
  );

  // Query 2: Check if userB liked userA
  const q2 = query(
    likesCollection,
    where('fromWallet', '==', userB.toLowerCase()),
    where('toWallet', '==', userA.toLowerCase())
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  // If both queries return results, it's a match!
  return !snap1.empty && !snap2.empty;
}
```

---

### 3. **matches**

Stores confirmed matches after on-chain NFT minting.

```typescript
interface Match {
  matchId: string;             // Unique match ID
  userA: string;               // First user's wallet (lowercase)
  userB: string;               // Second user's wallet (lowercase)
  createdAt: number;           // Unix timestamp (milliseconds)
  nftTokenIdA?: number;        // NFT token ID for userA
  nftTokenIdB?: number;        // NFT token ID for userB
}
```

**Indexes:**
- `matchId` (primary key)
- `userA` (for querying user's matches)
- `userB` (for querying user's matches)
- `createdAt` (for ordering)

**Example Document:**
```json
{
  "matchId": "0x1234...0xabcd...1704067200000",
  "userA": "0x1234567890abcdef...",
  "userB": "0xabcdef1234567890...",
  "createdAt": 1704067200000,
  "nftTokenIdA": 42,
  "nftTokenIdB": 43
}
```

**Match Creation Flow:**

```typescript
async function createMatchFlow(userA: string, userB: string) {
  // 1. Create metadata and upload to IPFS
  const tokenURI = await createMatchMetadata(userA, userB, Date.now());

  // 2. Call smart contract to mint NFTs and reward tokens
  const contract = await getDatingControllerContract(true);
  const tx = await contract.confirmMatch(userA, userB, tokenURI);
  const receipt = await tx.wait();

  // 3. Extract token IDs from event
  const matchEvent = receipt.logs.find(log => /* parse MatchCreated event */);
  const tokenIdA = matchEvent.args.tokenIdA;
  const tokenIdB = matchEvent.args.tokenIdB;

  // 4. Store match in database
  await createMatch(userA, userB, tokenIdA, tokenIdB);
}
```

---

### 4. **messages**

Stores off-chain chat messages between matched users.

```typescript
interface Message {
  matchId: string;             // Reference to match
  fromWallet: string;          // Sender's wallet
  message: string;             // Message text
  sentAt: number;              // Unix timestamp (milliseconds)
  read: boolean;               // Read status
}
```

**Indexes:**
- `matchId` + `sentAt` (composite index for chronological messages)
- `fromWallet` (for sent messages)

**Example Document:**
```json
{
  "matchId": "0x1234...0xabcd...1704067200000",
  "fromWallet": "0x1234567890abcdef...",
  "message": "Hey! How are you?",
  "sentAt": 1704067300000,
  "read": false
}
```

**Note:** For MVP, messages are stored in plain text. In production, consider:
- End-to-end encryption
- XMTP or similar Web3 messaging protocol
- On-chain message hashes for verification

---

## Backend Services / Cloud Functions

### Match Detection Service

This service monitors the `likes` collection and triggers match creation:

```typescript
// Triggered when a new like is created
async function onLikeCreated(like: Like) {
  // Check if it creates a mutual match
  const isMutual = await checkMutualLike(like.fromWallet, like.toWallet);

  if (isMutual) {
    // Process match on-chain
    await createMatchFlow(like.fromWallet, like.toWallet);
  }
}
```

### Boost Status Sync Service

Periodically syncs boost status from blockchain to database:

```typescript
async function syncBoostStatus(wallet: string) {
  const contract = await getDatingControllerContract();
  const boostedUntil = await contract.boostedUntil(wallet);

  await updateUserProfile(wallet, {
    boostedUntil: Number(boostedUntil) * 1000 // Convert to milliseconds
  });
}
```

### Like Reward Service

Called by backend when a legitimate like is recorded:

```typescript
async function rewardLikeOffChain(wallet: string) {
  // Anti-spam checks here (rate limiting, etc.)

  // Call contract to reward
  const contract = await getDatingControllerContract(true); // with admin signer
  await contract.rewardLike(wallet);
}
```

---

## Discovery Algorithm

The swipe deck uses this logic to show profiles:

```typescript
async function getSwipeProfiles(currentWallet: string) {
  const currentUser = await getUserProfile(currentWallet);

  // Base query: users of the gender we're looking for
  let profiles = await query(
    usersCollection,
    where('gender', '==', currentUser.lookingFor),
    orderBy('lastSeen', 'desc'),
    limit(20)
  );

  // Filter out:
  // 1. Already liked users
  // 2. Already matched users
  // 3. Current user

  // Prioritize boosted users
  profiles.sort((a, b) => {
    const aBoost = a.boostedUntil > Date.now() ? 1 : 0;
    const bBoost = b.boostedUntil > Date.now() ? 1 : 0;
    return bBoost - aBoost; // Boosted users first
  });

  return profiles;
}
```

---

## Security & Privacy Considerations

1. **Wallet Validation**: Always validate that the connected wallet matches the user's claimed wallet before any write operations.

2. **Photo Storage**: Store photos in Firebase Storage with proper access controls. Never store photos on-chain/IPFS for privacy.

3. **Anti-Spam**: Implement rate limiting on likes to prevent farming HEART tokens:
   - Max 100 likes per day per wallet
   - Cooldown between likes (e.g., 2 seconds)

4. **Match Verification**: Before calling `confirmMatch` on-chain, verify:
   - Both likes exist in database
   - Match doesn't already exist
   - Users haven't blocked each other

5. **Access Control**: Use Firestore security rules:
   ```javascript
   // Users can only write to their own profile
   match /users/{wallet} {
     allow read: if true;
     allow write: if request.auth.uid == wallet;
   }
   ```

---

## Migration Path for Production

For production deployment, consider:

1. **Supabase** for better SQL querying and real-time subscriptions
2. **Redis** for caching boost status and leaderboard
3. **IPFS/Arweave** for match NFT metadata (already implemented)
4. **The Graph** for indexing on-chain events
5. **Encrypted messaging** using XMTP or Lit Protocol

---

## Summary

This schema separates concerns optimally:
- **On-chain**: Match proofs (NFTs), rewards (HEART), boost payments
- **Off-chain**: User data, matchmaking logic, chat

The backend service acts as the "admin" that:
1. Monitors mutual likes
2. Calls on-chain `confirmMatch` when appropriate
3. Rewards legitimate likes
4. Syncs boost status for fast UI queries
