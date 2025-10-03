import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, Node, PaginatedResponse, Quote, QuoteSnapshot, SearchResult, User, UserRow } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // User API methods
  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<UserRow>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<UserRow>>>('/api/users', { params });
    return response.data.data!;
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>(`/api/users/${id}`);
    return response.data.data!;
  }

  async getUserOrders(userId: number, page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<any>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<any>>>(`/api/users/${userId}/orders`, {
      params: { page, pageSize }
    });
    return response.data.data!;
  }

  async getUserStats(): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/api/users/stats');
    return response.data.data!;
  }

  // Node API methods
  async getNodes(): Promise<{ data: { items: Node[] } }> {
    const response = await this.api.get<ApiResponse<{ items: Node[] }>>('/api/nodes/root');
    return { data: { items: response.data.data!.items } };
  }

  async getRootNodes(): Promise<Node[]> {
    const response = await this.api.get<ApiResponse<{ items: Node[] }>>('/api/nodes/root');
    return response.data.data!.items;
  }

  async getNodeChildren(nodeId: string): Promise<{ data: { items: Node[] } }> {
    const response = await this.api.get<ApiResponse<{ items: Node[] }>>(`/api/nodes/${nodeId}/children`);
    return { data: { items: response.data.data!.items } };
  }

  async getNodeById(nodeId: string): Promise<Node> {
    const response = await this.api.get<ApiResponse<Node>>(`/api/nodes/${nodeId}`);
    return response.data.data!;
  }

  async searchNodes(query: string, limit: number = 100): Promise<{ data: { items: SearchResult[] } }> {
    const response = await this.api.get<ApiResponse<{ items: SearchResult[] }>>('/api/search', {
      params: { q: query, limit }
    });
    return { data: { items: response.data.data!.items } };
  }

  async getBreadcrumb(nodeId: string): Promise<Array<{ id: string; name: string }>> {
    const response = await this.api.get<ApiResponse<{ breadcrumb: Array<{ id: string; name: string }> }>>(`/api/nodes/${nodeId}/breadcrumb`);
    return response.data.data!.breadcrumb;
  }

  // Quote API methods
  async getQuoteSnapshot(symbols: string[]): Promise<QuoteSnapshot> {
    const response = await this.api.get<ApiResponse<QuoteSnapshot>>('/api/quotes/snapshot', {
      params: { symbols: symbols.join(',') }
    });
    return response.data.data!;
  }

  async getQuote(symbol: string): Promise<Quote> {
    const response = await this.api.get<ApiResponse<Quote>>(`/api/quotes/${symbol}`);
    return response.data.data!;
  }

  async getAllQuotes(): Promise<Quote[]> {
    const response = await this.api.get<ApiResponse<{ items: Quote[] }>>('/api/quotes');
    return response.data.data!.items;
  }

  async getQuoteStats(): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/api/quotes/stats');
    return response.data.data!;
  }

  async getTopMovers(limit: number = 10): Promise<{
    gainers: Array<{ symbol: string; price: number; change: number; changePercent: number }>;
    losers: Array<{ symbol: string; price: number; change: number; changePercent: number }>;
  }> {
    const response = await this.api.get<ApiResponse<any>>('/api/quotes/movers', {
      params: { limit }
    });
    return response.data.data!;
  }

  // Seed/Development API methods
  async seedData(config: {
    users?: number;
    orders?: number;
    products?: number;
    breadth?: number;
    depth?: number;
    symbols?: string;
  } = {}): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>('/dev/seed', null, { params: config });
    return response.data.data!;
  }

  async seedNodes(breadth: number, depth: number): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>('/dev/seed', null, {
      params: { breadth, depth }
    });
    return response.data.data!;
  }

  async clearData(): Promise<any> {
    const response = await this.api.delete<ApiResponse<any>>('/dev/seed');
    return response.data.data!;
  }

  async getSeedStatus(): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/dev/seed/status');
    return response.data.data!;
  }

  // Health check
  async getHealth(): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/health');
    return response.data.data!;
  }
}

export const apiService = new ApiService();

