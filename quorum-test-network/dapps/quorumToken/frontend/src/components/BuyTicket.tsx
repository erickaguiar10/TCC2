// frontend/src/components/BuyTicket.tsx

import { useState, useEffect } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { useTicketContext } from "../contexts/TicketContext";
import { ethers } from "ethers";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  useToast,
  List,
  ListItem,
  Flex,
  Badge,
  Tag,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
  Avatar,
  Divider,
  Stack
} from "@chakra-ui/react";
import { FaTicketAlt, FaCalendarAlt, FaMoneyBillWave, FaTag, FaUser } from 'react-icons/fa';

export function BuyTicket() {
  const { contract } = useTicketNFT();
  const { refreshMyTickets, refreshAllTickets, allTickets } = useTicketContext();
  const [tokenId, setTokenId] = useState("");
  const [preco, setPreco] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<{evento: string, data: string, dono: string, status: string} | null>(null);
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
        } catch (err: any) {
          console.error("Erro ao buscar informações do ingresso:", err);
          let errorMessage = "Erro ao buscar informações do ingresso";

          if (err.code === 4001) {
            errorMessage = "Acesso negado ao buscar informações do ingresso.";
          } else if (err.message) {
            if (err.message.includes("reverted")) {
              errorMessage = "O ingresso não existe ou está indisponível.";
            } else if (err.message.includes("invalid token ID")) {
              errorMessage = "ID de ingresso inválido.";
            } else {
              errorMessage += `: ${err.message}`;
            }
          }

          setError(errorMessage);
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

        // Atualizar as listas de ingressos
        refreshMyTickets();
        refreshAllTickets();
      } catch (err: any) {
        console.error("Erro ao comprar ingresso:", err);
        let errorMessage = "Erro ao comprar ingresso.";

        // Tratamento específico de erros com base no tipo de erro
        if (err.code) {
          switch (err.code) {
            case 'INSUFFICIENT_FUNDS':
              errorMessage = "Saldo insuficiente para comprar o ingresso.";
              break;
            case 'UNPREDICTABLE_GAS_LIMIT':
              errorMessage = "Transação rejeitada. Valor do ingresso pode estar incorreto.";
              break;
            case 4001: // Erro quando o usuário rejeita a transação no MetaMask
              errorMessage = "Compra cancelada pelo usuário.";
              break;
            default:
              errorMessage += ` Código: ${err.code}`;
              break;
          }
        } else if (err.reason) {
          // Tratar razões específicas do contrato
          if (err.reason.includes("Ingresso não disponível")) {
            errorMessage = "Este ingresso não está mais disponível para compra.";
          } else if (err.reason.includes("Preço incorreto")) {
            errorMessage = "O preço do ingresso foi alterado ou está incorreto.";
          } else {
            errorMessage += ` Motivo: ${err.reason}`;
          }
        } else if (err.message) {
          // Tratamento de mensagens de erro específicas do contrato
          if (err.message.includes("reverted")) {
            errorMessage = "A transação foi revertida pelo contrato. O ingresso pode não estar mais disponível.";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Saldo insuficiente para pagar pelo ingresso.";
          } else if (err.message.includes("transfer amount exceeds balance")) {
            errorMessage = "Saldo insuficiente para completar a compra.";
          } else if (err.message.includes("ingresso não existe")) {
            errorMessage = "O ingresso com este ID não existe.";
          } else if (err.message.includes("ingresso já vendido")) {
            errorMessage = "Este ingresso já foi vendido.";
          } else {
            errorMessage += ` ${err.message}`;
          }
        } else if (typeof err === 'string') {
          errorMessage += ` ${err}`;
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
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow="lg" rounded="xl">
      <CardHeader pb={2}>
        <Heading as="h2" size="md" display="flex" alignItems="center" gap={2}>
          <Icon as={FaTicketAlt} color="brand.500" />
          Comprar Ingresso
        </Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleBuy}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FaTag} color="brand.500" />
                Token ID
              </FormLabel>
              <Input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="ID do ingresso"
                focusBorderColor="brand.500"
              />
            </FormControl>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertTitle mr={2}>Erro:</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {preco !== null && ticketInfo && !error && (
              <Card bg={useColorModeValue("green.50", "green.900")} border="1px solid" borderColor="green.200">
                <CardBody>
                  <Stack spacing={4}>
                    <Flex align="center" gap={4} wrap="wrap">
                      <Icon as={FaTicketAlt} w={8} h={8} color="green.500" />
                      <Box flex="1" minW="0">
                        <Text fontWeight="bold" fontSize="lg" noOfLines={1} wordBreak="break-word">{ticketInfo.evento}</Text>
                        <Flex align="center" gap={3} mt={1} wrap="wrap">
                          <Tag size="sm" colorScheme="green" variant="outline" wordBreak="break-word">
                            ID: {tokenId}
                          </Tag>
                          <Badge
                            colorScheme={
                              ticketInfo.status === "Disponível" ? "green" :
                              ticketInfo.status === "Revenda" ? "yellow" : "red"
                            }
                          >
                            {ticketInfo.status}
                          </Badge>
                        </Flex>
                      </Box>
                    </Flex>
                    <Divider />
                    <Stack spacing={3} width="100%">
                      <Box>
                        <Text fontSize="sm" display="flex" alignItems="center" gap={1} mb={1}>
                          <Icon as={FaCalendarAlt} color="gray.500" /> Data: {ticketInfo.data}
                        </Text>
                        <Text fontSize="sm" display="flex" alignItems="center" gap={1} noOfLines={1} wordBreak="break-all">
                          <Icon as={FaUser} color="gray.500" /> Dono: {ticketInfo.dono.slice(0, 6)}...{ticketInfo.dono.slice(-4)}
                        </Text>
                      </Box>
                      <Box textAlign="left">
                        <Text fontSize="xl" fontWeight="bold" color="green.600" wordBreak="break-all">
                          {ethers.formatEther(preco)} ETH
                        </Text>
                      </Box>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
            )}

            <Button
              type="submit"
              bg="green.500"
              color="white"
              _hover={{ bg: "green.600" }}
              isLoading={isLoading}
              loadingText="Comprando..."
              isDisabled={preco === null || error !== null}
              size="lg"
              mt={2}
            >
              Comprar Ingresso
            </Button>
          </VStack>
        </form>

        <Box mt={6}>
          <Heading as="h3" size="sm" mb={3} display="flex" alignItems="center" gap={2}>
            <Icon as={FaTicketAlt} color="brand.500" />
            Ingressos Disponíveis para Compra
          </Heading>
          <Box maxH="400px" overflowY="auto" css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: useColorModeValue('gray.100', 'gray.700'),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('gray.300', 'gray.500'),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: useColorModeValue('gray.400', 'gray.400'),
            },
          }}>
            <List spacing={3}>
              {allTickets
                .filter(ticket => ticket.status === "Disponível" || ticket.status === "Revenda")
                .map((ticket) => (
                  <ListItem key={ticket.id} p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: useColorModeValue("gray.50", "gray.600") }} transition="all 0.2s">
                    <Flex align="center" minW="0">
                      <Box flex="1" minW="0">
                        <Flex align="center" mb={1} wrap="wrap">
                          <Text fontWeight="medium" fontSize="md" mr={3} isTruncated maxW={{ base: "60%", md: "70%" }}>
                            {ticket.evento}
                          </Text>
                          <Tag
                            size="sm"
                            colorScheme="brand"
                            variant="outline"
                            cursor="pointer"
                            onClick={() => {
                              setTokenId(ticket.id);
                            }}
                            whiteSpace="normal"
                            flexShrink={0}
                            wordBreak="break-word"
                          >
                            ID: {ticket.id}
                          </Tag>
                        </Flex>
                        <Flex align="center" gap={4} mt={2} wrap="wrap">
                          <Text fontSize="sm" display="flex" alignItems="center" gap={1} whiteSpace="nowrap">
                            <Icon as={FaCalendarAlt} color="gray.500" /> {ticket.data}
                          </Text>
                          <Text fontSize="sm" display="flex" alignItems="center" gap={1} whiteSpace="normal" wordBreak="break-word">
                            <Icon as={FaMoneyBillWave} color="gray.500" /> {ticket.preco} ETH
                          </Text>
                        </Flex>
                      </Box>
                      <Badge
                        colorScheme={
                          ticket.status === "Disponível" ? "green" :
                          ticket.status === "Revenda" ? "yellow" : "red"
                        }
                        ml={2}
                        px={3}
                        py={1}
                        rounded="full"
                        flexShrink={0}
                        whiteSpace="nowrap"
                      >
                        {ticket.status}
                      </Badge>
                    </Flex>
                  </ListItem>
                ))
              }
              {allTickets.filter(ticket => ticket.status === "Disponível" || ticket.status === "Revenda").length === 0 && (
                <Text textAlign="center" py={4} color={useColorModeValue("gray.500", "gray.400")}>
                  Nenhum ingresso disponível para compra no momento
                </Text>
              )}
            </List>
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
}
