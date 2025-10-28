const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Helper script to interact with deployed contracts
 * Usage: node scripts/interact.js <action> [params]
 *
 * Examples:
 *   node scripts/interact.js balance 0xYourAddress
 *   node scripts/interact.js boost-status 0xYourAddress
 *   node scripts/interact.js update-rewards 15 2
 */

async function loadDeployment(network) {
  const filepath = path.join(
    __dirname,
    "..",
    "deployments",
    `${network}-latest.json`
  );

  if (!fs.existsSync(filepath)) {
    throw new Error(`No deployment found for network: ${network}`);
  }

  return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

async function getContracts() {
  const deployment = await loadDeployment(hre.network.name);
  const [signer] = await hre.ethers.getSigners();

  const heartToken = await hre.ethers.getContractAt(
    "HeartToken",
    deployment.contracts.HeartToken,
    signer
  );

  const matchNFT = await hre.ethers.getContractAt(
    "MatchNFT",
    deployment.contracts.MatchNFT,
    signer
  );

  const datingController = await hre.ethers.getContractAt(
    "DatingController",
    deployment.contracts.DatingController,
    signer
  );

  return { heartToken, matchNFT, datingController, signer };
}

async function checkBalance(address) {
  const { heartToken } = await getContracts();
  const balance = await heartToken.balanceOf(address);
  console.log(`HEART balance of ${address}:`, hre.ethers.formatEther(balance));
}

async function checkBoostStatus(address) {
  const { datingController } = await getContracts();
  const [isBoosted, timeRemaining] = await datingController.checkBoostStatus(address);

  console.log(`Boost status for ${address}:`);
  console.log(`  Boosted: ${isBoosted}`);
  if (isBoosted) {
    console.log(`  Time remaining: ${Number(timeRemaining) / 60} minutes`);
  }
}

async function updateRewards(matchReward, likeReward) {
  const { datingController } = await getContracts();

  const matchRewardWei = hre.ethers.parseEther(matchReward);
  const likeRewardWei = hre.ethers.parseEther(likeReward);

  console.log(`Updating rewards...`);
  const tx = await datingController.updateRewardRates(matchRewardWei, likeRewardWei);
  await tx.wait();

  console.log(`✅ Rewards updated:`);
  console.log(`   Match: ${matchReward} HEART`);
  console.log(`   Like: ${likeReward} HEART`);
}

async function updateBoostSettings(price, durationMinutes) {
  const { datingController } = await getContracts();

  const priceWei = hre.ethers.parseEther(price);
  const durationSeconds = durationMinutes * 60;

  console.log(`Updating boost settings...`);
  const tx = await datingController.updateBoostSettings(priceWei, durationSeconds);
  await tx.wait();

  console.log(`✅ Boost settings updated:`);
  console.log(`   Price: ${price} AVAX`);
  console.log(`   Duration: ${durationMinutes} minutes`);
}

async function withdrawFunds(toAddress) {
  const { datingController } = await getContracts();

  console.log(`Withdrawing funds to ${toAddress}...`);
  const tx = await datingController.withdrawFunds(toAddress);
  await tx.wait();

  console.log(`✅ Funds withdrawn`);
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];

  console.log(`Network: ${hre.network.name}\n`);

  switch (action) {
    case "balance":
      await checkBalance(args[1]);
      break;
    case "boost-status":
      await checkBoostStatus(args[1]);
      break;
    case "update-rewards":
      await updateRewards(args[1], args[2]);
      break;
    case "update-boost":
      await updateBoostSettings(args[1], args[2]);
      break;
    case "withdraw":
      await withdrawFunds(args[1]);
      break;
    default:
      console.log("Available actions:");
      console.log("  balance <address>");
      console.log("  boost-status <address>");
      console.log("  update-rewards <matchReward> <likeReward>");
      console.log("  update-boost <price> <durationMinutes>");
      console.log("  withdraw <toAddress>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
