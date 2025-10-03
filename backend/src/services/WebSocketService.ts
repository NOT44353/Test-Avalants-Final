import { Server } from 'http';
import WebSocket from 'ws';
import { Quote, WebSocketMessage } from '../types';
import { quoteService } from './QuoteService';

interface ClientConnection {
  ws: WebSocket;
  subscribedSymbols: Set<string>;
  lastPing: number;
}

export class WebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<WebSocket, ClientConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private quoteUpdateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server, path: '/ws/quotes' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');

      const connection: ClientConnection = {
        ws,
        subscribedSymbols: new Set(),
        lastPing: Date.now()
      };

      this.clients.set(ws, connection);

      // Send welcome message
      this.sendMessage(ws, {
        type: 'pong',
        ts: new Date().toISOString()
      });

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      ws.on('pong', () => {
        const connection = this.clients.get(ws);
        if (connection) {
          connection.lastPing = Date.now();
        }
      });
    });

    this.startHeartbeat();
    this.startQuoteUpdates();
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    const connection = this.clients.get(ws);
    if (!connection) return;

    switch (message.type) {
      case 'subscribe':
        if (message.symbols && Array.isArray(message.symbols)) {
          message.symbols.forEach(symbol => {
            connection.subscribedSymbols.add(symbol);
          });
          console.log(`Client subscribed to: ${Array.from(connection.subscribedSymbols).join(', ')}`);
        }
        break;

      case 'unsubscribe':
        if (message.symbols && Array.isArray(message.symbols)) {
          message.symbols.forEach(symbol => {
            connection.subscribedSymbols.delete(symbol);
          });
          console.log(`Client unsubscribed from: ${message.symbols.join(', ')}`);
        }
        break;

      case 'ping':
        this.sendMessage(ws, {
          type: 'pong',
          ts: new Date().toISOString()
        });
        break;

      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private sendMessage(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string): void {
    this.sendMessage(ws, {
      type: 'error',
      error,
      ts: new Date().toISOString()
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 seconds

      for (const [ws, connection] of this.clients) {
        if (now - connection.lastPing > timeout) {
          console.log('Closing inactive WebSocket connection');
          ws.terminate();
          this.clients.delete(ws);
        } else {
          ws.ping();
        }
      }
    }, 15000); // Check every 15 seconds
  }

  private startQuoteUpdates(): void {
    // Update quotes every 100ms (10 updates per second)
    this.quoteUpdateInterval = setInterval(() => {
      this.broadcastQuoteUpdates();
    }, 100);
  }

  private async broadcastQuoteUpdates(): Promise<void> {
    if (this.clients.size === 0) return;

    // Get all unique subscribed symbols
    const allSymbols = new Set<string>();
    for (const connection of this.clients.values()) {
      connection.subscribedSymbols.forEach(symbol => allSymbols.add(symbol));
    }

    if (allSymbols.size === 0) return;

    // Update quotes for subscribed symbols
    const symbols = Array.from(allSymbols);
    const quotes = await quoteService.getQuoteSnapshot(symbols);

    // Broadcast to subscribed clients
    for (const [ws, connection] of this.clients) {
      if (connection.subscribedSymbols.size === 0) continue;

      const relevantQuotes: Quote[] = [];
      for (const symbol of connection.subscribedSymbols) {
        if (quotes[symbol]) {
          relevantQuotes.push(quotes[symbol]);
        }
      }

      if (relevantQuotes.length > 0) {
        this.sendMessage(ws, {
          type: 'quotes',
          quotes: relevantQuotes,
          ts: new Date().toISOString()
        });
      }
    }
  }

  public async updateQuote(symbol: string, price: number): Promise<void> {
    await quoteService.updateQuote(symbol, price);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public getSubscribedSymbols(): Set<string> {
    const allSymbols = new Set<string>();
    for (const connection of this.clients.values()) {
      connection.subscribedSymbols.forEach(symbol => allSymbols.add(symbol));
    }
    return allSymbols;
  }

  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.quoteUpdateInterval) {
      clearInterval(this.quoteUpdateInterval);
      this.quoteUpdateInterval = null;
    }

    this.wss.close();
    this.isRunning = false;
  }
}

let wsService: WebSocketService | null = null;

export const initializeWebSocket = (server: Server): WebSocketService => {
  if (!wsService) {
    wsService = new WebSocketService(server);
  }
  return wsService;
};

export const getWebSocketService = (): WebSocketService | null => {
  return wsService;
};

