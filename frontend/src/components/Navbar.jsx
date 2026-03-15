import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const username = localStorage.getItem('banana_username');

  useEffect(() => {
    // Fetch user score to display in Navbar whenever route changes
    const fetchUserScore = async () => {
      if (!username) return;
      try {
        const res = await fetch(`http://localhost:5000/api/scores/user/${username}`);
        if (res.ok) {
          const data = await res.json();
          setScore(data.totalScore);
        }
      } catch (error) {
        console.error("Failed to fetch score for navbar", error);
      }
    };
    
    fetchUserScore();
  }, [location.pathname, username]);

  const handleLogout = () => {
    localStorage.removeItem('banana_auth_token');
    localStorage.removeItem('banana_username');
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: '#222',
      borderBottom: '3px solid #ffcc00',
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={linkStyle(location.pathname === '/')}>Home</Link>
        <Link to="/leaderboard" style={linkStyle(location.pathname === '/leaderboard')}>Leaderboard</Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', color: '#fff' }}>
        <div style={{ fontWeight: 'bold' }}>
          Profile: <span style={{ color: '#ffcc00' }}>{username}</span> | Score: <span style={{ color: '#ffcc00' }}>{score}</span>
        </div>
        <button 
          onClick={handleLogout} 
          style={{
            backgroundColor: '#ff4757',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const linkStyle = (isActive) => ({
  color: isActive ? '#ffcc00' : '#fff',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  transition: 'color 0.2s',
});

export default Navbar;
