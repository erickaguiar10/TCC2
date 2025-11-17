// frontend/src/pages/index.tsx

import type { NextPage } from "next";
import { CreateTicket } from "../components/CreateTicket";
import { BuyTicket } from "../components/BuyTicket";
import { ResellTicket } from "../components/ResellTicket";
import { MyTickets } from "components/MyTickets";
import { AllTickets } from "components/AllTickets";
import { Container, Heading, SimpleGrid, Text, VStack, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaTheaterMasks, FaShoppingCart, FaTag, FaTicketAlt, FaListUl } from 'react-icons/fa';

const Home: NextPage = () => {
  return (
    <Container maxW="container.xl" p={4}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={4} textAlign="center">
          <Icon as={FaTheaterMasks} w={16} h={16} color="brand.500" />
          <Heading as="h1" size="2xl" bgGradient="linear(to-r, brand.400, brand.600)" bgClip="text">
            Ticket Main
          </Heading>
          <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.300")}>
            Plataforma descentralizada para compra e venda de ingressos
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <MyTickets />
          <AllTickets/>
          <CreateTicket />
          <BuyTicket />
          <ResellTicket />
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Home;
