import { Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  category: string;
  ticketsLeft?: number;
}

const EventCard = ({ id, title, date, location, price, category, ticketsLeft }: EventCardProps) => {
  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-blockchain transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            {category}
          </Badge>
        </div>
        {ticketsLeft && ticketsLeft < 50 && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive" className="animate-blockchain-pulse">
              Últimos {ticketsLeft}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">A partir de</span>
          <span className="font-display font-bold text-xl text-accent">
            {price}
          </span>
        </div>

        <Link to={`/evento/${id}`}>
          <Button
            size="sm"
            className="bg-gradient-accent hover:opacity-90 transition-opacity"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;