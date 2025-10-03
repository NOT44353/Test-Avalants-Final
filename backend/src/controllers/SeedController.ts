import { Request, Response } from 'express';
import { seedData } from '../scripts/seed';

export class SeedController {
  /**
   * POST /dev/seed
   * Seed the database with test data
   */
  async seedData(req: Request, res: Response): Promise<void> {
    try {
      const {
        users = 50000,
        orders = 500000,
        products = 10000,
        breadth = 20,
        depth = 10,
        symbols = 'AAPL,MSFT,GOOG,AMZN,TSLA,META,NVDA,NFLX,AMD,INTC'
      } = req.query;

      // Validate parameters
      const userCount = Math.min(parseInt(users as string) || 50000, 100000);
      const orderCount = Math.min(parseInt(orders as string) || 500000, 1000000);
      const productCount = Math.min(parseInt(products as string) || 10000, 50000);
      const breadthCount = Math.min(parseInt(breadth as string) || 20, 50);
      const depthCount = Math.min(parseInt(depth as string) || 10, 15);
      const symbolList = (symbols as string).split(',').map(s => s.trim()).filter(s => s.length > 0);

      console.log('Starting data seeding with parameters:', {
        users: userCount,
        orders: orderCount,
        products: productCount,
        breadth: breadthCount,
        depth: depthCount,
        symbols: symbolList.length
      });

      const startTime = Date.now();

      const result = await seedData({
        users: userCount,
        orders: orderCount,
        products: productCount,
        breadth: breadthCount,
        depth: depthCount,
        symbols: symbolList
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Data seeding completed in ${duration}ms`);

      res.json({
        success: true,
        data: {
          ...result,
          duration: `${duration}ms`,
          message: 'Data seeded successfully'
        }
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to seed data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /dev/seed
   * Clear all seeded data
   */
  async clearData(req: Request, res: Response): Promise<void> {
    try {
      const { dataStore } = await import('../models/DataStore');
      dataStore.clear();

      res.json({
        success: true,
        data: {
          message: 'All data cleared successfully'
        }
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /dev/seed/status
   * Get current data status
   */
  async getSeedStatus(req: Request, res: Response): Promise<void> {
    try {
      const { dataStore } = await import('../models/DataStore');

      const status = {
        users: dataStore.getUserCount(),
        products: dataStore.getProductCount(),
        orders: dataStore.getOrderCount(),
        nodes: dataStore.getNodeCount(),
        quotes: dataStore.getAllQuotes().length
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting seed status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get seed status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const seedController = new SeedController();

