import { useTicketNFT } from "../hooks/useTicketNFT";
import { Button } from "../components/ui/button";
import { Wallet } from "lucide-react";

interface ConnectWalletButtonProps {
  onConnect?: () => void;
}

export const ConnectWalletButton = ({ onConnect }: ConnectWalletButtonProps) => {
  const { 
    isConnected, 
    account, 
    loading, 
    connectWallet,
    disconnectWallet,
    getOwner 
  } = useTicketNFT();

  // Função para formatar o endereço da carteira
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      if (onConnect) {
        onConnect();
      }
    } catch (error) {
      console.error("Erro ao conectar carteira:", error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <div className="hidden sm:block text-sm font-medium">
            {formatAddress(account || "")}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDisconnect}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Desconectar
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleConnect}
          disabled={loading}
          size="sm"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {loading ? "Conectando..." : "Conectar Carteira"}
        </Button>
      )}
    </div>
  );
};