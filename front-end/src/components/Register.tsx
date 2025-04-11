import React, { useState } from 'react';

// Debug mode: 1 = enable console logs, 0 = disable console logs
const DEBUG_MODE = 1;

// Debug logger function that only logs when debug mode is enabled
const debugLog = (type: 'log' | 'error' | 'warn', ...args: any[]) => {
  if (DEBUG_MODE) {
    if (type === 'error') {
      console.error(...args);
    } else if (type === 'warn') {
      console.warn(...args);
    } else {
      console.log(...args);
    }
  }
};

function Register() {
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loginName, setLoginName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function doRegister(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const obj = {
      firstName: firstName,
      lastName: lastName,
      login: loginName,
      email: email,
      password: password
    };
    const js = JSON.stringify(obj);

    // Log input being sent to API
    debugLog('log', 'Input to API:', obj);

    const apiRoute = import.meta.env.VITE_API_URL + '/api/auth/addUser';
    debugLog('log', 'API Route:', apiRoute);

    try {
      const response = await fetch(apiRoute, {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const rawText = await response.text();
      debugLog('log', 'Raw API Response:', rawText);
      let res;

      try {
        res = JSON.parse(rawText);
        debugLog('log', 'Parsed API Response:', res);
      } catch (parseError) {
        debugLog('error', 'JSON parse error:', parseError);
        setMessage('Server returned invalid data. Please try again later.');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        debugLog('log', 'Response not OK. Status:', response.status);
        throw new Error(res.error || 'Registration failed');
      }

      if (res.error) {
        setMessage(res.error);
        setIsLoading(false);
      } else if (res.userID) {
        // User was auto-logged in after registration
        const user = {
          firstName: firstName, // Use the form values since API doesn't return them
          lastName: lastName,
          id: res.userID,
          cashBalance: res.cashBalance || 0
        };

        debugLog('log', 'User data being stored:', user);
        localStorage.setItem('user_data', JSON.stringify(user));
        debugLog('log', 'Redirecting to portfolio page');
        window.location.href = '/portfolio';
      } else {
        // Registration successful, but no auto-login
        setMessage('Registration successful! You can now login.');
        // Clear the form
        setFirstName('');
        setLastName('');
        setLoginName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Optional: Redirect to login page after short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error: any) {
      debugLog('error', 'Registration error:', error);
      setMessage(error.message || error.toString());
    } finally {
      setIsLoading(false);
      debugLog('log', 'Registration process completed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-2">CoinPurse</h1>
          <p className="text-gray-400">Join our investment tracking platform</p>
        </div>

        {/* Register Form */}
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full">
          <h2 className="text-xl font-semibold mb-6 text-center">Create Your Account</h2>

          <form onSubmit={doRegister}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                placeholder="johndoe"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="john.doe@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Create a strong password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('successful')
                ? 'bg-green-900/50 text-green-300'
                : 'bg-red-900/50 text-red-300'
                }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium transition duration-200 disabled:bg-green-800 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-green-500 hover:text-green-400 text-sm">
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
