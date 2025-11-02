const hre = require("hardhat");

async function main() {
  // Pegar o signer (conta) do hardhat
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deployando contrato com a conta:", deployer.address);
  
  // Obter o contrato TicketNFT
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  
  console.log("Deployando contrato...");
  
  // Deploy do contrato
  const ticketNFT = await TicketNFT.deploy();
  
  // Aguardar confirmação
  await ticketNFT.deploymentTransaction().wait();
  
  console.log("Contrato deployado em:", await ticketNFT.getAddress());
  
  // Atualizar o .env com o novo endereço
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  const updatedEnvContent = envContent.replace(
    /^CONTRACT_ADDRESS=.*$/m,
    `CONTRACT_ADDRESS=${await ticketNFT.getAddress()}`
  );
  fs.writeFileSync('.env', updatedEnvContent);
  console.log("Endereço do contrato atualizado no .env");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
