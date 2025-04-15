import React, { useState } from 'react';

const Account: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  const handleAddFunds = async () => {
    setMessage('');
    setError('');

    if (amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      // Example API call to your endpoint
      const storedUser = localStorage.getItem('user_data');
      if (!storedUser) {
        setError('User not authenticated.');
        return;
      }
      const user = JSON.parse(storedUser);
      const _id = user.id || user._id;

      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/updateBalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id, transactionAmount: amount }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`Funds added successfully. New balance: $${data.newBalance.toFixed(2)}`);
        // Optionally update localStorage user data
        user.cashBalance = data.newBalance;
        localStorage.setItem('user_data', JSON.stringify(user));
      }
    } catch (err) {
      setError('Error adding funds. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Same Nav Bar as Search/Portfolio */}
      <nav className="bg-gray-900 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CoinPurse</h1>
          <div className="flex space-x-6">
            <a href="/portfolio" className="hover:text-green-400 transition" >Portfolio</a>
            <a href="/search" className="hover:text-green-400 transition">Search</a>
            <a href="/account" className="text-green-400">Account</a>
            <a href="/logout" className="hover:text-green-400 transition">Logout</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">My Account</h2>

        <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md mx-auto mb-8">
          {/* Logout Section */}
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-md font-medium transition"
          >
            Log Out
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Add Funds</h3>
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              placeholder="Enter amount"
            />
            <button
              onClick={handleAddFunds}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md transition"
            >
              Add
            </button>
          </div>
          {message && <p className="text-green-500 mb-2">{message}</p>}
          {error && <p className="text-red-500 mb-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Account;
