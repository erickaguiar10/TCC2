// Script para testar a conexão direta com o nó do Hardhat
const Web3 = require('web3');

async function testConnection() {
  const web3 = new Web3('http://127.0.0.1:8545');
  
  try {
    // Verificar se está conectado
    const isConnected = await web3.eth.net.isListening();
    console.log('Conectado ao nó:', isConnected);
    
    // Obter informações básicas
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('Número do bloco atual:', blockNumber);
    
    // Obter contas
    const accounts = await web3.eth.getAccounts();
    console.log('Contas disponíveis:', accounts.slice(0, 3)); // Mostrar as 3 primeiras
    
    // Tentar obter o saldo de uma conta
    if (accounts.length > 0) {
      const balance = await web3.eth.getBalance(accounts[0]);
      console.log('Saldo da primeira conta:', web3.utils.fromWei(balance, 'ether'), 'ETH');
    }
  } catch (error) {
    console.error('Erro na conexão:', error.message);
  }
}

testConnection().catch(console.error);