import React, { useState, useEffect, useRef } from 'react';

const TerminalForum = () => {
  const [bootComplete, setBootComplete] = useState(false);
  const [bootText, setBootText] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

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
    'Initializing Terminal Forum v2.1.0...',
    'Loading kernel modules...',
    'Mounting filesystems...',
    'Starting network services...',
    'Initializing community database...',
    'Loading user profiles...',
    'Starting forum daemon...',
    'System ready.',
    '',
    '████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     ',
    '╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     ',
    '   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     ',
    '   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     ',
    '   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗',
    '   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝',
    '',
    '███████╗ ██████╗ ██████╗ ██╗   ██╗███╗   ███╗',
    '██╔════╝██╔═══██╗██╔══██╗██║   ██║████╗ ████║',
    '█████╗  ██║   ██║██████╔╝██║   ██║██╔████╔██║',
    '██╔══╝  ██║   ██║██╔══██╗██║   ██║██║╚██╔╝██║',
    '██║     ╚██████╔╝██║  ██║╚██████╔╝██║ ╚═╝ ██║',
    '╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝',
    '',
    'Welcome to Terminal Forum - Hacker Community Hub',
    'A retro interface for modern developers',
    '',
    'Type "help" for available commands',
    ''
  ];

  useEffect(() => {
    let i = 0;
    const typeBootSequence = () => {
      if (i < bootSequence.length) {
        setBootText(prev => prev + bootSequence[i] + '\n');
        i++;
        setTimeout(typeBootSequence, i < 8 ? 200 : 50);
      } else {
        setTimeout(() => {
          setBootComplete(true);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 500);
      }
    };
    typeBootSequence();
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
          '  clear         - Clear terminal history\n' +
          '  exit          - Exit the terminal'
        );
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
          break;
        }
        const topicId = parseInt(args[0]);
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          addToHistory(cmd, 
            `Topic #${topic.id}: ${topic.title}\n` +
            `Author: ${topic.author}\n` +
            `Posted: ${topic.timestamp}\n` +
            `${'='.repeat(50)}\n\n` +
            `${topic.content}`
          );
        } else {
          addToHistory(cmd, `Topic #${topicId} not found`, true);
        }
        break;

      case 'post':
        if (!currentUser) {
          addToHistory(cmd, 'You must be logged in to post. Use "login [username]"', true);
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
          break;
        }
        const username = args[0];
        const member = members.find(m => m.username === username);
        if (member) {
          setCurrentUser(username);
          addToHistory(cmd, `Welcome back, ${username}! You are now logged in.`);
        } else {
          addToHistory(cmd, `User "${username}" not found`, true);
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

      case 'exit':
        addToHistory(cmd, 'Thanks for visiting Terminal Forum! Goodbye.');
        break;

      default:
        addToHistory(cmd, `Command not found: ${command}\nType "help" for available commands`, true);
    }
  };

  const handleKeyPress = (e) => {
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
      <div className="h-screen bg-black text-green-400 font-mono p-4 overflow-hidden">
        <pre className="whitespace-pre-wrap text-sm leading-tight">
          {bootText}
        </pre>
        <div className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1"></div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen bg-black text-green-400 font-mono flex flex-col overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-black"
      >
        <pre className="whitespace-pre-wrap text-sm leading-tight mb-4">
          {bootText}
        </pre>
        
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <div className="text-green-300">
              <span className="text-green-500">{getPrompt()}</span>
              {entry.command}
            </div>
            <pre className={`whitespace-pre-wrap text-sm mt-1 ${entry.isError ? 'text-red-400' : 'text-green-400'}`}>
              {entry.output}
            </pre>
          </div>
        ))}
        
        <div className="flex items-center">
          <span className="text-green-500">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-transparent border-none outline-none text-green-400 flex-1 font-mono"
            autoFocus
            spellCheck={false}
          />
          <div className="w-2 h-4 bg-green-400 animate-pulse ml-1"></div>
        </div>
      </div>
    </div>
  );
};

export default TerminalForum;