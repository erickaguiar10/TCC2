require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config(); // Add this line to load .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      gasPrice: 875000000,
      gas: 12000000, // Increased gas limit for complex operations
      allowUnlimitedContractSize: true,
      blockGasLimit: 12000000,
    },
    quickstart: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        process.env.PRIVATE_KEY || "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63", // Conta com saldo: 0xfe3b557e8fb62b89f4916b721be55ceb828dbd73
        "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3", // Outra conta de teste: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
        "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f"  // Terceira conta de teste: 0xf17f52151EbEF6C7334FAD080c5704D77216b732
      ],
      gasPrice: 875000000,
      gas: 12000000, // Increased gas limit for complex operations
      timeout: 20000,
    },
    localhost: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        process.env.PRIVATE_KEY || "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
      ],
      gasPrice: 875000000,
      gas: 12000000,
      timeout: 20000,
    },
  },
  defaultNetwork: process.env.HARDHAT_DEFAULT_NETWORK || "hardhat",
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { 
        enabled: true, 
        runs: 200 
      },
      // Added for Quorum compatibility
      viaIR: true, // Enable compilation via IR to optimize for complex contracts
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
  // Added for better error reporting and debugging
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: 'USD',
  },
  etherscan: {
    // This is needed for verification but can be configured later
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};
                                                                                                                                    