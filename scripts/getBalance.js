const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Get HEART token balance for an address
 * Usage: npx hardhat run scripts/getBalance.js --network fuji
 * Then enter address when prompted, or set ADDRESS env var
 */

async function main() {
  // Get address from environment or use deployer
  const targetAddress = process.env.ADDRESS || (await hre.ethers.getSigners())[0].address;

  console.log("💰 Checking HEART Token Balance");
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
  const { HeartToken } = deployment.contracts;

  // Get contract
  const [signer] = await hre.ethers.getSigners();
  const heartToken = await hre.ethers.getContractAt("HeartToken", HeartToken, signer);

  // Get balance
  const balance = await heartToken.balanceOf(targetAddress);
  const formattedBalance = hre.ethers.formatEther(balance);

  console.log("HEART Balance:", formattedBalance, "HEART");
  console.log("Raw Balance:  ", balance.toString(), "wei");

  // Get additional info
  const symbol = await heartToken.symbol();
  const decimals = await heartToken.decimals();
  const totalSupply = await heartToken.totalSupply();

  console.log("\n📊 Token Info:");
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals.toString());
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "HEART");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
