import { useState, useEffect } from "react";
import { toast } from "../components/ui/sonner";
import { api, Ticket, TicketDetails } from "../utils/api";

// 🔹 Declaração global pro TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useTicketNFT = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    // Verificar se já existe um token armazenado
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verificar se o token é válido fazendo uma chamada de teste
      checkTokenValidity();
    }
  }, []);

  useEffect(() => {
    // Initialize contract when wallet is connected or account changes
    const initializeContract = async () => {
      if (isConnected && account && window.ethereum) {
        try {
          const ethersModule = await import("ethers");
          const abi = await import("../../../../abis/TicketNFT.json");
          const contractAddress = import.meta.env.VITE_TICKETNFT_ADDRESS || import.meta.env.VITE_CONTRACT_ADDRESS || "0x05d91B9031A655d08E654177336d08543AC4B711";
          
          const provider = new ethersModule.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = new ethersModule.Contract(
            contractAddress,
            abi.default.abi,
            signer
          );
          
          setContract(contractInstance);
        } catch (error) {
          console.error("❌ Erro ao inicializar contrato:", error);
          toast.error("Erro ao inicializar contrato. Verifique se está conectado à rede correta.");
        }
      } else {
        // Reset contract if disconnected
        setContract(null);
      }
    };

    initializeContract();
  }, [isConnected, account]);

  const checkTokenValidity = async () => {
    try {
      const response = await api.getOwner();
      if (response.data) {
        // O token é válido, mas não temos a conta conectada
        setIsConnected(true);
      }
    } catch (error) {
      // Token inválido, remover
      localStorage.removeItem('access_token');
      setIsConnected(false);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        // Check if user has already authorized the app
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        
        let userAccount;
        if (accounts.length > 0) {
          // User already connected, just get the account
          userAccount = accounts[0];
        } else {
          // Request account access
          const newAccounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          userAccount = newAccounts[0];
        }
        
        setAccount(userAccount);

        const ethersModule = await import("ethers");
        const provider = new ethersModule.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // ALTERAÇÃO: Gerar mensagem de login com timestamp como string
        const timestamp = Date.now().toString();
        const message = `Login em ${timestamp}`;
        
        // Sign the message using the connected wallet - ensure proper encoding
        const signature = await signer.signMessage(message);

        // ALTERAÇÃO: Fazer login no backend enviando o timestamp
        const response = await api.login(userAccount, signature, timestamp);
        const { access_token } = response.data;

        // Armazenar o token
        localStorage.setItem('access_token', access_token);

        setIsConnected(true);
        
        toast.success("Carteira conectada com sucesso!");
      } else {
        throw new Error("MetaMask não detectado. Por favor, instale o MetaMask para continuar.");
      }
    } catch (error: any) {
      console.error("❌ Erro ao conectar carteira:", error);
      
      // Tratar diferentes tipos de erro
      let errorMessage = "Erro ao conectar carteira";
      // Verifica se o erro é do axios e tem uma resposta do backend
      if (error.response && error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
      } else if (error.code === 4001) {
        // User rejected request
        errorMessage = "Conexão da carteira foi rejeitada pelo usuário.";
      } else if (error.code === -32002 || error?.data?.originalError?.code === -32002) {
        // Request already pending
        errorMessage = "Já existe uma solicitação de conexão pendente. Verifique sua carteira.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Funções para interagir com o backend
  const getOwner = async (): Promise<string> => {
    try {
      const response = await api.getOwner();
      return response.data.owner;
    } catch (error: any) {
      console.error("❌ Erro ao obter owner:", error);
      throw error;
    }
  };

  const getTotalSupply = async (): Promise<number> => {
    try {
      const response = await api.getTotalSupply();
      return response.data.totalSupply;
    } catch (error: any) {
      console.error("❌ Erro ao obter total supply:", error);
      throw error;
    }
  };

  const getTickets = async (start: number = 0, limit: number = 100): Promise<Ticket[]> => {
    try {
      const response = await api.getTickets(start, limit);
      return response.data.tickets;
    } catch (error: any) {
      console.error("❌ Erro ao obter ingressos:", error);
      throw error;
    }
  };

  const getTicket = async (tokenId: number): Promise<TicketDetails> => {
    try {
      const response = await api.getTicket(tokenId);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao obter ingresso:", error);
      throw error;
    }
  };

  // Direct contract interaction methods (frontend-only)
  const createTicketDirect = async (
    eventName: string,
    price: number,
    eventDate: number
  ): Promise<any> => {
    try {
      if (!contract) {
        throw new Error("Contrato não inicializado. Conecte sua carteira primeiro.");
      }
      
      const tx = await contract.criarIngresso(eventName, price, eventDate);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.error("❌ Erro ao criar ingresso:", error);
      throw error;
    }
  };

  const buyTicketDirect = async (
    tokenId: number,
    value: number
  ): Promise<any> => {
    try {
      if (!contract) {
        throw new Error("Contrato não inicializado. Conecte sua carteira primeiro.");
      }
      
      const tx = await contract.comprarIngresso(tokenId, { value: value });
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.error("❌ Erro ao comprar ingresso:", error);
      throw error;
    }
  };

  const resellTicketDirect = async (
    tokenId: number,
    newPrice: number
  ): Promise<any> => {
    try {
      if (!contract) {
        throw new Error("Contrato não inicializado. Conecte sua carteira primeiro.");
      }
      
      const tx = await contract.revenderIngresso(tokenId, newPrice);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.error("❌ Erro ao revender ingresso:", error);
      throw error;
    }
  };

  const updateTicketStatusDirect = async (
    tokenId: number,
    newStatus: number
  ): Promise<any> => {
    try {
      if (!contract) {
        throw new Error("Contrato não inicializado. Conecte sua carteira primeiro.");
      }
      
      const tx = await contract.atualizarStatus(tokenId, newStatus);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.error("❌ Erro ao atualizar status do ingresso:", error);
      throw error;
    }
  };

  // For backwards compatibility, but using backend API instead of private keys
  const createTicket = async (
    eventName: string,
    price: number,
    eventDate: number,
    fromAccount: string,
    privateKey: string
  ): Promise<any> => {
    try {
      const response = await api.createTicket(eventName, price, eventDate, fromAccount, privateKey);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao criar ingresso:", error);
      throw error;
    }
  };

  const buyTicket = async (
    tokenId: number,
    value: number,
    fromAccount: string,
    privateKey: string
  ): Promise<any> => {
    try {
      const response = await api.buyTicket(tokenId, value, fromAccount, privateKey);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao comprar ingresso:", error);
      throw error;
    }
  };

  const resellTicket = async (
    tokenId: number,
    newPrice: number,
    fromAccount: string,
    privateKey: string
  ): Promise<any> => {
    try {
      const response = await api.resellTicket(tokenId, newPrice, fromAccount, privateKey);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao revender ingresso:", error);
      throw error;
    }
  };

  const getTicketsByOwner = async (ownerAddress: string): Promise<Ticket[]> => {
    try {
      const response = await api.getTicketsByOwner(ownerAddress);
      return response.data.tickets;
    } catch (error: any) {
      console.error("❌ Erro ao obter ingressos do proprietário:", error);
      throw error;
    }
  };

  return {
    account,
    isConnected,
    error,
    loading,
    connectWallet,
    getOwner,
    getTotalSupply,
    getTickets,
    getTicket,
    createTicket,
    buyTicket,
    resellTicket,
    getTicketsByOwner,
    // Direct contract methods 
    createTicketDirect,
    buyTicketDirect,
    resellTicketDirect,
    updateTicketStatusDirect
  };
};
