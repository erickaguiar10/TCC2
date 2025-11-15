import React, { useEffect, useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { formatEther } from "ethers"; // ethers v6+
import { Box, Heading, Text, List, ListItem, Flex, Spacer, Badge, Tag, Button } from "@chakra-ui/react";

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
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">Todos os Ingressos</Heading>
        <Button size="sm" onClick={fetchAllTickets}>
          Atualizar
        </Button>
      </Flex>
      <List spacing={3}>
        {tickets.map((ticket, index) => (
          <ListItem key={ticket.id}>
            <Flex align="center">
              <Box>
                <Flex align="center" mb={1}>
                  <Text fontWeight="bold" mr={2}>{ticket.evento}</Text>
                  <Tag size="sm" colorScheme="blue" variant="outline">
                    ID: {ticket.id}
                  </Tag>
                </Flex>
                <Text fontSize="sm">Data: {ticket.data}</Text>
                <Text fontSize="sm">Preço: {ticket.preco} ETH</Text>
                <Text fontSize="xs" color="gray.500">Dono: {ticket.dono.slice(0, 6)}...{ticket.dono.slice(-4)}</Text>
              </Box>
              <Spacer />
              <Badge 
                colorScheme={
                  ticket.status === "Disponível" ? "green" : 
                  ticket.status === "Vendido" ? "red" : "yellow"
                } 
                ml={2}
              >
                {ticket.status}
              </Badge>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
