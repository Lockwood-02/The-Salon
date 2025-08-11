import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('matrix');
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);
  const editableFields = ['display_name', 'bio'];
  const [forumMode, setForumMode] = useState(false);
  const [forumPosts, setForumPosts] = useState([]);
  const [forumPage, setForumPage] = useState(1);
  const [newsMode, setNewsMode] = useState(false);
  const [newsPosts, setNewsPosts] = useState([]);
  const [newsPage, setNewsPage] = useState(1);
  const [newsArticles, setNewsArticles] = useState([]);
  const [activeNews, setActiveNews] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postStep, setPostStep] = useState(1);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsStep, setNewsStep] = useState(1);
  const postTitleRef = useRef(null);
  const postContentRef = useRef(null);
  const newsTitleRef = useRef(null);
  const newsContentRef = useRef(null);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const navigate = useNavigate();

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
  const [topics, setTopics] = useState([]);

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
    const fetchTopics = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/posts');
        const posts = res.data.map(p => ({
          id: p.id,
          title: p.title,
          author: p.author,
          content: p.content,
          timestamp: new Date(p.timestamp).toLocaleString(),
        }));
        setTopics(posts);
      } catch (err) {
        console.error('Failed to load posts', err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/news');
        const posts = res.data.map(p => ({
          id: p.id,
          title: p.title,
          author: p.author,
          content: p.content,
          timestamp: new Date(p.timestamp).toLocaleString(),
        }));
        setNewsArticles(posts);
      } catch (err) {
        console.error('Failed to load news', err);
      }
    };
    fetchNews();
  }, []);

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

      if (i < bootSequence.length - 1) {
        setBootText(prev => prev + bootSequence[i] + '\n');
        i++;
        setTimeout(typeBootSequence, i < 8 ? 200 : 50);
        // console.log(i);
        // console.log(bootSequence[i]);
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

  useEffect(() => {
    if (isCreatingPost) {
      if (postStep === 1) {
        postTitleRef.current?.focus();
      } else {
        postContentRef.current?.focus();
      }
    } else if (isCreatingNews) {
      if (newsStep === 1) {
        newsTitleRef.current?.focus();
      } else {
        newsContentRef.current?.focus();
      }
    }
  }, [isCreatingPost, postStep, isCreatingNews, newsStep]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (activeTopic || activeProfile || forumMode || isCreatingPost || newsMode || isCreatingNews || activeNews) {
          setActiveTopic(null);
          setActiveNews(null);
          setActiveProfile(null);
          setIsEditingProfile(false);
          setProfileDraft(null);
          setForumMode(false);
          setForumPosts([]);
          setForumPage(1);
          setNewsMode(false);
          setNewsPosts([]);
          setNewsPage(1);
          setIsCreatingPost(false);
          setPostTitle('');
          setPostContent('');
          setPostStep(1);
          setIsCreatingNews(false);
          setNewsTitle('');
          setNewsContent('');
          setNewsStep(1);
          addToHistory('esc', 'Closed active pane via Esc key');
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [activeTopic, activeProfile, forumMode, isCreatingPost, newsMode, isCreatingNews, activeNews]);

  const addToHistory = (command, output, isError = false) => {
    setHistory(prev => [...prev, { command, output, isError, timestamp: new Date().toLocaleTimeString() }]);
  };

  const submitPost = async () => {
    if (!postTitle.trim() || !postContent.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:4000/api/posts',
        { title: postTitle, content: postContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTopic = {
        id: res.data.id,
        title: res.data.title,
        author: currentUser.username,
        content: res.data.content,
        timestamp: new Date(res.data.timestamp).toLocaleString(),
      };
      setTopics(prev => [newTopic, ...prev]);
      if (forumMode) {
        setForumPosts(prev => [newTopic, ...prev]);
      }
      addToHistory('post', `Topic "${postTitle}" created successfully! ID: ${newTopic.id}`);
      // Move cursor to main terminal 
      setIsCreatingPost(false);
      setPostTitle('');
      setPostContent('');
      setPostStep(1);
      inputRef.current?.focus();
    } catch (err) {
      addToHistory('post', err.response?.data?.error || 'Failed to create post', true);
    }
  };

  const submitNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:4000/api/news',
        { title: newsTitle, content: newsContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newArticle = {
        id: res.data.id,
        title: res.data.title,
        author: currentUser.username,
        content: res.data.content,
        timestamp: new Date(res.data.timestamp).toLocaleString(),
      };
      setNewsArticles(prev => [newArticle, ...prev]);
      if (newsMode) {
        setNewsPosts(prev => [newArticle, ...prev]);
      }
      addToHistory('post news', `Article "${newsTitle}" created successfully! ID: ${newArticle.id}`);
      setIsCreatingNews(false);
      setNewsTitle('');
      setNewsContent('');
      setNewsStep(1);
      inputRef.current?.focus();
    } catch (err) {
      addToHistory('post news', err.response?.data?.error || 'Failed to create article', true);
    }
  };

  /* Show who you are logged in as upon boot
  useEffect(() => {
    if (currentUser) {
      addToHistory('system', `Logged in as ${currentUser.display_name || currentUser.username}`);
    }
  }, []);
  */
  

  const executeCommand = async (cmd) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);
    let isError = false;

    switch (command) {
      case 'help':
        const adminHelp = currentUser?.role === 'admin' ? '  admin         - Admin tools\n' : '';
        if (args[0] === '-a') {
          addToHistory(cmd,
          'Available Commands:\n' +
          '  help          - Show this help message\n' +
          '  topics        - List all forum topics\n' +
          '  forum         - Opens the forum side panel\n' +
          '  news          - Opens the news side panel\n' +
          '  read [id]     - Read a specific topic by ID\n' +
          '  read news [id]- Read a news article by ID\n' +
          '  post          - Create a new forum post\n' +
          '  post news     - Create a news article\n' +
          '  members       - List community members\n' +
          '  visit [user]  - View a user\'s profile\n' +
          '  edit profile  - Edit your profile\n' +
          '  register      - Register to the system\n' +
          '  login         - Login to the system\n' +
          '  logout        - Logout from the system\n' +
          adminHelp +
          '  whoami        - Show current user\n' +
          '  sound [on|off] - Toggle sound effects\n' +
          '  color [theme]  - Change terminal color theme\n' +
          '  themes        - List available color themes\n' +
          '  clear         - Clear terminal history\n' +
          '  close         - Close the article viewer\n' +
          '  save          - Save profile changes (edit mode)\n' +
          '  exit          - Exit the terminal'
        );
        } else if (args[0] === '-f') { // Forum/News commands
          addToHistory(cmd,
          'Available Commands:\n' +
          '  forum         - Opens the forum side panel\n' +
          '  news          - Opens the news side panel\n' +
          '  read [id]     - Read a specific topic by ID\n' +
          '  read news [id]- Read a news article by ID\n' +
          '  post          - Create a new forum post\n' +
          '  post news     - Create a news article\n' +
          '  topics        - List all forum topics\n' +
          '  close         - Close the article viewer\n'
        );
        } else if (args[0] === '-p') { // Profile commands
          addToHistory(cmd, 
          'Available Commands:\n' +
          '  register      - Register to the system\n' +
          '  login         - Login to the system\n' +
          '  visit [user]  - View a user\'s profile\n' +
          '  edit profile  - Edit your profile\n' +
          '  logout        - Logout from the system\n' +
          '  whoami        - Show current user\n' +
          '  members       - List community members\n' +
          '  save          - Save profile changes (edit mode)\n'
        );
        } else if (args[0] === '-s') { // System commands
          addToHistory(cmd, 
          'Available Commands:\n' +
          '  sound [on|off] - Toggle sound effects\n' +
          '  color [theme]  - Change terminal color theme\n' +
          '  themes        - List available color themes\n' +
          '  clear         - Clear terminal history\n' +
          '  close         - Close the article viewer\n' +
          '  exit          - Exit the terminal'
        );
        } else { // Basics commands
          addToHistory(cmd, 
          'Available Commands:\n' +
          '  help          - Show this help message\n' +
          '  help -f       - Show forum commands | topics, forum, reading and posting\n' +
          '  help -p       - Show profile & account commands | login, register, profile management\n' +
          '  help -s       - Show system commands | sound, color, themes, clear, exit\n' +
          '\n' +
          '  help -a       - Show all commands' 
        );
        }

        
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

      case 'forum':
        setActiveProfile(null);
        setActiveTopic(null);
        setActiveNews(null);
        setIsEditingProfile(false);
        setProfileDraft(null);
        setNewsMode(false);
        setNewsPosts([]);
        setNewsPage(1);
        setForumMode(true);
        setForumPosts(topics);
        setForumPage(1);
        addToHistory(cmd, 'Entering forum mode. Use "search <text>" to filter, "page <n>" to navigate, or "read <id>" to view a post.');
        break;

      case 'news':
        setActiveProfile(null);
        setActiveTopic(null);
        setActiveNews(null);
        setIsEditingProfile(false);
        setProfileDraft(null);
        setForumMode(false);
        setForumPosts([]);
        setForumPage(1);
        setNewsMode(true);
        setNewsPosts(newsArticles);
        setNewsPage(1);
        addToHistory(cmd, 'Entering news mode. Use "page <n>" to navigate or "read news <id>" to view an article.');
        break;

      case 'search':
        if (!forumMode) {
          addToHistory(cmd, 'Search is only available in forum mode', true);
          isError = true;
          break;
        }
        if (!args.length) {
          addToHistory(cmd, 'Usage: search <text>', true);
          isError = true;
          break;
        }
        const query = args.join(' ').toLowerCase();
        const filtered = topics.filter(t => t.title.toLowerCase().includes(query));
        setForumPosts(filtered);
        setForumPage(1);
        addToHistory(cmd, `Found ${filtered.length} post${filtered.length === 1 ? '' : 's'} matching "${query}"`);
        break;

      case 'page':
        if (forumMode) {
          const pageNum = parseInt(args[0]);
          const totalPages = Math.max(1, Math.ceil(forumPosts.length / 10));
          if (!pageNum || pageNum < 1 || pageNum > totalPages) {
            addToHistory(cmd, `Invalid page number. Enter a number between 1 and ${totalPages}`, true);
            isError = true;
          } else {
            setForumPage(pageNum);
            addToHistory(cmd, `Switched to page ${pageNum}`);
          }
        } else if (newsMode) {
          const pageNum = parseInt(args[0]);
          const totalPages = Math.max(1, Math.ceil(newsPosts.length / 10));
          if (!pageNum || pageNum < 1 || pageNum > totalPages) {
            addToHistory(cmd, `Invalid page number. Enter a number between 1 and ${totalPages}`, true);
            isError = true;
          } else {
            setNewsPage(pageNum);
            addToHistory(cmd, `Switched to page ${pageNum}`);
          }
        } else {
          addToHistory(cmd, 'Page command is only available in forum or news mode', true);
          isError = true;
        }
        break;

      case 'topics':
        const topicList = topics.map(t => 
          `[${t.id}] ${t.title} - by ${t.author} (${t.timestamp})`
        ).join('\n');
        addToHistory(cmd, `Forum Topics:\n${topicList}\n\nUse "read [id]" to view a topic`);
        break;

      case 'read':
        if (!args[0]) {
          addToHistory(cmd, 'Usage: read [topic_id] or read news [id]', true);
          isError = true;
          break;
        }
        if (args[0] === 'news') {
          const articleId = parseInt(args[1]);
          if (!articleId) {
            addToHistory(cmd, 'Usage: read news [id]', true);
            isError = true;
            break;
          }
          const article = newsArticles.find(n => n.id === articleId);
          if (article) {
            setActiveProfile(null);
            setActiveTopic(null);
            setActiveNews(article);
            setIsEditingProfile(false);
            setProfileDraft(null);
            addToHistory(cmd, `Opening news #${articleId} in reader pane...`);
          } else {
            setActiveNews(null);
            addToHistory(cmd, `News #${articleId} not found`, true);
            isError = true;
          }
        } else {
          const topicId = parseInt(args[0]);
          const topic = topics.find(t => t.id === topicId);
          if (topic) {
            setActiveProfile(null);
            setActiveTopic(topic);
            setIsEditingProfile(false);
            setProfileDraft(null);
            addToHistory(cmd, `Opening topic #${topicId} in reader pane...`);
          } else {
            setActiveTopic(null);
            addToHistory(cmd, `Topic #${topicId} not found`, true);
            isError = true;
          }
        }
        break;

        case 'post':
          if (!currentUser) {
            addToHistory(cmd, 'You must be logged in to post. Use "login"', true);
            isError = true;
            break;
          }
          if (args[0] === 'news') {
            if (!['creator', 'admin'].includes(currentUser.role)) {
              addToHistory(cmd, 'Insufficient permissions to create news articles', true);
              isError = true;
              break;
            }
            setActiveTopic(null);
            setActiveNews(null);
            setActiveProfile(null);
            setIsEditingProfile(false);
            setProfileDraft(null);
            setIsCreatingNews(true);
            setNewsTitle('');
            setNewsContent('');
            setNewsStep(1);
            addToHistory(cmd, 'Opening news editor...');
          } else {
            setActiveTopic(null);
            setActiveNews(null);
            setActiveProfile(null);
            setIsEditingProfile(false);
            setProfileDraft(null);
            setIsCreatingPost(true);
            setPostTitle('');
            setPostContent('');
            setPostStep(1);
            addToHistory(cmd, 'Opening post editor...');
          }
          break;
        

      case 'members':
        const memberList = members.map(m => 
          `${m.username.padEnd(15)} [${m.status.toUpperCase()}] - ${m.role}`
        ).join('\n');
        addToHistory(cmd, `Community Members:\n${memberList}`);
        break;

      case 'visit':
        if (!args[0]) {
          addToHistory(cmd, 'Usage: search [username]', true);
          isError = true;
          break;
        }
        try {
          const res = await axios.get(`http://localhost:4000/api/users/${args[0]}`);
          setActiveTopic(null);
          setIsEditingProfile(false);
          setProfileDraft(null);
          setActiveProfile(res.data);
          addToHistory(cmd, `Displaying profile for ${res.data.username}...`);
        } catch (err) {
          setActiveProfile(null);
          const message = err.response?.status === 404
            ? `User "${args[0]}" not found`
            : err.response?.data?.error || 'Failed to fetch profile';
          addToHistory(cmd, message, true);
          isError = true;
        }
        break;

        case 'edit': {
          if (args[0] === 'profile') {
            if (!currentUser) {
              addToHistory(cmd, 'You must be logged in to edit your profile', true);
              isError = true;
              break;
            }
            try {
              const token = localStorage.getItem('token');
              const res = await axios.get(`http://localhost:4000/api/users/${currentUser.username}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              setActiveTopic(null);
              setIsEditingProfile(true);
              setProfileDraft(res.data);
              setActiveProfile(res.data);
              addToHistory(cmd, 'Profile loaded. Use "set [field] [value]" to make changes and "save" to apply.');
            } catch (err) {
              addToHistory(cmd, err.response?.data?.error || 'Failed to load profile', true);
              isError = true;
            }
          } else {
            addToHistory(cmd, 'Usage: edit profile', true);
            isError = true;
          }
          break;
        }
  
        case 'set': {
          if (!isEditingProfile) {
            addToHistory(cmd, 'Profile fields can only be set in edit mode. Use "edit profile" first.', true);
            isError = true;
            break;
          }
          if (!args[0] || args.length < 2) {
            addToHistory(cmd, 'Usage: set [field] [value]', true);
            isError = true;
            break;
          }
          const field = args[0];
          const value = args.slice(1).join(' ');
          if (!editableFields.includes(field)) {
            addToHistory(cmd, `Field "${field}" cannot be edited`, true);
            isError = true;
            break;
          }
          setProfileDraft(prev => {
            const updated = { ...prev, [field]: value };
            setActiveProfile(updated);
            return updated;
          });
          addToHistory(cmd, `Updated ${field}`);
          break;
        }
  
        case 'save': {
          if (!isEditingProfile) {
            addToHistory(cmd, 'Nothing to save. Use "edit profile" first.', true);
            isError = true;
            break;
          }
          try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
              `http://localhost:4000/api/users/${currentUser.username}`,
              { display_name: profileDraft.display_name, bio: profileDraft.bio },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrentUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            addToHistory(cmd, 'Profile updated successfully.');
            setIsEditingProfile(false);
            setProfileDraft(null);
            setActiveProfile(null);
          } catch (err) {
            addToHistory(cmd, err.response?.data?.error || 'Failed to update profile', true);
            isError = true;
          }
          break;
        }

      case 'register':
        addToHistory(cmd, 'Redirecting to registration page...');
        setCurrentUser(null);
            localStorage.removeItem("user"); // ✅ clear persisted login
            localStorage.removeItem("token");
        navigate('/register');
        break;

      case 'login':
        if (!args[0]) {
          addToHistory(cmd, 'Redirecting to login page...');
          setCurrentUser(null);
            localStorage.removeItem("user"); // ✅ clear persisted login
            localStorage.removeItem("token");
          navigate('/login');
            break;
        }
        
        const username = args[0];
        const member = members.find(m => m.username === username);
        if (member) {
          setCurrentUser(member);
           localStorage.setItem("user", JSON.stringify(member)); // ✅ persist
          addToHistory(cmd, `Welcome back, ${username}! You are now logged in.`);
        } else {
          addToHistory(cmd, `User "${username}" not found`, true);
          isError = true;
        }
         break;

        case 'logout':
          if (currentUser) {
            addToHistory(cmd, `Goodbye, ${currentUser.username || currentUser}!`);
            setCurrentUser(null);
            localStorage.removeItem("user"); // ✅ clear persisted login
            localStorage.removeItem("token");
            if (activeTopic) {
              setActiveTopic(null);
            } else if (activeProfile) {
              setActiveProfile(null);
              setIsEditingProfile(false);
              setProfileDraft(null);
            } else if (forumMode) {
              setForumMode(false);
              setForumPosts([]);
              setForumPage(1);
            } else if (isCreatingPost) {
              setIsCreatingPost(false);
              setPostTitle('');
              setPostContent('');
              setPostStep(1);
            } else if (newsMode) {
              setNewsMode(false);
              setNewsPosts([]);
              setNewsPage(1);
              addToHistory(cmd, 'News closed');
            } else if (isCreatingNews) {
              setIsCreatingNews(false);
              setNewsTitle('');
              setNewsContent('');
              setNewsStep(1);
              addToHistory(cmd, 'Article creation cancelled');
            }
          } else {
            addToHistory(cmd, 'You are not logged in', true);
          }
          break;

        case 'admin':
          if (!currentUser || currentUser.role !== 'admin') {
            addToHistory(cmd, 'Admin access only', true);
            isError = true;
          } else {
            addToHistory(cmd, 'Opening admin panel...');
            navigate('/admin');
          }
          break;

        case 'whoami':
          addToHistory(cmd, currentUser ? `Current user: ${currentUser.display_name || currentUser.username}` : 'Not logged in');
          break;

      case 'clear':
        setHistory([]);
        break;

      case 'close':
        if (activeTopic) {
          setActiveTopic(null);
          if (forumMode) {
            addToHistory(cmd, 'Reader closed');
          } else {
            addToHistory(cmd, 'Side pane closed');
          }
        } else if (activeNews) {
          setActiveNews(null);
          addToHistory(cmd, 'Reader closed');
        } else if (activeProfile) {
          setActiveProfile(null);
          setIsEditingProfile(false);
          setProfileDraft(null);
          addToHistory(cmd, 'Side pane closed');
        } else if (forumMode) {
          setForumMode(false);
          setForumPosts([]);
          setForumPage(1);
          addToHistory(cmd, 'Forum closed');
        } else if (newsMode) {
          setNewsMode(false);
          setNewsPosts([]);
          setNewsPage(1);
          addToHistory(cmd, 'News closed');
        } else if (isCreatingPost) {
          setIsCreatingPost(false);
          setPostTitle('');
          setPostContent('');
          setPostStep(1);
          addToHistory(cmd, 'Post creation cancelled');
        } else if (isCreatingNews) {
          setIsCreatingNews(false);
          setNewsTitle('');
          setNewsContent('');
          setNewsStep(1);
          addToHistory(cmd, 'Article creation cancelled');
        } else {
          addToHistory(cmd, 'No pane is currently open');
        }
        break;

      case 'exit':
        addToHistory(cmd, 'Thanks for visiting The Salon! Goodbye.');
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
    const name = currentUser?.username || 'guest';
    return `${name}@terminal-forum:~$ `;
  };

  const paginatedForumPosts = forumPosts.slice((forumPage - 1) * 10, forumPage * 10);
  const forumTotalPages = Math.max(1, Math.ceil(forumPosts.length / 10));
  const paginatedNewsPosts = newsPosts.slice((newsPage - 1) * 10, newsPage * 10);
  const newsTotalPages = Math.max(1, Math.ceil(newsPosts.length / 10));

  const isPaneOpen = Boolean(activeTopic || activeNews || activeProfile || forumMode || newsMode || isCreatingPost || isCreatingNews);

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
      className={`h-screen ${theme.bg} ${theme.primary} font-mono flex flex-row overflow-hidden`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Pane */}
      <div className={`flex flex-col transition-all duration-300 ${isPaneOpen ? 'w-1/2' : 'flex-1'}`}> 
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
      </div>

      {/* Side Pane */}
      {(activeTopic || activeNews || activeProfile || forumMode || newsMode || isCreatingPost || isCreatingNews) && (
        <div className="w-1/2 border-l border-gray-600 flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Side Pane Header */}
          <div className={`${theme.bg} border-b border-gray-600 p-2`}>
            <div className="flex items-center justify-between">
              <div className={`${theme.accent} text-sm font-bold`}>
              {activeTopic
                  ? '┌─[ ARTICLE READER ]─────────────────────────┐'
                  : activeNews
                    ? '┌─[ NEWS ARTICLE ]─────────────────────────┐'
                    : activeProfile
                      ? (isEditingProfile
                          ? '┌─[ EDIT PROFILE ]──────────────────────────┐'
                          : '┌─[ USER PROFILE ]──────────────────────────┐')
                      : isCreatingPost
                        ? '┌─[ NEW POST ]────────────────────────────┐'
                        : isCreatingNews
                          ? '┌─[ NEW ARTICLE ]────────────────────────┐'
                          : newsMode
                            ? '┌─[ NEWS ]──────────────────────────────────┐'
                            : '┌─[ FORUM ]──────────────────────────────────┐'}
              </div>
            </div>
          </div>
          
          {/* Side Pane Content */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-black">
          {activeTopic ? (
              <>
                <div className={`${theme.accent} text-lg mb-2 border-b border-gray-700 pb-2`}>
                  Topic #{activeTopic.id}: {activeTopic.title}
                </div>

                <div className="mb-4 space-y-1">
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Author:</span> {activeTopic.author}
                  </div>
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Posted:</span> {activeTopic.timestamp}
                  </div>
                </div>

                <div className={`${theme.primary} text-sm leading-relaxed`}>
                  <pre className="whitespace-pre-wrap font-mono">
                    {activeTopic.content}
                  </pre>
                </div>
              </>
            ) : activeNews ? (
              <>
                <div className={`${theme.accent} text-lg mb-2 border-b border-gray-700 pb-2`}>
                  News #{activeNews.id}: {activeNews.title}
                </div>

                <div className="mb-4 space-y-1">
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Author:</span> {activeNews.author}
                  </div>
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Posted:</span> {activeNews.timestamp}
                  </div>
                </div>

                <div className={`${theme.primary} text-sm leading-relaxed`}>
                  <pre className="whitespace-pre-wrap font-mono">
                    {activeNews.content}
                  </pre>
                </div>
              </>
            ) : activeProfile ? (
              <>
                <div className={`${theme.accent} text-lg mb-2 border-b border-gray-700 pb-2`}>
                  {activeProfile.display_name || activeProfile.username}
                </div>

                {isEditingProfile && (
                  <div className={`${theme.secondary} text-xs mb-2`}>
                    Editable fields: display_name, bio
                  </div>
                )}

                <div className="mb-4 space-y-1">
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Username:</span> {activeProfile.username}
                  </div>
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Role:</span> {activeProfile.role}
                  </div>
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Status:</span> {activeProfile.status}
                  </div>
                  <div className={`${theme.secondary} text-sm`}>
                    <span className={theme.accent}>Joined:</span> {new Date(activeProfile.join_date).toLocaleString()}
                  </div>
                  {activeProfile.last_login && (
                    <div className={`${theme.secondary} text-sm`}>
                      <span className={theme.accent}>Last Login:</span> {new Date(activeProfile.last_login).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className={`${theme.primary} text-sm leading-relaxed`}>
                  <pre className="whitespace-pre-wrap font-mono">
                    {activeProfile.bio || 'No bio available.'}
                  </pre>
                </div>
              </>
              ) : isCreatingPost ? (
                <>
                  {postStep === 1 ? (
                    <input
                      ref={postTitleRef}
                      type="text"
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && postTitle.trim()) {
                          e.preventDefault();
                          setPostStep(2);
                        }
                      }}
                      placeholder="Enter your post title..."
                      className={`w-full bg-transparent border border-gray-700 p-2 text-sm outline-none ${theme.primary}`}
                    />
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className={`${theme.accent} text-lg mb-2 border-b border-gray-700 pb-2`}>{postTitle}</div>
                      <textarea
                        ref={postContentRef}
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                        onKeyDown={async e => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            await submitPost();
                          }
                        }}
                        placeholder="Start writing your post..."
                        className={`flex-1 bg-transparent border border-gray-700 p-2 text-sm outline-none resize-none ${theme.primary}`}
                      />
                    </div>
                  )}
                </>
              ) : isCreatingNews ? (
                <>
                  {newsStep === 1 ? (
                    <input
                      ref={newsTitleRef}
                      type="text"
                      value={newsTitle}
                      onChange={e => setNewsTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newsTitle.trim()) {
                          e.preventDefault();
                          setNewsStep(2);
                        }
                      }}
                      placeholder="Enter your article title..."
                      className={`w-full bg-transparent border border-gray-700 p-2 text-sm outline-none ${theme.primary}`}
                    />
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className={`${theme.accent} text-lg mb-2 border-b border-gray-700 pb-2`}>{newsTitle}</div>
                      <textarea
                        ref={newsContentRef}
                        value={newsContent}
                        onChange={e => setNewsContent(e.target.value)}
                        onKeyDown={async e => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            await submitNews();
                          }
                        }}
                        placeholder="Start writing your article..."
                        className={`flex-1 bg-transparent border border-gray-700 p-2 text-sm outline-none resize-none ${theme.primary}`}
                      />
                    </div>
                  )}
                </>
              ) : forumMode ? (
                <>
                  <div className={`${theme.secondary} text-xs mb-2`}>
                    Page {forumPage} of {forumTotalPages}
                  </div>
                  <div className={`grid grid-cols-[40px_auto_100px_150px] gap-2 text-sm ${theme.accent} border-b border-gray-700 pb-1`}>
                    <div>ID</div>
                    <div>Title</div>
                    <div>Author</div>
                    <div>Date</div>
                  </div>
                  {paginatedForumPosts.length > 0 ? (
                    paginatedForumPosts.map(post => (
                      <div key={post.id} className={`grid grid-cols-[40px_auto_100px_150px] gap-2 text-sm border-b border-gray-700 py-1`}>
                        <div className={theme.secondary}>{post.id}</div>
                        <div className={`${theme.primary} truncate`}>{post.title}</div>
                        <div className={`${theme.secondary} truncate`}>{post.author}</div>
                        <div className={theme.secondary}>{post.timestamp}</div>
                      </div>
                    ))
                  ) : (
                    <div className={`${theme.secondary} text-sm mt-2`}>No posts found.</div>
                  )}
                </>
              ) : newsMode ? (
                <>
                  <div className={`${theme.secondary} text-xs mb-2`}>
                    Page {newsPage} of {newsTotalPages}
                  </div>
                  <div className={`grid grid-cols-[40px_auto_100px_150px] gap-2 text-sm ${theme.accent} border-b border-gray-700 pb-1`}>
                    <div>ID</div>
                    <div>Title</div>
                    <div>Author</div>
                    <div>Date</div>
                  </div>
                  {paginatedNewsPosts.length > 0 ? (
                    paginatedNewsPosts.map(post => (
                      <div key={post.id} className={`grid grid-cols-[40px_auto_100px_150px] gap-2 text-sm border-b border-gray-700 py-1`}>
                        <div className={theme.secondary}>{post.id}</div>
                        <div className={`${theme.primary} truncate`}>{post.title}</div>
                        <div className={`${theme.secondary} truncate`}>{post.author}</div>
                        <div className={theme.secondary}>{post.timestamp}</div>
                      </div>
                    ))
                  ) : (
                    <div className={`${theme.secondary} text-sm mt-2`}>No articles found.</div>
                  )}
                </>
              ) : null}
          </div>
          
          {/* Side Pane Footer */}
          <div className={`${theme.bg} border-t border-gray-600 p-2`}>
            <div className={`${theme.secondary} text-xs text-center`}>
            {activeTopic
                ? 'Type "close" to close reader pane'
                : activeNews
                  ? 'Type "close" to close reader pane'
                  : activeProfile
                    ? (isEditingProfile ? 'Type "save" to save changes or "close" to cancel' : 'Type "close" to close profile pane')
                    : isCreatingPost
                      ? 'Press Ctrl+Enter to submit or type "close" to cancel'
                      : isCreatingNews
                        ? 'Press Ctrl+Enter to submit or type "close" to cancel'
                        : forumMode
                          ? 'Use "search <text>" to filter or "page <n>" to navigate. Type "close" to exit forum'
                          : newsMode
                            ? 'Use "page <n>" to navigate. Type "close" to exit news'
                            : ''}
            </div>
            <div className={`${theme.accent} text-sm text-center`}>
              └───────────────────────────────────────────┘
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalForum;