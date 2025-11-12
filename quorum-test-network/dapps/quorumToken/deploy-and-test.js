// Script para implantar e testar o contrato imediatamente
const hre = require("hardhat");

async function deployAndTest() {
  console.log("Implantando e testando o contrato...");

  // Fazer deploy
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy();
  
  await ticketNFT.waitForDeployment();
  const address = await ticketNFT.getAddress();
  
  console.log(`TicketNFT contrato implantado em: ${address}`);

  try {
    // Testar imediatamente após a implantação
    const owner = await ticketNFT.owner();
    console.log("✓ Owner:", owner);

    const name = await ticketNFT.name();
    console.log("✓ Nome:", name);

    const symbol = await ticketNFT.symbol();
    console.log("✓ Símbolo:", symbol);

    const totalSupply = await ticketNFT.totalSupply();
    console.log("✓ Total Supply:", totalSupply.toString());

    console.log("\n✓ Contrato está funcionando corretamente!");
    
    // Salvar o novo endereço
    const fs = require("fs");
    let envContent = fs.existsSync('.env') ? fs.readFileSync('.env', "utf8") : "";
    const contractAddressRegex = /^CONTRACT_ADDRESS=.*$/m;
    
    if (envContent.match(contractAddressRegex)) {
      envContent = envContent.replace(contractAddressRegex, `CONTRACT_ADDRESS=${address}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${address}`;
    }
    
    fs.writeFileSync('.env', envContent);
    console.log(`\n✓ Endereço do contrato atualizado no .env: ${address}`);
    
  } catch (error) {
    console.error("✗ Erro durante o teste:", error.message);
  }
}

deployAndTest().catch(console.error);