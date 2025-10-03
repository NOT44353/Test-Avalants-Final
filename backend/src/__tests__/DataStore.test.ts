import { dataStore } from '../models/DataStore';
import { Node, Order, Product, User } from '../types';

describe('DataStore', () => {
  describe('User operations', () => {
    it('should add and retrieve users', () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2023-01-01T00:00:00Z'
      };

      dataStore.addUser(user);
      const retrieved = dataStore.getUser(1);

      expect(retrieved).toEqual(user);
      expect(dataStore.getUserCount()).toBe(1);
    });

    it('should search users by name', () => {
      const users: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01T00:00:00Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: '2023-01-02T00:00:00Z' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2023-01-03T00:00:00Z' }
      ];

      users.forEach(user => dataStore.addUser(user));

      const results = dataStore.searchUsers('john');
      expect(results).toContain(1);
      expect(results).toContain(3);
      expect(results).not.toContain(2);
    });

    it('should search users by email', () => {
      const users: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01T00:00:00Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@test.com', createdAt: '2023-01-02T00:00:00Z' }
      ];

      users.forEach(user => dataStore.addUser(user));

      const results = dataStore.searchUsers('example');
      expect(results).toContain(1);
      expect(results).not.toContain(2);
    });
  });

  describe('Order operations', () => {
    it('should add orders and update user totals', () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2023-01-01T00:00:00Z'
      };

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 100
      };

      dataStore.addUser(user);
      dataStore.addProduct(product);

      const order: Order = {
        id: 1,
        userId: 1,
        productId: 1,
        amount: 150,
        createdAt: '2023-01-01T00:00:00Z'
      };

      dataStore.addOrder(order);

      const userOrders = dataStore.getOrdersByUserId(1);
      expect(userOrders).toHaveLength(1);
      expect(userOrders[0]).toEqual(order);

      const orderTotal = dataStore.getUserOrderTotal(1);
      expect(orderTotal.count).toBe(1);
      expect(orderTotal.total).toBe(150);
    });

    it('should calculate user row with order totals', () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2023-01-01T00:00:00Z'
      };

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 100
      };

      dataStore.addUser(user);
      dataStore.addProduct(product);

      const orders: Order[] = [
        { id: 1, userId: 1, productId: 1, amount: 100, createdAt: '2023-01-01T00:00:00Z' },
        { id: 2, userId: 1, productId: 1, amount: 200, createdAt: '2023-01-02T00:00:00Z' }
      ];

      orders.forEach(order => dataStore.addOrder(order));

      const userRow = dataStore.getUserRow(1);
      expect(userRow).toEqual({
        ...user,
        orderCount: 2,
        orderTotal: 300
      });
    });
  });

  describe('Node operations', () => {
    it('should add nodes and build hierarchy', () => {
      const nodes: Node[] = [
        { id: '1', parentId: null, name: 'Root', hasChildren: true },
        { id: '2', parentId: '1', name: 'Child 1', hasChildren: false },
        { id: '3', parentId: '1', name: 'Child 2', hasChildren: false }
      ];

      nodes.forEach(node => dataStore.addNode(node));

      const rootNodes = dataStore.getRootNodes();
      expect(rootNodes).toHaveLength(1);
      expect(rootNodes[0].id).toBe('1');

      const children = dataStore.getNodeChildren('1');
      expect(children).toHaveLength(2);
      expect(children.map(c => c.id)).toEqual(['2', '3']);
    });

    it('should build correct node paths', () => {
      const nodes: Node[] = [
        { id: '1', parentId: null, name: 'Root', hasChildren: true },
        { id: '2', parentId: '1', name: 'Level 1', hasChildren: true },
        { id: '3', parentId: '2', name: 'Level 2', hasChildren: false }
      ];

      nodes.forEach(node => dataStore.addNode(node));

      const path = dataStore.getNodePath('3');
      expect(path).toEqual([
        { id: '1', name: 'Root' },
        { id: '2', name: 'Level 1' },
        { id: '3', name: 'Level 2' }
      ]);
    });

    it('should search nodes by name', () => {
      const nodes: Node[] = [
        { id: '1', parentId: null, name: 'Engineering', hasChildren: true },
        { id: '2', parentId: '1', name: 'Frontend Team', hasChildren: false },
        { id: '3', parentId: '1', name: 'Backend Team', hasChildren: false }
      ];

      nodes.forEach(node => dataStore.addNode(node));

      const results = dataStore.searchNodes('team');
      expect(results).toContain('2');
      expect(results).toContain('3');
      expect(results).not.toContain('1');
    });
  });

  describe('Quote operations', () => {
    it('should update and retrieve quotes', () => {
      dataStore.updateQuote('AAPL', 150.25);
      dataStore.updateQuote('MSFT', 300.50);

      const aaplQuote = dataStore.getQuote('AAPL');
      expect(aaplQuote?.symbol).toBe('AAPL');
      expect(aaplQuote?.price).toBe(150.25);

      const allQuotes = dataStore.getAllQuotes();
      expect(allQuotes).toHaveLength(2);
    });
  });

  describe('Clear operations', () => {
    it('should clear all data', () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2023-01-01T00:00:00Z'
      };

      dataStore.addUser(user);
      dataStore.updateQuote('AAPL', 150.25);

      expect(dataStore.getUserCount()).toBe(1);
      expect(dataStore.getAllQuotes()).toHaveLength(1);

      dataStore.clear();

      expect(dataStore.getUserCount()).toBe(0);
      expect(dataStore.getAllQuotes()).toHaveLength(0);
    });
  });
});

