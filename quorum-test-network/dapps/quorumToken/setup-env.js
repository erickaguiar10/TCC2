// Script para configurar todo o ambiente corretamente
const { exec, execSync } = require('child_process');
const fs = require('fs');

console.log('Configurando ambiente completo...');

// 1. Implantar contrato no Hardhat padrão
console.log('1. Implantando contrato...');
execSync('npx hardhat run scripts/deploy.js', { stdio: 'inherit' });

// 2. Copiar ABI para o backend
console.log('2. Atualizando ABI no backend...');
execSync('copy artifacts\\contracts\\TicketNFT.sol\\TicketNFT.json backend\\TicketNFT.json', { stdio: 'inherit' });

// 3. Atualizar o endereço do contrato no .env do frontend
console.log('3. Atualizando .env do frontend...');
const envContent = fs.readFileSync('.env', 'utf8');
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
let newEnvContent = envContent;
if (newEnvContent.includes('CONTRACT_ADDRESS=')) {
    newEnvContent = newEnvContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
} else {
    newEnvContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
}
fs.writeFileSync('.env', newEnvContent);

// 4. Atualizar o endereço do contrato no .env do backend
console.log('4. Atualizando .env do backend...');
const backendEnvPath = 'backend/.env';
if (fs.existsSync(backendEnvPath)) {
    let backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
    if (backendEnvContent.includes('CONTRACT_ADDRESS=')) {
        backendEnvContent = backendEnvContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
        backendEnvContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }
    fs.writeFileSync(backendEnvPath, backendEnvContent);
}

console.log('✓ Ambiente configurado com sucesso!');
console.log('Agora inicie os serviços na seguinte ordem:');
console.log('1. Nó Hardhat padrão: npx hardhat node');
console.log('2. Backend: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000');
console.log('3. Proxy: node proxy.js');
console.log('4. Frontend: npm run dev');