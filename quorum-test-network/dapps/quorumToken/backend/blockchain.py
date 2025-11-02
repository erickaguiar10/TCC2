# blockchain.py
from web3 import Web3
import json
import os
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    raise Exception(f"❌ Não conectou no nó {RPC_URL}")

# contrato
contract_address = os.getenv("CONTRACT_ADDRESS", "0x05d91B9031A655d08E654177336d08543ac4B711")
contract_address = Web3.to_checksum_address(contract_address)

# Ler ABI do contrato
abi_path = os.getenv("ABI_PATH", "../abis/TicketNFT.json")
with open(abi_path) as f:
    abi = json.load(f)["abi"]

contract = w3.eth.contract(address=contract_address, abi=abi)

print("✅ Conectado ao contrato:", contract_address)

def get_owner():
    """Obtém o dono do contrato"""
    return contract.functions.owner().call()

def get_total_supply():
    """Obtém o número total de ingressos"""
    # Usando a função listarIngressos que retorna todos os tokens
    tokens = contract.functions.listarIngressos().call()
    return len(tokens)

def get_token_owner(token_id):
    """Obtém o dono de um ingresso específico"""
    return contract.functions.ownerOf(token_id).call()

def get_ticket_details(token_id):
    """Obtém os detalhes de um ingresso específico"""
    # Usando a função verificarIngresso para verificar se o ingresso existe
    exists = contract.functions.verificarIngresso(token_id).call()
    if not exists:
        return None
    
    # Recuperar os detalhes do ingresso
    ingresso = contract.functions.ingressos(token_id).call()
    
    return {
        "evento": ingresso[0],  # string evento
        "preco": ingresso[1],   # uint256 preco
        "dataEvento": ingresso[2],  # uint256 dataEvento
        "status": ingresso[3]   # uint256 status (0=Disponivel, 1=Vendido, 2=Revenda)
    }

def get_ticket_status(token_id):
    """Obtém o status de um ingresso específico"""
    return contract.functions.statusIngresso(token_id).call()

def get_event_date(token_id):
    """Obtém a data do evento de um ingresso específico"""
    return contract.functions.dataEvento(token_id).call()

def get_tickets_by_owner(owner_address):
    """Obtém a lista de ingressos de um usuário específico"""
    return contract.functions.ingressosDoUsuario(owner_address).call()

def get_all_tickets(start=0, limit=100):
    """Obtém uma lista paginada de todos os ingressos"""
    # Usando a função listarIngressos que retorna todos os tokens
    all_tokens = contract.functions.listarIngressos().call()
    total = len(all_tokens)
    
    # Aplicar limites para evitar sobrecarga
    end = min(start + limit, total)
    
    tickets = []
    for i in range(start, end):
        try:
            token_id = all_tokens[i]
            owner = contract.functions.ownerOf(token_id).call()
            ticket_details = get_ticket_details(token_id)
            
            ticket_info = {
                "id": token_id,
                "owner": owner
            }
            
            if ticket_details:
                ticket_info.update({
                    "evento": ticket_details["evento"],
                    "preco": ticket_details["preco"],
                    "dataEvento": ticket_details["dataEvento"],
                    "status": ticket_details["status"]
                })
            
            tickets.append(ticket_info)
        except Exception as e:
            logger.warning(f"Erro ao obter informações do token na posição {i}: {str(e)}")
            # Adiciona apenas informações básicas se houver erro
            tickets.append({
                "id": "unknown",
                "owner": "unknown",
                "error": str(e)
            })
    
    return tickets

def create_ticket(event_name, price, event_date, from_account, private_key):
    """Cria um novo ingresso (apenas owner)"""
    nonce = w3.eth.get_transaction_count(from_account)
    
    txn = contract.functions.criarIngresso(
        event_name,
        price,
        event_date
    ).build_transaction({
        'chainId': w3.eth.chain_id,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    return w3.eth.wait_for_transaction_receipt(tx_hash)

def buy_ticket(token_id, value, from_account, private_key):
    """Compra um ingresso"""
    nonce = w3.eth.get_transaction_count(from_account)
    
    txn = contract.functions.comprarIngresso(token_id).build_transaction({
        'chainId': w3.eth.chain_id,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'value': value,
        'nonce': nonce
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    return w3.eth.wait_for_transaction_receipt(tx_hash)

def resell_ticket(token_id, new_price, from_account, private_key):
    """Coloca um ingresso à revenda"""
    nonce = w3.eth.get_transaction_count(from_account)
    
    txn = contract.functions.revenderIngresso(
        token_id,
        new_price
    ).build_transaction({
        'chainId': w3.eth.chain_id,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    return w3.eth.wait_for_transaction_receipt(tx_hash)

def update_ticket_status(token_id, new_status, from_account, private_key):
    """Atualiza o status de um ingresso (apenas owner)"""
    nonce = w3.eth.get_transaction_count(from_account)
    
    txn = contract.functions.atualizarStatus(
        token_id,
        new_status
    ).build_transaction({
        'chainId': w3.eth.chain_id,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    return w3.eth.wait_for_transaction_receipt(tx_hash)
