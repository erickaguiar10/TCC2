import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTicketNFT } from '../hooks/useTicketNFT';
import { ethers } from 'ethers';

interface Ticket {
  id: string;
  dono: string;
  evento: string;
  data: string;
  preco: string;
  status: string;
}

interface TicketContextType {
  myTickets: Ticket[];
  allTickets: Ticket[];
  refreshMyTickets: () => Promise<void>;
  refreshAllTickets: () => Promise<void>;
  isLoadingMyTickets: boolean;
  isLoadingAllTickets: boolean;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { contract, account } = useTicketNFT();
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [isLoadingMyTickets, setIsLoadingMyTickets] = useState(false);
  const [isLoadingAllTickets, setIsLoadingAllTickets] = useState(false);

  const refreshMyTickets = useCallback(async () => {
    if (contract && account) {
      try {
        setIsLoadingMyTickets(true);
        const ids = await contract.ingressosDoUsuario(account);

        const tickets = await Promise.all(
          ids.map(async (tokenId: any) => {
            const ingresso = await contract.ingressos(tokenId);
            const dataEvento = new Date(Number(ingresso.dataEvento) * 1000);
            const dataFormatada = dataEvento.toLocaleDateString("pt-BR");

            return {
              id: tokenId.toString(),
              dono: account,
              evento: ingresso.evento,
              data: dataFormatada,
              preco: ethers.formatEther(ingresso.preco),
              status: ["Disponível", "Vendido", "Revenda"][Number(ingresso.status)],
            };
          })
        );

        setMyTickets(tickets);
      } catch (err) {
        console.error("Erro ao carregar ingressos do usuário:", err);
      } finally {
        setIsLoadingMyTickets(false);
      }
    }
  }, [contract, account]);

  const refreshAllTickets = useCallback(async () => {
    if (!contract) return;

    try {
      setIsLoadingAllTickets(true);
      const tokenIds = await contract.listarIngressos();

      const promises = tokenIds.map(async (tokenId: any) => {
        const ingresso = await contract.ingressos(tokenId);
        const dono = await contract.ownerOf(tokenId);

        const dataEvento = new Date(Number(ingresso.dataEvento) * 1000);
        const dataFormatada = dataEvento.toLocaleDateString("pt-BR");

        return {
          id: tokenId.toString(),
          dono,
          evento: ingresso.evento,
          data: dataFormatada,
          preco: ethers.formatEther(ingresso.preco),
          status: ["Disponível", "Vendido", "Revenda"][Number(ingresso.status)],
        };
      });

      const parsed = await Promise.all(promises);
      setAllTickets(parsed);
    } catch (err) {
      console.error("Erro ao carregar ingressos:", err);
    } finally {
      setIsLoadingAllTickets(false);
    }
  }, [contract]);

  // Efeito para adicionar listeners de eventos do contrato
  useEffect(() => {
    if (!contract) return;

    const handleIngressoCriado = () => {
      console.log("Novo ingresso criado detectado");
      refreshAllTickets();
      refreshMyTickets();
    };

    const handleIngressoVendido = () => {
      console.log("Ingresso vendido detectado");
      refreshAllTickets();
      refreshMyTickets();
    };

    const handleIngressoRevenda = () => {
      console.log("Ingresso colocado à venda detectado");
      refreshAllTickets();
      refreshMyTickets();
    };

    // Adicionar listeners
    contract.on("IngressoCriado", handleIngressoCriado);
    contract.on("IngressoVendido", handleIngressoVendido);
    contract.on("IngressoRevenda", handleIngressoRevenda);

    // Limpar listeners quando o componente for desmontado
    return () => {
      contract.off("IngressoCriado", handleIngressoCriado);
      contract.off("IngressoVendido", handleIngressoVendido);
      contract.off("IngressoRevenda", handleIngressoRevenda);
    };
  }, [contract, refreshAllTickets, refreshMyTickets]);

  // Carregar dados iniciais
  useEffect(() => {
    if (contract && account) {
      refreshMyTickets();
      refreshAllTickets();
    }
  }, [contract, account, refreshMyTickets, refreshAllTickets]);

  return (
    <TicketContext.Provider
      value={{
        myTickets,
        allTickets,
        refreshMyTickets,
        refreshAllTickets,
        isLoadingMyTickets,
        isLoadingAllTickets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTicketContext must be used within a TicketProvider');
  }
  return context;
};