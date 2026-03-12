import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    const usersData = localStorage.getItem('banana_users');
    const users = usersData ? JSON.parse(usersData) : {};

    if (users[username]) {
      setError('User already exists. Please choose a different username.');
      return;
    }

    // Register user
    users[username] = password;
    localStorage.setItem('banana_users', JSON.stringify(users));
    
    setSuccess('Registration successful! Redirecting to login...');
    setTimeout(() => {
        navigate('/login');
    }, 1500);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">Create Account</h1>
        <div className="score">Register to play Banana Math</div>
      </div>
      
      <div className="game-card auth-card">
        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              placeholder="Choose a username"
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="Create a password"
            />
          </div>

          <div className="input-group">
            <label>Re-enter Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              placeholder="Confirm your password"
            />
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          
          <button type="submit" className="submit-btn auth-submit">
            Register
          </button>
        </form>
        
        <div className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
