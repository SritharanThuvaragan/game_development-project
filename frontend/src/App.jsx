import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Help from './pages/help';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { SoundProvider } from './context/SoundContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('banana_auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout with Navbar for protected pages
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <div className="matrix-bg"></div>
      <div style={{ display: 'block', paddingTop: '70px', maxWidth: '100%', margin: 0, minHeight: '100vh' }}>
        <Navbar />
        <Outlet />
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <SoundProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes wrapped in Navbar Layout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/help" element={<Help />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SoundProvider>
  );
}

export default App;
