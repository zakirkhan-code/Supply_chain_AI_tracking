const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get the contract factory
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  
  console.log("📝 Deploying SupplyChain contract...");
  
  // Deploy the contract
  const supplyChain = await SupplyChain.deploy();
  
  await supplyChain.waitForDeployment();
  
  const contractAddress = await supplyChain.getAddress();
  
  console.log("\n✅ SupplyChain contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  console.log("⛽ Gas Used: Check Etherscan for details");
  
  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployed by:", deployer.address);
  
  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await supplyChain.deploymentTransaction().wait(5);
  
  console.log("\n📋 Contract Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Verify initial state
  console.log("🔍 Verifying initial contract state...");
  const owner = await supplyChain.owner();
  const productCounter = await supplyChain.productCounter();
  const shipmentCounter = await supplyChain.shipmentCounter();
  
  console.log("Owner:", owner);
  console.log("Product Counter:", productCounter.toString());
  console.log("Shipment Counter:", shipmentCounter.toString());
  
  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("2. Save the contract address for frontend integration");
  console.log("3. Update your .env file with CONTRACT_ADDRESS");
  
  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
  };
  
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });