import React, { useState, useEffect, useRef } from 'react';

// Custom sound hook using Web Audio API
const useTerminalSounds = () => {
  const audioContext = useRef(null);

  const initAudio = () => {
    if (!audioContext.current && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playKeypress = () => {
    initAudio();
    const ctx = audioContext.current;
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 120 + Math.random() * 40;
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  };

  const playBoot = () => {
    initAudio();
    const ctx = audioContext.current;
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.8);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  };

  const playError = () => {
    initAudio();
    const ctx = audioContext.current;
    if (!ctx) return;
    
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 180;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
      }, i * 120);
    }
  };

  const playSuccess = () => {
    initAudio();
    const ctx = audioContext.current;
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  return { playKeypress, playBoot, playError, playSuccess };
};

const TerminalForum = () => {
  const [bootComplete, setBootComplete] = useState(false);
  const [bootText, setBootText] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('matrix');
  const [activeTopic, setActiveTopic] = useState(null);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Color themes
  const themes = {
    matrix: {
      name: 'Matrix Green',
      primary: 'text-green-400',
      secondary: 'text-green-300',
      accent: 'text-green-500',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-green-400'
    },
    amber: {
      name: 'Amber Classic',
      primary: 'text-amber-400',
      secondary: 'text-amber-300',
      accent: 'text-amber-500',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-amber-400'
    },
    cyan: {
      name: 'Cyan Blue',
      primary: 'text-cyan-400',
      secondary: 'text-cyan-300',
      accent: 'text-cyan-500',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-cyan-400'
    },
    purple: {
      name: 'Purple Haze',
      primary: 'text-purple-400',
      secondary: 'text-purple-300',
      accent: 'text-purple-500',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-purple-400'
    },
    orange: {
      name: 'Orange Fire',
      primary: 'text-orange-400',
      secondary: 'text-orange-300',
      accent: 'text-orange-500',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-orange-400'
    },
    lime: {
      name: 'Lime Glow',
      primary: 'text-lime-400',
      secondary: 'text-lime-300',
      accent: 'text-lime-500',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-lime-400'
    },
    pink: {
      name: 'Pink Neon',
      primary: 'text-pink-400',
      secondary: 'text-pink-300',
      accent: 'text-pink-500',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-pink-400'
    },
    white: {
      name: 'Retro White',
      primary: 'text-gray-100',
      secondary: 'text-gray-200',
      accent: 'text-white',
      error: 'text-red-400',
      bg: 'bg-black',
      cursor: 'bg-gray-100'
    }
  };

  const theme = themes[currentTheme];

  // Initialize sound effects
  const { playKeypress, playBoot, playError, playSuccess } = useTerminalSounds();

  // Mock data
  const [topics, setTopics] = useState([
    { id: 1, title: 'Welcome to Terminal Forum', author: 'admin', content: 'Welcome to our retro terminal forum! Use commands to navigate.\n\nAvailable commands:\n- help: Show all commands\n- topics: List forum topics\n- read [id]: Read a specific topic\n- post: Create a new post\n- members: List community members\n- login: Authenticate with the system\n- clear: Clear terminal history', timestamp: '2025-06-04 10:00' },
    { id: 2, title: 'Best Practices for Clean Code', author: 'dev_master', content: 'Let\'s discuss clean code principles:\n\n1. Write self-documenting code\n2. Keep functions small and focused\n3. Use meaningful variable names\n4. Follow consistent formatting\n5. Write tests for your code\n\nWhat are your favorite clean code practices?', timestamp: '2025-06-04 11:30' },
    { id: 3, title: 'Terminal Shortcuts Every Dev Should Know', author: 'bash_ninja', content: 'Essential terminal shortcuts:\n\n• Ctrl+A: Beginning of line\n• Ctrl+E: End of line\n• Ctrl+L: Clear screen\n• Ctrl+R: Reverse search\n• Ctrl+C: Interrupt process\n• Ctrl+Z: Suspend process\n\nShare your favorite shortcuts!', timestamp: '2025-06-04 12:15' }
  ]);

  const members = [
    { username: 'admin', status: 'online', role: 'Administrator' },
    { username: 'dev_master', status: 'online', role: 'Senior Developer' },
    { username: 'bash_ninja', status: 'away', role: 'DevOps Engineer' },
    { username: 'code_wizard', status: 'offline', role: 'Full Stack Developer' },
    { username: 'terminal_lord', status: 'online', role: 'Systems Architect' }
  ];

  const bootSequence = [
    'Initializing The Salon v2.1.0...',
    'Loading kernel modules...',
    'Mounting filesystems...',
    'Starting network services...',
    'Initializing community database...',
    'Loading user profiles...',
    'Starting forum daemon...',
    'System ready.',
    '',
    '████████╗██╗  ██╗███████╗    ███████╗ █████╗ ██╗      ██████╗ ███╗   ██╗',
    '╚══██╔══╝██║  ██║██╔════╝    ██╔════╝██╔══██╗██║     ██╔═══██╗████╗  ██║',
    '   ██║   ███████║█████╗      ███████╗███████║██║     ██║   ██║██╔██╗ ██║',
    '   ██║   ██╔══██║██╔══╝      ╚════██║██╔══██║██║     ██║   ██║██║╚██╗██║',
    '   ██║   ██║  ██║███████╗    ███████║██║  ██║███████╗╚██████╔╝██║ ╚████║',
    '   ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝',
    '',
    'Welcome to The Salon - Hacker Community Hub',
    'A retro interface for modern developers',
    '',
    'Type "help" for available commands',
    ''
  ];

  useEffect(() => {
    let i = 0;
    let isCancelled = false;


    // Play boot sound at start
    if (soundEnabled) {
      playBoot();
    }
    

    // Bug with duplicate lines
    const typeBootSequence = () => {
      if (isCancelled) return;

      if (i < bootSequence.length) {
        setBootText(prev => prev + bootSequence[i] + '\n');
        i++;
        setTimeout(typeBootSequence, i < 8 ? 200 : 50);
      } else {
        setTimeout(() => {
          if (isCancelled) return;
          setBootComplete(true);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 500);
      }
    };
    typeBootSequence();

    return () => {
        isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bootComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [bootComplete]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, bootText]);

  const addToHistory = (command, output, isError = false) => {
    setHistory(prev => [...prev, { command, output, isError, timestamp: new Date().toLocaleTimeString() }]);
  };

  const executeCommand = (cmd) => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    let isError = false;

    switch (command) {
      case 'help':
        addToHistory(cmd, 
          'Available Commands:\n' +
          '  help          - Show this help message\n' +
          '  topics        - List all forum topics\n' +
          '  read [id]     - Read a specific topic by ID\n' +
          '  post          - Create a new forum post\n' +
          '  members       - List community members\n' +
          '  login [user]  - Login to the system\n' +
          '  logout        - Logout from the system\n' +
          '  whoami        - Show current user\n' +
          '  sound [on|off] - Toggle sound effects\n' +
          '  color [theme]  - Change terminal color theme\n' +
          '  themes         - List available color themes\n' +
          '  clear         - Clear terminal history\n' +
          '  close         - Close the article viewer\n' +
          '  exit          - Exit the terminal'
        );
        break;

      case 'sound':
        if (args[0] === 'off') {
          setSoundEnabled(false);
          addToHistory(cmd, 'Sound effects disabled');
        } else if (args[0] === 'on') {
          setSoundEnabled(true);
          addToHistory(cmd, 'Sound effects enabled');
          if (soundEnabled) playSuccess();
        } else {
          addToHistory(cmd, `Sound is currently ${soundEnabled ? 'ON' : 'OFF'}\nUsage: sound [on|off]`);
        }
        break;

      case 'color':
        if (!args[0]) {
          addToHistory(cmd, `Current theme: ${theme.name}\nUsage: color [theme_name]\nType "themes" to see available options`);
        } else {
          const newTheme = args[0].toLowerCase();
          if (themes[newTheme]) {
            setCurrentTheme(newTheme);
            addToHistory(cmd, `Color theme changed to: ${themes[newTheme].name}`);
          } else {
            addToHistory(cmd, `Theme "${args[0]}" not found. Type "themes" to see available options`, true);
            isError = true;
          }
        }
        break;

      case 'themes':
        const themeList = Object.entries(themes)
          .map(([key, theme]) => `  ${key.padEnd(8)} - ${theme.name}`)
          .join('\n');
        addToHistory(cmd, `Available Color Themes:\n${themeList}\n\nUsage: color [theme_name]`);
        break;

      case 'topics':
        const topicList = topics.map(t => 
          `[${t.id}] ${t.title} - by ${t.author} (${t.timestamp})`
        ).join('\n');
        addToHistory(cmd, `Forum Topics:\n${topicList}\n\nUse "read [id]" to view a topic`);
        break;

      case 'read':
        if (!args[0]) {
          addToHistory(cmd, 'Usage: read [topic_id]', true);
          isError = true;
          break;
        }
        const topicId = parseInt(args[0]);
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          setActiveTopic(topic);
          addToHistory(cmd,
            `Topic #${topic.id}: ${topic.title}\n` +
            `Author: ${topic.author}\n` +
            `Posted: ${topic.timestamp}\n` +
            `${'='.repeat(50)}\n\n` +
            `${topic.content}`
          );
        } else {
          setActiveTopic(null);
          addToHistory(cmd, `Topic #${topicId} not found`, true);
          isError = true;
        }
        break;

      case 'post':
        if (!currentUser) {
          addToHistory(cmd, 'You must be logged in to post. Use "login [username]"', true);
          isError = true;
          break;
        }
        const title = prompt('Enter topic title:');
        const content = prompt('Enter topic content:');
        if (title && content) {
          const newTopic = {
            id: topics.length + 1,
            title,
            author: currentUser,
            content,
            timestamp: new Date().toLocaleString()
          };
          setTopics(prev => [newTopic, ...prev]);
          addToHistory(cmd, `Topic "${title}" created successfully! ID: ${newTopic.id}`);
        } else {
          addToHistory(cmd, 'Post creation cancelled', true);
          isError = true;
        }
        break;

      case 'members':
        const memberList = members.map(m => 
          `${m.username.padEnd(15)} [${m.status.toUpperCase()}] - ${m.role}`
        ).join('\n');
        addToHistory(cmd, `Community Members:\n${memberList}`);
        break;

      case 'login':
        if (!args[0]) {
          addToHistory(cmd, 'Usage: login [username]', true);
          isError = true;
          break;
        }
        const username = args[0];
        const member = members.find(m => m.username === username);
        if (member) {
          setCurrentUser(username);
          addToHistory(cmd, `Welcome back, ${username}! You are now logged in.`);
        } else {
          addToHistory(cmd, `User "${username}" not found`, true);
          isError = true;
        }
        break;

      case 'logout':
        if (currentUser) {
          addToHistory(cmd, `Goodbye, ${currentUser}!`);
          setCurrentUser(null);
        } else {
          addToHistory(cmd, 'You are not logged in', true);
        }
        break;

      case 'whoami':
        addToHistory(cmd, currentUser ? `Current user: ${currentUser}` : 'Not logged in');
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'close':
        if (activeTopic) {
          setActiveTopic(null);
          addToHistory(cmd, 'Closed article view');
        } else {
          addToHistory(cmd, 'No article is currently open');
        }
        break;

      case 'exit':
        addToHistory(cmd, 'Thanks for visiting Terminal Forum! Goodbye.');
        break;

      default:
        isError = true;
        addToHistory(cmd, `Command not found: ${command}\nType "help" for available commands`, true);
    }

    // Play appropriate sound effect
    if (soundEnabled) {
      if (isError) {
        setTimeout(() => playError(), 50);
      } else if (command !== 'sound') {
        setTimeout(() => playSuccess(), 100);
      }
    }
  };

  const handleKeyPress = (e) => {
    // Play keypress sound for any key
    if (soundEnabled && e.key.length === 1) {
      playKeypress();
    }

    if (e.key === 'Enter' && currentInput.trim()) {
      executeCommand(currentInput);
      setCurrentInput('');
    }
  };

  const getPrompt = () => {
    return `${currentUser || 'guest'}@terminal-forum:~$ `;
  };

  if (!bootComplete) {
    return (
      <div className={`h-screen ${theme.bg} ${theme.primary} font-mono p-4 overflow-hidden`}>
        <pre className="whitespace-pre-wrap text-sm leading-tight">
          {bootText}
        </pre>
        <div className={`inline-block w-2 h-4 ${theme.cursor} animate-pulse ml-1`}></div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen ${theme.bg} ${theme.primary} font-mono flex overflow-hidden`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex flex-col flex-1">
        <div
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-black"
        >
          <pre className="whitespace-pre-wrap text-sm leading-tight mb-4">
            {bootText}
          </pre>
        
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <div className={theme.secondary}>
              <span className={theme.accent}>{getPrompt()}</span>
              {entry.command}
            </div>
            <pre className={`whitespace-pre-wrap text-sm mt-1 ${entry.isError ? theme.error : theme.primary}`}>
              {entry.output}
            </pre>
          </div>
        ))}
        
        <div className="flex items-center">
          <span className={theme.accent}>{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`bg-transparent border-none outline-none ${theme.primary} flex-1 font-mono`}
            autoFocus
            spellCheck={false}
          />
          <div className={`w-2 h-4 ${theme.cursor} animate-pulse ml-1`}></div>
        </div>
      </div>
      {activeTopic && (
        <div className="hidden sm:block w-1/2 p-4 border-l border-gray-700 overflow-y-auto">
          <h2 className={`${theme.accent} text-lg mb-1`}>{activeTopic.title}</h2>
          <div className={`${theme.secondary} mb-2`}>Author: {activeTopic.author}</div>
          <pre className="whitespace-pre-wrap text-sm">
            {activeTopic.content}
          </pre>
        </div>
      )}
    </div>
  </div>
  );
};

export default TerminalForum;