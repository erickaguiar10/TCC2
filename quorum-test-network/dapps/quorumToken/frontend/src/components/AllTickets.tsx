import React, { useEffect, useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { formatEther } from "ethers"; // ethers v6+

interface Ticket {
  id: string;
  dono: string;
  evento: string;
  data: string;
  preco: string;
  status: string;
}

export const AllTickets = () => {
  const { contract } = useTicketNFT();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchAllTickets = async () => {
    try {
      if (!contract) return;

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
          preco: formatEther(ingresso.preco),
          status: ["Disponível", "Vendido", "Revenda"][Number(ingresso.status)],
        };
      });

      const parsed = await Promise.all(promises);
      setTickets(parsed);
    } catch (err) {
      console.error("Erro ao carregar ingressos:", err);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, [contract]);

  return (
    <div>
      <h2>Todos os Ingressos</h2>
      <ol>
        {tickets.map((ticket, index) => (
          <li key={ticket.id}>
            <strong>Evento:</strong> {ticket.evento} |{" "}
            <strong>Data:</strong> {ticket.data} |{" "}
            <strong>Preço:</strong> {ticket.preco} ETH |{" "}
            <strong>Dono:</strong> {ticket.dono} |{" "}
            <strong>Situação:</strong> {ticket.status}
          </li>
        ))}
      </ol>
    </div>
  );
};
