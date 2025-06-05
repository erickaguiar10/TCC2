// frontend/src/pages/_app.tsx

import "/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

function MyApp({ Component, pageProps }: AppProps) {
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    async function checkConnection() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        // Verifica se já há contas conectadas (permite login persistente)
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    }
    checkConnection();
  }, []);

  // Função para solicitar conexão quando clicar no botão
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        setAccount(addr);
      } catch (err) {
        console.error("Usuário negou a conexão", err);
      }
    } else {
      alert("MetaMask não encontrado.");
    }
  }

  return (
    <>
      <header className="bg-gray-100 py-2 px-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">TicketNFT DApp</h2>
        <div>
          {account ? (
            <span className="bg-green-200 px-2 py-1 rounded">
              Conectado: {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Conectar MetaMask
            </button>
          )}
        </div>
      </header>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
