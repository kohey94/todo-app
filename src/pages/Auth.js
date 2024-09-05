import React from 'react';
import LoginForm from '../components/LoginForm';
import Register from '../components/Register';

function Auth({ onLogin, onRegister }) {
  return (
    <div className="auth-container">
      <LoginForm onLogin={onLogin} />
      <Register onRegister={onRegister} />
    </div>
  );
}

export default Auth;
