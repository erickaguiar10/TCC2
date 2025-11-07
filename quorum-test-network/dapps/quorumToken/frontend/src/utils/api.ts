import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// 🧩 Cria a instância base do axios
export const apiteste = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configuração do cliente Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com expiração do token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Se o erro 401 não for na página de login, redireciona
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('access_token');
        // Idealmente, isso deveria usar o router do React, mas window.location funciona
        // window.location.href = '/login'; 
        console.error("Token inválido ou expirado.");
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Tipos para os dados da API
export interface Ticket {
  id: number;
  owner: string;
  evento?: string;
  preco?: string;
  dataEvento?: number;
  status?: number;
}

export interface TicketDetails extends Ticket {
  evento: string;
  preco: string;
  dataEvento: number;
  status: number;
}

// Funções de chamada à API
export const api = {
  // Autenticação
  // ALTERAÇÃO: A função agora aceita e envia o 'timestamp'
  login: (walletAddress: string, signature: string, timestamp: string) => 
    apiClient.post('/login', { 
      wallet_address: walletAddress, 
      signature,
      timestamp // Enviando o timestamp para o backend
    }),
  
  // Obter informações do contrato
  getOwner: () => apiClient.get('/owner'),
  getTotalSupply: () => apiClient.get('/total-supply'),
  
  // Obter ingressos
  getTickets: (start: number = 0, limit: number = 100) => 
    apiClient.get('/tickets', { params: { start, limit } }),
  
  getTicket: (tokenId: number) => 
    apiClient.get(`/ticket/${tokenId}`),
  
  getTicketStatus: (tokenId: number) => 
    apiClient.get(`/ticket/${tokenId}/status`),
  
  getEventDate: (tokenId: number) => 
    apiClient.get(`/ticket/${tokenId}/event-date`),
  
  getTicketsByOwner: (ownerAddress: string) => 
    apiClient.get(`/tickets/owner/${ownerAddress}`),
  
  // Criar ingresso (apenas owner) - Novo formato
  createTicket: (
    eventName: string, 
    price: number, 
    eventDate: number
  ) => 
    apiClient.post('/ticket/create', {
      event_name: eventName,
      price,
      event_date: eventDate
    }),
  
  // Comprar ingresso - Novo formato
  buyTicket: (
    tokenId: number,
    value: number
  ) => 
    apiClient.post(`/ticket/${tokenId}/buy`, {
      token_id: tokenId,
      value
    }),
  
  // Revender ingresso - Novo formato
  resellTicket: (
    tokenId: number,
    newPrice: number
  ) => 
    apiClient.post(`/ticket/${tokenId}/resell`, {
      token_id: tokenId,
      new_price: newPrice
    }),
  
  // Atualizar status (apenas owner) - Novo formato
  updateTicketStatus: (
    tokenId: number,
    newStatus: number
  ) => 
    apiClient.post(`/ticket/${tokenId}/update-status`, {
      token_id: tokenId,
      new_status: newStatus
    }),
};
