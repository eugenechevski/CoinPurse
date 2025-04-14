import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Account: React.FC = () => {
  const navigate = useNavigate();
  
  // Local state for the add money form.
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Handles logging out: remove user data and redirect.
  const handleLogout = () => {
    localStorage.removeItem('user_data');
    navigate('/login');
  };

  // Handles the form submission to add funds.
  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation: must be a positive number.
    if (amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/account/add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      const res = await response.json();
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Funds added successfully!');
        // Optionally update local storage with the new cash balance if returned by API.
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (res.newCashBalance !== undefined) {
            user.cashBalance = res.newCashBalance;
            localStorage.setItem('user_data', JSON.stringify(user));
          }
        }
      }
    } catch (err: any) {
      setError('Failed to add funds. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-8">My Account</h1>
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Log Out Button */}
        <div className="mb-6">
          <button 
            onClick={handleLogout} 
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-md font-medium transition"
          >
            Log Out
          </button>
        </div>
        
        {/* Add Funds Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Add Funds</h2>
          <form onSubmit={handleAddMoney}>
            <div className="mb-4">
              <input 
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min={0}
                step="0.01"
              />
            </div>
            {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
            {success && <div className="mb-2 text-green-500 text-sm">{success}</div>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-md font-medium transition"
            >
              {loading ? 'Processing...' : 'Add Money'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;