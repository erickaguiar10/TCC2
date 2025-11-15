// frontend/src/components/BuyTicket.tsx

import { useState, useEffect } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { ethers } from "ethers";
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Text, useToast, List, ListItem, Flex, Badge, Tag, Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";

export function BuyTicket() {
  const { contract } = useTicketNFT();
  const [tokenId, setTokenId] = useState("");
  const [preco, setPreco] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<{evento: string, data: string, dono: string, status: string} | null>(null);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    async function fetchTicketInfo() {
      if (contract && tokenId) {
        try {
          setError(null);
          const ingresso = await contract.ingressos(Number(tokenId));
          
          // Verificar se o ingresso existe
          const existe = await contract.verificarIngresso(Number(tokenId));
          if (!existe) {
            setError("Ingresso inexistente");
            setPreco(null);
            setTicketInfo(null);
            return;
          }
          
          // Verificar o status do ingresso
          const statusValue = await contract.statusIngresso(Number(tokenId));
          const statusText = ["Disponível", "Vendido", "Revenda"][Number(statusValue)];
          
          if (statusText === "Vendido") {
            setError("Ingresso já vendido");
            setPreco(null);
            setTicketInfo(null);
            return;
          }
          
          setPreco(ingresso.preco as bigint);
          
          // Obter informações do ticket para exibir
          const dataEvento = new Date(Number(ingresso.dataEvento) * 1000);
          const dataFormatada = dataEvento.toLocaleDateString("pt-BR");
          const dono = await contract.ownerOf(Number(tokenId));
          
          setTicketInfo({
            evento: ingresso.evento,
            data: dataFormatada,
            dono: dono,
            status: statusText
          });
        } catch (err) {
          console.error("Erro ao buscar informações do ingresso:", err);
          setError("Erro ao buscar informações do ingresso");
          setPreco(null);
          setTicketInfo(null);
        }
      } else {
        setPreco(null);
        setTicketInfo(null);
        setError(null);
      }
    }
    fetchTicketInfo();
  }, [contract, tokenId]);

  // Carregar todos os ingressos para exibir os disponíveis para compra
  useEffect(() => {
    const fetchAllTickets = async () => {
      if (contract) {
        try {
          const tokenIds = await contract.listarIngressos();
          const tickets = await Promise.all(
            tokenIds.map(async (tokenId: any) => {
              const ingresso = await contract.ingressos(tokenId);
              const dono = await contract.ownerOf(tokenId);
              const dataEvento = new Date(Number(ingresso.dataEvento) * 1000);
              const dataFormatada = dataEvento.toLocaleDateString("pt-BR");
              const statusValue = await contract.statusIngresso(tokenId);
              const statusText = ["Disponível", "Vendido", "Revenda"][Number(statusValue)];

              return {
                id: tokenId.toString(),
                evento: ingresso.evento,
                data: dataFormatada,
                preco: ethers.formatEther(ingresso.preco),
                status: statusText,
                dono
              };
            })
          );
          setAllTickets(tickets);
        } catch (err) {
          console.error("Erro ao carregar ingressos para compra:", err);
        }
      }
    };
    fetchAllTickets();
  }, [contract]);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (contract && preco !== null && ticketInfo) {
      try {
        setIsLoading(true);
        setError(null);
        const tx = await contract.comprarIngresso(Number(tokenId), { value: preco });
        await tx.wait();
        
        toast({
          title: "Ingresso comprado com sucesso!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Limpar campos após sucesso
        setTokenId('');
        setPreco(null);
        setTicketInfo(null);
        setError(null);
        
        // Atualizar a lista de todos os ingressos
        const fetchAllTickets = async () => {
          if (contract) {
            try {
              const tokenIds = await contract.listarIngressos();
              const tickets = await Promise.all(
                tokenIds.map(async (tokenId: any) => {
                  const ingresso = await contract.ingressos(tokenId);
                  const dono = await contract.ownerOf(tokenId);
                  const dataEvento = new Date(Number(ingresso.dataEvento) * 1000);
                  const dataFormatada = dataEvento.toLocaleDateString("pt-BR");
                  const statusValue = await contract.statusIngresso(tokenId);
                  const statusText = ["Disponível", "Vendido", "Revenda"][Number(statusValue)];

                  return {
                    id: tokenId.toString(),
                    evento: ingresso.evento,
                    data: dataFormatada,
                    preco: ethers.formatEther(ingresso.preco),
                    status: statusText,
                    dono
                  };
                })
              );
              setAllTickets(tickets);
            } catch (err) {
              console.error("Erro ao carregar ingressos para compra:", err);
            }
          }
        };
        fetchAllTickets();
      } catch (err: any) {
        console.error("Erro ao comprar ingresso:", err);
        let errorMessage = "Erro ao comprar ingresso.";
        if (err.reason) {
          errorMessage += ` Motivo: ${err.reason}`;
        } else if (err.message) {
          errorMessage += ` ${err.message}`;
        }
        
        toast({
          title: "Erro ao comprar ingresso.",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading as="h2" size="md" mb={4}>Comprar Ingresso</Heading>
      <form onSubmit={handleBuy}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Token ID</FormLabel>
            <Input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="ID do ingresso"
            />
          </FormControl>
          
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Erro:</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {preco !== null && ticketInfo && !error && (
            <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
              <Flex align="center" mb={1}>
                <Text fontWeight="bold" mr={2}>{ticketInfo.evento}</Text>
                <Tag size="sm" colorScheme="blue" variant="outline">
                  ID: {tokenId}
                </Tag>
              </Flex>
              <Text fontSize="sm" mb={1}>Data: {ticketInfo.data}</Text>
              <Text fontSize="sm" mb={1}>Dono: {ticketInfo.dono.slice(0, 6)}...{ticketInfo.dono.slice(-4)}</Text>
              <Text fontSize="sm" mb={1}>Status: {ticketInfo.status}</Text>
              <Text fontSize="lg" fontWeight="semibold" color="green.600">
                {ethers.formatEther(preco)} ETH
              </Text>
            </Box>
          )}
          
          <Button
            type="submit"
            colorScheme="green"
            isLoading={isLoading}
            loadingText="Comprando..."
            isDisabled={preco === null || error !== null}
          >
            Comprar Ingresso
          </Button>
        </VStack>
      </form>
      
      <Box mt={6}>
        <Heading as="h3" size="sm" mb={3}>Ingressos Disponíveis para Compra</Heading>
        <List spacing={2}>
          {allTickets
            .filter(ticket => ticket.status === "Disponível" || ticket.status === "Revenda")
            .map((ticket) => (
              <ListItem key={ticket.id} p={2} borderWidth="1px" borderRadius="md" _hover={{ bg: "gray.50" }}>
                <Flex align="center">
                  <Box flex="1">
                    <Flex align="center">
                      <Text fontWeight="medium" mr={2}>{ticket.evento}</Text>
                      <Tag size="sm" colorScheme="blue" variant="outline" cursor="pointer" onClick={() => {
                        setTokenId(ticket.id);
                      }}>
                        ID: {ticket.id}
                      </Tag>
                    </Flex>
                    <Text fontSize="xs" color="gray.600">Data: {ticket.data} | Preço: {ticket.preco} ETH</Text>
                  </Box>
                  <Badge 
                    colorScheme={
                      ticket.status === "Disponível" ? "green" : 
                      ticket.status === "Revenda" ? "yellow" : "red"
                    } 
                    ml={2}
                  >
                    {ticket.status}
                  </Badge>
                </Flex>
              </ListItem>
            ))
          }
        </List>
      </Box>
    </Box>
  );
}
