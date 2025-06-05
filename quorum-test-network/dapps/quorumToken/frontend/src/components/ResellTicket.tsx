// frontend/src/components/ResellTicket.tsx

import { useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { ethers } from "ethers";

export function ResellTicket() {
  const { contract } = useTicketNFT();

  // State para armazenar tokenId e novo preco digitados
  const [tokenId, setTokenId] = useState("");
  const [novoPreco, setNovoPreco] = useState("");

  // Função executada ao submeter o formulário
  async function handleResell(e: React.FormEvent) {
    e.preventDefault();
    if (contract) {
      try {
        // Chama revenderIngresso(tokenId, novoPrecoEmWei)
        const tx = await contract.revenderIngresso(
          Number(tokenId),
          ethers.parseEther(novoPreco || "0")
        );
        await tx.wait();
        alert("Ingresso colocado em revenda com sucesso!");
      } catch (err) {
        console.error("Erro ao colocar em revenda:", err);
        alert("Erro ao colocar ingresso em revenda.");
      }
    }
  }

  return (
    <form onSubmit={handleResell} className="space-y-2 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Revender Ingresso</h2>

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

      <div>
        <label className="block">Novo Preço (ETH):</label>
        <input
          type="text"
          value={novoPreco}
          onChange={(e) => setNovoPreco(e.target.value)}
          className="border p-1 w-full"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-yellow-500 text-white px-4 py-2 rounded"
        disabled={!tokenId || !novoPreco}
      >
        Colocar em Revenda
      </button>
    </form>
  );
}
