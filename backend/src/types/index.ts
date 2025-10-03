// Base types
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  productId: number;
  amount: number;
  createdAt: string;
}

// Extended types for API responses
export interface UserRow extends User {
  orderCount: number;
  orderTotal: number;
}

export interface PaginationQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'orderTotal';
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Tree/Hierarchy types for Challenge 2
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

// Real-time types for Challenge 3
export interface Quote {
  symbol: string;
  price: number;
  ts: string;
}

export interface QuoteSnapshot {
  [symbol: string]: Quote;
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'pong';
  symbols?: string[];
  symbol?: string;
  price?: number;
  ts?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Seed data configuration
export interface SeedConfig {
  users: number;
  orders: number;
  products: number;
  breadth?: number;
  depth?: number;
}

