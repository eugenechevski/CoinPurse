import React, { useState } from 'react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap?: string;
  volume?: number;
}

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample stock data for demonstration
  const sampleStocks: StockData[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 180.95, change: 2.30 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 340.67, change: -1.20 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, change: 0.87 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: 3.40 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 248.50, change: -5.60 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 435.75, change: 7.25 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 950.02, change: 15.75 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 392.14, change: -0.36 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would be an API call
      // For now, we'll filter the sample data
      setTimeout(() => {
        const filteredResults = sampleStocks.filter(stock =>
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setResults(filteredResults);
        setIsLoading(false);
      }, 500); // Simulating API delay
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAddToPortfolio = (symbol: string) => {
    // This would handle adding the stock to user's portfolio
    alert(`${symbol} has been added to your portfolio!`);
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
            <a href="/wallet" className="hover:text-green-400 transition">Wallet</a>
            <a href="/logout" className="hover:text-green-400 transition">Logout</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-8">Search Stocks</h2>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          {!isLoading && results.length > 0 && (
            <div className="bg-gray-900 rounded-lg overflow-hidden">
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
                      <td className="py-3 px-4">{stock.name}</td>
                      <td className="py-3 px-4">{stock.price.toFixed(2)}</td>
                      <td className={`py-3 px-4 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleAddToPortfolio(stock.symbol)}
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
              <h3 className="text-xl font-semibold mb-4">Popular Stocks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sampleStocks.slice(0, 4).map((stock) => (
                  <div key={stock.symbol} className="bg-gray-800 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{stock.symbol}</span>
                      <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">{stock.name}</div>
                    <div className="text-lg font-medium">${stock.price.toFixed(2)}</div>
                    <button
                      onClick={() => handleAddToPortfolio(stock.symbol)}
                      className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm transition"
                    >
                      Add to Portfolio
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
