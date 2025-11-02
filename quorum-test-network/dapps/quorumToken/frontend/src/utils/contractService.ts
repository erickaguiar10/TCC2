import { ethers } from 'ethers';

// Contract interaction service for direct blockchain calls
class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;
  private abi: any;

  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x05d91B9031A655d08E654177336d08543AC4B711";
    this.abi = [
      // Only including the view/pure functions that don't require signing
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "ingressos",
        "outputs": [
          {
            "internalType": "string",
            "name": "evento",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "preco",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dataEvento",
            "type": "uint256"
          },
          {
            "internalType": "enum TicketNFT.Status",
            "name": "status",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "usuario",
            "type": "address"
          }
        ],
        "name": "ingressosDoUsuario",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "listarIngressos",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "statusIngresso",
        "outputs": [
          {
            "internalType": "enum TicketNFT.Status",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "dataEvento",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "verificarIngresso",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }

  async initialize() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.abi,
        this.provider // Use provider instead of signer for read-only functions
      );
    } else {
      throw new Error("Ethereum provider not found. Please install MetaMask.");
    }
  }

  async getContract() {
    if (!this.contract) {
      await this.initialize();
    }
    return this.contract;
  }

  // Read-only functions
  async getOwner(): Promise<string> {
    const contract = await this.getContract();
    return await contract.owner();
  }

  async getTotalSupply(): Promise<number> {
    const contract = await this.getContract();
    return Number(await contract.totalSupply());
  }

  async getTokenOwner(tokenId: number): Promise<string> {
    const contract = await this.getContract();
    return await contract.ownerOf(tokenId);
  }

  async getTicketDetails(tokenId: number): Promise<any> {
    const contract = await this.getContract();
    return await contract.ingressos(tokenId);
  }

  async getTicketsByOwner(ownerAddress: string): Promise<number[]> {
    const contract = await this.getContract();
    return await contract.ingressosDoUsuario(ownerAddress);
  }

  async getAllTickets(): Promise<number[]> {
    const contract = await this.getContract();
    return await contract.listarIngressos();
  }

  async getTicketStatus(tokenId: number): Promise<number> {
    const contract = await this.getContract();
    return Number(await contract.statusIngresso(tokenId));
  }

  async getEventDate(tokenId: number): Promise<number> {
    const contract = await this.getContract();
    return Number(await contract.dataEvento(tokenId));
  }

  async verifyTicket(tokenId: number): Promise<boolean> {
    const contract = await this.getContract();
    return await contract.verificarIngresso(tokenId);
  }
}

export const contractService = new ContractService();