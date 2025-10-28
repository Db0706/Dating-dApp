# Scripts Usage Guide

Collection of utility scripts for interacting with deployed contracts.

---

## Deployment Scripts

### Deploy All Contracts
```bash
npx hardhat run scripts/deploy.js --network fuji
```
Deploys HeartToken, MatchNFT, and DatingController to Fuji testnet.

---

## Utility Scripts

### Check Wallet Balance (AVAX)
```bash
npx hardhat run scripts/checkBalance.js --network fuji
```
Shows your AVAX balance and warns if too low for deployment.

### Check Deployment Status
```bash
npx hardhat run scripts/checkDeployment.js --network fuji
```
Verifies all contracts are deployed correctly and shows their configuration.

### Verify Contracts on Snowtrace
```bash
npx hardhat run scripts/verifyContracts.js --network fuji
```
Verifies all 3 contracts on Snowtrace explorer.

---

## Query Scripts

### Get HEART Token Balance
```bash
# Check your own balance
npx hardhat run scripts/getBalance.js --network fuji

# Check another address
ADDRESS=0x123... npx hardhat run scripts/getBalance.js --network fuji
```

### Get Boost Status
```bash
# Check your own boost status
npx hardhat run scripts/getBoostStatus.js --network fuji

# Check another address
ADDRESS=0x123... npx hardhat run scripts/getBoostStatus.js --network fuji
```

---

## Admin Scripts (Owner Only)

### Update Reward Rates
```bash
# Set match reward to 15 HEART, like reward to 2 HEART
MATCH_REWARD=15 LIKE_REWARD=2 npx hardhat run scripts/updateRewards.js --network fuji
```

### Update Boost Settings
```bash
# Set boost price to 0.02 AVAX, duration to 60 minutes
BOOST_PRICE=0.02 BOOST_DURATION=60 npx hardhat run scripts/updateBoostSettings.js --network fuji
```

### Withdraw Boost Revenue
```bash
# Withdraw to your wallet
npx hardhat run scripts/withdrawFunds.js --network fuji

# Withdraw to another address
TO_ADDRESS=0x123... npx hardhat run scripts/withdrawFunds.js --network fuji
```

---

## Legacy Script (Use node directly)

### Old Interact Script
```bash
# This script requires node, not hardhat
node scripts/interact.js balance 0xYourAddress
node scripts/interact.js boost-status 0xYourAddress
node scripts/interact.js update-rewards 15 2
```

**Note:** The individual scripts above are easier to use than this legacy script.

---

## Environment Variables

All scripts use these environment variables when applicable:

- `PRIVATE_KEY` - Your wallet private key (from .env)
- `ADDRESS` - Target address for queries (defaults to your wallet)
- `MATCH_REWARD` - New match reward in HEART
- `LIKE_REWARD` - New like reward in HEART
- `BOOST_PRICE` - New boost price in AVAX
- `BOOST_DURATION` - New boost duration in minutes
- `TO_ADDRESS` - Destination address for withdrawals

---

## Examples

### Complete Deployment Flow
```bash
# 1. Check balance
npx hardhat run scripts/checkBalance.js --network fuji

# 2. Deploy
npx hardhat run scripts/deploy.js --network fuji

# 3. Verify deployment
npx hardhat run scripts/checkDeployment.js --network fuji

# 4. Verify on explorer
npx hardhat run scripts/verifyContracts.js --network fuji

# 5. Check your HEART balance
npx hardhat run scripts/getBalance.js --network fuji
```

### Update Settings
```bash
# Update rewards
MATCH_REWARD=20 LIKE_REWARD=3 npx hardhat run scripts/updateRewards.js --network fuji

# Update boost settings
BOOST_PRICE=0.02 BOOST_DURATION=45 npx hardhat run scripts/updateBoostSettings.js --network fuji
```

### Check User Status
```bash
# Check a user's HEART balance
ADDRESS=0xUserAddress npx hardhat run scripts/getBalance.js --network fuji

# Check if they're boosted
ADDRESS=0xUserAddress npx hardhat run scripts/getBoostStatus.js --network fuji
```

---

## Troubleshooting

### "No deployment found"
Run deployment first:
```bash
npx hardhat run scripts/deploy.js --network fuji
```

### "You are not the contract owner"
Owner-only scripts require the private key of the deployer wallet.

### "Insufficient funds"
Get test AVAX from: https://faucet.avax.network/

---

## Script Files

- `checkBalance.js` - Check AVAX balance
- `checkDeployment.js` - Verify deployment
- `deploy.js` - Deploy all contracts
- `getBalance.js` - Get HEART balance
- `getBoostStatus.js` - Check boost status
- `interact.js` - Legacy multi-purpose script
- `updateRewards.js` - Update reward rates
- `verifyContracts.js` - Verify on Snowtrace
- `withdrawFunds.js` - Withdraw boost revenue (to be created)
- `updateBoostSettings.js` - Update boost settings (to be created)
