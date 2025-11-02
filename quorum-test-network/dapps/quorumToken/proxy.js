require('dotenv').config(); // Load environment variables
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Proxy for API endpoints that start with /api
app.use('/api', createProxyMiddleware({
  target: process.env.BACKEND_URL || `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || '8000'}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api from path before forwarding to backend
  },
  onProxyReq: function(proxyReq, req, res) {
    // Ensure content-type is set correctly
    proxyReq.setHeader('Content-Type', 'application/json');
    console.log(`Proxying API request: ${req.method} ${req.url}`);
  },
  onProxyRes: function(proxyRes, req, res) {
    // Allow access from any origin
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    console.log(`API response: ${proxyRes.statusCode} for ${req.url}`);
  },
  logLevel: 'debug'
}));

// Proxy for blockchain endpoints (everything except /api)
app.use('/', createProxyMiddleware({
  target: process.env.RPC_URL || 'http://127.0.0.1:8545',
  changeOrigin: true,
  // Only forward to blockchain if not an API endpoint
  filter: function (pathname, req) {
    // Don't proxy API endpoints to blockchain
    return !pathname.startsWith('/api');
  },
  onProxyReq: function(proxyReq, req, res) {
    // Ensure content-type is set correctly for JSON-RPC
    proxyReq.setHeader('Content-Type', 'application/json');
    console.log(`Proxying blockchain request: ${req.method} ${req.url}`);
  },
  onProxyRes: function(proxyRes, req, res) {
    // Allow access from any origin (necessary for browser functionality)
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    console.log(`Blockchain response: ${proxyRes.statusCode} for ${req.url}`);
  },
  logLevel: 'debug'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Proxy Server' });
});

const PORT = process.env.PROXY_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Forwarding /api requests to: ${process.env.BACKEND_URL || `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || '8000'}`}`);
  console.log(`Forwarding blockchain requests to: ${process.env.RPC_URL || 'http://127.0.0.1:8545'}`);
});