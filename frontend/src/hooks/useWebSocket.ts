import { useCallback, useEffect, useRef, useState } from 'react';
import { wsService } from '../services/websocket';
import { Quote, WebSocketState } from '../types';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

export interface UseWebSocketReturn {
  state: WebSocketState;
  quotes: Quote[];
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  isConnected: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, reconnectOnMount = true } = options;

  const [state, setState] = useState<WebSocketState>(wsService.getState());
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const isConnectedRef = useRef(false);

  const connect = useCallback(async () => {
    try {
      await wsService.connect();
      isConnectedRef.current = true;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      isConnectedRef.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
    isConnectedRef.current = false;
  }, []);

  const subscribe = useCallback((symbols: string[]) => {
    wsService.subscribe(symbols);
  }, []);

  const unsubscribe = useCallback((symbols: string[]) => {
    wsService.unsubscribe(symbols);
  }, []);

  useEffect(() => {
    // Subscribe to WebSocket state changes
    const unsubscribeState = wsService.subscribeToState((newState) => {
      setState(newState);
      isConnectedRef.current = newState.connected;
    });

    // Subscribe to quote updates
    const unsubscribeQuotes = wsService.subscribeToQuotes((newQuotes) => {
      setQuotes(newQuotes);
    });

    // Auto-connect if enabled
    if (autoConnect && !isConnectedRef.current) {
      connect();
    }

    return () => {
      unsubscribeState();
      unsubscribeQuotes();
      if (reconnectOnMount) {
        disconnect();
      }
    };
  }, [autoConnect, reconnectOnMount, connect, disconnect]);

  return {
    state,
    quotes,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    isConnected: isConnectedRef.current
  };
}

