from fastapi import FastAPI, HTTPException, Query, Depends, Request
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

# 🚀 CORS config - Updated for GitHub Codespaces
FRONTEND_URL = "https://congenial-parakeet-56xwvj4j4j37jw6-8080.app.github.dev"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://congenial-parakeet-56xwvj4j4j37jw6-8000.app.github.dev", "*"],  # Allow both frontend and backend URLs plus wildcard
    allow_credentials=False,
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

class BuyTicketRequest(BaseModel):
    token_id: int
    value: int

class ResellTicketRequest(BaseModel):
    token_id: int
    new_price: int

class UpdateTicketStatusRequest(BaseModel):
    token_id: int
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
            content={"access_token": access_token, "token_type": "bearer"},
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
        # Obter a chave privada do usuário (em produção, isso deve ser armazenado de forma segura)
        user_private_key = os.getenv(f"PRIVATE_KEY_{current_user.lower()}")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não encontrada para o usuário")
        
        receipt = create_ticket(
            request.event_name,
            request.price,
            request.event_date,
            current_user,
            user_private_key
        )
        return {"success": True, "transaction_hash": receipt.transactionHash.hex()}
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
        # Obter a chave privada do usuário (em produção, isso deve ser armazenado de forma segura)
        user_private_key = os.getenv(f"PRIVATE_KEY_{current_user.lower()}")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não encontrada para o usuário")
        
        receipt = buy_ticket(
            request.token_id,
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
        # Obter a chave privada do usuário (em produção, isso deve ser armazenado de forma segura)
        user_private_key = os.getenv(f"PRIVATE_KEY_{current_user.lower()}")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não encontrada para o usuário")
        
        receipt = resell_ticket(
            request.token_id,
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
        # Obter a chave privada do usuário (em produção, isso deve ser armazenado de forma segura)
        user_private_key = os.getenv(f"PRIVATE_KEY_{current_user.lower()}")
        if not user_private_key:
            raise HTTPException(status_code=400, detail="Chave privada não encontrada para o usuário")
        
        receipt = update_ticket_status(
            request.token_id,
            request.new_status,
            current_user,
            user_private_key
        )
        return {"success": True, "transaction_hash": receipt.transactionHash.hex()}
    except Exception as e:
        logger.error(f"Erro ao atualizar status do ingresso: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar status do ingresso: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
