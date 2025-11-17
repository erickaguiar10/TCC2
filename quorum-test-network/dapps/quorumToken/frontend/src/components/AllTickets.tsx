import React from "react";
import { useTicketContext } from "../contexts/TicketContext";
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Flex,
  Spacer,
  Badge,
  Tag,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
  VStack
} from "@chakra-ui/react";
import { FaTicketAlt, FaUser } from 'react-icons/fa';

export const AllTickets = () => {
  const { allTickets } = useTicketContext();

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow="lg" rounded="xl">
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <Heading as="h2" size="md" display="flex" alignItems="center" gap={2}>
            <Icon as={FaTicketAlt} color="brand.500" />
            Todos os Ingressos
          </Heading>
        </Flex>
      </CardHeader>
      <CardBody>
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
          <List spacing={4}>
            {allTickets.length > 0 ? (
              allTickets.map((ticket) => (
                <ListItem key={ticket.id} p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: useColorModeValue("gray.50", "gray.600") }} transition="all 0.2s">
                  <Flex align="center">
                    <VStack align="start" spacing={1} flex="1">
                      <Flex align="center" mb={1}>
                        <Text fontWeight="bold" fontSize="md" color={useColorModeValue("gray.800", "white")}>{ticket.evento}</Text>
                        <Tag size="sm" colorScheme="brand" variant="outline" ml={3}>
                          ID: {ticket.id}
                        </Tag>
                      </Flex>
                      <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
                        Data: {ticket.data}
                      </Text>
                      <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
                        Preço: {ticket.preco} ETH
                      </Text>
                      <Flex align="center" gap={1} mt={1}>
                        <Icon as={FaUser} color={useColorModeValue("gray.500", "gray.400")} w={3} h={3} />
                        <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                          {ticket.dono.slice(0, 6)}...{ticket.dono.slice(-4)}
                        </Text>
                      </Flex>
                    </VStack>
                    <Badge
                      colorScheme={
                        ticket.status === "Disponível" ? "green" :
                        ticket.status === "Vendido" ? "red" : "yellow"
                      }
                      ml={2}
                      px={3}
                      py={1}
                      rounded="full"
                    >
                      {ticket.status}
                    </Badge>
                  </Flex>
                </ListItem>
              ))
            ) : (
              <Text textAlign="center" py={4} color={useColorModeValue("gray.500", "gray.400")}>
                Nenhum ingresso cadastrado
              </Text>
            )}
          </List>
        </Box>
      </CardBody>
    </Card>
  );
};
