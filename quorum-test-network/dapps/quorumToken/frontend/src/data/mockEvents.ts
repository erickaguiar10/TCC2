import concertImage from "../assets/event-concert.jpg";
import sportsImage from "../assets/event-sports.jpg";
import theaterImage from "../assets/event-theater.jpg";

import type { StaticImageData } from "next/image";

export interface EventCardProps {
  id: string;
  title: string;
  image: string | StaticImageData;
  date: string;
  location: string;
  price: string;
  category: string;
  ticketsLeft?: number;
  description?: string;
  featured?: boolean;
}
export const mockEvents: EventCardProps[] = [
  {
    id: "1",
    title: "Rock in Rio 2024 - Palco Mundo",
    image: concertImage,
    date: "15 de Dezembro, 2024",
    location: "Cidade do Rock, Rio de Janeiro",
    price: "R$ 180,00",
    category: "Música",
    ticketsLeft: 25,
    featured: true,
    description: "O maior festival de rock do mundo retorna com uma lineup incrível!"
  },
  {
    id: "2",
    title: "Brasileirão 2024 - Flamengo vs Corinthians",
    image: sportsImage,
    date: "22 de Dezembro, 2024",
    location: "Maracanã, Rio de Janeiro",
    price: "R$ 85,00",
    category: "Esporte",
    ticketsLeft: 120,
    featured: true,
    description: "Clássico nacional no templo do futebol brasileiro."
  },
  {
    id: "3",
    title: "O Rei Leão - Musical da Broadway",
    image: theaterImage,
    date: "10 de Janeiro, 2025",
    location: "Teatro Renault, São Paulo",
    price: "R$ 250,00",
    category: "Teatro",
    ticketsLeft: 45,
    description: "A emocionante adaptação teatral do clássico da Disney."
  },
  {
    id: "4",
    title: "Festival de Inverno de Bonito",
    image: concertImage,
    date: "28 de Julho, 2025",
    location: "Bonito, Mato Grosso do Sul",
    price: "R$ 120,00",
    category: "Música",
    ticketsLeft: 200,
    description: "Música ao vivo em um dos destinos mais belos do Brasil."
  },
  {
    id: "5",
    title: "Formula 1 - GP do Brasil",
    image: sportsImage,
    date: "12 de Novembro, 2024",
    location: "Autódromo de Interlagos, São Paulo",
    price: "R$ 450,00",
    category: "Esporte",
    ticketsLeft: 15,
    featured: true,
    description: "A emoção da Fórmula 1 no circuito de Interlagos."
  },
  {
    id: "6",
    title: "Stand-up Comedy - Whindersson Nunes",
    image: theaterImage,
    date: "05 de Dezembro, 2024",
    location: "Arena Castelão, Fortaleza",
    price: "R$ 95,00",
    category: "Comédia",
    ticketsLeft: 80,
    description: "O humorista mais famoso do Brasil em seu novo show."
  }
];

export const categories = [
  "Todos",
  "Música", 
  "Esporte",
  "Teatro",
  "Comédia",
  "Festival",
  "Cultura"
];

export const getFeaturedEvents = () => mockEvents.filter(event => event.featured);
export const getEventsByCategory = (category: string) => 
  category === "Todos" ? mockEvents : mockEvents.filter(event => event.category === category);