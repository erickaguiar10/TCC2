// hardhat.config.ts

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    // rede local in-memory do Hardhat (padrão)
    hardhat: {
      chainId: 1337,      // ← aqui garantimos 1337, não 31337
      gasPrice: 0         // opcional, para testes locais sem gas
    },
    // rede Quorum/Quickstart local (RPC em 127.0.0.1:8545)
    quickstart: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
        "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
        "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
        
      ],
      gasPrice: 0, // Quorum costuma usar gasPrice = 0
    },
  },
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.20",  // Hardhat usará exatamente solc 0.8.20
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;
