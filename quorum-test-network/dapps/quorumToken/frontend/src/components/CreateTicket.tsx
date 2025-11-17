// frontend/src/components/CreateTicket.tsx

import { useState } from "react";
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
  useToast,
  Text,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { FaCalendarAlt, FaMoneyBillWave, FaTheaterMasks } from 'react-icons/fa';

export function CreateTicket() {
  const { contract, account, isOwner, loadingOwner } = useTicketNFT();
  const { refreshMyTickets, refreshAllTickets } = useTicketContext();
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

        // Atualizar as listas de ingressos
        refreshMyTickets();
        refreshAllTickets();
      } catch (err: any) {
        console.error("Erro ao criar ingresso:", err);
        let errorMessage = "Erro ao criar ingresso.";

        // Tratamento específico de erros com base no tipo de erro
        if (err.code) {
          switch (err.code) {
            case 'INSUFFICIENT_FUNDS':
              errorMessage = "Saldo insuficiente para criar o ingresso.";
              break;
            case 'UNPREDICTABLE_GAS_LIMIT':
              errorMessage = "Transação rejeitada. Verifique os valores informados.";
              break;
            case 4001: // Erro quando o usuário rejeita a transação no MetaMask
              errorMessage = "Transação rejeitada pelo usuário.";
              break;
            default:
              errorMessage += ` Código: ${err.code}`;
              break;
          }
        } else if (err.reason) {
          errorMessage += ` Motivo: ${err.reason}`;
        } else if (err.message) {
          // Tratamento de mensagens de erro específicas do contrato
          if (err.message.includes("reverted")) {
            errorMessage = "A transação foi revertida pelo contrato. Verifique os parâmetros.";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Saldo insuficiente para pagar a transação.";
          } else if (err.message.includes("already exists")) {
            errorMessage = "Já existe um ingresso com esse ID.";
          } else {
            errorMessage += ` ${err.message}`;
          }
        } else if (typeof err === 'string') {
          errorMessage += ` ${err}`;
        }

        toast({
          title: "Erro ao criar ingresso.",
          description: errorMessage,
          status: "error",
          duration: 5000,
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
      <Card bg={useColorModeValue("white", "gray.700")} boxShadow="lg" rounded="xl">
        <CardHeader>
          <Heading as="h2" size="md">Criar Novo Ingresso</Heading>
        </CardHeader>
        <CardBody>
          <Text>Carregando...</Text>
        </CardBody>
      </Card>
    );
  }

  if (!isOwner) {
    return null; // Não exibe o componente se o usuário não for o dono
  }

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow="lg" rounded="xl">
      <CardHeader pb={2}>
        <Heading as="h2" size="md" display="flex" alignItems="center" gap={2}>
          <Icon as={FaTheaterMasks} color="brand.500" />
          Criar Novo Ingresso
        </Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleCreate}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FaTheaterMasks} color="brand.500" />
                Evento
              </FormLabel>
              <Input
                value={evento}
                onChange={(e) => setEvento(e.target.value)}
                placeholder="Nome do evento"
                focusBorderColor="brand.500"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FaMoneyBillWave} color="brand.500" />
                Preço (em ETH)
              </FormLabel>
              <Input
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Ex: 0.01"
                type="number"
                step="0.0001"
                focusBorderColor="brand.500"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FaCalendarAlt} color="brand.500" />
                Data do Evento
              </FormLabel>
              <Input
                type="date"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                focusBorderColor="brand.500"
              />
            </FormControl>
            <Button
              type="submit"
              bg="brand.500"
              color="white"
              _hover={{ bg: "brand.600" }}
              isLoading={isLoading}
              loadingText="Criando..."
              isDisabled={!account || !contract}
              size="lg"
              mt={2}
            >
              Criar Ingresso
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}
