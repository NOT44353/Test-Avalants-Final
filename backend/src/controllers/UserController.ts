import { Request, Response } from 'express';
import { userService } from '../services/UserService';
import { PaginationQuery } from '../types';

export class UserController {
  /**
   * GET /api/users
   * Get paginated users with search, sort, and filter
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 50,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any || 'name',
        sortDir: req.query.sortDir as 'asc' | 'desc' || 'asc'
      };

      // Validate query parameters
      if (query.page < 1) {
        res.status(400).json({
          success: false,
          error: 'Page must be greater than 0'
        });
        return;
      }

      if (query.pageSize < 1 || query.pageSize > 200) {
        res.status(400).json({
          success: false,
          error: 'Page size must be between 1 and 200'
        });
        return;
      }

      const validSortBy = ['name', 'email', 'createdAt', 'orderTotal'];
      if (!validSortBy.includes(query.sortBy)) {
        res.status(400).json({
          success: false,
          error: `Invalid sortBy. Must be one of: ${validSortBy.join(', ')}`
        });
        return;
      }

      if (!['asc', 'desc'].includes(query.sortDir)) {
        res.status(400).json({
          success: false,
          error: 'Invalid sortDir. Must be "asc" or "desc"'
        });
        return;
      }

      const result = await userService.getUsers(query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/users/:id/orders
   * Get orders for a specific user
   */
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 50;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      if (page < 1) {
        res.status(400).json({
          success: false,
          error: 'Page must be greater than 0'
        });
        return;
      }

      if (pageSize < 1 || pageSize > 200) {
        res.status(400).json({
          success: false,
          error: 'Page size must be between 1 and 200'
        });
        return;
      }

      // Check if user exists
      const user = await userService.getUserById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const result = await userService.getUserOrders(id, page, pageSize);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/users/stats
   * Get user statistics
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await userService.getUserStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const userController = new UserController();

