// Form with improved event handling
const handleSubmit = (e: React.FormEvent) => {
  console.log("Form submitted");
  handleSearch(e);
}; import React, { useState, useEffect } from 'react';
import HotList from './HotList';

interface StockData {
  symbol: string;
  description?: string;
  displaySymbol?: string;
  type?: string;
}

interface StockQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  companyName?: string; // Company name (might be added by our backend)
}

interface PortfolioStock {
  symbol: string;
  moneyInvested: number;
  unitsOwned: number;
  purchaseHistory: any[];
}

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [portfolioData, setPortfolioData] = useState<PortfolioStock | null>(null);


  // Get user data from local storage
  const getUserData = () => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (err) {
      return null;
    }
  };

  const user = getUserData();



  useEffect(() => {
    if (selectedStock && user) {
      fetchPortfolioStock(selectedStock);
    }
  }, [selectedStock]);



  const fetchPortfolioStock = async (symbol: string) => {
    if (!user) return;

    try {
      const obj = { userID: user.id, symbol: symbol };
      const js = JSON.stringify(obj);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/searchPortfolio`, {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const rawText = await response.text();

      try {
        const data = JSON.parse(rawText);
        setPortfolioData(data);
      } catch (parseError) {
        setError('Error parsing portfolio data');
      }
    } catch (err) {
      setError('Error fetching portfolio data');
    }
  };

  // Debug function to track search execution
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search submitted with term:", searchTerm);
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setResults([]);
    setQuotes({});

    try {
      console.log("Preparing API call...");
      const obj = { query: searchTerm };
      const js = JSON.stringify(obj);

      // Use a hardcoded API URL for debugging if needed
      const apiUrl = import.meta.env.VITE_API_URL || "https://api.example.com"; // Fallback for debugging
      console.log("Using API URL:", apiUrl);

      const response = await fetch(`${apiUrl}/api/auth/searchNewStock`, {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("API response received");
      const rawText = await response.text();
      console.log("Raw response:", rawText.substring(0, 100) + "..."); // Log first 100 chars

      try {
        const data = JSON.parse(rawText);
        console.log("Parsed data:", data);

        if (data.result && Array.isArray(data.result)) {
          console.log("Found results:", data.result.length);
          setResults(data.result);

          if (data.result.length > 0) {
            const symbols = data.result.slice(0, 10).map((stock: StockData) => stock.symbol);
            console.log("Fetching quotes for symbols:", symbols);
            fetchQuotes(symbols);
          }
        } else {
          console.log("No results found or invalid format");
          setResults([]);
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        setError('Error parsing search results');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
      console.log("Search completed");
    }
  };

  const fetchQuotes = async (symbols: string[]) => {
    console.log("fetchQuotes called with symbols:", symbols);
    const apiUrl = import.meta.env.VITE_API_URL || "https://api.example.com"; // Fallback for debugging

    const quotePromises = symbols.map(symbol =>
      fetch(`${apiUrl}/api/quote/${symbol}`)
        .then(res => {
          console.log(`Response for ${symbol}:`, res.status);
          return res.text();
        })
        .then(text => {
          try {
            return JSON.parse(text);
          } catch (err) {
            console.error(`Error parsing quote for ${symbol}:`, err);
            return null;
          }
        })
        .catch((err) => {
          console.error(`Error fetching quote for ${symbol}:`, err);
          return null;
        })
    );

    try {
      const quoteResults = await Promise.all(quotePromises);
      console.log("Quote results received:", quoteResults);
      const newQuotes: Record<string, StockQuote> = {};

      symbols.forEach((symbol, index) => {
        if (quoteResults[index]) {
          const quote = quoteResults[index];
          if (quote) {
            // Ensure all necessary properties exist
            if (quote.c == null) quote.c = 0;
            if (quote.d == null) quote.d = 0;
            if (quote.dp == null) quote.dp = 0;
            if (quote.h == null) quote.h = 0;
            if (quote.l == null) quote.l = 0;
            if (quote.o == null) quote.o = 0;
            if (quote.pc == null) quote.pc = 0;

            newQuotes[symbol] = quote;
          }
        }
      });

      console.log("Setting quotes:", newQuotes);
      setQuotes(prev => ({ ...prev, ...newQuotes }));
    } catch (err) {
      console.error("Error in fetchQuotes:", err);
    }
  };

  const handleBuyStock = async (symbol: string) => {
    if (!user) {
      alert('Please log in to buy stocks');
      window.location.href = '/login';
      return;
    }

    setSelectedStock(symbol);

    const stockQuote = quotes[symbol];
    if (!stockQuote || stockQuote.c == null) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quote/${symbol}`);
        const rawText = await response.text();

        try {
          const data = JSON.parse(rawText);

          // Check if the data has the expected properties
          if (data && (data.c == null || data.d == null)) {
            // Add default values if properties are missing
            if (data.c == null) data.c = 0;
            if (data.d == null) data.d = 0;
            if (data.dp == null) data.dp = 0;
          }

          setQuotes(prev => ({ ...prev, [symbol]: data }));
        } catch (parseError) {
          setError('Could not parse quote data');
        }
      } catch (err) {
        setError('Could not fetch current price for this stock');
      }
    }
  };

  const confirmPurchase = async () => {
    if (!selectedStock || !quotes[selectedStock] || !user) return;

    try {
      const stockPrice = quotes[selectedStock].c || 0;
      const totalCost = stockPrice * quantity;

      const obj = {
        userID: user.id,
        symbol: selectedStock,
        action: 'buy',
        units: quantity,
        price: stockPrice
      };

      const js = JSON.stringify(obj);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stocks/update`, {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const rawText = await response.text();

      try {
        const data = JSON.parse(rawText);

        if (data.error) {
          setError(data.error);
        } else {
          // Update user's cash balance in localStorage
          const updatedUser = { ...user, cashBalance: data.user.cashBalance };
          localStorage.setItem('user_data', JSON.stringify(updatedUser));

          // Success message and reset
          alert(`Successfully purchased ${quantity} shares of ${selectedStock} for $${totalCost.toFixed(2)}`);
          setQuantity(1);
          setSelectedStock(null);

          // Refresh portfolio data
          if (selectedStock) {
            fetchPortfolioStock(selectedStock);
          }
        }
      } catch (parseError) {
        setError('Error processing purchase');
      }
    } catch (err) {
      setError('An error occurred while making the purchase');
    }
  };

  // Function to render the TradingView widget when a stock is selected
  const renderTradingViewWidget = () => {
    if (!selectedStock) return null;

    return (
      <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden mt-4">
        <HotList />
      </div>
    );
  };

  const renderBuyPanel = () => {
    if (!selectedStock || !quotes[selectedStock] || quotes[selectedStock].c == null) return null;

    const quote = quotes[selectedStock];
    const currentPrice = quote.c || 0;
    const totalCost = currentPrice * quantity;
    const userBalance = user ? user.cashBalance : 0;
    const canAfford = userBalance >= totalCost;

    return (
      <div className="bg-gray-900 p-6 rounded-lg mt-6">
        <h3 className="text-xl font-semibold mb-4">Buy {selectedStock}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <p className="text-gray-400 mb-1">Current Price</p>
              <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 mb-1">Day Change</p>
              <p className={`text-lg font-medium ${(quote.d || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${(quote.d || 0).toFixed(2)} ({(quote.dp || 0).toFixed(2)}%)
              </p>
            </div>

            {portfolioData && (
              <div className="mb-4">
                <p className="text-gray-400 mb-1">Your Position</p>
                <p className="text-lg font-medium">
                  {portfolioData.unitsOwned} shares (${portfolioData.moneyInvested.toFixed(2)})
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <p className="text-gray-400 mb-1">Total Cost</p>
              <p className="text-xl font-bold">${totalCost.toFixed(2)}</p>

              {user && (
                <p className={`text-sm mt-1 ${canAfford ? 'text-green-500' : 'text-red-500'}`}>
                  {canAfford
                    ? `Available: $${userBalance.toFixed(2)}`
                    : `Insufficient funds. You need $${(totalCost - userBalance).toFixed(2)} more.`}
                </p>
              )}
            </div>

            <button
              onClick={confirmPurchase}
              disabled={!canAfford || !user}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition duration-200 
                ${canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 cursor-not-allowed'}`}
            >
              {user ? 'Confirm Purchase' : 'Login to Buy'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CoinPurse</h1>
          <div className="flex space-x-6">
            <a href="/portfolio" className="hover:text-green-400 transition">Portfolio</a>
            <a href="/search" className="text-green-400">Search</a>
            <a href="/logout" className="hover:text-green-400 transition">Logout</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-8">Search Stocks</h2>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  console.log("Search input changed:", e.target.value);
                  setSearchTerm(e.target.value);
                }}
                placeholder="Search by company name or symbol"
                className="flex-grow p-4 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-6 bg-green-600 hover:bg-green-700 rounded-r-md font-medium transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Search Results Section */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-400">Searching...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 text-red-300 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {selectedStock && renderTradingViewWidget()}
          {selectedStock && renderBuyPanel()}

          {!isLoading && results.length > 0 && (
            <div className="bg-gray-900 rounded-lg overflow-hidden mt-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="py-3 px-4">SYMBOL</th>
                    <th className="py-3 px-4">NAME</th>
                    <th className="py-3 px-4">PRICE</th>
                    <th className="py-3 px-4">CHANGE</th>
                    <th className="py-3 px-4">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((stock) => (
                    <tr key={stock.symbol} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                      <td className="py-3 px-4">{stock.description || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {quotes[stock.symbol] && quotes[stock.symbol].c != null
                          ? `$${quotes[stock.symbol].c.toFixed(2)}`
                          : 'Loading...'}
                      </td>
                      <td className={`py-3 px-4 ${quotes[stock.symbol] && quotes[stock.symbol].d != null && quotes[stock.symbol].d >= 0
                        ? 'text-green-500'
                        : quotes[stock.symbol] && quotes[stock.symbol].d != null ? 'text-red-500' : ''}`}>
                        {quotes[stock.symbol] && quotes[stock.symbol].d != null
                          ? `${quotes[stock.symbol].d > 0 ? '+' : ''}${quotes[stock.symbol].d.toFixed(2)}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleBuyStock(stock.symbol)}
                          className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm transition"
                        >
                          Buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && searchTerm && results.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400">No results found for "{searchTerm}"</p>
            </div>
          )}

          {!searchTerm && !results.length && (
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Trending Stocks</h3>

              {/* TradingView Hotlist Widget */}
              <div className="bg-gray-800 p-2 rounded-lg overflow-hidden h-96">
                <HotList />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
