# Assumptions & Limitations

This document outlines the assumptions, limitations, and simplifications made in this MVP implementation.

---

## MVP Scope

This is a **V1 / MVP** implementation optimized for:
- Fast development and demonstration
- Proof of concept
- Testing core functionality
- Learning Web3 integration

**NOT optimized for:**
- Production deployment at scale
- Security hardening
- Regulatory compliance
- Advanced features

---

## Smart Contract Assumptions

### 1. Owner-Controlled Match Creation

**Assumption**: The contract owner (or authorized backend) is trusted to call `confirmMatch()`.

**Why**:
- Frontend could directly call this, but that trusts users
- Production should have a backend service that verifies mutual likes before calling

**Risk**:
- Malicious owner could create fake matches
- Frontend could be modified to create unauthorized matches

**Solution for Production**:
- Implement a backend service with secure key management
- Use multi-sig wallet for owner functions
- Implement match verification logic in contract (requires more complexity)

### 2. Like Rewards Trust Backend

**Assumption**: `rewardLike()` is called by a trusted admin after validating the like is legitimate.

**Why**:
- No spam prevention in contract
- Can't verify likes on-chain (they're off-chain data)

**Risk**:
- Users could spam likes to farm HEART tokens
- Frontend could be modified to call this repeatedly

**Solution for Production**:
- Backend service with rate limiting
- Daily like limits per wallet
- Cooldown periods between likes
- Captcha for like actions
- Cost per like (small AVAX payment)

### 3. Match NFT Metadata

**Assumption**: Both users in a match get the same IPFS metadata URI.

**Why**:
- Simplifies contract logic
- Reduces gas costs
- Metadata is generic (match badge, not personal photos)

**Trade-off**:
- Can't personalize NFT images per user
- Both NFTs point to same IPFS file

**Alternative**:
- Generate unique metadata for each user
- Include both user's profile pics in metadata
- More complex, higher gas costs

### 4. Boost Anti-Stacking

**Assumption**: Boosts can be stacked (extended) indefinitely.

**Why**:
- Simpler logic
- More revenue potential
- User freedom

**Risk**:
- Users could boost for months
- Defeats purpose of temporary boost

**Solution for Production**:
- Maximum boost duration (e.g., 24 hours)
- Diminishing returns for stacking
- Boost queue system

---

## Frontend Assumptions

### 5. Wallet = Identity

**Assumption**: A wallet address is a user's complete identity.

**Why**:
- True decentralization
- No email/password needed
- Web3-native approach

**Trade-off**:
- If user loses wallet, loses everything
- Can't recover account
- No traditional "forgot password"

**Consideration**:
- Educate users on wallet security
- Support wallet recovery mechanisms
- Consider multi-device wallet solutions

### 6. Profile Photos Off-Chain

**Assumption**: User photos are stored in Firebase Storage, not on IPFS/blockchain.

**Why**:
- Privacy (photos not permanently on-chain)
- Cost (storage expensive on-chain)
- Speed (fast loading from CDN)

**Trade-off**:
- Centralized storage
- Firebase dependency
- Not censorship-resistant

**Alternative**:
- Encrypted IPFS storage with access control
- Lit Protocol for decrypted viewing
- More complex implementation

### 7. No On-Chain Profile Data

**Assumption**: All profile data (bio, age, interests) is off-chain in Firestore.

**Why**:
- Privacy
- Gas efficiency
- Easy to update

**Trade-off**:
- Can't query on-chain
- Centralized data
- Requires Firebase

**Production Consideration**:
- Use The Graph for indexing on-chain events
- Ceramic Network for decentralized profiles
- Lens Protocol integration

### 8. Direct Contract Calls from Frontend

**Assumption**: Frontend directly calls smart contracts for match creation.

**Why**:
- Simpler architecture
- No backend needed
- True decentralization

**Risk**:
- Trusts frontend validation
- No rate limiting
- Possible abuse

**Production Solution**:
- Backend proxy for sensitive operations
- Sign messages, verify on backend
- Backend calls contract with admin key

---

## Anti-Spam Assumptions

### 9. No Rate Limiting on Likes

**Assumption**: Users can like as fast as they can click.

**Risk**:
- Spam likes to farm HEART
- Bot abuse
- Degraded UX for real users

**Production Solution**:
```typescript
// Rate limiting example
const LIKE_COOLDOWN = 2000; // 2 seconds
const MAX_LIKES_PER_DAY = 100;

// Check last like timestamp
const lastLike = await getLastLikeTimestamp(wallet);
if (Date.now() - lastLike < LIKE_COOLDOWN) {
  throw new Error("Please wait before liking again");
}

// Check daily limit
const todayLikes = await getLikesToday(wallet);
if (todayLikes >= MAX_LIKES_PER_DAY) {
  throw new Error("Daily like limit reached");
}
```

### 10. No Duplicate Match Prevention

**Assumption**: Contract's `matchExists` mapping prevents duplicate matches.

