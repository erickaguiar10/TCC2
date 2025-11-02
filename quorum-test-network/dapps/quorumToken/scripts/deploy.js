// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying TicketNFT contract...");

  // Get the contract factory
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  
  // Deploy the contract
  const ticketNFT = await TicketNFT.deploy();
  
  await ticketNFT.waitForDeployment();
  
  console.log(`TicketNFT contract deployed to: ${await ticketNFT.getAddress()}`);

  // Save the contract address to .env if the file exists
  const fs = require("fs");
  const envPath = ".env";
  
  try {
    // Read existing .env content
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
    
    // Update or add CONTRACT_ADDRESS
    const contractAddress = await ticketNFT.getAddress();
    const contractAddressRegex = /^CONTRACT_ADDRESS=.*$/m;
    
    if (envContent.match(contractAddressRegex)) {
      // Replace existing CONTRACT_ADDRESS
      envContent = envContent.replace(contractAddressRegex, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      // Add new CONTRACT_ADDRESS
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`Contract address saved to ${envPath}`);
  } catch (error) {
    console.error("Error updating .env file:", error.message);
  }
  
  // Verify the contract if running on a live network (not local)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for 15 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    try {
      await hre.run("verify:verify", {
        address: await ticketNFT.getAddress(),
        constructorArguments: [],
      });
      console.log("Contract verified on explorer");
    } catch (error) {
      console.error("Verification failed:", error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});