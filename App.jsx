import React, { useState, useEffect } from 'react';
import { Moon, Sun, Wifi, WifiOff, Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Replace the URL below with your ACTUAL Render Backend URL
const BACKEND_URL = "https://deepfake-call-detector.onrender.com"; 

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [serverStatus, setServerStatus] = useState('connecting'); // 'online', 'offline', 'connecting'

  // Effect to apply dark/light theme
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    document.body.classList.toggle('light', !darkMode);
  }, [darkMode]);

  // Health check to wake up the Render backend
  useEffect(() => {
    const wakeServer = async () => {
      try {
        // Most Render backends have a /health or / endpoint
        const response = await fetch(`${BACKEND_URL}/health`);
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.error("Backend connection failed:", error);
        setServerStatus('offline');
      }
    };

    wakeServer();
  }, []);

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <div className="logo-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="logo-text">VoiceGuard AI</span>
          </div>

          <div className="nav-right">
            {/* Server Status Badge */}
            <div className={`status-indicator ${serverStatus}`}>
              {serverStatus === 'online' ? <Wifi size={16} /> : 
               serverStatus === 'connecting' ? <Loader2 size={16} className="animate-spin" /> : 
               <WifiOff size={16} />}
              <span>
                {serverStatus === 'online' ? 'System Ready' : 
                 serverStatus === 'connecting' ? 'Waking Server...' : 
                 'Server Offline'}
              </span>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-section"
        >
          <div className="badge">AI-Powered Security</div>
          <h1 className="hero-title">
            Deepfake Voice <br className="break-mobile" /> Call Detector
          </h1>
          <p className="hero-subtitle">
            Upload audio or record from your microphone. Our deep learning model analyzes frequency anomalies to detect AI manipulation.
          </p>
        </motion.div>

        {/* Pass the backend URL to Dashboard as a prop */}
        <Dashboard apiUrl={BACKEND_URL} isServerReady={serverStatus === 'online'} />
      </main>
    </div>
  );
}

export default App;