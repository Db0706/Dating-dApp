const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verify all deployed contracts on Snowtrace
 * Usage: npx hardhat run scripts/verifyContracts.js --network fuji
 */

async function main() {
  console.log("🔍 Verifying contracts on Snowtrace...\n");

  // Load deployment info
  const deploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}-latest.json`
  );

  if (!fs.existsSync(deploymentPath)) {
    console.error(`❌ No deployment found for network: ${hre.network.name}`);
    console.error(`   Expected file: ${deploymentPath}`);
    console.error(`   Please deploy contracts first.`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contracts = deployment.contracts;

  // Get initial supply in wei for HeartToken constructor
  const initialSupply = hre.ethers.parseEther(
    deployment.settings.initialSupply || "1000000000"
  );

  console.log("Network:", hre.network.name);
  console.log("Contracts to verify:");
  console.log("  HeartToken:       ", contracts.HeartToken);
  console.log("  MatchNFT:         ", contracts.MatchNFT);
  console.log("  DatingController: ", contracts.DatingController);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Verify HeartToken
  try {
    console.log("1️⃣  Verifying HeartToken...");
    await hre.run("verify:verify", {
      address: contracts.HeartToken,
      constructorArguments: [initialSupply.toString()],
    });
    console.log("✅ HeartToken verified\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ HeartToken already verified\n");
    } else {
      console.error("❌ HeartToken verification failed:", error.message, "\n");
    }
  }

  // Verify MatchNFT
  try {
    console.log("2️⃣  Verifying MatchNFT...");
    await hre.run("verify:verify", {
      address: contracts.MatchNFT,
      constructorArguments: [],
    });
    console.log("✅ MatchNFT verified\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ MatchNFT already verified\n");
    } else {
      console.error("❌ MatchNFT verification failed:", error.message, "\n");
    }
  }

  // Verify DatingController
  try {
    console.log("3️⃣  Verifying DatingController...");
    await hre.run("verify:verify", {
      address: contracts.DatingController,
      constructorArguments: [contracts.HeartToken, contracts.MatchNFT],
    });
    console.log("✅ DatingController verified\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ DatingController already verified\n");
    } else {
      console.error("❌ DatingController verification failed:", error.message, "\n");
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Verification complete!");
  console.log("\n🔍 View contracts on Snowtrace:");
  console.log(`   ${contracts.DatingController}`);
  console.log(`   https://testnet.snowtrace.io/address/${contracts.DatingController}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
