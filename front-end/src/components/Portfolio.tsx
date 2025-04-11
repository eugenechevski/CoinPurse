import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Holding {
  ticker: string;
  currentPrice: number;
  change: number;
  shares: number;
}

const AdvancedChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Generate a unique container id per instance.
  const uniqueId = useRef(`tradingview_${symbol}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = uniqueId.current;
    }

    const loadWidget = () => {
      // Delay execution briefly to ensure container is fully rendered.
      setTimeout(() => {
        try {
          if ((window as any).TradingView && containerRef.current) {
            new (window as any).TradingView.widget({
              width: "100%",
              height: "600",
              symbol: `NASDAQ:${symbol}`, // Adjust exchange prefix if needed.
              interval: "D",
              timezone: "Etc/UTC",
              theme: "dark",
              style: "1",
              locale: "en",
              toolbar_bg: "#1a1a1a",
              enable_publishing: false,
              allow_symbol_change: true,
              container_id: uniqueId.current,
            });
          }
        } catch (e) {
          console.error("Error loading TradingView widget for", symbol, e);
        }
      }, 100); // 100ms delay
    };

    // Load the TradingView script if not already loaded.
    if (!(window as any).TradingView) {
      if (!document.getElementById("tradingview-script")) {
        const script = document.createElement("script");
        script.id = "tradingview-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = loadWidget;
        document.body.appendChild(script);
      }
    } else {
      loadWidget();
    }
  }, [symbol]);

  return <div ref={containerRef} className="tradingview-widget-container mt-4" />;
};

const Portfolio: React.FC = () => {
  // Sidebar state.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Track which holding's trade menu is open.
  const [tradeAction, setTradeAction] = useState<{ ticker: string; type: 'buy' | 'sell' } | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<number>(0);
  const [tradeError, setTradeError] = useState<string>('');
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);

  // Placeholder portfolio stats.
  const [totalValue, setTotalValue] = useState(0);
  const [change, setChange] = useState(0);
  const [uninvestedCash, setUninvestedCash] = useState(0);

  // Sample holdings.
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: 'TSLA', currentPrice: 100.0, change: -10.0, shares: 2 },
    { ticker: 'AAPL', currentPrice: 150.0, change: 5.0, shares: 4 },
  ]);

  // Expanded chart state.
  const [expandedHoldings, setExpandedHoldings] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Simulate fetching stats.
    setTimeout(() => {
      setTotalValue(600.0);
      setChange(-40.0);
      setUninvestedCash(200.0);
    }, 500);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleChart = (ticker: string) => setExpandedHoldings(prev => ({ ...prev, [ticker]: !prev[ticker] }));

  const openTradeMenu = (ticker: string, type: 'buy' | 'sell') => {
    setTradeAction({ ticker, type });
    setTradeQuantity(0);
    setTradeError('');
  };

  const closeTradeMenu = () => {
    setTradeAction(null);
    setTradeQuantity(0);
    setTradeError('');
  };

  const executeTrade = async (holding: Holding) => {
    setTradeError('');
    const apiUrl = import.meta.env.VITE_API_URL;
    const cost = tradeQuantity * holding.currentPrice;

    if (tradeAction?.type === 'buy') {
      if (cost > uninvestedCash) {
        setTradeError("Insufficient funds.");
        return;
      }
    } else if (tradeAction?.type === 'sell') {
      if (tradeQuantity > holding.shares) {
        setTradeError("Insufficient shares.");
        return;
      }
    }

    setTradeLoading(true);
    try {
      const endpoint = tradeAction?.type === 'buy' ? "/api/portfolio/buy" : "/api/portfolio/sell";
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: holding.ticker, quantity: tradeQuantity })
      });
      const res = await response.json();
      if (res.error) {
        setTradeError(res.error);
      } else {
        setHoldings(prev =>
          prev.map(h => 
            h.ticker === holding.ticker 
              ? tradeAction!.type === "buy" 
                ? { ...h, shares: h.shares + tradeQuantity } 
                : { ...h, shares: h.shares - tradeQuantity } 
              : h
          )
        );
        if (tradeAction?.type === 'buy') {
          setUninvestedCash(prev => prev - cost);
        } else {
          setUninvestedCash(prev => prev + cost);
        }
        closeTradeMenu();
      }
    } catch (error: any) {
      setTradeError("Trade failed. Please try again.");
    }
    setTradeLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Top bar */}
      <div className="bg-gray-900 p-4 flex items-center">
        <button onClick={toggleSidebar} className="text-white mr-4 text-2xl focus:outline-none">
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <h1 className="text-2xl font-bold">My Portfolio</h1>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20" onClick={toggleSidebar}>
          <div 
            className="absolute top-0 left-0 h-full w-64 bg-gray-900 p-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button onClick={toggleSidebar} className="text-white text-2xl focus:outline-none">
                ✕
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/search" 
                className="block w-full text-center py-2 rounded bg-gray-800 hover:bg-green-600 transition"
                onClick={toggleSidebar}
              >
                Search
              </Link>
              <Link 
                to="/portfolio" 
                className="block w-full text-center py-2 rounded bg-gray-800 hover:bg-green-600 transition"
                onClick={toggleSidebar}
              >
                Portfolio
              </Link>
              <Link 
                to="/account" 
                className="block w-full text-center py-2 rounded bg-gray-800 hover:bg-green-600 transition"
                onClick={toggleSidebar}
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Total Value</h3>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Change</h3>
            <p className={`text-2xl font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Uninvested Cash</h3>
            <p className="text-2xl font-bold">${uninvestedCash.toFixed(2)}</p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Shares</th>
                <th className="py-3 px-4">Chart</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <React.Fragment key={holding.ticker}>
                  <tr className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 font-medium">{holding.ticker}</td>
                    <td className="py-3 px-4">${holding.currentPrice.toFixed(2)}</td>
                    <td className={`py-3 px-4 ${holding.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">{holding.shares}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleChart(holding.ticker)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
                      >
                        {expandedHoldings[holding.ticker] ? 'Hide Chart' : 'View Chart'}
                      </button>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button
                        onClick={() => openTradeMenu(holding.ticker, "buy")}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm transition"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => openTradeMenu(holding.ticker, "sell")}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                  {tradeAction && tradeAction.ticker === holding.ticker && (
                    <tr className="border-t border-gray-800 bg-gray-800">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="flex flex-col space-y-2">
                          {tradeAction.type === "buy" ? (
                            <>
                              <div className="font-semibold">Buy {holding.ticker}</div>
                              <div>Available Funds: ${uninvestedCash.toFixed(2)}</div>
                              <div>Current Price: ${holding.currentPrice.toFixed(2)}</div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={tradeQuantity}
                                  onChange={(e) => setTradeQuantity(Number(e.target.value))}
                                  className="w-24 p-2 bg-gray-700 rounded"
                                  min={0}
                                />
                                <span>shares</span>
                              </div>
                              <div>Cost: ${(tradeQuantity * holding.currentPrice).toFixed(2)}</div>
                              {tradeError && <div className="text-red-500 text-sm">{tradeError}</div>}
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() => executeTrade(holding)}
                                  disabled={tradeLoading}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
                                >
                                  {tradeLoading ? "Processing..." : "Confirm"}
                                </button>
                                <button
                                  onClick={closeTradeMenu}
                                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-semibold">Sell {holding.ticker}</div>
                              <div>Shares Owned: {holding.shares}</div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={tradeQuantity}
                                  onChange={(e) => setTradeQuantity(Number(e.target.value))}
                                  className="w-24 p-2 bg-gray-700 rounded"
                                  min={0}
                                />
                                <span>shares</span>
                              </div>
                              <div>Proceeds: ${(tradeQuantity * holding.currentPrice).toFixed(2)}</div>
                              {tradeError && <div className="text-red-500 text-sm">{tradeError}</div>}
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() => executeTrade(holding)}
                                  disabled={tradeLoading}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
                                >
                                  {tradeLoading ? "Processing..." : "Confirm"}
                                </button>
                                <button
                                  onClick={closeTradeMenu}
                                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  {expandedHoldings[holding.ticker] && (
                    <tr className="border-t border-gray-800">
                      <td colSpan={6} className="py-4 px-4">
                        <AdvancedChart symbol={holding.ticker} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
