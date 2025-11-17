// frontend/src/pages/_app.tsx

import "/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ChakraProvider, Box, Flex, Heading, Text, Button, useColorMode, useColorModeValue, Container, Icon, useColorModeValue as mode } from "@chakra-ui/react";
import { FaWallet, FaSignOutAlt, FaTicketAlt } from 'react-icons/fa';
import theme from '../theme';
import { TicketProvider } from '../contexts/TicketContext';

function MyApp({ Component, pageProps }: AppProps) {
  const [account, setAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    async function checkConnection() {
      // Verifica se é uma recarga após desconexão
      const wasDisconnected = sessionStorage.getItem('wasDisconnected');
      if (wasDisconnected === 'true') {
        sessionStorage.removeItem('wasDisconnected');
        return; // Não reconecta automaticamente após desconexão
      }

      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        // Verifica se já há contas conectadas (permite login persistente)
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    }
    checkConnection();
  }, []);

  // Função para solicitar conexão quando clicar no botão
  async function connectWallet() {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        setAccount(addr);

        // Remove a flag de desconexão caso exista
        sessionStorage.removeItem('wasDisconnected');

        // Recarrega a página após conectar
        window.location.reload();
      } catch (err) {
        console.error("Usuário negou a conexão", err);
        alert("Erro ao conectar carteira. Verifique o console para detalhes.");
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask não encontrado. Por favor, instale a extensão.");
    }
  }

  const disconnectWallet = () => {
    if (window.ethereum) {
      // Define uma flag para indicar que foi desconectado
      sessionStorage.setItem('wasDisconnected', 'true');

      // Limpa a conta local
      setAccount("");

      // Recarrega a página após desconectar
      window.location.reload();
    } else {
      // Define uma flag para indicar que foi desconectado
      sessionStorage.setItem('wasDisconnected', 'true');

      setAccount("");
      window.location.reload();
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <TicketProvider>
        <Box minH="100vh" bg={mode("gray.50", "gray.900")}>
          <Flex
            as="header"
            bg={mode("white", "gray.800")}
            boxShadow="sm"
            py={4}
            px={6}
            justify="space-between"
            align="center"
            borderBottomWidth="1px"
            borderColor={mode("gray.200", "gray.700")}
          >
            <Flex align="center" gap={3}>
              <Icon as={FaTicketAlt} w={8} h={8} color="brand.500" />
              <Heading as="h1" size="lg" fontWeight="600" color={mode("gray.800", "white")}>Ticket Main</Heading>
            </Flex>
            <Box>
              {account ? (
                <Flex align="center" gap={3}>
                  <Flex align="center" bg={mode("green.100", "green.900")} px={4} py={2} borderRadius="md" gap={2}>
                    <Icon as={FaWallet} w={4} h={4} color="green.500" />
                    <Text fontSize="sm" fontWeight="medium" color={mode("green.700", "green.200")}>
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </Text>
                  </Flex>
                  <Button
                    onClick={disconnectWallet}
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon as={FaSignOutAlt} />}
                    colorScheme="red"
                  >
                    Desconectar
                  </Button>
                </Flex>
              ) : (
                <Button
                  onClick={connectWallet}
                  isLoading={isConnecting}
                  bg="brand.500"
                  color="white"
                  _hover={{ bg: "brand.600" }}
                  size="sm"
                  leftIcon={<Icon as={FaWallet} />}
                >
                  {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
                </Button>
              )}
            </Box>
          </Flex>
          <Box as="main" py={8} px={4}>
            <Container maxW="container.xl">
              <Component {...pageProps} />
            </Container>
          </Box>
        </Box>
      </TicketProvider>
    </ChakraProvider>
  );
}

export default MyApp;
