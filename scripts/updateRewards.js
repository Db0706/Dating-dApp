const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Update reward rates
 * Usage:
 *   MATCH_REWARD=15 LIKE_REWARD=2 npx hardhat run scripts/updateRewards.js --network fuji
 *
 * Or edit the values in this script
 */

async function main() {
  // Get new reward values from environment or use defaults
  const newMatchReward = process.env.MATCH_REWARD || "15"; // 15 HEART
  const newLikeReward = process.env.LIKE_REWARD || "2";    // 2 HEART

  console.log("⚙️  Updating Reward Rates");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("Network:", hre.network.name);
  console.log("New Match Reward:", newMatchReward, "HEART");
  console.log("New Like Reward:", newLikeReward, "HEART");
  console.log();

  // Load deployment
  const deploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}-latest.json`
  );

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found. Please deploy contracts first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const { DatingController } = deployment.contracts;

  // Get contract
  const [signer] = await hre.ethers.getSigners();
  const controller = await hre.ethers.getContractAt(
    "DatingController",
    DatingController,
    signer
  );

  // Check if caller is owner
  const owner = await controller.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("❌ Error: You are not the contract owner");
    console.error("   Owner:", owner);
    console.error("   Your address:", signer.address);
    process.exit(1);
  }

  // Convert to wei
  const matchRewardWei = hre.ethers.parseEther(newMatchReward);
  const likeRewardWei = hre.ethers.parseEther(newLikeReward);

  console.log("Updating rewards...");
  const tx = await controller.updateRewardRates(matchRewardWei, likeRewardWei);
  console.log("Transaction submitted:", tx.hash);

  await tx.wait();
  console.log("✅ Transaction confirmed!\n");

  // Verify new values
  const matchReward = await controller.matchReward();
  const likeReward = await controller.likeReward();

  console.log("Updated Reward Rates:");
  console.log("   Match Reward:", hre.ethers.formatEther(matchReward), "HEART");
  console.log("   Like Reward:", hre.ethers.formatEther(likeReward), "HEART");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
