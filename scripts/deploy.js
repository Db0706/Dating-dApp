const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to", hre.network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "AVAX");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Initial supply for HEART token (1 billion tokens with 18 decimals)
  const initialSupply = hre.ethers.parseEther(
    process.env.INITIAL_HEART_SUPPLY || "1000000000"
  );

  // 1. Deploy HeartToken
  console.log("1️⃣  Deploying HeartToken...");
  const HeartToken = await hre.ethers.getContractFactory("HeartToken");
  const heartToken = await HeartToken.deploy(initialSupply);
  await heartToken.waitForDeployment();
  const heartTokenAddress = await heartToken.getAddress();
  console.log("✅ HeartToken deployed to:", heartTokenAddress);
  console.log("   Initial supply:", hre.ethers.formatEther(initialSupply), "HEART\n");

  // 2. Deploy MatchNFT
  console.log("2️⃣  Deploying MatchNFT...");
  const MatchNFT = await hre.ethers.getContractFactory("MatchNFT");
  const matchNFT = await MatchNFT.deploy();
  await matchNFT.waitForDeployment();
  const matchNFTAddress = await matchNFT.getAddress();
  console.log("✅ MatchNFT deployed to:", matchNFTAddress, "\n");

  // 3. Deploy DatingController
  console.log("3️⃣  Deploying DatingController...");
  const DatingController = await hre.ethers.getContractFactory("DatingController");
  const datingController = await DatingController.deploy(
    heartTokenAddress,
    matchNFTAddress
  );
  await datingController.waitForDeployment();
  const datingControllerAddress = await datingController.getAddress();
  console.log("✅ DatingController deployed to:", datingControllerAddress, "\n");

  // 4. Set DatingController as minter for both HeartToken and MatchNFT
  console.log("4️⃣  Configuring contract permissions...");

  console.log("   Setting DatingController as HeartToken minter...");
  const setHeartMinterTx = await heartToken.setMinter(datingControllerAddress);
  await setHeartMinterTx.wait();
  console.log("   ✅ HeartToken minter set");

  console.log("   Setting DatingController as MatchNFT minter...");
  const setMatchMinterTx = await matchNFT.setMinter(datingControllerAddress);
  await setMatchMinterTx.wait();
  console.log("   ✅ MatchNFT minter set\n");

  // 5. Read current settings from DatingController
  console.log("5️⃣  Current DatingController settings:");
  const matchReward = await datingController.matchReward();
  const likeReward = await datingController.likeReward();
  const boostPrice = await datingController.boostPrice();
  const boostDuration = await datingController.boostDuration();

  console.log("   Match Reward:", hre.ethers.formatEther(matchReward), "HEART");
  console.log("   Like Reward:", hre.ethers.formatEther(likeReward), "HEART");
  console.log("   Boost Price:", hre.ethers.formatEther(boostPrice), "AVAX");
  console.log("   Boost Duration:", (Number(boostDuration) / 60).toFixed(0), "minutes\n");

  // 6. Save deployment info
  console.log("6️⃣  Saving deployment info...");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      HeartToken: heartTokenAddress,
      MatchNFT: matchNFTAddress,
      DatingController: datingControllerAddress,
    },
    settings: {
      initialSupply: hre.ethers.formatEther(initialSupply),
      matchReward: hre.ethers.formatEther(matchReward),
      likeReward: hre.ethers.formatEther(likeReward),
      boostPrice: hre.ethers.formatEther(boostPrice),
      boostDuration: `${Number(boostDuration) / 60} minutes`,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest
  const latestPath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("✅ Deployment info saved to:", filename);
  console.log("✅ Latest deployment saved to:", `${hre.network.name}-latest.json\n`);

  // 7. Print summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 Contract Addresses:");
  console.log("   HeartToken:       ", heartTokenAddress);
  console.log("   MatchNFT:         ", matchNFTAddress);
  console.log("   DatingController: ", datingControllerAddress);
  console.log("\n📝 Next Steps:");
  console.log("   1. Add these addresses to your frontend .env file");
  console.log("   2. Verify contracts on Snowtrace (if on Fuji):");
  console.log(`      npx hardhat verify --network fuji ${heartTokenAddress} "${initialSupply}"`);
  console.log(`      npx hardhat verify --network fuji ${matchNFTAddress}`);
  console.log(`      npx hardhat verify --network fuji ${datingControllerAddress} "${heartTokenAddress}" "${matchNFTAddress}"`);
  console.log("   3. Update your frontend contract addresses");
  console.log("   4. Test the contracts with the frontend\n");

  if (hre.network.name === "fuji") {
    console.log("🔍 View on Snowtrace:");
    console.log(`   https://testnet.snowtrace.io/address/${datingControllerAddress}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
