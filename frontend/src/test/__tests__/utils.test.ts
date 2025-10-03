import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatPercentage } from '../../utils/format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format negative numbers as currency', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with correct sign', () => {
      expect(formatPercentage(5.25)).toBe('+5.25%');
      expect(formatPercentage(-3.14)).toBe('-3.14%');
      expect(formatPercentage(0)).toBe('+0.00%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(5.1234, 1)).toBe('+5.1%');
      expect(formatPercentage(5.1234, 3)).toBe('+5.123%');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('Dec 25, 2023');
    });

    it('should format date strings', () => {
      expect(formatDate('2023-12-25')).toBe('Dec 25, 2023');
    });
  });
});

