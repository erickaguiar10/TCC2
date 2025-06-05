import { ethers } from "hardhat";

async function main() {
  // 1) Pega a Factory do seu contrato
  const TicketNFT = await ethers.getContractFactory("TicketNFT");

  // 2) Faz o deploy (no Ethers v6, isso já retorna o contrato em "pending deployment")
  const ticketNFT = await TicketNFT.deploy();

  // 3) Aguarda efetivamente a mineração da transação de deploy
  await ticketNFT.waitForDeployment();

  // 4) Exibe o endereço onde o contrato caiu
  console.log("TicketNFT implantado em:", ticketNFT.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
