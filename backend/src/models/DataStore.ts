import { Node, Order, Product, Quote, User } from '../types';

/**
 * In-memory data store for all challenges
 * Optimized for performance with precomputed indexes and aggregations
 */
export class DataStore {
  private users: Map<number, User> = new Map();
  private products: Map<number, Product> = new Map();
  private orders: Map<number, Order> = new Map();
  private nodes: Map<string, Node> = new Map();
  private quotes: Map<string, Quote> = new Map();

  // Precomputed indexes for performance
  private userOrdersIndex: Map<number, Order[]> = new Map();
  private userOrderTotals: Map<number, { count: number; total: number }> = new Map();
  private productOrdersIndex: Map<number, Order[]> = new Map();
  private nodeChildrenIndex: Map<string, Node[]> = new Map();
  private nodeParentIndex: Map<string, string | null> = new Map();

  // Search indexes
  private userSearchIndex: Map<string, Set<number>> = new Map();
  private nodeSearchIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeSearchIndexes();
  }

  private initializeSearchIndexes(): void {
    // Initialize search indexes with empty sets
    this.userSearchIndex.set('name', new Set());
    this.userSearchIndex.set('email', new Set());
    this.nodeSearchIndex.set('name', new Set());
  }

  // User operations
  addUser(user: User): void {
    this.users.set(user.id, user);
    this.updateUserSearchIndex(user);
    this.userOrderTotals.set(user.id, { count: 0, total: 0 });
  }

  getUser(id: number): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }

  // Product operations
  addProduct(product: Product): void {
    this.products.set(product.id, product);
  }

  getProduct(id: number): Product | undefined {
    return this.products.get(id);
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductCount(): number {
    return this.products.size;
  }

  // Order operations
  addOrder(order: Order): void {
    this.orders.set(order.id, order);
    this.updateOrderIndexes(order);
  }

  getOrder(id: number): Order | undefined {
    return this.orders.get(id);
  }

  getOrdersByUserId(userId: number): Order[] {
    return this.userOrdersIndex.get(userId) || [];
  }

  getOrderCount(): number {
    return this.orders.size;
  }

  // Node operations
  addNode(node: Node): void {
    this.nodes.set(node.id, node);
    this.updateNodeIndexes(node);
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  getRootNodes(): Node[] {
    return Array.from(this.nodes.values()).filter(node => node.parentId === null);
  }

  getNodeChildren(nodeId: string): Node[] {
    return this.nodeChildrenIndex.get(nodeId) || [];
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  // Quote operations
  updateQuote(symbol: string, price: number): void {
    const quote: Quote = {
      symbol,
      price,
      ts: new Date().toISOString()
    };
    this.quotes.set(symbol, quote);
  }

  getQuote(symbol: string): Quote | undefined {
    return this.quotes.get(symbol);
  }

  getAllQuotes(): Quote[] {
    return Array.from(this.quotes.values());
  }

  // Search operations
  searchUsers(query: string): number[] {
    const results = new Set<number>();
    const lowerQuery = query.toLowerCase();

    // Search in names
    for (const [word, userIds] of this.userSearchIndex) {
      if (word.includes(lowerQuery) || lowerQuery.includes(word)) {
        for (const userId of userIds) {
          const user = this.users.get(userId);
          if (user && (user.name.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery))) {
            results.add(userId);
          }
        }
      }
    }

    return Array.from(results);
  }

  searchNodes(query: string): string[] {
    const results = new Set<string>();
    const lowerQuery = query.toLowerCase();

    for (const [word, nodeIds] of this.nodeSearchIndex) {
      if (word.includes(lowerQuery) || lowerQuery.includes(word)) {
        for (const nodeId of nodeIds) {
          const node = this.nodes.get(nodeId);
          if (node && node.name.toLowerCase().includes(lowerQuery)) {
            results.add(nodeId);
          }
        }
      }
    }

    return Array.from(results);
  }

  // Aggregation operations
  getUserOrderTotal(userId: number): { count: number; total: number } {
    return this.userOrderTotals.get(userId) || { count: 0, total: 0 };
  }

  getUserRow(userId: number): (User & { orderCount: number; orderTotal: number }) | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const orderTotal = this.userOrderTotals.get(userId) || { count: 0, total: 0 };
    return {
      ...user,
      orderCount: orderTotal.count,
      orderTotal: orderTotal.total
    };
  }

  getNodePath(nodeId: string): Array<{ id: string; name: string }> {
    const path: Array<{ id: string; name: string }> = [];
    let currentId: string | null = nodeId;

    while (currentId) {
      const node = this.nodes.get(currentId);
      if (!node) break;

      path.unshift({ id: node.id, name: node.name });
      currentId = node.parentId;
    }

    return path;
  }

  // Private helper methods
  private updateUserSearchIndex(user: User): void {
    // Add to name search index
    const nameWords = user.name.toLowerCase().split(/\s+/);
    for (const word of nameWords) {
      if (!this.userSearchIndex.has(word)) {
        this.userSearchIndex.set(word, new Set());
      }
      this.userSearchIndex.get(word)!.add(user.id);
    }

    // Add to email search index
    const emailWords = user.email.toLowerCase().split(/[@.]/);
    for (const word of emailWords) {
      if (!this.userSearchIndex.has(word)) {
        this.userSearchIndex.set(word, new Set());
      }
      this.userSearchIndex.get(word)!.add(user.id);
    }
  }

  private updateOrderIndexes(order: Order): void {
    // Update user orders index
    if (!this.userOrdersIndex.has(order.userId)) {
      this.userOrdersIndex.set(order.userId, []);
    }
    this.userOrdersIndex.get(order.userId)!.push(order);

    // Update product orders index
    if (!this.productOrdersIndex.has(order.productId)) {
      this.productOrdersIndex.set(order.productId, []);
    }
    this.productOrdersIndex.get(order.productId)!.push(order);

    // Update user order totals
    const current = this.userOrderTotals.get(order.userId) || { count: 0, total: 0 };
    this.userOrderTotals.set(order.userId, {
      count: current.count + 1,
      total: current.total + order.amount
    });
  }

  private updateNodeIndexes(node: Node): void {
    // Update parent index
    this.nodeParentIndex.set(node.id, node.parentId);

    // Update children index
    if (node.parentId) {
      if (!this.nodeChildrenIndex.has(node.parentId)) {
        this.nodeChildrenIndex.set(node.parentId, []);
      }
      this.nodeChildrenIndex.get(node.parentId)!.push(node);
    }

    // Update search index
    const nameWords = node.name.toLowerCase().split(/\s+/);
    for (const word of nameWords) {
      if (!this.nodeSearchIndex.has(word)) {
        this.nodeSearchIndex.set(word, new Set());
      }
      this.nodeSearchIndex.get(word)!.add(node.id);
    }
  }

  // Clear all data (for testing)
  clear(): void {
    this.users.clear();
    this.products.clear();
    this.orders.clear();
    this.nodes.clear();
    this.quotes.clear();
    this.userOrdersIndex.clear();
    this.userOrderTotals.clear();
    this.productOrdersIndex.clear();
    this.nodeChildrenIndex.clear();
    this.nodeParentIndex.clear();
    this.userSearchIndex.clear();
    this.nodeSearchIndex.clear();
    this.initializeSearchIndexes();
  }
}

// Singleton instance
export const dataStore = new DataStore();

