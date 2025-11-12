#!/bin/bash
# Script para reiniciar o ambiente completo (em Windows com WSL ou powershell)

echo "Reiniciando ambiente completo..."

# 1. Primeiro, implantar contrato com Hardhat padrão (que sabemos que funciona)
echo "Implantando contrato..."
npx hardhat run scripts/deploy.js

# 2. Copiar ABI atualizado para backend e frontend
echo "Atualizando ABI..."
copy artifacts\contracts\TicketNFT.sol\TicketNFT.json backend\TicketNFT.json
copy artifacts\contracts\TicketNFT.sol\TicketNFT.json src\abis\TicketNFT.json

# 3. Iniciar Hardhat node em um novo terminal
echo "Iniciando Hardhat node..."
start /b cmd /c "npx hardhat node --hostname 0.0.0.0"

# 4. Aguardar 10 segundos
timeout 10

# 5. Iniciar backend em novo terminal
echo "Iniciando backend..."
start /b cmd /c "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

# 6. Aguardar 5 segundos
timeout 5

# 7. Iniciar proxy em novo terminal
echo "Iniciando proxy..."
start /b cmd /c "node proxy.js"

echo "Ambiente pronto! Agora inicie o frontend com 'npm run dev' em outro terminal."