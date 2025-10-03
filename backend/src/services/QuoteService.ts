import { dataStore } from '../models/DataStore';
import { Quote, QuoteSnapshot } from '../types';

export class QuoteService {
  /**
   * Get quote snapshot for multiple symbols
   */
  async getQuoteSnapshot(symbols: string[]): Promise<QuoteSnapshot> {
    const snapshot: QuoteSnapshot = {};

    for (const symbol of symbols) {
      const quote = dataStore.getQuote(symbol);
      if (quote) {
        snapshot[symbol] = quote;
      }
    }

    return snapshot;
  }

  /**
   * Get all quotes
   */
  async getAllQuotes(): Promise<Quote[]> {
    return dataStore.getAllQuotes();
  }

  /**
   * Get quote for a specific symbol
   */
  async getQuote(symbol: string): Promise<Quote | null> {
    return dataStore.getQuote(symbol) || null;
  }

  /**
   * Update quote price
   */
  async updateQuote(symbol: string, price: number): Promise<Quote> {
    dataStore.updateQuote(symbol, price);
    return dataStore.getQuote(symbol)!;
  }

  /**
   * Get quote statistics
   */
  async getQuoteStats(): Promise<{
    totalSymbols: number;
    averagePrice: number;
    highestPrice: number;
    lowestPrice: number;
  }> {
    const quotes = dataStore.getAllQuotes();
    const totalSymbols = quotes.length;

    if (totalSymbols === 0) {
      return {
        totalSymbols: 0,
        averagePrice: 0,
        highestPrice: 0,
        lowestPrice: 0
      };
    }

    const prices = quotes.map(quote => quote.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / totalSymbols;
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);

    return {
      totalSymbols,
      averagePrice: Math.round(averagePrice * 100) / 100,
      highestPrice: Math.round(highestPrice * 100) / 100,
      lowestPrice: Math.round(lowestPrice * 100) / 100
    };
  }

  /**
   * Get price change for a symbol (requires historical data)
   * This is a simplified version - in production you'd store historical prices
   */
  async getPriceChange(symbol: string): Promise<{
    symbol: string;
    currentPrice: number;
    change: number;
    changePercent: number;
  } | null> {
    const quote = dataStore.getQuote(symbol);
    if (!quote) return null;

    // For demo purposes, generate a random change
    // In production, you'd calculate from historical data
    const change = (Math.random() - 0.5) * quote.price * 0.1; // ±5% change
    const changePercent = (change / quote.price) * 100;

    return {
      symbol,
      currentPrice: quote.price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100
    };
  }

  /**
   * Get top gainers and losers
   */
  async getTopMovers(limit: number = 10): Promise<{
    gainers: Array<{ symbol: string; price: number; change: number; changePercent: number }>;
    losers: Array<{ symbol: string; price: number; change: number; changePercent: number }>;
  }> {
    const quotes = dataStore.getAllQuotes();
    const movers = [];

    for (const quote of quotes) {
      const priceChange = await this.getPriceChange(quote.symbol);
      if (priceChange) {
        movers.push(priceChange);
      }
    }

    // Sort by change percent
    movers.sort((a, b) => b.changePercent - a.changePercent);

    return {
      gainers: movers.slice(0, limit),
      losers: movers.slice(-limit).reverse()
    };
  }
}

export const quoteService = new QuoteService();

