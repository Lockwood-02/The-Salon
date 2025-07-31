import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [messages, setMessages] = useState([]);
  const [currentField, setCurrentField] = useState("username");
  const [inputValue, setInputValue] = useState("");
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
    username: "Enter your username",
    password: "Enter your password",
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentField]);

  const handleKeyDown = async (e) => {
    // ESCAPE initiates exit confirmation
    if (e.key === "Escape") {
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
      const nextField = currentField === "username" ? "password" : null;

      setForm((prev) => ({ ...prev, [currentField]: inputValue.trim() }));
      setMessages((prev) => [
        ...prev,
        { prompt: prompts[currentField], value: inputValue.trim() },
      ]);
      setInputValue("");

      if (nextField) {
        setCurrentField(nextField);
      } else {
        try {
          const res = await axios.post("http://localhost:4000/api/auth/login", {
            ...form,
            [currentField]: inputValue.trim(),
          });

          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          setMessages((prev) => [
            ...prev,
            { prompt: "Authenticating...", value: "" },
            {
              prompt: "Login successful",
              value: `Welcome back, ${res.data.user.display_name || res.data.user.username}!`,
            },
          ]);
          setTimeout(() => navigate("/"), 2000);
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            {
              prompt: "Error",
              value: err.response?.data?.error || "Login failed",
              isError: true,
            },
          ]);
        
          // Reset form and go back to username input
          setCurrentField("username");
          setForm({ username: "", password: "" });
          setInputValue("");
        }
      }
    }
  };

  return (
    <div
      className={`h-screen ${theme.bg} ${theme.primary} font-mono p-6`}
      onClick={() => inputRef.current?.focus()}
    >
      <pre className="text-lg mb-4">{`*** LOGIN TO THE SALON ***\n`}</pre>

      {messages.map((msg, i) => (
        <div key={i} className="mb-2">
          <div className={theme.accent}>
            {`> ${msg.prompt}`}
          </div>
          <div className={msg.isError ? theme.error : theme.primary}>
            {msg.value}
          </div>
        </div>
      ))}

      {currentField && (
        <div className="flex items-center">
          <span className={theme.accent}>{`> ${prompts[currentField]}: `}</span>
          <input
            ref={inputRef}
            type={currentField === "password" ? "password" : "text"}
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