**Implementation**: Uses order-independent hash of both addresses.

**Limitation**:
- Requires both addresses provided in consistent order
- Frontend must handle this correctly

**Verification**:
```solidity
function _getMatchId(address userA, address userB) private pure returns (bytes32) {
  if (userA < userB) {
    return keccak256(abi.encodePacked(userA, userB));
  } else {
    return keccak256(abi.encodePacked(userB, userA));
  }
}
```

---

## Security Limitations

### 11. Private Key Management

**Limitation**: Deployer's private key is in `.env` file.

**Risk**:
- If leaked, attacker controls contracts
- Can drain boost funds
- Can create fake matches

**Production Solution**:
- Use hardware wallet (Ledger, Trezor)
- Multi-sig wallet (Gnosis Safe)
- Key management service (AWS KMS)
- Rotate keys regularly

### 12. No Access Control Beyond Owner

**Limitation**: Only `owner` modifier, no role-based access.

**Risk**:
- Single point of failure
- Can't delegate functions
- No fine-grained permissions

**Production Solution**:
```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DatingController is AccessControl {
  bytes32 public constant MATCH_CREATOR_ROLE = keccak256("MATCH_CREATOR_ROLE");
  bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(MATCH_CREATOR_ROLE, backendAddress);
    _grantRole(REWARD_DISTRIBUTOR_ROLE, rewardBotAddress);
  }

  function confirmMatch(...) public onlyRole(MATCH_CREATOR_ROLE) {
    // ...
  }
}
```

### 13. No Emergency Stop

**Limitation**: No pause functionality if exploit is discovered.

**Risk**:
- Can't stop operations in emergency
- Must wait for fix and redeploy

**Production Solution**:
```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract DatingController is Pausable {
  function confirmMatch(...) public whenNotPaused {
    // ...
  }

  function emergencyPause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }
}
```

---

## Database Assumptions

### 14. Firestore Consistency

**Assumption**: Firestore is always available and consistent.

**Risk**:
- Firebase outage breaks app
- Data inconsistency between chain and DB

**Production Solution**:
- Event indexing with The Graph
- Fallback to on-chain data
- Database replication
- Queue system for critical operations

### 15. Mutual Like Detection Off-Chain

**Assumption**: Backend/frontend checks for mutual likes before calling contract.

**Why**:
- Can't check off-chain data on-chain
- Cheaper than on-chain storage

**Risk**:
- Database and blockchain can get out of sync
- Like could exist in DB but not on chain

**Production Solution**:
```typescript
// Sync check before match creation
const [dbMutual, chainMutual] = await Promise.all([
  checkMutualLike(userA, userB),
  contract.doesMatchExist(userA, userB)
]);

if (!dbMutual) {
  throw new Error("Mutual like not found in database");
}

if (chainMutual) {
  throw new Error("Match already exists on-chain");
}

// Proceed with match creation
```

---

## IPFS / Metadata Assumptions

### 16. Pinata Availability

**Assumption**: Pinata (IPFS gateway) is always available.

**Risk**:
- Pinata outage = NFT metadata unavailable
- Centralized IPFS gateway

**Production Solution**:
- Pin to multiple IPFS nodes
- Run own IPFS node
- Arweave for permanent storage
- Fallback to HTTP URL

### 17. Generic Match Metadata

**Assumption**: All match NFTs use a generic match badge image.

**Why**:
- Privacy (not storing user photos on IPFS)
- Simplicity
- Consistent branding

**Alternative**:
- Generate unique art for each match
- Include anonymized data
- Use on-chain SVG generation

---

## Economic Assumptions

### 18. Fixed Reward Rates

**Assumption**: Reward rates are set by owner and don't change automatically.

**Limitation**:
- No dynamic adjustment based on usage
- Could lead to inflation/deflation

**Production Enhancement**:
```solidity
// Dynamic rewards based on treasury
function calculateMatchReward() public view returns (uint256) {
  uint256 treasury = heartToken.balanceOf(address(this));
  if (treasury < 1000000 * 10**18) {
    return 5 * 10**18; // Low treasury: 5 HEART
  } else {
    return 10 * 10**18; // Healthy treasury: 10 HEART
  }
}
```

### 19. No Token Utility Beyond Clout

**Assumption**: HEART tokens are just for leaderboard/social status.

**Limitation**:
- No real value
- No use cases
- Limited incentive to hold

**Production Enhancement**:
- Spend HEART for premium features
- Stake HEART for better matches
- Burn HEART for special actions
- Governance with HEART tokens

### 20. Boost Revenue Not Distributed

**Assumption**: Boost revenue accumulates in contract.

**Owner can withdraw**: Yes, via `withdrawFunds()`.

**Limitation**:
- No automatic distribution
- No revenue sharing with token holders

**Production Enhancement**:
- Automatic treasury split
- Burn mechanism (buy & burn HEART)
- Staking rewards from revenue
- DAO-controlled treasury

---

