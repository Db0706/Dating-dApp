const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Get boost status for an address
 * Usage: npx hardhat run scripts/getBoostStatus.js --network fuji
 * Set ADDRESS env var or it will use deployer address
 */

async function main() {
  // Get address from environment or use deployer
  const targetAddress = process.env.ADDRESS || (await hre.ethers.getSigners())[0].address;

  console.log("🚀 Checking Boost Status");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("Network:", hre.network.name);
  console.log("Address:", targetAddress);
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

  // Get boost status
  const [isBoosted, timeRemaining] = await controller.checkBoostStatus(targetAddress);
  const boostedUntil = await controller.boostedUntil(targetAddress);

  console.log("Boost Status:", isBoosted ? "✅ ACTIVE" : "❌ Not Boosted");

  if (isBoosted) {
    const minutes = Math.floor(Number(timeRemaining) / 60);
    const seconds = Number(timeRemaining) % 60;
    console.log("Time Remaining:", `${minutes}m ${seconds}s`);

    const boostedUntilDate = new Date(Number(boostedUntil) * 1000);
    console.log("Boosted Until:", boostedUntilDate.toLocaleString());
  } else {
    console.log("Time Remaining: 0");
  }

  // Get boost settings
  const boostPrice = await controller.boostPrice();
  const boostDuration = await controller.boostDuration();

  console.log("\n⚙️  Boost Settings:");
  console.log("   Price:", hre.ethers.formatEther(boostPrice), "AVAX");
  console.log("   Duration:", (Number(boostDuration) / 60).toFixed(0), "minutes");

  if (!isBoosted) {
    console.log("\n💡 To purchase a boost:");
    console.log("   1. Use the frontend at /boost");
    console.log("   2. Or call purchaseBoost() on the contract");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
