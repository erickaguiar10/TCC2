import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { toast } from "../components/ui/sonner";
import { Upload, X } from "lucide-react";

const CriarEvento = () => {
  const [nomeEvento, setNomeEvento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [localEvento, setLocalEvento] = useState("");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  
  const { isConnected, createTicket } = useTicketNFT();
  
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removerImagem = () => {
    setImagem(null);
    setImagemPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Converte o preço para Wei (usando 18 decimais como padrão do Ethereum)
      const priceInWei = parseFloat(preco) * 1e18;

      // Converte a data para timestamp Unix (em segundos)
      const timestamp = Math.floor(new Date(dataEvento).getTime() / 1000);

      let imageUrl = undefined;
      if (imagem) {
        // Em uma implementação completa, faríamos upload real da imagem
        // Por enquanto, vamos usar uma URL de placeholder ou a imagem como base64
        // O endpoint de upload de imagem não está integrado ao endpoint de criação de ingressos
        // então vamos usar um placeholder por enquanto
        imageUrl = imagemPreview || undefined;
      }

      // Chama a função real para criar o evento via API
      await createTicket(nomeEvento, Math.floor(priceInWei), timestamp, imageUrl);

      toast.success("Evento criado com sucesso!");

      // Limpa o formulário após a criação bem-sucedida
      setNomeEvento("");
      setDescricao("");
      setDataEvento("");
      setLocalEvento("");
      setPreco("");
      setImagem(null);
      setImagemPreview(null);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      toast.error("Erro ao criar evento. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Evento</CardTitle>
              <CardDescription>Preencha os detalhes do seu novo evento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Evento</Label>
                  <Input 
                    id="nome" 
                    placeholder="Digite o nome do evento" 
                    value={nomeEvento}
                    onChange={(e) => setNomeEvento(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea 
                    id="descricao" 
                    placeholder="Descreva o evento"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data do Evento</Label>
                    <Input 
                      id="data" 
                      type="datetime-local" 
                      value={dataEvento}
                      onChange={(e) => setDataEvento(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="local">Local do Evento</Label>
                    <Input 
                      id="local" 
                      placeholder="Localização do evento" 
                      value={localEvento}
                      onChange={(e) => setLocalEvento(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (ETH)</Label>
                  <Input 
                    id="preco" 
                    type="number" 
                    step="0.001"
                    placeholder="Preço do ingresso em ETH" 
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    required 
                  />
                </div>
                
                {/* Campo de upload de imagem */}
                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem do Evento</Label>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <label 
                        htmlFor="imagem-upload" 
                        className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Clique para fazer upload de uma imagem
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF até 5MB
                        </p>
                        <Input 
                          id="imagem-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImagemChange}
                        />
                      </label>
                    </div>
                    
                    {imagemPreview && (
                      <div className="relative mt-2">
                        <img 
                          src={imagemPreview} 
                          alt="Pré-visualização" 
                          className="max-h-48 rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removerImagem}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button type="submit" variant="hero" className="w-full" disabled={!isConnected}>
                  {isConnected ? "Criar Evento" : "Conecte sua carteira primeiro"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CriarEvento;