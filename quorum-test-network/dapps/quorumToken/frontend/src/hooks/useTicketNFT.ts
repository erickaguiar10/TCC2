// frontend/src/hooks/useTicketNFT.ts

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import TicketNFTJson from "../abis/TicketNFT.json";

const abi = TicketNFTJson.abi;
const contractAddress = "0x9a3DBCa554e9f6b9257aAa24010DA8377C57c17e";

export const useTicketNFT = () => {
  const [ticketContract, setTicketContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loadingOwner, setLoadingOwner] = useState<boolean>(true);

  // Função para atualizar o contrato
  const refreshContract = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAccount = await signer.getAddress();

        const contract = new ethers.Contract(contractAddress, abi, signer);
        setTicketContract(contract);
        setAccount(userAccount);

        // Verificar se o usuário é o dono do contrato
        try {
          const contractOwner = await contract.owner();
          setIsOwner(userAccount.toLowerCase() === contractOwner.toLowerCase());
        } catch (error) {
          console.error("Erro ao verificar dono do contrato:", error);
          setIsOwner(false);
        } finally {
          setLoadingOwner(false);
        }
      } catch (error) {
        console.error("Erro ao inicializar o contrato:", error);
        setLoadingOwner(false);
      }
    } else {
      console.warn("MetaMask não detectado ou não disponível.");
      setLoadingOwner(false);
    }
  }, []);

  useEffect(() => {
    refreshContract();
  }, [refreshContract]);

  // Função para adicionar listeners de eventos
  useEffect(() => {
    if (!ticketContract) return;

    // Funções de listener para os eventos
    const onIngressoCriado = () => {
      // Este evento pode ser usado para atualizar listas
      console.log("Novo ingresso criado");
    };

    const onIngressoVendido = () => {
      // Este evento pode ser usado para atualizar listas
      console.log("Ingresso vendido");
    };

    const onIngressoRevenda = () => {
      // Este evento pode ser usado para atualizar listas
      console.log("Ingresso colocado à venda");
    };

    // Adicionar listeners
    ticketContract.on("IngressoCriado", onIngressoCriado);
    ticketContract.on("IngressoVendido", onIngressoVendido);
    ticketContract.on("IngressoRevenda", onIngressoRevenda);

    // Limpar listeners quando o componente for desmontado
    return () => {
      ticketContract.off("IngressoCriado", onIngressoCriado);
      ticketContract.off("IngressoVendido", onIngressoVendido);
      ticketContract.off("IngressoRevenda", onIngressoRevenda);
    };
  }, [ticketContract]);

  return {
    contract: ticketContract,
    account,
    isOwner,
    loadingOwner,
    refreshContract
  };
};
