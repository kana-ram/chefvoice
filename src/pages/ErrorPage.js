import React from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'; // use your existing CSS

export default function ErrorPage() {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/home');
  };

  return (
    <div className="page" id="error">
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🍳</div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '3rem',
            marginBottom: '1rem',
          }}
        >
          Oops! Something went wrong
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-light)',
            marginBottom: '2rem',
          }}
        >
          The recipe you're looking for seems to have burned!
        </p>
        <div>
          <button className="btn btn-primary btn-large" onClick={handleBackHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
