import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure auth is exported correctly
import './style.css';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: 'Unknown User',
    email: 'unknown@gmail.com',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'Authenticated User',
          email: firebaseUser.email || 'No email provided',
        });
      } else {
        // user is logged out or unauthenticated
        setUser({
          name: 'Unknown User',
          email: 'unknown@gmail.com',
        });
      }
    });

    return () => unsubscribe(); // Clean up the observer on unmount
  }, []);

  const [settings, setSettings] = useState({
    voiceCommands: true,
    voicePrompts: true,
    wakeWord: false,
    autoStartTimers: true,
    stepConfirmations: false,
    timerAlerts: true,
    newRecipeAlerts: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/auth'); // Go back to login page
    } catch (err) {
      console.error('Error signing out:', err);
      alert('Error signing out.');
    }
  };

  return (
    <div className="page" id="profile">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">👤</div>
            <h2>{user.name}</h2>
            <p style={{ color: 'var(--text-light)' }}>{user.email}</p>
          </div>

          <div className="settings-section">
            <h3 className="settings-title">Voice Settings</h3>
            {[
              { key: 'voiceCommands', label: 'Voice Commands', desc: 'Enable voice control during cooking' },
              { key: 'voicePrompts', label: 'Voice Prompts', desc: 'Receive audio instructions' },
              { key: 'wakeWord', label: 'Wake Word', desc: 'Use "Hey Chef" to activate' },
            ].map(({ key, label, desc }) => (
              <div className="setting-item" key={key}>
                <div>
                  <div style={{ fontWeight: 500 }}>{label}</div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{desc}</div>
                </div>
                <div
                  className={`toggle ${settings[key] ? 'active' : ''}`}
                  onClick={() => toggleSetting(key)}
                ></div>
              </div>
            ))}
          </div>

          <div className="settings-section">
            <h3 className="settings-title">Cooking Preferences</h3>
            {[
              { key: 'autoStartTimers', label: 'Auto-start Timers', desc: 'Automatically start cooking timers' },
              { key: 'stepConfirmations', label: 'Step Confirmations', desc: 'Ask for confirmation before next step' },
            ].map(({ key, label, desc }) => (
              <div className="setting-item" key={key}>
                <div>
                  <div style={{ fontWeight: 500 }}>{label}</div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{desc}</div>
                </div>
                <div
                  className={`toggle ${settings[key] ? 'active' : ''}`}
                  onClick={() => toggleSetting(key)}
                ></div>
              </div>
            ))}
          </div>

          <div className="settings-section">
            <h3 className="settings-title">Notifications</h3>
            {[
              { key: 'timerAlerts', label: 'Timer Alerts', desc: 'Get notified when timers finish' },
              { key: 'newRecipeAlerts', label: 'New Recipe Alerts', desc: 'Notify about new featured recipes' },
            ].map(({ key, label, desc }) => (
              <div className="setting-item" key={key}>
                <div>
                  <div style={{ fontWeight: 500 }}>{label}</div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{desc}</div>
                </div>
                <div
                  className={`toggle ${settings[key] ? 'active' : ''}`}
                  onClick={() => toggleSetting(key)}
                ></div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button className="btn btn-outline" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
