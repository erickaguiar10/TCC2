// Script para verificar o contrato implantado
const { ethers } = require("hardhat");

async function checkContract() {
  // Endereço do contrato implantado
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Obter o ABI do contrato
  const contractABI = require("./artifacts/contracts/TicketNFT.sol/TicketNFT.json").abi;
  
  // Obter contrato
  const contract = await ethers.getContractAt("TicketNFT", contractAddress);
  
  try {
    // Tentar obter o proprietário
    const owner = await contract.owner();
    console.log("Proprietário do contrato:", owner);
    
    // Tentar obter o total supply
    const totalSupply = await contract.totalSupply();
    console.log("Total Supply:", totalSupply.toNumber());
    
    console.log("Contrato está respondendo corretamente!");
  } catch (error) {
    console.error("Erro ao interagir com o contrato:", error);
  }
}

checkContract().catch(console.error);