import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [username, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!code || !newPassword) {
      setError('Please fill in both the OTP code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code, newPassword })
      });
      
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Password reset failed. Incorrect or expired code.');
        return;
      }

      setSuccess('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  if (!username) return null;

  return (
    <div className="page-content">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '6px' }}>◆ Security ◆</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', background: 'linear-gradient(135deg, var(--primary), #fff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Password Reset
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
            <i className="fa-solid fa-key" style={{ marginRight: '6px' }} />Recover your access
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="auth-form">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
            We've sent a 6-digit code to the email associated with <strong>{username}</strong>. Please enter it below.
          </p>
          <div className="input-group">
            <label>6-Digit OTP</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="auth-input"
              placeholder="Enter 6-digit code"
              maxLength="6"
            />
          </div>
          
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-input"
              placeholder="Enter your new password"
            />
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && <div style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '15px', fontSize: '0.85rem' }}>{success}</div>}
          
          <button type="submit" className="submit-btn auth-submit" disabled={loading || success}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="auth-link">
          Remember your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
