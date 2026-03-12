import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('banana_auth_user');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main Game Component (extracted from original App)
const Game = () => {
  const [questionUrl, setQuestionUrl] = useState('');
  const [solution, setSolution] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setInputValue('');
    try {
      const response = await fetch('https://marcconrad.com/uob/banana/api.php');
      const data = await response.json();
      setQuestionUrl(data.question);
      setSolution(data.solution);
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoading(false);
      // Focus input after loading
      setTimeout(() => {
        if(inputRef.current) inputRef.current.focus();
      }, 100);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue === '') return;
    
    const numValue = parseInt(inputValue, 10);
    if (numValue === solution) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('wrong');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('banana_auth_user');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">Banana Math</h1>
        <div className="score">Score: <span className="score-value">{score}</span></div>
      </div>

      <div className="game-card">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <div className="puzzle-image-container">
              <img src={questionUrl} alt="Math Puzzle" className="puzzle-image" />
            </div>
            
            <form onSubmit={handleSubmit} className="input-section">
              <input
                ref={inputRef}
                type="number"
                min="0"
                max="9"
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  // Restrict to single digit 0-9
                  if (val === '' || (val.length === 1 && val >= '0' && val <= '9')) {
                    setInputValue(val);
                  }
                }}
                className="digit-input"
                placeholder="?"
                disabled={feedback === 'correct' || loading}
                autoFocus
              />
              {!feedback || feedback === 'wrong' ? (
                <button type="submit" className="submit-btn" disabled={inputValue === '' || loading}>
                  Submit
                </button>
              ) : null}
            </form>

            {feedback && (
              <div className={`feedback ${feedback}`}>
                {feedback === 'correct' ? 'Correct! 🎉' : 'Wrong! Try again. ❌'}
              </div>
            )}

            {feedback === 'correct' && (
              <button onClick={fetchQuestion} className="next-btn">
                Next Question ➔
              </button>
            )}

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Root App Component wrapper routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
