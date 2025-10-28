const hre = require("hardhat");

async function main() {
  console.log("Checking wallet balance on", hre.network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [signer] = await hre.ethers.getSigners();
  const address = signer.address;
  const balance = await hre.ethers.provider.getBalance(address);

  console.log("Wallet Address:", address);
  console.log("AVAX Balance:  ", hre.ethers.formatEther(balance), "AVAX");

  // Check if balance is sufficient for deployment
  const minBalance = hre.ethers.parseEther("0.5");
  if (balance < minBalance) {
    console.log("\n⚠️  WARNING: Balance is low!");
    console.log("   You need at least 0.5 AVAX for deployment");
    console.log("   Get test AVAX from: https://faucet.avax.network/");
  } else {
    console.log("\n✅ Balance is sufficient for deployment");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
