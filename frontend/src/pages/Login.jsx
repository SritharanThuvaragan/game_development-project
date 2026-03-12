import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    const usersData = localStorage.getItem('banana_users');
    const users = usersData ? JSON.parse(usersData) : {};

    if (!users[username]) {
      setError('User not found. Please register.');
      return;
    }

    if (users[username] !== password) {
      setError('Wrong password. Please try again.');
      return;
    }

    // Login successful
    localStorage.setItem('banana_auth_user', username);
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">Welcome Back</h1>
        <div className="score">Login to play Banana Math</div>
      </div>
      
      <div className="game-card auth-card">
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="Enter your password"
            />
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          
          <button type="submit" className="submit-btn auth-submit">
            Login
          </button>
        </form>
        
        <div className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
