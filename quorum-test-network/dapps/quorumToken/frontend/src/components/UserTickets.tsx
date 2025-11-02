import { useEffect, useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Ticket as TicketType } from "../utils/api";

interface UserTicketsProps {
  userAddress: string;
}

const UserTickets = ({ userAddress }: UserTicketsProps) => {
  const { getTicketsByOwner, loading, error } = useTicketNFT();
  const [tickets, setTickets] = useState<TicketType[]>([]);

  useEffect(() => {
    if (userAddress) {
      fetchUserTickets();
    }
  }, [userAddress]);

  const fetchUserTickets = async () => {
    try {
      const userTickets = await getTicketsByOwner(userAddress);
      setTickets(userTickets);
    } catch (err) {
      console.error("Erro ao buscar ingressos do usuário:", err);
    }
  };

  // Mapear status para texto
  const statusMap: Record<number, string> = {
    0: "Disponível",
    1: "Vendido",
    2: "Revenda"
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Meus Ingressos</h2>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Erro: {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p>Carregando ingressos...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum ingresso encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="group overflow-hidden shadow-card hover:shadow-blockchain transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {ticket.evento || `Ingresso #${ticket.id}`}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {statusMap[ticket.status as number] || "Desconhecido"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>
                      {ticket.dataEvento 
                        ? new Date(ticket.dataEvento * 1000).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : "Data não definida"}
                    </span>
                  </div>
                  
                  {ticket.preco && (
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-4 w-4 text-accent" />
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(ticket.preco) / 1e18)} {/* Convertendo de wei para ether */}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <span className="text-xs text-muted-foreground">ID: {ticket.id}</span>
                <Button size="sm" variant="outline">
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTickets;