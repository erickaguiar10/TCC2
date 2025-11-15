// frontend/src/pages/_app.tsx

import "/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ChakraProvider, Box, Flex, Heading, Text, Button, useColorMode, useColorModeValue } from "@chakra-ui/react";

function MyApp({ Component, pageProps }: AppProps) {
  const [account, setAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    async function checkConnection() {
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
    setAccount("");
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
        <Flex as="header" bg="white" boxShadow="sm" py={4} px={6} justify="space-between" align="center">
          <Heading as="h2" size="lg" fontWeight="600">Ticket Main</Heading>
          <Box>
            {account ? (
              <Flex align="center" gap={3}>
                <Text bg="green.100" px={3} py={1} borderRadius="md" fontSize="sm">
                  Conectado: {account.slice(0, 6)}...{account.slice(-4)}
                </Text>
                <Button onClick={disconnectWallet} variant="outline" size="sm">
                  Desconectar
                </Button>
              </Flex>
            ) : (
              <Button 
                onClick={connectWallet} 
                isLoading={isConnecting}
                bg="blue.500" 
                color="white" 
                _hover={{ bg: "blue.600" }}
                size="sm"
              >
                {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
              </Button>
            )}
          </Box>
        </Flex>
        <Box as="main" py={8} px={4}>
          <Component {...pageProps} />
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default MyApp;
