// frontend/src/components/ResellTicket.tsx

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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import { FaTag, FaMoneyBillWave, FaRegMoneyBillAlt } from 'react-icons/fa';

export function ResellTicket() {
  const { contract } = useTicketNFT();
  const { refreshMyTickets, refreshAllTickets } = useTicketContext();

  const [tokenId, setTokenId] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingResell, setPendingResell] = useState<{tokenId: number, novoPreco: bigint} | null>(null);
  const toast = useToast();

  async function handleResell(e: React.FormEvent) {
    e.preventDefault();

    if (contract && tokenId && novoPreco) {
      try {
        setError(null);

        // Verificar o status atual do ingresso
        const statusValue = await contract.statusIngresso(Number(tokenId));
        const statusText = ["Disponível", "Vendido", "Revenda"][Number(statusValue)];
        if (statusText === "Revenda") {
          // Se já estiver em revenda, mostrar confirmação e permitir atualização de preço
          setPendingResell({
            tokenId: Number(tokenId),
            novoPreco: ethers.parseEther(novoPreco || "0")
          });
          onOpen();
        } else {
          // Se não estiver em revenda, prosseguir diretamente
          setIsLoading(true);
          try {
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

            // Atualizar as listas de ingressos
            refreshMyTickets();
            refreshAllTickets();
          } catch (err: any) {
            console.error("Erro ao colocar em revenda:", err);
            let errorMessage = "Erro ao colocar ingresso em revenda.";

            // Tratamento específico de erros com base no tipo de erro
            if (err.code) {
              switch (err.code) {
                case 'INSUFFICIENT_FUNDS':
                  errorMessage = "Saldo insuficiente para colocar em revenda.";
                  break;
                case 'UNPREDICTABLE_GAS_LIMIT':
                  errorMessage = "Transação rejeitada. Verifique os valores informados.";
                  break;
                case 4001: // Erro quando o usuário rejeita a transação no MetaMask
                  errorMessage = "Revenda cancelada pelo usuário.";
                  break;
                default:
                  errorMessage = "Erro na transação. Verifique os dados e tente novamente.";
                  break;
              }
            } else if (err.reason) {
              // Tratar razões específicas do contrato
              if (err.reason.includes("Ingresso não pertence ao usuário")) {
                errorMessage = "Você não é o proprietário deste ingresso.";
              } else if (err.reason.includes("Token ID inválido")) {
                errorMessage = "ID do ingresso inválido.";
              } else if (err.reason.includes("Ingresso já vendido")) {
                errorMessage = "Este ingresso já foi vendido e não pode ser revendido.";
              } else {
                errorMessage = "Falha ao colocar ingresso em revenda. Verifique se você é o proprietário.";
              }
            } else if (err.message) {
              // Tratamento de mensagens de erro específicas do contrato
              if (err.message.includes("reverted")) {
                // Verificar se é um erro de ingresso não existente ou não pertencente
                if (err.message.includes("Ingresso inexistente")) {
                  errorMessage = "O ingresso com este ID não existe.";
                } else if (err.message.includes("Nao eh dono")) {
                  errorMessage = "Você não é o proprietário deste ingresso.";
                } else if (err.message.includes("ingresso não existe")) {
                  errorMessage = "O ingresso com este ID não existe.";
                } else if (err.message.includes("ingresso não pertence")) {
                  errorMessage = "Você não é o proprietário deste ingresso.";
                } else {
                  errorMessage = "Operação não permitida. Verifique se você é o proprietário do ingresso.";
                }
              } else if (err.message.includes("insufficient funds")) {
                errorMessage = "Saldo insuficiente para completar a operação.";
              } else if (err.message.includes("ingresso não existe")) {
                errorMessage = "O ingresso com este ID não existe.";
              } else if (err.message.includes("ingresso não pertence")) {
                errorMessage = "Você não é o proprietário deste ingresso.";
              } else {
                errorMessage = "Ocorreu um problema ao colocar o ingresso em revenda.";
              }
            } else if (typeof err === 'string') {
              errorMessage = `Erro na revenda: ${err}`;
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
      } catch (err: any) {
        console.error("Erro ao colocar em revenda:", err);
        let errorMessage = "Erro ao colocar ingresso em revenda.";

        // Tratamento específico de erros com base no tipo de erro
        if (err.code) {
          switch (err.code) {
            case 'INSUFFICIENT_FUNDS':
              errorMessage = "Saldo insuficiente para colocar em revenda.";
              break;
            case 'UNPREDICTABLE_GAS_LIMIT':
              errorMessage = "Transação rejeitada. Verifique os valores informados.";
              break;
            case 4001: // Erro quando o usuário rejeita a transação no MetaMask
              errorMessage = "Revenda cancelada pelo usuário.";
              break;
            default:
              errorMessage = "Erro na transação. Verifique os dados e tente novamente.";
              break;
          }
        } else if (err.reason) {
          // Tratar razões específicas do contrato
          if (err.reason.includes("Ingresso não pertence ao usuário")) {
            errorMessage = "Você não é o proprietário deste ingresso.";
          } else if (err.reason.includes("Token ID inválido")) {
            errorMessage = "ID do ingresso inválido.";
          } else if (err.reason.includes("Ingresso já vendido")) {
            errorMessage = "Este ingresso já foi vendido e não pode ser revendido.";
          } else {
            errorMessage = "Falha ao colocar ingresso em revenda. Verifique se você é o proprietário.";
          }
        } else if (err.message) {
          // Tratamento de mensagens de erro específicas do contrato
          if (err.message.includes("reverted")) {
            // Verificar se é um erro de ingresso não existente ou não pertencente
            if (err.message.includes("Ingresso inexistente")) {
              errorMessage = "O ingresso com este ID não existe.";
            } else if (err.message.includes("Nao eh dono")) {
              errorMessage = "Você não é o proprietário deste ingresso.";
            } else if (err.message.includes("ingresso não existe")) {
              errorMessage = "O ingresso com este ID não existe.";
            } else if (err.message.includes("ingresso não pertence")) {
              errorMessage = "Você não é o proprietário deste ingresso.";
            } else {
              errorMessage = "Operação não permitida. Verifique se você é o proprietário do ingresso.";
            }
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Saldo insuficiente para completar a operação.";
          } else if (err.message.includes("ingresso não existe")) {
            errorMessage = "O ingresso com este ID não existe.";
          } else if (err.message.includes("ingresso não pertence")) {
            errorMessage = "Você não é o proprietário deste ingresso.";
          } else if (typeof err === 'string' && err.includes("já está em revenda")) {
            errorMessage = "Este ingresso já está em revenda. A operação atualiza o preço de revenda.";
          } else {
            errorMessage = "Ocorreu um problema ao colocar o ingresso em revenda.";
          }
        } else if (typeof err === 'string') {
          errorMessage = `Erro na revenda: ${err}`;
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

  async function confirmResell() {
    if (contract && pendingResell) {
      try {
        setIsLoading(true);
        onClose(); // Fechar o modal

        const tx = await contract.revenderIngresso(
          pendingResell.tokenId,
          pendingResell.novoPreco
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

        // Atualizar as listas de ingressos
        refreshMyTickets();
        refreshAllTickets();
      } catch (err: any) {
        console.error("Erro ao confirmar revenda:", err);
        let errorMessage = "Erro ao colocar ingresso em revenda.";

        // Tratamento específico de erros com base no tipo de erro
        if (err.code) {
          switch (err.code) {
            case 'INSUFFICIENT_FUNDS':
              errorMessage = "Saldo insuficiente para colocar em revenda.";
              break;
            case 'UNPREDICTABLE_GAS_LIMIT':
              errorMessage = "Transação rejeitada. Verifique os valores informados.";
              break;
            case 4001: // Erro quando o usuário rejeita a transação no MetaMask
              errorMessage = "Revenda cancelada pelo usuário.";
              break;
            default:
              errorMessage = "Erro na transação. Verifique os dados e tente novamente.";
              break;
          }
        } else if (err.reason) {
          // Tratar razões específicas do contrato
          if (err.reason.includes("Ingresso não pertence ao usuário")) {
            errorMessage = "Você não é o proprietário deste ingresso.";
          } else if (err.reason.includes("Token ID inválido")) {
            errorMessage = "ID do ingresso inválido.";
          } else if (err.reason.includes("Ingresso já vendido")) {
            errorMessage = "Este ingresso já foi vendido e não pode ser revendido.";
          } else {
            errorMessage = "Falha ao colocar ingresso em revenda. Verifique se você é o proprietário.";
          }
        } else if (err.message) {
          // Tratamento de mensagens de erro específicas do contrato
          if (err.message.includes("reverted")) {
            // Verificar se é um erro de ingresso não existente ou não pertencente
            if (err.message.includes("Ingresso inexistente")) {
              errorMessage = "O ingresso com este ID não existe.";
            } else if (err.message.includes("Nao eh dono")) {
              errorMessage = "Você não é o proprietário deste ingresso.";
            } else if (err.message.includes("ingresso não existe")) {
              errorMessage = "O ingresso com este ID não existe.";
            } else if (err.message.includes("ingresso não pertence")) {
              errorMessage = "Você não é o proprietário deste ingresso.";
            } else {
              errorMessage = "Operação não permitida. Verifique se você é o proprietário do ingresso.";
            }
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Saldo insuficiente para completar a operação.";
          } else if (err.message.includes("ingresso não existe")) {
            errorMessage = "O ingresso com este ID não existe.";
          } else if (err.message.includes("ingresso não pertence")) {
            errorMessage = "Você não é o proprietário deste ingresso.";
          } else if (typeof err === 'string' && err.includes("já está em revenda")) {
            errorMessage = "Este ingresso já está em revenda. A operação atualiza o preço de revenda.";
          } else {
            errorMessage = "Ocorreu um problema ao colocar o ingresso em revenda.";
          }
        } else if (typeof err === 'string') {
          errorMessage = `Erro na revenda: ${err}`;
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
        setPendingResell(null);
      }
    }
  }

  return (
    <>
      <Card bg={useColorModeValue("white", "gray.700")} boxShadow="lg" rounded="xl">
        <CardHeader pb={2}>
          <Heading as="h2" size="md" display="flex" alignItems="center" gap={2}>
            <Icon as={FaRegMoneyBillAlt} color="yellow.500" />
            Revender Ingresso
          </Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleResell}>
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
              <FormControl isRequired>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaMoneyBillWave} color="brand.500" />
                  Novo Preço (ETH)
                </FormLabel>
                <Input
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(e.target.value)}
                  placeholder="0.01"
                  type="number"
                  step="0.0001"
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

              <Button
                type="submit"
                bg="yellow.500"
                color="white"
                _hover={{ bg: "yellow.600" }}
                isLoading={isLoading && pendingResell === null}  // Não mostrar loading quando o modal estiver aberto
                loadingText="Processando..."
                isDisabled={!tokenId || !novoPreco}
                size="lg"
                mt={2}
              >
                Colocar em Revenda
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Modal de confirmação para ingressos já em revenda */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Atualização de Preço</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Este ingresso já está em revenda. Deseja atualizar o preço de revenda?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="yellow" onClick={confirmResell}>Atualizar Preço</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
