import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './style.css';

export default function VoiceAssistantPage() {
  const { id } = useParams(); // recipe ID from route
  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const shouldContinueListening = useRef(false);
  const timerIntervalRef = useRef(null);
  const beepPlayedRef = useRef(false);

  // ✅ Fetch recipe on load
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const ref = doc(db, 'recipes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRecipe({ id: snap.id, ...snap.data() });
        } else {
          alert('Recipe not found');
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        alert('Failed to load recipe');
      }
    };

    fetchRecipe();
  }, [id]);

  // ✅ SPEAK
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // ✅ BEEP
  const playBeep = () => {
    const beep = new SpeechSynthesisUtterance('beep');
    beep.volume = 1;
    beep.rate = 1.5;
    window.speechSynthesis.speak(beep);
  };

  // ✅ TIMER EFFECT
  useEffect(() => {
    if (timer <= 10 && timer > 0 && !beepPlayedRef.current) {
      beepPlayedRef.current = true;
      playBeep();
    }

    if (timer === 0 && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      speak('Timer finished!');
    }
  }, [timer]);

  const startTimer = () => {
    if (timerIntervalRef.current) return;
    beepPlayedRef.current = false;
    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    speak('Starting timer');
  };

  const pauseTimer = () => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    speak('Timer paused');
  };

  const handleCommand = (command) => {
    const cmd = command.toLowerCase();

    if (cmd.includes('next')) {
      if (currentStep < recipe.instructions.length - 1) {
        setCurrentStep(currentStep + 1);
        speakStep(currentStep + 1);
      } else {
        speak('You are at the last step.');
      }
    } else if (cmd.includes('back') || cmd.includes('previous') || cmd.includes('go back')) {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        speakStep(currentStep - 1);
      } else {
        speak('You are at the first step.');
      }
    } else if (cmd.includes('repeat')) {
      speakStep(currentStep);
    } else if (cmd.includes('start timer')) {
      if (recipe.instructions[currentStep]?.timer) {
        const seconds = parseTimer(recipe.instructions[currentStep].timer);
        setTimer(seconds);
        startTimer();
      } else {
        speak('No timer found in this step.');
      }
    } else if (cmd.includes('pause timer') || cmd.includes('stop timer')) {
      pauseTimer();
    } else if (cmd.includes('stop listening') || cmd.includes('stop')) {
      stopListening();
    } else {
      speak('Sorry, I did not understand that command.');
    }
  };

  const parseTimer = (text) => {
    const match = /(\d+)\s*min/.exec(text);
    return match ? parseInt(match[1], 10) * 60 : 0;
  };

  const speakStep = (index) => {
    const step = recipe.instructions[index];
    if (typeof step === 'string') {
      speak(step);
    } else if (typeof step === 'object') {
      speak(step.text);
    }
  };

  const startListening = () => {
    if (listening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognitionRef.current = recognition;
    setListening(true);
    shouldContinueListening.current = true;

    recognition.start();

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const userCommand = event.results[i][0].transcript;
          console.log('Recognized:', userCommand);
          handleCommand(userCommand);
        }
      }
    };

    recognition.onend = () => {
      if (shouldContinueListening.current) {
        recognition.start();
      } else {
        setListening(false);
      }
    };

    recognition.onerror = (e) => {
      console.error(e.error);
      setListening(false);
      shouldContinueListening.current = false;
    };
  };

  const stopListening = () => {
    shouldContinueListening.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
    speak('Stopped listening');
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!recipe) {
    return (
      <div className="page">
        <div className="container">Loading recipe...</div>
      </div>
    );
  }

  const currentInstruction = recipe.instructions[currentStep];
  const stepText = typeof currentInstruction === 'string' ? currentInstruction : currentInstruction.text;

  return (
    <div className="page" id="voice">
      <div className="voice-mode">
        <div className="voice-step">
          <div className="voice-step-number">
            Step {currentStep + 1} of {recipe.instructions.length}
          </div>
          <div className="voice-step-text">{stepText}</div>
          <div className="voice-timer">Timer: {formatTime(timer)}</div>
        </div>

        <div className="voice-controls">
          <button
            className="btn btn-voice"
            title="Listen for voice commands"
            onClick={startListening}
            disabled={listening}
          >
            {listening ? '🎙️ Listening...' : '🎤'}
          </button>

          <button className="btn btn-danger" onClick={stopListening} disabled={!listening}>
            🛑 Stop Listening
          </button>

          <button className="btn btn-secondary btn-large" onClick={() => handleCommand('previous')}>
            ⏮️ Previous
          </button>

          <button className="btn btn-primary btn-large" onClick={() => handleCommand('next')}>
            Next ⏭️
          </button>

          <button className="btn btn-outline btn-large" onClick={pauseTimer}>
            ⏸️ Pause Timer
          </button>
        </div>

        <div style={{ marginTop: '2rem', color: 'var(--text-light)' }}>
          <p>Say: "Next step", "Repeat", "Start timer", "Pause timer", "Go back", "Stop listening"</p>
        </div>
      </div>
    </div>
  );
}
