import React, { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedEvents from "@/components/FeaturedEvents";
import BlockchainFeatures from "@/components/BlockchainFeatures";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { mockEvents, getEventsByCategory } from "@/data/mockEvents";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = getEventsByCategory(selectedCategory).filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedEvents />
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
            
            <div className="flex flex-col sm:flex-row gap-3 lg:w-96">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum evento encontrado para os critérios selecionados.
              </p>
            </div>
          )}
          
          {filteredEvents.length > 0 && (
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
