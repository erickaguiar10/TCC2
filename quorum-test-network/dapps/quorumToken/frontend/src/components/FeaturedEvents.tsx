import React from "react";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import EventCard from "./EventCard";
import { getFeaturedEvents } from "../data/mockEvents";

const FeaturedEvents = () => {
  const featuredEvents = getFeaturedEvents();

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
        
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