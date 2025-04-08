import { Routes, Route } from 'react-router-dom';

// Import pages (to be created)
// import Dashboard from './pages/Dashboard';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Profile from './pages/Profile';
// import StockDetail from './pages/StockDetail';
// import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
        <Route path="/register" element={<div>Register Page (Coming Soon)</div>} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <div>Dashboard (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <div>Profile Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/stocks/:symbol" element={
          <ProtectedRoute>
            <div>Stock Detail Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
