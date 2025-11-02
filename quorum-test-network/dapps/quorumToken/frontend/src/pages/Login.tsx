import { useTicketNFT } from "../hooks/useTicketNFT";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { ConnectWalletButton } from "../components/ConnectWalletButton";
import { Wallet } from "lucide-react";

const Login = () => {
  const { isConnected, account } = useTicketNFT();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Conectar Carteira</CardTitle>
          <CardDescription>
            Conecte sua carteira para acessar seus ingressos e participar de eventos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Wallet className="h-12 w-12 text-accent" />
            </div>
            
            <p className="text-center text-muted-foreground">
              Precisamos que você conecte sua carteira para autenticar sua identidade 
              e permitir que você compre, venda e utilize seus ingressos NFT.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <ConnectWalletButton />
          
          {isConnected && account && (
            <div className="mt-4 text-center">
              <p className="text-sm text-green-600">
                Carteira conectada com sucesso!
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {account}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.href = '/'}
              >
                Ir para Início
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;