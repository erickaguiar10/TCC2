import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MeusEventos from "./pages/MeusEventos";
import CriarEvento from "./pages/CriarEvento";
import EventDetails from "./pages/EventDetails";
import Header from "./components/Header";
import { useTicketNFT } from "./hooks/useTicketNFT";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { account, getOwner } = useTicketNFT();
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [canCreateEvent, setCanCreateEvent] = useState(false);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const owner = await getOwner();
        setOwnerAddress(owner);
        // Permissão para criar eventos é dada apenas ao proprietário do contrato
        setCanCreateEvent(account?.toLowerCase() === owner.toLowerCase());
      } catch (error) {
        console.error("Erro ao obter proprietário do contrato:", error);
        setCanCreateEvent(false);
      }
    };

    if (account) {
      fetchOwner();
    } else {
      setCanCreateEvent(false);
    }
  }, [account, getOwner]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Header canCreateEvent={canCreateEvent} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/eventos/:category" element={<Events />} />
            <Route path="/meus-eventos" element={<MeusEventos />} />
            <Route path="/criar-evento" element={<CriarEvento />} />
            <Route path="/evento/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
