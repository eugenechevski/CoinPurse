import React, { useState } from 'react';

function Register() {
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function doRegister(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    const obj = {
      firstName: firstName,
      lastName: lastName,
      login: loginName,
      password: password
    };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/register', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());
      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage('Registration successful! You can now login.');
        // Clear the form
        setFirstName('');
        setLastName('');
        setLoginName('');
        setPassword('');
        setConfirmPassword('');
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
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium transition duration-200"
            >
              Create Account
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
