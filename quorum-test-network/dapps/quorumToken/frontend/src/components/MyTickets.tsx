import React, { useEffect, useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { formatEther } from "ethers"; // ethers v6
import { Box, Heading, Text, List, ListItem, ListIcon, Flex, Spacer, Badge, Tag, Button } from "@chakra-ui/react";

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
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">Meus Ingressos</Heading>
        <Button size="sm" onClick={fetchMyTickets}>
          Atualizar
        </Button>
      </Flex>
      <List spacing={3}>
        {myTickets.map((ticket, index) => (
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
