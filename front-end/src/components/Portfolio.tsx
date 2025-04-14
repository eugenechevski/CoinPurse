import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Holding {
  ticker: string;
  shares: number;
  currentPrice: number;
  change: number;
}

/**
 * AdvancedChart Component
 * Embeds TradingView's advanced chart widget.
 */
const AdvancedChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Generate a unique container id to avoid conflicts when multiple charts are loaded.
  const uniqueId = useRef(`tradingview_${symbol}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = uniqueId.current;
    }

    const loadWidget = () => {
      setTimeout(() => {
        try {
          if ((window as any).TradingView && containerRef.current) {
            new (window as any).TradingView.widget({
              width: "100%",
              height: "600",
              symbol: `NASDAQ:${symbol}`, // Adjust the exchange prefix if needed
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
      }, 100);
    };

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
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Trade menu state.
  const [tradeAction, setTradeAction] = useState<{ ticker: string; type: 'buy' | 'sell' } | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<number>(0);
  const [tradeError, setTradeError] = useState<string>('');
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);

  // Portfolio stats.
  const [totalValue, setTotalValue] = useState(0);
  const [change, setChange] = useState(0);
  const [uninvestedCash, setUninvestedCash] = useState(0);

  // Holdings data (will be fetched from API).
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [expandedHoldings, setExpandedHoldings] = useState<{ [key: string]: boolean }>({});

  // Base API URL from .env
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch portfolio and update each holding's current price using the quote endpoint.
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const portfolioRes = await fetch(`${apiUrl}/api/portfolio`);
        const portfolioData = await portfolioRes.json();
        if (portfolioData.holdings && Array.isArray(portfolioData.holdings)) {
          const updatedHoldings = await Promise.all(
            portfolioData.holdings.map(async (holding: any) => {
              try {
                // Fetch quote data using your Finnhub proxy endpoint.
                const priceRes = await fetch(`${apiUrl}/api/quote/${holding.ticker}`);
                const priceData = await priceRes.json();
                // Finnhub response: 'c' is current price, 'd' is price change.
                return {
                  ticker: holding.ticker,
                  shares: holding.shares,
                  currentPrice: priceData.c,
                  change: priceData.d,
                };
              } catch (err) {
                console.error(`Failed to fetch quote for ${holding.ticker}:`, err);
                // Fall back to stored values if fetching fails.
                return {
                  ticker: holding.ticker,
                  shares: holding.shares,
                  currentPrice: holding.currentPrice || 0,
                  change: holding.change || 0,
                };
              }
            })
          );
          setHoldings(updatedHoldings);

          // Simulated portfolio statistics -- in a real app, update these based on detailed data.
          setTotalValue(600.0);
          setChange(-40.0);
          setUninvestedCash(200.0);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };

    fetchPortfolio();
  }, [apiUrl]);

  // Functions for the trade menu (buy/sell).
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

  // Execute trade using the /api/stocks/update endpoint.
  const executeTrade = async (holding: Holding) => {
    setTradeError('');
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
      // Retrieve user data from localStorage (dummy login sets userID).
      const storedUser = localStorage.getItem('user_data');
      if (!storedUser) {
        setTradeError("User not authenticated.");
        setTradeLoading(false);
        return;
      }
      const user = JSON.parse(storedUser);
      // Use the userID from your dummy data.
      const _id = user.userID;
      
      const body = {
        _id,
        symbol: holding.ticker,
        action: tradeAction?.type,
        units: tradeQuantity,
        price: holding.currentPrice,
      };

      const response = await fetch(`${apiUrl}/api/stocks/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const res = await response.json();
      if (res.error) {
        setTradeError(res.error);
      } else {
        // Update holdings: adjust the share count for the holding.
        setHoldings(prevHoldings =>
          prevHoldings.map(h =>
            h.ticker === holding.ticker
              ? tradeAction!.type === "buy"
                ? { ...h, shares: h.shares + tradeQuantity }
                : { ...h, shares: h.shares - tradeQuantity }
              : h
          )
        );
        // Update uninvested cash from the returned user data.
        if (res.user && res.user.cashBalance !== undefined) {
          setUninvestedCash(res.user.cashBalance);
        }
        closeTradeMenu();
      }
    } catch (error: any) {
      setTradeError("Trade failed. Please try again.");
    }
    setTradeLoading(false);
  };

  const toggleChart = (ticker: string) => {
    setExpandedHoldings(prev => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Top bar with toggle button */}
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

      {/* Main Content Area */}
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
