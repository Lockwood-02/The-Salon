import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    display_name: "",
  });
  const [messages, setMessages] = useState([]);
  const [currentField, setCurrentField] = useState("username");
  const [inputValue, setInputValue] = useState("");
  const [bootText, setBootText] = useState('');
  const [bootComplete, setBootComplete] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [exitPrompt, setExitPrompt] = useState(false);


  const theme = {
    bg: "bg-black",
    primary: "text-green-400",
    accent: "text-green-500",
    error: "text-red-400",
    cursor: "bg-green-400",
  };

  const prompts = {
    username: "Enter a username",
    display_name: "Enter a display name",
    email: "Enter your email",
    password: "Enter a password",
  };

  useEffect(() => {
    if (currentField) {
      inputRef.current?.focus();
    }
  }, [currentField]);

  useEffect(() => {
    let i = 0;
    let isCancelled = false;
    const timers = [];

    const lines = [
      'Initializing registration system...',
      'Patching user gateway...',
      'System ready.',
      '',
      '██████╗ ███████╗ ██████╗ ██╗███████╗████████╗███████╗██████╗', 
      '██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗',
      '██████╔╝█████╗  ██║  ███╗██║███████╗   ██║   █████╗  ██████╔╝',
      '██╔══██╗██╔══╝  ██║   ██║██║╚════██║   ██║   ██╔══╝  ██╔══██╗',
      '██║  ██║███████╗╚██████╔╝██║███████║   ██║   ███████╗██║  ██║',
      '╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝',
      ''
    ];

    const typeLine = () => {
    if (isCancelled) return;

    if (i < lines.length - 1) { // mirror TerminalForum's boundary
      setBootText(prev => prev + lines[i] + '\n');
      i++;
      const t = setTimeout(typeLine, i < 3 ? 200 : 150); // whatever cadence you like
      timers.push(t);
    } else {
      const t = setTimeout(() => {
        if (isCancelled) return;
        setBootComplete(true);
        inputRef.current?.focus();
      }, 500);
      timers.push(t);
    }
  };

  typeLine();

  return () => {
    isCancelled = true;
    timers.forEach(clearTimeout);
  };
  }, []);

  const handleKeyDown = async (e) => {
    // ESCAPE initiates exit confirmation
    if (e.key === "Escape" && !exitPrompt && currentField) {
      setExitPrompt(true);
      setMessages((prev) => [
        ...prev,
        { prompt: "", value: "Are you sure you want to return to the home page? (y/n)" },
      ]);
      return;
    }

    // Exit confirmation handling
    if (exitPrompt) {
      if (e.key.toLowerCase() === "y") {
        navigate("/");
      } else if (e.key.toLowerCase() === "n") {
        setExitPrompt(false);
      }
      return;
    }

    if (e.key === "Enter" && inputValue.trim() !== "") {
      const nextFieldOrder = ["username", "display_name", "email", "password"];
      const nextIndex = nextFieldOrder.indexOf(currentField) + 1;

      setForm((prev) => ({ ...prev, [currentField]: inputValue.trim() }));
      setMessages((prev) => [
        ...prev,
        { prompt: prompts[currentField], value: inputValue.trim() },
      ]);
      setInputValue("");

      if (nextIndex < nextFieldOrder.length) {
        setCurrentField(nextFieldOrder[nextIndex]);
      } else {
        try {
          const res = await axios.post("http://localhost:4000/api/auth/register", {
            ...form,
            [currentField]: inputValue.trim(),
          });
          setMessages((prev) => [
            ...prev,
            { prompt: "Creating account...", value: "" },
            { prompt: "Success", value: `Welcome ${res.data.display_name || res.data.username}!` },
          ]);
          setCurrentField(null);
          setExitPrompt(false);
          setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            { prompt: "Error", value: err.response?.data?.error || err.message, isError: true },
          ]);

          // Reset form and go back to username input
          setCurrentField("username");
          setForm({ username: "", display_name: "", email: "", password: "" });
          setInputValue("");
          setExitPrompt(false);
        }
      }
    }
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
      className={`h-screen ${theme.bg} ${theme.primary} font-mono p-4`}
      onClick={() => currentField && inputRef.current?.focus()}
    >
      <pre className="whitespace-pre-wrap text-sm leading-tight font-mono mb-4">
        {bootText}
      </pre>

      {messages.map((msg, i) => (
        <div key={i} className="mb-2">
          <div className={theme.accent}>{`> ${msg.prompt}`}</div>
          <div className={msg.isError ? theme.error : theme.primary}>{msg.value}</div>
        </div>
      ))}

      {currentField && (
        <div className="flex items-center">
          <span className={theme.accent}>{`> ${prompts[currentField]}: `}</span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`bg-transparent border-none outline-none ${theme.primary} flex-1 font-mono`}
            autoFocus
            spellCheck={false}
          />
          <div className={`w-2 h-4 ${theme.cursor} animate-pulse ml-1`} />
        </div>
      )}
    </div>
  );
}
