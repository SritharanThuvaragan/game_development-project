import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('banana_auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout with Navbar for protected pages
import { Outlet } from 'react-router-dom';
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <div className="app-container" style={{ display: 'block', paddingTop: '80px', maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }}>
        <Navbar />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
};



// Root App Component wrapper routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes wrapped in Navbar Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
