// frontend/src/components/BuyTicket.tsx

import { useState, useEffect } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { ethers } from "ethers";

export function BuyTicket() {
  const { contract } = useTicketNFT();

  const [tokenId, setTokenId] = useState("");
  const [preco, setPreco] = useState<bigint | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      if (contract && tokenId) {
        try {
          const ingresso = await contract.ingressos(Number(tokenId));
          setPreco(ingresso.preco as bigint);
        } catch (err) {
          console.error("Erro ao buscar preço:", err);
          setPreco(null);
        }
      }
    }
    fetchPrice();
  }, [contract, tokenId]);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (contract && preco !== null) {
      try {
        const tx = await contract.comprarIngresso(Number(tokenId), { value: preco });
        await tx.wait();
        alert("Ingresso comprado com sucesso!");
      } catch (err) {
        console.error("Erro ao comprar ingresso:", err);
        alert("Erro ao comprar ingresso.");
      }
    }
  }

  return (
    <form onSubmit={handleBuy} className="space-y-2 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Comprar Ingresso</h2>

      <div>
        <label className="block">Token ID:</label>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="border p-1 w-full"
          required
        />
      </div>

      {preco !== null && (
        <p>Preço atual: {ethers.formatEther(preco)} ETH</p>
      )}

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
        disabled={preco === null}
      >
        Comprar
      </button>
    </form>
  );
}
