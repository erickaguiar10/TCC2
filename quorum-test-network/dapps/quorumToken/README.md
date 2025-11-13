# QuorumToken - Ticket Sales DApp

A complete decentralized application for ticket sales built on the Quorum blockchain, featuring NFT-based tickets with buying, selling, and reselling capabilities.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python + FastAPI + Web3.py 
- **Smart Contracts**: Solidity v0.8.20
- **Blockchain**: Quorum/Ethereum-compatible network
- **Development**: Hardhat, OpenZeppelin
- **Proxy**: Express.js + http-proxy-middleware

## Features

- ✅ Create, buy, and resell NFT-based tickets
- ✅ Wallet-based authentication with signature verification
- ✅ Full blockchain integration via Web3
- ✅ Complete API layer with Python/FastAPI
- ✅ React/Vite frontend with wallet connection
- ✅ Proxy server for handling API and blockchain requests
- ✅ Comprehensive test suite

## Project Structure

```
quorumToken/
├── contracts/
│   ├── TicketNFT.sol      # Main ticket NFT contract
│   └── QuorumToken.sol    # ERC20 token contract
├── backend/
│   ├── main.py           # FastAPI server
│   └── blockchain.py     # Web3 interactions
├── frontend/
├── test/
│   ├── TicketNFT.test.js # Contract tests
│   └── QuorumToken.test.js
├── abis/                 # Contract ABIs
├── scripts/
│   └── deploy.js         # Deployment script
├── .env                 # Environment variables
├── hardhat.config.cjs   # Hardhat configuration
├── package.json         # Node.js dependencies
└── proxy.js             # Proxy server
```

## Setup and Installation

### Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- A running Quorum blockchain node

### Installation

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Install Python backend dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

The application uses the following environment variables:

- `RPC_URL` - URL of your blockchain node (default: http://127.0.0.1:8545)
- `PRIVATE_KEY` - Private key for contract deployment and transactions
- `CONTRACT_ADDRESS` - Address of deployed TicketNFT contract
- `BACKEND_PORT` - Port for the Python backend (default: 8000)
- `FRONTEND_PORT` - Port for the React frontend (default: 8080)
- `BACKEND_PORT` - Port for the backend server (default: 8000)

## Running the Application

### 1. Compile Smart Contracts
```bash
npx hardhat compile
```

### 2. Deploy Smart Contracts
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Run Tests
```bash
npx hardhat test --network hardhat
```

### 4. Start the Backend Server
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Start the Proxy Server
```bash
npm start
# This runs the backend on port 8000 and frontend on port 8080
```

### 6. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 7. Complete Setup (All Services)
For a complete development setup, run each service in a separate terminal:

1. **Blockchain node** (if using local development):
   ```bash
   # In a new terminal
   npx hardhat node
   ```

2. **Backend server**:
   ```bash
   # In a new terminal
   cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

3. **Proxy server**:
   ```bash
   # In a new terminal
   npm start
   ```

4. **Frontend server**:
   ```bash
   # In a new terminal
   cd frontend && npm run dev
   ```

## Architecture Overview

### Smart Contracts

The `TicketNFT.sol` contract implements:
- ERC721Enumerable for NFT functionality
- Ownable for contract ownership
- ReentrancyGuard for security
- Three ticket states: Available, Sold, For Resale
- Functions for creating, buying, reselling, and viewing tickets

### Backend Server

The Python/FastAPI backend provides:
- Wallet-based authentication with signature verification
- Complete API for ticket management
- Direct blockchain interactions via Web3.py
- Endpoints for:
  - User authentication
  - Ticket creation, purchase, and resale
  - Ticket information retrieval
  - Owner and supply queries

### Proxy Server

The Express.js proxy server handles:
- API requests (forwarded to backend on port 8000)
- Blockchain requests (forwarded to node on port 8545)
- CORS handling for browser compatibility
- Request routing and headers management

### Frontend

The React/Vite frontend includes:
- Wallet connection and authentication
- Ticket browsing and purchasing
- User ticket management
- Responsive UI with Tailwind CSS
- TypeScript type safety

## API Endpoints

### Authentication
- `POST /api/login` - Authenticate with wallet signature

### Ticket Information
- `GET /api/owner` - Get contract owner
- `GET /api/total-supply` - Get total number of tickets
- `GET /api/tickets?start=0&limit=100` - Get paginated tickets
- `GET /api/ticket/{token_id}` - Get specific ticket details
- `GET /api/ticket/{token_id}/status` - Get ticket status
- `GET /api/ticket/{token_id}/event-date` - Get event date
- `GET /api/tickets/owner/{owner_address}` - Get tickets for owner

### Ticket Operations
- `POST /api/ticket/create` - Create new ticket (owner only)
- `POST /api/ticket/{token_id}/buy` - Buy a ticket
- `POST /api/ticket/{token_id}/resell` - Resell a ticket

## Security Considerations

- Uses ReentrancyGuard to prevent reentrancy attacks
- Proper access control with Ownable pattern
- Safe transfer functions
- Signature verification for authentication
- Input validation for all external functions

## Testing

Run the complete test suite with:
```bash
npx hardhat test --network hardhat
```

Tests include:
- Complete contract functionality testing
- Edge cases and error conditions
- Security checks
- State transitions

## Deployment

For production deployment:

1. Update `.env` with production values
2. Update RPC_URL to your production blockchain node
3. Deploy contracts to the target network:
   ```bash
   npx hardhat run scripts/deploy.js --network [network-name]
   ```
4. Update CONTRACT_ADDRESS in your environment
5. Deploy backend and frontend to your hosting provider

## Troubleshooting

### Common Issues:
1. **Contract deployment fails** - Check private key and network connection
2. **Backend can't connect to blockchain** - Verify RPC_URL and node accessibility
3. **Frontend can't connect to backend** - Ensure proxy server is running
4. **CORS errors** - Confirm proxy server is handling requests properly

### Development Tips:
- Use `npx hardhat node` for local blockchain development
- The backend server runs on port 8000
- All API calls from frontend should go through `/api/` route to use proxy