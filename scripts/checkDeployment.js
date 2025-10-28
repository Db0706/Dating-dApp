const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Check deployment status and contract state
 * Usage: npx hardhat run scripts/checkDeployment.js --network fuji
 */

async function main() {
  console.log("📋 Checking deployment status...\n");

  // Load deployment info
  const deploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}-latest.json`
  );

  if (!fs.existsSync(deploymentPath)) {
    console.error(`❌ No deployment found for network: ${hre.network.name}`);
    console.error(`   Run deployment first: npx hardhat run scripts/deploy.js --network ${hre.network.name}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const { contracts } = deployment;

  console.log("Network:", deployment.network);
  console.log("Chain ID:", deployment.chainId);
  console.log("Deployed by:", deployment.deployer);
  console.log("Deployment date:", new Date(deployment.timestamp).toLocaleString());
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [signer] = await hre.ethers.getSigners();

  // Check HeartToken
  console.log("🪙 HeartToken");
  console.log("   Address:", contracts.HeartToken);
  try {
    const heartToken = await hre.ethers.getContractAt("HeartToken", contracts.HeartToken, signer);
    const name = await heartToken.name();
    const symbol = await heartToken.symbol();
    const totalSupply = await heartToken.totalSupply();
    const minter = await heartToken.minter();
    const owner = await heartToken.owner();

    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "HEART");
    console.log("   Minter:", minter);
    console.log("   Owner:", owner);
    console.log("   ✅ Contract is accessible");
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log("\n🎨 MatchNFT");
  console.log("   Address:", contracts.MatchNFT);
  try {
    const matchNFT = await hre.ethers.getContractAt("MatchNFT", contracts.MatchNFT, signer);
    const name = await matchNFT.name();
    const symbol = await matchNFT.symbol();
    const totalSupply = await matchNFT.totalSupply();
    const minter = await matchNFT.minter();
    const owner = await matchNFT.owner();

    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Total Minted:", totalSupply.toString(), "NFTs");
    console.log("   Minter:", minter);
    console.log("   Owner:", owner);
    console.log("   ✅ Contract is accessible");
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log("\n⚙️  DatingController");
  console.log("   Address:", contracts.DatingController);
  try {
    const controller = await hre.ethers.getContractAt(
      "DatingController",
      contracts.DatingController,
      signer
    );

    const heartTokenAddr = await controller.heartToken();
    const matchNFTAddr = await controller.matchNFT();
    const matchReward = await controller.matchReward();
    const likeReward = await controller.likeReward();
    const boostPrice = await controller.boostPrice();
    const boostDuration = await controller.boostDuration();
    const owner = await controller.owner();
    const balance = await hre.ethers.provider.getBalance(contracts.DatingController);

    console.log("   HeartToken reference:", heartTokenAddr);
    console.log("   MatchNFT reference:", matchNFTAddr);
    console.log("   Match Reward:", hre.ethers.formatEther(matchReward), "HEART");
    console.log("   Like Reward:", hre.ethers.formatEther(likeReward), "HEART");
    console.log("   Boost Price:", hre.ethers.formatEther(boostPrice), "AVAX");
    console.log("   Boost Duration:", (Number(boostDuration) / 60).toFixed(0), "minutes");
    console.log("   Owner:", owner);
    console.log("   Balance:", hre.ethers.formatEther(balance), "AVAX");
    console.log("   ✅ Contract is accessible");

    // Verify connections
    console.log("\n🔗 Verifying Connections");
    if (heartTokenAddr.toLowerCase() === contracts.HeartToken.toLowerCase()) {
      console.log("   ✅ Controller -> HeartToken link correct");
    } else {
      console.log("   ❌ Controller -> HeartToken link incorrect");
    }

    if (matchNFTAddr.toLowerCase() === contracts.MatchNFT.toLowerCase()) {
      console.log("   ✅ Controller -> MatchNFT link correct");
    } else {
      console.log("   ❌ Controller -> MatchNFT link incorrect");
    }

    const heartMinter = await hre.ethers.getContractAt("HeartToken", contracts.HeartToken, signer);
    const heartMinterAddr = await heartMinter.minter();
    if (heartMinterAddr.toLowerCase() === contracts.DatingController.toLowerCase()) {
      console.log("   ✅ HeartToken minter set to Controller");
    } else {
      console.log("   ❌ HeartToken minter NOT set to Controller");
    }

    const nftMinter = await hre.ethers.getContractAt("MatchNFT", contracts.MatchNFT, signer);
    const nftMinterAddr = await nftMinter.minter();
    if (nftMinterAddr.toLowerCase() === contracts.DatingController.toLowerCase()) {
      console.log("   ✅ MatchNFT minter set to Controller");
    } else {
      console.log("   ❌ MatchNFT minter NOT set to Controller");
    }
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Deployment check complete!");
  console.log("\n📝 Next Steps:");
  console.log("   1. Add these addresses to frontend/.env.local:");
  console.log(`      NEXT_PUBLIC_HEART_TOKEN_ADDRESS=${contracts.HeartToken}`);
  console.log(`      NEXT_PUBLIC_MATCH_NFT_ADDRESS=${contracts.MatchNFT}`);
  console.log(`      NEXT_PUBLIC_DATING_CONTROLLER_ADDRESS=${contracts.DatingController}`);
  console.log("\n   2. Verify contracts (optional):");
  console.log(`      npx hardhat run scripts/verifyContracts.js --network ${hre.network.name}`);
  console.log("\n   3. Start frontend:");
  console.log("      cd frontend && npm run dev\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
