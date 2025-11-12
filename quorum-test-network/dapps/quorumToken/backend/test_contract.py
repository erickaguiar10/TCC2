import os
from web3 import Web3
from dotenv import load_dotenv
import json

# Carregar .env da pasta raiz
load_dotenv('../.env')

# Configurações
RPC_URL = os.getenv("RPC_URL", "http://localhost:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# Caminho para o ABI
abi_path = './TicketNFT.json'

# Conectar ao blockchain
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Carregar ABI
try:
    with open(abi_path, 'r') as f:
        contract_data = json.load(f)
        abi = contract_data['abi'] if 'abi' in contract_data else contract_data
except FileNotFoundError:
    print(f"Arquivo ABI não encontrado: {abi_path}")
    exit(1)

# Criar instância do contrato
try:
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
    print(f"Instância do contrato criada com sucesso para: {CONTRACT_ADDRESS}")
    
    # Testar uma chamada de leitura (view function)
    try:
        owner = contract.functions.owner().call()
        print(f"Proprietário do contrato: {owner}")
    except Exception as e:
        print(f"Erro ao chamar função 'owner': {e}")
    
    # Testar totalSupply
    try:
        total_supply = contract.functions.totalSupply().call()
        print(f"Total Supply: {total_supply}")
    except Exception as e:
        print(f"Erro ao chamar função 'totalSupply': {e}")

    # Testar se o contrato responde
    try:
        block_number = w3.eth.block_number
        print(f"Bloco mais recente: {block_number}")
    except Exception as e:
        print(f"Erro ao obter bloco: {e}")

except Exception as e:
    print(f"Erro ao criar instância do contrato: {e}")