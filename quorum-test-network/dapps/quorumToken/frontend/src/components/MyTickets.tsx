import React, { useEffect, useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { formatEther } from "ethers"; // ethers v6

interface Ticket {
  id: string;
  dono: string;
  evento: string;
  data: string;
  preco: string;
  status: string;
}

export const MyTickets = () => {
  const { contract, account } = useTicketNFT();
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  const fetchMyTickets = async () => {
    try {
      if (contract && account) {
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
              preco: formatEther(ingresso.preco),
              status: ["Disponível", "Vendido", "Revenda"][Number(ingresso.status)],
            };
          })
        );

        setMyTickets(tickets);
      }
    } catch (err) {
      console.error("Erro ao carregar ingressos do usuário:", err);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [contract, account]);

  return (
    <div>
      <h2>Meus Ingressos</h2>
      <ol>
        {myTickets.map((ticket, index) => (
          <li key={ticket.id}>
            <strong>Evento:</strong> {ticket.evento} |{" "}
            <strong>Data:</strong> {ticket.data} |{" "}
            <strong>Preço:</strong> {ticket.preco} ETH |{" "}
            <strong>Situação:</strong> {ticket.status}
          </li>
        ))}
      </ol>
    </div>
  );
};
