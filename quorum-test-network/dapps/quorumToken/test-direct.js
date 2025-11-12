// Teste simples para verificar se o contrato está respondendo
const hre = require("hardhat");

async function main() {
  // Pegar o contrato já implantado
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.attach(contractAddress);

  console.log("Conectado ao contrato já implantado:", contractAddress);

  try {
    // Obter o owner usando uma abordagem diferente
    const owner = await ticketNFT.owner();
    console.log("Owner:", owner);

    // Obter total supply
    const totalSupply = await ticketNFT.totalSupply();
    console.log("Total Supply:", totalSupply.toString());
    
    // Testar uma chamada de view simples
    const name = await ticketNFT.name();
    console.log("Nome do token:", name);
    
    const symbol = await ticketNFT.symbol();
    console.log("Símbolo do token:", symbol);
  } catch (error) {
    console.error("Erro:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});