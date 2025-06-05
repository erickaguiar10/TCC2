// frontend/src/components/CreateTicket.tsx

import { useState } from "react";
import { useTicketNFT } from "../hooks/useTicketNFT";
import { ethers } from "ethers";

export function CreateTicket() {
  const { contract, account } = useTicketNFT();
  const [evento, setEvento] = useState("");
  const [preco, setPreco] = useState("");
  const [dataEvento, setDataEvento] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contract && account) {
      try {
        const tx = await contract.criarIngresso(
          evento,
          ethers.parseEther(preco || "0"),
          Math.floor(new Date(dataEvento).getTime() / 1000)
        );
        await tx.wait();
        alert("Ingresso criado com sucesso!");
      } catch (err) {
        console.error("Erro ao criar ingresso:", err);
        alert("Erro ao criar ingresso. Veja o console para detalhes.");
      }
    } else {
      alert("Contrato ou conta não disponíveis. Verifique se MetaMask está conectado.");
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-2 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Criar Novo Ingresso</h2>
      <div>
        <label className="block">Evento:</label>
        <input
          type="text"
          value={evento}
          onChange={(e) => setEvento(e.target.value)}
          className="border p-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block">Preço (em ETH):</label>
        <input
          type="text"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="border p-1 w-full"
          placeholder="Ex: 0.01"
          required
        />
      </div>
      <div>
        <label className="block">Data do Evento:</label>
        <input
          type="date"
          value={dataEvento}
          onChange={(e) => setDataEvento(e.target.value)}
          className="border p-1 w-full"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={!account || !contract}
      >
        Criar Ingresso
      </button>
    </form>
  );
}
