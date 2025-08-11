import React, { useState, useEffect, useRef } from 'react';

const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog.',
  'Typing games improve speed and accuracy.',
  'Practice makes perfect for the keyboard ninja.',
];

const getRandomText = () => SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];

const TypingGame = ({ theme }) => {
  const [targetText, setTargetText] = useState(getRandomText());
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second limit
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, 60 - Math.floor(elapsed));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          endGame();
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, finished]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setInput(value);
    if (value === targetText) {
      endGame();
    }
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    setFinished(true);
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = input.length / 5;
    setWpm(Math.round(wordsTyped / elapsedMinutes || 0));
    let correct = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === targetText[i]) correct++;
    }
    setAccuracy(Math.round((correct / targetText.length) * 100));
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    setTargetText(getRandomText());
    setInput('');
    setStartTime(null);
    setTimeLeft(60);
    setFinished(false);
    setWpm(0);
    setAccuracy(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="space-y-4" onClick={e => e.stopPropagation()}>
      <div className={`${theme.accent} text-sm`}>Time Left: {timeLeft}s</div>
      <div className={`${theme.secondary} whitespace-pre-wrap`}>{targetText}</div>
      <input
        ref={inputRef}
        className={`w-full bg-transparent border border-gray-600 p-2 ${theme.primary} font-mono`}
        value={input}
        onChange={handleChange}
        disabled={finished}
        spellCheck={false}
        autoFocus
      />
      {finished && (
        <div className="space-y-2">
          <div>WPM: {wpm}</div>
          <div>Accuracy: {accuracy}%</div>
          <button
            onClick={resetGame}
            className={`mt-2 px-2 py-1 border border-gray-600 ${theme.secondary}`}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingGame;

