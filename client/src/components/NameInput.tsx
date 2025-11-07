'use client';

import { useState, useEffect } from 'react';

interface NameInputProps {
  onNameSubmit: (name: string) => void;
}

export default function NameInput({ onNameSubmit }: NameInputProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Try to load saved name from localStorage
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      setError('Please enter a name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }

    // Only allow letters, numbers, spaces, and basic punctuation
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
      setError('Name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    // Save to localStorage
    localStorage.setItem('playerName', trimmedName);

    // Submit the name
    onNameSubmit(trimmedName);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#2a2a2a',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h2
          style={{
            color: '#fff',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            textAlign: 'center',
          }}
        >
          Welcome to the Town!
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="playerName"
              style={{
                display: 'block',
                color: '#ccc',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              Enter your name:
            </label>
            <input
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Your display name"
              autoFocus
              maxLength={20}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '4px',
                border: error ? '2px solid #ff6b6b' : '2px solid #444',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: '#ff6b6b',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                marginTop: '-0.5rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#4dabf7',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#339af0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4dabf7';
            }}
          >
            Join Game
          </button>
        </form>

        <p
          style={{
            color: '#888',
            fontSize: '0.75rem',
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          Your name will be visible to other players
        </p>
      </div>
    </div>
  );
}
