// Script para verificar o proprietário do contrato
const hre = require("hardhat");

async function checkOwner() {
  console.log("Verificando proprietário do contrato...");

  // Endereço do contrato implantado
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Obter o ABI do contrato
  const contractABI = require("./artifacts/contracts/TicketNFT.sol/TicketNFT.json").abi;
  
  // Obter provedor e contrato
  const provider = hre.ethers.provider;
  const contract = new hre.ethers.Contract(contractAddress, contractABI, provider);
  
  try {
    // Obter o proprietário
    const owner = await contract.owner();
    console.log("Proprietário do contrato:", owner);
    
    // Obter as contas disponíveis no Hardhat para comparação
    const accounts = await hre.ethers.getSigners();
    console.log("\nContas disponíveis no Hardhat:");
    accounts.forEach((account, index) => {
      console.log(`${index}: ${account.address} ${account.address === owner ? '(OWNER)' : ''}`);
    });
  } catch (error) {
    console.error("Erro ao verificar proprietário:", error);
  }
}

checkOwner().catch(console.error);