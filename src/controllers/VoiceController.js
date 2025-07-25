import React, { useState, useRef } from 'react';

const VoiceController = () => {
  const [list, setList] = useState([
    { id: 1, text: 'Preheat the oven to 180°C', done: false },
    { id: 2, text: 'Mix the flour and sugar', done: false },
    { id: 3, text: 'Add the eggs and milk', done: false },
    { id: 4, text: 'Bake for 25 minutes', done: false }
  ]);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('SpeechRecognition is not supported in this browser.');
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    return recognition;
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (listening) return;
    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setListening(true);

    recognition.start();

    recognition.onresult = (event) => {
      const userCommand = event.results[0][0].transcript.toLowerCase();
      console.log('Recognized:', userCommand);
      setTranscript(userCommand);
      handleCommand(userCommand);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (e) => {
      console.error(e.error);
      setListening(false);
    };
  };

  const handleCommand = (command) => {
    if (command.includes('next')) {
      handleNext();
    } else if (command.includes('repeat')) {
      handleRepeat();
    } else if (command.includes('mark') || command.includes('done')) {
      handleMarkDone();
    } else if (command.includes('list') || command.includes('show')) {
      handleReadList();
    } else {
      speak(`Sorry, I didn't understand the command.`);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < list.length) {
      const step = list[currentStepIndex];
      speak(`Step ${step.id}: ${step.text}`);
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      speak('You have completed all the steps!');
    }
  };

  const handleRepeat = () => {
    if (currentStepIndex === 0) {
      speak('No step to repeat yet. Say "next" to start.');
    } else {
      const step = list[currentStepIndex - 1];
      speak(`Repeating step ${step.id}: ${step.text}`);
    }
  };

  const handleMarkDone = () => {
    if (currentStepIndex === 0) {
      speak('No step to mark done yet. Say "next" to start.');
    } else {
      const lastStepIndex = currentStepIndex - 1;
      const updatedList = list.map((item, idx) =>
        idx === lastStepIndex ? { ...item, done: true } : item
      );
      setList(updatedList);
      speak(`Marked step ${updatedList[lastStepIndex].id} as done.`);
    }
  };

  const handleReadList = () => {
    const remaining = list.filter(item => !item.done);
    if (remaining.length === 0) {
      speak('All items are done!');
    } else {
      const text = remaining.map(item => item.text).join(', ');
      speak(`Remaining steps are: ${text}`);
    }
  };

  return (
    <div className="voice-controller" style={{ padding: '20px' }}>
      <h2>Voice Command Controller</h2>
      <button onClick={startListening} disabled={listening}>
        {listening ? 'Listening...' : 'Start Listening'}
      </button>
      <p><strong>Last Command:</strong> {transcript}</p>
      <h3>Checklist:</h3>
      <ul>
        {list.map(item => (
          <li key={item.id} style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
            {item.text} {item.done && '✅'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VoiceController;
