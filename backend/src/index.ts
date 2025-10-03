import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimit, generalRateLimit, searchRateLimit, seedRateLimit } from './middleware/rateLimiter';

// Import routes
import nodeRoutes from './routes/nodeRoutes';
import quoteRoutes from './routes/quoteRoutes';
import seedRoutes from './routes/seedRoutes';
import userRoutes from './routes/userRoutes';

// Import WebSocket service
import { initializeWebSocket } from './services/WebSocketService';

// Import services for initial setup
import { quoteService } from './services/QuoteService';

const app = express();
const server = createServer(app);

// Initialize WebSocket
const wsService = initializeWebSocket(server);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(corsMiddleware);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      websocket: {
        connectedClients: wsService.getConnectedClientsCount(),
        subscribedSymbols: Array.from(wsService.getSubscribedSymbols())
      }
    }
  });
});

// API routes
app.use('/api/users', apiRateLimit, userRoutes);
app.use('/api/nodes', apiRateLimit, nodeRoutes);
app.use('/api/quotes', apiRateLimit, quoteRoutes);

// Development/Seed routes (with stricter rate limiting)
app.use('/dev/seed', seedRateLimit, seedRoutes);

// Search endpoint with specific rate limiting
app.use('/api/search', searchRateLimit, nodeRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize default quotes
async function initializeDefaultQuotes() {
  try {
    const defaultSymbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];

    for (const symbol of defaultSymbols) {
      const basePrice = 50 + Math.random() * 950; // Random price between 50-1000
      await quoteService.updateQuote(symbol, Math.round(basePrice * 100) / 100);
    }

    console.log(`Initialized quotes for ${defaultSymbols.length} symbols`);
  } catch (error) {
    console.error('Error initializing default quotes:', error);
  }
}

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws/quotes`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);

  // Initialize default data
  initializeDefaultQuotes();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  wsService?.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  wsService?.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;

