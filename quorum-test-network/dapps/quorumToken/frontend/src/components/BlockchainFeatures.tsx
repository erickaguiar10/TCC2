import React from "react";
import { Shield, Lock, Zap, Eye, CheckCircle, Globe } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Segurança",
    description: "Seus ingressos são protegidos por criptografia e tecnologia blockchain."
  },
  {
    icon: Lock,
    title: "Prova de Autenticidade",
    description: "Cada ingresso possui uma assinatura digital única e imutável"
  },
  {
    icon: Eye,
    title: "Transparência",
    description: "Permite acompanhar todo o ciclo de vida do ingresso, desde sua emissão até a utilização, por meio dos dados públicos das transações registradas na blockchain."
  },
  {
    icon: Zap,
    title: "Transações",
    description: "Compras e transferências realizadas de forma ágil, com registro público das transações."
  },
  {
    icon: CheckCircle,
    title: "Verificação",
    description: "Processo de verificação simples, com autenticidade garantida pela blockchain."
  },
  {
    icon: Globe,
    title: "Acesso Global",
    description: "Sua carteira digital funciona em qualquer lugar do mundo, sem fronteiras."
  }
];

const BlockchainFeatures = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Por que Escolher a <span className="text-accent">Blockchain</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Revolucionamos a experiência de compra de ingressos com tecnologia de ponta, 
            com segurança, transparência e confiança em cada transação.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-blockchain transition-all duration-300 border-border/50 hover:border-accent/30"
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-accent group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlockchainFeatures;