import { Request, Response } from 'express';
import { quoteService } from '../services/QuoteService';

export class QuoteController {
  /**
   * GET /api/quotes/snapshot
   * Get quote snapshot for multiple symbols
   */
  async getQuoteSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const symbolsParam = req.query.symbols as string;

      if (!symbolsParam) {
        res.status(400).json({
          success: false,
          error: 'Symbols parameter is required'
        });
        return;
      }

      const symbols = symbolsParam.split(',').map(s => s.trim()).filter(s => s.length > 0);

      if (symbols.length === 0) {
        res.status(400).json({
          success: false,
          error: 'At least one symbol is required'
        });
        return;
      }

      if (symbols.length > 50) {
        res.status(400).json({
          success: false,
          error: 'Maximum 50 symbols allowed'
        });
        return;
      }

      const snapshot = await quoteService.getQuoteSnapshot(symbols);

      res.json({
        success: true,
        data: snapshot
      });
    } catch (error) {
      console.error('Error getting quote snapshot:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/quotes/:symbol
   * Get quote for a specific symbol
   */
  async getQuote(req: Request, res: Response): Promise<void> {
    try {
      const symbol = req.params.symbol;

      if (!symbol) {
        res.status(400).json({
          success: false,
          error: 'Symbol is required'
        });
        return;
      }

      const quote = await quoteService.getQuote(symbol);

      if (!quote) {
        res.status(404).json({
          success: false,
          error: 'Quote not found'
        });
        return;
      }

      res.json({
        success: true,
        data: quote
      });
    } catch (error) {
      console.error('Error getting quote:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/quotes
   * Get all quotes
   */
  async getAllQuotes(req: Request, res: Response): Promise<void> {
    try {
      const quotes = await quoteService.getAllQuotes();

      res.json({
        success: true,
        data: { items: quotes }
      });
    } catch (error) {
      console.error('Error getting all quotes:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/quotes/stats
   * Get quote statistics
   */
  async getQuoteStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await quoteService.getQuoteStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting quote stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/quotes/movers
   * Get top gainers and losers
   */
  async getTopMovers(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 50'
        });
        return;
      }

      const movers = await quoteService.getTopMovers(limit);

      res.json({
        success: true,
        data: movers
      });
    } catch (error) {
      console.error('Error getting top movers:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const quoteController = new QuoteController();

