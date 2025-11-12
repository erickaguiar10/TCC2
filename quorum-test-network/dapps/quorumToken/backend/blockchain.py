from web3 import Web3
from eth_account import Account
import os
from dotenv import load_dotenv
import json
import time
import logging

# Configurar logging
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Conectar-se ao nó Ethereum
rpc_url = os.getenv("RPC_URL", "http://localhost:8545")
logger.info(f"Tentando conectar ao RPC: {rpc_url}")
w3 = Web3(Web3.HTTPProvider(rpc_url))

# Verificar conexão
if not w3.is_connected():
    raise Exception("Falha ao conectar ao nó Ethereum")

logger.info("Conexão com o nó Ethereum estabelecida com sucesso")

# Endereço do contrato e ABI (substitua pelo endereço real do seu contrato implantado)
contract_address_env = os.getenv("CONTRACT_ADDRESS")
if not contract_address_env:
    raise Exception("CONTRACT_ADDRESS não definido no .env")

contract_address = Web3.to_checksum_address(contract_address_env)
logger.info(f"Endereço do contrato: {contract_address}")

# Carregar ABI do contrato
try:
    with open("TicketNFT.json", "r") as f:
        abi = json.load(f)["abi"]
    logger.info("ABI carregada do arquivo TicketNFT.json")
except FileNotFoundError:
    try:
        # Tentar no diretório abis também
        with open("abis/TicketNFT.json", "r") as f:
            abi = json.load(f)["abi"]
        logger.info("ABI carregada do arquivo abis/TicketNFT.json")
    except FileNotFoundError:
        raise Exception("Arquivo ABI não encontrado. Execute 'npm run copy-abi' primeiro.")

# Criar instância do contrato
contract = w3.eth.contract(address=contract_address, abi=abi)
logger.info("Instância do contrato criada com sucesso")

def get_owner():
    """Obter o proprietário do contrato"""
    return contract.functions.owner().call()

def get_total_supply():
    """Obter o fornecimento total de tokens"""
    return contract.functions.totalSupply().call()

def get_ticket_details(token_id):
    """Obter detalhes de um ingresso específico"""
    try:
        # Obter detalhes do ingresso do contrato
        ticket_data = contract.functions.ingressos(token_id).call()
        
        # Obter informações adicionais
        owner = contract.functions.ownerOf(token_id).call()
        status = contract.functions.statusIngresso(token_id).call()
        event_date = contract.functions.dataEvento(token_id).call()
        
        # Simular URL de imagem com base no ID do ticket (em uma implementação real, isso viria de um banco de dados)
        image_url = f"https://placehold.co/600x400?text=Evento+{token_id}"
        
        return {
            "id": token_id,
            "owner": owner,
            "evento": ticket_data[0],  # Nome do evento
            "preco": str(ticket_data[1]),  # Preço do evento
            "dataEvento": ticket_data[2],  # Data do evento
            "status": status,
            "imagem": image_url  # Adicionando campo de imagem
        }
    except Exception as e:
        print(f"Erro ao obter detalhes do ingresso: {e}")
        return None

def get_ticket_status(token_id):
    """Obter status de um ingresso"""
    return contract.functions.statusIngresso(token_id).call()

def get_event_date(token_id):
    """Obter a data do evento de um ingresso"""
    return contract.functions.dataEvento(token_id).call()

def get_tickets_by_owner(owner_address):
    """Obter todos os ingressos de um proprietário"""
    try:
        # Obter lista de token IDs do usuário
        ticket_ids = contract.functions.ingressosDoUsuario(owner_address).call()
        
        tickets = []
        for token_id in ticket_ids:
            ticket = get_ticket_details(token_id)
            if ticket:
                # Adicionar URL de imagem simulada
                ticket["imagem"] = f"https://placehold.co/600x400?text=Evento+{token_id}"
                tickets.append(ticket)
        
        return tickets
    except Exception as e:
        print(f"Erro ao obter ingressos do proprietário: {e}")
        return []