## Chat & Messaging Limitations

### 21. No Chat Implementation

**Assumption**: Chat is mentioned but not implemented in MVP.

**Why**:
- Focus on core matching functionality
- Chat is complex (real-time, encryption, etc.)

**Production Options**:

**Option A: Firebase Realtime Database**
```typescript
import { getDatabase, ref, push } from 'firebase/database';

async function sendMessage(matchId: string, message: string) {
  const db = getDatabase();
  await push(ref(db, `chats/${matchId}`), {
    from: wallet,
    message,
    timestamp: Date.now()
  });
}
```

**Option B: XMTP (Decentralized)**
```typescript
import { Client } from '@xmtp/xmtp-js';

const xmtp = await Client.create(signer);
const conversation = await xmtp.conversations.newConversation(partnerAddress);
await conversation.send("Hey!");
```

**Option C: Matrix Protocol**
- Fully decentralized
- End-to-end encrypted
- More complex setup

---

## Scalability Limitations

### 22. No Pagination

**Assumption**: Small dataset for MVP.

**Limitation**:
- Loading all profiles at once
- Loading all NFTs at once
- Could be slow with many users

**Production Solution**:
```typescript
// Pagination example
async function getSwipeProfiles(
  currentWallet: string,
  lastVisible: any = null,
  limit: number = 20
) {
  let q = query(
    usersCollection,
    where('gender', '==', currentUser.lookingFor),
    orderBy('lastSeen', 'desc'),
    limit(limit)
  );

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];

  return {
    profiles: snapshot.docs.map(doc => doc.data()),
    lastVisible: lastDoc
  };
}
```

### 23. No Caching

**Assumption**: Fresh data fetched on every request.

**Limitation**:
- More API calls
- Higher Firebase costs
- Slower UX

**Production Solution**:
- Redis caching layer
- React Query with stale-while-revalidate
- Local storage caching
- Service worker caching

---

## Testing Limitations

### 24. No Automated Tests

**Limitation**: No test suite included.

**Risk**:
- Bugs in production
- Regression when updating
- No confidence in code changes

**Production Solution**:

**Contract Tests**:
```javascript
// test/DatingController.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DatingController", function () {
  it("Should confirm match and mint NFTs", async function () {
    // Test logic
  });

  it("Should reward HEART tokens on match", async function () {
    // Test logic
  });
});
```

**Frontend Tests**:
```typescript
// __tests__/SwipeDeck.test.tsx
import { render, screen } from '@testing-library/react';
import SwipeDeck from '@/components/SwipeDeck';

test('renders swipe deck', () => {
  render(<SwipeDeck />);
  expect(screen.getByText(/swipe/i)).toBeInTheDocument();
});
```

---

## Compliance & Legal Limitations

### 25. No Age Verification

**Assumption**: Users self-report age.

**Risk**:
- Minors using platform
- Legal liability
- COPPA/GDPR violations

**Production Solution**:
- ID verification service (e.g., Onfido)
- Blockchain-based identity (Civic, BrightID)
- Age attestation via zero-knowledge proofs

### 26. No Content Moderation

**Assumption**: Users are trusted to upload appropriate photos.

**Risk**:
- Inappropriate content
- Harassment
- Legal issues

**Production Solution**:
- AI content moderation (Google Vision API)
- User reporting system
- Community moderators
- Automated flagging

### 27. No Terms of Service

**Limitation**: No legal agreements in place.

**Production Requirement**:
- Terms of Service
- Privacy Policy
- Cookie Policy
- User agreements
- GDPR compliance

---

## Geographic Limitations

### 28. No Location Services

**Assumption**: Location is optional text field.

**Limitation**:
- Can't show nearby users
- Can't filter by distance
- Global pool only

**Production Enhancement**:
```typescript
// Using geohash for location queries
import geohash from 'ngeohash';

const userHash = geohash.encode(lat, lon);

const q = query(
  usersCollection,
  where('geohash', '>=', neighborHashLow),
  where('geohash', '<=', neighborHashHigh)
);
```

---

## Mobile Limitations

### 29. No Mobile App

**Assumption**: Web-only for MVP.

**Limitation**:
- Not optimized for mobile browsers
- No native wallet support
- No push notifications

**Production Enhancement**:
- React Native app
- WalletConnect integration
- Push notifications
- App Store / Play Store deployment

---

## Summary

This MVP makes **29 significant assumptions/simplifications**:

**Most Critical for Production**:
1. Backend service for match verification (#1, #2)
2. Rate limiting and anti-spam (#9)
3. Security hardening (#11, #12, #13)
4. Testing suite (#24)
5. Legal compliance (#25, #26, #27)

**Nice to Have**:
- Chat implementation (#21)
- Dynamic tokenomics (#18, #19)
- Mobile app (#29)
- Advanced features (#28, #22, #23)

---

**Remember**: This is an MVP for learning and demonstration. Do NOT deploy to mainnet without addressing the critical security and legal concerns above.
