import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Upload, Calendar, MapPin, DollarSign } from "lucide-react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { toast } from "./ui/sonner";

interface EventFormProps {
  onSubmit: (eventData: {
    title: string;
    description: string;
    date: string;
    location: string;
    price: string;
    imageFile: File | null;
  }) => void;
  onCancel: () => void;
}

const EventForm = ({ onSubmit, onCancel }: EventFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { createTicket } = useTicketNFT();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !date || !location.trim() || !price.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const priceInWei = parseFloat(price) * 1e18; // Convertendo para Wei
    const timestamp = Math.floor(new Date(date).getTime() / 1000); // Convertendo para timestamp Unix
    
    try {
      // Chamando a função de criação de ticket via hook
      await createTicket(title, Math.floor(priceInWei), timestamp);
      toast.success("Evento criado com sucesso!");
      
      // Enviando os dados para o onSubmit
      onSubmit({
        title,
        description,
        date,
        location,
        price,
        imageFile
      });
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      toast.error("Erro ao criar evento. Por favor, tente novamente.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">Criar Novo Evento</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="title">Título do Evento *</Label>
            <div className="relative">
              <Input
                id="title"
                placeholder="Nome do evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva seu evento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="date">Data e Hora *</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location">Localização *</Label>
              <div className="relative">
                <Input
                  id="location"
                  placeholder="Local do evento"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="price">Preço (BRL) *</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                placeholder="0,00"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-10"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="image">Imagem do Evento</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 hover:border-accent transition-colors">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Clique para fazer upload ou arraste um arquivo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 5MB</p>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="mt-4"
              >
                Selecionar Imagem
              </Button>
              
              {imagePreview && (
                <div className="mt-4 w-full max-w-xs">
                  <img 
                    src={imagePreview} 
                    alt="Pré-visualização da imagem do evento" 
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Criar Evento</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EventForm;