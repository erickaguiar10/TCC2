from fastapi import FastAPI, HTTPException, Query, Depends, Request, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from blockchain import (
    get_owner, get_total_supply, get_ticket_details,
    get_ticket_status, get_event_date, get_tickets_by_owner, get_all_tickets,
    create_ticket, buy_ticket, resell_ticket, update_ticket_status
)
from dotenv import load_dotenv
import os
import logging
import jwt
from datetime import datetime, timedelta
from typing import Optional
from eth_account import Account
from eth_account.messages import encode_defunct
import time
from fastapi.middleware.cors import CORSMiddleware

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# JWT config
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# FastAPI app
app = FastAPI()

# 🚀 CORS config - Updated for local development
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for direct communication
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# HTTPBearer
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        address: str = payload.get("sub")
        if not address:
            raise HTTPException(status_code=401, detail="Token inválido")
        return address
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return verify_token(token)

# Função auxiliar para adicionar cabeçalhos CORS a uma resposta
def add_cors_headers(response):
    """Função auxiliar para adicionar cabeçalhos CORS a uma resposta"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Access-Control-Allow-Headers"
    response.headers["Access-Control-Max-Age"] = "3600"  # Cache preflight por 1 hora
    return response

# Middleware para adicionar cabeçalhos CORS a todas as respostas
@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response = add_cors_headers(response)
    return response

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_token(credentials.credentials)

# Login request model
class LoginRequest(BaseModel):
    wallet_address: str
    signature: str
    timestamp: str

# Request models for ticket operations
class CreateTicketRequest(BaseModel):
    event_name: str
    price: int
    event_date: int  # timestamp
    image_url: Optional[str] = None  # URL da imagem opcional

class BuyTicketRequest(BaseModel):
    value: int

class ResellTicketRequest(BaseModel):
    new_price: int

class UpdateTicketStatusRequest(BaseModel):
    new_status: int  # 0=Disponivel, 1=Vendido, 2=Revenda

class TransactionRequest(BaseModel):
    private_key: str

# Função de verificação de assinatura
def verify_wallet_signature(wallet_address: str, message: str, signature: str) -> bool:
    try:
        signable_message = encode_defunct(text=message)
        recovered_address = Account.recover_message(signable_message, signature=signature)
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        logger.error(f"Erro ao verificar assinatura: {str(e)}")
        return False

# --- Preflight global handler para OPTIONS ---
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    response = Response(status_code=200)
    return add_cors_headers(response)

# --- Login endpoint ---
@app.post("/login")
async def login(request: LoginRequest):
    try:
        wallet_address = request.wallet_address
        signature = request.signature
        timestamp_str = request.timestamp

        if not wallet_address.startswith("0x") or len(wallet_address) != 42:
            raise HTTPException(status_code=400, detail="Endereço de carteira inválido")

        # Timestamp check (30s tolerance)
        try:
            received_timestamp = int(timestamp_str)
            current_timestamp = int(time.time() * 1000)
            if abs(current_timestamp - received_timestamp) > 30000:
                raise HTTPException(status_code=401, detail="Timestamp inválido ou expirado.")
        except ValueError:
            raise HTTPException(status_code=400, detail="Timestamp inválido")

        message_to_verify = f"Login em {timestamp_str}"
        if not verify_wallet_signature(wallet_address, message_to_verify, signature):
            raise HTTPException(status_code=401, detail="Assinatura inválida")

        access_token = create_access_token(
            data={"sub": wallet_address},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return JSONResponse(
            content={"access_token": access_token, "token_type": "Bearer"},
            status_code=200
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        return JSONResponse({"detail": f"Erro no login: {str(e)}"}, status_code=500)

# --- Endpoints restantes (API de tickets) ---
@app.get("/owner")
def get_contract_owner():
    try:
        owner = get_owner()
        response = JSONResponse(content={"owner": owner})
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"Erro ao obter owner: {str(e)}")
        response = JSONResponse({"detail": f"Erro ao obter owner: {str(e)}"}, status_code=500)
        return add_cors_headers(response)

@app.get("/total-supply")
def get_total_supply_endpoint():
    try:
        total = get_total_supply()
        response = JSONResponse(content={"totalSupply": total})
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"Erro ao obter total supply: {str(e)}")
        response = JSONResponse({"detail": f"Erro ao obter total supply: {str(e)}"}, status_code=500)
        return add_cors_headers(response)

@app.get("/tickets")
def get_tickets_endpoint(start: int = Query(0, ge=0), limit: int = Query(100, le=1000)):
    try:
        tickets = get_all_tickets(start, limit)
        
        # Em uma implementação real, aqui seria onde adicionamos as URLs das imagens
        # associadas aos ingressos consultando um banco de dados ou sistema de arquivos
        # Por enquanto, iremos retornar os tickets com campo de imagem vazio
        for ticket in tickets:
            # Em uma implementação completa, adicionariamos a URL da imagem aqui
            # Exemplo: ticket['imagem'] = obter_url_imagem(ticket['id'])
            pass
            
        return {"tickets": tickets}
    except Exception as e:
        logger.error(f"Erro ao obter tickets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter tickets: {str(e)}")

@app.get("/ticket/{token_id}")
def get_ticket_endpoint(token_id: int):
    try:
        ticket = get_ticket_details(token_id)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ingresso não encontrado")
        # Em uma implementação completa, adicionariamos a URL da imagem ao ticket
        # Exemplo: ticket['imagem'] = obter_url_imagem(token_id)
        return ticket
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter ingresso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter ingresso: {str(e)}")

@app.get("/ticket/{token_id}/status")
def get_ticket_status_endpoint(token_id: int):
    try:
        status = get_ticket_status(token_id)
        return {"status": status}
    except Exception as e:
        logger.error(f"Erro ao obter status do ingresso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter status do ingresso: {str(e)}")

@app.get("/ticket/{token_id}/event-date")
def get_event_date_endpoint(token_id: int):
    try:
        event_date = get_event_date(token_id)
        return {"event_date": event_date}
    except Exception as e:
        logger.error(f"Erro ao obter data do evento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter data do evento: {str(e)}")

@app.get("/tickets/owner/{owner_address}")
def get_tickets_by_owner_endpoint(owner_address: str):
    try:
        tickets = get_tickets_by_owner(owner_address)
        # Em uma implementação completa, adicionariamos as URLs das imagens
        for ticket in tickets:
            # Exemplo: ticket['imagem'] = obter_url_imagem(ticket['id'])
            pass
        return {"tickets": tickets}
    except Exception as e:
        logger.error(f"Erro ao obter ingressos do proprietário: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter ingressos do proprietário: {str(e)}")

# POST endpoints para criar, comprar, revender ingressos e atualizar status
@app.post("/ticket/create")
def create_ticket_endpoint(
    request: CreateTicketRequest,
    current_user: str = Depends(get_current_user)
):
    try:
        # Verificar se o usuário é o proprietário do contrato (apenas o proprietário pode criar ingressos)
        owner = get_owner()
        logger.info(f"Proprietário do contrato: {owner}")
        logger.info(f"Usuário atual: {current_user}")
        logger.info(f"Comparação (case-insensitive): {owner.lower() == current_user.lower()}")
        if owner.lower() != current_user.lower():
            raise HTTPException(status_code=403, detail="Apenas o proprietário do contrato pode criar ingressos")
        
        # Usar a chave privada geral configurada no ambiente
        # Em um ambiente de produção, cada usuário teria sua própria chave privada segura
        user_private_key = os.getenv("PRIVATE_KEY")
        all_env_vars = dict(os.environ)
        logger.info(f"PRIVATE_KEY do ambiente para criação de ingresso: {'***' if user_private_key else 'NÃO ENCONTRADA'}")
        logger.info(f"Todos os prefixos de variáveis PRIVATE_KEY: {[k for k in all_env_vars.keys() if 'PRIVATE_KEY' in k]}")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não configurada no servidor")

        receipt = create_ticket(
            request.event_name,
            request.price,
            request.event_date,
            current_user,
            user_private_key,
            image_url=request.image_url
        )
        
        # Em uma implementação completa, teríamos um banco de dados para armazenar metadados
        # Fora do contrato inteligente, como URLs de imagens
        
        # Retornar sucesso com informações adicionais
        response_data = {
            "success": True, 
            "transaction_hash": receipt.transactionHash.hex(),
        }
        
        # Adiciona a URL da imagem se fornecida
        if request.image_url:
            response_data["image_url"] = request.image_url
            
        return response_data
    except Exception as e:
        logger.error(f"Erro ao criar ingresso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar ingresso: {str(e)}")

@app.post("/ticket/{token_id}/buy")
def buy_ticket_endpoint(
    token_id: int,
    request: BuyTicketRequest,
    current_user: str = Depends(get_current_user)
):
    try:
        # Usar a chave privada geral configurada no ambiente
        # Em um ambiente de produção, cada usuário teria sua própria chave privada segura
        user_private_key = os.getenv("PRIVATE_KEY")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não configurada no servidor")

        receipt = buy_ticket(
            token_id,  # Usar o token_id da URL, não do body
            request.value,
            current_user,
            user_private_key
        )
        return {"success": True, "transaction_hash": receipt.transactionHash.hex()}
    except Exception as e:
        logger.error(f"Erro ao comprar ingresso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao comprar ingresso: {str(e)}")

@app.post("/ticket/{token_id}/resell")
def resell_ticket_endpoint(
    token_id: int,
    request: ResellTicketRequest,
    current_user: str = Depends(get_current_user)
):
    try:
        # Usar a chave privada geral configurada no ambiente
        # Em um ambiente de produção, cada usuário teria sua própria chave privada segura
        user_private_key = os.getenv("PRIVATE_KEY")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não configurada no servidor")

        receipt = resell_ticket(
            token_id,  # Usar o token_id da URL, não do body
            request.new_price,
            current_user,
            user_private_key
        )
        return {"success": True, "transaction_hash": receipt.transactionHash.hex()}
    except Exception as e:
        logger.error(f"Erro ao revender ingresso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao revender ingresso: {str(e)}")

@app.post("/ticket/{token_id}/update-status")
def update_ticket_status_endpoint(
    token_id: int,
    request: UpdateTicketStatusRequest,
    current_user: str = Depends(get_current_user)
):
    try:
        # Usar a chave privada geral configurada no ambiente
        # Em um ambiente de produção, cada usuário teria sua própria chave privada segura
        user_private_key = os.getenv("PRIVATE_KEY")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não configurada no servidor")

        receipt = update_ticket_status(
            token_id,  # Usar o token_id da URL, não do body
            request.new_status,
            current_user,
            user_private_key
        )
        return {"success": True, "transaction_hash": receipt.transactionHash.hex()}
    except Exception as e:
        logger.error(f"Erro ao atualizar status do ingresso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar status do ingresso: {str(e)}")

# Endpoint para upload de imagens
@app.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """Endpoint para upload de imagens para eventos"""
    try:
        # Verificar se o arquivo é uma imagem
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Tipo de arquivo não suportado. Apenas imagens são permitidas.")
        
        # Ler o conteúdo do arquivo
        contents = await file.read()
        
        # Aqui normalmente salvaríamos a imagem em algum sistema de arquivos ou CDN
        # Por enquanto, retornamos uma mensagem informando que o upload foi feito
        return {
            "filename": file.filename,
            "size": len(contents),
            "content_type": file.content_type,
            "message": "Upload realizado com sucesso"
        }
    except Exception as e:
        logger.error(f"Erro ao fazer upload da imagem: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload da imagem: {str(e)}")

# Endpoint de saúde para verificar se o backend está respondendo
@app.get("/health")
async def health_check():
    """Endpoint para verificar saúde do serviço"""
    try:
        # Tenta se conectar ao blockchain para verificar se está funcionando
        from blockchain import get_owner
        owner = get_owner()
        return {
            "status": "healthy", 
            "message": "Backend e conexão com blockchain operacionais",
            "contract_owner": owner
        }
    except Exception as e:
        logger.error(f"Erro na verificação de saúde: {str(e)}")
        return {
            "status": "unhealthy", 
            "message": f"Erro na conexão com blockchain: {str(e)}"
        }

# Endpoint para verificar variáveis de ambiente
@app.get("/debug/env")
async def debug_env():
    """Endpoint para depuração de variáveis de ambiente"""
    all_env_vars = dict(os.environ)
    private_key_vars = {k: ('***' if 'PRIVATE_KEY' in k else v) for k, v in all_env_vars.items() if 'PRIVATE_KEY' in k or 'KEY' in k or 'CONTRACT' in k}
    return {
        "private_key_vars": private_key_vars,
        "rpc_url_set": 'RPC_URL' in all_env_vars,
        "contract_address_set": 'CONTRACT_ADDRESS' in all_env_vars
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)