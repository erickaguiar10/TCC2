// frontend/src/pages/index.tsx

import type { NextPage } from "next";
import { CreateTicket } from "../components/CreateTicket";
import { BuyTicket } from "../components/BuyTicket";
import { ResellTicket } from "../components/ResellTicket";
import { MyTickets } from "components/MyTickets";
import { AllTickets } from "components/AllTickets";
import { Container, Heading, SimpleGrid } from "@chakra-ui/react";

const Home: NextPage = () => {
  return (
    <Container maxW="container.xl" p={4}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">Ticket Main</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <MyTickets />
        <AllTickets/>
        <CreateTicket />
        <BuyTicket />
        <ResellTicket />
      </SimpleGrid>
    </Container>
  );
};

export default Home;
