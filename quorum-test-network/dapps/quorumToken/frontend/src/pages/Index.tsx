import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import BlockchainFeatures from "@/components/BlockchainFeatures";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { Ticket } from "../utils/api";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { getTickets, error } = useTicketNFT();

  // Mapear status para categorias
  const statusToCategory: Record<number, string> = {
    0: "Disponível",
    1: "Vendido",
    2: "Revenda"
  };

  // Categorias de eventos
  const categories = [
    "Todos",
    "Disponível",
    "Vendido",
    "Revenda"
  ];

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const tickets = await getTickets(0, 100); // Pegar os primeiros 100 tickets
      setAllTickets(tickets);
    } catch (err) {
      console.error("Erro ao buscar ingressos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tickets
  const filteredTickets = allTickets.filter(ticket => {
    const matchesSearch =
      (ticket.evento && ticket.evento.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.owner && ticket.owner.toLowerCase().includes(searchTerm.toLowerCase()));

    const ticketCategory = statusToCategory[ticket.status as number] || "Disponível";
    const matchesCategory =
      selectedCategory === "Todos" || ticketCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <BlockchainFeatures />

      {/* All Events Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <h2 className="font-display font-bold text-3xl text-foreground mb-4">
                Todos os Eventos
              </h2>
              <p className="text-muted-foreground">
                Descubra experiências únicas com a garantia da tecnologia blockchain
              </p>
            </div>



          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
              Erro: {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p>Carregando eventos...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum evento encontrado para os critérios selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map((ticket) => (
                <EventCard
                  key={ticket.id}
                  id={ticket.id.toString()}
                  title={ticket.evento || `Ingresso #${ticket.id}`}
                  date={ticket.dataEvento
                    ? new Date(ticket.dataEvento * 1000).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    : "Data não definida"}
                  location={ticket.evento ? `${ticket.evento.split(' ')[0]} Arena` : "Local não definido"}
                  price={ticket.preco
                    ? `${(Number(ticket.preco) / 1e18).toFixed(4)} ETH`
                    : "Preço não definido"}
                  category={statusToCategory[ticket.status as number] || "Disponível"}
                />
              ))}
            </div>
          )}

          {filteredTickets.length > 0 && (
            <div className="text-center mt-10">
              <Button variant="outline" size="lg">
                Carregar Mais Eventos
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
