import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Shield, Lock, Zap } from "lucide-react";
import heroBanner from "../assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          alt="TicketMain Hero"
          src={heroBanner}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-85"></div>
      </div>
      
      {/* Blockchain Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 144 }, (_, i) => (
            <div 
              key={i} 
              className="border border-white/20 animate-blockchain-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Ingressos na
            <span className="block bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
              Blockchain
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Segurança, transparência e autenticidade garantida para seus eventos favoritos.
          </p>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center space-x-2 text-white/80">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-medium">100% Seguro</span>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <Lock className="h-5 w-5 text-success" />
            <span className="font-medium">Prova de Autenticidade</span>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <Zap className="h-5 w-5 text-accent" />
            <span className="font-medium">Compra Garantida</span>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-gradient-accent hover:opacity-90 text-lg px-8 h-12"
            asChild
          >
            <a href="/eventos">Explorar Eventos</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;