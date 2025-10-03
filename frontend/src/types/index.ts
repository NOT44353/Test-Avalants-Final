// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserRow extends User {
  orderCount: number;
  orderTotal: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'orderTotal';
  sortDir?: 'asc' | 'desc';
}

// Node types
export interface Node {
  id: string;
  parentId: string | null;
  name: string;
  hasChildren: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  path: Array<{ id: string; name: string }>;
}

// Quote types
export interface Quote {
  symbol: string;
  price: number;
  ts: string;
}

export interface QuoteSnapshot {
  [symbol: string]: Quote;
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'pong' | 'quotes' | 'error';
  symbols?: string[];
  quotes?: Quote[];
  error?: string;
  ts?: string;
}

// UI types
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string | number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    current?: number;
    page?: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortDir: 'asc' | 'desc';
    onChange: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}

// Chart types
export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// WebSocket connection state
export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  subscribedSymbols: string[];
  quotes?: Quote[];
}

