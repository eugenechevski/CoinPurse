import React, { useState } from 'react';

function Login() {
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');

  async function doLogin(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());
      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      } else {
        const user = { firstName: res.firstName, lastName: res.lastName, id: res.id }
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        window.location.href = '/portfolio';
      }
    } catch (error: any) {
      setMessage(error.toString());
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-2">CoinPurse</h1>
          <p className="text-gray-400">Track your investments</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full">
          <h2 className="text-xl font-semibold mb-6 text-center">Login to Your Account</h2>

          <form onSubmit={doLogin}>
            <div className="mb-4">
              <label htmlFor="loginName" className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                id="loginName"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {message && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-md text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium transition duration-200"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/register" className="text-green-500 hover:text-green-400 text-sm">
              Don't have an account? Register now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
