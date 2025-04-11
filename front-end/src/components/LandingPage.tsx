import React from 'react';
import { Link } from 'react-router-dom';
import Banner from './Banner'

function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CoinPurse</h1>
          <div className="space-x-4">
            <Link to="/login" className="px-4 py-2 text-white hover:text-green-400 transition">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition">Register</Link>
          </div>
        </div>
      </nav>
      <div className="w-full bg-gray-800 py-2">
        <Banner />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-5xl font-bold mb-6">Track Your Investments with Confidence</h2>
            <p className="text-xl text-gray-300 mb-8">
              CoinPurse helps you monitor your portfolio, track performance, and make informed investment decisions.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md font-medium transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 border border-white hover:bg-gray-800 rounded-md font-medium transition"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-4">MY PORTFOLIO</h3>
                <div className="flex justify-between items-center mb-2">
                  <div>TOTAL VALUE</div>
                  <div className="text-green-500 text-xl font-bold">$600.00</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>CHANGE</div>
                  <div className="text-red-500">-40.00</div>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-2">SYMBOL</th>
                    <th className="py-2">NAME</th>
                    <th className="py-2">PRICE</th>
                    <th className="py-2">CHANGE</th>
                    <th className="py-2">SHARES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2">TSLA</td>
                    <td className="py-2">TESLA INC</td>
                    <td className="py-2 text-red-500">100.00</td>
                    <td className="py-2 text-red-500">-10.00</td>
                    <td className="py-2">2</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2">AAPL</td>
                    <td className="py-2">APPLE</td>
                    <td className="py-2 text-red-500">100.00</td>
                    <td className="py-2 text-red-500">-10.00</td>
                    <td className="py-2">4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CoinPurse?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-green-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-300">
                Monitor your investments in real-time with up-to-date market data and performance metrics.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-green-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Portfolio Management</h3>
              <p className="text-gray-300">
                Add, remove, and adjust your holdings with an intuitive and user-friendly interface.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-green-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Stock Search</h3>
              <p className="text-gray-300">
                Find and research new investment opportunities with our comprehensive stock search feature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">CoinPurse</h2>
              <p className="text-gray-400">© 2025 CoinPurse. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
