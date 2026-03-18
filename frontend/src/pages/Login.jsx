import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      // Login successful, save token
      localStorage.setItem('banana_auth_token', data.token);
      localStorage.setItem('banana_username', data.user.username);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '6px' }}>◆ Banana Blast HQ ◆</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', background: 'linear-gradient(135deg, var(--primary), #fff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
            <i className="fa-solid fa-lock" style={{ marginRight: '6px' }} />Login to continue your mission
          </p>
        </div>
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
          
          <button type="submit" className="submit-btn auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
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
