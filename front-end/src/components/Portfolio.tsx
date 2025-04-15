import React, { useState, useEffect, useRef } from 'react';

interface Holding {
  ticker: string;
  shares: number;
  currentPrice: number;
  change: number;
}

const AdvancedChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
              symbol: `NASDAQ:${symbol}`, 
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
        } catch (err) {
          console.error("Error loading TradingView widget:", err);
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
  // States for trades and errors
  const [tradeAction, setTradeAction] = useState<{ ticker: string; type: 'buy' | 'sell' } | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<number>(0);
  const [tradeError, setTradeError] = useState<string>('');
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);

  // Portfolio stats
  const [totalValue, setTotalValue] = useState(0);
  const [change, setChange] = useState(0);
  const [uninvestedCash, setUninvestedCash] = useState(0);

  // Holdings + chart state
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [expandedHoldings, setExpandedHoldings] = useState<{ [key: string]: boolean }>({});

  // API URL from Vite .env
  const apiUrl = import.meta.env.VITE_API_URL;

  // Retrieve user info from localStorage
  const storedUserStr = localStorage.getItem('user_data');
  const user = storedUserStr ? JSON.parse(storedUserStr) : null;
  const userId = user?._id || user?.id || null;

  // Initialize uninvested cash from user_data, if available
  useEffect(() => {
    if (user && typeof user.cashBalance === 'number') {
      setUninvestedCash(user.cashBalance);
    }
  }, [user]);

  // Fetch portfolio from /api/auth/searchPortfolio with symbol=""
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!userId) {
        console.log("No user ID found, not fetching portfolio.");
        return;
      }

      try {
        const resp = await fetch(`${apiUrl}/api/auth/searchPortfolio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: userId, symbol: '' }),
        });

        if (!resp.ok) {
          console.error("Error fetching portfolio:", resp.status, resp.statusText);
          return;
        }

        const portfolioData = await resp.json();
        console.log("Portfolio data (raw):", portfolioData);

        // Expecting an array with shape: 
        // [{ symbol: string, moneyInvested: number, unitsOwned: number, purchaseHistory: [...]}]
        if (!Array.isArray(portfolioData)) {
          console.error("Portfolio data is not an array:", portfolioData);
          return;
        }

        // For each stock, fetch the real-time quote from /api/quote/:symbol
        const updatedHoldings: Holding[] = [];
        for (const stock of portfolioData) {
          const { symbol, unitsOwned } = stock;
          try {
            const quoteRes = await fetch(`${apiUrl}/api/quote/${symbol}`);
            if (!quoteRes.ok) {
              console.error(`Quote fetch failed for ${symbol}:`, quoteRes.status, quoteRes.statusText);
              updatedHoldings.push({
                ticker: symbol,
                shares: unitsOwned || 0,
                currentPrice: 0,
                change: 0
              });
              continue;
            }

            const quoteData = await quoteRes.json();
            // Finnhub fields: c => current price, d => daily change
            const curPrice = typeof quoteData.c === 'number' ? quoteData.c : 0;
            const dailyChange = typeof quoteData.d === 'number' ? quoteData.d : 0;

            updatedHoldings.push({
              ticker: symbol,
              shares: unitsOwned || 0,
              currentPrice: curPrice,
              change: dailyChange
            });
          } catch (err) {
            console.error(`Error fetching quote for ${symbol}:`, err);
            updatedHoldings.push({
              ticker: symbol,
              shares: unitsOwned || 0,
              currentPrice: 0,
              change: 0
            });
          }
        }

        // Update state
        setHoldings(updatedHoldings);
        // Calculate totalValue + change from updatedHoldings
        let newValue = 0;
        let newChange = 0;
        for (const h of updatedHoldings) {
          newValue += h.shares * h.currentPrice;
          newChange += h.shares * h.change;
        }
        setTotalValue(newValue);
        setChange(newChange);
      } catch (err) {
        console.error("Error in fetchPortfolio:", err);
      }
    };

    fetchPortfolio();
  }, [apiUrl, userId]);

  // Toggle chart expansion
  const toggleChart = (ticker: string) => {
    setExpandedHoldings(prev => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  // Open trade menu
  const openTradeMenu = (ticker: string, type: 'buy' | 'sell') => {
    setTradeAction({ ticker, type });
    setTradeQuantity(0);
    setTradeError('');
  };

  // Close trade menu
  const closeTradeMenu = () => {
    setTradeAction(null);
    setTradeQuantity(0);
    setTradeError('');
  };

  // Execute trade
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
        action: tradeAction.type,
        units: tradeQuantity,
        price: holding.currentPrice,
      };

      const response = await fetch(`${apiUrl}/api/stocks/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const res = await response.json();
      if (res.error) {
        setTradeError(res.error);
      } else {
        // Update the shares for that holding
        setHoldings(prev =>
          prev.map(h =>
            h.ticker === holding.ticker
              ? tradeAction.type === 'buy'
                ? { ...h, shares: h.shares + tradeQuantity }
                : { ...h, shares: h.shares - tradeQuantity }
              : h
          )
        );
        // Update uninvested cash
        if (res.user && typeof res.user.cashBalance === 'number') {
          setUninvestedCash(res.user.cashBalance);
        }
        closeTradeMenu();
      }
    } catch (error: any) {
      console.error("Trade failed:", error);
      setTradeError("Trade failed. Please try again.");
    }
    setTradeLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation bar */}
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
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Total Value</h3>
            <p className="text-2xl font-bold">
              ${totalValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Change</h3>
            <p
              className={`text-2xl font-bold ${
                change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {change.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Uninvested Cash</h3>
            <p className="text-2xl font-bold">
              ${uninvestedCash.toFixed(2)}
            </p>
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
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">
                    You currently have no stocks in your portfolio.
                  </td>
                </tr>
              ) : (
                holdings
                .filter(holding=> holding.shares > 0)
                .map(holding => (
                  <React.Fragment key={holding.ticker}>
                    <tr className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium">{holding.ticker}</td>
                      <td className="py-3 px-4">
                        ${holding.currentPrice.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          holding.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {holding.change >= 0 ? '+' : ''}
                        {holding.change.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{holding.shares}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleChart(holding.ticker)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
                        >
                          {expandedHoldings[holding.ticker]
                            ? 'Hide Chart'
                            : 'View Chart'}
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
                                <div className="font-semibold">
                                  Buy {holding.ticker}
                                </div>
                                <div>
                                  Available Funds: $
                                  {uninvestedCash.toFixed(2)}
                                </div>
                                <div>
                                  Current Price: $
                                  {holding.currentPrice.toFixed(2)}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={tradeQuantity}
                                    onChange={e =>
                                      setTradeQuantity(
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-24 p-2 bg-gray-700 rounded"
                                    min={0}
                                  />
                                  <span>shares</span>
                                </div>
                                <div>
                                  Cost: $
                                  {(
                                    tradeQuantity * holding.currentPrice
                                  ).toFixed(2)}
                                </div>
                                {tradeError && (
                                  <div className="text-red-500 text-sm">
                                    {tradeError}
                                  </div>
                                )}
                                <div className="flex space-x-2 mt-2">
                                  <button
                                    onClick={() => executeTrade(holding)}
                                    disabled={tradeLoading}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
                                  >
                                    {tradeLoading
                                      ? 'Processing...'
                                      : 'Confirm'}
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
                                <div className="font-semibold">
                                  Sell {holding.ticker}
                                </div>
                                <div>Shares Owned: {holding.shares}</div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={tradeQuantity}
                                    onChange={e =>
                                      setTradeQuantity(
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-24 p-2 bg-gray-700 rounded"
                                    min={0}
                                  />
                                  <span>shares</span>
                                </div>
                                <div>
                                  Proceeds: $
                                  {(
                                    tradeQuantity * holding.currentPrice
                                  ).toFixed(2)}
                                </div>
                                {tradeError && (
                                  <div className="text-red-500 text-sm">
                                    {tradeError}
                                  </div>
                                )}
                                <div className="flex space-x-2 mt-2">
                                  <button
                                    onClick={() => executeTrade(holding)}
                                    disabled={tradeLoading}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
                                  >
                                    {tradeLoading
                                      ? 'Processing...'
                                      : 'Confirm'}
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

                    {/* Chart row */}
                    {expandedHoldings[holding.ticker] && (
                      <tr className="border-t border-gray-800">
                        <td colSpan={6} className="py-4 px-4">
                          <AdvancedChart symbol={holding.ticker} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
