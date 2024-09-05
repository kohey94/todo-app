import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TodoApp from "./pages/TodoApp";
import Auth from "./pages/Auth";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState("");

  // 画面更新してもユーザー名を取得して表示する
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');

    if (token && savedUsername) {
      setLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (username) => {
    localStorage.setItem('username', username);
    setUsername(username);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername("");
    setLoggedIn(false);
  };
  
  const handleRegister = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setUsername(username);
    setLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {/* ログイン済みの場合 */}
        {loggedIn ? (
          <>
            <Route path="/" element={<TodoApp username={username} onLogout={handleLogout} />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Auth onLogin={handleLogin} onRegister={handleRegister} />} />
            <Route path="/login" element={<Auth onLogin={handleLogin} onRegister={handleRegister} />} />
            <Route path="/register" element={<Auth onLogin={handleLogin} onRegister={handleRegister} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
