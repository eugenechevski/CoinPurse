import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Search from './components/Search';

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('user_data') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      } />
      {/* Add routes for portfolio and wallet when those components are created */}
      <Route path="/portfolio" element={
        <ProtectedRoute>
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p>Portfolio page will be implemented by your teammate.</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/wallet" element={
        <ProtectedRoute>
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p>Wallet page will be implemented by your teammate.</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
