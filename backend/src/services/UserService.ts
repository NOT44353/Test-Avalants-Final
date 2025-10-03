import { dataStore } from '../models/DataStore';
import { PaginatedResponse, PaginationQuery, User, UserRow } from '../types';

export class UserService {
  /**
   * Get paginated users with search, sort, and filter
   */
  async getUsers(query: PaginationQuery): Promise<PaginatedResponse<UserRow>> {
    const {
      page = 1,
      pageSize = 50,
      search,
      sortBy = 'name',
      sortDir = 'asc'
    } = query;

    // Validate page size
    const maxPageSize = 200;
    const validPageSize = Math.min(Math.max(pageSize, 1), maxPageSize);
    const validPage = Math.max(page, 1);

    let userIds: number[];

    if (search && search.trim()) {
      // Search users
      userIds = dataStore.searchUsers(search.trim());
    } else {
      // Get all user IDs
      userIds = Array.from(dataStore.getAllUsers()).map(user => user.id);
    }

    // Convert to UserRow objects
    let userRows: UserRow[] = userIds
      .map(userId => dataStore.getUserRow(userId))
      .filter((user): user is UserRow => user !== undefined);

    // Sort users
    userRows = this.sortUsers(userRows, sortBy, sortDir);

    // Calculate pagination
    const total = userRows.length;
    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = startIndex + validPageSize;
    const paginatedUsers = userRows.slice(startIndex, endIndex);

    return {
      items: paginatedUsers,
      total,
      page: validPage,
      pageSize: validPageSize
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    return dataStore.getUser(id) || null;
  }

  /**
   * Get user row (with order totals) by ID
   */
  async getUserRowById(id: number): Promise<UserRow | null> {
    return dataStore.getUserRow(id) || null;
  }

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId: number, page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<any>> {
    const orders = dataStore.getOrdersByUserId(userId);
    const total = orders.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Enrich orders with product information
    const enrichedOrders = paginatedOrders.map(order => {
      const product = dataStore.getProduct(order.productId);
      return {
        ...order,
        product: product || null
      };
    });

    return {
      items: enrichedOrders,
      total,
      page,
      pageSize
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    const users = dataStore.getAllUsers();
    const totalUsers = users.length;

    let totalOrders = 0;
    let totalRevenue = 0;

    for (const user of users) {
      const orderTotal = dataStore.getUserOrderTotal(user.id);
      totalOrders += orderTotal.count;
      totalRevenue += orderTotal.total;
    }

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100
    };
  }

  /**
   * Sort users based on sortBy and sortDir
   */
  private sortUsers(users: UserRow[], sortBy: string, sortDir: 'asc' | 'desc'): UserRow[] {
    return users.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'orderTotal':
          aValue = a.orderTotal;
          bValue = b.orderTotal;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDir === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}

export const userService = new UserService();

