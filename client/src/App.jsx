import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TerminalForum from './TerminalForum';
import Register from './Register';  // make sure these are imported correctly
import Login from './Login';
import AdminPage from './AdminPage';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<TerminalForum />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    );
  }

export default App;
