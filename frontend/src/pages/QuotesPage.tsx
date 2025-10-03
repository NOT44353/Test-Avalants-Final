import { Loader2, TrendingDown, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DataTable } from '../components/DataTable';
import { useWebSocket } from '../hooks/useWebSocket';
import { Quote, TableColumn } from '../types';
import { formatCurrency, formatPercentage } from '../utils/format';

const defaultSymbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'];

const quoteColumns: TableColumn<Quote & { change?: number; changePercent?: number }>[] = [
  {
    key: 'symbol',
    title: 'Symbol',
    width: '20'
  },
  {
    key: 'price',
    title: 'Price',
    width: '30',
    render: (value: number) => (
      <span className="font-mono font-medium">
        {formatCurrency(value)}
      </span>
    )
  },
  {
    key: 'change',
    title: 'Change',
    width: '25',
    render: (value: number, item: any) => {
      if (value === undefined) return '-';
      const isPositive = value >= 0;
      return (
        <span className={`inline-flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {formatCurrency(Math.abs(value))}
        </span>
      );
    }
  },
  {
    key: 'changePercent',
    title: 'Change %',
    width: '25',
    render: (value: number) => {
      if (value === undefined) return '-';
      const isPositive = value >= 0;
      return (
        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercentage(value)}
        </span>
      );
    }
  }
];

export function QuotesPage() {
  const [symbols, setSymbols] = useState<string[]>(defaultSymbols);
  const [quotes, setQuotes] = useState<(Quote & { change?: number; changePercent?: number })[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [previousPrices, setPreviousPrices] = useState<Map<string, number>>(new Map());

  const { state, connect, disconnect, subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: true
  });

  // Subscribe to symbols when connected
  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      subscribe(symbols);
    }
  }, [isConnected, symbols, subscribe]);

  // Update quotes and calculate changes
  useEffect(() => {
    if (state.quotes && state.quotes.length > 0) {
      const updatedQuotes = state.quotes.map(quote => {
        const previousPrice = previousPrices.get(quote.symbol);
        const change = previousPrice ? quote.price - previousPrice : 0;
        const changePercent = previousPrice ? (change / previousPrice) * 100 : 0;

        return {
          ...quote,
          change,
          changePercent
        };
      });

      setQuotes(updatedQuotes);

      // Update previous prices
      const newPreviousPrices = new Map(previousPrices);
      state.quotes?.forEach(quote => {
        newPreviousPrices.set(quote.symbol, quote.price);
      });
      setPreviousPrices(newPreviousPrices);

      // Update chart data
      setChartData(prev => {
        const newData = [...prev];
        const now = new Date().toLocaleTimeString();

        state.quotes?.forEach(quote => {
          const existingIndex = newData.findIndex(item => item.symbol === quote.symbol);
          if (existingIndex >= 0) {
            newData[existingIndex] = {
              ...newData[existingIndex],
              [quote.symbol]: quote.price,
              timestamp: now
            };
          } else {
            newData.push({
              symbol: quote.symbol,
              [quote.symbol]: quote.price,
              timestamp: now
            });
          }
        });

        // Keep only last 20 data points
        return newData.slice(-20);
      });
    }
  }, [state.quotes, previousPrices]);

  const handleSymbolChange = (value: string) => {
    const newSymbols = value.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
    setSymbols(newSymbols);

    if (isConnected) {
      // Unsubscribe from old symbols and subscribe to new ones
      const oldSymbols = quotes.map(q => q.symbol);
      const symbolsToUnsubscribe = oldSymbols.filter(s => !newSymbols.includes(s));
      const symbolsToSubscribe = newSymbols.filter(s => !oldSymbols.includes(s));

      if (symbolsToUnsubscribe.length > 0) {
        unsubscribe(symbolsToUnsubscribe);
      }
      if (symbolsToSubscribe.length > 0) {
        subscribe(symbolsToSubscribe);
      }
    }
  };

  const handleConnect = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="quotes-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-time Quotes</h1>
              <p className="mt-2 text-gray-600">
                Live stock quotes with real-time updates via WebSocket
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={handleConnect}
                disabled={state.connecting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {state.connecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isConnected ? (
                  <WifiOff className="w-4 h-4 mr-2" />
                ) : (
                  <Wifi className="w-4 h-4 mr-2" />
                )}
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="symbols" className="block text-sm font-medium text-gray-700 mb-2">
                Symbols (comma-separated)
              </label>
              <input
                type="text"
                id="symbols"
                value={symbols.join(', ')}
                onChange={(e) => handleSymbolChange(e.target.value)}
                placeholder="AAPL, MSFT, GOOG"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                <p>Subscribed: {state.subscribedSymbols.join(', ') || 'None'}</p>
                <p>Updates: {quotes.length} symbols</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Price Chart</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  {symbols.map((symbol, index) => (
                    <Line
                      key={symbol}
                      type="monotone"
                      dataKey={symbol}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quotes Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Live Quotes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {quotes.length > 0 ? `Showing ${quotes.length} symbols` : 'No data available'}
            </p>
          </div>

          <div className="p-6">
            <DataTable
              data={quotes}
              columns={quoteColumns}
              loading={state.connecting}
              error={state.error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

