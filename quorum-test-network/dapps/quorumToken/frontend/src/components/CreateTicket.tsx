// frontend/src/components/CreateTicket.tsx

import { useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { ethers } from "ethers";
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, useToast, Text } from "@chakra-ui/react";

export function CreateTicket() {
  const { contract, account, isOwner, loadingOwner } = useTicketNFT();
  const [evento, setEvento] = useState("");
  const [preco, setPreco] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contract && account) {
      try {
        setIsLoading(true);
        const tx = await contract.criarIngresso(
          evento,
          ethers.parseEther(preco || "0"),
          Math.floor(new Date(dataEvento).getTime() / 1000)
        );
        await tx.wait();
        
        toast({
          title: "Ingresso criado com sucesso!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Limpar o formulário após sucesso
        setEvento('');
        setPreco('');
        setDataEvento('');
      } catch (err) {
        console.error("Erro ao criar ingresso:", err);
        toast({
          title: "Erro ao criar ingresso.",
          description: "Veja o console para detalhes.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Conta não disponível.",
        description: "Verifique se MetaMask está conectado.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Exibir componente apenas se o usuário for o dono do contrato
  if (loadingOwner) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
        <Heading as="h2" size="md" mb={4}>Criar Novo Ingresso</Heading>
        <Text>Carregando...</Text>
      </Box>
    );
  }

  if (!isOwner) {
    return null; // Não exibe o componente se o usuário não for o dono
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading as="h2" size="md" mb={4}>Criar Novo Ingresso</Heading>
      <form onSubmit={handleCreate}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Evento</FormLabel>
            <Input
              value={evento}
              onChange={(e) => setEvento(e.target.value)}
              placeholder="Nome do evento"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Preço (em ETH)</FormLabel>
            <Input
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 0.01"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Data do Evento</FormLabel>
            <Input
              type="date"
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="Criando..."
            isDisabled={!account || !contract}
          >
            Criar Ingresso
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
