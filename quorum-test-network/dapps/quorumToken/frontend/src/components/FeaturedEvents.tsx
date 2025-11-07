import React from "react";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import EventCard from "./EventCard";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { useEffect, useState } from "react";

const FeaturedEvents = () => {
  const { getTickets, loading, error } = useTicketNFT();
  const [featuredTickets, setFeaturedTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedTickets();
  }, []);

  const fetchFeaturedTickets = async () => {
    try {
      const tickets = await getTickets(0, 6); // Pegar os 6 primeiros tickets como featured
      // Filtrar tickets disponiveis para serem destaque
      const availableTickets = tickets.filter(ticket => ticket.status === 0 || ticket.status === 2);
      setFeaturedTickets(availableTickets.slice(0, 3)); // Pegar os 3 primeiros como destaque
    } catch (err) {
      console.error("Erro ao buscar ingressos em destaque:", err);
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-6 w-6 text-accent animate-glow" />
              <h2 className="font-display font-bold text-3xl text-foreground">
                Eventos em Destaque
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Os eventos mais aguardados, com autenticidade garantida pela blockchain
            </p>
          </div>
          
          <div className="hidden md:flex space-x-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Carregando eventos em destaque...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p>Erro ao carregar eventos: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTickets.map((ticket) => (
              <EventCard 
                key={ticket.id}
                id={ticket.id.toString()}
                title={ticket.evento || `Ingresso #${ticket.id}`}
                image={ticket.evento ? `https://placehold.co/400x200?text=${encodeURIComponent(ticket.evento)}` : "https://placehold.co/400x200?text=Evento"}
                date={ticket.dataEvento 
                  ? new Date(ticket.dataEvento * 1000).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : "Data não definida"}
                location={ticket.owner || "Local não definido"}
                price={ticket.preco 
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(ticket.preco) / 1e18)
                  : "Preço não definido"}
                category={ticket.status === 0 ? "Disponível" : "Revenda"}
              />
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Button variant="hero" size="lg" className="px-8">
            Ver Todos os Eventos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;