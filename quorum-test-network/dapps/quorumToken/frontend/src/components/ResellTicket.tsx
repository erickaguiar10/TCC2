// frontend/src/components/ResellTicket.tsx

import { useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { ethers } from "ethers";
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, Text } from "@chakra-ui/react";

export function ResellTicket() {
  const { contract } = useTicketNFT();

  const [tokenId, setTokenId] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  async function handleResell(e: React.FormEvent) {
    e.preventDefault();
    if (contract) {
      try {
        setIsLoading(true);
        setError(null);
        const tx = await contract.revenderIngresso(
          Number(tokenId),
          ethers.parseEther(novoPreco || "0")
        );
        await tx.wait();
        
        toast({
          title: "Ingresso colocado em revenda com sucesso!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Limpar campos após sucesso
        setTokenId('');
        setNovoPreco('');
        setError(null);
      } catch (err: any) {
        console.error("Erro ao colocar em revenda:", err);
        let errorMessage = "Erro ao colocar ingresso em revenda.";
        if (err.reason) {
          errorMessage += ` Motivo: ${err.reason}`;
        } else if (err.message) {
          errorMessage += ` ${err.message}`;
        }
        
        toast({
          title: "Erro ao colocar em revenda.",
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
      <Heading as="h2" size="md" mb={4}>Revender Ingresso</Heading>
      <form onSubmit={handleResell}>
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
          <FormControl isRequired>
            <FormLabel>Novo Preço (ETH)</FormLabel>
            <Input
              value={novoPreco}
              onChange={(e) => setNovoPreco(e.target.value)}
              placeholder="0.01"
            />
          </FormControl>
          
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Erro:</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            colorScheme="yellow"
            isLoading={isLoading}
            loadingText="Processando..."
            isDisabled={!tokenId || !novoPreco}
          >
            Colocar em Revenda
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
