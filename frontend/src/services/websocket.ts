import { Quote, WebSocketMessage, WebSocketState } from '../types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(state: WebSocketState) => void> = new Set();
  private quoteSubscribers: Set<(quotes: Quote[]) => void> = new Set();
  private state: WebSocketState = {
    connected: false,
    connecting: false,
    error: null,
    subscribedSymbols: []
  };

  constructor() {
    this.url = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3001/ws/quotes';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.state.connecting = true;
      this.state.error = null;
      this.notifySubscribers();

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.state.connected = true;
          this.state.connecting = false;
          this.state.error = null;
          this.reconnectAttempts = 0;
          this.notifySubscribers();
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.state.connected = false;
          this.state.connecting = false;
          this.notifySubscribers();
          this.stopHeartbeat();

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.state.error = 'Connection error';
          this.state.connecting = false;
          this.notifySubscribers();
          reject(error);
        };

      } catch (error) {
        this.state.connecting = false;
        this.state.error = 'Failed to connect';
        this.notifySubscribers();
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.state.connected = false;
    this.state.connecting = false;
    this.state.subscribedSymbols = [];
    this.notifySubscribers();
  }

  subscribe(symbols: string[]): void {
    if (!this.state.connected || !this.ws) {
      console.warn('WebSocket not connected, cannot subscribe');
      return;
    }

    const message: WebSocketMessage = {
      type: 'subscribe',
      symbols
    };

    this.ws.send(JSON.stringify(message));
    this.state.subscribedSymbols = [...new Set([...this.state.subscribedSymbols, ...symbols])];
    this.notifySubscribers();
  }

  unsubscribe(symbols: string[]): void {
    if (!this.state.connected || !this.ws) {
      console.warn('WebSocket not connected, cannot unsubscribe');
      return;
    }

    const message: WebSocketMessage = {
      type: 'unsubscribe',
      symbols
    };

    this.ws.send(JSON.stringify(message));
    this.state.subscribedSymbols = this.state.subscribedSymbols.filter(
      symbol => !symbols.includes(symbol)
    );
    this.notifySubscribers();
  }

  subscribeToState(callback: (state: WebSocketState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  subscribeToQuotes(callback: (quotes: Quote[]) => void): () => void {
    this.quoteSubscribers.add(callback);
    return () => this.quoteSubscribers.delete(callback);
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'quotes':
        if (message.quotes) {
          this.quoteSubscribers.forEach(callback => callback(message.quotes!));
        }
        break;

      case 'pong':
        // Heartbeat response
        break;

      case 'error':
        console.error('WebSocket server error:', message.error);
        this.state.error = message.error || 'Unknown error';
        this.notifySubscribers();
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }

  getState(): WebSocketState {
    return { ...this.state };
  }

  isConnected(): boolean {
    return this.state.connected && this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();