def get_all_tickets(start=0, limit=100):
    """Obter todos os ingressos"""
    try:
        # Obter o fornecimento total de tokens
        total_supply = get_total_supply()
        
        tickets = []
        # Obter os tokens dentro do intervalo especificado
        for i in range(start, min(start + limit, total_supply)):
            try:
                token_id = contract.functions.tokenByIndex(i).call()
                ticket = get_ticket_details(token_id)
                if ticket:
                    # Adicionar URL de imagem simulada
                    ticket["imagem"] = f"https://placehold.co/600x400?text=Evento+{token_id}"
                    tickets.append(ticket)
            except:
                # Se o token não existir no índice (pode ter sido queimado), continuar
                continue
        
        return tickets
    except Exception as e:
        print(f"Erro ao obter todos os ingressos: {e}")
        return []

def create_ticket(event_name, price, event_date, owner_address, private_key):
    """Criar novo ingresso (só pode ser feito pelo proprietário do contrato)"""
    # Obter a conta com a chave privada
    account = Account.from_key(private_key)
    address = account.address
    
    # Verificar se o autor é o proprietário
    contract_owner = get_owner()
    if contract_owner.lower() != address.lower():
        raise Exception("Somente o proprietário do contrato pode criar ingressos")
    
    # Construir a transação
    transaction = contract.functions.criarIngresso(
        event_name,
        price,
        event_date
    ).build_transaction({
        'from': address,
        'nonce': w3.eth.get_transaction_count(address),
        'gas': 500000,  # Definir limite de gás adequado
        'gasPrice': w3.eth.gas_price  # Usar preço do gás atual
    })
    
    # Assinar a transação
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Enviar a transação
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    # Aguardar a confirmação da transação
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return receipt

def buy_ticket(token_id, value, buyer_address, private_key):
    """Comprar um ingresso"""
    # Obter a conta com a chave privada
    account = Account.from_key(private_key)
    address = account.address
    
    # Obter preço do ingresso
    ticket_data = contract.functions.ingressos(token_id).call()
    price = ticket_data[1]  # Preço do ingresso
    
    # Construir a transação
    transaction = contract.functions.comprarIngresso(token_id).build_transaction({
        'from': address,
        'value': price,  # Enviar o valor do preço do ingresso
        'nonce': w3.eth.get_transaction_count(address),
        'gas': 500000,  # Definir limite de gás adequado
        'gasPrice': w3.eth.gas_price  # Usar preço do gás atual
    })
    
    # Assinar a transação
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Enviar a transação
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    # Aguardar a confirmação da transação
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return receipt

def resell_ticket(token_id, new_price, owner_address, private_key):
    """Revender um ingresso"""
    # Obter a conta com a chave privada
    account = Account.from_key(private_key)
    address = account.address
    
    # Verificar se o autor é o proprietário do token
    token_owner = contract.functions.ownerOf(token_id).call()
    if token_owner.lower() != address.lower():
        raise Exception("Somente o proprietário do ingresso pode revendê-lo")
    
    # Construir a transação
    transaction = contract.functions.revenderIngresso(
        token_id,
        new_price
    ).build_transaction({
        'from': address,
        'nonce': w3.eth.get_transaction_count(address),
        'gas': 500000,  # Definir limite de gás adequado
        'gasPrice': w3.eth.gas_price  # Usar preço do gás atual
    })
    
    # Assinar a transação
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Enviar a transação
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    # Aguardar a confirmação da transação
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return receipt

def update_ticket_status(token_id, new_status, owner_address, private_key):
    """Atualizar status de um ingresso (só pode ser feito pelo proprietário do contrato)"""
    # Obter a conta com a chave privada
    account = Account.from_key(private_key)
    address = account.address
    
    # Verificar se o autor é o proprietário
    contract_owner = get_owner()
    if contract_owner.lower() != address.lower():
        raise Exception("Somente o proprietário do contrato pode atualizar o status")
    
    # Construir a transação
    transaction = contract.functions.atualizarStatus(
        token_id,
        new_status
    ).build_transaction({
        'from': address,
        'nonce': w3.eth.get_transaction_count(address),
        'gas': 500000,  # Definir limite de gás adequado
        'gasPrice': w3.eth.gas_price  # Usar preço do gás atual
    })
    
    # Assinar a transação
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Enviar a transação
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    # Aguardar a confirmação da transação
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return receipt