import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# Configurações
RPC_URL = os.getenv("RPC_URL", "http://localhost:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

# Endereço do contrato
contract_address = CONTRACT_ADDRESS

# Conectar ao blockchain
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Verificar conexão
if not w3.is_connected():
    print("Nao foi possivel conectar ao blockchain")
else:
    print("Conexao com blockchain estabelecida")

# Verificar se o contrato existe no endereço
if contract_address:
    try:
        # Verificar se há código no endereço (indicando que o contrato existe)
        code = w3.eth.get_code(contract_address)
        if code.hex() != '0x':
            print(f"Contrato encontrado no endereco: {contract_address}")
        else:
            print(f"Nenhum contrato encontrado no endereco: {contract_address}")
        
        # Verificar o número do bloco mais recente
        block_number = w3.eth.block_number
        print(f"Bloco mais recente: {block_number}")
        
        # Verificar contas disponíveis
        accounts = w3.eth.accounts
        print(f"Contas disponiveis: {accounts[:3]}...")  # Mostrar apenas as primeiras 3
        
    except Exception as e:
        print(f"Erro ao interagir com o blockchain: {e}")
else:
    print("Endereco do contrato nao definido no .env")