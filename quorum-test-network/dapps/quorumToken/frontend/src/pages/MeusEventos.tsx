import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { Ticket } from "../utils/api";
import { toast } from "../components/ui/sonner";

const MeusEventos = () => {
  const { isConnected, account, getTicketsByOwner, loading, error } = useTicketNFT();
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (isConnected && account) {
      fetchUserTickets();
    }
  }, [isConnected, account]);

  const fetchUserTickets = async () => {
    try {
      if (account) {
        const tickets = await getTicketsByOwner(account);
        setUserTickets(tickets);
      }
    } catch (err) {
      console.error("Erro ao buscar ingressos do usuário:", err);
      toast.error("Erro ao buscar seus eventos");
    }
  };

  // Mapear status para categorias
  const statusToCategory: Record<number, string> = {
    0: "Disponível",
    1: "Vendido",
    2: "Revenda"
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Meus Eventos</h1>
            <p className="text-muted-foreground">Gerencie os eventos que você criou ou comprou ingressos</p>
          </div>

          {isConnected ? (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <p>Carregando seus eventos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2 text-red-600">Erro</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                </div>
              ) : userTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userTickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardHeader>
                        <CardTitle>{ticket.evento || `Ingresso #${ticket.id}`}</CardTitle>
                        <CardDescription>
                          {ticket.dataEvento
                            ? new Date(ticket.dataEvento * 1000).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : "Data não definida"}
                          {ticket.owner ? ` - ${ticket.owner.substring(0, 6)}...${ticket.owner.substring(ticket.owner.length - 4)}` : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Categoria: {statusToCategory[ticket.status as number] || "Disponível"}</p>
                        <p>
                          Preço: {ticket.preco
                            ? `${(Number(ticket.preco) / 1e18).toFixed(4)} ETH`
                            : "Preço não definido"}
                        </p>
                        <Button className="mt-4 w-full" onClick={() => window.location.href = `/evento/${ticket.id}`}>Ver Detalhes</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-muted-foreground">Você ainda não tem ingressos para eventos.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Conecte sua carteira</h3>
              <p className="text-muted-foreground mb-4">Para ver seus eventos, conecte sua carteira primeiro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeusEventos;