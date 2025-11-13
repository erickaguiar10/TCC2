import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { TicketDetails } from "../utils/api";
import { toast } from "../components/ui/sonner";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getTicket, buyTicket, isConnected, account } = useTicketNFT();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketData = await getTicket(Number(id));
      setTicket(ticketData);
    } catch (error) {
      console.error("Erro ao obter detalhes do ingresso:", error);
      toast.error("Erro ao carregar os detalhes do evento");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = async () => {
    if (!ticket || !isConnected || !account) {
      toast.error("Conecte sua carteira primeiro");
      return;
    }

    if (ticket.status === 1) { // Status 1 = Vendido
      toast.error("Este ingresso já foi vendido");
      return;
    }

    setIsBuying(true);
    try {
      // O preço está em wei, então precisamos passar o valor exato do preço
      await buyTicket(ticket.id, Number(ticket.preco));
      toast.success("Ingresso comprado com sucesso!");
      // Atualizar os detalhes após a compra
      fetchTicketDetails();
    } catch (error) {
      console.error("Erro ao comprar ingresso:", error);
      toast.error("Erro ao comprar ingresso. Verifique o saldo e tente novamente.");
    } finally {
      setIsBuying(false);
    }
  };

  // Mapear status para texto
  const statusText = {
    0: "Disponível",
    1: "Vendido", 
    2: "Revenda"
  }[ticket?.status || 0];

  const statusColor = {
    0: "text-green-600 bg-green-100",
    1: "text-red-600 bg-red-100", 
    2: "text-yellow-600 bg-yellow-100"
  }[ticket?.status || 0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando detalhes do evento...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Evento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Imagem do evento */}
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <img 
            src={ticket.imagem || `https://placehold.co/800x400?text=${encodeURIComponent(ticket.evento)}`}
            alt={ticket.evento}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações principais do evento */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-3xl">{ticket.evento}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {ticket.dataEvento 
                      ? new Date(ticket.dataEvento * 1000).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : "Data não definida"}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{ticket.evento ? `${ticket.evento.split(' ')[0]} Arena` : "Local não definido"}</span>
                </div>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>Proprietário: {ticket.owner?.substring(0, 6)}...{ticket.owner?.substring(ticket.owner.length - 4)}</span>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground">
                    Bem-vindo ao {ticket.evento}! Um evento imperdível com as melhores atrações e experiências únicas. 
                    Não perca essa oportunidade de participar deste grande evento.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de compra */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">Detalhes do Ingresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Preço</span>
                  <span className="text-2xl font-bold text-accent">
                    {(Number(ticket.preco) / 1e18).toFixed(4)} ETH
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
                    {statusText}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ID do Ingresso</span>
                  <span className="font-mono text-sm">#{ticket.id}</span>
                </div>

                {ticket.status === 0 && isConnected && account && (
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-accent hover:opacity-90 transition-opacity"
                    onClick={handleBuyTicket}
                    disabled={isBuying}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    {isBuying ? "Processando..." : "Comprar Ingresso"}
                  </Button>
                )}

                {ticket.status === 1 && (
                  <Button size="lg" className="w-full" variant="outline" disabled>
                    Esgotado
                  </Button>
                )}

                {ticket.status === 2 && (
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-accent hover:opacity-90 transition-opacity"
                    onClick={handleBuyTicket}
                    disabled={isBuying}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    {isBuying ? "Processando..." : "Comprar da Revenda"}
                  </Button>
                )}

                {!isConnected && (
                  <Button size="lg" className="w-full" variant="outline" disabled>
                    Conecte sua carteira
                  </Button>
                )}

                {isConnected && ticket.status !== 0 && ticket.status !== 2 && (
                  <p className="text-center text-muted-foreground text-sm">
                    Este ingresso não está disponível para compra
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;