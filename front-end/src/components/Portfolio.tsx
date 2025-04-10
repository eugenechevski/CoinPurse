import React, { useState } from 'react';


function Portfolio() {
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
    </div>
  );
}

export default Portfolio;

