import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './Game.css';



// Main Game Component (extracted from original App)
const Game = () => {
  const location = useLocation();
  const difficulty = location.state?.difficulty || 'medium';

  const [questionUrl, setQuestionUrl] = useState('');
  const [solution, setSolution] = useState(null);
  const [score, setScore] = useState(0); // This will track totalScore
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');

  // Timer and Score System
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(null);

  const inputRef = useRef(null);

  const timeLimit = difficulty === 'hard' ? 40 : difficulty === 'medium' ? 50 : 60;

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= timeLimit) {
            setIsActive(false);
            setIsTimeOver(true);
            return timeLimit;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLimit]);

  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setInputValue('');
    setPointsEarned(null);
    setSeconds(0);
    setIsActive(false);
    setIsTimeOver(false);

    try {
      const response = await fetch('https://marcconrad.com/uob/banana/api.php');
      const data = await response.json();
      setQuestionUrl(data.question);
      setSolution(data.solution);
      setIsActive(true); // Start tracking time

    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoading(false);
      // Focus input after loading
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue === '') return;

    const numValue = parseInt(inputValue, 10);
    if (numValue === solution) {
      setIsActive(false); // Stop the timer
      setFeedback('correct');

      let points = 50;
      
      if (difficulty === 'easy') {
        if (seconds <= 15) points = 100;
        else if (seconds <= 25) points = 80;
        else if (seconds <= 35) points = 70;
        else if (seconds <= 45) points = 60;
      } else if (difficulty === 'hard') {
        if (seconds <= 7) points = 100;
        else if (seconds <= 15) points = 80;
        else if (seconds <= 25) points = 70;
        else if (seconds <= 35) points = 60;
      } else {
        // Medium (default)
        if (seconds <= 10) points = 100;
        else if (seconds <= 20) points = 80;
        else if (seconds <= 30) points = 70;
        else if (seconds <= 40) points = 60;
      }

      setPointsEarned(points);

      // Send to backend
      const username = localStorage.getItem('banana_username');
      if (username) {
        try {
          const res = await fetch('http://localhost:5000/api/scores/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, pointsToAdd: points })
          });
          const data = await res.json();
          if (data.totalScore !== undefined) {
            setScore(data.totalScore);
          } else {
            setScore(s => s + points);
          }
        } catch (error) {
          console.error('Error updating score', error);
          setScore(s => s + points);
        }
      } else {
        setScore(s => s + points);
      }
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">Banana Math</h1>
        <div className="score-area">
          <div style={{ marginRight: '20px', fontSize: '1rem', color: '#ffcc00' }}>Difficulty: <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{difficulty}</span></div>
          <div className="score">Total Score: <span className="score-value">{score}</span></div>
        </div>
      </div>

      <div className="game-card">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <div className="timer" style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold' }}>
              Time: {seconds}s
            </div>
            <div className="puzzle-image-container" style={{ filter: isTimeOver ? 'blur(4px)' : 'none', opacity: isTimeOver ? 0.5 : 1 }}>
              <img src={questionUrl} alt="Math Puzzle" className="puzzle-image" />
            </div>

            {isTimeOver && (
              <div className="modal-overlay">
                <div className="time-over-modal">
                  <h2 style={{ fontSize: '2.5rem', color: '#ff4757', marginBottom: '15px' }}>Time Over!</h2>
                  <p style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#fff' }}>
                    Oops! You ran out of time for this puzzle.
                  </p>
                  <button onClick={fetchQuestion} className="next-btn" style={{ margin: 0 }}>
                    Next Question ➔
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="input-section" style={{ visibility: isTimeOver ? 'hidden' : 'visible' }}>
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
                {feedback === 'correct' ? (
                  <>Correct! 🎉 <br /><small>Time: {seconds}s (+{pointsEarned} pts)</small></>
                ) : 'Wrong! Try again. ❌'}
              </div>
            )}

            {feedback === 'correct' && (
              <button onClick={fetchQuestion} className="next-btn">
                Next Question ➔
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Game;