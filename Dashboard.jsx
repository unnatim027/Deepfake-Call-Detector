import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Mic, Square, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorToast, setErrorToast] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (errorToast) {
      const t = setTimeout(() => setErrorToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [errorToast]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && (uploadedFile.name.endsWith('.wav') || uploadedFile.name.endsWith('.mp3'))) {
      setFile(uploadedFile);
      setAudioUrl(URL.createObjectURL(uploadedFile));
      setResult(null);
    } else {
      setErrorToast('Please upload a valid .wav or .mp3 file');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const generatedFile = new File([audioBlob], "recorded_audio.wav", { type: 'audio/wav' });
        setFile(generatedFile);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setResult(null);
      setFile(null);
      setAudioUrl(null);
    } catch (err) {
      setErrorToast('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeAudio = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setErrorToast('Failed to connect to analysis server');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {errorToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="toast-error"
          >
            <ShieldAlert size={20} />
            {errorToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cards-grid">
        {/* Upload Card */}
        <motion.div whileHover={{ scale: 1.01 }} className="action-card group-hover-effect">
          <div className="card-bg-gradient upload-gradient"></div>
          <div className="card-content">
            <div className="icon-wrapper upload-icon">
              <UploadCloud size={32} />
            </div>
            <div className="card-text">
              <h3>Upload Audio</h3>
              <p>.wav or .mp3 formats</p>
            </div>
            
            <label className="btn-primary">
              Select File
              <input type="file" className="hidden-input" accept=".wav,.mp3" onChange={handleFileUpload} />
            </label>
          </div>
        </motion.div>

        {/* Record Card */}
        <motion.div whileHover={{ scale: 1.01 }} className="action-card group-hover-effect">
          <div className="card-bg-gradient record-gradient"></div>
          <div className="card-content">
            <div className={`icon-wrapper ${isRecording ? 'recording-active' : 'record-icon'}`}>
              <Mic size={32} />
            </div>
            <div className="card-text">
              <h3>Record Voice</h3>
              <p>Use your microphone</p>
            </div>
            
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
            >
              {isRecording ? (
                <><Square size={16} fill="currentColor" /> Stop Recording</>
              ) : (
                <><Mic size={16} /> Start Recording</>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Analysis Area */}
      <AnimatePresence mode="wait">
        {file && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="analysis-container"
          >
            <h3 className="file-name">{file.name}</h3>
            
            {audioUrl && (
              <audio controls src={audioUrl} className="audio-player" />
            )}

            {!result && (
              <button
                onClick={analyzeAudio}
                disabled={isAnalyzing}
                className="btn-analyze"
              >
                {isAnalyzing ? (
                  <><Loader2 size={24} className="spinner" /> Analyzing Deep Audio Signals...</>
                ) : (
                  <><ShieldAlert size={20} /> Analyze Audio</>
                )}
              </button>
            )}

            {/* Results Display */}
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`result-box ${result.prediction === 'real' ? 'result-real' : 'result-fake'}`}
              >
                <div className="result-header">
                  {result.prediction === 'real' ? (
                    <ShieldCheck size={32} className="icon-success" />
                  ) : (
                    <ShieldAlert size={32} className="icon-danger" />
                  )}
                  <h2 className="result-title">
                    {result.prediction === 'real' ? 'Real Voice' : 'Deepfake Detected'}
                  </h2>
                </div>
                
                <div className="confidence-section">
                  <div className="confidence-labels">
                    <span>Confidence Score</span>
                    <span>{result.confidence}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`progress-fill ${result.prediction === 'real' ? 'fill-success' : 'fill-danger'}`}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => { setFile(null); setResult(null); setAudioUrl(null); }}
                  className="btn-reset"
                >
                  Analyze another file
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
