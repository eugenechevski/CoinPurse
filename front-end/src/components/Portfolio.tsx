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
  // Generate a unique container id to avoid conflicts.
  const uniqueId = useRef(`tradingview_${symbol}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = uniqueId.current;
    }

    const loadWidget = () => {
      // Delay to ensure container is rendered.
      setTimeout(() => {
        try {
          if ((window as any).TradingView && containerRef.current) {
            new (window as any).TradingView.widget({
              width: "100%",
              height: "600",
              symbol: `NASDAQ:${symbol}`, // Adjust as needed.
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
  // Trade menu state.
  const [tradeAction, setTradeAction] = useState<{ ticker: string; type: 'buy' | 'sell' } | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<number>(0);
  const [tradeError, setTradeError] = useState<string>('');
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);

  // Portfolio stats.
  const [totalValue, setTotalValue] = useState(0);
  const [change, setChange] = useState(0);
  const [uninvestedCash, setUninvestedCash] = useState(0);

  // Holdings and chart expansion states.
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [expandedHoldings, setExpandedHoldings] = useState<{ [key: string]: boolean }>({});

  // Base API URL from .env.
  const apiUrl = import.meta.env.VITE_API_URL;

  // Get user id from localStorage.
  const storedUserStr = localStorage.getItem('user_data');
  const user = storedUserStr ? JSON.parse(storedUserStr) : null;
  const userId = user ? (user._id || user.id) : null;

  // If no user, you might want to redirect to login. (Not shown here.)

  // Fetch portfolio holdings from the API.
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${apiUrl}/api/auth/searchPortfolio`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          // Sending an empty symbol returns all of the user's stocks.
          body: JSON.stringify({ _id: userId, symbol: "" }),
        });
        const portfolioData = await res.json();
        console.log("Portfolio data:", portfolioData);
        // Check if the response is an array or an object containing 'holdings'.
        const portfolioHoldings = Array.isArray(portfolioData)
          ? portfolioData
          : portfolioData.holdings || [];

        if (portfolioHoldings.length > 0) {
          const updatedHoldings = await Promise.all(
            portfolioHoldings.map(async (stock: any) => {
              try {
                // Fetch latest quote data for each stock.
                const quoteRes = await fetch(`${apiUrl}/api/quote/${stock.symbol}`);
                const quoteData = await quoteRes.json();
                // Finnhub: 'c' is current price and 'd' is daily change.
                return {
                  ticker: stock.symbol,
                  shares: stock.unitsOwned, // using unitsOwned from the API.
                  currentPrice: quoteData.c,
                  change: quoteData.d,
                } as Holding;
              } catch (err) {
                console.error(`Error fetching quote for ${stock.symbol}:`, err);
                return {
                  ticker: stock.symbol,
                  shares: stock.unitsOwned,
                  currentPrice: stock.currentPrice || 0,
                  change: stock.change || 0,
                } as Holding;
              }
            })
          );
          setHoldings(updatedHoldings);
          // For demonstration purposes, simulate stats.
          setTotalValue(600.0);
          setChange(0.0);
          setUninvestedCash(200.0);
        } else {
          setHoldings([]);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };

    fetchPortfolio();
  }, [apiUrl, userId]);

  // Toggle the advanced chart row.
  const toggleChart = (ticker: string) => {
    setExpandedHoldings(prev => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  // Open the inline trade menu.
  const openTradeMenu = (ticker: string, type: 'buy' | 'sell') => {
    setTradeAction({ ticker, type });
    setTradeQuantity(0);
    setTradeError('');
  };

  // Close the trade menu.
  const closeTradeMenu = () => {
    setTradeAction(null);
    setTradeQuantity(0);
    setTradeError('');
  };

  // Execute a trade using the API.
  const executeTrade = async (holding: Holding) => {
    setTradeError('');
    const cost = tradeQuantity * holding.currentPrice;
    if (tradeAction?.type === 'buy' && cost > uninvestedCash) {
      setTradeError("Insufficient funds.");
      return;
    }
    if (tradeAction?.type === 'sell' && tradeQuantity > holding.shares) {
      setTradeError("Insufficient shares.");
      return;
    }
    setTradeLoading(true);
    try {
      if (!userId) {
        setTradeError("User not authenticated.");
        setTradeLoading(false);
        return;
      }
      const body = {
        _id: userId,
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
        // Adjust shares for the holding.
        setHoldings(prev =>
          prev.map(h =>
            h.ticker === holding.ticker
              ? tradeAction!.type === "buy"
                ? { ...h, shares: h.shares + tradeQuantity }
                : { ...h, shares: h.shares - tradeQuantity }
              : h
          )
        );
        // Update uninvested cash from the returned user data.
        if (res.user && typeof res.user.cashBalance === 'number') {
          setUninvestedCash(res.user.cashBalance);
        }
        closeTradeMenu();
      }
    } catch (error: any) {
      setTradeError("Trade failed. Please try again.");
    }
    setTradeLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar (from Search page style) */}
      <nav className="bg-gray-900 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CoinPurse</h1>
          <div className="flex space-x-6">
            <a href="/portfolio" className="text-green-400">Portfolio</a>
            <a href="/search" className="hover:text-green-400 transition">Search</a>
            <a href="/account" className="hover:text-green-400 transition">Account</a>
            <a href="/logout" className="hover:text-green-400 transition">Logout</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Portfolio Stats Section */}
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
              {holdings.map(holding => (
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
                        onClick={() => openTradeMenu(holding.ticker, 'buy')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm transition"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => openTradeMenu(holding.ticker, 'sell')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>

                  {/* Inline Trade Menu */}
                  {tradeAction && tradeAction.ticker === holding.ticker && (
                    <tr className="border-t border-gray-800 bg-gray-800">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="flex flex-col space-y-2">
                          {tradeAction.type === 'buy' ? (
                            <>
                              <div className="font-semibold">Buy {holding.ticker}</div>
                              <div>Available Funds: ${uninvestedCash.toFixed(2)}</div>
                              <div>Current Price: ${holding.currentPrice.toFixed(2)}</div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={tradeQuantity}
                                  onChange={e => setTradeQuantity(Number(e.target.value))}
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
                                  {tradeLoading ? 'Processing...' : 'Confirm'}
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
                                  onChange={e => setTradeQuantity(Number(e.target.value))}
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
                                  {tradeLoading ? 'Processing...' : 'Confirm'}
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

                  {/* Advanced Chart Row */}
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
