import { dataStore } from '../models/DataStore';
import { userService } from '../services/UserService';
import { Order, Product, User } from '../types';

describe('UserService', () => {
  beforeEach(() => {
    // Setup test data
    const users: User[] = [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', createdAt: '2023-01-01T00:00:00Z' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', createdAt: '2023-01-02T00:00:00Z' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', createdAt: '2023-01-03T00:00:00Z' }
    ];

    const products: Product[] = [
      { id: 1, name: 'Product A', price: 100 },
      { id: 2, name: 'Product B', price: 200 }
    ];

    users.forEach(user => dataStore.addUser(user));
    products.forEach(product => dataStore.addProduct(product));

    // Add orders
    const orders: Order[] = [
      { id: 1, userId: 1, productId: 1, amount: 100, createdAt: '2023-01-01T00:00:00Z' },
      { id: 2, userId: 1, productId: 2, amount: 200, createdAt: '2023-01-02T00:00:00Z' },
      { id: 3, userId: 2, productId: 1, amount: 150, createdAt: '2023-01-03T00:00:00Z' }
    ];

    orders.forEach(order => dataStore.addOrder(order));
  });

  describe('getUsers', () => {
    it('should return paginated users with order totals', async () => {
      const result = await userService.getUsers({
        page: 1,
        pageSize: 10
      });

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);

      // Check that order totals are included
      const alice = result.items.find(u => u.id === 1);
      expect(alice?.orderCount).toBe(2);
      expect(alice?.orderTotal).toBe(300);
    });

    it('should handle pagination correctly', async () => {
      const result = await userService.getUsers({
        page: 1,
        pageSize: 2
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
    });

    it('should search users by name', async () => {
      const result = await userService.getUsers({
        page: 1,
        pageSize: 10,
        search: 'alice'
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Alice Johnson');
    });

    it('should search users by email', async () => {
      const result = await userService.getUsers({
        page: 1,
        pageSize: 10,
        search: 'bob@example.com'
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Bob Smith');
    });

    it('should sort users by name', async () => {
      const result = await userService.getUsers({
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortDir: 'asc'
      });

      expect(result.items[0].name).toBe('Alice Johnson');
      expect(result.items[1].name).toBe('Bob Smith');
      expect(result.items[2].name).toBe('Charlie Brown');
    });

    it('should sort users by order total', async () => {
      const result = await userService.getUsers({
        page: 1,
        pageSize: 10,
        sortBy: 'orderTotal',
        sortDir: 'desc'
      });

      expect(result.items[0].orderTotal).toBe(300); // Alice
      expect(result.items[1].orderTotal).toBe(150); // Bob
      expect(result.items[2].orderTotal).toBe(0);   // Charlie
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = await userService.getUserById(1);
      expect(user?.name).toBe('Alice Johnson');
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById(999);
      expect(user).toBeNull();
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders with product information', async () => {
      const result = await userService.getUserOrders(1, 1, 10);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);

      const firstOrder = result.items[0];
      expect(firstOrder.userId).toBe(1);
      expect(firstOrder.product).toBeDefined();
      expect(firstOrder.product?.name).toBe('Product A');
    });

    it('should handle pagination for user orders', async () => {
      const result = await userService.getUserOrders(1, 1, 1);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });

  describe('getUserStats', () => {
    it('should return correct statistics', async () => {
      const stats = await userService.getUserStats();

      expect(stats.totalUsers).toBe(3);
      expect(stats.totalOrders).toBe(3);
      expect(stats.totalRevenue).toBe(450); // 100 + 200 + 150
      expect(stats.averageOrderValue).toBe(150); // 450 / 3
    });
  });
});

